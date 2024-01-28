const { Rettiwt } = require('rettiwt-api')
const util = require('./util')

module.exports = class {
    constructor(users, tweetFilter) {
        this.users = users
        this.tweetFilter = tweetFilter
    }

    async searchAndRetweet({
        startDate = new Date(),
        searchInterval = 30 * 1000,
        retweetDelay = 120 * 1000,
        isDryRun = false,
    } = {}) {
        const rettiwt = new Rettiwt({ apiKey: this.users[0].api_key })

        const count = 20
        let cursor = null
        let sinceId = null

        setInterval(async () => {
            try {
                const query = { startDate, sinceId, words: util.trackedTerms }
                const tweets = await rettiwt.tweet.search(query, count, cursor)

                for (const tweet of tweets.list) {
                    this.retweetInMatchingLanguages(tweet, { retweetDelay, isDryRun })
                }

                if (tweets.list.length === count) {
                    cursor = tweets.next?.value
                } else if (tweets.list.length > 0) {
                    sinceId = tweets.list[0]?.id
                }
            } catch (error) {
                console.error(`Unable to search tweets: ${error.message}`)
            }
        }, searchInterval)
    }

    async retweetInMatchingLanguages(tweet, {
        retweetDelay = 120 * 1000,
        isDryRun = false,
    } = {}) {
        const matchingLanguages = this.tweetFilter.matches(tweet) || []

        if (isDryRun) {
            for (const language of matchingLanguages) {
                console.log(`Retweeted tweet ${tweet.id} in (${language}): ${tweet.fullText}`)
            }

            return null
        }

        return Promise.all(matchingLanguages.map(async (language) => {
            return new Promise((resolve) => {
                setTimeout(async () => {
                    try {
                        resolve(await this.retweet(tweet.id, language))
                    } catch (error) {
                        console.error(`Unable to retweet: ${error.message}`)
                        resolve(null)
                    }
                }, retweetDelay)
            })
        }))
    }

    async retweet(tweetId, language) {
        const apiKey = this.users.find(user => user.language === language)?.api_key ?? null

        if (apiKey === null) {
            throw Error(`No user found for ${language} language`)
        }

        const rettiwt = new Rettiwt({ apiKey })

        return await rettiwt.tweet.retweet(tweetId)
    }
}
