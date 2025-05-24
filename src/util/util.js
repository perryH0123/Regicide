"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combinationsOfArray = combinationsOfArray;
exports.triggerMouseEvent = triggerMouseEvent;
var node_assert_1 = require("node:assert");
/**
 * Given an array of elements, return an array of all possible subsets of length items from the array
 * @param collection Array to find subsets in
 * @param length Desired length
 * @returns An array of subset arrays, consisting of referential elements from the source array
 */
function combinationsOfArray(collection, length) {
    (0, node_assert_1.default)(Number.isInteger(collection.length));
    (0, node_assert_1.default)(length <= collection.length);
    (0, node_assert_1.default)(length > 0);
    if (length === collection.length)
        return [collection];
    var allCombinations = [];
    function combinationsRecursive(start, currentCombination) {
        var _a;
        if (start === void 0) { start = 0; }
        if (currentCombination === undefined) {
            currentCombination = [];
        }
        if (currentCombination.length === length) {
            allCombinations.push(currentCombination);
            return allCombinations;
        }
        for (var i = start; i < collection.length; i++) {
            var newCombination = currentCombination.slice();
            // add the ith element
            newCombination.push((_a = collection[i]) !== null && _a !== void 0 ? _a : node_assert_1.default.fail());
            combinationsRecursive(i + 1, newCombination);
        }
        // if we got to this point, no new combinations were found before we hit a base case, just
        //return what we have
        return allCombinations;
    }
    return combinationsRecursive();
}
function triggerMouseEvent(node, eventType) {
    var clickEvent = new Event(eventType, { bubbles: true, cancelable: true });
    node.dispatchEvent(clickEvent);
}
