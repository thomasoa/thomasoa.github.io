/*
 * Basic code to compute binomial coefficients.
 *
 * Caches in a Pascal Triangle of size 52 by default
 */
var ChooseCache = /** @class */ (function () {
    function ChooseCache(size) {
        var _this = this;
        //this.rows = Array<PascalRow>(size+1)
        this.rows = Array.from({ length: size + 1 }, function (v, index) { return _this.blankRow(index); });
    }
    Object.defineProperty(ChooseCache.prototype, "size", {
        get: function () {
            return this.rows.length - 1;
        },
        enumerable: false,
        configurable: true
    });
    ChooseCache.prototype.blankRow = function (rowNum) {
        // We only need half the row
        var columns = Math.floor(rowNum / 2) + 1;
        var row = new Array(columns);
        row[0] = BigInt(1);
        return row;
    };
    ChooseCache.prototype.addRow = function () {
        this.rows.push(this.blankRow(this.size + 1));
    };
    ChooseCache.prototype.row = function (n) {
        while (this.size < n) {
            this.addRow();
        }
        this.rows[n] = this.rows[n] || this.blankRow(n);
        return this.rows[n];
    };
    ChooseCache.prototype.choose = function (n, k) {
        if (2 * k > n) {
            k = n - k;
        }
        if (k < 0) {
            return BigInt(0);
        }
        var row = this.row(n);
        row[k] = row[k] || (this.choose(n - 1, k - 1) + this.choose(n - 1, k));
        return row[k];
    };
    return ChooseCache;
}());
export { ChooseCache };
var DefaultCache = new ChooseCache(52);
for (var k = 0; k <= 26; k++) {
    DefaultCache.choose(52, k);
}
export var choose = function (n, k) { return DefaultCache.choose(n, k); };
export var multinomial = function (parts) {
    var sum = 0;
    var product = BigInt(1);
    parts.forEach(function (k) {
        sum += k;
        product *= choose(sum, k);
    });
    return product;
};
