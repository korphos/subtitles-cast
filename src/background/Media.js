import {v4 as uuid} from "uuid";
import SubtitlesHelper from "@/background/Subtitleshelper.js";
import LocalIPHelper from "@/background/LocalIPHelper.js";

export default class Media {
    constructor(inputFile) {
        this.id = uuid();
        this.filePath = inputFile.path;
        this.name = inputFile.name;
        this.duration = inputFile.duration;
        this.subtitles = {};
        this.audioTracks = [];
        this.url = `http://${LocalIPHelper.getLocalIP()}:3000/video/${this.id}`;
    }

    async extractData() {
        await SubtitlesHelper.extractFromMKV(this);
    }

    getLanguageSubtitles(language) {
        return this.subtitles.find(s => s.language === language);
    }

    getVTTSubtitles(language) {
        return SubtitlesHelper.getVTTFormat(this, language);
    }
}
