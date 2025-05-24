import assert from "node:assert";
import {makeGrid} from "../src/board/board.js"
describe("Grid2D", function(){
    it("fails on out of bounds rows and columns", function(){
        const grid = makeGrid(3, 3, [
            1, 2, 3,
            4, 5, 6,
            7, 8, 9
        ]);

        assert.throws(() => grid.get(-1, 0));
        assert.throws(() => grid.get(0, -3));
        assert.throws(() => grid.get(4, 2));
        assert.throws(() => grid.get(1, 5));
    });
    it("works for a successful get", function(){
        const grid = makeGrid(3, 3, [
            1, 2, 3,
            4, 5.2, 6,
            7, 8, 9
        ]);

        assert.strictEqual(grid.get(1, 1), 5.2);
    });
    it("should have foreach loop through every row and column", function(){
        const progress = [false, false, false, false, false, false, false, false];
        let sum = 0;
        const grid = makeGrid(4, 2, [
            8, 7,
            6, 5,
            4, 3,
            2, 1
        ]);

        grid.forEach((row, col, value) => {
            progress[row * 2 + col] = true;
            sum += value;
        });
        assert.strictEqual(sum, 36);
        assert(progress.reduce((acc, val) => acc && val,true));
    });
});