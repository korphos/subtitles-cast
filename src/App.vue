<template>
    <v-app>
        <v-app-bar app dark>
            <v-app-bar-nav-icon @click="showMenu = true"></v-app-bar-nav-icon>

            <v-spacer></v-spacer>

            <div class="d-flex align-center">
                <v-img src="@/assets/logo.png" alt="Subtitles Cast Logo" class="shrink mr-2" contain transition="scale-transition" width="40"/>

                <h1>Subtitles Cast</h1>
            </div>
        </v-app-bar>

        <v-navigation-drawer v-model="showMenu" absolute temporary>
            <v-list nav dense>
                <v-list-item-group active-class="deep-purple--text text--accent-4">
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-home</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Home</v-list-item-title>
                    </v-list-item>

                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-account</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Account</v-list-item-title>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-navigation-drawer>

        <v-main>
            <keep-alive>
                <router-view></router-view>
            </keep-alive>
        </v-main>
    </v-app>
</template>

<script>

export default {
    name: `App`,
    data: () => {
        return {
            showMenu: false
        }
    }
};
</script>

<style lang="scss">
body {
    color: white;
}
</style>
