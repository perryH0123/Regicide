import { assert, fail } from "../../../util/util";
import { Grid2D, GridPuzzleGame, GridPuzzleSolver, SolveAlgorithm } from "../../boardTypes";

export type Cell = [number, number];
export type ZipCell = {
    order: number,
    left: boolean,
    right: boolean,
    up: boolean,
    down: boolean
};
export type ZipSolution = {
    origin: Cell,
    moves: MOVES[]
}

export class LinkedInZipSolver implements GridPuzzleSolver {

    

    solve(): void {
        throw new Error("Method not implemented.");
    }

}

export class LinkedInClient implements GridPuzzleGame<ZipCell> {
    getClient(): Document {
        throw new Error("Method not implemented.");
    }
    getGrid(): Grid2D<ZipCell> {
        throw new Error("Method not implemented.");
    }

}

// QueueItem: Order, Head, Moves
type QueueItem = [number, Cell, MOVES[]];
enum MOVES {
    UP="up", DOWN="down", LEFT="left", RIGHT="right"
}

/**
 * BFS implementation of solver for zip
 */
export class ZipAlgorithm implements SolveAlgorithm<ZipCell, ZipSolution> {

    private readonly instance: ZipAlgorithm;

    private constructor(){
        this.instance = this;
    }

    public getInstance(): ZipAlgorithm {
        if (this.instance) return this.instance
        return new ZipAlgorithm();
    }

    private static hashState(order: number, head: Cell): symbol {
        return Symbol(`${order}-${head[0]},${head[1]}`);
    }


    public getSolution(puzzle: Grid2D<ZipCell>): ZipSolution | undefined {
        const queue: QueueItem[] = [];
        // boardHash: 
        const visited = new Set<symbol>();
        const orders = this.getPuzzleOrders(puzzle);
        const origin = orders.get(1) ?? fail("puzzle does not have a 1 (starting point");
        const end = Math.max(...orders.keys().toArray());

        const victoryCheck = (head: number) => head >= end;
        if(victoryCheck(1)) return {origin, moves: []};


        visited.add(ZipAlgorithm.hashState(1, origin));
        queue.push([1, origin, []]);

        while (queue){
            const [currentOrder, currentHead, currentMoves] = queue[0] ?? fail();
            //TODO: BFS Implementation with getFourDirectionalNeighbors
            for (const [neighborCell, move] of getFourDirectionalNeighbors(currentHead, puzzle)){
                // need to add move
                
                const hash = ZipAlgorithm.hashState(neighborCell.order, )
                if(!(neighborCell.order === currentOrder+1 || neighborCell.order === 0)) continue;
                const newOrder === (neighborCell.order === 0) ? currentOrder : currentOrder + 1;

            }
        }


        return undefined;
    }

    private getPuzzleOrders(puzzle: Grid2D<ZipCell>): Map<number, Cell> {
        const orderMap = new Map<number, Cell>();
        puzzle.forEach((row, col, value) => {
            if (value.order > 0){
                if(orderMap.get(value.order)) throw new Error("Bad grid - two numbers with the same order detected");
                orderMap.set(value.order, [row, col]);
            }
        });
        const maxOrder = Math.max(...orderMap.keys().toArray());
        for (let i = 1; i <= maxOrder; i++){
            assert(orderMap.get(i) !== undefined);
        }
        return orderMap;
    }
    
}

/**
 * Gets the four directional neighbors of a cell if a wall does not exist between them.
 * @param cell the cell, incicated by [row, col] to check, where the position is encoded as positive integers and 0 that are in the range of the board
 * @param board the parent board to check
 */
function getFourDirectionalNeighbors(cell: Cell, board: Grid2D<ZipCell>): Set<[ZipCell, MOVES]> {
    const neighbors = new Set<[ZipCell, MOVES]>();
    const thisZipCell = board.get(...cell);
    function addNeighborIfValid(rShift: number, cShift: number, wallProperty: MOVES){
        if(!thisZipCell[wallProperty]) return;
        const newRow = cell[0] + rShift;
        const newCol = cell[1] + cShift;
        if(newRow < 0 || newRow >= board.rows) return;
        if(newCol < 0 || newCol >= board.columns) return;
        neighbors.add([board.get(newRow,newCol) ?? fail(), wallProperty]);
    }
    addNeighborIfValid(-1, 0, MOVES.UP);
    addNeighborIfValid(0, 1, MOVES.RIGHT);
    addNeighborIfValid(1, 0, MOVES.DOWN);
    addNeighborIfValid(0, -1, MOVES.LEFT);
    return neighbors;
}

function getNewHead(currentHead: Cell, move: MOVES): Cell {
    switch(move){
        case MOVES.UP:
            return [currentHead[0]-1, currentHead[1]];
        case MOVES.DOWN:
            return [currentHead[0]+1, currentHead[1]];
        case MOVES.LEFT:
            return [currentHead[0], currentHead[1]-1];
        case MOVES.RIGHT:
            return [currentHead[0], currentHead[1]+1];
    }
}