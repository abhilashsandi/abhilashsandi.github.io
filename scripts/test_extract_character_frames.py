import unittest

from scripts.extract_character_frames import (
    circular_motion_indices,
    directional_motion_indices,
    evenly_spaced_indices,
)


class EvenlySpacedIndicesTest(unittest.TestCase):
    def test_spans_first_and_last_source_frames(self):
        self.assertEqual(evenly_spaced_indices(10, 4), [0, 3, 6, 9])

    def test_rejects_more_outputs_than_source_frames(self):
        with self.assertRaisesRegex(ValueError, "fewer frames"):
            evenly_spaced_indices(3, 4)

    def test_samples_only_the_directional_motion_interval(self):
        self.assertEqual(evenly_spaced_indices(10, 4, 2, 8), [2, 4, 6, 8])

    def test_directional_motion_covers_three_quarters_of_the_loop(self):
        indices = directional_motion_indices(101, 64, 0.08, 0.88)
        self.assertEqual(len(indices), 49)
        self.assertEqual(indices[0], 8)
        self.assertEqual(indices[16], 28)
        self.assertEqual(indices[32], 49)
        self.assertEqual(indices[48], 69)

    def test_directional_motion_requires_quarter_turn_groups(self):
        with self.assertRaisesRegex(ValueError, "multiple of four"):
            directional_motion_indices(100, 63)

    def test_circular_motion_uses_real_cardinal_anchors(self):
        indices = circular_motion_indices(241, 64, (0.075, 0.267, 0.529, 0.729, 0.863))
        self.assertEqual(len(indices), 64)
        self.assertEqual(indices[0], 18)
        self.assertEqual(indices[16], 64)
        self.assertEqual(indices[32], 127)
        self.assertEqual(indices[48], 175)
        self.assertEqual(indices[-1], 207)


if __name__ == "__main__":
    unittest.main()
