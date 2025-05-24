"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedInQueensSolver = void 0;
var board_js_1 = require("../../board.js");
var node_assert_1 = require("node:assert");
var queens_js_1 = require("./queens.js");
var util_js_1 = require("../../../util/util.js");
var LinkedInQueensSolver = /** @class */ (function () {
    function LinkedInQueensSolver(document) {
        this.client = new LinkedInQueensClient(document);
        this.algorithm = queens_js_1.QueensSATAlgorithm.getInstance();
    }
    LinkedInQueensSolver.prototype.solve = function () {
        var sol = this.algorithm.getSolution(this.client.getGrid());
        var elems = getLinkedInGridElements(this.client.getClient());
        //atp we are confident that the width is a square if a solution exists
        var width = Math.sqrt(elems.length);
        if (sol === undefined)
            throw new Error("No solution found for this game; for LinkedIn, this is typically a bug");
        elems.forEach(function (e, idx) {
            var row = Math.floor(idx / width);
            var col = idx % width;
            if (sol.get(row, col).queen) {
                (0, util_js_1.triggerMouseEvent)(e, "mousedown");
                (0, util_js_1.triggerMouseEvent)(e, "mouseup");
            }
        });
    };
    return LinkedInQueensSolver;
}());
exports.LinkedInQueensSolver = LinkedInQueensSolver;
var LinkedInQueensClient = /** @class */ (function () {
    function LinkedInQueensClient(document) {
        this.document = document;
    }
    LinkedInQueensClient.prototype.getClient = function () {
        return this.document;
    };
    LinkedInQueensClient.prototype.getGrid = function () {
        var cells = getLinkedInGridElements(this.document);
        var width = Math.sqrt(cells.length);
        // assume grid is square
        if (!Number.isInteger(width))
            throw new Error("collected cells did not form a perfect grid");
        if (width === 0)
            throw new Error("no cells found");
        return (0, board_js_1.makeGrid)(width, width, cells).map(function (row, col, div) {
            var _a, _b;
            var colorClass = (_a = Array.from(div.classList).filter(function (c) { return c.startsWith("cell-color-"); })[0]) !== null && _a !== void 0 ? _a : node_assert_1.default.fail("classes did not have color data");
            var colorClassSplit = colorClass.split("-");
            var color = parseInt((_b = colorClassSplit[colorClassSplit.length - 1]) !== null && _b !== void 0 ? _b : node_assert_1.default.fail()); // last element of class
            if (Number.isNaN(color))
                throw new Error("can't parse color: ".concat(color));
            var queen = false;
            var contentCell = div.getElementsByClassName("cell-content")[0];
            if (contentCell) {
                contentCell.querySelectorAll("div").forEach(function (child) {
                    queen || (queen = child.className.includes("queen"));
                });
            }
            return {
                queen: queen,
                color: color
            };
        });
    };
    return LinkedInQueensClient;
}());
function getLinkedInGridElements(document) {
    var grid = document.getElementById('queens-grid');
    if (grid === null)
        throw new Error("wrong  page, or queens grid id is wrong");
    var cells = grid.querySelectorAll(".queens-cell-with-border");
    return Array.from(cells);
}
