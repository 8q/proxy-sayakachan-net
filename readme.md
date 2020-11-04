# proxy-sayakachan-net
slackへ投稿したりやルーター内にあるgoogle homeを喋らせたりするための諸々のAPI

.envを作る
```
GOOGLE_APPLICATION_CREDENTIALS=./secrets/gcp-service-account-key.json
SLACK_API_TOKEN="XXX"
```

install & run
```
npm install
npm run start
```

pm2
```
sudo npm install pm2 -g
sudo pm2 startup
sudo pm2 start pm2.yml
sudo pm2 save
```
