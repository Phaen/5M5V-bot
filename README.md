# 5M5V Bot
Fork from [plorry/VegAssist](https://github.com/plorry/VegAssist) to retweet people looking for support going vegan for 5 Minutes 5 Vegans.
https://5minutes5vegans.org

This bot tracks usage of the term "vegan" on twitter's public stream, and processes each item, looking for exact matches on an array of preset phrases. This bot can be setup for multiple authorised accounts for the same app, retweeting certain filters to only certain accounts.

## Installing

1. Clone this repository
2. Install [node.js and npm](https://nodejs.org)
3. Run `yarn install` in the directory that you cloned this repository into
4. Copy the `config.example.yaml` and fill in your credentials
5. Run `node .`

## Running the tests

Simply run `npm test`

## Disabling retweets

Retweets can be disabled for testing purposes by using the argument `--dry-run`, e.g. `node . --dry-run`. In dry run mode, matching tweets will be logged to the console but not retweeted.
