/**
 * A solver for a specific implementation of a grid-based puzzle game (ie: NYT Sudoku, LinkedIn Queens, etc.)
 */
export interface GridPuzzleSolver {
    /**
     * Interprets and attempts to apply the solution of the puzzle to the given puzzle client
     */
    solve(): void;
}

/**
 * Helper interface for methods on a specific implementation of a grid-based puzzle game
 * @see {@link GridPuzzleSolver}
 * @see {@link Grid2D}
 */
export interface GridPuzzleGame<T> {
    /**
     * Retrieves the DOM Client that the game is represented on
     * @returns a Window, who's DOM contains the game window in an unknown way
     */
    getClient(): Window,
    /**
     * Parses and retrieves the current 2D grid from the given provided client
     * @returns a 2D Grid, representing the objects of the Game
     */
    getGrid(): Grid2D<T>
}

/**
 * A specific implementation of a grid-based puzzle solver for a speficic domain of puzzles
 */
export interface SolveAlgorithm {
    /**
     * Given a 2D Grid representing a (partially solved) puzzle, attempts to find a solution
     * from the given grid as a starting point
     * @param puzzle puzzle to find a solution
     * @returns a 2D Grid that represents the solution of the puzzle, or undefined if the puzzle is unsolvable
     */
    getSolution<T>(puzzle: Grid2D<T>): Grid2D<T> | undefined;
}

/**
 * A representation of an immutable 2D grid with an arbitrary value as its cells
 * Grids are represented with (0,0) as the top-left cell in the grid
 */
export interface Grid2D<T> {
    /**
     * Retrieves the value at the specified cell
     * @param row Row to retrieve, starting from the top
     * @param column Column to retrieve, starting from the bottom
     * @throws Error if row and column are out of bounds or 
     */
    get(row, column): T;

    /**
     * Iterates over every row and column and applies a consumer function to each value
     * @param consumer A 3 parameter consumer function that takes in row, column, and the value of the grid
     */
    forEach(consumer: (row: number, col: number, value: T) => void);
}