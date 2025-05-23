import assert from "node:assert";
class ContradictionError extends Error {}

const DEFAULT_HUERISTIC = (clauses: Clause[]) => {
    const variableMap: Map<string, number> = new Map();
    clauses.forEach(c => c.variables().forEach(variable => {
        const prev = variableMap.get(variable);
        if (prev === undefined) variableMap.set(variable, 1);
        else variableMap.set(variable, prev+1);
    }));
    const varNames = Array.from(variableMap.keys()).sort((a,b) => 
        (variableMap.get(a) ?? assert.fail("should not get here")) 
        - (variableMap.get(b) ?? assert.fail("should not get here"))
    );
    return varNames[0] ?? "NO CLAUSES";
}

/**
 * An immutable SAT-solvable boolean formula in conjunctive normal form (CNF)
 * A formula is the intersection of many Clauses, which much be completely satisfied in order
 * for the formula to be solved.
 */
export class SatFormula {
    private readonly hueristic: (clauses: Clause[]) => string = DEFAULT_HUERISTIC;

    /**
     * Constructs a SAT formula from an array of arrays of 2-tuple representing clauses
     * @param clauses a collection of clauses, where each clause is represented by an array of 2-tuples of a string
     * and its corresponding boolean value
     * @param hueristic A hueristic, that when provided an array of clauses, returns a string name of a variable
     * to test given the formula. For the formula to not encounter any cycles, the hueristic function must produce a unique
     * literal name that is included in the formula if the formula is unsolved.
     * @returns A SatFormula representing the result of the encoding of the conjunction
     * @throws ContradictionError if a contradiction is discovered in any clause
     */
    public static buildFormula(clauses: [string, boolean][][], hueristic?: (clauses: Clause[]) => string): SatFormula {
        const clauseObjs = clauses.filter(Boolean).map(arr => new Clause(arr)); // make sure no empty clauses are present
        return new SatFormula(clauseObjs, hueristic);
    }

    private constructor(private readonly clauses: Clause[], hueristic?: (clauses: Clause[]) => string) {
        if (hueristic) this.hueristic = hueristic;
    }

    private updateFormula(testVar: string, testVal: boolean): SatFormula {
        const newClauses = this.clauses.map(c => c.update(testVar, testVal)).filter(c => c !== undefined);
        return new SatFormula(newClauses, this.hueristic);
    }


    /**
     * Detemines if this formula is solved (ie: has no clauses)
     * @returns true iff the formula is solved
     */
    private solved(): boolean {
        return !this.clauses.length;
    }

    /**
     * Determines if the formula is solvable in its current state
     * @returns true if the formula is able to be potentially solved
     */
    private solvable(): boolean {
        return this.clauses.reduce((acc, current) => {
            return acc && current.solvable();
        }, true);
    }

    /**
     * If the formula is solvable, returns a Map of variables to their corresponding values.
     * @returns undefined if the formula is not possible to solve, otherwise a map corresponding to a variable assignment
     * that is sufficient to satisfy the formula. The formula need not be fully defined for all variables present in the formula
     * @throws Error if a unit clause is not found and the hueristic function does not produce a literal required in any clause
     */
    public satisfyingAssignment(): Map<string, boolean> | undefined {
        return this._satisfyingAssignment();
    }


    /**
     * Helper method for satisfyingAssignment
     * @param sofar Current map that we are trying
     * @throws @see {@link satisfyingAssignment}
     * @returns @see {@link satisfyingAssignment}
     */
    private _satisfyingAssignment(sofar?: Map<string, boolean>): Map<string, boolean> | undefined {
        if (!this.solvable()) return undefined;
        if (!sofar) sofar = new Map();
        if (this.solved()) return sofar;

        // find unit clauses
        for (const clause of this.clauses){
            const pairing = clause.unitClause();
            // if a unit clause is found
            if(pairing){ 
                const [testVar, testVal] = pairing;
                sofar.set(testVar, testVal);
                const newFormula = this.updateFormula(testVar, testVal)
                const resultingMap = newFormula._satisfyingAssignment(sofar);
                return resultingMap?.set(testVar, testVal); // return undefined here if not possible to satisfy
            }
        }
        // recursive backtracking search with hueristic
        const testVar = this.hueristic(this.clauses.slice());
        if(!this.clauses.reduce((val, c) => c.variables().has(testVar) || val, false)) throw new Error(
            "Hueristic didn't generate a variable in the formula, an infinite loop will occur"
        );
        for (const testVal of [true, false]){
            const successfulAssignments = this.updateFormula(testVar, testVal)._satisfyingAssignment(sofar);
            if(successfulAssignments){
                return successfulAssignments.set(testVar, testVal);
            }
        }
        return undefined;   
    }

    /**
     * Returns a shallow copy of all clauses
     */
    public getClauses(): Clause[]{
        return this.clauses.slice();
    }

    /**
     * @returns a string representation of the formula
     */
    public toString(): string {
        let str = "SatFormula(";
        this.clauses.map(c => `${c.toString()}`).join("\n and")
        return str + "\n)"
    }

}

/**
 * A clause to be stored in a formula
 * Clauses must be solvable and contain no contradiction; contradictions in the same clause are assumed to be
 * the result of clause generation errors and will result in a ContradictionError being thrown
 * The clause is solved when one of its predicates is satisfied
 */
export class Clause {
    private readonly literalMap: Map<string, boolean> = new Map();

    /**
     * Creates a new clause representing the union of many predicates
     * @param literalPairs an array mapping literal pairs to required boolean values. The values need not be unique
     * but cannot contain any contradictions.
     * @throws ContradictionError if a literal and its negation are both present in the clause
     */
    public constructor(literalPairs: Array<[string, boolean]>){
        for (const [variable, value] of literalPairs){
            const existingPairing = this.literalMap.get(variable);
            if (existingPairing !== undefined) {
                if (existingPairing === !value) throw new ContradictionError(`Contradiction on variable ${variable}`);
            } else this.literalMap.set(variable, value);
        }
    }

    /**
     * Returns a new clause or undefined as a result of setting a variable to this value.
     * @param testVar The variable to test. If not present in the clause, the statement has no effect
     * @param testVal the value to set the testVar to
     * @returns undefined if the clause is solved, otherwise a clause as the result of setting the variable
     * to the new value
     */
    public update(testVar: string, testVal: boolean): Clause | undefined {
        if (!this.literalMap.has(testVar)) return this; // short-circuit
        const newPairs: Array<[string, boolean]> = [];
        for (const [variable, val] of this.literalMap.entries()) {
            if (variable !== testVar)  newPairs.push([variable, val]);
            else if (val === testVal) return undefined;
        }
        return new Clause(newPairs);
    }

    /**
     * Determines of the clause is solvable
     * @returns true if the clause can potentially be satisfied
     */
    public solvable(){
        return this.literalMap.size > 0;
    }

    /**
     * Returns a list of variables present in the formula
     */
    public variables(): Set<string> {
        return new Set(this.literalMap.keys());
    }

    /**
     * If the clause consists of only one literal, return its required literal pair
     * @returns a pair of a lteral and its required value to satisfy this clause
     */
    public unitClause(): [string, boolean] | undefined {
        if (this.literalMap.size === 1){
            const variable = this.literalMap.keys().next().value ?? assert.fail();
            return [variable, this.literalMap.get(variable) ?? assert.fail()];
        }
        return undefined
    }

    public forEach(pairFunc: (pair: [string, boolean]) => void): void {
        for (const pair of this.literalMap.entries()) pairFunc(pair);
    }

    /**
     * Returns a string representation of this Clause.
     */
    public toString(){
        let str = Array.from(this.literalMap.entries()).map(pair => {
            const [variable, value] = pair;
            return value ? variable : `not ${variable}`
        }).join(" or ");
        return str;
    }
}