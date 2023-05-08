import { defaultBijectionCard } from "./bijection.js";
import { Hand } from "./deal.js";
function assertBridgeHandStrategy(strategy) {
    var sig = strategy.signature;
    if (sig.handLength != 13 || sig.cards != 52) {
        throw new TypeError('Invalid HandStrategy for hand with ' + sig.pages + ' cards from deck of ' + sig.cards);
    }
}
var HandBook = /** @class */ (function () {
    function HandBook(strategy, bijection) {
        if (bijection === void 0) { bijection = defaultBijectionCard; }
        assertBridgeHandStrategy(strategy);
        this.cardBijection = bijection;
        this.strategy = strategy;
    }
    Object.defineProperty(HandBook.prototype, "pages", {
        get: function () { return this.strategy.pages; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HandBook.prototype, "lastPage", {
        get: function () { return this.pages; },
        enumerable: false,
        configurable: true
    });
    HandBook.prototype.getHand = function (pageNo) {
        var pageIndex = pageNo - BigInt(1);
        this.strategy.assertValidPage(pageIndex, BigInt(1));
        var bijection = this.cardBijection;
        var numericCards = this.strategy.computePageContent(pageNo - BigInt(1));
        var cards = numericCards.map(function (cardNum) { return bijection.mapTo(cardNum); });
        return new Hand(cards);
    };
    HandBook.prototype.getPageNumber = function (hand) {
        var bijection = this.cardBijection;
        var sequence = hand.cards.map(function (c) { return bijection.mapFrom(c); });
        return this.strategy.computePageNumber(sequence) + BigInt(1);
    };
    return HandBook;
}());
export { HandBook };
