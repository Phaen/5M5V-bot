# 5M5V Bot
Fork from [plorry/VegAssist](https://github.com/plorry/VegAssist) to retweet people looking for support going vegan for 5 Minutes 5 Vegans.
https://5minutes5vegans.org

This bot tracks usage of the term "vegan" on Twitter's public stream, and processes each item, looking for exact matches on an array of preset phrases. This bot can be setup for multiple authorised accounts for the same app, retweeting messages matching only certain filters to only certain accounts.

Implements full verification of all supplied API credentials, to avoid potential headaches.

## API Credentials
Visit https://developer.twitter.com/apps to register your own app and obtain the credentials to use. To register more users under your app, visit https://5minutes5vegans.org/twitteroauth to grant permission and obtain their access tokens.

## Installing

### Yarn
1. Run `yarn add 5m5v-bot` to install the bot to your environment
2. Copy the `config.example.yaml` file into your own environment under `config.yaml` and configure the bot
2. Run `npx 5m5v-bot` to run the bot

### Manual
1. Clone this repository
2. Run `yarn install` in the directory that you cloned this repository into
3. Copy the `config.example.yaml` file to your own `config.yaml` and configure the bot
4. Run `node .` to run the bot

## Setup

## Running the tests

Simply run `yarn test`

## Disabling retweets

Retweets can be disabled for testing purposes by using the argument `--dry-run`, e.g. `node . --dry-run`. In dry run mode, matching tweets will be logged to the console but not retweeted.
