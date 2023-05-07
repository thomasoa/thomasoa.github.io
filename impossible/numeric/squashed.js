import { choose } from "./choose";
/**
* The squashed order is a total order on all sets of n
* natural number. For example, when n=3, the order start:
*     012,013,023,123,014,024,034,124,134,234,...
*
* The order has a convenient feature that we can find the index
* of a set in this order just from the set.
*/
/**
* Compute the index in the squashed order for a set of values
*
* @param sortedValues - a set of sorted values
* @returns bigint index of the set of values in the squashed order
*
* Assumes the sortedValues are sorted and distinct - nothing
* ensures this.
*/
function encode(sortedValues) {
    var binomials = sortedValues.map(function (value, index) { return choose(value, index + 1); });
    return binomials.reduce(function (sum, current) { return sum + current; });
}
/**
 * Find the largest value k such that (k chooose n)<index
 *
 * @param index
 * @param n
 * @returns The largest value k
 */
function largestLessThan(index, n) {
    var k = n - 1;
    while (choose(k + 1, n) <= index) {
        k = k + 1;
    }
    return k;
}
/**
 * Find the set of size n of the given index in the squashed order.
 *
 * @param index - the index
 * @param n - the size of the sets
 * @returns a sorted array of distinct natural numbers
 */
function decode(index, n) {
    // Compute the n-subset of the natural numbers with the
    // given index.
    var result = Array(n);
    while (n > 0) {
        result[n - 1] = largestLessThan(index, n);
        index -= choose(result[n - 1], n);
        n = n - 1;
    }
    return result;
}
export { encode, decode };
