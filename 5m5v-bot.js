#!/usr/bin/env node

const fs = require('fs');
const yaml = require('js-yaml');
const { Rettiwt } = require('@jeto314/rettiwt-api');
const TweetFilter = require('./lib/filter');
const util = require('./lib/util');

let config = {};
try {
  config = yaml.safeLoad(fs.readFileSync('5m5v-config.yaml', 'utf8'));
} catch (error) {
  throw `Unable to load config file: ${error.message}`;
}

const languages = config.users.map(user => user.language);
const pollingIntervalMs = 40 * 1000;
const retweetDelayMs = config.delaytime || 2 * 60 * 1000;
const isDryRun = process.argv[2] === '--dry-run';

const tweetFilter = new TweetFilter(config.exclude, languages);
const rettiwt = new Rettiwt({ apiKey: config.users[0].api_key });

console.log(isDryRun ? 'Looking for new tweets (dry run)...' : 'Looking for new tweets...');

(async () => {
  for await (const tweet of rettiwt.tweet.stream({ includeWords: [util.trackedTerms.map(term => `"${term}"`).join(' OR ')] }, pollingIntervalMs)) {
    const matchingLanguages = tweetFilter.matches(tweet) || [];

    for (const language of matchingLanguages) {
      await new Promise(resolve => setTimeout(resolve, retweetDelayMs));

      try {
        if (!isDryRun) {
          const apiKey = config.users.find(user => user.language === language)?.api_key ?? null;
          const rettiwt = new Rettiwt({ apiKey });

          await rettiwt.tweet.retweet(tweet.id);
        }

        console.log(`Retweeted tweet ${tweet.id} in ${language}:\n${tweet.fullText}`);
      } catch (error) {
        console.error(`Unable to retweet ${tweet.id} in ${language}: ${error.message}`);
      }
    }
  }
})();
