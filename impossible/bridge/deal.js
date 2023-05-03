import * as C from "./constants.js";
//import * as numeric from "../numeric/deal.js"
//type CardMap = (card:numeric.CardNumber) => C.Card
//type SeatMap = (seat:numeric.SeatNumber) => C.Seat
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
    return Holding;
}());
var Hand = /** @class */ (function () {
    function Hand(cards) {
        this.cards = cards;
        var suits = C.Suits.all.map(function () { return new Array(); });
        this.cards.forEach(function (card) {
            suits[card.suit.order].push(card.rank);
        });
        this.holdings = suits.map(function (ranks) { return new Holding(ranks); });
    }
    Hand.prototype.suit = function (suit) {
        return this.holdings[suit.order];
    };
    Object.defineProperty(Hand.prototype, "spades", {
        get: function () { return this.suit(C.Suits.spades); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Hand.prototype, "hearts", {
        get: function () { return this.suit(C.Suits.hearts); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Hand.prototype, "diamonds", {
        get: function () { return this.suit(C.Suits.diamonds); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Hand.prototype, "clubs", {
        get: function () { return this.suit(C.Suits.clubs); },
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
        this.holdings.forEach(function (holding, index) { return method(C.Suits.all[index], holding); });
    };
    return Hand;
}());
function buildHands(toWhom) {
    var cards = Array.from({ length: 4 }, function () { return new Array(0); });
    toWhom.forEach(function (seat, cardNum) {
        cards[seat.order].push(C.Cards[cardNum]);
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
        get: function () { return this.hand(C.Seats.north); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Deal.prototype, "east", {
        get: function () { return this.hand(C.Seats.east); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Deal.prototype, "south", {
        get: function () { return this.hand(C.Seats.south); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Deal.prototype, "west", {
        get: function () { return this.hand(C.Seats.west); },
        enumerable: false,
        configurable: true
    });
    Deal.prototype.eachHand = function (method) {
        //var hands=this.hands;
        //C.Seats.all.forEach((seat)=> method(seat,hands[seat.order]))
        this.hands.forEach(function (hand, index) { return method(C.Seats.all[index], hand); });
    };
    Deal.prototype.eachCard = function (method) {
        this.toWhom.forEach(function (seat, index) { return method(C.Cards[index], seat); });
    };
    return Deal;
}());
export { Holding, Hand, Deal };
