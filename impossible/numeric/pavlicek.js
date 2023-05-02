import { NumericDeal, // classes
bridgeSignature } from './deal.js';
var Range = /** @class */ (function () {
    function Range(start, width) {
        this.start = start;
        this.width = width;
    }
    Object.defineProperty(Range.prototype, "last", {
        get: function () { return this.start + this.width; },
        enumerable: false,
        configurable: true
    });
    Range.prototype.contains = function (num) {
        return num >= this.start && num < this.last;
    };
    Range.prototype.computeWidth = function (numerator, denominator) {
        return this.width * BigInt(numerator) / BigInt(denominator);
    };
    return Range;
}());
var Remaining = /** @class */ (function () {
    function Remaining(perSeat, total) {
        this.perSeat = Array.from(perSeat);
        this.toWhom = new Array(total);
        this.total = total;
    }
    Remaining.prototype.checkedNextRange = function (range, pageNo, card) {
        var nextStart = range.start;
        for (var seat = 0; seat < this.perSeat.length; seat++) {
            var cards = this.perSeat[seat];
            var width = range.computeWidth(cards, this.total);
            var nextRange = new Range(nextStart, width);
            if (nextRange.contains(pageNo)) {
                this.toWhom[card] = seat;
                this.total--;
                this.perSeat[seat]--;
                return nextRange;
            }
            nextStart = nextStart + width;
        }
        throw new Error('Could not find seat for card ' + card + ' and page ' + pageNo);
    };
    Remaining.prototype.nextRange = function (range, pageNo, card) {
        /**
        * Used when computing a deal from a page number
        */
        if (!range.contains(pageNo)) {
            throw new Error('Invalid page number ' + (pageNo.toString()));
        }
        return this.checkedNextRange(range, pageNo, card);
    };
    Remaining.prototype.nextCard = function (card, seat, range) {
        /**
        * Used when computing a page number from a deal
        */
        var skip = 0;
        for (var skipSeat = 0; skipSeat < seat; skipSeat++) {
            skip += this.perSeat[skipSeat];
        }
        var newStart = range.start + range.computeWidth(skip, this.total);
        var width = range.computeWidth(this.perSeat[seat], this.total);
        this.total -= 1;
        this.perSeat[seat] -= 1;
        return new Range(newStart, width);
    };
    return Remaining;
}());
var PavlicekStrategy = /** @class */ (function () {
    function PavlicekStrategy(signature) {
        if (signature === void 0) { signature = bridgeSignature; }
        this.signature = signature;
    }
    Object.defineProperty(PavlicekStrategy.prototype, "pages", {
        get: function () { return this.signature.pages; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PavlicekStrategy.prototype, "lastPage", {
        get: function () { return this.signature.lastPage; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PavlicekStrategy.prototype, "baseRange", {
        /**
        * The range for all pages for this strategy
        */
        get: function () {
            return new Range(BigInt(0), this.pages);
        },
        enumerable: false,
        configurable: true
    });
    PavlicekStrategy.prototype.computePageContent = function (pageNo) {
        this.signature.assertValidPageNo(pageNo);
        var sig = this.signature;
        var remaining = new Remaining(sig.perSeat, sig.cards);
        var range = this.baseRange;
        for (var card = 0; card < sig.cards; card++) {
            range = remaining.nextRange(range, pageNo, card);
        }
        return new NumericDeal(sig, remaining.toWhom);
    };
    PavlicekStrategy.prototype.validateSignature = function (deal) {
        if (!this.signature.equals(deal.signature)) {
            throw new Error('Mismatched signatures for Deal and PavlicekStrategy');
        }
    };
    PavlicekStrategy.prototype.computePageNumber = function (deal) {
        this.validateSignature(deal);
        var range = this.baseRange;
        var remaining = new Remaining(deal.signature.perSeat, deal.signature.cards);
        deal.toWhom.forEach(function (seat, card) {
            range = remaining.nextCard(card, seat, range);
        });
        if (range.width != BigInt(1)) {
            // Shouldn't normally be reached
            throw new Error('Got range width ' + range.width.toString() + ' after decode');
        }
        return range.start;
    };
    return PavlicekStrategy;
}());
export { PavlicekStrategy };
