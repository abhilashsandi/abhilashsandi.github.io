import unittest

from scripts.extract_character_frames import evenly_spaced_indices


class EvenlySpacedIndicesTest(unittest.TestCase):
    def test_spans_first_and_last_source_frames(self):
        self.assertEqual(evenly_spaced_indices(10, 4), [0, 3, 6, 9])

    def test_rejects_more_outputs_than_source_frames(self):
        with self.assertRaisesRegex(ValueError, "fewer frames"):
            evenly_spaced_indices(3, 4)

    def test_samples_only_the_directional_motion_interval(self):
        self.assertEqual(evenly_spaced_indices(10, 4, 2, 8), [2, 4, 6, 8])


if __name__ == "__main__":
    unittest.main()
