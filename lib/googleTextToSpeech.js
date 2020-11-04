
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const client = new textToSpeech.TextToSpeechClient();

const getMp3Binary = async (jpText) => {
    const request = {
        input: {text: jpText},
        // Select the language and SSML voice gender (optional)
        voice: {languageCode: 'ja-JP', ssmlGender: 'NEUTRAL'},
        // select the type of audio encoding
        audioConfig: {audioEncoding: 'MP3'},
    };
    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);
    // return binary
    return response.audioContent;
}

exports.getMp3Binary = getMp3Binary;