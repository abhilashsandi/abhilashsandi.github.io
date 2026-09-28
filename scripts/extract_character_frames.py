from pathlib import Path
import argparse

import cv2
import numpy as np


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


def morph_frame(start, end, forward_flow, backward_flow, alpha: float):
    height, width = start.shape[:2]
    grid_x, grid_y = np.meshgrid(
        np.arange(width, dtype=np.float32), np.arange(height, dtype=np.float32)
    )
    start_warp = cv2.remap(
        start,
        grid_x - forward_flow[..., 0] * alpha,
        grid_y - forward_flow[..., 1] * alpha,
        cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_REFLECT,
    )
    end_warp = cv2.remap(
        end,
        grid_x - backward_flow[..., 0] * (1 - alpha),
        grid_y - backward_flow[..., 1] * (1 - alpha),
        cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_REFLECT,
    )
    # Keep one opaque source face per frame; switching between aligned warps at
    # the midpoint avoids the doubled facial features of a dissolve.
    return start_warp if alpha < 0.5 else end_warp


def extract(
    source: Path,
    destination: Path,
    output_count: int = 64,
    start_ratio: float = 0.08,
    end_ratio: float = 0.88,
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
    directional_indices = directional_motion_indices(
        frame_count, output_count, start_ratio, end_ratio
    )
    directional_frames = []
    for output_index, source_index in enumerate(directional_indices):
        capture.set(cv2.CAP_PROP_POS_FRAMES, source_index)
        ok, frame = capture.read()
        if not ok:
            raise RuntimeError(f"unable to read source frame {source_index}")
        output = destination / f"frame-{output_index:02d}.webp"
        if not cv2.imwrite(str(output), frame, [cv2.IMWRITE_WEBP_QUALITY, 88]):
            raise RuntimeError(f"unable to write {output}")
        directional_frames.append(frame)

    # Flow returns to center after looking left. Motion-warp left directly back
    # to up so the upper-left quadrant stays directional without double exposure.
    closing_count = output_count - len(directional_frames)
    left_frame = directional_frames[-1]
    up_frame = directional_frames[0]
    left_gray = cv2.cvtColor(left_frame, cv2.COLOR_BGR2GRAY)
    up_gray = cv2.cvtColor(up_frame, cv2.COLOR_BGR2GRAY)
    flow_options = dict(
        pyr_scale=0.5, levels=5, winsize=41, iterations=5,
        poly_n=7, poly_sigma=1.5, flags=cv2.OPTFLOW_FARNEBACK_GAUSSIAN,
    )
    forward_flow = cv2.calcOpticalFlowFarneback(
        left_gray, up_gray, None, **flow_options
    )
    backward_flow = cv2.calcOpticalFlowFarneback(
        up_gray, left_gray, None, **flow_options
    )
    for closing_index in range(1, closing_count + 1):
        alpha = closing_index / closing_count
        frame = morph_frame(
            left_frame, up_frame, forward_flow, backward_flow, alpha
        )
        output_index = len(directional_frames) + closing_index - 1
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
    parser.add_argument("--start-ratio", type=float, default=0.08)
    parser.add_argument("--end-ratio", type=float, default=0.88)
    args = parser.parse_args()
    extract(
        args.source,
        args.destination,
        args.count,
        args.start_ratio,
        args.end_ratio,
    )
