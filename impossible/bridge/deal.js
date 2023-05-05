import { Deck, Seats } from "./constants.js";
var Holding = /** @class */ (function () {
    function Holding(ranks) {
        this.ranks = ranks;
        this.bits = ranks.reduce(function (binary, rank) { return rank.bit | binary; }, 0);
    }
    Object.defineProperty(Holding.prototype, "length", {
        get: function () { return this.ranks.length; },
        enumerable: false,
        configurable: true
    });
    Holding.prototype.asString = function (divider) {
        if (divider === void 0) { divider = ''; }
        if (this.length == 0) {
            return '-';
        }
        return this.ranks.map(function (rank) { return rank.brief; }).join(divider);
    };
    Holding.prototype.isVoid = function () {
        return this.length == 0;
    };
    Holding.prototype.toString = function () {
        return this.asString(' ');
    };
    Holding.prototype.has = function (rank) {
        return (this.bits & rank.bit) != 0;
    };
    Holding.forString = function (text) {
        return new Holding(Deck.ranksByText(text));
    };
    return Holding;
}());
var Hand = /** @class */ (function () {
    function Hand(cards) {
        this.cards = cards;
        var suits = Deck.suits.all.map(function () { return new Array(); });
        this.cards.forEach(function (card) {
            suits[card.suit.order].push(card.rank);
        });
        this.holdings = suits.map(function (ranks) { return new Holding(ranks); });
    }
    Hand.prototype.suit = function (suit) {
        return this.holdings[suit.order];
    };
    Object.defineProperty(Hand.prototype, "spades", {
        get: function () { return this.suit(Deck.suits.spades); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Hand.prototype, "hearts", {
        get: function () { return this.suit(Deck.suits.hearts); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Hand.prototype, "diamonds", {
        get: function () { return this.suit(Deck.suits.diamonds); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Hand.prototype, "clubs", {
        get: function () { return this.suit(Deck.suits.clubs); },
        enumerable: false,
        configurable: true
    });
    Hand.prototype.has = function (card) {
        return this.suit(card.suit).has(card.rank);
    };
    Hand.prototype.toString = function () {
        return this.holdings.map(function (h) { return h.asString(''); }).join(' ');
    };
    Hand.prototype.eachSuit = function (method) {
        this.holdings.forEach(function (holding, index) { return method(Deck.suits.all[index], holding); });
    };
    Hand.forHoldings = function (holdings) {
        if (holdings.length != 4) {
            throw new Error('Should be exactly four holdings');
        }
        var cards = new Array();
        holdings.forEach(function (h, suitNum) {
            var suit = Deck.suits.all[suitNum];
            h.ranks.forEach(function (rank) {
                cards.push(Deck.card(suit, rank));
            });
        });
        return new Hand(cards);
    };
    Hand.forString = function (handString) {
        var match = handString.match(/^ *S:?([^SHDC]*)H:?([^SHDC]*)D:?([^SHDC]*)C:?([^SHDC]*)$/);
        if (match) {
            var holdings = [match[1], match[2], match[3], match[4]].map(function (s) { return Holding.forString(s.trim()); });
            return Hand.forHoldings(holdings);
        }
        throw Error('Invalid hand string: ' + handString);
    };
    return Hand;
}());
function buildHands(toWhom) {
    var cards = Array.from({ length: 4 }, function () { return new Array(0); });
    toWhom.forEach(function (seat, cardNum) {
        cards[seat.order].push(Deck.cards[cardNum]);
    });
    return cards.map(function (handCards) { return new Hand(handCards); });
}
var Deal = /** @class */ (function () {
    function Deal(toWhom) {
        this.toWhom = toWhom;
        this.hands = buildHands(toWhom);
    }
    Deal.prototype.hand = function (seat) {
        return this.hands[seat.order];
    };
    Object.defineProperty(Deal.prototype, "north", {
        get: function () { return this.hand(Seats.north); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Deal.prototype, "east", {
        get: function () { return this.hand(Seats.east); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Deal.prototype, "south", {
        get: function () { return this.hand(Seats.south); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Deal.prototype, "west", {
        get: function () { return this.hand(Seats.west); },
        enumerable: false,
        configurable: true
    });
    Deal.prototype.eachHand = function (method) {
        //var hands=this.hands;
        //Seats.all.forEach((seat)=> method(seat,hands[seat.order]))
        this.hands.forEach(function (hand, index) { return method(Seats.all[index], hand); });
    };
    Deal.prototype.eachCard = function (method) {
        this.toWhom.forEach(function (seat, index) { return method(Deck.cards[index], seat); });
    };
    Deal.prototype.equals = function (other) {
        return (this.toWhom.length == other.toWhom.length) &&
            this.toWhom.every(function (seat, index) { return seat == other.toWhom[index]; });
    };
    return Deal;
}());
export { Holding, Hand, Deal };
