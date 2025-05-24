import { makeGrid } from "../../board";
//import assert from "node:assert";
import { Grid2D, GridPuzzleGame, GridPuzzleSolver, SolveAlgorithm } from "../../boardTypes";
import { QueensCell, QueensSATAlgorithm } from "./queens";
import { triggerMouseEvent } from "../../../util/util";

export class LinkedInQueensSolver implements GridPuzzleSolver {
    private readonly client: GridPuzzleGame<QueensCell>;
    private readonly algorithm: SolveAlgorithm<QueensCell>;

    public constructor(
        document: Document
    ){
        this.client = new LinkedInQueensClient(document);
        this.algorithm = QueensSATAlgorithm.getInstance();
    }

    solve(): void {
        const sol = this.algorithm.getSolution(this.client.getGrid());
        const elems = getLinkedInGridElements(this.client.getClient());
        //atp we are confident that the width is a square if a solution exists
        const width = Math.sqrt(elems.length);
        if (sol === undefined) throw new Error("No solution found for this game; for LinkedIn, this is typically a bug");
        elems.forEach((e, idx) => {
            const row = Math.floor(idx / width);
            const col = idx % width;
            if(sol.get(row,col).queen){
                // click twice
                triggerMouseEvent(e, "mousedown");
                triggerMouseEvent(e, "mouseup");
                triggerMouseEvent(e, "mousedown");
                triggerMouseEvent(e, "mouseup");
            }
        });
    }

}

class LinkedInQueensClient implements GridPuzzleGame<QueensCell> {
    public constructor(
        private readonly document: Document
    ){
    }
    getClient(): Document {
        return this.document;
    }
    getGrid(): Grid2D<QueensCell> {
        const cells = getLinkedInGridElements(this.document)
        const width = Math.sqrt(cells.length);

        // assume grid is square
        if(!Number.isInteger(width)) throw new Error("collected cells did not form a perfect grid");
        if(width === 0) throw new Error("no cells found");
        return makeGrid(width, width, cells).map((row, col, div) => {
            const colorClass = Array.from(div.classList).filter(c => c.startsWith("cell-color-"))[0]
            if(colorClass === undefined) throw new Error("classes did not have color data");
            const colorClassSplit = colorClass.split("-");
            const colorStr = colorClassSplit[colorClassSplit.length-1];
            if (colorStr === undefined) throw new Error();
            const color = parseInt(colorStr); // last element of class
            if (Number.isNaN(color)) throw new Error(`can't parse color: ${color}`);
            let queen = false;
            const contentCell = div.getElementsByClassName("cell-content")[0];
            if(contentCell){
                contentCell.querySelectorAll("div").forEach(child => {
                    queen ||= child.className.includes("queen");
                });
            }
            return {
                queen,
                color
            }
        });
    }
}

function getLinkedInGridElements(document: Document): Element[] {
    const grid = document.getElementById('queens-grid');
    if (grid === null) throw new Error("wrong  page, or queens grid id is wrong");
    
    const cells = grid.querySelectorAll(".queens-cell-with-border");
    return Array.from(cells);
}