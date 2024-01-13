var TweetFilter = require('../lib/filter.js')
var filter = new TweetFilter(['excludeme'], ['english'])

exports.reply = function(test) {
    var replyTweet = {retweeted: false, fullText: "@someone test", tweetBy: {description: "", fullName: "", userName: ""}};
    test.ok(!filter.matches(replyTweet), "Filter should not match @reply tweets");
    replyTweet.fullText = "test";
    test.ok(filter.matches(replyTweet), "Filter should match tweets that aren't @replies");
    test.done();
}

exports.excludedTerms = function(test) {
    var unexcludedTweet = {retweeted: false, fullText: "test", tweetBy: {description: "", fullName: "", userName: ""}};
    test.ok(filter.matches(unexcludedTweet), "Filter should match tweets that don't have any excluded terms in their bio/name/username");

    var excludedBioTweet = {retweeted: false, fullText: "test", tweetBy: {description: "Something and excludeme", fullName: "", userName: ""}};
    var excludedNameTweet = {retweeted: false, fullText: "test", tweetBy: {description: "", fullName: "EXCLUDEME", userName: ""}};
    var excludedScreenNameTweet = {retweeted: false, fullText: "test", tweetBy: {description: "", fullName: "", userName: "excludeme"}};

    test.ok(!filter.matches(excludedBioTweet), "Filter should not match tweets from users with excluded terms in their bio");
    test.ok(!filter.matches(excludedNameTweet), "Filter should not match tweets from users with excluded terms in their name");
    test.ok(!filter.matches(excludedScreenNameTweet), "Filter should not match tweets from users with excluded terms in their screen name");
    test.done();
}

exports.numMatches = function(test) {
    test.equal(TweetFilter.getAllMatches("testtesttest", "test").length, 3, "Plain string matching matches all instances of the pattern");
    test.equal(TweetFilter.getAllMatches("testtestTEST", "Test").length, 3, "Plain string matching is case sensitive");
    test.equal(TweetFilter.getAllMatches("testtestTEST", /test/i).length, 1, "Regex without the global flag only matches the first match");
    test.equal(TweetFilter.getAllMatches("testtestTEST", /test/gi).length, 3, "Regex with the global flag matches all instances of the pattern");
    test.done();
}

exports.exclusionFilters = function(test) {
	var excludeBefore = ["match", /no $/i];
	test.equal(TweetFilter.getAllMatches("no before match after", excludeBefore).length, 1)
	test.equal(TweetFilter.getAllMatches("before no match after", excludeBefore).length, 0)

	var excludeBeforeOrAfter = ["match", /no $/i, /^ nope/i];
	test.equal(TweetFilter.getAllMatches("no before match after nope", excludeBeforeOrAfter).length, 1)
	test.equal(TweetFilter.getAllMatches("before no match after", excludeBeforeOrAfter).length, 0)
	test.equal(TweetFilter.getAllMatches("before match nope after", excludeBeforeOrAfter).length, 0)

	var excludeAfter = ["match", null, /^ nope/i];
	test.equal(TweetFilter.getAllMatches("no before match after nope", excludeAfter).length, 1)
	test.equal(TweetFilter.getAllMatches("before no match after", excludeAfter).length, 1)
	test.equal(TweetFilter.getAllMatches("before match nope after", excludeAfter).length, 0)

	var excludeFunction = ["match", function(phrase, beforePhrase, afterPhrase, startIndex, fullText) {
		var shouldBeExcluded = beforePhrase.length !== 0 || afterPhrase.length !== 5;
		return shouldBeExcluded;
	}]
	test.equal(TweetFilter.getAllMatches("match five", excludeFunction).length, 1)
	test.equal(TweetFilter.getAllMatches("match after", excludeFunction).length, 0)
	test.equal(TweetFilter.getAllMatches("before match five", excludeFunction).length, 0)

	test.done();
}
