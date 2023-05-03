import { BridgeBook, SimpleBijection } from "../bridge/index.js";
import { Seats } from "../bridge/constants.js";
import { AndrewsStrategy, PavlicekStrategy, scramble_book } from "../numeric/index.js";
function scramble(strategy) {
    // Copied from original Impossible Bridge Book
    var multiplier = BigInt("13109994191499930367061460371");
    var translation = BigInt("34563463456363563565356345634");
    return scramble_book(strategy, multiplier, translation);
}
function edition(book) {
    var scrambledStrat = scramble(book.strategy);
    var scrambled = new BridgeBook(scrambledStrat, book.seatBijection, book.cardBijection);
    return { normal: book, scrambled: scrambled };
}
function pavlicekBook() {
    var strategy = new PavlicekStrategy();
    return new BridgeBook(strategy);
}
function andrewsBook() {
    var strategy = new AndrewsStrategy();
    var seatBijection = new SimpleBijection(Seats.all, function (seatNumber) { return 3 - seatNumber; });
    return new BridgeBook(strategy, seatBijection);
}
function build_editions() {
    var editions = new Map();
    editions.set("Pavlicek", edition(pavlicekBook()));
    editions.set("Andrews", edition(andrewsBook()));
    return editions;
}
var BookSet = /** @class */ (function () {
    function BookSet() {
        this.editions = build_editions();
    }
    BookSet.prototype.names = function () {
        return Array.from(this.editions.keys());
    };
    BookSet.prototype.edition = function (name) {
        var edition = this.editions.get(name);
        if (edition)
            return edition;
        throw new Error('Invalid edition name: ' + name);
    };
    BookSet.prototype.book = function (name, scrambled) {
        var edition = this.edition(name);
        if (scrambled) {
            return edition.scrambled;
        }
        else {
            return edition.normal;
        }
    };
    return BookSet;
}());
export { BookSet };
