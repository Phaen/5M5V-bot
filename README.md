# 5M5V Bot
Fork from [plorry/VegAssist](https://github.com/plorry/VegAssist) to retweet people looking for support going vegan for 5 Minutes 5 Vegans.
https://5minutes5vegans.org

This bot tracks usage of the term "vegan" - and its translated variants depending on the config - on Twitter's public stream, and processes each item, looking for exact matches on an array of preset phrases. This bot can be setup for multiple authorised accounts for the same app, retweeting messages matching only certain filters to only certain accounts.

Implements full verification of all supplied API credentials, to avoid potential headaches.

## API Credentials
Visit https://developer.twitter.com/apps to register your own app and obtain the credentials to use. To register more users under your app, visit https://5minutes5vegans.org/twitteroauth to grant permission and obtain their access tokens.

## Installing

### Yarn
1. Run `yarn add 5m5v-bot` to install the bot to your project
2. Copy the `5m5v-config.example.yaml` file in `node_modules/5m5v-bot` into your own project under `5m5v-config.yaml` and configure the bot
2. Run `yarn 5m5v-bot` in the directory of your project to run the bot

*You can install the bot globally to your system with `yarn global add 5m5v-bot` instead. From then you can run `yarn 5m5v-bot` from any folder, as long as it contains a config file.*

### Manual
1. Clone this repository
2. Run `yarn install` in the directory that you cloned this repository into
3. Copy the `5m5v-config.example.yaml` file to your own `5m5v-config.yaml` and configure the bot
4. Run `node .` in the directory of the repository to run the bot

## Configuration

The configuration is loaded from `5m5v-config.yaml` in the working directory, which is likely either the directory of your cloned repository or the directory of your project where you installed the node package. The configuration format is YAML, with its options listed below.

#### `consumer_key`
You find this in your app on Twitter under "Keys and tokens" -> "Consumer API keys". It's listed as "API key".
#### `consumer_secret`
Underneath the previous key, listed as "API secret key".
#### `users`
A list containing all users to retweet with. The first user listed will be used to listen to the Twitter stream with.
#### `users.access_token`
 - Available for your developer account underneath the last two keys under "Access token & access token secret". It's listed as "Access token".
 - For other accounts this is the `oauth_token`, obtainable at either https://5minutes5vegans.org/twitteroauth or your own OAuth implementation.
#### `users.access_token_secret`
 - Available for your developer account underneath the previous key, listed as "Access token secret".
 - For other accounts this is the `oauth_token_secret`, obtainable at either https://5minutes5vegans.org/twitteroauth or your own OAuth implementation.
#### `users.filters`
A list of filters that this user will be retweeting matches from.
#### `exclude` *(optional)*
A list of keywords that if found in a Tweet will exclude that Tweet from being retweeted.
#### `delaytime` *(optional)*
The time to delay retweets with once a matching Tweet has been found. Defaults to two minutes.

## Running the tests

Simply run `yarn test`

## Disabling retweets

Retweets can be disabled for testing purposes by using the argument `--dry-run`, e.g. `node . --dry-run`. In dry run mode, matching tweets will be logged to the console but not retweeted.
