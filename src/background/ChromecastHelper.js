import ChromecastAPI from "chromecast-api";
import {v4 as uuid} from "uuid";

export default class ChromecastHelper {
    constructor() {
        this.devices = [];
    }

    scanDevices(callback) {
        this.client = new ChromecastAPI();

        console.log(this.client.devices);
        this.client.on(`device`, device => {
            console.log(device);
            device.id = uuid();
            this.devices.push(device);
            if (callback) {
                callback(this.devices);
            }
        });
    }

    getDevice(id) {
        return this.devices.find(d => d.id === id);
    }
}
