import { BridgeBook } from "../bridge/book.js";
import { Seats } from "../bridge/constants.js";
import { AndrewsStrategy, PavlicekStrategy, scramble_book } from "../numeric/index.js";
function scramble(strategy) {
    var multiplier = BigInt("13109994191499930367061460371");
    var translation = BigInt("34563463456363563565356345634");
    return scramble_book(strategy, multiplier, translation);
}
function edition(book) {
    var scrambledStrat = scramble(book.strategy);
    var scrambled = new BridgeBook(scrambledStrat, book.seatMap, book.cardMap);
    return { book: book, scrambled: scrambled };
}
function pavlicekBook() {
    var strategy = new PavlicekStrategy(undefined);
    return new BridgeBook(strategy, undefined, undefined);
}
function andrewsBook() {
    var strategy = new AndrewsStrategy(undefined);
    var seatMap = function (seatNumber) { return Seats.all[3 - seatNumber]; };
    return new BridgeBook(strategy, seatMap, undefined);
}
function build_editions() {
    var editions = new Map();
    editions.set("Pavlicek", edition(pavlicekBook()));
    editions.set("Andrews", edition(andrewsBook()));
    return editions;
}
export { build_editions };
