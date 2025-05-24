"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeGrid = makeGrid;
exports.neighborsOfCell = neighborsOfCell;
var node_assert_1 = require("node:assert");
var ArrayGrid = /** @class */ (function () {
    function ArrayGrid(rows, columns, cells) {
        this.rows = rows;
        this.columns = columns;
        (0, node_assert_1.default)(Number.isInteger(rows) && Number.isInteger(columns), "rows and columns must be integers");
        (0, node_assert_1.default)(rows >= 0 && columns >= 0, "rows and columns must be at least 0");
        (0, node_assert_1.default)(cells.length === rows * columns);
        this.values = cells;
    }
    ArrayGrid.prototype.get = function (row, column) {
        var _a;
        var idx = row * this.columns + column;
        (0, node_assert_1.default)(row >= 0 && row < this.rows, "row out of bounds");
        (0, node_assert_1.default)(column >= 0 && column < this.columns, "column out of bounds");
        (0, node_assert_1.default)(idx >= 0 && idx < this.values.length, "out of bounds");
        return (_a = this.values[idx]) !== null && _a !== void 0 ? _a : node_assert_1.default.fail();
    };
    ArrayGrid.prototype.forEach = function (consumer) {
        var _this = this;
        this.values.forEach(function (val, idx) {
            consumer(Math.floor(idx / _this.columns), idx % _this.columns, val);
        });
    };
    ArrayGrid.prototype.map = function (transformer) {
        var _this = this;
        return new ArrayGrid(this.rows, this.columns, this.values.map(function (val, idx) {
            return transformer(Math.floor(idx / _this.columns), idx % _this.columns, val);
        }));
    };
    return ArrayGrid;
}());
function makeGrid(rows, columns, cells) {
    return new ArrayGrid(rows, columns, cells);
}
/**
 * Returns all 8 neighbors of the given cell defined by row and col
 * @param row
 * @param column
 */
function neighborsOfCell(row, column) {
    var neighbors = [];
    for (var _i = 0, _a = [-1, 0, 1]; _i < _a.length; _i++) {
        var dx = _a[_i];
        for (var _b = 0, _c = [-1, 0, 1]; _b < _c.length; _b++) {
            var dy = _c[_b];
            if (dx === 0 && dy === 0)
                continue;
            neighbors.push([row + dx, column + dy]);
        }
    }
    return neighbors;
}
