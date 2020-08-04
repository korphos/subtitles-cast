const ChromecastAPI = require('chromecast-api');

const client = new ChromecastAPI();

client.on(`device`, (device) => {
    console.log(device);
});
