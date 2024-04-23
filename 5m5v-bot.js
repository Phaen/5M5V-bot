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

if ((config?.users || []).length === 0) {
  throw 'No users defined in config file';
}

if (!config.users.every(user => ['language', 'email', 'username', 'password'].every(key => key in (user ?? [])))) {
  throw 'At least one user is missing required fields in config file';
}

const languages = config.users.map(user => user.language);
const pollingIntervalMs = 40 * 1000;
const retweetDelayMs = config.delaytime || 2 * 60 * 1000;
const isDryRun = process.argv[2] === '--dry-run';
const tweetFilter = new TweetFilter(config.exclude, languages);

async function getApiKey(user) {
  if (!user.apiKey) {
    console.log(`Logging in as ${user.username}...`);

    user.apiKey = await new Rettiwt().auth.login(user.email, user.username, user.password);

    console.log('Logged in!');
  }

  return user.apiKey;
}

(async () => {
  while (true) {
    const rettiwt = new Rettiwt({ apiKey: await getApiKey(config.users[0]) });

    console.log(isDryRun ? 'Looking for new tweets (dry run)...' : 'Looking for new tweets...');

    try {
      for await (const tweet of rettiwt.tweet.stream({ includeWords: [util.trackedTerms.map(term => `"${term}"`).join(' OR ')] }, pollingIntervalMs)) {
        const matchingLanguages = tweetFilter.matches(tweet) || [];

        for (const language of matchingLanguages) {
          await new Promise(resolve => setTimeout(resolve, retweetDelayMs));

          const user = config.users.find(user => user.language === language);

          try {
            if (!isDryRun) {
              const rettiwt = new Rettiwt({ apiKey: await getApiKey(user) });

              await rettiwt.tweet.retweet(tweet.id);
            }

            console.log(`Retweeted tweet ${tweet.id} in ${language}:\n${tweet.fullText}`);
          } catch (error) {
            console.error(`Unable to retweet ${tweet.id} in ${language}: ${error.message}`);

            if (error.constructor.name === 'RettiwtError' && error.code === 32) {
              user.apiKey = null;
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error while streaming tweets: ${error.message}`);

      if (error.constructor.name === 'RettiwtError' && error.code === 32) {
        config.users[0].apiKey = null;
      }
    }
  }
})();
