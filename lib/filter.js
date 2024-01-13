var path = require('path')

var TweetFilter = function(excluded_terms, filters) {
    this.filters = {}
    this.excluded_terms = excluded_terms || []

    this.getFiltersFromFiles(filters)
}

// load the file(s) and use its/their exports as filters
// the file should export arrays of strings/regex expressions
TweetFilter.prototype.getFiltersFromFiles = function(filters) {
    for( let i in filters ) {
        filter = filters[i]
        try {
            this.filters[filter] = require(path.join('..','filters', filter + '.js'))
        } catch(e) {
            console.error(`Unable to load filter ${filter}: ${e}`)
            process.exit()
        }
    }
}

TweetFilter.isPhraseQuoted = function(phrase, startIndex, fullText) {
    var beforePhrase = fullText.substring(0, startIndex)
    var afterPhrase = fullText.substring(startIndex + phrase.length)
    var numQuotesBefore = (beforePhrase.match(/"/g) || []).length
    var numQuotesAfter = (afterPhrase.match(/"/g) || []).length
    // we can be fairly certain the phrase is quoted
    // if the quote number is odd on either side
    // as this implies either unbalanced quotes
    // or the phrase being quoted
    return numQuotesBefore % 2 !== 0 || numQuotesAfter % 2 !== 0
}

// returns an object with the matching string at obj[0]
// and the starting index of the match at obj.index
// if no match is found, returns null
TweetFilter.getMatch = function(text, filter, lastIndex) {
    lastIndex = lastIndex || 0
    if (typeof filter == "string") {
        var indexStart = text.toLowerCase().indexOf(filter.toLowerCase(), lastIndex)
        if (indexStart > -1) {
            return { 0: text.substring(indexStart, indexStart + filter.length), index: indexStart }
        }
    }
    else if (filter instanceof RegExp) {
        return filter.exec(text)
    }
    return null
}

// returns an array of matches (see getMatch)
// adds a 'filter' property to each match containing
// the string/regex filter
TweetFilter.getAllMatches = function(text, filter) {
    var matches = []
    if (typeof filter == "string") {
        var nextIndex = 0
        var match
        while (match = TweetFilter.getMatch(text, filter, nextIndex)) {
            nextIndex = match.index + match[0].length
            matches.push(match)
        }
    }
    else if (filter instanceof RegExp) {
        var match
        if (filter.global) {
            while (match = TweetFilter.getMatch(text, filter)) {
                matches.push(match)
            }
        } else {
            if (match = TweetFilter.getMatch(text, filter)) {
                matches.push(match)
            }
        }
    }
    else if (Array.isArray(filter)) {
        var matchingFilter = filter[0]
        matches = TweetFilter.getAllMatches(text, matchingFilter)
        if (filter[1] instanceof RegExp || filter[2] instanceof RegExp) {
            var beforeExclusionFilter = filter[1] || null
            var afterExclusionFilter = filter[2] || null
            matches = matches.filter(function(match) {
                var phrase = match[0]
                var beforePhrase = text.substring(0, match.index)
                var afterPhrase = text.substring(match.index + phrase.length)
                var isExcluded = (beforeExclusionFilter && beforeExclusionFilter.test(beforePhrase)) || (afterExclusionFilter && afterExclusionFilter.test(afterPhrase))
                return !isExcluded
            })
        } else if (typeof filter[1] === "function") {
            var isExcludedFunction = filter[1]
            matches = matches.filter(function(match) {
                var phrase = match[0]
                var beforePhrase = text.substring(0, match.index)
                var afterPhrase = text.substring(match.index + phrase.length)
                return !isExcludedFunction(phrase, beforePhrase, afterPhrase, match.index, text)
            })
        }
    }
    return matches.map(function(match) {
        match.filter = filter
        return match
    })
}

// returns an array of matches that were matched by any filter in the filter list
// adds a 'filterList' property to each match containing the filter list used
TweetFilter.prototype.getMatchesForFilterList = function(text, filter_name) {
    var matches = []
    this.filters[filter_name].forEach(function(filter) {
        matches = matches.concat(TweetFilter.getAllMatches(text, filter))
    })
    return matches.map(function(match) {
        match.filterList = filter_name
        return match
    })
}

// returns an array of matches that were matched by any filter
TweetFilter.prototype.getMatchesForAllFilters = function(text) {
    var allFilterMatches = []
    for (let filter_name in this.filters) {
        var filterMatches = this.getMatchesForFilterList(text, filter_name)
        allFilterMatches = allFilterMatches.concat(filterMatches)
    }
    return allFilterMatches
}

TweetFilter.prototype.tweetContainsExcludedTerms = function(tweet) {
    return (this.excluded_terms.some( function(term) {
        var bio = tweet.tweetBy.description ? tweet.tweetBy.description.toLowerCase() : ''
        return (tweet.tweetBy.userName.toLowerCase().indexOf(term) > -1 || tweet.tweetBy.fullName.toLowerCase().indexOf(term) > -1 || bio.indexOf(term) > -1)
    }))
}

TweetFilter.prototype.tweetIsPrivateConvo = function(tweet) {
    return tweet.fullText[0] === '@'
}

TweetFilter.prototype.tweetContainsMultipleMentions = function(tweet) {
    return tweet.fullText.split('@').length - 1 > 1
}

TweetFilter.prototype.tweetIsEligible = function(tweet) {
    return !this.tweetContainsExcludedTerms(tweet) && !this.tweetIsPrivateConvo(tweet) && !this.tweetContainsMultipleMentions(tweet)
}

// returns an array containing all filters triggered
TweetFilter.prototype.matches = function(tweet_or_text) {
    var isTweet = typeof tweet_or_text !== 'string'

	if (isTweet && !this.tweetIsEligible(tweet_or_text))
        return false

    var text = !isTweet ? tweet_or_text : tweet_or_text.fullText
    var matches = this.getMatchesForAllFilters(text)

    var filters = []
    for( let i in matches ) {
        match = matches[i]
        if( !(match.filterList in filters) && !TweetFilter.isPhraseQuoted(match[0], match.index, text) )
            filters.push( match.filterList )
    }

    return filters
}

module.exports = TweetFilter
