const multicastdns = require('multicast-dns');
const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;

const searchDevices = async function(timeoutMillis = 250) {
    return new Promise((resolve, reject) => {
        const mdns = multicastdns();
        const devices = [];

        mdns.on('response', (response) => {
            let name = '';
            let ip = '';
            for (const additional of response.additionals) {
                if (additional.type == 'TXT') name = additional.name;
                if (additional.type == 'A') ip = additional.data;
            }
            devices.push({name: name, ip: ip});
        });

        setTimeout(() => {
            mdns.destroy();
            resolve(devices);
        }, timeoutMillis);

        mdns.query({
            questions: [{
                name: '_googlecast._tcp.local',
                type: 'PTR'
            }]
        });
    });
}

const playOnDevice = async function(ip, mp3Url) {
    return new Promise((resolve, reject) => {
        const client = new Client();
        const media = {
            contentId: mp3Url,
            contentType: 'audio/mp3',
            streamType: 'BUFFERED'
        };

        client.connect(ip, () => {
            client.launch(DefaultMediaReceiver, (err, player) => {
                player.load(media, { autoplay: true }, (err, status) => {
                    client.close();
                    resolve();
                });
            });
        });

        client.on('error', (err) => {
            client.close();
            resolve(err);
        });
    });
};

exports.searchDevices = searchDevices;
exports.playOnDevice = playOnDevice;
