var util = require("../lib/util");
var regex = util.regex;
var track = util.track;

track("vegan");

var adverbs = [
    ' liebend', ' auch', ' schon', ' manchmal', ' oft', ' eigentlich', 'voll'
];
var adverbsRegexSet = adverbs.join('|');

module.exports = [
    regex ("(will|möchte|sollte) mich vegan ernähren"),
    regex ("(will|möchte)( endlich| auch| gerne| bald)? vegan (werden|sein|leben|essen)"),
    regex ("(will|möchte) wieder vegan (sein|werden|leben|essen)"),
    regex ("überlege(" + adverbsRegexSet + ")? vegan zu werden"),
    regex ("wäre(" + adverbsRegexSet + ")? gerne vegan"),
    regex ("würde( ja)?(" + adverbsRegexSet + ") gerne vegan (werden|sein|leben|essen)"),
    regex ("hab(" + adverbsRegexSet + ") bock vegan zu werden"),
    regex ("versuche( " + adverbsRegexSet + ")?( gerade)? vegan zu werden"),
    regex ("würde mich( " + adverbsRegexSet + ")? gerne vegan ernähren")
]
