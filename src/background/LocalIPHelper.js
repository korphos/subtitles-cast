import os from "os";

export default class LocalIPHelper {
    static getLocalIP() {
        const ifaces = os.networkInterfaces();

        let ip_addresses = [];
        for (const ifname in ifaces) {
            for (let iface of ifaces[ifname]) {
                if (iface.family !== `IPv4` || iface.internal !== false) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                    continue;
                }

                ip_addresses.push(iface.address);
            }
        }

        return ip_addresses.find(ip => ip.substring(0, 8) === `192.168.`);
    }
}
