var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// Common numeric deal logic and types
import { multinomial } from "./choose.js";
var DealSignature = /** @class */ (function () {
    function DealSignature(cardsPerSeat) {
        this.perSeat = __spreadArray([], cardsPerSeat, true);
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
    DealSignature.prototype.assertValidPageNo = function (pageNo) {
        if (pageNo >= this.pages || pageNo < BigInt(0)) {
            throw new Error("Invalid page " + pageNo + " outside range <=" + this.pages.toString());
        }
    };
    return DealSignature;
}());
var defaultSignature = new DealSignature([13, 13, 13, 13]);
function signature_or_default(sig) {
    if (sig == undefined) {
        return defaultSignature;
    }
    return sig;
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
        var _this = this;
        if (toWhom.length != sig.cards) {
            throw Error('Wrong number of cards in deal. Expected' + sig.cards + ', got ' + toWhom.length);
        }
        this.signature = sig;
        this.toWhom = __spreadArray([], toWhom, true);
        // Split deal into hands
        this.hands = this.signature.perSeat.map(function (cards, seat) { return Array(0); });
        this.toWhom.forEach(function (seat, card) {
            if (seat >= sig.seats || seat < 0) {
                throw Error('Invalid seat ' + seat + ' for deal in with ' + sig.seats + ' seats');
            }
            _this.hands[seat].push(card);
        });
        sig.perSeat.forEach(function (cards, seat) {
            if (cards != _this.hands[seat].length) {
                throw Error('Wrong number of cards for seat ' + seat + ' expected ' + cards + ' cards');
            }
        });
    }
    return NumericDeal;
}());
export { DealSignature, NumericDeal, //classes
signature_or_default };
