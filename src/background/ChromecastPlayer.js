export default class ChromecastPlayer {
    constructor(playlist) {
        this.playlist = playlist;
        this.chromecastHelper;

        this.volume = null;
        this.subtitlesLanguage = null;
        this.eventCallback = () => {};
    }

    setCurrentDevice(device) {
        this.device = device;

        this.device.on('status', data => {
            console.log(`Chromecast status:`, data);
            const status = {
                currentTime: data.currentTime
            };
            switch (data.playerState) {
                case `BUFFERING`:
                    status.status = `playing`;
                    break;
                case `PLAYING`:
                    status.status = `playing`;
                    this.eventCallback(status);
                    break;
                case `PAUSED`:
                    status.status = `paused`;
                    this.eventCallback(status);
                    break;
                case `IDLE`:
                    status.status = `stopped`;
                    this.eventCallback(status);
                    this.connected = false;
                    if (data.idleReason === `FINISHED`) {
                        this.playlist.next();
                        this.play();
                    }
                    break;
            }
        });
    }

    connect(startTime = null) {
        const media = this.playlist.getCurrentMedia();

        if (!media) {
            return;
        }

        const mediaParams = {
            url: media.url,
            subtitles: Object.values(media.subtitles).map(s => {
                return {
                    language: s.language,
                    name: s.name,
                    url: s.url
                }
            }),
            subtitles_style: {
                backgroundColor: `#FFFFFF00`, // see http://dev.w3.org/csswg/css-color/#hex-notation
                foregroundColor: `#FFFFFFFF`, // see http://dev.w3.org/csswg/css-color/#hex-notation
                edgeType: `OUTLINE`, // can be: "NONE", "OUTLINE", "DROP_SHADOW", "RAISED", "DEPRESSED"
                edgeColor: `#000000FF`, // see http://dev.w3.org/csswg/css-color/#hex-notation
                fontScale: 1.2, // transforms into "font-size: " + (fontScale*100) +"%"
                fontStyle: `BOLD`, // can be: "NORMAL", "BOLD", "BOLD_ITALIC", "ITALIC",
                fontFamily: `Droid Sans`,
                fontGenericFamily: `SANS_SERIF` // can be: "SANS_SERIF", "MONOSPACED_SANS_SERIF", "SERIF", "MONOSPACED_SERIF", "CASUAL", "CURSIVE", "SMALL_CAPITALS",
                // windowColor: '#AA00FFFF', // see http://dev.w3.org/csswg/css-color/#hex-notation
                // windowRoundedCornerRadius: 10, // radius in px
                // windowType: 'ROUNDED_CORNERS' // can be: "NONE", "NORMAL", "ROUNDED_CORNERS"
            }
        };

        let opts = {};
        if (startTime) {
            opts.startTime = startTime;
        }

        this.device.play(mediaParams, opts, err => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(`Chromecast player started.`);

            this.connected = true;

            if (this.volume) {
                this.setVolume(this.volume);
            }

            if (this.subtitlesLanguage) {
                this.changeSubtitles(this.subtitlesLanguage);
            }
        });
    }

    play(startTime = null) {
        if (!this.connected) {
            this.connect(startTime = null);
        } else {
            this.device.resume(err => {
                if (err) {
                    console.error(err);
                    return;
                }

                console.log(`Chromecast player resumed.`);
            });
        }
    }

    pause() {
        if (!this.connected) return;
        this.device.pause(err => {
            if (err) {
                console.error(err);
                return;
            }

            console.log(`Chromecast player paused.`);
        });
    }

    stop() {
        if (!this.connected) return;
        this.device.stop(err => {
            if (err) {
                console.error(err);
                return;
            }

            this.connected = false;

            console.log(`Chromecast player stopped.`);
        });
    }

    previous() {
        this.playlist.previous();
        this.connected = false;
        this.play();
    }

    next() {
        this.playlist.next();
        this.connected = false;
        this.play();
    }

    seek(secondsForward) {
        if (!this.connected) return;
        this.device.seek(secondsForward, err => {
            if (err) {
                console.error(err);
            }
        });
    }

    seekTo(specificTime) {
        console.log(specificTime);
        if (!this.connected) return;
        this.device.seekTo(specificTime, err => {
            if (err) {
                console.error(err);
            }
        });
    }

    setVolume(level) {
        this.volume = level;
        if (!this.connected) return;
        this.device.setVolume(level, err => {
            if (err) {
                console.error(err);
            }
        });
    }

    changeSubtitles(language) {
        this.subtitlesLanguage = language;
        if (!this.connected) return;
        const media = this.playlist.getCurrentMedia();
        const subtitlesIndex = Object.values(media.subtitles).findIndex(s => s.language === language);
        this.device.changeSubtitles(subtitlesIndex, () => {
            console.log(`subtitles changed to ${language}`);
        });
    }

    changeSubtitlesSize(fontSize) {
        if (!this.connected) return;
        this.device.changeSubtitlesSize(fontSize, err => {
            if (err) {
                console.error(err);
            }
        });
    }

    stopSubtitles() {
        if (!this.connected) return;
        this.device.subtitlesOff(fontSize, err => {
            if (err) {
                console.error(err);
            }
        });
    }

    onPlayerEvent(callback) {
        this.eventCallback = callback;
    }
}
