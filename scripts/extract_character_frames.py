from pathlib import Path
import argparse

import cv2


def evenly_spaced_indices(
    frame_count: int,
    output_count: int,
    start_index: int = 0,
    end_index: int | None = None,
) -> list[int]:
    if frame_count < output_count:
        raise ValueError("video has fewer frames than requested outputs")
    end_index = frame_count - 1 if end_index is None else end_index
    return [
        round(start_index + index * (end_index - start_index) / (output_count - 1))
        for index in range(output_count)
    ]


def directional_motion_indices(
    frame_count: int,
    output_count: int = 64,
    start_ratio: float = 0.08,
    end_ratio: float = 0.88,
) -> list[int]:
    """Sample the source's genuine up/right/down/left motion."""
    if output_count < 8 or output_count % 4:
        raise ValueError("output count must be a multiple of four and at least eight")
    last_index = frame_count - 1
    start_index = round(last_index * start_ratio)
    end_index = round(last_index * end_ratio)
    left_output_index = output_count * 3 // 4
    left_index = round(
        start_index
        + left_output_index * (end_index - start_index) / (output_count - 1)
    )
    return evenly_spaced_indices(
        frame_count, left_output_index + 1, start_index, left_index
    )


def circular_motion_indices(
    frame_count: int,
    output_count: int = 64,
    anchor_ratios: tuple[float, float, float, float, float] = (
        0.075, 0.267, 0.529, 0.729, 0.863
    ),
) -> list[int]:
    """Sample real up/right/down/left/up anchors from a circular Flow render."""
    if output_count < 8 or output_count % 4:
        raise ValueError("output count must be a multiple of four and at least eight")
    if len(anchor_ratios) != 5:
        raise ValueError("five anchor ratios are required")
    last_index = frame_count - 1
    anchors = [round(last_index * ratio) for ratio in anchor_ratios]
    quarter = output_count // 4
    indices = evenly_spaced_indices(frame_count, quarter + 1, anchors[0], anchors[1])
    for segment in range(1, 3):
        indices.extend(
            evenly_spaced_indices(
                frame_count, quarter + 1, anchors[segment], anchors[segment + 1]
            )[1:]
        )
    indices.extend(
        evenly_spaced_indices(
            frame_count, quarter, anchors[3], anchors[4]
        )[1:]
    )
    return indices


def extract(
    source: Path,
    destination: Path,
    output_count: int = 64,
    anchor_ratios: tuple[float, float, float, float, float] = (
        0.075, 0.267, 0.529, 0.729, 0.863
    ),
) -> None:
    capture = cv2.VideoCapture(str(source))
    if not capture.isOpened():
        raise RuntimeError(f"unable to open {source}")

    frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = capture.get(cv2.CAP_PROP_FPS)
    width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
    if frame_count <= 0 or fps <= 0 or width <= 0 or height <= 0:
        raise RuntimeError("video metadata is incomplete")

    destination.mkdir(parents=True, exist_ok=True)
    source_indices = circular_motion_indices(
        frame_count, output_count, anchor_ratios
    )
    for output_index, source_index in enumerate(source_indices):
        capture.set(cv2.CAP_PROP_POS_FRAMES, source_index)
        ok, frame = capture.read()
        if not ok:
            raise RuntimeError(f"unable to read source frame {source_index}")
        output = destination / f"frame-{output_index:02d}.webp"
        if not cv2.imwrite(str(output), frame, [cv2.IMWRITE_WEBP_QUALITY, 88]):
            raise RuntimeError(f"unable to write {output}")

    capture.set(cv2.CAP_PROP_POS_FRAMES, frame_count - 1)
    ok, center = capture.read()
    capture.release()
    center_path = destination / "center.webp"
    if not ok or not cv2.imwrite(
        str(center_path), center, [cv2.IMWRITE_WEBP_QUALITY, 92]
    ):
        raise RuntimeError("unable to write center.webp")

    print(f"{width}x{height} | {fps:.3f} fps | {frame_count} frames")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--count", type=int, default=64)
    args = parser.parse_args()
    extract(args.source, args.destination, args.count)
