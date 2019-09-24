var util = require("../lib/util");
var regex = util.regex;
var track = util.track;

track("vegan");

var adverbs = [
    ' liebend', ' auch', ' schon', ' manchmal', ' oft', ' eigentlich', 'voll'
];
var adverbsRegexSet = adverbs.join('|');

module.exports = [
    regex ("([I|i]ch )?(will|möchte|sollte) mich vegan ernähren"),
    regex ("([I|i]ch )?(will|möchte)( endlich| auch| gerne| bald)? vegan (werden|sein|leben|essen)"),
    regex ("([I|i]ch )?(will|möchte) wieder vegan (sein|werden|leben|essen)"),
    regex ("([I|i]ch )?überlege(" + adverbsRegexSet + ")? vegan zu werden"),
    regex ("([I|i]ch )?wäre(" + adverbsRegexSet + ")? gerne vegan"),
    regex ("([I|i]ch )?würde( ja)?(" + adverbsRegexSet + ") gerne vegan (werden|sein|leben|essen)"),
    regex ("([I|i]ch )?hab(" + adverbsRegexSet + ") bock vegan zu werden"),
    regex ("([I|i]ch )?versuche( " + adverbsRegexSet + ")?( gerade)? vegan zu werden"),
    regex ("([I|i]ch )?würde mich( " + adverbsRegexSet + ")? gerne vegan ernähren")
]