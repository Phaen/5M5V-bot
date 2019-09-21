var Twitter = require('twit')
var TweetFilter = require('./lib/filter')
var util = require('./lib/util')
var fs = require('fs')
var yaml = require('js-yaml')
var request = require('request')

// loead the config or bust
try {
    var config = yaml.safeLoad(fs.readFileSync('5m5v-config.yaml', 'utf8'))
} catch(e) {
    throw 'Unable to load config file: ' + e
}

// fail if there are no users
if(!config.users.length)
    throw 'Config needs to contain at least one user'

DELAYTIME = config.delaytime || 2 * 60 * 1000

var users = []

// verify that consumer keys are correct
request.post( {
        url: 'https://api.twitter.com/oauth2/token',
        headers: { 'Authorization': 'Basic ' + Buffer.from(config.consumer_key + ':'  + config.consumer_secret).toString('base64') },
        form: { 'grant_type': 'client_credentials'}
    }, ( err, res, body ) => {
        if(err)
            throw err

        if(res.statusCode==200)
            setupUsers()
        else
            throw 'Unable to verify consumer API keys: ' + JSON.parse(body).errors[0].message
});

function setupUsers() {

    // create Twitter instances for all users
    for(let i = 0; i < config.users.length; i++)
        users.push(new Twitter({
            consumer_key: config.consumer_key,
            consumer_secret: config.consumer_secret,
            access_token: config.users[i].access_token,
            access_token_secret: config.users[i].access_token_secret,
        }))

    // verify that all user credentials are correct
    var userErrors = 0
    var promises = []
    for( let i in users )
        promises.push( users[i].get('account/verify_credentials').catch(e => {
            var user = i
            console.error(`Unable to verify user ${user}: ${e}`) 
            userErrors ++
        }))

    Promise.all(promises).then(() => {
        
        if( userErrors )
            console.error('Not all users were verified, terminating')
        else
            setupStream()
    
    })

}

function setupStream() {
    
    // many-to-one map of users using each filter
    var filterUsers = {}
    for(let i = 0; i < config.users.length; i++)
        for(let j in config.users[i].filters) {
            let filter = config.users[i].filters[j]
            if(filter in filterUsers)
                filterUsers[filter].push(i)
            else
                filterUsers[filter] = [i]
        }

    // use first user to stream with
    var T = users[0]

    // setup the filters
    var filter = new TweetFilter(config.exclude, Object.keys(filterUsers))

    // Whenever the Twitter stream notifies us of a new Tweet with the term 'vegan' (or its international equivalents), we handle it!
    var stream = T.stream('statuses/filter', { track: util.trackedTerms })

    // Run with option '--dry-run' to disable retweeting and instead log matches to console
    var isDryRun = process.argv[2] === '--dry-run'

    console.log("Loaded filters: " + Object.keys(filter.filters).join(", "))

    console.log("Tracking terms: " + util.trackedTerms.join(", "))

    stream.on('connect', function (response) {
        console.log("Connecting to Twitter..." + (isDryRun ? " (dry run, will not retweet matches)" : ""))
    })
    stream.on('connected', function (response) {
        console.log("Connected")
    })
    stream.on('reconnect', function (response) {
        console.log("Reconnecting...")
    })
    stream.on('tweet', function(tweet) {
        var filters = filter.matches(tweet)
        if (filters.length) {

            if (isDryRun) {
                console.log(tweet.id_str + ' : ' + tweet.user.screen_name + ' : ' + tweet.text)
                return
            }
            
            console.log(`Retweeted: ${tweet.id_str} to ${filters.join(', ')} users`)

            for( let i in filters ) {
                filter = filters[i]
                for( var j in filterUsers[filter] ) {
                    user = filterUsers[filter][j]
                    setTimeout(function(){
                        users[user].post('statuses/retweet/:id', {id: tweet.id_str}, function(err, data, response) {
                            if (err) {
                                console.log(err)
                                return false
                            }
                        });
                    }, DELAYTIME)
                }

            }

        }
    })
}
