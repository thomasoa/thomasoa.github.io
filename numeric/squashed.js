import { choose } from "./choose.js";
function encode(sortedValues) {
    var binomials = sortedValues.map(function (value, index) { return choose(value, index + 1); });
    return binomials.reduce(function (sum, current) { return sum + current; });
}
function largestLessThan(index, n) {
    var k = n - 1;
    while (choose(k + 1, n) <= index) {
        k = k + 1;
    }
    return k;
}
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
