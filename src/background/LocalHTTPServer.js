import express from "express";
import fs from "fs";

export default class LocalHTTPServer {
    start(playlist) {
        const router = express();

        router.get(`/video/:id`, (req, res) => {
            const media = playlist.getMedia(req.params.id);
            if (!media) {
                res.sendStatus(404);
                return;
            }

            const stat = fs.statSync(media.filePath);
            const fileSize = stat.size;
            const {range} = req.headers;

            if (range) {
                const parts = range.replace(/bytes=/, ``).split(`-`);
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunksize = (end - start) + 1;
                const file = fs.createReadStream(media.filePath, {
                    start,
                    end
                });
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': `bytes`,
                    'Content-Length': chunksize,
                    'Content-Type': `video/mkv`,
                    'Access-Control-Allow-Origin': '*'
                };
                res.writeHead(206, head);
                file.pipe(res);
            } else {
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': `video/mkv`,
                    'Access-Control-Allow-Origin': '*'
                };
                res.writeHead(200, head);
                fs.createReadStream(media.filePath).pipe(res);
            }
        });

        router.get('/subtitles/:id/:language.vtt', function(req, res) {
            const media = playlist.getMedia(req.params.id);
            if (!media) {
                res.sendStatus(404);
                return;
            }

            const vtt = media.getVTTSubtitles(req.params.language);
            res.type('text/plain')
                .set({
                    'Access-Control-Allow-Origin': '*'
                }).send(vtt);
        });

        router.listen(3000, () => {
            console.log(`Example app listening on port 3000!`);
        });
    }
}
