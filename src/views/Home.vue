<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-file-input v-model="files" accept="video/*,.mkv" multiple @change="addFiles"></v-file-input>
                    <v-list v-if="playlist">
                        <v-list-item v-for="media in playlist.medias" :key="media.filePath" :class="{active: selectedMedia && selectedMedia.filePath === media.filePath}" @click="selectMedia(media)">
                            <v-list-item-content>
                                <v-list-item-title>{{ media.name }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-col>
            <v-col>
                <v-list>
                    <v-list-item v-for="device in chromecastDevices" :key="device.id" :class="{active: selectedDevice && selectedDevice.friendlyName === device.friendlyName}" @click="selectDevice(device)">
                        <v-list-item-content>
                            <v-list-item-title>{{ device.friendlyName }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-col>
            <v-col>
                <v-list v-if="selectedMedia">
                    <v-list-item v-for="subtitles in selectedMedia.subtitles" :key="subtitles.language" :class="{active: selectedSubtitles && selectedSubtitles.language === subtitles.language}" @click="selectSubtitles(subtitles)">
                        <v-list-item-content>
                            <v-list-item-title>{{ subtitles.language }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-col>
        </v-row>

        <div v-if="selectedMedia">
            {{currentTime|duration}}/{{selectedMedia.duration|duration}}
            <v-slider v-model="currentTime"
                      @end="sendSimpleCommand(`seekTo`, currentTime)" @click="sendSimpleCommand(`seekTo`, currentTime)"
                      min="0" :max="selectedMedia.duration"></v-slider>
        </div>

        <v-bottom-navigation>
            <v-btn @click="sendSimpleCommand(`previous`)">
                <v-icon>fa-step-backward</v-icon>
            </v-btn>
            <v-btn v-if="status !== `playing`" @click="sendSimpleCommand(`play`)">
                <v-icon>fa-play</v-icon>
            </v-btn>
            <v-btn v-if="status === `playing`" @click="sendSimpleCommand(`pause`)">
                <v-icon>fa-pause</v-icon>
            </v-btn>
            <v-btn @click="sendSimpleCommand(`stop`)">
                <v-icon>fa-stop</v-icon>
            </v-btn>
            <v-btn @click="sendSimpleCommand(`next`)">
                <v-icon>fa-step-forward</v-icon>
            </v-btn>
            <v-slider v-model="volume" @change="sendSimpleCommand(`change-volume`, volume)" min="0" max="100" label="Volume"></v-slider>
        </v-bottom-navigation>
    </v-container>
</template>

<script>
import moment from "moment"

const {ipcRenderer} = window.require(`electron`);

export default {
    name: `Home`,
    data() {
        return {
            files: [],
            playlist: null,
            chromecastDevices: [],
            subtitles: [],
            selectedDevice: null,
            selectedMedia: null,
            selectedSubtitles: null,
            volume: 20,
            currentTime: 0,
            status: `stopped`
        }
    },
    filters: {
        duration(value) {
            const d = moment.duration(value, `seconds`);
            if (d.hours() > 0) {
                return moment.utc(d.asMilliseconds()).format(`HH:mm:ss`);
            } else {
                return moment.utc(d.asMilliseconds()).format(`mm:ss`);
            }
        }
    },
    mounted() {
        ipcRenderer.send(`app-init`);

        ipcRenderer.on(`chromecast-devices`, (event, devices) => {
            this.chromecastDevices = devices;
        });

        ipcRenderer.on(`playlist-updated`, (event, playlist) => {
            console.log(`playlist-updated`);
            this.playlist = playlist;
        });

        ipcRenderer.on(`media-changed`, (event, mediaId) => {
            if (this.playlist && this.playlist.medias) {
                this.selectedMedia = this.playlist.medias.find(m => m.id === mediaId);
            }
        });

        ipcRenderer.on(`player-status`, (event, status) => {
            this.status = status.status;
            this.currentTime = status.currentTime;
        });

        setInterval(() => {
            if (this.status === `playing`) {
                this.currentTime++;
            }
        }, 1000);
    },
    methods: {
        async addFiles() {
            const promise = new Promise(resolve => {
                let i = 0;
                for (const file of this.files) {
                    const video = document.createElement(`video`);
                    video.preload = `metadata`;

                    video.onloadedmetadata = () => {
                        URL.revokeObjectURL(video.src);
                        file.duration = video.duration;
                        i++;
                        if (i >= this.files.length) {
                            resolve();
                        }
                    }

                    video.src = URL.createObjectURL(file);
                }
            })

            await promise;

            ipcRenderer.send(`add-files`, this.files.map(f => {
                return {
                    path: f.path,
                    name: f.name,
                    duration: f.duration
                }
            }));
        },
        selectMedia(media) {
            this.selectedMedia = media;
            ipcRenderer.send(`select-media`, this.selectedMedia.id);
        },
        selectDevice(device) {
            this.selectedDevice = device;
            ipcRenderer.send(`select-player`, this.selectedDevice.id);
        },
        selectSubtitles(subtitles) {
            this.selectedSubtitles = subtitles;
            ipcRenderer.send(`select-subtitles`, this.selectedSubtitles.language);
        },
        sendSimpleCommand(command, args) {
            ipcRenderer.send(command, args);
        }
    }
}
</script>

<style lang="scss">
.active {
    background-color: rgba(255, 255, 255, 0.2);
}
</style>
