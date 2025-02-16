const Alexa = require('ask-sdk-core');
const moment = require('moment-timezone');
const axios = require('axios');
const API_KEY = 'f033262561b7ca5f4c7886f4021c543e';


const genre_code = {
  ' 28' :'action',
  ' 12' :'adventure',
   '16' :'animation',
   '35':'comedy',
   '80':'crime',
  ' 99':'documentary',
  ' 18':'drama',
   '10751':'family',
  '14':'fantasy',
  '27':'horror',
  '53':'thriller',
  '10752':'war' ,
  '36':'history',
  '10402':'music',
  '9648':'mystery',
  '10749':'romance',
  '37':'western',
  '878':'science-fiction',
};




const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    let apiAccessToken = handlerInput.requestEnvelope.context.System.apiAccessToken;
    let deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
    let speechText = 'Hi';
    await axios.get(`https://api.eu.amazonalexa.com/v2/devices/${deviceId}/settings/System.timeZone`, {
      headers: { 'Authorization': `Bearer ${apiAccessToken}` }
    })
    .then((response) => {
        let timeobject = new moment();
        let time= timeobject.tz(response.data).format('hh');
        time = String(time);
        //console.log(time);
        time = Number(time);
        if(time >= 21 && time <= 3)
       
        {
          speechText = 'Would you like to see some Horror movies right now? ';
        }
        else
        {
          speechText = 'What kind of movie would you like to watch, Action, Thriller or in the mood for some comedy? ';
          //console.log('okkkkk');
        }
    })
    .catch(err => {
        console.log(err.error);
        speechText = 'I did not get it';
    });
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();    
  },
};

const GenreIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GenreIntent';
  },
  handle(handlerInput)
  {
   let genreslot = handlerInput.requestEnvelope.request.intent.slots['genre'].value;
   let genre_id=handlerInput.requestEnvelope.request.intent.slots.genre.resolutions.resolutionsPerAuthority[0].values[0].value.id ;
 
   const sessionAttributes1 = handlerInput.attributesManager.getSessionAttributes();
   //const {genre} = sessionAttributes1;
   sessionAttributes1.genre = genreslot;
   handlerInput.attributesManager.setSessionAttributes(sessionAttributes1);
   sessionAttributes1.genreid=genre_id;
   
   let genre = genre_code[genre_id];
   let speechText = `Alright! I will find the best movies for you in ${genre} genre. Please ,Can I know the age demographics of the people you are watching the movie with?`
   handlerInput.attributesManager.setSessionAttributes(sessionAttributes1);
   return handlerInput.responseBuilder
   .speak(speechText)
   .reprompt(speechText)
   .getResponse();
  },

};

const AgeIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AgeIntent';
  },
async handle(handlerInput)
{
  let age = handlerInput.requestEnvelope.request.intent.slots['age'].value;
  const sessionAttributes1 = handlerInput.attributesManager.getSessionAttributes();
 // let genre = sessionAttributes1.genre;
  let genreid=sessionAttributes1.genreid;
  let genre = genre_code[genreid];
  var speechText = `Here are your movie recommendations: `;
  let k = '';

  if(genreid==0)
  { 
    speechText='Here are the popular movies which you may like to watch . ';
    await axios.get(`https://api.themoviedb.org/3/movie/popular?page=1&language=en-US&api_key=${API_KEY}`)
    .then(function(response)
    {
        let len=response['data']['results'].length;
        let result=response['data']['results'];
        for(let i=0;i<5;i++)
        {
          speechText += result[i]['title'] + ' ! '+ '\n\n';
        } 
        
    })
    .catch(function(error){
      console.log(error);
    });
  }


 else if (age < 18)
  {
    await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=${genreid}`)
.then(function (response){
    let len = response['data']['results'].length;
    let result = response['data']['results'];
    //let speechText = '';
    for(let  i = 0 ;i<5;i++)
    {
        speechText = speechText + result[i]['title'] + ' ! ' + '\n\n';
    }
    console.log(speechText);

})
.catch(function (error){
    console.log(error);
});

  }

  else
  {
    await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=true&include_video=false&page=1&with_genres=${genreid}`)
.then(function (response){
    let len = response['data']['results'].length;
    let result = response['data']['results'];
    
    for(let  i = 0 ;i<5;i++)
    {
        speechText = speechText + result[i]['title'] + ' ! ' + '\n\n';
    }
    console.log(speechText);
})
.catch(function (error){
    console.log(error);
});
//console.log(k);

  }
  speechText += ' Please Enjoy!!';
  return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse(); 
  
  
  }

  

};


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Movie Recommender', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Movie Recommender', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    GenreIntentHandler,
    AgeIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
.lambda();
