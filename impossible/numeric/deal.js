// Common numeric deal logic and types
import { multinomial, choose } from "./choose.js";
var DealSignature = /** @class */ (function () {
    function DealSignature(cardsPerSeat) {
        this.perSeat = Array.from(cardsPerSeat);
        this.seats = cardsPerSeat.length;
        this.cards = cardsPerSeat.reduce(function (total, nextVal) { return total + nextVal; });
        this.pages = multinomial(cardsPerSeat);
    }
    Object.defineProperty(DealSignature.prototype, "lastPage", {
        get: function () {
            return this.pages - BigInt(1);
        },
        enumerable: false,
        configurable: true
    });
    DealSignature.prototype.toString = function () {
        return 'DealSignature(' + this.perSeat.toString() + ')';
    };
    DealSignature.prototype.validSeat = function (seatNum) {
        return seatNum >= 0 && seatNum < this.seats;
    };
    DealSignature.prototype.validHands = function (hands) {
        return (hands.length == this.seats) &&
            this.perSeat.every(function (len, seatNum) { return len == hands[seatNum].length; });
    };
    DealSignature.prototype.equals = function (otherSig) {
        if (this === otherSig) {
            return true;
        }
        if (this.seats != otherSig.seats) {
            return false;
        }
        return this.perSeat.every(function (value, index) { return value == otherSig.perSeat[index]; });
    };
    Object.defineProperty(DealSignature.prototype, "bits", {
        get: function () {
            this._bits = this._bits || this.computeBits();
            return this._bits;
        },
        enumerable: false,
        configurable: true
    });
    DealSignature.prototype.assertEqual = function (otherSig, message) {
        if (message === void 0) { message = "Unmatching deal signature"; }
        if (this.equals(otherSig)) {
            return;
        }
        throw new TypeError(message + ": Expected " + this.toString() + ", got " + otherSig.toString());
    };
    DealSignature.prototype.assertValidPageNo = function (pageNo) {
        if (pageNo >= this.pages || pageNo < BigInt(0)) {
            throw new RangeError("Invalid page " + pageNo + " outside range <=" + this.pages.toString());
        }
    };
    DealSignature.prototype.computeBits = function () {
        var bits = 0;
        var pages = this.pages;
        var two = BigInt(2);
        while (pages > BigInt(0)) {
            bits++;
            pages /= two;
        }
        return bits;
    };
    return DealSignature;
}());
var HandSignature = /** @class */ (function () {
    function HandSignature(handLength, deckLength) {
        this.handLength = handLength;
        this.cards = deckLength;
        this.pages = choose(deckLength, handLength);
    }
    Object.defineProperty(HandSignature.prototype, "lastPage", {
        get: function () { return this.pages - BigInt(1); },
        enumerable: false,
        configurable: true
    });
    HandSignature.prototype.assertValidCard = function (card) {
        if (card < 0 || card >= this.cards) {
            throw new TypeError('Invalid card number ' + card + ', should be between 0 and ' + (this.cards - 1));
        }
    };
    HandSignature.prototype.assertValidPage = function (pageNo, adjust) {
        if (adjust === void 0) { adjust = BigInt(0); }
        if (pageNo < BigInt(0) || pageNo >= this.pages) {
            throw new Error('Page out of bounds: ' + (pageNo + adjust));
        }
    };
    HandSignature.prototype.assertValidHand = function (numbers) {
        if (numbers.length != this.handLength) {
            throw new Error('Expected ' + this.handLength + ' cards, got ' + numbers.length);
        }
        var last = -1;
        for (var i = 0; i < numbers.length; i++) {
            var card = numbers[i];
            if (card <= last) {
                throw new TypeError('Expected sorted list of card numbers');
            }
            this.assertValidCard(card);
            last = card;
        }
        // TODO check cards are distinct
    };
    return HandSignature;
}());
/**
 * A standard bridge signature - four seats, each seat getting 13 cards
 */
var bridgeSignature = new DealSignature([13, 13, 13, 13]);
function buildHands(signature, toWhom) {
    var hands = signature.perSeat.map(function () { return new Array(0); });
    toWhom.forEach(function (seat, card) {
        if (signature.validSeat(seat)) {
            hands[seat].push(card);
        }
        else {
            throw RangeError('Invalid seat ' + seat + ' for deal in with ' + signature.seats + ' seats');
        }
    });
    return hands;
}
/**
 *  A deal which matches a signature
 *
 * Cards in a NumericDeal are just indexes from zero to one
 * less than the number of cards in the signature. No meaning
 * is implied by the seat numbers - they will be mapped in
 * the bridge package.
 */
var NumericDeal = /** @class */ (function () {
    function NumericDeal(sig, toWhom) {
        if (toWhom.length != sig.cards) {
            throw TypeError('Wrong number of cards in deal. Expected'
                + sig.cards + ', got ' + toWhom.length);
        }
        this.signature = sig;
        this.toWhom = Array.from(toWhom);
        this.hands = buildHands(sig, toWhom);
        this.validateSignature();
    }
    NumericDeal.prototype.validateSignature = function () {
        if (!this.signature.validHands(this.hands)) {
            throw new TypeError('Invalid deal signature');
        }
    };
    return NumericDeal;
}());
var bridgeHandSignature = new HandSignature(13, 52);
export { DealSignature, HandSignature, NumericDeal, // classes
bridgeSignature, bridgeHandSignature };
