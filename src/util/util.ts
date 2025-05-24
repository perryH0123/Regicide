/**
 * Given an array of elements, return an array of all possible subsets of length items from the array
 * @param collection Array to find subsets in
 * @param length Desired length
 * @returns An array of subset arrays, consisting of referential elements from the source array
 */
export function combinationsOfArray<T>(collection: Array<T>, length: number): T[][] {
    assert(Number.isInteger(collection.length));
    assert(length <= collection.length);
    assert(length > 0);
    if (length === collection.length) return [collection];

    const allCombinations: T[][] = [];
    function combinationsRecursive(start = 0, currentCombination?: T[]): T[][] {
        if(currentCombination === undefined){
            currentCombination = [];
        }
        if (currentCombination.length === length){
            allCombinations.push(currentCombination);
            return allCombinations;
        }

        for (let i = start; i < collection.length; i++){
            const newCombination = currentCombination.slice();
            // add the ith element
            newCombination.push(collection[i] ?? fail());
            combinationsRecursive(i+1, newCombination);
        }
        // if we got to this point, no new combinations were found before we hit a base case, just
        //return what we have
        return allCombinations;
    }

    return combinationsRecursive();
}

export function triggerMouseEvent(node: Element, eventType: string){
    const clickEvent = new Event(eventType, { bubbles: true, cancelable: true });
    node.dispatchEvent (clickEvent);
}

export function fail(msg?: string): never {
    throw new Error(msg);
}

export function assert(predicate: boolean, msg?: string): void {
    if (!predicate) throw new Error(msg);
}