(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.App = void 0;
exports.initialize = initialize;
var _application = require("./model/application.js");
var App = new _application.Application();
exports.App = App;
function backDeal() {
  App.previousDeal();
  return false;
}
function fowardDeal() {
  App.nextDeal();
  return false;
}
function firstDeal() {
  App.chooseCurrent(0);
  return false;
}
function lastDeal() {
  App.chooseCurrent(App.length - 1);
  return false;
}
function onReset() {
  $('#deal').hide();
  $('#preface').show();
}
function visibility(flag) {
  return flag ? 'visible' : 'hidden';
}
function setVisibility(selector, flag) {
  $(selector).css('visibility', visibility(flag));
}
function updatePreviousNext() {
  setVisibility('#backwards', App.allowPrevious);
  setVisibility('#forwards', App.allowNext);
}
function getTitle(dealInfo) {
  var title = dealInfo.edition + " Edition";
  if (dealInfo.scrambled) {
    title = "Scrambled " + title;
  }
  return title;
}
function englishHolding(holding) {
  if (holding.length == 0) {
    return 'void';
  }
  var cards = holding.ranks.map(rank => rank.name);
  if (holding.spots > 0) {
    cards.push(holding.spots.toString() + ' small spots');
  }
  if (cards.length == 1) {
    return cards[0];
  }
  cards[cards.length - 1] = ' and ' + cards[cards.length - 1];
  return cards.join(', ');
}
function updateDeal(deal) {
  $('#preface').hide();
  deal.eachHand((seat, hand) => {
    var handDiv = $('.diagram .' + seat.name);
    hand.eachSuit((suit, holding) => {
      var hString = holding.toString();
      var language = suit.singular + ' ' + englishHolding(holding);
      if (hString == '-') {
        hString = '\u2014';
      } // emdash 
      var suitSpan = '.' + suit.name + ' span.holding';
      handDiv.find(suitSpan).text(hString);
      handDiv.find(suitSpan).attr('title', language);
    });
  });
}
function updateCurrentDeal(dealInfo) {
  var dealLoc = $('#deal');
  $('#dealIndex').text(dealInfo.index + 1);
  var title = getTitle(dealInfo);
  dealLoc.find('.bookTitle').text(title);
  $('#error').hide();
  dealLoc.find('.pageNumber').text(dealInfo.pageNo);
  updatePreviousNext();
  updateDeal(dealInfo.deal);
  // var hands = dealInfo.deal.hands.map((hand) => hand.toString()).join("\n")
  dealLoc.show();
}
function updateDealCount(count) {
  $('#dealCount').text(count);
  updatePreviousNext();
}
function reset() {
  App.reset();
}
function initialize() {
  App.listenCurrentDeal(updateCurrentDeal);
  App.listenDealCount(updateDealCount);
  App.listenReset(onReset);
  const form = $('#lookup');
  form.submit(() => {
    submit_pages(form);
    return false;
  });
  $('#reset').on('click', () => reset());
  $('#firstDeal').on('click', () => firstDeal());
  $('#lastDeal').on('click', () => lastDeal());
  $('a.powersOf10').on('click', powersOf(10));
  $('a.powersOf2').on('click', powersOf(2));
  $('a.multiplesOf1E27').on('click', multiplesOf1E27);
  $('#back').on('click', () => backDeal());
  $('#forward').on('click', () => fowardDeal());
  App.reset();
}
function determineEdition(form) {
  /*
   * Returns object: {name:string, scrambled:boolean}
   */
  form = form || $('form#lookup');
  var scramble = form.find('select[name="scramble"]').val();
  var edition = form.find('select[name="edition"]').val();
  return {
    name: edition,
    scrambled: scramble == 'Scrambled'
  };
}
function submitPages(pageNumbers, form) {
  var edition = determineEdition(form);
  App.findDeals(edition.name, edition.scrambled, pageNumbers);
}
function submit_pages(form) {
  try {
    var pageEntry = form.find('input[name="pageNumbers"]');
    var pageText = $(pageEntry).val();
    var pages = pageText.split(',').map(page => BigInt(page));
    submitPages(pages, form);
    $(pageEntry).val('');
    $('#error').hide();
  } catch (e) {
    console.error(e);
    $('#error').text(e);
    $('#error').show();
    return false;
  }
}
function powersOf(n) {
  return function () {
    n = BigInt(n);
    var power = BigInt(1);
    var result = [];
    while (power <= App.lastPage) {
      result.push(power);
      power *= n;
    }
    submitPages(result);
    return false;
  };
}
function multiplesOf1E27() {
  var e27 = BigInt('1000000000000000000000000000');
  var result = [];
  var page = e27;
  while (page <= App.lastPage) {
    result.push(page);
    page += e27;
  }
  submitPages(result);
  return false;
}
$(document).ready(() => initialize());

},{"./model/application.js":10}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Suit = exports.Seats = exports.Seat = exports.Rank = exports.Deck = exports.Card = void 0;
var _maps = require("../generic/maps.js");
/**
 * A set of constant describing things related to bridge deals.
 *
 * Types: Seat, Rank, Suit,
 * Class: Card
 * Global: Deck, Seats
 *
 *     Seats.all : Seat[] - Array of all seat objects
 *     Seats.each         - alias for Seats.all.forEach
 *     Seats.map          - alias for Seats.all.map
 *
 *     Deck.suits.all : Suit[] - Array of all suits
 *     Deck.suits.each, Deck.suits.map
 *                             - aliases
 *
 *     Deck.ranks.all: Rank[] - Array of all ranks
 *     Deck.ranks.each, Deck.ranks.map
 *                            - aliases
 *
 *     Deck.cards.all: Card[] - All 52 different card values
 *     Deck.cards.each, Deck.cards.map
 *
 *     Deck.card(suit:Suit, rank:Rank):Card - returns the card
 *
 *     Deck.cardByName(name:string):Card - Expects suit first, then rank: 'ST' or 'd10'
 *
 *     Seats.nprth, Seats.east, Seats.south, Seats.west
 *     Deck.Ranks.ace, ..., Deck.Ranks.two
 *     Deck.Suits.spades, ..., Deck.Suits.clubs
 *
 */

function f(obj) {
  Object.freeze(obj);
  return obj;
}
var Seat = /** @class */function () {
  function Seat(name, letter, order) {
    if (Seat.AllSeats[order]) {
      return Seat.AllSeats[order];
    }
    this.name = name;
    this.letter = letter;
    this.order = order;
    Seat.AllSeats[order] = this;
  }
  Object.defineProperty(Seat, "all", {
    get: function () {
      return Seat.AllSeats;
    },
    enumerable: false,
    configurable: true
  });
  Seat.prototype.select = function (tuple) {
    return tuple[this.order];
  };
  Seat.prototype.for = function (record) {
    return record[this.name];
  };
  Seat.prototype.set = function (aRec, value) {
    aRec[this.name] = value;
  };
  Seat.prototype.unset = function (aRec) {
    delete aRec[this.name];
  };
  Seat.prototype.shift = function (positive) {
    return Seat.AllSeats[(this.order + positive) % 4];
  };
  Object.defineProperty(Seat.prototype, "lho", {
    get: function () {
      return this.shift(1);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Seat.prototype, "partner", {
    get: function () {
      return this.shift(2);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Seat.prototype, "rho", {
    get: function () {
      return this.shift(3);
    },
    enumerable: false,
    configurable: true
  });
  Seat.AllSeats = new Array(4);
  return Seat;
}();
exports.Seat = Seat;
var North = new Seat("north", "N", 0);
var East = new Seat("east", "E", 1);
var South = new Seat("south", "S", 2);
var West = new Seat("west", "W", 3);
var SeatNameMap = new _maps.UpcaseMap();
Seat.all.forEach(function (seat) {
  SeatNameMap.set(seat.name, seat);
  SeatNameMap.set(seat.letter, seat);
});
var AllSeats = Seat.all;
var Seats = {
  north: North,
  east: East,
  south: South,
  west: West,
  all: AllSeats,
  each: AllSeats.forEach.bind(AllSeats),
  map: AllSeats.map.bind(AllSeats),
  byText: SeatNameMap.get.bind(SeatNameMap)
};
exports.Seats = Seats;
Object.freeze(Seats);
var Suit = /** @class */function () {
  function Suit(suit) {
    for (var key in suit) {
      this[key] = suit[key];
    }
  }
  Suit.prototype.select = function (aTuple) {
    return aTuple[this.order];
  };
  Suit.prototype.for = function (aRec) {
    return aRec[this.name];
  };
  Suit.prototype.set = function (aRec, value) {
    aRec[this.name] = value;
  };
  Suit.prototype.unset = function (aRec) {
    delete aRec[this.name];
  };
  return Suit;
}();
exports.Suit = Suit;
var Rank = /** @class */function () {
  function Rank(brief, name, order, letter) {
    if (letter === void 0) {
      letter = undefined;
    }
    this.brief = brief;
    this.name = name;
    this.order = order;
    this.bit = 1 << 12 - order;
    this.letter = letter || brief;
    this.summand = order;
    Object.freeze(this);
  }
  return Rank;
}();
exports.Rank = Rank;
var Spades = new Suit({
  name: 'spades',
  singular: 'spade',
  letter: 'S',
  symbol: '\U+2660',
  color: "black",
  type: "major",
  order: 0,
  summand: 0
});
var Hearts = new Suit({
  name: 'hearts',
  singular: 'heart',
  letter: 'H',
  symbol: '\U+2665',
  color: "red",
  type: "major",
  order: 1,
  summand: 13 * 1
});
var Diamonds = new Suit({
  name: 'diamonds',
  singular: 'diamond',
  letter: 'D',
  symbol: '\U+2666',
  color: "red",
  type: "minor",
  order: 2,
  summand: 13 * 2
});
var Clubs = new Suit({
  name: 'clubs',
  singular: 'club',
  letter: 'C',
  symbol: '\U+2663',
  color: "black",
  type: "minor",
  order: 3,
  summand: 13 * 3
});
var AllSuits = [Spades, Hearts, Diamonds, Clubs];
Object.freeze(AllSuits);
var SuitNameMap = new _maps.UpcaseMap();
AllSuits.forEach(function (suit) {
  SuitNameMap.set(suit.name, suit);
  SuitNameMap.set(suit.letter, suit);
  SuitNameMap.set(suit.singular, suit);
});
var Suits = {
  spades: Spades,
  hearts: Hearts,
  diamonds: Diamonds,
  clubs: Clubs,
  all: AllSuits,
  majors: [Spades, Hearts],
  minors: [Diamonds, Clubs],
  each: AllSuits.forEach.bind(AllSuits),
  map: AllSuits.map.bind(AllSuits),
  byText: SuitNameMap.get.bind(SuitNameMap)
};
Suits.each(Object.freeze);
Object.freeze(Suits);
var Card = /** @class */function () {
  function Card(suit, rank) {
    this.suit = suit;
    this.rank = rank;
    this.short = suit.letter + rank.brief;
    this.order = rank.order + 13 * suit.order;
    Object.freeze(this);
  }
  return Card;
}();
exports.Card = Card;
var Ace = new Rank('A', 'ace', 0);
var King = new Rank('K', 'king', 1);
var Queen = new Rank('Q', 'queen', 2);
var Jack = new Rank('J', 'jack', 3);
var Ten = new Rank('10', 'ten', 4, 'T');
var Nine = new Rank('9', 'nine', 5);
var Eight = new Rank('8', 'eight', 6);
var Seven = new Rank('7', 'seven', 7);
var Six = new Rank('6', 'six', 8);
var Five = new Rank('5', 'five', 9);
var Four = new Rank('4', 'four', 10);
var Three = new Rank('3', 'three', 11);
var Two = new Rank('2', 'two', 12);
var AllRanks = f([Ace, King, Queen, Jack, Ten, Nine, Eight, Seven, Six, Five, Four, Three, Two]);
function ranksFromBits(bits) {
  var ranks = new Array();
  AllRanks.forEach(function (rank) {
    if (rank.bit & bits) {
      ranks.push(rank);
    }
  });
  return ranks;
}
var RankParser = /** @class */function () {
  function RankParser(text, rank) {
    text = text.toUpperCase();
    this.letter = text.slice(0, 1);
    this.full = text;
    this.rank = rank;
  }
  Object.defineProperty(RankParser.prototype, "length", {
    get: function () {
      return this.full.length;
    },
    enumerable: false,
    configurable: true
  });
  RankParser.prototype.apply = function (text) {
    text = text.toUpperCase();
    if (text.slice(0, this.length) == this.full) {
      return {
        rank: this.rank,
        rest: text.slice(this.length)
      };
    }
    throw new Error('Invalid card rank ' + text);
  };
  return RankParser;
}();
function createRankParser() {
  var map = new _maps.UpcaseMap();
  var add = function (parser) {
    map.set(parser.letter, parser);
  };
  AllRanks.forEach(function (rank) {
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
var Ranks = f({
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
  spotChar: 'X',
  all: AllRanks,
  each: AllRanks.forEach.bind(AllRanks),
  map: AllRanks.map.bind(AllRanks),
  fromBits: ranksFromBits,
  byName: rankByText,
  parse: ranksByText
});
function make_cards() {
  var cards = new Array(52);
  Ranks.each(function (rank) {
    Suits.each(function (suit) {
      var index = suit.summand + rank.summand;
      cards[index] = f(new Card(suit, rank));
    });
  });
  return f(cards);
}
var AllCards = make_cards();
var CardsByName = new _maps.UpcaseMap();
AllCards.forEach(function (card) {
  var rank = card.rank;
  var suit = card.suit;
  var rankStrings = [rank.brief, rank.letter];
  rankStrings.forEach(function (rankStr) {
    CardsByName.set(suit.letter + rankStr, card);
    CardsByName.set(rankStr + suit.letter, card);
  });
});
function cardBySuitRank(suit, rank) {
  return AllCards[suit.summand + rank.summand];
}
Rank.prototype.of = function (suit) {
  return cardBySuitRank(suit, this);
};
function lookupCardByName(name) {
  name = name.toUpperCase();
  var card = CardsByName.get(name);
  if (card) {
    return card;
  }
  throw Error('Invalid card name ' + name);
}
function lookupCardsByNames() {
  var names = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    names[_i] = arguments[_i];
  }
  return names.map(lookupCardByName);
}
var Cards = f({
  all: AllCards,
  each: AllCards.forEach.bind(AllCards),
  map: AllCards.map.bind(AllCards),
  byName: lookupCardByName,
  byNames: lookupCardsByNames
});
var Deck = {
  ranks: Ranks,
  suits: Suits,
  cards: Cards,
  card: cardBySuitRank,
  c: Cards.byName
};
exports.Deck = Deck;
Object.freeze(Deck);

},{"../generic/maps.js":4}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Deck", {
  enumerable: true,
  get: function () {
    return _constants.Deck;
  }
});
exports.Holding = void 0;
Object.defineProperty(exports, "Rank", {
  enumerable: true,
  get: function () {
    return _constants.Rank;
  }
});
exports.XHolding = void 0;
exports.parseHolding = parseHolding;
var _constants = require("./constants.js");
var Holding = /** @class */function () {
  function Holding(bits) {
    if (Holding.lwHoldings[bits]) {
      return Holding.lwHoldings[bits];
    }
    this.bits = bits;
    this.ranks = _constants.Deck.ranks.all.filter(function (rank) {
      return rank.bit & bits;
    });
    Holding.lwHoldings[bits] = this;
  }
  Object.defineProperty(Holding.prototype, "length", {
    get: function () {
      return this.ranks.length;
    },
    enumerable: false,
    configurable: true
  });
  Holding.prototype.asString = function (divider) {
    if (divider === void 0) {
      divider = '';
    }
    if (this.length == 0) {
      return '-';
    }
    return this.ranks.map(function (rank) {
      return rank.brief;
    }).join(divider);
  };
  Holding.prototype.isVoid = function () {
    return this.length == 0;
  };
  Holding.prototype.isDisjoint = function (h) {
    return !(this.bits & h.holding.bits);
  };
  Holding.prototype.union = function (h) {
    var newH = new Holding(h.nonSpots.bits | this.bits);
    return newH.addSpots(h.spots);
  };
  Holding.prototype.toString = function () {
    return this.asString(' ');
  };
  Holding.prototype.has = function (rank) {
    return (this.bits & rank.bit) != 0;
  };
  Holding.prototype.remove = function (rank) {
    if (this.has(rank)) {
      return new Holding(this.bits & ~rank.bit);
    }
    throw new Error('Cannot remove rank ' + rank.name + ' from holding ' + this.asString());
  };
  Holding.prototype.add = function (rank) {
    if (this.has(rank)) {
      throw new Error('Holding already has rank ' + rank.name);
    }
    return new Holding(this.bits | rank.bit);
  };
  Holding.prototype.addSpots = function (spots) {
    if (spots === void 0) {
      spots = 1;
    }
    if (spots > 0) {
      return new XHolding(this, spots);
    }
    return this;
  };
  Holding.prototype.removeSpots = function (spots) {
    if (spots === void 0) {
      spots = 1;
    }
    if (spots == 0) {
      return this;
    }
    throw new Error('No spots in holding ' + this.asString());
  };
  Object.defineProperty(Holding.prototype, "nonSpots", {
    get: function () {
      return this;
    },
    enumerable: false,
    configurable: true
  });
  Holding.prototype.above = function (rank) {
    return new Holding(this.bits & ~((rank.bit << 1) - 1));
  };
  Holding.prototype.aboveEq = function (rank) {
    return new Holding(this.bits & ~(rank.bit - 1));
  };
  Holding.prototype.below = function (rank) {
    return new Holding(this.bits & rank.bit - 1);
  };
  Holding.prototype.belowEq = function (rank) {
    return new Holding(this.bits & (rank.bit << 1) - 1);
  };
  Holding.forString = function (text) {
    return Holding.fromRanks(_constants.Deck.ranks.parse(text));
  };
  Holding.fromRanks = function (ranks) {
    var bits = ranks.reduce(function (b, rank) {
      return b | rank.bit;
    }, 0);
    return new Holding(bits);
  };
  Object.defineProperty(Holding.prototype, "holding", {
    get: function () {
      return this;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Holding.prototype, "spots", {
    get: function () {
      return 0;
    },
    enumerable: false,
    configurable: true
  });
  Holding.prototype.isSpot = function (rank) {
    return false;
  };
  Holding.lwHoldings = new Array(1 << 13);
  return Holding;
}();
/**
 * Representation of a holding with a number of unknown spots, like AKJX or TXX.
 */
exports.Holding = Holding;
var XHolding = /** @class */function () {
  function XHolding(topCards, spots) {
    var spotBits = (1 << spots) - 1;
    if (spotBits & topCards.bits) {
      // Invalidate examples like '5xxxx'
      throw new Error('Too many spots below lowest rank');
    }
    this.holding = new Holding(topCards.bits | spotBits);
    this.spots = spots;
    this.spotBits = spotBits;
    this.nonSpots = topCards;
  }
  Object.defineProperty(XHolding.prototype, "length", {
    get: function () {
      return this.holding.length;
    },
    enumerable: false,
    configurable: true
  });
  XHolding.prototype.rankText = function (rank) {
    if (rank.order + this.spots < 13) {
      return rank.brief;
    }
    return _constants.Deck.ranks.spotChar;
  };
  XHolding.prototype.asString = function (divider) {
    if (divider === void 0) {
      divider = '';
    }
    if (this.length == 0) {
      return '-';
    }
    return this.holding.ranks.map(this.rankText.bind(this)).join(divider);
  };
  Object.defineProperty(XHolding.prototype, "ranks", {
    get: function () {
      return this.holding.ranks;
    },
    enumerable: false,
    configurable: true
  });
  XHolding.prototype.has = function (rank) {
    return this.holding.has(rank);
  };
  XHolding.prototype.isDisjoint = function (h) {
    if (this.nonSpots.bits & h.nonSpots.bits) {
      console.log('Nonspots are not disjoint for ' + h.asString() + ' ' + this.asString());
      return false;
    }
    var combined = this.nonSpots.bits | h.nonSpots.bits;
    var spotBits = (1 << this.spots + h.spots) - 1;
    console.log('Bits ' + (combined & spotBits) + ' ' + spotBits + ' for ' + h.asString() + ' ' + this.asString());
    return !(combined & spotBits);
  };
  XHolding.prototype.union = function (h) {
    var newH = this.nonSpots.union(h);
    return newH.addSpots(this.spots);
  };
  XHolding.prototype.isSpot = function (rank) {
    return rank.order + this.spots >= 13;
  };
  Object.defineProperty(XHolding.prototype, "topSpot", {
    get: function () {
      if (this.spots) {
        return _constants.Deck.ranks.all[13 - this.spots];
      }
      throw new Error('No spots, so no topSpot');
    },
    enumerable: false,
    configurable: true
  });
  XHolding.prototype.remove = function (rank) {
    if (this.nonSpots.has(rank)) {
      var h = this.nonSpots;
      return new XHolding(h.remove(rank), this.spots);
    }
    throw new Error('Cannot remove rank ' + rank.name + ' from holding ' + this.asString());
  };
  XHolding.prototype.add = function (rank) {
    if (this.has(rank)) {
      throw new Error('Rank ' + rank.name + ' already in ' + this.asString());
    }
    return new XHolding(this.nonSpots.add(rank), this.spots);
  };
  XHolding.prototype.addSpots = function (spots) {
    if (spots === void 0) {
      spots = 1;
    }
    return new XHolding(this.nonSpots, spots + this.spots);
  };
  XHolding.prototype.removeSpots = function (spots) {
    if (spots === void 0) {
      spots = 1;
    }
    if (spots > this.spots) {
      throw new RangeError('Cannot remove ' + spots + ' spot(s) from ' + this.asString());
    }
    return new XHolding(this.nonSpots, this.spots - spots);
  };
  return XHolding;
}();
exports.XHolding = XHolding;
var parseRE = /^([^X]*)(X*)$/;
function parseHolding(start) {
  var str = start.replace(/\s/g, '').toUpperCase();
  if (str == '-') {
    return new Holding(0);
  }
  var match = str.match(parseRE);
  if (match) {
    var holding = Holding.forString(match[1]);
    var spots = match[2].length;
    if (spots > 0) {
      return new XHolding(holding, spots);
    }
    return holding;
  }
  throw new Error('Improper holding string "' + start + '" as "' + str + '"');
}

},{"./constants.js":2}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UpcaseMap = exports.TransformKeyMap = void 0;
var __extends = void 0 && (void 0).__extends || function () {
  var extendStatics = function (d, b) {
    extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    };
    return extendStatics(d, b);
  };
  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
var TransformKeyMap = /** @class */function () {
  function TransformKeyMap(transform, map) {
    if (map === void 0) {
      map = new Map();
    }
    this.transform = transform;
    this.map = map;
  }
  TransformKeyMap.prototype.get = function (k1) {
    return this.map.get(this.transform(k1));
  };
  TransformKeyMap.prototype.set = function (k1, value) {
    this.map.set(this.transform(k1), value);
  };
  TransformKeyMap.prototype.has = function (key) {
    return this.map.has(this.transform(key));
  };
  return TransformKeyMap;
}();
exports.TransformKeyMap = TransformKeyMap;
var UpcaseMap = /** @class */function (_super) {
  __extends(UpcaseMap, _super);
  function UpcaseMap(map) {
    if (map === void 0) {
      map = new Map();
    }
    return _super.call(this, function (s) {
      return s.toUpperCase();
    }, map) || this;
  }
  return UpcaseMap;
}(TransformKeyMap);
exports.UpcaseMap = UpcaseMap;

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Card", {
  enumerable: true,
  get: function () {
    return _constants.Card;
  }
});
Object.defineProperty(exports, "Deck", {
  enumerable: true,
  get: function () {
    return _constants.Deck;
  }
});
Object.defineProperty(exports, "Holding", {
  enumerable: true,
  get: function () {
    return _holding.Holding;
  }
});
Object.defineProperty(exports, "Rank", {
  enumerable: true,
  get: function () {
    return _constants.Rank;
  }
});
Object.defineProperty(exports, "Seat", {
  enumerable: true,
  get: function () {
    return _constants.Seat;
  }
});
Object.defineProperty(exports, "Seats", {
  enumerable: true,
  get: function () {
    return _constants.Seats;
  }
});
Object.defineProperty(exports, "Suit", {
  enumerable: true,
  get: function () {
    return _constants.Suit;
  }
});
Object.defineProperty(exports, "XHolding", {
  enumerable: true,
  get: function () {
    return _holding.XHolding;
  }
});
var _constants = require("./bridge/constants");
var _holding = require("./bridge/holding");

},{"./bridge/constants":2,"./bridge/holding":3}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultBijectionSeat = exports.defaultBijectionCard = exports.SimpleBijection = void 0;
var _index = require("../basics/src/index.js");
var SimpleBijection = /** @class */function () {
  function SimpleBijection(allT, map) {
    if (map === void 0) {
      map = function (n) {
        return n;
      };
    }
    var instances = new Array(allT.length);
    var reverse = new Array(allT.length);
    allT.forEach(function (t, num) {
      instances[num] = allT[map(num)];
      reverse[map(num)] = num;
    });
    this.instances = instances;
    this.reverse = reverse;
  }
  SimpleBijection.prototype.mapTo = function (num) {
    return this.instances[num];
  };
  SimpleBijection.prototype.mapFrom = function (t) {
    return this.reverse[t.order];
  };
  return SimpleBijection;
}();
exports.SimpleBijection = SimpleBijection;
var defaultBijectionSeat = new SimpleBijection(_index.Seats.all);
exports.defaultBijectionSeat = defaultBijectionSeat;
var defaultBijectionCard = new SimpleBijection(_index.Deck.cards.all);
exports.defaultBijectionCard = defaultBijectionCard;

},{"../basics/src/index.js":5}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BridgeBook = void 0;
Object.defineProperty(exports, "SimpleBijection", {
  enumerable: true,
  get: function () {
    return _bijection.SimpleBijection;
  }
});
exports.validate_signature = validate_signature;
var _index = require("../basics/src/index.js");
var _index2 = require("../numeric/index.js");
var _bijection = require("./bijection.js");
var _deal = require("./deal.js");
function validate_signature(signature) {
  if (!_index2.bridgeSignature.equals(signature)) {
    throw new TypeError('Invalid signature');
  }
}
var BridgeBook = /** @class */function () {
  function BridgeBook(strategy, seatBijection, cardBijection) {
    if (seatBijection === void 0) {
      seatBijection = _bijection.defaultBijectionSeat;
    }
    if (cardBijection === void 0) {
      cardBijection = _bijection.defaultBijectionCard;
    }
    validate_signature(strategy.signature);
    this.strategy = strategy;
    this.seatBijection = seatBijection;
    this.cardBijection = cardBijection;
  }
  Object.defineProperty(BridgeBook.prototype, "pages", {
    get: function () {
      return this.strategy.pages;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BridgeBook.prototype, "lastPage", {
    get: function () {
      return this.strategy.pages;
    },
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
    var toWhom = new Array(_index.Deck.cards.all.length);
    numDeal.toWhom.forEach(function (seatNum, cardNum) {
      var seat = seatMap.mapTo(seatNum);
      var card = cardMap.mapTo(cardNum);
      toWhom[card.order] = seat;
    });
    return new _deal.Deal(toWhom);
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
    return new _index2.NumericDeal(this.strategy.signature, toWhom);
  };
  BridgeBook.prototype.getPageNumber = function (deal) {
    var numericDeal = this.numericDeal(deal);
    return this.strategy.computePageNumber(numericDeal) + BigInt(1);
  };
  return BridgeBook;
}();
exports.BridgeBook = BridgeBook;

},{"../basics/src/index.js":5,"../numeric/index.js":15,"./bijection.js":6,"./deal.js":8}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Hand = exports.Deal = void 0;
Object.defineProperty(exports, "Holding", {
  enumerable: true,
  get: function () {
    return _index.Holding;
  }
});
var _index = require("../basics/src/index.js");
var Hand = /** @class */function () {
  function Hand(cards) {
    this.cards = cards;
    var suits = _index.Deck.suits.map(function () {
      return new Array();
    });
    this.cards.forEach(function (card) {
      suits[card.suit.order].push(card.rank);
    });
    this.holdings = suits.map(function (ranks) {
      return _index.Holding.fromRanks(ranks);
    });
  }
  Hand.prototype.suit = function (suit) {
    return this.holdings[suit.order];
  };
  Object.defineProperty(Hand.prototype, "spades", {
    get: function () {
      return this.suit(_index.Deck.suits.spades);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Hand.prototype, "hearts", {
    get: function () {
      return this.suit(_index.Deck.suits.hearts);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Hand.prototype, "diamonds", {
    get: function () {
      return this.suit(_index.Deck.suits.diamonds);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Hand.prototype, "clubs", {
    get: function () {
      return this.suit(_index.Deck.suits.clubs);
    },
    enumerable: false,
    configurable: true
  });
  Hand.prototype.has = function (card) {
    return this.suit(card.suit).has(card.rank);
  };
  Hand.prototype.toString = function () {
    return this.holdings.map(function (h) {
      return h.asString('');
    }).join(' ');
  };
  Hand.prototype.eachSuit = function (method) {
    this.holdings.forEach(function (holding, index) {
      return method(_index.Deck.suits.all[index], holding);
    });
  };
  Hand.forHoldings = function (holdings) {
    if (holdings.length != 4) {
      throw new Error('Should be exactly four holdings');
    }
    var cards = new Array();
    holdings.forEach(function (h, suitNum) {
      var suit = _index.Deck.suits.all[suitNum];
      h.ranks.forEach(function (rank) {
        cards.push(_index.Deck.card(suit, rank));
      });
    });
    return new Hand(cards);
  };
  Hand.forString = function (handString) {
    handString = handString.toUpperCase();
    var match = handString.match(/^ *S:?([^SHDC]*)H:?([^SHDC]*)D:?([^SHDC]*)C:?([^SHDC]*)$/);
    if (match) {
      var holdings = [match[1], match[2], match[3], match[4]].map(function (s) {
        return _index.Holding.forString(s.trim());
      });
      return Hand.forHoldings(holdings);
    }
    throw Error('Invalid hand string: ' + handString);
  };
  return Hand;
}();
exports.Hand = Hand;
function buildHands(toWhom) {
  var cards = Array.from({
    length: 4
  }, function () {
    return new Array(0);
  });
  toWhom.forEach(function (seat, cardNum) {
    cards[seat.order].push(_index.Deck.cards.all[cardNum]);
  });
  return cards.map(function (handCards) {
    return new Hand(handCards);
  });
}
var Deal = /** @class */function () {
  function Deal(toWhom) {
    this.toWhom = toWhom;
    this.hands = buildHands(toWhom);
  }
  Deal.prototype.hand = function (seat) {
    return this.hands[seat.order];
  };
  Object.defineProperty(Deal.prototype, "north", {
    get: function () {
      return this.hand(_index.Seats.north);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Deal.prototype, "east", {
    get: function () {
      return this.hand(_index.Seats.east);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Deal.prototype, "south", {
    get: function () {
      return this.hand(_index.Seats.south);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Deal.prototype, "west", {
    get: function () {
      return this.hand(_index.Seats.west);
    },
    enumerable: false,
    configurable: true
  });
  Deal.prototype.eachHand = function (method) {
    this.hands.forEach(function (hand, index) {
      return method(_index.Seats.all[index], hand);
    });
  };
  Deal.prototype.eachCard = function (method) {
    this.toWhom.forEach(function (seat, index) {
      return method(_index.Deck.cards.all[index], seat);
    });
  };
  Deal.prototype.equals = function (other) {
    return this.toWhom.length == other.toWhom.length && this.toWhom.every(function (seat, index) {
      return seat == other.toWhom[index];
    });
  };
  return Deal;
}();
exports.Deal = Deal;

},{"../basics/src/index.js":5}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "BridgeBook", {
  enumerable: true,
  get: function () {
    return _book.BridgeBook;
  }
});
Object.defineProperty(exports, "Card", {
  enumerable: true,
  get: function () {
    return _index.Card;
  }
});
Object.defineProperty(exports, "Deal", {
  enumerable: true,
  get: function () {
    return _deal.Deal;
  }
});
Object.defineProperty(exports, "Deck", {
  enumerable: true,
  get: function () {
    return _index.Deck;
  }
});
Object.defineProperty(exports, "Hand", {
  enumerable: true,
  get: function () {
    return _deal.Hand;
  }
});
Object.defineProperty(exports, "Holding", {
  enumerable: true,
  get: function () {
    return _deal.Holding;
  }
});
Object.defineProperty(exports, "Rank", {
  enumerable: true,
  get: function () {
    return _index.Rank;
  }
});
Object.defineProperty(exports, "Seat", {
  enumerable: true,
  get: function () {
    return _index.Seat;
  }
});
Object.defineProperty(exports, "Seats", {
  enumerable: true,
  get: function () {
    return _index.Seats;
  }
});
Object.defineProperty(exports, "SimpleBijection", {
  enumerable: true,
  get: function () {
    return _book.SimpleBijection;
  }
});
Object.defineProperty(exports, "Suit", {
  enumerable: true,
  get: function () {
    return _index.Suit;
  }
});
var _index = require("../basics/src/index.js");
var _book = require("./book.js");
var _deal = require("./deal.js");

},{"../basics/src/index.js":5,"./book.js":7,"./deal.js":8}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Application = void 0;
var _books = require("./books.js");
var Application = /** @class */function () {
  function Application() {
    this.currentIndex = -1;
    this.books = new _books.BookSet();
    this.deals = new Array();
    this.callbacks = {
      updateCurrentDeal: new Array(),
      updateDealCount: new Array(),
      applicationReset: new Array()
    };
  }
  Application.prototype.deal = function (index) {
    return this.deals[index];
  };
  Object.defineProperty(Application.prototype, "length", {
    get: function () {
      return this.deals.length;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Application.prototype, "lastPage", {
    get: function () {
      return this.books.lastPage;
    },
    enumerable: false,
    configurable: true
  });
  Application.prototype.nextDeal = function () {
    if (!this.allowNext) {
      throw RangeError('Cannot go to next page');
    }
    this.updateCurrent(this.currentIndex + 1);
  };
  Application.prototype.previousDeal = function () {
    if (!this.allowPrevious) {
      throw RangeError('Cannot go to previous deal');
    }
    this.updateCurrent(this.currentIndex - 1);
  };
  Object.defineProperty(Application.prototype, "allowNext", {
    get: function () {
      return this.currentIndex >= 0 && this.currentIndex < this.length - 1;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Application.prototype, "allowPrevious", {
    get: function () {
      return this.currentIndex > 0;
    },
    enumerable: false,
    configurable: true
  });
  Application.prototype.addDeal = function (deal) {
    this.deals.push(deal);
    this.updateCount();
    return this.length;
  };
  Application.prototype.lookupDeals = function (editionName, scrambled, pages) {
    var book = this.books.book(editionName, scrambled);
    return pages.map(function (page) {
      var deal = book.getDeal(page);
      return {
        deal: deal,
        edition: editionName,
        scrambled: scrambled,
        pageNo: page
      };
    });
  };
  Application.prototype.findDeals = function (editionName, scrambled, pages) {
    if (pages.length == 0) {
      return;
    }
    var newCurrent = this.length;
    var newDeals = this.lookupDeals(editionName, scrambled, pages);
    newDeals.forEach(this.addDeal.bind(this));
    this.updateCurrent(newCurrent);
  };
  Application.prototype.findDeal = function (edition, scrambled, page) {
    this.findDeals(edition, scrambled, [page]);
  };
  Application.prototype.findPageNumber = function (edition, scrambled, deal) {
    var book = this.books.book(edition, scrambled);
    return book.getPageNumber(deal);
  };
  Object.defineProperty(Application.prototype, "editionNames", {
    get: function () {
      return Array.from(this.books.names());
    },
    enumerable: false,
    configurable: true
  });
  Application.prototype.updateCount = function () {
    var _this = this;
    this.callbacks.updateDealCount.forEach(function (callback) {
      return callback(_this.length);
    });
  };
  Application.prototype.reset = function () {
    this.deals = new Array(0);
    this.callbacks.applicationReset.forEach(function (callback) {
      callback();
    });
  };
  Application.prototype.listenCurrentDeal = function (callback) {
    this.callbacks.updateCurrentDeal.push(callback);
  };
  Application.prototype.listenDealCount = function (callback) {
    this.callbacks.updateDealCount.push(callback);
  };
  Application.prototype.listenReset = function (callback) {
    this.callbacks.applicationReset.push(callback);
  };
  Object.defineProperty(Application.prototype, "currentDeal", {
    get: function () {
      if (this.currentIndex >= 0) {
        var deal = this.deals[this.currentIndex];
        deal.index = this.currentIndex;
        deal.count = this.length;
        return deal;
      }
      throw new Error('No current deak');
    },
    enumerable: false,
    configurable: true
  });
  Application.prototype.currentDealCallBacks = function () {
    var deal = this.currentDeal;
    this.callbacks.updateCurrentDeal.forEach(function (callback) {
      return callback(deal);
    });
  };
  Application.prototype.updateCurrent = function (currentIndex) {
    this.currentIndex = currentIndex;
    this.currentDealCallBacks();
  };
  Application.prototype.chooseCurrent = function (currentIndex) {
    if (currentIndex < 0 || currentIndex >= this.length) {
      throw new RangeError('Can only choose deal between 0 and ' + (this.length - 1));
    }
    this.updateCurrent(currentIndex);
  };
  return Application;
}();
exports.Application = Application;

},{"./books.js":11}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BookSet = void 0;
var _index = require("../bridge/index.js");
var _index2 = require("../numeric/index.js");
function common_scrambler() {
  var multiplier = BigInt("13109994191499930367061460371");
  var translation = BigInt("34563463456363563565356345634");
  return new _index2.MultiplierScrambler(_index2.bridgeSignature.pages, multiplier, translation);
}
function edition(book, scrambler) {
  var scrambledStrat = new _index2.ScrambleStrategy(book.strategy, scrambler);
  var scrambled = new _index.BridgeBook(scrambledStrat, book.seatBijection, book.cardBijection);
  return {
    normal: book,
    scrambled: scrambled
  };
}
function pavlicekBook() {
  var strategy = new _index2.PavlicekDealStrategy();
  return new _index.BridgeBook(strategy);
}
function andrewsBook() {
  // We use a seat map to match the original book
  var strategy = new _index2.AndrewsDealStrategy();
  var seatBijection = new _index.SimpleBijection(_index.Seats.all, function (seatNumber) {
    return 3 - seatNumber;
  });
  return new _index.BridgeBook(strategy, seatBijection);
}
function build_editions(scrambler) {
  var editions = new Map();
  editions.set("Pavlicek", edition(pavlicekBook(), scrambler));
  editions.set("Andrews", edition(andrewsBook(), scrambler));
  return editions;
}
var BookSet = /** @class */function () {
  function BookSet() {
    this.scrambler = common_scrambler();
    this.editions = build_editions(this.scrambler);
  }
  BookSet.prototype.names = function () {
    return Array.from(this.editions.keys());
  };
  BookSet.prototype.edition = function (name) {
    var edition = this.editions.get(name);
    if (edition) return edition;
    throw new Error('Invalid edition name: ' + name);
  };
  BookSet.prototype.book = function (name, scrambled) {
    if (scrambled === void 0) {
      scrambled = false;
    }
    var edition = this.edition(name);
    if (scrambled) {
      return edition.scrambled;
    } else {
      return edition.normal;
    }
  };
  BookSet.prototype.unscramble = function (pageNo) {
    // Scrambler uses page numbers strting at zero
    var one = BigInt(1);
    return this.scrambler.unscramble(pageNo - one) + one;
  };
  BookSet.prototype.pageNumbers = function (deal) {
    var _this = this;
    var pages = new Array();
    this.editions.forEach(function (edition, name) {
      var normalPage = edition.normal.getPageNumber(deal);
      var scramblePage = _this.unscramble(normalPage);
      pages.push({
        name: name,
        normal: normalPage,
        scrambled: scramblePage
      });
    });
    return pages;
  };
  Object.defineProperty(BookSet.prototype, "lastPage", {
    get: function () {
      return _index2.bridgeSignature.pages;
    },
    enumerable: false,
    configurable: true
  });
  return BookSet;
}();
exports.BookSet = BookSet;

},{"../bridge/index.js":9,"../numeric/index.js":15}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SequenceBuilder = exports.AndrewsHandStrategy = exports.AndrewsDealStrategy = void 0;
var _deal = require("./deal.js");
var _choose = require("./choose.js");
var squashed = _interopRequireWildcard(require("./squashed.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
//  An entirely numeric version of the book

function computeFactors(cardsPer) {
  var totalCards = 0;
  var totalProduct = BigInt(1);
  var oldProduct = BigInt(1);
  var result = cardsPer.map(function (cards, seat) {
    totalCards += cards;
    oldProduct = totalProduct;
    totalProduct *= (0, _choose.choose)(totalCards, cards);
    return {
      quotient: oldProduct,
      seat: seat,
      cards: cards
    };
  });
  return result.slice(1).reverse();
}
function updateSequence(seat, sequence, toWhom, remaining) {
  // seat - the seat we are currently populating
  // sequence - the (sorted) subsequence of indices for this seat
  // toWhom - the deal we are updating
  // remaining - the current sequence of un-dealt cards
  var newRemaining = Array(remaining.length - sequence.length);
  var iSeq = 0;
  var iNewRemaining = 0;
  remaining.forEach(function (card, i) {
    if (iSeq < sequence.length && sequence[iSeq] == i) {
      toWhom[card] = seat;
      iSeq++;
    } else {
      newRemaining[iNewRemaining] = card;
      iNewRemaining++;
    }
  });
  return newRemaining;
}
var SequenceBuilder = /** @class */function () {
  function SequenceBuilder(seat, cards) {
    this.seat = seat;
    this.sequence = Array(cards);
    this.seqIdx = 0;
    this.afterIndex = 0;
  }
  SequenceBuilder.prototype.nextItem = function (card, whom) {
    if (whom == this.seat) {
      this.sequence[this.seqIdx] = this.afterIndex;
      this.seqIdx++;
    }
    if (whom <= this.seat) {
      this.afterIndex++;
    }
  };
  return SequenceBuilder;
}();
exports.SequenceBuilder = SequenceBuilder;
var AndrewsDealStrategy = /** @class */function () {
  function AndrewsDealStrategy(signature) {
    if (signature === void 0) {
      signature = _deal.bridgeSignature;
    }
    this.signature = signature;
    this.factors = computeFactors(this.signature.perSeat);
  }
  Object.defineProperty(AndrewsDealStrategy.prototype, "pages", {
    get: function () {
      return this.signature.pages;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(AndrewsDealStrategy.prototype, "lastPage", {
    get: function () {
      return this.signature.lastPage;
    },
    enumerable: false,
    configurable: true
  });
  AndrewsDealStrategy.prototype.makeSequenceBuilders = function () {
    var sig = this.signature;
    var builders = Array(sig.seats - 1);
    for (var i = 1; i < sig.seats; i++) {
      builders[i - 1] = new SequenceBuilder(i, sig.perSeat[i]);
    }
    return builders;
  };
  AndrewsDealStrategy.prototype.computePageNumber = function (deal) {
    this.signature.assertEqual(deal.signature, 'Mismatched signatures for Deal and Strategy');
    var builders = this.makeSequenceBuilders();
    deal.toWhom.forEach(function (whom, card) {
      return builders.forEach(function (builder) {
        return builder.nextItem(card, whom);
      });
    });
    var sum = BigInt(0);
    this.factors.forEach(function (factor) {
      var builder = builders[factor.seat - 1];
      var seqNo = squashed.encode(builder.sequence);
      sum += seqNo * factor.quotient;
    });
    return sum;
  };
  AndrewsDealStrategy.prototype.computePageContent = function (pageNo) {
    // Determine what deal is on the given page number
    var sig = this.signature;
    this.signature.assertValidPageNo(pageNo);
    var toWhom = Array(sig.cards);
    for (var card = 0; card < sig.cards; card++) {
      toWhom[card] = 0; // default
    }

    var indices = toWhom.map(function (val, index) {
      return index;
    });
    // Factors are stored in reverse order by seatts, and with
    // no entry for seat 0 because that seat gets all the remaining
    // cards.
    this.factors.forEach(function (factor) {
      var seatIndex = pageNo / factor.quotient;
      pageNo = pageNo % factor.quotient;
      var sequence = squashed.decode(seatIndex, factor.cards);
      indices = updateSequence(factor.seat, sequence, toWhom, indices);
    });
    return new _deal.NumericDeal(this.signature, toWhom);
  };
  return AndrewsDealStrategy;
}();
exports.AndrewsDealStrategy = AndrewsDealStrategy;
var AndrewsHandStrategy = /** @class */function () {
  function AndrewsHandStrategy(sig) {
    if (sig === void 0) {
      sig = _deal.bridgeHandSignature;
    }
    this.signature = sig;
  }
  Object.defineProperty(AndrewsHandStrategy.prototype, "pages", {
    get: function () {
      return this.signature.pages;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(AndrewsHandStrategy.prototype, "lastPage", {
    get: function () {
      return this.signature.lastPage;
    },
    enumerable: false,
    configurable: true
  });
  AndrewsHandStrategy.prototype.assertValidPage = function (pageNo, adjust) {
    if (adjust === void 0) {
      adjust = BigInt(0);
    }
    this.signature.assertValidPage(pageNo, adjust);
  };
  AndrewsHandStrategy.prototype.computePageContent = function (pageNo) {
    this.assertValidPage(pageNo);
    var result = squashed.decode(pageNo, this.signature.handLength);
    return result;
  };
  AndrewsHandStrategy.prototype.computePageNumber = function (cards) {
    this.signature.assertValidHand(cards);
    return squashed.encode(cards);
  };
  return AndrewsHandStrategy;
}();
exports.AndrewsHandStrategy = AndrewsHandStrategy;

},{"./choose.js":13,"./deal.js":14,"./squashed.js":19}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.multinomial = exports.choose = exports.ChooseCache = void 0;
/*
* Basic code to compute binomial coefficients.
*
* Caches in a Pascal Triangle of size 52 by default
*/
var ChooseCache = /** @class */function () {
  function ChooseCache(size) {
    var _this = this;
    this.rows = Array.from({
      length: size + 1
    }, function (v, index) {
      return _this.blankRow(index);
    });
  }
  Object.defineProperty(ChooseCache.prototype, "size", {
    get: function () {
      return this.rows.length - 1;
    },
    enumerable: false,
    configurable: true
  });
  ChooseCache.prototype.blankRow = function (rowNum) {
    // We only need half the row
    var columns = Math.floor(rowNum / 2) + 1;
    var row = new Array(columns);
    row[0] = BigInt(1);
    return row;
  };
  ChooseCache.prototype.addRow = function () {
    this.rows.push(this.blankRow(this.size + 1));
  };
  ChooseCache.prototype.row = function (n) {
    while (this.size < n) {
      this.addRow();
    }
    // this.rows[n] = this.rows[n] || this.blankRow(n)
    return this.rows[n];
  };
  ChooseCache.prototype.smallK = function (n, k) {
    if (2 * k > n) {
      return n - k;
    }
    return k;
  };
  ChooseCache.prototype.choose = function (n, k) {
    k = this.smallK(n, k);
    if (k < 0) {
      return BigInt(0);
    }
    var row = this.row(n);
    row[k] = row[k] || this.choose(n - 1, k - 1) + this.choose(n - 1, k);
    return row[k];
  };
  return ChooseCache;
}();
exports.ChooseCache = ChooseCache;
var DefaultCache = new ChooseCache(52);
for (var k = 0; k <= 26; k++) {
  DefaultCache.choose(52, k);
}
var choose = function (n, k) {
  return DefaultCache.choose(n, k);
};
exports.choose = choose;
var multinomial = function (parts) {
  var sum = 0;
  var product = BigInt(1);
  parts.forEach(function (k) {
    sum += k;
    product *= choose(sum, k);
  });
  return product;
};
exports.multinomial = multinomial;

},{}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bridgeSignature = exports.bridgeHandSignature = exports.NumericDeal = exports.HandSignature = exports.DealSignature = void 0;
var _choose = require("./choose.js");
// Common numeric deal logic and types

var DealSignature = /** @class */function () {
  function DealSignature(cardsPerSeat) {
    this.perSeat = Array.from(cardsPerSeat);
    this.seats = cardsPerSeat.length;
    this.cards = cardsPerSeat.reduce(function (total, nextVal) {
      return total + nextVal;
    });
    this.pages = (0, _choose.multinomial)(cardsPerSeat);
  }
  Object.defineProperty(DealSignature.prototype, "lastPage", {
    get: function () {
      return this.pages - BigInt(1);
    },
    enumerable: false,
    configurable: true
  });
  DealSignature.prototype.toString = function () {
    return 'DealSignature(' + this.perSeat.toString() + ')';
  };
  DealSignature.prototype.validSeat = function (seatNum) {
    return seatNum >= 0 && seatNum < this.seats;
  };
  DealSignature.prototype.validHands = function (hands) {
    return hands.length == this.seats && this.perSeat.every(function (len, seatNum) {
      return len == hands[seatNum].length;
    });
  };
  DealSignature.prototype.equals = function (otherSig) {
    if (this === otherSig) {
      return true;
    }
    if (this.seats != otherSig.seats) {
      return false;
    }
    return this.perSeat.every(function (value, index) {
      return value == otherSig.perSeat[index];
    });
  };
  Object.defineProperty(DealSignature.prototype, "bits", {
    get: function () {
      this._bits = this._bits || this.computeBits();
      return this._bits;
    },
    enumerable: false,
    configurable: true
  });
  DealSignature.prototype.assertEqual = function (otherSig, message) {
    if (message === void 0) {
      message = "Unmatching deal signature";
    }
    if (this.equals(otherSig)) {
      return;
    }
    throw new TypeError(message + ": Expected " + this.toString() + ", got " + otherSig.toString());
  };
  DealSignature.prototype.assertValidPageNo = function (pageNo) {
    if (pageNo >= this.pages || pageNo < BigInt(0)) {
      throw new RangeError("Invalid page " + pageNo + " outside range <=" + this.pages.toString());
    }
  };
  DealSignature.prototype.computeBits = function () {
    var bits = 0;
    var pages = this.pages;
    var two = BigInt(2);
    while (pages > BigInt(0)) {
      bits++;
      pages /= two;
    }
    return bits;
  };
  return DealSignature;
}();
exports.DealSignature = DealSignature;
var HandSignature = /** @class */function () {
  function HandSignature(handLength, deckLength) {
    this.handLength = handLength;
    this.cards = deckLength;
    this.pages = (0, _choose.choose)(deckLength, handLength);
  }
  Object.defineProperty(HandSignature.prototype, "lastPage", {
    get: function () {
      return this.pages - BigInt(1);
    },
    enumerable: false,
    configurable: true
  });
  HandSignature.prototype.assertValidCard = function (card) {
    if (card < 0 || card >= this.cards) {
      throw new TypeError('Invalid card number ' + card + ', should be between 0 and ' + (this.cards - 1));
    }
  };
  HandSignature.prototype.assertValidPage = function (pageNo, adjust) {
    if (adjust === void 0) {
      adjust = BigInt(0);
    }
    if (pageNo < BigInt(0) || pageNo >= this.pages) {
      throw new Error('Page out of bounds: ' + (pageNo + adjust));
    }
  };
  HandSignature.prototype.assertValidHand = function (numbers) {
    if (numbers.length != this.handLength) {
      throw new Error('Expected ' + this.handLength + ' cards, got ' + numbers.length);
    }
    var last = -1;
    for (var i = 0; i < numbers.length; i++) {
      var card = numbers[i];
      if (card <= last) {
        throw new TypeError('Expected sorted list of card numbers');
      }
      this.assertValidCard(card);
      last = card;
    }
    // TODO check cards are distinct
  };

  return HandSignature;
}();
/**
 * A standard bridge signature - four seats, each seat getting 13 cards
 */
exports.HandSignature = HandSignature;
var bridgeSignature = new DealSignature([13, 13, 13, 13]);
exports.bridgeSignature = bridgeSignature;
function buildHands(signature, toWhom) {
  var hands = signature.perSeat.map(function () {
    return new Array(0);
  });
  toWhom.forEach(function (seat, card) {
    if (signature.validSeat(seat)) {
      hands[seat].push(card);
    } else {
      throw RangeError('Invalid seat ' + seat + ' for deal in with ' + signature.seats + ' seats');
    }
  });
  return hands;
}
/**
 *  A deal which matches a signature
 *
 * Cards in a NumericDeal are just indexes from zero to one
 * less than the number of cards in the signature. No meaning
 * is implied by the seat numbers - they will be mapped in
 * the bridge package.
 */
var NumericDeal = /** @class */function () {
  function NumericDeal(sig, toWhom) {
    if (toWhom.length != sig.cards) {
      throw TypeError('Wrong number of cards in deal. Expected' + sig.cards + ', got ' + toWhom.length);
    }
    this.signature = sig;
    this.toWhom = Array.from(toWhom);
    this.hands = buildHands(sig, toWhom);
    this.validateSignature();
  }
  NumericDeal.prototype.validateSignature = function () {
    if (!this.signature.validHands(this.hands)) {
      throw new TypeError('Invalid deal signature');
    }
  };
  return NumericDeal;
}();
exports.NumericDeal = NumericDeal;
var bridgeHandSignature = new HandSignature(13, 52);
exports.bridgeHandSignature = bridgeHandSignature;

},{"./choose.js":13}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "AndrewsDealStrategy", {
  enumerable: true,
  get: function () {
    return _andrews.AndrewsDealStrategy;
  }
});
Object.defineProperty(exports, "AndrewsHandStrategy", {
  enumerable: true,
  get: function () {
    return _andrews.AndrewsHandStrategy;
  }
});
Object.defineProperty(exports, "DealSignature", {
  enumerable: true,
  get: function () {
    return _deal.DealSignature;
  }
});
Object.defineProperty(exports, "MultiplierScrambler", {
  enumerable: true,
  get: function () {
    return _scramble.MultiplierScrambler;
  }
});
Object.defineProperty(exports, "NumericDeal", {
  enumerable: true,
  get: function () {
    return _deal.NumericDeal;
  }
});
Object.defineProperty(exports, "PavlicekDealStrategy", {
  enumerable: true,
  get: function () {
    return _pavlicek.PavlicekDealStrategy;
  }
});
Object.defineProperty(exports, "PavlicekHandStrategy", {
  enumerable: true,
  get: function () {
    return _pavlicek.PavlicekHandStrategy;
  }
});
Object.defineProperty(exports, "ScrambleStrategy", {
  enumerable: true,
  get: function () {
    return _scramble.ScrambleStrategy;
  }
});
Object.defineProperty(exports, "bridgeSignature", {
  enumerable: true,
  get: function () {
    return _deal.bridgeSignature;
  }
});
Object.defineProperty(exports, "scramble_book", {
  enumerable: true,
  get: function () {
    return _scramble.scramble_book;
  }
});
var _deal = require("./deal.js");
var _andrews = require("./andrews.js");
var _pavlicek = require("./pavlicek.js");
var _scramble = require("./scramble.js");

},{"./andrews.js":12,"./deal.js":14,"./pavlicek.js":17,"./scramble.js":18}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.long_gcd = long_gcd;
exports.modular_inverse = modular_inverse;
exports.safe_mod = safe_mod;
// File constants
var zero = BigInt(0);
var one = BigInt(1);
function abs(value) {
  if (value < BigInt(0)) {
    return -value;
  } else {
    return value;
  }
}
function safe_mod(n1, n2) {
  // Computes n1 % n2, but with values r in range
  // 0 <= r < abs(n2)
  // The % operator sometimes returns negative numbers
  n2 = abs(n2);
  var result = n1 % n2;
  if (result < zero) {
    return result + n2;
  } else {
    return result;
  }
}
function long_gcd(m, n) {
  var quotients = Array();
  m = abs(m);
  if (m == zero) {
    throw Error('long_gcd cannot be called when m is zero');
  }
  n = safe_mod(n, m);
  while (n != zero) {
    var q = m / n;
    var r = m % n;
    quotients.push(q);
    m = n;
    n = r;
  }
  return {
    gcd: m,
    quotients: quotients
  };
}
function buildInverseFromQuotients(quotients) {
  // Standard algorithm for contiued fraction expansion
  // Numerators only needed.
  //
  // If m/n is a fraction, then the penultimate continued fraction for m/n, p/q,
  // satisfies np-mq= +/- 1, depending on the parity of the number of terms. So the
  // inverse with be +/- p. Here we compute the continued fraction numerators only.
  //
  var p_0 = zero,
    p_1 = one;
  quotients.forEach(function (quotient) {
    var p_new = p_1 * quotient + p_0;
    p_0 = p_1;
    p_1 = p_new;
  });
  if (quotients.length % 2 == 1) {
    return p_0;
  } else {
    return p_1 - p_0;
  }
}
function modular_inverse(modulus, unit) {
  if (modulus < zero) {
    modulus = -modulus;
  }
  unit = safe_mod(unit, modulus);
  var result = long_gcd(modulus, unit);
  if (result.gcd != one) {
    throw Error('Modulus ' + modulus + ' and unit ' + unit + ' are not relatively prime, gcd=' + result.gcd);
  }
  return buildInverseFromQuotients(result.quotients);
}

},{}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Remaining = exports.Range = exports.PavlicekHandStrategy = exports.PavlicekDealStrategy = void 0;
var _deal = require("./deal.js");
var Range = /** @class */function () {
  function Range(start, width) {
    this.start = start;
    this.width = width;
  }
  Object.defineProperty(Range.prototype, "last", {
    get: function () {
      return this.start + this.width;
    },
    enumerable: false,
    configurable: true
  });
  Range.prototype.contains = function (num) {
    return num >= this.start && num < this.last;
  };
  Range.prototype.computeWidth = function (numerator, denominator) {
    return this.width * BigInt(numerator) / BigInt(denominator);
  };
  return Range;
}();
exports.Range = Range;
var Remaining = /** @class */function () {
  function Remaining(perSeat, total) {
    this.perSeat = Array.from(perSeat);
    this.toWhom = new Array(total);
    this.total = total;
  }
  Remaining.prototype.checkedNextRange = function (range, pageNo, card) {
    var nextStart = range.start;
    for (var seat = 0; seat < this.perSeat.length; seat++) {
      var cards = this.perSeat[seat];
      var width = range.computeWidth(cards, this.total);
      var nextRange = new Range(nextStart, width);
      if (nextRange.contains(pageNo)) {
        this.toWhom[card] = seat;
        this.total--;
        this.perSeat[seat]--;
        return nextRange;
      }
      nextStart = nextStart + width;
    }
    throw new Error('Could not find seat for card ' + card + ' and page ' + pageNo);
  };
  Remaining.prototype.nextRange = function (range, pageNo, card) {
    /**
    * Used when computing a deal from a page number
    */
    if (!range.contains(pageNo)) {
      throw new RangeError('Invalid page number ' + pageNo.toString());
    }
    return this.checkedNextRange(range, pageNo, card);
  };
  Remaining.prototype.nextCard = function (card, seat, range) {
    /**
    * Used when computing a page number from a deal
    */
    var skip = 0;
    for (var skipSeat = 0; skipSeat < seat; skipSeat++) {
      skip += this.perSeat[skipSeat];
    }
    var newStart = range.start + range.computeWidth(skip, this.total);
    var width = range.computeWidth(this.perSeat[seat], this.total);
    this.total -= 1;
    this.perSeat[seat] -= 1;
    return new Range(newStart, width);
  };
  return Remaining;
}();
exports.Remaining = Remaining;
var PavlicekDealStrategy = /** @class */function () {
  function PavlicekDealStrategy(signature) {
    if (signature === void 0) {
      signature = _deal.bridgeSignature;
    }
    this.signature = signature;
  }
  Object.defineProperty(PavlicekDealStrategy.prototype, "pages", {
    get: function () {
      return this.signature.pages;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(PavlicekDealStrategy.prototype, "lastPage", {
    get: function () {
      return this.signature.lastPage;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(PavlicekDealStrategy.prototype, "baseRange", {
    /**
    * The range for all pages for this strategy
    */
    get: function () {
      return new Range(BigInt(0), this.pages);
    },
    enumerable: false,
    configurable: true
  });
  PavlicekDealStrategy.prototype.computePageContent = function (pageNo) {
    this.signature.assertValidPageNo(pageNo);
    var sig = this.signature;
    var remaining = new Remaining(sig.perSeat, sig.cards);
    var range = this.baseRange;
    for (var card = 0; card < sig.cards; card++) {
      range = remaining.nextRange(range, pageNo, card);
    }
    return new _deal.NumericDeal(sig, remaining.toWhom);
  };
  PavlicekDealStrategy.prototype.computePageNumber = function (deal) {
    this.signature.assertEqual(deal.signature, 'Mismatched signatures for Deal and PavlicekDealStrategy');
    var range = this.baseRange;
    var remaining = new Remaining(deal.signature.perSeat, deal.signature.cards);
    deal.toWhom.forEach(function (seat, card) {
      range = remaining.nextCard(card, seat, range);
    });
    if (range.width != BigInt(1)) {
      // Shouldn't normally be reached
      throw new Error('Got range width ' + range.width.toString() + ' after decode');
    }
    return range.start;
  };
  return PavlicekDealStrategy;
}();
exports.PavlicekDealStrategy = PavlicekDealStrategy;
var PavlicekHandStrategy = /** @class */function () {
  function PavlicekHandStrategy(sig, cls) {
    if (sig === void 0) {
      sig = _deal.bridgeHandSignature;
    }
    if (cls === void 0) {
      cls = PavlicekDealStrategy;
    }
    this.signature = sig;
    var dSig = new _deal.DealSignature([sig.handLength, sig.cards - sig.handLength]);
    this.pStrategy = new cls(dSig);
  }
  Object.defineProperty(PavlicekHandStrategy.prototype, "pages", {
    get: function () {
      return this.signature.pages;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(PavlicekHandStrategy.prototype, "lastPage", {
    get: function () {
      return this.signature.lastPage;
    },
    enumerable: false,
    configurable: true
  });
  PavlicekHandStrategy.prototype.assertValidPage = function (pageNo, adjust) {
    if (adjust === void 0) {
      adjust = BigInt(0);
    }
    this.signature.assertValidPage(pageNo, adjust);
  };
  PavlicekHandStrategy.prototype.computePageContent = function (pageNo) {
    this.assertValidPage(pageNo);
    var rawDeal = this.pStrategy.computePageContent(pageNo);
    return rawDeal.hands[0];
  };
  PavlicekHandStrategy.prototype.computePageNumber = function (cards) {
    var toWhom = new Array(this.signature.cards);
    for (var i = 0; i < this.signature.cards; i++) {
      toWhom[i] = 1;
    }
    cards.forEach(function (card) {
      toWhom[card] = 0;
    });
    var deal = new _deal.NumericDeal(this.pStrategy.signature, toWhom);
    return this.pStrategy.computePageNumber(deal);
  };
  return PavlicekHandStrategy;
}();
exports.PavlicekHandStrategy = PavlicekHandStrategy;

},{"./deal.js":14}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ScrambleStrategy = exports.MultiplierScrambler = void 0;
exports.scramble_book = scramble_book;
var _modinverse = require("./modinverse.js");
// A crude way to create scrambled deal strategies

var MultiplierScrambler = /** @class */function () {
  function MultiplierScrambler(pages, multiplier, translate) {
    var inverse = (0, _modinverse.modular_inverse)(pages, multiplier);
    this.scramble = function (pageNo) {
      return (0, _modinverse.safe_mod)(pageNo * multiplier + translate, pages);
    };
    this.unscramble = function (pageNo) {
      return (0, _modinverse.safe_mod)((pageNo - translate) * inverse, pages);
    };
  }
  return MultiplierScrambler;
}();
exports.MultiplierScrambler = MultiplierScrambler;
var ScrambleStrategy = /** @class */function () {
  function ScrambleStrategy(baseStrategy, scrambler) {
    this.base = baseStrategy;
    this.scrambler = scrambler;
  }
  Object.defineProperty(ScrambleStrategy.prototype, "signature", {
    get: function () {
      return this.base.signature;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(ScrambleStrategy.prototype, "pages", {
    get: function () {
      return this.base.pages;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(ScrambleStrategy.prototype, "lastPage", {
    get: function () {
      return this.base.lastPage;
    },
    enumerable: false,
    configurable: true
  });
  ScrambleStrategy.prototype.computePageContent = function (pageNo) {
    var basePage = this.scrambler.scramble(pageNo);
    return this.base.computePageContent(basePage);
  };
  ScrambleStrategy.prototype.computePageNumber = function (deal) {
    var basePage = this.base.computePageNumber(deal);
    return this.scrambler.unscramble(basePage);
  };
  return ScrambleStrategy;
}();
exports.ScrambleStrategy = ScrambleStrategy;
function scramble_book(base, multiplier, translate) {
  var scrambler = new MultiplierScrambler(base.signature.pages, multiplier, translate);
  return new ScrambleStrategy(base, scrambler);
}

},{"./modinverse.js":16}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decode = decode;
exports.encode = encode;
var _choose = require("./choose.js");
/**
* The squashed order is a total order on all sets of n
* natural number. For example, when n=3, the order start:
*     012,013,023,123,014,024,034,124,134,234,...
*
* The order has a convenient feature that we can find the index
* of a set in this order just from the set.
*/
/**
* Compute the index in the squashed order for a set of values
*
* @param sortedValues - a set of sorted values
* @returns bigint index of the set of values in the squashed order
*
* Assumes the sortedValues are sorted and distinct - nothing
* ensures this.
*/
function encode(sortedValues) {
  var binomials = sortedValues.map(function (value, index) {
    return (0, _choose.choose)(value, index + 1);
  });
  return binomials.reduce(function (sum, current) {
    return sum + current;
  });
}
/**
 * Find the largest value k such that (k chooose n)<index
 *
 * @param index
 * @param n
 * @returns The largest value k
 */
function largestLessThan(index, n) {
  var k = n - 1;
  while ((0, _choose.choose)(k + 1, n) <= index) {
    k = k + 1;
  }
  return k;
}
/**
 * Find the set of size n of the given index in the squashed order.
 *
 * @param index - the index
 * @param n - the size of the sets
 * @returns a sorted array of distinct natural numbers
 */
function decode(index, n) {
  // Compute the n-subset of the natural numbers with the
  // given index.
  var result = Array(n);
  while (n > 0) {
    result[n - 1] = largestLessThan(index, n);
    index -= (0, _choose.choose)(result[n - 1], n);
    n = n - 1;
  }
  return result;
}

},{"./choose.js":13}]},{},[1]);
