
from __future__ import annotations

import argparse
import random
from pathlib import Path
from collections import Counter

import torch
from PIL import Image
from torch import nn
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms

from app.model import (
    IMAGE_SIZE,
    IMAGENET_MEAN,
    IMAGENET_STD,
    SkinImageClassifier,
)

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
SEED = 42


class FolderDataset(Dataset):
    def __init__(
        self,
        root: Path,
        class_names: list[str],
        transform=None,
    ) -> None:
        self.samples: list[tuple[Path, int]] = []
        self.class_names = class_names
        self.transform = transform

        for label, class_name in enumerate(class_names):
            folder = root / class_name

            if not folder.is_dir():
                raise FileNotFoundError(
                    f"Missing class folder: {folder}"
                )

            for path in sorted(folder.rglob("*")):
                if (
                    path.is_file()
                    and path.suffix.lower() in IMAGE_EXTENSIONS
                ):
                    self.samples.append((path, label))

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, index: int):
        path, label = self.samples[index]

        try:
            with Image.open(path) as image:
                image = image.convert("RGB")
                if self.transform:
                    image = self.transform(image)
        except Exception as error:
            raise RuntimeError(
                f"Could not load image: {path}"
            ) from error

        return image, label


def get_transforms():
    train_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=10),
        transforms.ColorJitter(
            brightness=0.12,
            contrast=0.12,
            saturation=0.08,
            hue=0.02,
        ),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])

    evaluation_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])

    return train_transform, evaluation_transform


def calculate_metrics(confusion: torch.Tensor):
    true_positive = confusion.diag().float()
    actual = confusion.sum(dim=1).float()
    predicted = confusion.sum(dim=0).float()

    precision = true_positive / predicted.clamp_min(1)
    recall = true_positive / actual.clamp_min(1)

    f1 = (
        2 * precision * recall
        / (precision + recall).clamp_min(1e-12)
    )

    total = confusion.sum().clamp_min(1)
    accuracy = true_positive.sum() / total

    return {
        "accuracy": accuracy.item(),
        "macro_precision": precision.mean().item(),
        "macro_recall": recall.mean().item(),
        "macro_f1": f1.mean().item(),
    }


def evaluate(model, loader, loss_fn, device, class_count):
    model.eval()

    total_loss = 0.0
    total = 0

    confusion = torch.zeros(
        (class_count, class_count),
        dtype=torch.int64,
    )

    with torch.inference_mode():
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            loss = loss_fn(outputs, labels)

            predictions = outputs.argmax(dim=1)

            total_loss += loss.item() * len(labels)
            total += len(labels)

            batch_counts = torch.bincount(
                labels.cpu() * class_count + predictions.cpu(),
                minlength=class_count * class_count,
            ).reshape(class_count, class_count)

            confusion += batch_counts

    if total == 0:
        raise ValueError("Evaluation dataset is empty.")

    metrics = calculate_metrics(confusion)

    return total_loss / total, metrics, confusion


def train(
    data_dir: Path,
    output: Path,
    epochs: int,
    batch_size: int,
    patience: int,
    pretrained: bool,
):
    random.seed(SEED)
    torch.manual_seed(SEED)

    train_dir = data_dir / "train"
    val_dir = data_dir / "val"
    test_dir = data_dir / "test"

    for folder in (train_dir, val_dir, test_dir):
        if not folder.is_dir():
            raise FileNotFoundError(
                f"Required dataset folder missing: {folder}"
            )

    class_names = sorted(
        path.name for path in train_dir.iterdir() if path.is_dir()
    )

    if len(class_names) < 2:
        raise ValueError("At least two classes are required.")

    train_transform, eval_transform = get_transforms()

    train_dataset = FolderDataset(
        train_dir, class_names, train_transform
    )
    val_dataset = FolderDataset(
        val_dir, class_names, eval_transform
    )
    test_dataset = FolderDataset(
        test_dir, class_names, eval_transform
    )

    if not train_dataset or not val_dataset or not test_dataset:
        raise ValueError(
            "Train, validation, and test datasets must contain images."
        )

    class_counts = Counter(
        label for _, label in train_dataset.samples
    )

    for index, class_name in enumerate(class_names):
        if class_counts[index] == 0:
            raise ValueError(
                f"No training images for {class_name}."
            )

    print("Classes:", class_names)
    print("Training images:", len(train_dataset))
    print("Validation images:", len(val_dataset))
    print("Test images:", len(test_dataset))

    print("\nTraining class distribution:")
    for index, class_name in enumerate(class_names):
        print(f"{class_name}: {class_counts[index]}")

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )
    print("\nTraining device:", device)

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=0,
        pin_memory=device.type == "cuda",
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=0,
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=0,
    )

    model = SkinImageClassifier(
        class_count=len(class_names),
        pretrained=pretrained,
    )

    # Freeze early ResNet layers.
    for parameter in model.backbone.parameters():
        parameter.requires_grad = False

    # Fine-tune the last ResNet block and classification head.
    for parameter in model.backbone.layer4.parameters():
        parameter.requires_grad = True

    for parameter in model.backbone.fc.parameters():
        parameter.requires_grad = True

    model = model.to(device)

    # Class-weighted loss to help underrepresented classes.
    counts = torch.tensor(
        [class_counts[i] for i in range(len(class_names))],
        dtype=torch.float32,
    )

    class_weights = (
        len(train_dataset)
        / (len(class_names) * counts)
    )

    class_weights = class_weights / class_weights.mean()

    loss_fn = nn.CrossEntropyLoss(
        weight=class_weights.to(device)
    )

    optimizer = torch.optim.AdamW(
        [
            {
                "params": model.backbone.layer4.parameters(),
                "lr": 0.0001,
            },
            {
                "params": model.backbone.fc.parameters(),
                "lr": 0.0005,
            },
        ],
        weight_decay=0.0001,
    )

    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer,
        mode="min",
        factor=0.5,
        patience=2,
    )

    best_val_loss = float("inf")
    best_epoch = 0
    epochs_without_improvement = 0

    output.parent.mkdir(parents=True, exist_ok=True)

    print("\nStarting ResNet18 transfer learning...")

    for epoch in range(epochs):
        model.train()

        # Keep batch-normalization statistics stable on this small dataset.
        for module in model.modules():
            if isinstance(module, nn.BatchNorm2d):
                module.eval()

        total_loss = 0.0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad(set_to_none=True)

            outputs = model(images)
            loss = loss_fn(outputs, labels)

            loss.backward()

            nn.utils.clip_grad_norm_(
                model.parameters(),
                max_norm=1.0,
            )

            optimizer.step()

            predictions = outputs.argmax(dim=1)

            total_loss += loss.item() * len(labels)
            correct += (predictions == labels).sum().item()
            total += len(labels)

        train_loss = total_loss / total
        train_accuracy = correct / total

        val_loss, val_metrics, _ = evaluate(
            model,
            val_loader,
            loss_fn,
            device,
            len(class_names),
        )

        scheduler.step(val_loss)

        print(
            f"\nEpoch {epoch + 1}/{epochs} | "
            f"Train Loss: {train_loss:.4f} | "
            f"Train Accuracy: {train_accuracy * 100:.2f}% | "
            f"Val Loss: {val_loss:.4f} | "
            f"Val Accuracy: {val_metrics['accuracy'] * 100:.2f}% | "
            f"Val Macro F1: {val_metrics['macro_f1'] * 100:.2f}%"
        )

        if val_loss < best_val_loss - 0.0001:
            best_val_loss = val_loss
            best_epoch = epoch + 1
            epochs_without_improvement = 0

            torch.save(
                {
                    "architecture": "resnet18",
                    "state_dict": model.state_dict(),
                    "class_names": class_names,
                    "image_size": IMAGE_SIZE,
                    "best_val_loss": best_val_loss,
                },
                output,
            )

            print("Best model checkpoint saved.")
        else:
            epochs_without_improvement += 1

        if epochs_without_improvement >= patience:
            print("\nEarly stopping triggered.")
            break

    if best_epoch == 0:
        raise RuntimeError("Training did not produce a valid checkpoint.")

    print(f"\nBest epoch: {best_epoch}")
    print(f"Best validation loss: {best_val_loss:.4f}")

    # Evaluate the best saved checkpoint on the untouched test set.
    checkpoint = torch.load(
        output,
        map_location="cpu",
        weights_only=True,
    )

    model.load_state_dict(checkpoint["state_dict"])
    model.to(device)

    test_loss, test_metrics, confusion = evaluate(
        model,
        test_loader,
        loss_fn,
        device,
        len(class_names),
    )

    print("\nFINAL TEST RESULTS")
    print(f"Test Loss: {test_loss:.4f}")
    print(f"Test Accuracy: {test_metrics['accuracy'] * 100:.2f}%")
    print(
        f"Macro Precision: "
        f"{test_metrics['macro_precision'] * 100:.2f}%"
    )
    print(
        f"Macro Recall: "
        f"{test_metrics['macro_recall'] * 100:.2f}%"
    )
    print(
        f"Macro F1 Score: "
        f"{test_metrics['macro_f1'] * 100:.2f}%"
    )

    print("\nConfusion Matrix")
    print("Class order:", class_names)
    print(confusion.tolist())

    print("\nSaved ResNet18 model to:", output)


def main():
    parser = argparse.ArgumentParser(
        description="Train the DermaCare ResNet18 skin classifier."
    )

    parser.add_argument(
        "--data",
        type=Path,
        default=Path("data/skin_dataset_clean"),
    )

    parser.add_argument(
        "--output",
        type=Path,
        default=Path("models/skin_classifier_resnet18.pt"),
    )

    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--patience", type=int, default=5)

    parser.add_argument(
        "--pretrained",
        action=argparse.BooleanOptionalAction,
        default=True,
    )

    args = parser.parse_args()

    if args.epochs < 1 or args.batch_size < 1 or args.patience < 1:
        parser.error("Epochs, batch size, and patience must be positive.")

    train(
        data_dir=args.data,
        output=args.output,
        epochs=args.epochs,
        batch_size=args.batch_size,
        patience=args.patience,
        pretrained=args.pretrained,
    )


if __name__ == "__main__":
    main()
