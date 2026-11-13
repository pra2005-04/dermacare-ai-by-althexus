
from __future__ import annotations

import os
from pathlib import Path

import torch
from torch import nn
from torchvision.models import ResNet18_Weights, resnet18

IMAGE_SIZE = 224

IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)


class SkinImageClassifier(nn.Module):
    """ResNet18-based skin image classifier."""

    def __init__(self, class_count: int, pretrained: bool = False) -> None:
        super().__init__()

        weights = ResNet18_Weights.DEFAULT if pretrained else None
        self.backbone = resnet18(weights=weights)

        input_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Linear(input_features, class_count)

    def forward(self, image: torch.Tensor) -> torch.Tensor:
        return self.backbone(image)


class LegacySkinImageClassifier(nn.Module):
    """Supports loading the previous CNN checkpoint."""

    def __init__(self, class_count: int) -> None:
        super().__init__()

        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((1, 1)),
        )

        self.classifier = nn.Linear(128, class_count)

    def forward(self, image: torch.Tensor) -> torch.Tensor:
        return self.classifier(self.features(image).flatten(1))


class ModelRunner:
    def __init__(self) -> None:
        configured_path = os.getenv("MODEL_PATH")

        if configured_path:
            self.model_path = Path(configured_path)
        else:
            candidates = [
                Path("models/skin_classifier_resnet18.pt"),
                Path("models/skin_classifier.pt"),
            ]

            self.model_path = next(
                (path for path in candidates if path.is_file()),
                candidates[0],
            )

        self.model: nn.Module | None = None
        self.class_names: list[str] = []
        self.architecture: str | None = None

        if self.model_path.is_file():
            checkpoint = torch.load(
                self.model_path,
                map_location="cpu",
                weights_only=True,
            )

            class_names = checkpoint.get("class_names")

            if (
                not isinstance(class_names, list)
                or not class_names
                or not all(isinstance(name, str) for name in class_names)
            ):
                raise ValueError(
                    "Checkpoint must contain valid class names."
                )

            architecture = checkpoint.get("architecture", "legacy_cnn")

            if architecture == "resnet18":
                model = SkinImageClassifier(
                    class_count=len(class_names),
                    pretrained=False,
                )
            elif architecture == "legacy_cnn":
                model = LegacySkinImageClassifier(len(class_names))
            else:
                raise ValueError(
                    f"Unsupported model architecture: {architecture}"
                )

            model.load_state_dict(checkpoint["state_dict"])
            model.eval()

            self.model = model
            self.class_names = class_names
            self.architecture = architecture

    def predict(
        self,
        image_tensor: torch.Tensor,
    ) -> dict[str, object] | None:

        if self.model is None:
            return None

        input_tensor = image_tensor

        # Normalize only for the ResNet18 model.
        if self.architecture == "resnet18":
            mean = torch.tensor(
                IMAGENET_MEAN,
                dtype=input_tensor.dtype,
                device=input_tensor.device,
            ).view(3, 1, 1)

            std = torch.tensor(
                IMAGENET_STD,
                dtype=input_tensor.dtype,
                device=input_tensor.device,
            ).view(3, 1, 1)

            input_tensor = (input_tensor - mean) / std

        with torch.inference_mode():
            probabilities = torch.softmax(
                self.model(input_tensor.unsqueeze(0)),
                dim=1,
            )[0]

        scores, indices = torch.topk(
            probabilities,
            min(3, len(self.class_names)),
        )

        return {
            "status": "available",
            "predictions": [
                {
                    "label": self.class_names[index],
                    "score": round(float(score), 4),
                }
                for score, index in zip(
                    scores.tolist(),
                    indices.tolist(),
                )
            ],
        }
