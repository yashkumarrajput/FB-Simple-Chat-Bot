'use strict'

const express=require('express');
const bodyParser=require('body-parser');
const request=require('request');

const app=express();

app.set('port',(process.env.PORT || 5000));

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());


app.get('/',(req,res)=>{
    res.send('Hi I am a chatbot');
});

const token="your_fb_token";

app.get('/webhook',(req,res)=>{
    if(req.query['hub.verify_token']==='your custom token'){
        res.send(req.query['hub.challenge'])
    }
    res.send("Wrong token");
});

app.post('/webhook/',(req,res)=>{
    let messaging_events=req.body.entry[0].messaging;
    for(let i=0;i<messaging_events.length;i++){
        let event=messaging_events[i];
        let sender=event.sender.id;
        if(event.message && event.message.text){
            let text=event.message.text;
            decideMessage(sender,text)
        }
        if(event.postback){
            let text=JSON.stringify(event.postback)
            decideMessage(sender,text)
            continue
        }
    }
    res.sendStatus(200);
});

function sendText(sender,text){
    let messageData = {text : text}
    sendRequest(sender,messageData)
}

function sendButtonMessage(sender,text){
    let messageData={
        "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":text,
        "buttons":[
          {
            "type":"postback",
            "title":"Summer",
            "payload":"summer"
          },
          {
            "type":"postback",
            "title":"Winter",
            "payload":"winter"
          }
        ]
      }
    }
    }

    sendRequest(sender,messageData)
}

function sendRequest(sender,messageData){
    request({
        url:"https://graph.facebook.com/v2.6/me/messages",
        qs:{access_token:token},
        method:'POST',
        json:{
            recipient: {id : sender},
            message:messageData
        }
    },(err,res,body)=>{
        if(err){
            console.log(err)
        }else if(res.body.error){
            console.log(res.body.error)
        }
    });
}

function decideMessage(sender,text1){
    let text=text1.toLowerCase();
    if(text.includes("summer")){
        sendImageMessage(sender,"image_uri");
    }else if(text.includes("winter")){
        sendImageMessage(sender,"image_uri");
    }else {
        sendText(sender,"I like Fall")
        sendButtonMessage(sender,"What is your favourite season?");
    }
}

function sendImageMessage(sender,imageURL){
    let messageData={
    "attachment":{
      "type":"image",
      "payload":{
        "url":imageURL
      }
    }
  }
  sendRequest(sender,messageData)
}

app.listen(app.get('port'),(err)=>{
    if(err) throw err;
    console.log('running :port')
});