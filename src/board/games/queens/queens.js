"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueensSATAlgorithm = void 0;
var Sat_js_1 = require("../../../sat/Sat.js");
var util_js_1 = require("../../../util/util.js");
var board_js_1 = require("../../board.js");
var node_assert_1 = require("node:assert");
/**
 * SAT Solver using basic DPLL for Queens (1-Star Star Battle)
 */
var QueensSATAlgorithm = /** @class */ (function () {
    function QueensSATAlgorithm() {
        QueensSATAlgorithm.instance = this;
    }
    /**
     * From a grid, construct a mapping of colors to rows and columns of cells
     * @param grid A Grid2D of QueenCells, where each cell has a queen and color property
     * @returns The mapping
     */
    QueensSATAlgorithm.makeZoneGroupings = function (grid) {
        var groups = new Map();
        grid.forEach(function (r, c, v) {
            var _a;
            if (!groups.has(v.color)) {
                groups.set(v.color, []);
            }
            (_a = groups.get(v.color)) === null || _a === void 0 ? void 0 : _a.push([r, c]);
        });
        return groups;
    };
    QueensSATAlgorithm.exactlyOneConstraint = function (cells) {
        var clauses = [];
        clauses.push(new Sat_js_1.Clause(cells.map(function (_a) {
            var row = _a[0], col = _a[1];
            return ["".concat(row, ",").concat(col), true];
        })));
        if (cells.length === 1)
            return clauses;
        // disallow simultaneous pairwise truthfulness
        for (var _i = 0, _a = (0, util_js_1.combinationsOfArray)(cells, 2); _i < _a.length; _i++) {
            var rowColumnPairs = _a[_i];
            clauses.push(new Sat_js_1.Clause(rowColumnPairs.map(function (_a) {
                var row = _a[0], col = _a[1];
                return ["".concat(row, ",").concat(col), false];
            })));
        }
        return clauses;
    };
    QueensSATAlgorithm.eachRegionHasExactlyQueen = function (regionMapping) {
        var _a;
        var clauses = [];
        for (var _i = 0, _b = regionMapping.keys(); _i < _b.length; _i++) {
            var color = _b[_i];
            var cellsInRegion = (_a = regionMapping.get(color)) !== null && _a !== void 0 ? _a : node_assert_1.default.fail();
            (0, node_assert_1.default)(cellsInRegion.length > 0, "a region must have at least one cell");
            // at least one cell is true
            clauses.push.apply(clauses, QueensSATAlgorithm.exactlyOneConstraint(cellsInRegion));
        }
        return clauses;
    };
    QueensSATAlgorithm.eachRowHasExactlyOneQueen = function (grid) {
        var clauses = [];
        var _loop_1 = function (r) {
            var cellsInRow = Array.from(Array(grid.columns).keys()).map(function (c) { return [r, c]; });
            clauses.push.apply(clauses, QueensSATAlgorithm.exactlyOneConstraint(cellsInRow));
        };
        for (var r = 0; r < grid.rows; r++) {
            _loop_1(r);
        }
        return clauses;
    };
    QueensSATAlgorithm.eachColumnHasExactlyOneQueen = function (grid) {
        var clauses = [];
        var _loop_2 = function (c) {
            var cellsInRow = Array.from(Array(grid.rows).keys()).map(function (r) { return [r, c]; });
            clauses.push.apply(clauses, QueensSATAlgorithm.exactlyOneConstraint(cellsInRow));
        };
        for (var c = 0; c < grid.columns; c++) {
            _loop_2(c);
        }
        return clauses;
    };
    QueensSATAlgorithm.noAdjacentQueens = function (grid) {
        var clauses = [];
        grid.forEach(function (row, col) {
            (0, board_js_1.neighborsOfCell)(row, col).filter(function (_a) {
                var row = _a[0], col = _a[1];
                return (0 <= row) && (row < grid.rows) && (0 <= col) && (col < grid.columns);
            }).forEach(function (_a) {
                var nr = _a[0], nc = _a[1];
                if ((nr > row) || (nr === row && nc > col)) { // avoid redundant clauses
                    clauses.push(new Sat_js_1.Clause([["".concat(row, ",").concat(col), false], ["".concat(nr, ",").concat(nc), false]]));
                }
            });
        });
        return clauses;
    };
    QueensSATAlgorithm.prototype.getSolution = function (puzzle) {
        var colorGroups = QueensSATAlgorithm.makeZoneGroupings(puzzle);
        // hueristic - attempt to solve the simplest regions first
        var hueristic = (function (clauses) {
            var _a;
            var vars = clauses.reduce(function (acc, clause) { return acc.union(clause.variables()); }, new Set());
            var colorZonesInOrder = Array.from(colorGroups.keys()).sort(function (a, b) {
                var _a, _b;
                var cellsA = (_a = colorGroups.get(a)) !== null && _a !== void 0 ? _a : node_assert_1.default.fail();
                var cellsB = (_b = colorGroups.get(b)) !== null && _b !== void 0 ? _b : node_assert_1.default.fail();
                return cellsA.length - cellsB.length;
            });
            for (var _i = 0, colorZonesInOrder_1 = colorZonesInOrder; _i < colorZonesInOrder_1.length; _i++) {
                var color = colorZonesInOrder_1[_i];
                var cellsInZone = (_a = colorGroups.get(color)) !== null && _a !== void 0 ? _a : node_assert_1.default.fail();
                for (var _b = 0, cellsInZone_1 = cellsInZone; _b < cellsInZone_1.length; _b++) {
                    var _c = cellsInZone_1[_b], row = _c[0], col = _c[1];
                    var strName = "".concat(row, ",").concat(col);
                    if (strName in vars)
                        return strName;
                }
            }
            return "out of clauses";
        });
        var clauses = [];
        clauses.push.apply(clauses, QueensSATAlgorithm.eachRegionHasExactlyQueen(colorGroups));
        clauses.push.apply(clauses, QueensSATAlgorithm.eachRowHasExactlyOneQueen(puzzle));
        clauses.push.apply(clauses, QueensSATAlgorithm.eachColumnHasExactlyOneQueen(puzzle));
        clauses.push.apply(clauses, QueensSATAlgorithm.noAdjacentQueens(puzzle));
        var formula = Sat_js_1.SatFormula.buildFromClauses(clauses, hueristic);
        var assignment = formula.satisfyingAssignment();
        if (assignment === undefined)
            return undefined;
        return puzzle.map(function (r, c, v) {
            var _a;
            var newCell = {
                queen: (_a = assignment.get("".concat(r, ",").concat(c))) !== null && _a !== void 0 ? _a : false, // assume no queen if not placed in assigment
                color: v.color
            };
            return newCell;
        });
    };
    QueensSATAlgorithm.getInstance = function () {
        var _a;
        return (_a = this.instance) !== null && _a !== void 0 ? _a : new QueensSATAlgorithm();
    };
    return QueensSATAlgorithm;
}());
exports.QueensSATAlgorithm = QueensSATAlgorithm;
