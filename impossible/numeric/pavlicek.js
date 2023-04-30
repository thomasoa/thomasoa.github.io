var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { signature_or_default, NumericDeal } from './deal.js';
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
    Range.prototype.contain = function (num) {
        return num >= this.start && num < this.last;
    };
    return Range;
}());
var Remaining = /** @class */ (function () {
    function Remaining(perSeat, total) {
        this.perSeat = __spreadArray([], perSeat, true);
        this.toWhom = new Array(total);
        this.total = total;
    }
    Remaining.prototype.nextRange = function (range, pageNo, card) {
        /**
         * Used when computing a deal from a page number
         */
        var nextStart = range.start;
        for (var seat = 0; seat < this.perSeat.length; seat++) {
            var cards = this.perSeat[seat];
            var width = range.width * BigInt(cards) / BigInt(this.total);
            if (nextStart + width > pageNo) {
                this.toWhom[card] = seat;
                this.total--;
                this.perSeat[seat]--;
                return new Range(nextStart, width);
            }
            nextStart = nextStart + width;
        }
        throw new Error('Invalid page number ' + (pageNo.toString()));
    };
    Remaining.prototype.nextCard = function (card, seat, range) {
        /**
         * Used when computing a page number from a deal
         */
        var skip = 0;
        for (var skipSeat = 0; skipSeat < seat; skipSeat++) {
            skip += this.perSeat[skipSeat];
        }
        var newStart = range.start + range.width * BigInt(skip) / BigInt(this.total);
        var width = range.width * BigInt(this.perSeat[seat]) / BigInt(this.total);
        this.total -= 1;
        this.perSeat[seat] -= 1;
        return new Range(newStart, width);
    };
    return Remaining;
}());
var PavlicekStrategy = /** @class */ (function () {
    function PavlicekStrategy(signature) {
        this.signature = signature_or_default(signature);
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
    PavlicekStrategy.prototype.computePageContent = function (pageNo) {
        var sig = this.signature;
        var remaining = new Remaining(sig.perSeat, sig.cards);
        var range = new Range(BigInt(0), sig.pages);
        for (var card = 0; card < sig.cards; card++) {
            range = remaining.nextRange(range, pageNo, card);
        }
        return new NumericDeal(sig, remaining.toWhom);
    };
    PavlicekStrategy.prototype.computePageNumber = function (deal) {
        var range = new Range(BigInt(0), deal.signature.pages);
        var remaining = new Remaining(deal.signature.perSeat, deal.signature.cards);
        deal.toWhom.forEach(function (seat, card) {
            range = remaining.nextCard(card, seat, range);
        });
        if (range.width != BigInt(1)) {
            throw new Error('Got range width ' + range.width.toString() + ' after decode');
        }
        return range.start;
    };
    return PavlicekStrategy;
}());
export { PavlicekStrategy };
