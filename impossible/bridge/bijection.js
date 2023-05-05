import { Deck, Seats } from "./constants.js";
var SimpleBijection = /** @class */ (function () {
    function SimpleBijection(allT, map) {
        if (map === void 0) { map = function (n) { return n; }; }
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
}());
var defaultBijectionSeat = new SimpleBijection(Seats.all);
var defaultBijectionCard = new SimpleBijection(Deck.cards);
export { SimpleBijection, defaultBijectionCard, defaultBijectionSeat };
