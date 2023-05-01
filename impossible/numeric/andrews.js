//  An entirely numeric version of the book
import { bridgeSignature, NumericDeal } from "./deal.js";
import { choose } from "./choose.js";
import { decode, encode } from './squashed.js';
function computeFactors(cardsPer) {
    var totalCards = 0;
    var totalProduct = BigInt(1);
    var oldProduct = BigInt(1);
    var result = cardsPer.map(function (cards, seat) {
        totalCards += cards;
        oldProduct = totalProduct;
        totalProduct *= choose(totalCards, cards);
        return { quotient: oldProduct, seat: seat, cards: cards };
    });
    return result.slice(1).reverse();
}
function updateSequence(seat, sequence, toWhom, remaining) {
    // seat - the seat we are currently populating
    // sequence - the (sorted) subsequence of indices for this seat
    // toWhom - the deal we are updating
    // remaining - the current sequence of un-dealt cards
    var newRemaining = Array(remaining.length - sequence.length);
    var iSeq = 0;
    var iNewRemaining = 0;
    remaining.forEach(function (card, i) {
        if (iSeq < sequence.length && sequence[iSeq] == i) {
            toWhom[card] = seat;
            iSeq++;
        }
        else {
            newRemaining[iNewRemaining] = card;
            iNewRemaining++;
        }
    });
    return newRemaining;
}
var SequenceBuilder = /** @class */ (function () {
    function SequenceBuilder(seat, cards) {
        this.seat = seat;
        this.sequence = Array(cards);
        this.seqIdx = 0;
        this.afterIndex = 0;
    }
    SequenceBuilder.prototype.nextItem = function (card, whom) {
        if (whom == this.seat) {
            this.sequence[this.seqIdx] = this.afterIndex;
            this.seqIdx++;
        }
        if (whom <= this.seat) {
            this.afterIndex++;
        }
    };
    return SequenceBuilder;
}());
var AndrewsStrategy = /** @class */ (function () {
    function AndrewsStrategy(signature) {
        this.signature = signature || bridgeSignature;
        this.factors = computeFactors(this.signature.perSeat);
    }
    Object.defineProperty(AndrewsStrategy.prototype, "pages", {
        get: function () { return this.signature.pages; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AndrewsStrategy.prototype, "lastPage", {
        get: function () { return this.signature.lastPage; },
        enumerable: false,
        configurable: true
    });
    AndrewsStrategy.prototype.computePageNumber = function (deal) {
        var sig = this.signature;
        var builders = Array(sig.seats - 1);
        for (var i = 1; i < sig.seats; i++) {
            builders[i - 1] = new SequenceBuilder(i, sig.perSeat[i]);
        }
        deal.toWhom.forEach(function (whom, card) {
            return builders.forEach(function (builder) { return builder.nextItem(card, whom); });
        });
        var sum = BigInt(0);
        this.factors.forEach(function (factor) {
            var builder = builders[factor.seat - 1];
            var seqNo = encode(builder.sequence);
            sum += seqNo * factor.quotient;
        });
        return sum;
    };
    AndrewsStrategy.prototype.computePageContent = function (pageNo) {
        // Determine what deal is on the given page number
        var sig = this.signature;
        this.signature.assertValidPageNo(pageNo);
        var toWhom = Array(sig.cards);
        for (var card = 0; card < sig.cards; card++) {
            toWhom[card] = 0; // default
        }
        var indices = toWhom.map(function (val, index) { return index; });
        // Factors are stored in reverse order by seatts, and with
        // no entry for seat 0 because that seat gets all the remaining
        // cards.
        this.factors.forEach(function (factor) {
            var seatIndex = pageNo / factor.quotient;
            pageNo = pageNo % factor.quotient;
            var sequence = decode(seatIndex, factor.cards);
            indices = updateSequence(factor.seat, sequence, toWhom, indices);
        });
        return new NumericDeal(this.signature, toWhom);
    };
    return AndrewsStrategy;
}());
export { AndrewsStrategy, SequenceBuilder };
