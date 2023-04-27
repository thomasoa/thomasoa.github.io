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
var Spades = { name: 'spades', letter: 'S', symbol: 'S', order: 0 };
var Hearts = { name: 'hearts', letter: 'H', symbol: 'H', order: 1 };
var Diamonds = { name: 'diamonds', letter: 'D', symbol: 'D', order: 2 };
var Clubs = { name: 'clubs', letter: 'C', symbol: 'C', order: 3 };
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
function qr(s, o) { return { brief: s, order: o, bit: 1 << (12 - o) }; }
var Ace = qr('A', 0);
var King = qr('K', 1);
var Queen = qr('Q', 2);
var Jack = qr('J', 3);
var Ten = qr('10', 4);
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
function make_cards() {
    var cards = new Array(52);
    for (var cardNum = 0; cardNum < 52; cardNum++) {
        var suit = Suits.all[Math.floor(cardNum / 13)];
        var rank = Ranks.all[cardNum % 13];
        cards[cardNum] = new Card(suit, rank);
    }
    return cards;
}
var Cards = make_cards();
var CardsByName = new Map(Cards.map(function (card) { return [card.short, card]; }));
export { Suits, Ranks, Cards, CardsByName, Seats, Card };
