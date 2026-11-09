/** Representative Zip boards. Indices are row-major. */

export const board2 = {
  rows: 2,
  cols: 2,
  numberAt: [1, 2, 4, 3],
  rightWalls: [],
  downWalls: [],
};

export const board2Solution = [0, 1, 3, 2];

/** Down wall under 1 still leaves the 1-2-3-4 snake. */
export const board2Walled = {
  rows: 2,
  cols: 2,
  numberAt: [1, 2, 4, 3],
  rightWalls: [],
  downWalls: [0],
};

export const board2WalledSolution = [0, 1, 3, 2];

export const board3 = {
  rows: 3,
  cols: 3,
  numberAt: [1, null, 2, null, null, null, 4, null, 3],
  rightWalls: [],
  downWalls: [],
};

/**
 * LinkedIn Zip #601 HARD 8×8, read from the live DOM on 2026-11-08.
 * Walls came from React fiber `walls` on the trail grid.
 */
export const live601 = {
  rows: 8,
  cols: 8,
  numberAt: [
    null, null, null, null, null, null, null, null,
    1, 2, null, 10, null, null, 9, null,
    null, null, null, null, null, null, null, null,
    null, 7, null, null, 4, null, null, 8,
    3, null, null, 5, null, null, 14, null,
    null, null, null, null, null, null, null, null,
    null, 6, null, null, 12, null, 11, 13,
    null, null, null, null, null, null, null, null,
  ],
  rightWalls: [8, 54],
  downWalls: [],
};

export const live601Solution = [
  8, 0, 1, 9, 17, 16, 24, 32, 40, 48, 56, 57, 58, 59, 51, 43,
  44, 36, 28, 27, 35, 34, 42, 50, 49, 41, 33, 25, 26, 18, 10, 2,
  3, 4, 5, 6, 7, 15, 23, 31, 30, 22, 14, 13, 12, 11, 19, 20,
  21, 29, 37, 45, 46, 54, 53, 52, 60, 61, 62, 63, 55, 47, 39, 38,
];
