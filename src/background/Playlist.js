export default class Playlist {
    constructor() {
        this.medias = [];
        this.currentMedia = null;
        this.mediaChangedCallback = () =>{};
    }

    add(media) {
        this.medias.push(media);
        if (!this.currentMedia) {
            this.setCurrentMedia(media.id);
        }
    }

    getMedia(id) {
        return this.medias.find(m => m.id === id);
    }

    setCurrentMedia(mediaId) {
        this.currentMedia = this.getMedia(mediaId);
        this.mediaChangedCallback(this.currentMedia);
    }

    getCurrentMedia() {
        return this.currentMedia;
    }

    previous() {
        let index = this.medias.findIndex(m => m.id === this.currentMedia.id);
        index = (index - 1) < 0 ? (this.medias.length - 1) : (index - 1);
        this.setCurrentMedia(this.medias[index].id);
    }

    next() {
        let index = this.medias.findIndex(m => m.id === this.currentMedia.id);
        index = (index + 1) % this.medias.length;
        this.setCurrentMedia(this.medias[index].id);
    }

    onMediaChanged(callback) {
        this.mediaChangedCallback = callback;
    }
}
