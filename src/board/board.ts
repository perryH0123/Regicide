import { Grid2D } from "./boardTypes.js";
import assert from "node:assert";

class ArrayGrid<T> implements Grid2D<T>{
    private readonly values: T[];

    public constructor(public readonly rows: number, public readonly columns: number, cells: Array<T>){
        assert(Number.isInteger(rows) && Number.isInteger(columns), "rows and columns must be integers");
        assert(rows >= 0 && columns >= 0, "rows and columns must be at least 0");
        assert(cells.length === rows*columns);
        this.values = cells;
    }

    get(row: number, column: number): T {
        const idx = row * this.columns + column;
        assert(row >= 0 && row < this.rows, "row out of bounds");
        assert(column >= 0 && column < this.columns, "column out of bounds")
        assert(idx >= 0 && idx < this.values.length, "out of bounds");
        return this.values[idx] ?? assert.fail();
    }
    forEach(consumer: (row: number, col: number, value: T) => void): void {
        this.values.forEach((val, idx) => {
            consumer(Math.floor(idx/this.columns), idx % this.columns, val);
        });
    }
    map<U>(transformer: (row: number, col: number, value: T) => U): Grid2D<U> {
        return new ArrayGrid(this.rows, this.columns, this.values.map((val, idx) => {
            return transformer(Math.floor(idx/this.columns), idx % this.columns, val);
        }));
    }
}

export function makeGrid<T>(rows: number, columns: number, cells: Array<T>): Grid2D<T> {
    return new ArrayGrid(rows, columns, cells);
}

/**
 * Returns all 8 neighbors of the given cell defined by row and col
 * @param row
 * @param column 
 */
export function neighborsOfCell(row: number, column: number): [number, number][] {
    const neighbors: [number, number][] = [];
    for (const dx of [-1, 0, 1]){
        for(const dy of [-1, 0, 1]){
            if (dx === 0 && dy === 0) continue;
            neighbors.push([row+dx, column+dy]);
        }
    }
    return neighbors;
}