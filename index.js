// .env読み込み
require('dotenv').config();


// 各種読み込み・設定
const googlehome = require('./lib/googlehome');
const googleTextToSpeech = require('./lib/googleTextToSpeech');
const express = require('express');
const app = express();
app.use(express.json());
const asyncWrapper = fn => {
    return (req, res, next) => {
        return fn(req, res, next).catch(next);
    }
};
const { WebClient } = require('@slack/web-api');


// パラメータ
const IP_ADDRESS = '192.168.0.101'; // 実行サーバーのIPアドレス
const PORT = 3001; // 実行ポート


// Google Homeに指定したテキストを喋らせる
// curl -X POST -H "Content-Type:application/json" -d '{"text":"こんにちは、僕ドラえもんです。"}' http://192.168.0.101:3001/googlehome/say
app.post('/googlehome/say', asyncWrapper(async (req, res, next) => {
    try {
        const text = req.body.text;
        if (!text) {
            res.status(400).json({msg: 'invalid or missing parameter'});
            return;
        }

        const ip = await googlehome.searchDevices().then(devices => devices.filter(e => e.name.includes('Google-Home')).map(e => e.ip).pop());
        if(!ip) {
            res.status(500).json({msg: 'not found googlehome'});
            return;
        }

        await googlehome.playOnDevice(ip, `http://${IP_ADDRESS}:${PORT}/textToSpeech?text=${encodeURI(text)}`).catch(e => { throw Error(e) });
        res.status(201).json({msg: 'created'});

    } catch(e) {
        res.status(500).json({msg: 'internal server error'})
    }
}));


// slackにテキストを投稿する
// curl -X POST -H "Content-Type:application/json" -d '{"channel": "#sayakachan-net", "text":"<!channel> テストです。"}' http://192.168.0.101:3001/slack/postMessage
app.post('/slack/postMessage', asyncWrapper(async (req, res, next) => {
    try {
        const channel = req.body.channel;
        const text = req.body.text;

        if (!channel || !text) {
            res.status(400).json({msg: 'invalid or missing parameter'});
            return;
        }

        const token = process.env.SLACK_API_TOKEN;
        const client = new WebClient(token);
        const params = {
            channel: channel,
            text: text,
            as_user: true
        };

        const response = await client.chat.postMessage(params);
        res.status(200).json(response);

    } catch (e) {
        res.status(500).json({msg: 'internal server error'})
    }

}));


// テキストを指定してMP3バイナリを返す
// /textToSpeech?text=...
app.get('/textToSpeech', asyncWrapper(async (req, res, next) => {
    try {
        const text = req.query.text;
        if (!text) {
            res.status(400).json({msg: 'invalid or missing parameter'});
            return;
        }

        const binary = await googleTextToSpeech.getMp3Binary(text);
        res.header({
            'Content-Type': 'audio/mpeg',
            'Content-Length': binary.byteLength
        });
        res.status(200).send(binary);

    } catch (e) {
        res.status(500).json({msg: 'internal server error'})
    }
}));


// サーバー立ち上げ
app.listen(PORT, () => console.log('proxy-sayakachan-net'));