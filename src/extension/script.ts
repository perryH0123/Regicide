import { LinkedInQueensSolver } from "../board/games/queens/linkedInQueens.js";

const QUEENS_URL = "https://linkedin.com/games/queens";
if (window.location.href.startsWith(QUEENS_URL)){
    const solver = new LinkedInQueensSolver(document);
    solver.solve();
}