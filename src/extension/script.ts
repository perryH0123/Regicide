import { LinkedInQueensSolver } from "../board/games/queens/linkedInQueens";

console.log(window.location.href);
const QUEENS_URL = "https://www.linkedin.com/games/queens";
if (window.location.href.startsWith(QUEENS_URL)){
    console.log("queens!")
    const solver = new LinkedInQueensSolver(document);
    solver.solve();
}