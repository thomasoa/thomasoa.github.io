import * as C from "./constants.js";
var Holding = /** @class */ (function () {
    function Holding(ranks) {
        this.ranks = ranks;
        this.length = ranks.length;
        this.bits = ranks.reduce(function (binary, rank) { return rank.bit | binary; }, 0);
    }
    Holding.prototype.asString = function (divider) {
        if (this.length == 0) {
            return '-';
        }
        return this.ranks.map(function (rank) { return rank.brief; }).join(divider);
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
    Hand.prototype.spades = function () { return this.suit(C.Suits.spades); };
    Hand.prototype.hearts = function () { return this.suit(C.Suits.hearts); };
    Hand.prototype.diamonds = function () { return this.suit(C.Suits.diamonds); };
    Hand.prototype.clubs = function () { return this.suit(C.Suits.clubs); };
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
var Deal = /** @class */ (function () {
    function Deal(toWhom, hands) {
        this.toWhom = toWhom;
        this.hands = hands;
    }
    Deal.prototype.hand = function (seat) {
        return this.hands[seat.order];
    };
    Deal.prototype.north = function () { return this.hand(C.Seats.north); };
    Deal.prototype.east = function () { return this.hand(C.Seats.east); };
    Deal.prototype.south = function () { return this.hand(C.Seats.south); };
    Deal.prototype.west = function () { return this.hand(C.Seats.west); };
    Deal.prototype.eachHand = function (method) {
        var _this = this;
        C.Seats.all.forEach(function (seat) { return method(seat, _this.hands[seat.order]); });
    };
    return Deal;
}());
export { Holding, Hand, Deal };
