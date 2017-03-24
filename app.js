var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var qs = require('querystring');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 1337, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID || "cfa14f27-816e-40d6-82e6-606b3c3ed5db",
    appPassword: process.env.MICROSOFT_APP_PASSWORD || "py2hV5NjmZm2F9zhaRA55no"
});





/*
App Id - cfa14f27-816e-40d6-82e6-606b3c3ed5db

App Password - py2hV5NjmZm2F9zhaRA55no
*/

var bot = new builder.UniversalBot(connector);

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/e59f50e2-dd6e-4548-9b1a-728521bc2b09?subscription-key=6b8b9dc3e3284486b0284f4d7d8cb2b3&verbose=true&q=';
bot.recognizer(new builder.LuisRecognizer(model));


server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================
var msg;
bot.dialog('/', [
    function (session) {
        session.sendTyping();
        session.send('Hi');
        builder.Prompts.choice(session, "How are you doing? :)", [":-)",":-("]);
    },
    function (session, results, next) {
        if (results.response) {
            console.log(results.response);
            if(results.response.index === 0){
                session.sendTyping();
                session.send('We can make your day even better!');
            } else {
                session.sendTyping();
                session.send('I\'m sorry to hear that. We can make your day better!');
            }
            session.sendTyping();
            session.send('I wanted to talk to you because your policy is going to expire!');
             msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    .title("Your policy")
                    .subtitle("")
                    .text("Policy ID: 12345")
                    .images([
                        builder.CardImage.create(session, "http://www.bcncatfilmcommission.com/sites/default/files/styles/fancybox/public/locations/3_3_0.jpg?itok=DG27OirT")
                    ])
                    .buttons([
                    builder.CardAction.openUrl(session, 'https://someAXaURL.com/blabladetails', 'More details')
            ]),
            ]);
            session.sendTyping();
            session.send(msg);
            builder.Prompts.choice(session, "I hope you are happy with us, do you want to renew?", ["Yes", "No"]);
        } else {
            next();
        }
    },
    function (session, results, next) {
        if(results.response){
            console.log(results.response);
            if(results.response.index === 0) {
                session.sendTyping();
                session.send("That\'s great, at AXA, clients come first, because of that we have new offers just for you.");
                return next();
            } else {
                builder.Prompts.choice(session, "We want to know what is the problem with the current policy?", ["Price is high", "Low coverage", "Others"]);
                //session.send("In Axa clients come first, thats why we want to improve your current offer, adding some products to your package.")
            }
        } else next();
    },
    function (session, results, next) {
        //if(results.response){
            //if(results.response.index === 0) {
                session.sendTyping();
                session.send("OK, we can do a 30% discount in your price if you buy these products! ");
                 var cards = getCardsAttachments();
                 var reply = new builder.Message(session)
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(cards);
                session.send(reply);
                session.sendTyping();
                builder.Prompts.text(session, "Do you like the offer?");
            //}
        //}
    },
    function (session, results, next) {
        if(results.response){
            console.log(results.response);
            var urlLuis = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/e59f50e2-dd6e-4548-9b1a-728521bc2b09?subscription-key=6b8b9dc3e3284486b0284f4d7d8cb2b3&verbose=true&"
            var blabla = qs.stringify({q: results.response});
            urlLuis = urlLuis + blabla; 
            console.log(urlLuis);
            request.get(urlLuis, function(err, body, response){
                console.log(response);
                response = JSON.parse(response);
                if(response.topScoringIntent.intent === 'expensive-price') {
                 session.sendTyping();
                 session.send("Oh, we sorry this still expensive for you.. maybe this will more interesting for you..");
                 session.sendTyping();
                 session.send('We have a experimental package only for you, we call it "telemetrics".');
                 session.sendTyping();
                 session.send("If you buy one of these gadgets we will low the price in a 75%!!");
                 session.send()
                var cards = getCardsAttachments2();
                 var reply = new builder.Message(session)
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(cards);
                session.send(reply);
                session.sendTyping();
                builder.Prompts.choice(session, "What do you think?", ["I want it", "HELL YEAH, GO ON IT", "I don't want it"]);
                } else next();
            })
        } else next();
    },
    function (session, results, next){
        if(results.response) {
            session.sendTyping();
            session.send("Ok, I will process this to one of our humans and he will contact you as soon of posible.");
            return next();
        }
    }
]);

/*
{
  "query": "expensive",
  "topScoringIntent": {
    "intent": "expensive-price",
    "score": 0.998561442
  },
  "intents": [
    {
      "intent": "expensive-price",
      "score": 0.998561442
    },
    {
      "intent": "None",
      "score": 0.374366134
    }
  ],
  "entities": []
}*/


function getCardsAttachments(session) {
    return [
        new builder.HeroCard(session)
            .title('Basic home insurance')
            .subtitle('')
            .text('From 150€')
            .images([
                builder.CardImage.create(session, 'http://www.hotel-r.net/im/hotel/de/a-little-home-12.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'http://www.axa.co.uk/insurance/personal/home/', 'Learn More')
            ]),

        new builder.HeroCard(session)
            .title('Plus home insurance')
            .subtitle('')
            .text('From 300€')
            .images([
                builder.CardImage.create(session, 'http://i.dailymail.co.uk/i/pix/2015/03/21/10/26DC0B2800000578-0-image-a-6_1426932744007.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'http://www.axa.co.uk/insurance/personal/home/', 'Learn More')
            ]),

        new builder.HeroCard(session)
            .title('Premium home insurnce')
            .subtitle('')
            .text('From 600€')
            .images([
                builder.CardImage.create(session, 'http://www.thebighousemuseum.com/wp-content/uploads/2013/07/about-the-big-house-1.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'http://www.axa.co.uk/insurance/personal/home/', 'Learn More')
            ])
    ];
}

function getCardsAttachments2(session) {
    return [
        new builder.HeroCard(session)
            .title('Smoke detector')
            .subtitle('')
            .text('From 60€')
            .images([
                builder.CardImage.create(session, 'https://www.safety.com/wp-content/uploads/2012/12/smoke-detector-monitoring-system.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/storage/', 'Learn More')
            ]),

        new builder.ThumbnailCard(session)
            .title('MyFox Camera')
            .subtitle('')
            .text('From 299€')
            .images([
                builder.CardImage.create(session, 'http://images.esellerpro.com/2451/I/282/302/7/u_10136798.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/documentdb/', 'Learn More')
            ]),

        new builder.HeroCard(session)
            .title('Alarm system')
            .subtitle('')
            .text('From 130€')
            .images([
                builder.CardImage.create(session, 'http://www.innov8security.co.uk/wp-content/uploads/2014/03/no6_getanalarmsystem.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/functions/', 'Learn More')
            ]),

        new builder.ThumbnailCard(session)
            .title('Cognitive Services')
            .subtitle('Build powerful intelligence into your applications to enable natural and contextual interactions')
            .text('Enable natural and contextual interaction with tools that augment users\' experiences using the power of machine-based intelligence. Tap into an ever-growing collection of powerful artificial intelligence algorithms for vision, speech, language, and knowledge.')
            .images([
                builder.CardImage.create(session, 'https://azurecomcdn.azureedge.net/cvt-68b530dac63f0ccae8466a2610289af04bdc67ee0bfbc2d5e526b8efd10af05a/images/page/services/cognitive-services/cognitive-services.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/cognitive-services/', 'Learn More')
            ])
    ];
}
