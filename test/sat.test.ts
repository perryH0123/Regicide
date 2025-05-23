import { SatFormula, Clause } from "../src/sat/Sat.js";
import assert from "node:assert";
import fs from "node:fs/promises";

function testSatisfaction(formula: SatFormula){
    const assignment = formula.satisfyingAssignment() ?? assert.fail("Assignment should exist");
    formula.getClauses().forEach(c => {
        let clauseSatisfied = false;
        c.forEach(([variable, value]) => {
            if(assignment.has(variable)){
                clauseSatisfied ||= (assignment.get(variable) === value);
            }
        })
        assert(clauseSatisfied, `invalid assignment ${assignment}`);
    })
}

describe("satFormula", function(){
    // Testing strategy:
    // buildFormula:
    //   partition on input:
    //      empty array
    //      contradictive clause
    //      well-formed nonempty clause (including duplicate pairs)
    //   hueristic:
    //      undefined
    //      hueristic provided
    // satisfyingAssignment:
    //   partition on this:
    //      unsolvable formula
    //      empty formula
    //      nonempty formula
    //   pseudopartition on formula:
    //      requires backtrack
    //      does not require backtrack
    //      solution does not exist

    it("returns an empty assignment given an empty formula, undefined hueristic", function(){
        const formula = SatFormula.buildFormula([]);
        testSatisfaction(formula);
        const map = formula.satisfyingAssignment() ?? assert.fail();
        assert(map.size === 0);
    });

    it("rejects an unsolvable formula with a contradiction", function(){
        assert.throws(() => SatFormula.buildFormula([
            [["a", false], ["a", true]]
        ]));
    });

    it("backtracks (with a hueristic that forces backtracking", function(){
        const hueristic = (clauses: Clause[]) => {
            const firstClause = clauses[0];
            if (firstClause !== undefined) {
                const varsInOrder = Array.from(firstClause.variables()).sort();
                const firstVar = varsInOrder[0];
                if (firstVar) return firstVar;
            }
            return "NO CLAUSES"
        }
        // will attempt to solve a before b, where setting a to true leads to clause b being unable to solve
        const formula = SatFormula.buildFormula(
            [
                [["a", true], ["b", true]],
                [["a", false], ["b", false], ["c", true]],
                [["b", true], ["c", true]],
                [["b", true], ["c", false]],
            ], hueristic
        );
        testSatisfaction(formula);
    });

    it("does not return an assignment given an impossible formula", function(){
        const formula = SatFormula.buildFormula(
            [
                [["a", true]],
                [["a", false]]
            ]
        )
        assert.strictEqual(formula.satisfyingAssignment(), undefined);
    });

    it("does not cache a map alias", function(){
        const formula = SatFormula.buildFormula(
            [
                [["a", true], ["a", true]],
                [["b", false]]
            ]
        )
        testSatisfaction(formula);
        const assignment = formula.satisfyingAssignment() ?? assert.fail();
        assignment.set("a", false);
        testSatisfaction(formula);
    });

    it("handles a deep backtrack", function(){
        const formula = SatFormula.buildFormula(
            [
                [["a", true], ["a", true]],
                [["b", false]]
            ]
        )
        testSatisfaction(formula);
        const assignment = formula.satisfyingAssignment() ?? assert.fail();
        assignment.set("a", false);
        testSatisfaction(formula);
    });

    it("solves a large SAT problem", async function(){
        const file = await fs.readFile("test/sat_test/large_sat_1.json", {encoding: 'utf-8'});
        const input: [string, boolean][][] = JSON.parse(file);
        testSatisfaction(SatFormula.buildFormula(input));
    }).timeout(500);

    it("solves a huge SAT problem", async function(){
        const file = await fs.readFile("test/sat_test/huge_sat_1.json", {encoding: 'utf-8'});
        const input: [string, boolean][][] = JSON.parse(file);
        testSatisfaction(SatFormula.buildFormula(input));
    }).timeout(2000);

    it("determines a huge SAT problem is unsolvable", async function(){
        const file = await fs.readFile("test/sat_test/huge_unsolvable.json", {encoding: 'utf-8'});
        const input: [string, boolean][][] = JSON.parse(file);
        assert.strictEqual(SatFormula.buildFormula(input).satisfyingAssignment(), undefined);
    }).timeout(2000);

    it("fails on a faulty hueristic", function(){
        const formula = SatFormula.buildFormula(
            [
                [["a", true], ["b", true]],
                [["b", false], ["a", false]]
            ], () => "c"
        );
        assert.throws(() => formula.satisfyingAssignment());
    });
});