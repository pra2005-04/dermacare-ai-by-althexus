
from pathlib import Path
from collections import defaultdict
import hashlib
import random
import shutil

SOURCE = Path("data/skin_dataset")
DEST = Path("data/skin_dataset_clean")

EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
SEED = 42


def image_hash(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(f"Dataset not found: {SOURCE}")

    if DEST.exists():
        raise FileExistsError(
            f"{DEST} already exists. Choose a new output folder."
        )

    class_dirs = sorted(
        p for p in (SOURCE / "train").iterdir() if p.is_dir()
    )

    if not class_dirs:
        raise ValueError("No class folders found.")

    classes = [p.name for p in class_dirs]
    records = {}
    conflicts = set()

    # Read images from train and validation folders.
    for split in ("train", "val"):
        for class_name in classes:
            folder = SOURCE / split / class_name

            if not folder.is_dir():
                raise FileNotFoundError(f"Missing folder: {folder}")

            for path in folder.rglob("*"):
                if not path.is_file():
                    continue

                if path.suffix.lower() not in EXTENSIONS:
                    continue

                digest = image_hash(path)

                if digest in records:
                    previous_class, _ = records[digest]

                    if previous_class != class_name:
                        conflicts.add(digest)
                else:
                    records[digest] = (class_name, path)

    if conflicts:
        raise ValueError(
            f"{len(conflicts)} identical images have conflicting labels."
        )

    by_class = defaultdict(list)

    for class_name, path in records.values():
        by_class[class_name].append(path)

    rng = random.Random(SEED)
    totals = defaultdict(int)

    for class_name in classes:
        images = by_class[class_name]
        rng.shuffle(images)

        count = len(images)

        if count < 5:
            raise ValueError(
                f"Not enough unique images for {class_name}: {count}"
            )

        train_end = int(count * 0.70)
        val_end = train_end + int(count * 0.15)

        splits = {
            "train": images[:train_end],
            "val": images[train_end:val_end],
            "test": images[val_end:]
        }

        for split, paths in splits.items():
            output_dir = DEST / split / class_name
            output_dir.mkdir(parents=True, exist_ok=True)

            for path in paths:
                digest = image_hash(path)[:12]
                filename = f"{image_hash(path)[:32]}{path.suffix.lower()}"
                shutil.copy2(path, output_dir / filename)

            totals[split] += len(paths)
            print(f"{split:5} | {class_name:15} | {len(paths)} images")

    print("\nDataset preparation completed.")
    print("Unique images:", len(records))
    print("Train:", totals["train"])
    print("Validation:", totals["val"])
    print("Test:", totals["test"])
    print("Output:", DEST)


if __name__ == "__main__":
    main()
