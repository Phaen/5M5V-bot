#!/usr/bin/env node

const fs = require('fs')
const yaml = require('js-yaml')
const Twitter = require('./lib/twitter')
const TweetFilter = require('./lib/filter')

const isDryRun = process.argv[2] === '--dry-run'

let config = {}

try {
  config = yaml.safeLoad(fs.readFileSync('5m5v-config.yaml', 'utf8'))
} catch (error) {
  throw `Unable to load config file: ${error.message}`
}

const languages = config.users.map(user => user.language)

const twitter = new Twitter(config.users, new TweetFilter(config.exclude, languages))

console.log(isDryRun ? 'Looking for new tweets (dry run)...' : 'Looking for new tweets...')

twitter.searchAndRetweet({
  retweetDelay: config.delaytime || 2 * 60 * 1000,
  isDryRun,
})
