import * as C from "./constants.js";
import { bridgeSignature } from "../numeric/index.js";
import { Deal } from "./deal.js";
var defaultCardMap = function (card) { return C.Cards[card]; };
var defaultSeatMap = function (seat) { return C.Seats.all[seat]; };
function validate_signature(signature) {
    if (!bridgeSignature.equals(signature)) {
        throw new Error('Invalid signaturre');
    }
}
var BridgeBook = /** @class */ (function () {
    function BridgeBook(strategy, seatMap, cardMap) {
        if (seatMap === void 0) { seatMap = defaultSeatMap; }
        if (cardMap === void 0) { cardMap = defaultCardMap; }
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
    BridgeBook.prototype.validPageNumber = function (pageNo) {
        return pageNo >= BigInt(1) && pageNo <= this.lastPage;
    };
    BridgeBook.prototype.getDeal = function (pageNo) {
        if (!this.validPageNumber(pageNo)) {
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
