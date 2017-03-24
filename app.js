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
                    .text("ID: <b>1234</b> <br> Date: <b>2017-04-02</b> ")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                    ])
                    .tap(builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle"))
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
            } else {
                builder.Prompts.choice(session, "We want to know what is the problem with the current policy?", ["Price is high", "Low coverage", "Others"]);
                //session.send("In Axa clients come first, thats why we want to improve your current offer, adding some products to your package.")
            }
        } else next();
    },
    function (session, results, next) {
        if(results.response){
            if(results.response.index === 0) {
                session.sendTyping();
                session.send("OK, we can do a 30% discount in your price if you buy these products! ");
                 var cards = getCardsAttachments();
                 var reply = new builder.Message(session)
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(cards);
                session.send(reply);
                session.sendTyping();
                builder.Prompts.text(session, "Do you like the offer?");
            }
        }
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
                builder.Prompts.choice(session, "What do you think?", ["I want it", "HELL YEAH, GO ON IT"]);

                }
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
            .title('')
            .subtitle('Offload the heavy lifting of data center management')
            .text('Store and help protect your data. Get durable, highly available data storage across the globe and pay only for what you use.')
            .images([
                builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/azure/storage/media/storage-introduction/storage-concepts.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/storage/', 'Learn More')
            ]),

        new builder.ThumbnailCard(session)
            .title('DocumentDB')
            .subtitle('Blazing fast, planet-scale NoSQL')
            .text('NoSQL service for highly available, globally distributed apps—take full advantage of SQL and JavaScript over document and key-value data without the hassles of on-premises or virtual machine-based cloud database options.')
            .images([
                builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/azure/documentdb/media/documentdb-introduction/json-database-resources1.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/documentdb/', 'Learn More')
            ]),

        new builder.HeroCard(session)
            .title('Azure Functions')
            .subtitle('Process events with a serverless code architecture')
            .text('An event-based serverless compute experience to accelerate your development. It can scale based on demand and you pay only for the resources you consume.')
            .images([
                builder.CardImage.create(session, 'https://azurecomcdn.azureedge.net/cvt-5daae9212bb433ad0510fbfbff44121ac7c759adc284d7a43d60dbbf2358a07a/images/page/services/functions/01-develop.png')
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

function getCardsAttachments2(session) {
    return [
        new builder.HeroCard(session)
            .title('')
            .subtitle('Offload the heavy lifting of data center management')
            .text('Store and help protect your data. Get durable, highly available data storage across the globe and pay only for what you use.')
            .images([
                builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/azure/storage/media/storage-introduction/storage-concepts.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/storage/', 'Learn More')
            ]),

        new builder.ThumbnailCard(session)
            .title('DocumentDB')
            .subtitle('Blazing fast, planet-scale NoSQL')
            .text('NoSQL service for highly available, globally distributed apps—take full advantage of SQL and JavaScript over document and key-value data without the hassles of on-premises or virtual machine-based cloud database options.')
            .images([
                builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/azure/documentdb/media/documentdb-introduction/json-database-resources1.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/documentdb/', 'Learn More')
            ]),

        new builder.HeroCard(session)
            .title('Azure Functions')
            .subtitle('Process events with a serverless code architecture')
            .text('An event-based serverless compute experience to accelerate your development. It can scale based on demand and you pay only for the resources you consume.')
            .images([
                builder.CardImage.create(session, 'https://azurecomcdn.azureedge.net/cvt-5daae9212bb433ad0510fbfbff44121ac7c759adc284d7a43d60dbbf2358a07a/images/page/services/functions/01-develop.png')
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
