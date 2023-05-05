import { DealSignature, PavlicekStrategy, NumericDeal } from "../numeric/index.js";
import * as squashed from '../numeric/squashed.js';
import { choose } from "../numeric/choose.js";
import { defaultBijectionCard } from './bijection.js';
import { Hand } from "./deal.js";
var AndrewsHandBook = /** @class */ (function () {
    function AndrewsHandBook(bijection) {
        if (bijection === void 0) { bijection = defaultBijectionCard; }
        this.cardBijection = bijection;
        this.pages = choose(52, 13);
    }
    Object.defineProperty(AndrewsHandBook.prototype, "lastPage", {
        get: function () {
            return this.pages;
        },
        enumerable: false,
        configurable: true
    });
    AndrewsHandBook.prototype.assertValidPage = function (pageNo) {
        if (pageNo < BigInt(1) || pageNo > this.pages) {
            throw new Error('Page out of bounds: ' + pageNo);
        }
    };
    AndrewsHandBook.prototype.getHand = function (pageNo) {
        this.assertValidPage(pageNo);
        var bijection = this.cardBijection;
        var cards = squashed.decode(pageNo - BigInt(1), 13).map(function (cardNum) { return bijection.mapTo(cardNum); });
        return new Hand(cards);
    };
    AndrewsHandBook.prototype.getPageNumber = function (hand) {
        var bijection = this.cardBijection;
        var sequence = hand.cards.map(function (c) { return bijection.mapFrom(c); });
        return squashed.encode(sequence) + BigInt(1);
    };
    return AndrewsHandBook;
}());
var PavlicekHandBook = /** @class */ (function () {
    function PavlicekHandBook(bijection) {
        if (bijection === void 0) { bijection = defaultBijectionCard; }
        var signature = new DealSignature([13, 39]);
        this.strategy = new PavlicekStrategy(signature);
        this.cardBijection = bijection;
    }
    Object.defineProperty(PavlicekHandBook.prototype, "pages", {
        get: function () {
            return this.strategy.pages;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PavlicekHandBook.prototype, "lastPage", {
        get: function () {
            return this.pages;
        },
        enumerable: false,
        configurable: true
    });
    PavlicekHandBook.prototype.assertValidPage = function (pageNo) {
        if (pageNo < BigInt(1) || pageNo > this.pages) {
            throw new Error('Page out of bounds: ' + pageNo);
        }
    };
    PavlicekHandBook.prototype.getHand = function (pageNo) {
        this.assertValidPage(pageNo);
        var bijection = this.cardBijection;
        var toWhom = this.strategy.computePageContent(pageNo - BigInt(1)).toWhom;
        var cards = new Array(13);
        toWhom.forEach(function (whom, cardNum) {
            if (whom === 0)
                cards.push(bijection.mapTo(cardNum));
        });
        return new Hand(cards);
    };
    PavlicekHandBook.prototype.getPageNumber = function (hand) {
        var bijection = this.cardBijection;
        var sequence = hand.cards.map(function (c) { return bijection.mapFrom(c); });
        var toWhom = new Array(52);
        for (var i = 0; i < 52; i++)
            toWhom[i] = 1;
        sequence.forEach(function (cardNum) {
            toWhom[cardNum] = 0;
        });
        var deal = new NumericDeal(this.strategy.signature, toWhom);
        return BigInt(1) + this.strategy.computePageNumber(deal);
    };
    return PavlicekHandBook;
}());
export { AndrewsHandBook, PavlicekHandBook };
