// Common numeric deal logic and types
import { multinomial } from "./choose.js";
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
    DealSignature.prototype.validSeat = function (seatNum) {
        return seatNum >= 0 && seatNum < this.seats;
    };
    DealSignature.prototype.validHands = function (hands) {
        return (hands.length == this.seats) &&
            this.perSeat.every(function (len, seatNum) { return len == hands[seatNum].length; });
    };
    DealSignature.prototype.assertValidPageNo = function (pageNo) {
        if (pageNo >= this.pages || pageNo < BigInt(0)) {
            throw new Error("Invalid page " + pageNo + " outside range <=" + this.pages.toString());
        }
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
    return DealSignature;
}());
/**
 * A standard bridge signature - four seats, each seat getting 13 cards
 */
var bridgeSignature = new DealSignature([13, 13, 13, 13]);
function buildHands(signature, toWhom) {
    var hands = signature.perSeat.map(function (cards, seat) { return new Array(0); });
    toWhom.forEach(function (seat, card) {
        if (signature.validSeat(seat)) {
            hands[seat].push(card);
        }
        else {
            throw Error('Invalid seat ' + seat + ' for deal in with ' + signature.seats + ' seats');
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
            throw Error('Wrong number of cards in deal. Expected' + sig.cards + ', got ' + toWhom.length);
        }
        this.signature = sig;
        this.toWhom = Array.from(toWhom);
        this.hands = buildHands(sig, toWhom);
        this.validateSignature();
    }
    NumericDeal.prototype.validateSignature = function () {
        if (!this.signature.validHands(this.hands)) {
            throw new Error('Invalid deal signature');
        }
    };
    return NumericDeal;
}());
export { DealSignature, NumericDeal, //classes
bridgeSignature };
