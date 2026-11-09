/** Representative Queens boards used by unit tests. Colors are opaque region ids. */

/** 2x2 is always unsolvable: any two queens touch. */
export const unsolvable2 = [
  ['A', 'B'],
  ['A', 'B'],
];

/**
 * 4x4 with a unique intended placement:
 * queens at (0,1), (1,3), (2,0), (3,2)
 * (1,3) and (3,1) would share a diagonal; the actual fourth queen is (3,2),
 * while (0,1) and (2,3) are not used. (1,3) and (3,2) are not a full diagonal.
 */
export const board4 = [
  ['A', 'A', 'B', 'B'],
  ['A', 'C', 'B', 'B'],
  ['C', 'C', 'D', 'B'],
  ['C', 'D', 'D', 'D'],
];

export const board4Solution = [1, 3, 0, 2];

/**
 * Same 4x4 layout, used to confirm two queens on a long diagonal can be legal.
 * Queens (0,0) and (2,2) share a diagonal with Chebyshev distance 2.
 */
export const board4LongDiagonal = [
  ['A', 'A', 'B', 'C'],
  ['A', 'B', 'B', 'C'],
  ['D', 'D', 'C', 'C'],
  ['D', 'D', 'D', 'C'],
];

/** 5x5 with five contiguous regions. */
export const board5 = [
  [1, 1, 1, 1, 1],
  [2, 2, 3, 3, 1],
  [4, 2, 3, 3, 3],
  [4, 4, 5, 5, 3],
  [4, 4, 5, 5, 5],
];

/**
 * LinkedIn Queens #920 (HARD, 8x8), read from the live DOM on 2026-11-07.
 * Region names are the aria-label color strings from the page.
 */
/** Solver output for live920: columns per row, independently rule-checked in tests. */
export const live920Solution = [4, 2, 5, 3, 6, 1, 7, 0];

export const live920 = [
  ['Vibrant Coral', 'Vibrant Coral', 'Vibrant Coral', 'Vibrant Coral', 'Light Gray', 'Light Gray', 'Light Gray', 'Light Gray'],
  ['Vibrant Coral', 'Vibrant Coral', 'Lime Yellow', 'Vibrant Coral', 'Light Gray', 'Soft Blue', 'Soft Blue', 'Soft Blue'],
  ['Vibrant Coral', 'Vibrant Coral', 'Lime Yellow', 'Lime Yellow', 'Light Gray', 'Soft Blue', 'Pastel Green', 'Pastel Green'],
  ['Vibrant Coral', 'Peach Orange', 'Lavender', 'Lavender', 'Lavender', 'Soft Blue', 'Soft Blue', 'Pastel Green'],
  ['Vibrant Coral', 'Peach Orange', 'Lavender', 'Peach Orange', 'Lavender', 'Pastel Green', 'Pastel Green', 'Pastel Green'],
  ['Vibrant Coral', 'Peach Orange', 'Peach Orange', 'Peach Orange', 'Lavender', 'Vibrant Coral', 'Vibrant Coral', 'Warm Beige'],
  ['Vibrant Coral', 'Vibrant Coral', 'Vibrant Coral', 'Vibrant Coral', 'Vibrant Coral', 'Vibrant Coral', 'Vibrant Coral', 'Warm Beige'],
  ['Vibrant Coral', 'Vibrant Coral', 'Vibrant Coral', 'Vibrant Coral', 'Vibrant Coral', 'Vibrant Coral', 'Warm Beige', 'Warm Beige'],
];

export const board4FixtureColors = {
  A: { name: 'Vibrant Coral', bg: 'rgb(255, 123, 96)' },
  B: { name: 'Light Gray', bg: 'rgb(223, 223, 223)' },
  C: { name: 'Lime Yellow', bg: 'rgb(230, 243, 136)' },
  D: { name: 'Soft Blue', bg: 'rgb(150, 190, 255)' },
};

/**
 * Queens Ultimate unlimited 8×8 Easy #4107, read from the live DOM on 2026-11-07.
 * Region ids are the page's data-region values.
 */
export const liveUltimate4107Solution = [4, 6, 1, 5, 7, 3, 0, 2];

export const liveUltimate4107 = [
  ['2', '2', '2', '3', '6', '6', '6', '1'],
  ['2', '3', '3', '3', '6', '6', '1', '1'],
  ['2', '3', '5', '3', '6', '6', '1', '1'],
  ['2', '5', '5', '5', '7', '4', '4', '0'],
  ['2', '5', '5', '5', '7', '7', '4', '0'],
  ['2', '5', '5', '7', '7', '7', '7', '7'],
  ['2', '2', '5', '5', '7', '7', '7', '7'],
  ['2', '2', '5', '5', '7', '7', '7', '7'],
];
