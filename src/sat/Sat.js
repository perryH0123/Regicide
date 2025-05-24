"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clause = exports.SatFormula = void 0;
var node_assert_1 = require("node:assert");
var ContradictionError = /** @class */ (function (_super) {
    __extends(ContradictionError, _super);
    function ContradictionError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ContradictionError;
}(Error));
var DEFAULT_HUERISTIC = function (clauses) {
    var _a;
    var variableMap = new Map();
    clauses.forEach(function (c) { return c.variables().forEach(function (variable) {
        var prev = variableMap.get(variable);
        if (prev === undefined)
            variableMap.set(variable, 1);
        else
            variableMap.set(variable, prev + 1);
    }); });
    var varNames = Array.from(variableMap.keys()).sort(function (a, b) {
        var _a, _b;
        return ((_a = variableMap.get(a)) !== null && _a !== void 0 ? _a : node_assert_1.default.fail("should not get here"))
            - ((_b = variableMap.get(b)) !== null && _b !== void 0 ? _b : node_assert_1.default.fail("should not get here"));
    });
    return (_a = varNames[0]) !== null && _a !== void 0 ? _a : "NO CLAUSES";
};
/**
 * An immutable SAT-solvable boolean formula in conjunctive normal form (CNF)
 * A formula is the intersection of many Clauses, which much be completely satisfied in order
 * for the formula to be solved.
 */
var SatFormula = /** @class */ (function () {
    function SatFormula(clauses, hueristic) {
        this.clauses = clauses;
        this.hueristic = DEFAULT_HUERISTIC;
        if (hueristic)
            this.hueristic = hueristic;
    }
    /**
     * Constructs a SAT formula from an array of arrays of 2-tuple representing clauses
     * @param clauses a collection of clauses, where each clause is represented by an array of 2-tuples of a string
     * and its corresponding boolean value
     * @param hueristic A hueristic, that when provided an array of clauses, returns a string name of a variable
     * to test given the formula. For the formula to not encounter any cycles, the hueristic function must produce a unique
     * literal name that is included in the formula if the formula is unsolved.
     * @returns A SatFormula representing the result of the encoding of the conjunction
     * @throws ContradictionError if a contradiction is discovered in any clause
     * @see {@link buildFromClauses}
     */
    SatFormula.buildFormula = function (clauses, hueristic) {
        var clauseObjs = clauses.filter(Boolean).map(function (arr) { return new Clause(arr); }); // make sure no empty clauses are present
        return new SatFormula(clauseObjs, hueristic);
    };
    /**
     * Constructs a SAT formula from an array of predefined Clauses
     * @param clauses a collection of Clauses
     * @param hueristic A hueristic, that when provided an array of clauses, returns a string name of a variable
     * to test given the formula. For the formula to not encounter any cycles, the hueristic function must produce a unique
     * literal name that is included in the formula if the formula is unsolved.
     * @returns A SatFormula representing the result of the encoding of the conjunction
     * @throws ContradictionError if a contradiction is discovered in any clause
     * @see {@link buildFormula}
     */
    SatFormula.buildFromClauses = function (clauses, hueristic) {
        return new SatFormula(clauses, hueristic);
    };
    /**
     * Unions the given formula with another, replacing the hueristic with that of this or another function if provided.
     * @param other: The other SatFormula to union with. It's hueristic will be replaced.
     * @returns A new SatFormula with the hueristic of this and the clauses of both SatFormulas combined
     */
    SatFormula.prototype.union = function (other) {
        var _a;
        return new SatFormula((_a = this.clauses).concat.apply(_a, other.clauses), this.hueristic);
    };
    SatFormula.prototype.updateFormula = function (testVar, testVal) {
        var newClauses = this.clauses.map(function (c) { return c.update(testVar, testVal); }).filter(function (c) { return c !== undefined; });
        return new SatFormula(newClauses, this.hueristic);
    };
    /**
     * Detemines if this formula is solved (ie: has no clauses)
     * @returns true iff the formula is solved
     */
    SatFormula.prototype.solved = function () {
        return !this.clauses.length;
    };
    /**
     * Determines if the formula is solvable in its current state
     * @returns true if the formula is able to be potentially solved
     */
    SatFormula.prototype.solvable = function () {
        return this.clauses.reduce(function (acc, current) {
            return acc && current.solvable();
        }, true);
    };
    /**
     * If the formula is solvable, returns a Map of variables to their corresponding values.
     * @returns undefined if the formula is not possible to solve, otherwise a map corresponding to a variable assignment
     * that is sufficient to satisfy the formula. The formula need not be fully defined for all variables present in the formula
     * @throws Error if a unit clause is not found and the hueristic function does not produce a literal required in any clause
     */
    SatFormula.prototype.satisfyingAssignment = function () {
        return this._satisfyingAssignment();
    };
    /**
     * Helper method for satisfyingAssignment
     * @param sofar Current map that we are trying
     * @throws @see {@link satisfyingAssignment}
     * @returns @see {@link satisfyingAssignment}
     */
    SatFormula.prototype._satisfyingAssignment = function (sofar) {
        if (!this.solvable())
            return undefined;
        if (!sofar)
            sofar = new Map();
        if (this.solved())
            return sofar;
        // find unit clauses
        for (var _i = 0, _a = this.clauses; _i < _a.length; _i++) {
            var clause = _a[_i];
            var pairing = clause.unitClause();
            // if a unit clause is found
            if (pairing) {
                var testVar_1 = pairing[0], testVal = pairing[1];
                sofar.set(testVar_1, testVal);
                var newFormula = this.updateFormula(testVar_1, testVal);
                var resultingMap = newFormula._satisfyingAssignment(sofar);
                return resultingMap === null || resultingMap === void 0 ? void 0 : resultingMap.set(testVar_1, testVal); // return undefined here if not possible to satisfy
            }
        }
        // recursive backtracking search with hueristic
        var testVar = this.hueristic(this.clauses.slice());
        if (!this.clauses.reduce(function (val, c) { return c.variables().has(testVar) || val; }, false))
            throw new Error("Hueristic didn't generate a variable in the formula, an infinite loop will occur");
        for (var _b = 0, _c = [true, false]; _b < _c.length; _b++) {
            var testVal = _c[_b];
            var successfulAssignments = this.updateFormula(testVar, testVal)._satisfyingAssignment(sofar);
            if (successfulAssignments) {
                return successfulAssignments.set(testVar, testVal);
            }
        }
        return undefined;
    };
    /**
     * Returns a shallow copy of all clauses
     */
    SatFormula.prototype.getClauses = function () {
        return this.clauses.slice();
    };
    /**
     * @returns a string representation of the formula
     */
    SatFormula.prototype.toString = function () {
        var str = "SatFormula(" + this.clauses.map(function (c) { return "".concat(c.toString()); }).join("\n and");
        return str + "\n)";
    };
    return SatFormula;
}());
exports.SatFormula = SatFormula;
/**
 * A clause to be stored in a formula
 * Clauses must be solvable and contain no contradiction; contradictions in the same clause are assumed to be
 * the result of clause generation errors and will result in a ContradictionError being thrown
 * The clause is solved when one of its predicates is satisfied
 */
var Clause = /** @class */ (function () {
    /**
     * Creates a new clause representing the union of many predicates
     * @param literalPairs an array mapping literal pairs to required boolean values. The values need not be unique
     * but cannot contain any contradictions.
     * @throws ContradictionError if a literal and its negation are both present in the clause
     */
    function Clause(literalPairs) {
        this.literalMap = new Map();
        for (var _i = 0, literalPairs_1 = literalPairs; _i < literalPairs_1.length; _i++) {
            var _a = literalPairs_1[_i], variable = _a[0], value = _a[1];
            var existingPairing = this.literalMap.get(variable);
            if (existingPairing !== undefined) {
                if (existingPairing === !value)
                    throw new ContradictionError("Contradiction on variable ".concat(variable));
            }
            else
                this.literalMap.set(variable, value);
        }
    }
    /**
     * Returns a new clause or undefined as a result of setting a variable to this value.
     * @param testVar The variable to test. If not present in the clause, the statement has no effect
     * @param testVal the value to set the testVar to
     * @returns undefined if the clause is solved, otherwise a clause as the result of setting the variable
     * to the new value
     */
    Clause.prototype.update = function (testVar, testVal) {
        if (!this.literalMap.has(testVar))
            return this; // short-circuit
        var newPairs = [];
        for (var _i = 0, _a = this.literalMap.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], variable = _b[0], val = _b[1];
            if (variable !== testVar)
                newPairs.push([variable, val]);
            else if (val === testVal)
                return undefined;
        }
        return new Clause(newPairs);
    };
    /**
     * Determines of the clause is solvable
     * @returns true if the clause can potentially be satisfied
     */
    Clause.prototype.solvable = function () {
        return this.literalMap.size > 0;
    };
    /**
     * Returns a list of variables present in the formula
     */
    Clause.prototype.variables = function () {
        return new Set(this.literalMap.keys());
    };
    /**
     * If the clause consists of only one literal, return its required literal pair
     * @returns a pair of a lteral and its required value to satisfy this clause
     */
    Clause.prototype.unitClause = function () {
        var _a, _b;
        if (this.literalMap.size === 1) {
            var variable = (_a = this.literalMap.keys().next().value) !== null && _a !== void 0 ? _a : node_assert_1.default.fail();
            return [variable, (_b = this.literalMap.get(variable)) !== null && _b !== void 0 ? _b : node_assert_1.default.fail()];
        }
        return undefined;
    };
    Clause.prototype.forEach = function (pairFunc) {
        for (var _i = 0, _a = this.literalMap.entries(); _i < _a.length; _i++) {
            var pair = _a[_i];
            pairFunc(pair);
        }
    };
    /**
     * Returns a string representation of this Clause.
     */
    Clause.prototype.toString = function () {
        var str = Array.from(this.literalMap.entries()).map(function (pair) {
            var variable = pair[0], value = pair[1];
            return value ? variable : "not ".concat(variable);
        }).join(" or ");
        return str;
    };
    return Clause;
}());
exports.Clause = Clause;
