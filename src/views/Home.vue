<template>
    <section class="main-content">
        <v-container>
            <v-row>
                <v-col>
                    <v-card>
                        <v-card-title>Chromecast players</v-card-title>
                        <v-virtual-scroll :items="chromecastDevices" :item-height="50" height="500">
                            <template v-slot="{item}">
                                <v-list-item :class="{active: selectedDevice && selectedDevice.friendlyName === item.friendlyName}" @click="selectDevice(item)">
                                    <v-list-item-content>
                                        <v-list-item-title>{{ item.friendlyName }}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            </template>
                        </v-virtual-scroll>
                    </v-card>
                </v-col>
                <v-col>
                    <v-card>
                        <v-card-title>Playlist</v-card-title>
                        <v-btn @click="$refs.files.click()" color="blue" dark small absolute top right fab type="file">
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>

                        <input ref="files" type="file" style="display: none" accept="video/*,.mkv" multiple @change="addFiles">

                        <v-virtual-scroll v-if="playlist" :items="playlist.medias" :item-height="50" height="500">
                            <template v-slot="{item}">
                                <v-list-item class="video-item" :class="{active: selectedMedia && selectedMedia.id === item.id}" @click="selectMedia(item)">
                                    <!--                                    <v-list-item-avatar>-->
                                    <!--                                        <v-avatar size="56" class="white&#45;&#45;text">-->
                                    <!--                                            <img :src="item.thumbnail" :alt="item.name">-->
                                    <!--                                        </v-avatar>-->
                                    <!--                                    </v-list-item-avatar>-->

                                    <v-list-item-content>
                                        <v-list-item-title :title="item.name">{{ item.name }}</v-list-item-title>
                                    </v-list-item-content>

                                    <v-list-item-action>
                                        <v-icon right small>fa-trash</v-icon>
                                    </v-list-item-action>
                                </v-list-item>
                            </template>
                        </v-virtual-scroll>
                    </v-card>
                </v-col>
                <v-col>
                    <v-card>
                        <v-card-title>Subtitles</v-card-title>
                        <v-virtual-scroll v-if="selectedMedia" :items="selectedMedia.subtitles" :item-height="50" height="500">
                            <template v-slot="{item}">
                                <v-list-item :class="{active: selectedSubtitles && selectedSubtitles.language === item.language}" @click="selectSubtitles(item)">
                                    <!--                                    <v-list-item-avatar>-->
                                    <!--                                        <v-avatar size="56" class="white&#45;&#45;text">-->
                                    <!--                                            <img :src="item.thumbnail" :alt="item.name">-->
                                    <!--                                        </v-avatar>-->
                                    <!--                                    </v-list-item-avatar>-->

                                    <v-list-item-content>
                                        <v-list-item-title>{{ item.language }}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            </template>
                        </v-virtual-scroll>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>

        <div class="player-slider" v-if="selectedMedia">
            {{ currentTime|duration }}/{{ selectedMedia.duration|duration }}
            <v-slider v-model="currentTime"
                      @end="sendSimpleCommand(`seekTo`, currentTime)" @click="sendSimpleCommand(`seekTo`, currentTime)"
                      min="0" :max="selectedMedia.duration"></v-slider>
        </div>

        <v-bottom-navigation class="player-buttons">
            <v-btn v-if="status !== `playing`" @click="sendSimpleCommand(`play`)">
                <v-icon>fa-play</v-icon>
            </v-btn>
            <v-btn v-if="status === `playing`" @click="sendSimpleCommand(`pause`)">
                <v-icon>fa-pause</v-icon>
            </v-btn>
            <v-btn @click="sendSimpleCommand(`previous`)">
                <v-icon>fa-step-backward</v-icon>
            </v-btn>
            <v-btn @click="sendSimpleCommand(`stop`)">
                <v-icon>fa-stop</v-icon>
            </v-btn>
            <v-btn @click="sendSimpleCommand(`next`)">
                <v-icon>fa-step-forward</v-icon>
            </v-btn>
            <v-btn @click="sendSimpleCommand(`seek`, -30)">
                <v-icon>mdi-rewind-30</v-icon>
            </v-btn>
            <v-btn @click="sendSimpleCommand(`seek`, -10)">
                <v-icon>mdi-rewind-10</v-icon>
            </v-btn>
            <v-btn @click="sendSimpleCommand(`seek`, 10)">
                <v-icon>mdi-fast-forward-10</v-icon>
            </v-btn>
            <v-btn @click="sendSimpleCommand(`seek`, 30)">
                <v-icon>mdi-fast-forward-30</v-icon>
            </v-btn>
            <v-slider class="volume" v-model="volume" @change="sendSimpleCommand(`change-volume`, volume)" min="0" max="100" style="max-width: 100px"></v-slider>
        </v-bottom-navigation>
    </section>
</template>

<script>
import moment from "moment"

let ipcRenderer;
if (window.require) {
    ipcRenderer = window.require(`electron`).ipcRenderer;
} else {
    ipcRenderer = {
        send: () => {
        },
        on: () => {
        }
    }
}

export default {
    name: `Home`,
    data() {
        return {
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
        if (!window.require) {
            this.playlist = {
                medias: [{
                    id: 1,
                    name: `Video 1`,
                     subtitles: [{language: `French`}]
                }, {
                    id: 2,
                    name: `Video 2`
                }, {
                    id: 3,
                    name: `Video 3`
                }]
            }
        }

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
        async addFiles(event) {
            const files = [];
            const promise = new Promise(resolve => {
                let i = 0;
                for (const file of event.target.files) {
                    const video = document.createElement(`video`);
                    video.preload = `metadata`;

                    files.push(file);
                    video.onloadedmetadata = () => {
                        URL.revokeObjectURL(video.src);
                        file.duration = video.duration;
                        i++;
                        if (i >= event.target.files.length) {
                            resolve();
                        }
                    }

                    video.src = URL.createObjectURL(file);
                }
            })

            await promise;

            ipcRenderer.send(`add-files`, files.map(f => {
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
    background-color: rgba(255, 255, 255, 0.2) !important;
}

.player-slider {
    position: fixed !important;
    bottom: 56px;
    left: 20px;
    right: 20px;
    z-index: 10;
}

.player-buttons {
    position: fixed !important;
    bottom: 0;
    left: 0;
    right: 0;
}

.video-item {
    background: linear-gradient(rgba(255, 255, 255, 0.01), rgba(255, 255, 255, 0.02));
}

.volume {
    $margin-volume: 12px;
    margin-top: $margin-volume;
    margin-bottom: $margin-volume;
}
</style>
