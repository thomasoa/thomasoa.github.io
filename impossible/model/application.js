import { BookSet } from "./books.js";
var Application = /** @class */ (function () {
    function Application() {
        this.currentIndex = -1;
        this.books = new BookSet();
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
            return (this.currentIndex >= 0 && this.currentIndex < this.length - 1);
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
        this.callbacks.updateDealCount.forEach(function (callback) { return callback(_this.length); });
    };
    Application.prototype.reset = function () {
        this.deals = new Array(0);
        this.callbacks.applicationReset.forEach((function (callback) { callback(); }));
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
        this.callbacks.updateCurrentDeal.forEach(function (callback) { return callback(deal); });
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
}());
export { Application };
