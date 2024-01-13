var util = require("../lib/util");
var regex = util.regex;
var track = util.track;

track("vegan");

var adverbs = [
    'really', 'totally', 'probably', 'defin[ia]tely', 'absolutely', 'actually',
    'certainly', 'literally', 'legitimately', 'genuinely', 'honestly', 'truly',
    'undoubtedly', 'unquestionably', 'low-key', 'lowkey', 'low key'
];
var adverbsRegexSet = adverbs.join('|');

var recidivismAdjectives = [
	'hard', 'tough', 'difficult', 'rough'
];
var recidivismAdjectivesRegexSet = recidivismAdjectives.join('|');

var verbsPres = [ 'going', 'becoming( a)?', 'being( a)?', 'staying( a)?' ];
var verbsPresRegexSet = verbsPres.join('|');

var verbs = [ 'be( a)?', 'become( a)?', 'go', 'turn', '(try|consider) ' + verbsPresRegexSet ];
var verbsRegexSet = verbs.join('|');

module.exports = [
    // help me
    regex( "help me ((in|with) )?(" + verbsPresRegexSet + ") #?vegan" ),
    // i really want to go vegan
    regex( "i ((" + adverbsRegexSet + ") )?( might)?(might|have to|should|want to|wanna|would (like|love) to) (" + verbsRegexSet + ") #?vegan" ),
    // i should really go vegan (^ to avoid "don't tell me I should go vegan")
    regex( "^(i think )?i should ((" + adverbsRegexSet + ") )?(" + verbsRegexSet + ") #?vegan" ),
    // need help
    regex( "i ((" + adverbsRegexSet + ") )?(will |do )?(need|want) help (" + verbsPresRegexSet + ") #?vegan" ),
    regex( "i ((" + adverbsRegexSet + ") )?(want to|wanna|would like to|should) try (" + verbsPresRegexSet + ") #?vegan" ),
    // considering going vegan
    regex( "i('| a)?m ((" + adverbsRegexSet + ") )?(wondering|considering|thinking (about|of)|mulling over|planning on) (" + verbsPresRegexSet + ") #?vegan" ),
    regex( "i('| a)?m ((" + adverbsRegexSet + ") )?(considering| thinking )?(that )?(to|I should) go #?vegan" ),
    // wish I can vegan
    regex( "i ((" + adverbsRegexSet + ") )?(wish|hope) i ((could|can) (" + verbsRegexSet + ")?|was|were) #?vegan" ),
    // can picture going vegan
    regex( "i (can|could) ((" + adverbsRegexSet + ") )?(see|picture|imagine)( myself| me)? (" + verbsPresRegexSet + ") #?vegan"),
    // stemming recidivism
    regex( "i('| a)?m having a (" + recidivismAdjectivesRegexSet + ") time (to stay|staying|being) #?vegan"),
    regex( "don'?t know how much longer i( can| will|'ll) (stay|be) #?vegan")

]
