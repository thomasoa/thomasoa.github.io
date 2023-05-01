import { build_editions } from "./books.js";
var Application = /** @class */ (function () {
    function Application() {
        this.currentDeal = -1;
        this.editions = build_editions();
        this.deals = new Array();
        this.callbacks = {
            updateCurrentDeal: new Array(),
            updateDealCount: new Array()
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
    Application.prototype.nextDeal = function () {
        if (!this.allowNext) {
            throw Error('Cannot go to next page');
        }
        this.updateCurrent(this.currentDeal + 1);
    };
    Application.prototype.previousDeal = function () {
        if (!this.allowPrevious) {
            throw Error('Cannot go to previous deal');
        }
        this.updateCurrent(this.currentDeal - 1);
    };
    Object.defineProperty(Application.prototype, "allowNext", {
        get: function () {
            return (this.currentDeal >= 0 && this.currentDeal < this.length - 1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Application.prototype, "allowPrevious", {
        get: function () {
            return this.currentDeal > 0;
        },
        enumerable: false,
        configurable: true
    });
    Application.prototype.addDeal = function (deal) {
        this.deals.push(deal);
        this.updateCount();
        return this.length;
    };
    Application.prototype.findDeals = function (editionName, scramble, pages) {
        if (pages.length == 0) {
            return;
        }
        var book = this.book(editionName, scramble);
        var newCurrent = this.length;
        var newDeals = pages.map(function (page) {
            var deal = book.getDeal(page);
            return {
                deal: deal,
                edition: editionName,
                scrambled: scramble,
                pageNo: page
            };
        });
        var _this = this;
        newDeals.forEach(function (deal) { return _this.addDeal(deal); });
        this.updateCurrent(newCurrent);
    };
    Application.prototype.findDeal = function (edition, scrambled, page) {
        this.findDeals(edition, scrambled, [page]);
    };
    Object.defineProperty(Application.prototype, "editionNames", {
        get: function () {
            return Array.from(this.editions.keys());
        },
        enumerable: false,
        configurable: true
    });
    Application.prototype.book = function (editionName, scrambled) {
        var edition = this.editions.get(editionName);
        if (scrambled) {
            return edition.scrambled;
        }
        else {
            return edition.book;
        }
    };
    Application.prototype.updateCount = function () {
        var _this_1 = this;
        this.callbacks.updateDealCount.forEach(function (callback) { return callback(_this_1.length); });
    };
    Application.prototype.reset = function () {
        this.deals = new Array(0);
        this.updateCount();
        this.updateCurrent(-1);
    };
    Application.prototype.listenCurrentDeal = function (callback) {
        this.callbacks.updateCurrentDeal.push(callback);
    };
    Application.prototype.listenDealCount = function (callback) {
        this.callbacks.updateDealCount.push(callback);
    };
    Application.prototype.updateCurrent = function (currentDeal) {
        if (currentDeal >= this.length) {
            throw Error('No deal number' + currentDeal);
        }
        if (currentDeal < 0) {
            if (this.length > 0) {
                throw Error("Cannot set current deal to a negative value when deals exist");
            }
            currentDeal = -1;
        }
        this.currentDeal = currentDeal;
        var deal;
        this.currentDeal = currentDeal;
        if (currentDeal < 0) {
            deal = undefined;
        }
        else {
            deal = this.deals[this.currentDeal];
        }
        this.callbacks.updateCurrentDeal.forEach(function (callback) { return callback(currentDeal, deal); });
    };
    return Application;
}());
export { Application };
