var random = require("./random.js");
import { bridgeSignature } from "./deal.js";
export function randomPageNumber(signature) {
    if (signature === void 0) { signature = bridgeSignature; }
    var bits = signature.bits;
    while (true) {
        var value = random(bits);
        if (value < signature.pages) {
            return value;
        }
    }
}
