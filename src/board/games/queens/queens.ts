import { Clause, SatFormula } from "../../../sat/Sat";
import { combinationsOfArray, fail } from "../../../util/util";
import { neighborsOfCell } from "../../board";
import { Grid2D, SolveAlgorithm } from "../../boardTypes";

export type QueensCell = {
    queen: boolean,
    color: number    
}

type RegionMapping = Map<number, [number, number][]>;

/**
 * SAT Solver using basic DPLL for Queens (1-Star Star Battle)
 */
export class QueensSATAlgorithm implements SolveAlgorithm<QueensCell, Grid2D<QueensCell>> {

    /**
     * From a grid, construct a mapping of colors to rows and columns of cells
     * @param grid A Grid2D of QueenCells, where each cell has a queen and color property
     * @returns The mapping
     */
    private static makeZoneGroupings(grid: Grid2D<QueensCell>): RegionMapping{
        const groups: Map<number, [number, number][]> = new Map();
        grid.forEach((r,c,v)=> {
            if(!groups.has(v.color)){
                groups.set(v.color, []);
            }
            groups.get(v.color)?.push([r,c]);
        });
        return groups;
    }

    private static exactlyOneConstraint(cells: [number, number][]): Clause[]{
        const clauses: Clause[] = [];
        clauses.push(new Clause(cells.map(([row, col]) => [`${row},${col}`, true])));
            if (cells.length === 1) return clauses;
            // disallow simultaneous pairwise truthfulness
            for (const rowColumnPairs of combinationsOfArray(cells, 2)){
                clauses.push(
                    new Clause(rowColumnPairs.map(([row, col]) => [`${row},${col}`, false]))
            );
        }
        return clauses;
    }
    
    private static eachRegionHasExactlyQueen(regionMapping: RegionMapping): Clause[] {
        const clauses: Clause[] = [];
        for (const color of regionMapping.keys()){
            const cellsInRegion = regionMapping.get(color) ?? fail();
            if(!(cellsInRegion.length > 0)) throw new Error("a region must have at least one cell");
            // at least one cell is true
            clauses.push(...QueensSATAlgorithm.exactlyOneConstraint(cellsInRegion));
        }
        return clauses;
    }

    private static eachRowHasExactlyOneQueen(grid: Grid2D<QueensCell>): Clause[]{
        const clauses = [];
        for(let r = 0; r < grid.rows; r++){
            const cellsInRow = Array.from(Array(grid.columns).keys()).map(c => [r,c]) as [number, number][];
            clauses.push(...QueensSATAlgorithm.exactlyOneConstraint(cellsInRow));
        }
        return clauses;
    }

    private static eachColumnHasExactlyOneQueen(grid: Grid2D<QueensCell>): Clause[]{
        const clauses: Clause[] = [];
        for(let c = 0; c < grid.columns; c++){
            const cellsInRow = Array.from(Array(grid.rows).keys()).map(r => [r,c]) as [number, number][];
            clauses.push(...QueensSATAlgorithm.exactlyOneConstraint(cellsInRow));
        }
        return clauses;
    }

    private static noAdjacentQueens(grid: Grid2D<QueensCell>): Clause[]{
        const clauses: Clause[] = [];
        grid.forEach((row, col) => {
            neighborsOfCell(row, col).filter(([row, col]) => {
                return (0<=row) && (row < grid.rows) && (0 <= col) && (col < grid.columns);
            }).forEach(([nr, nc]) => {
                if ((nr > row) || (nr === row && nc > col)) { // avoid redundant clauses
                    clauses.push(new Clause([[`${row},${col}`, false], [`${nr},${nc}`, false]]));
                }
                
            });  
        });
        return clauses;
    }

    public getSolution(puzzle: Grid2D<QueensCell>): Grid2D<QueensCell> | undefined {
        const colorGroups = QueensSATAlgorithm.makeZoneGroupings(puzzle);

        // hueristic - attempt to solve the simplest regions first
        const hueristic: (clauses: Clause[]) => string = ((clauses: Clause[]) => {
            const vars: Set<string> = clauses.reduce((acc, clause) => acc.union(clause.variables()), new Set<string>());
            const colorZonesInOrder = Array.from(colorGroups.keys()).sort((a,b) => {
                const cellsA = colorGroups.get(a) ?? fail();
                const cellsB = colorGroups.get(b) ?? fail();
                return cellsA.length - cellsB.length;
            });
            for (const color of colorZonesInOrder){
                const cellsInZone = colorGroups.get(color)??fail();
                for(const [row, col] of cellsInZone){
                    const strName = `${row},${col}`;
                    if (vars.has(strName)) return strName;
                }
            }
            return "out of clauses";
        });
        const clauses: Clause[] = [];
        clauses.push(...QueensSATAlgorithm.eachRegionHasExactlyQueen(colorGroups));
        clauses.push(...QueensSATAlgorithm.eachRowHasExactlyOneQueen(puzzle));
        clauses.push(...QueensSATAlgorithm.eachColumnHasExactlyOneQueen(puzzle));
        clauses.push(...QueensSATAlgorithm.noAdjacentQueens(puzzle));
        const formula = SatFormula.buildFromClauses(clauses, hueristic);
        const assignment = formula.satisfyingAssignment();
        if(assignment === undefined) return undefined;
        return puzzle.map((r,c,v) => {
            const newCell: QueensCell = {
                queen: assignment.get(`${r},${c}`) ?? false, // assume no queen if not placed in assigment
                color: v.color
            };
            return newCell;
        })
    }

    private constructor(){
        QueensSATAlgorithm.instance = this;
    }

    private static instance: QueensSATAlgorithm;

    public static getInstance(){
        return this.instance ?? new QueensSATAlgorithm();
    }

}