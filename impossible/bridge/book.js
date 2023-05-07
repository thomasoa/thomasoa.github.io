import { Deck } from "./constants";
import { NumericDeal, bridgeSignature } from "../numeric/index";
import { SimpleBijection, defaultBijectionCard, defaultBijectionSeat } from './bijection';
import { Deal } from "./deal";
function validate_signature(signature) {
    if (!bridgeSignature.equals(signature)) {
        throw new TypeError('Invalid signature');
    }
}
var BridgeBook = /** @class */ (function () {
    function BridgeBook(strategy, seatBijection, cardBijection) {
        if (seatBijection === void 0) { seatBijection = defaultBijectionSeat; }
        if (cardBijection === void 0) { cardBijection = defaultBijectionCard; }
        validate_signature(strategy.signature);
        this.strategy = strategy;
        this.seatBijection = seatBijection;
        this.cardBijection = cardBijection;
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
            throw RangeError('Invalid page number ' + pageNo + ', must be between 1 and ' + this.lastPage);
        }
        var numDeal = this.strategy.computePageContent(pageNo - BigInt(1));
        var seatMap = this.seatBijection;
        var cardMap = this.cardBijection;
        var toWhom = new Array(Deck.cards.all.length);
        numDeal.toWhom.forEach(function (seatNum, cardNum) {
            var seat = seatMap.mapTo(seatNum);
            var card = cardMap.mapTo(cardNum);
            toWhom[card.order] = seat;
        });
        return new Deal(toWhom);
    };
    BridgeBook.prototype.numericDeal = function (deal) {
        var toWhom = new Array(52);
        var cardMap = this.cardBijection;
        var seatMap = this.seatBijection;
        deal.eachCard(function (card, seat) {
            var seatNum = seatMap.mapFrom(seat);
            var cardNum = cardMap.mapFrom(card);
            toWhom[cardNum] = seatNum;
        });
        return new NumericDeal(this.strategy.signature, toWhom);
    };
    BridgeBook.prototype.getPageNumber = function (deal) {
        var numericDeal = this.numericDeal(deal);
        return this.strategy.computePageNumber(numericDeal) + BigInt(1);
    };
    return BridgeBook;
}());
export { BridgeBook, SimpleBijection, validate_signature };
