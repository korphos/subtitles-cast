module.exports = {
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                "appId": "com.subtitlescast",
                "productName": "Subtitles Cast",
                "copyright": "Copyright © 2020 Alexandre CHENIEUX",
                "win": {
                    "icon": "./public/logo.png",
                    "publisherName": "Alexandre CHENIEUX",
                    "target": "nsis"
                },
                "nsis": {
                    "oneClick": true,
                    "perMachine": true,
                    "allowElevation": true,
                    "createDesktopShortcut": true,
                    "installerIcon": "./public/logo.png"
                }
            }
        }
    },
    transpileDependencies: [
        `vuetify`
    ]
}
