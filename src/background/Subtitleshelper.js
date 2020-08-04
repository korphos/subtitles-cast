import MatroskaSubtitles from "matroska-subtitles";
import moment from "moment";
import fs from "fs";
import LocalIPHelper from "@/background/LocalIPHelper.js";

export default class Subtitleshelper {
    static async extractFromMKV(media) {
        return new Promise((resolve, reject) => {
            const parser = new MatroskaSubtitles();

            // first an array of subtitle track information is emitted
            parser.once(`tracks`, (tracks) => {
                for (const track of tracks) {
                    const languageInfo = this.getLanguageInfo(track.language);
                    media.subtitles[track.number] = {
                        language: languageInfo.code,
                        name: languageInfo.name,
                        url: `http://${LocalIPHelper.getLocalIP()}:3000/subtitles/${media.id}/${languageInfo.code}.vtt`,
                        texts: []
                    };
                }

                resolve();
            });

            // afterwards each subtitle is emitted
            parser.on(`subtitle`, (subtitle, trackNumber) => {
                media.subtitles[trackNumber].texts.push({
                    time: subtitle.time,
                    duration: subtitle.duration,
                    text: subtitle.text
                });
            });

            fs.createReadStream(media.filePath).pipe(parser);
        })
    }

    static getVTTFormat(media, language, timeOffset = 0) {
        let vtt = `WEBVTT`;
        for (let trackNumber in media.subtitles) {
            const subtitles = media.subtitles[trackNumber];
            if (subtitles.language === language) {
                for (let subtitle of subtitles.texts) {
                    const timerStart = this.convertMSDurationToVTTFormat(moment.duration(subtitle.time + timeOffset, `milliseconds`));
                    const timerStop = this.convertMSDurationToVTTFormat(moment.duration(subtitle.time + subtitle.duration + timeOffset, `milliseconds`));
                    vtt  += `\n\n${timerStart} --> ${timerStop} line:90%`;
                    vtt  += `\n${subtitle.text}`;
                }
                break;
            }
        }

        return vtt;
    }

    static getLanguageInfo(str) {
        switch (str) {
            case `fr`:
            case `fra`:
            case `fr-FR`:
            case `fr-CA`:
                return {
                    name: `French`,
                    code: `fr-FR`
                };
            case `en`:
            case `eng`:
            case `en-US`:
            default:
                return {
                    name: `English`,
                    code: `en-US`
                };
        }
    }

    static convertMSDurationToVTTFormat(d) {
        const h = Math.floor(d.asHours());
        const m = Math.floor(d.asMinutes()) - h * 60;
        const s = Math.floor(d.asSeconds()) - h * 3600 - m * 60;
        const ms = Math.floor(d.asMilliseconds()) - h * 3600000 - m * 60000 - s * 1000;
        let result = ``;
        result += h < 10 ? `0${h}` : h;
        result += `:`;
        result += m < 10 ? `0${m}` : m;
        result += `:`;
        result += s < 10 ? `0${s}` : s;
        result += `.`;
        if (ms < 10) {
            result += `00${ms}`;
        } else if (ms < 100) {
            result += `0${ms}`;
        } else {
            result += ms;
        }
        return result;
    }
}
