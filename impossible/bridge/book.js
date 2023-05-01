import * as C from "./constants.js";
import { Deal } from "./deal.js";
var defaultCardMap = function (card) { return C.Cards[card]; };
var defaultSeatMap = function (seat) { return C.Seats.all[seat]; };
function validate_signature(signature) {
    var seats = signature.perSeat.length;
    if (seats != 4) {
        throw new Error("Deal strategy signature should be [13,13,13,13], but has " + seats + " seats");
    }
    for (var _i = 0, _a = signature.perSeat; _i < _a.length; _i++) {
        var seatLength = _a[_i];
        if (seatLength != 13) {
            throw new Error("Signature must be [13,13,13,13] but got a seat length of " + seatLength);
        }
    }
}
var BridgeBook = /** @class */ (function () {
    function BridgeBook(strategy, seatMap, cardMap) {
        validate_signature(strategy.signature);
        this.strategy = strategy;
        seatMap = seatMap || defaultSeatMap;
        cardMap = cardMap || defaultCardMap;
        this.seatMap = seatMap;
        this.cardMap = cardMap;
    }
    Object.defineProperty(BridgeBook.prototype, "pages", {
        get: function () { return this.strategy.pages; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BridgeBook.prototype, "lastPage", {
        get: function () { return this.strategy.pages; },
        enumerable: false,
        configurable: true
    });
    BridgeBook.prototype.getDeal = function (pageNo) {
        if (pageNo < BigInt(1) || pageNo > this.lastPage) {
            throw Error('Invalid page number ' + pageNo + ', must be between 1 and ' + this.lastPage);
        }
        var numDeal = this.strategy.computePageContent(pageNo - BigInt(1));
        var seatMap = this.seatMap;
        var cardMap = this.cardMap;
        var toWhom = new Array(C.Cards.length);
        numDeal.toWhom.forEach(function (seatNum, cardNum) {
            var seat = seatMap(seatNum);
            var card = cardMap(cardNum);
            toWhom[card.order] = seat;
        });
        return new Deal(toWhom);
    };
    return BridgeBook;
}());
export { BridgeBook, validate_signature };
