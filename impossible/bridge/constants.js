/**
 * A set of constant describing things related to bridge deals.
 *
 * Types: Seat, Rank, Suit,
 * Class: Card
 * Global: Deck, Seats
 *
 *     Deck.suits.spades:Suit
 *        ...
 *     Deck.suit.clubs:Suit
 *
 *     Deck.suits.all:Suit[] - All of the suits
 *
 *     Deck.ranks.ace, Deck.ranks.king, ... Deck.ranks.two
 *     Deck.ranks.all:Rank[]
 *
 *     Deck.cards: Card[] - All 52 different card values
 *
 *     Deck.card(suit:Suit, rank:Rank):Card - returns the card
 *
 *     Deck.cardByName(name:string):Card - Expects suit first, then rank: 'ST' or 'd10'
 *
 */
var North = { name: "north", letter: "N", order: 0 };
var East = { name: "east", letter: "E", order: 1 };
var South = { name: "south", letter: "S", order: 2 };
var West = { name: "west", letter: "W", order: 3 };
var Seats = {
    north: North,
    east: East,
    south: South,
    west: West,
    all: new Array(North, East, South, West)
};
var Spades = { name: 'spades', letter: 'S', symbol: '\U+2660', order: 0, summand: 0 };
var Hearts = { name: 'hearts', letter: 'H', symbol: '\U+2665', order: 1, summand: 13 * 1 };
var Diamonds = { name: 'diamonds', letter: 'D', symbol: '\U+2666', order: 2, summand: 13 * 2 };
var Clubs = { name: 'clubs', letter: 'C', symbol: '\U+2663', order: 3, summand: 13 * 3 };
var Suits = {
    spades: Spades,
    hearts: Hearts,
    diamonds: Diamonds,
    clubs: Clubs,
    all: new Array(Spades, Hearts, Diamonds, Clubs)
};
var Card = /** @class */ (function () {
    function Card(suit, rank) {
        this.suit = suit;
        this.rank = rank;
        this.short = suit.letter + rank.brief;
        this.order = rank.order + 13 * suit.order;
    }
    return Card;
}());
function qr(s, o, letter) {
    if (letter === void 0) { letter = undefined; }
    return {
        brief: s,
        order: o,
        bit: 1 << (12 - o),
        letter: letter || s,
        summand: o
    };
}
var Ace = qr('A', 0);
var King = qr('K', 1);
var Queen = qr('Q', 2);
var Jack = qr('J', 3);
var Ten = qr('10', 4, 'T');
var Nine = qr('9', 5);
var Eight = qr('8', 6);
var Seven = qr('7', 7);
var Six = qr('6', 8);
var Five = qr('5', 9);
var Four = qr('4', 10);
var Three = qr('3', 11);
var Two = qr('2', 12);
var Ranks = {
    ace: Ace,
    king: King,
    queen: Queen,
    jack: Jack,
    ten: Ten,
    nine: Nine,
    eight: Eight,
    seven: Seven,
    six: Six,
    five: Five,
    four: Four,
    three: Three,
    two: Two,
    all: [Ace, King, Queen, Jack, Ten, Nine, Eight, Seven, Six, Five, Four, Three, Two]
};
var RankParser = /** @class */ (function () {
    function RankParser(text, rank) {
        this.letter = text.slice(0, 1);
        this.full = text;
        this.rank = rank;
    }
    Object.defineProperty(RankParser.prototype, "length", {
        get: function () { return this.full.length; },
        enumerable: false,
        configurable: true
    });
    RankParser.prototype.apply = function (text) {
        if (text.slice(0, this.length) == this.full) {
            return { rank: this.rank, rest: text.slice(this.length) };
        }
    };
    return RankParser;
}());
function createRankParser() {
    var map = new Map();
    var add = function (parser) {
        map.set(parser.letter, parser);
    };
    Ranks.all.forEach(function (rank) {
        add(new RankParser(rank.letter, rank));
        if (rank.brief != rank.letter) {
            add(new RankParser(rank.brief, rank));
        }
    });
    return function (text) {
        var parser = map.get(text.slice(0, 1));
        if (parser) {
            return parser.apply(text);
        }
        throw new Error('Invalid rank ' + text);
    };
}
var rankParser = createRankParser();
function rankByText(text) {
    text = text.toUpperCase();
    var result = rankParser(text);
    if (result.rest != "") {
        throw new Error('Invalid rank: ' + text);
    }
    return result.rank;
}
function ranksByText(text) {
    var ranks = new Array();
    if (text == '-') {
        return ranks;
    }
    var lastOrder = -1;
    var rest = text;
    while (rest != '') {
        var result = rankParser(rest);
        if (result.rank.order <= lastOrder) {
            throw new Error('Invalid rank order in ' + text);
        }
        ranks.push(result.rank);
        rest = result.rest.trimStart();
        lastOrder = result.rank.order;
    }
    return ranks;
}
function make_cards() {
    var cards = new Array(52);
    Ranks.all.forEach(function (rank) {
        Suits.all.forEach(function (suit) {
            var index = suit.summand + rank.summand;
            cards[index] = new Card(suit, rank);
        });
    });
    return cards;
}
var Cards = make_cards();
var CardsByName = new Map(Cards.map(function (card) { return [card.short, card]; }));
function cardBySuitRank(suit, rank) {
    return Cards[suit.order * 13 + rank.order];
}
function lookupCardByName(name) {
    name = name.toUpperCase();
    var card = CardsByName.get(name);
    if (card) {
        return card;
    }
    throw Error('Invalid card name ' + name);
}
var Deck = {
    ranks: Ranks,
    suits: Suits,
    cards: Cards,
    cardByName: lookupCardByName,
    cardsByName: function (names) {
        return names.map(lookupCardByName);
    },
    rankByText: rankByText,
    ranksByText: ranksByText,
    card: cardBySuitRank
};
export { CardsByName, Seats, Card, Deck };
