import Playlist from "@/background/Playlist.js";
import LocalHTTPServer from "@/background/LocalHTTPServer.js";
import {ipcMain} from "electron";
import ChromecastHelper from "@/background/ChromecastHelper.js";
import Media from "@/background/Media.js";
import ChromecastPlayer from "@/background/ChromecastPlayer.js";
import LocalPlayer from "@/background/LocalPlayer.js";
import LocalIPHelper from "@/background/LocalIPHelper.js";

export default class Application {
    init(browserWindow) {
        console.log(`Local IP: ${LocalIPHelper.getLocalIP()}`);

        this.browserWindow = browserWindow;

        this.playlist = new Playlist();

        this.httpServer = new LocalHTTPServer();
        this.httpServer.start(this, this.playlist);

        this.chromecastHelper = new ChromecastHelper();
        this.chromecastHelper.scanDevices(() => {
            if (this.browserWindow && this.browserWindow.webContents) {
                this.browserWindow.webContents.send('chromecast-devices', this.chromecastHelper.devices);
            }
        });

        this.player = new ChromecastPlayer(this.playlist);

        this.registerListeners();
    }

    onUIStarted() {
        this.browserWindow.webContents.send('chromecast-devices', this.chromecastHelper.devices.map(d => {
            return {
                id: d.id,
                friendlyName: d.friendlyName
            }
        }));
    }

    registerListeners() {
        this.playlist.onMediaChanged(() => {
            this.browserWindow.webContents.send('media-changed', this.playlist.currentMedia.id);
        });

        ipcMain.on(`app-init`, (event, args) => {
            this.onUIStarted();
        });

        ipcMain.on(`add-files`, async(event, files) => {
            for (let file of files) {
                const media = new Media(file);
                await media.extractData();
                this.playlist.add(media);

                this.browserWindow.webContents.send(`playlist-updated`, JSON.parse(JSON.stringify(this.playlist)));
            }
        });

        ipcMain.on(`select-player`, async(event, playerId) => {
            if (playerId === 0) {
                this.player = new LocalPlayer(this.playlist);
            } else {
                this.player.setCurrentDevice(this.chromecastHelper.getDevice(playerId))
            }

            this.player.onPlayerEvent(event => {
                this.browserWindow.webContents.send(`player-status`, event);
            });
        });

        ipcMain.on(`select-media`, async(event, mediaId) => {
            console.log(mediaId);
            this.playlist.setCurrentMedia(mediaId);
            this.player.stop();
        });

        ipcMain.on(`select-subtitles`, async(event, language) => {
            this.player.changeSubtitles(language);
        });


        ipcMain.on(`play`, async(event, args) => {
            this.player.play();
        });

        ipcMain.on(`pause`, async(event, args) => {
            this.player.pause();
        });

        ipcMain.on(`stop`, async(event, args) => {
            this.player.stop();
        });

        ipcMain.on(`previous`, async(event, args) => {
            this.player.previous();
        });

        ipcMain.on(`next`, async(event, args) => {
            this.player.next();
        });

        ipcMain.on(`seek`, async(event, args) => {
            this.player.seek(args);
        });

        ipcMain.on(`seekTo`, async(event, args) => {
            this.player.seekTo(args);
        });

        ipcMain.on(`change-volume`, async(event, volume) => {
            this.player.setVolume(volume);
        });
    }
}
