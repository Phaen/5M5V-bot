#!/usr/bin/env node

require('dotenv').config();

if ([
  'TWEETS_API_ENDPOINT',
  'TWEETS_API_KEY',
  'TWITTER_EMAIL',
  'TWITTER_USERNAME',
  'TWITTER_PASSWORD',
].some(key => !process.env[key])) {
  console.error('One or more required environment variables are missing. Exiting.');
  process.exit(1);
}

const { Rettiwt } = require('rettiwt-api');
const axios = require('axios');

const TweetFilter = require('./lib/filter');
const util = require('./lib/util');

const pollingIntervalMs = 21 * 60 * 1000;
const retryLoginDelayMs = 5 * 60 * 1000;
const isDryRun = process.argv[2] === '--dry-run';

const languageKeys = {
  english: 'en',
  french: 'fr',
  spanish: 'es',
  german: 'de',
};

const tweetFilter = new TweetFilter([], Object.keys(languageKeys));

const streamFilter = {
  includeWords: [
    util.trackedTerms.map(term => `"${term}"`).join(' OR '),
    '"want" OR "would like" OR "thinking of" OR "should try" OR "planning on" OR "souhaite" OR "veux" OR "ai envie de" OR "aspire à" OR "espère" OR "quiero" OR "deseo" OR "tengo ganas de" OR "aspiro a" OR "will" OR "möchte" OR "begehre" OR "verlange" OR "sehne mich nach" OR "erwünsche"',
  ],
};

let twitterApiKey = null;

(async () => {
  twitterApiKey = await loginToTwitter();

  while (true) {
    const rettiwt = new Rettiwt({ apiKey: twitterApiKey });

    console.log(isDryRun ? 'Looking for new tweets (dry run)...' : 'Looking for new tweets...');
    console.log('Search filter:', streamFilter);

    try {
      for await (const tweet of rettiwt.tweet.stream(streamFilter, pollingIntervalMs)) {
        const matchingLanguages = tweetFilter.matches(tweet) || [];

        console.log('Found tweet', tweet.id, tweet.fullText, matchingLanguages);

        for (const language of matchingLanguages) {
          try {
            if (!isDryRun) {
              await axios.post(process.env.TWEETS_API_ENDPOINT, {
                lang: languageKeys[language],
                tweets: [buildTweetPayload(tweet)],
              }, {
                headers: {
                  'X-API-KEY': process.env.TWEETS_API_KEY,
                },
             });
            }

            console.log(`Sent tweet ${tweet.id} in ${language}:\n${tweet.fullText}`);
          } catch (error) {
            console.error(`Unable to send tweet ${tweet.id} in ${language}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error while streaming tweets: ${error.message}`);

      if (error.constructor.name === 'RettiwtError' && error.code === 32) {
        twitterApiKey = await loginToTwitter();
      }
    }
  }
})();

async function loginToTwitter() {
  while (true) {
    try {
      console.log('Logging in...');

      const apiKey = await new Rettiwt().auth.login(
        process.env.TWITTER_EMAIL,
        process.env.TWITTER_USERNAME,
        process.env.TWITTER_PASSWORD,
      );

      if (!apiKey) {
        throw new Error('No API key returned');
      }

      console.log('Logged in!');

      return apiKey;
    } catch (e) {
      console.error(`Unable to log in: ${e.message}`);

      await new Promise(resolve => setTimeout(resolve, retryLoginDelayMs));
    }
  }
}

function buildTweetPayload(tweet) {
  return {
    id: tweet.id,
    date: tweet.createdAt,
    text: tweet.fullText,
    from_user_name: tweet.tweetBy.fullName,
    from_full_name: tweet.tweetBy.fullName,
    from_profile_image: tweet.tweetBy.profileImage,
    view_count: ~~tweet.viewCount,
    like_count: ~~tweet.likeCount,
    reply_count: ~~tweet.replyCount,
    retweet_count: ~~tweet.retweetCount,
    quote_count: ~~tweet.quoteCount,
    media: (tweet.media ?? []).map(media => ({ ...media })),
  };
}
