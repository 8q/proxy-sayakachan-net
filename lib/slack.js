const { WebClient } = require('@slack/web-api');
const client = new WebClient(process.env.SLACK_API_TOKEN);

const postMessage = async (channel, text) => {
    const params = {
        channel: channel,
        text: text,
        as_user: true
    };

    return client.chat.postMessage(params);
}

exports.postMessage = postMessage;
