var Vue = require("vue/dist/vue.min.js");
var Router = require("../router.js");

Vue.component('custom-nav', {
    props: ['userInfo', 'shadow'],
    data: function() {
        return {
            menuShown: false // For touch devices
        }
    },
    computed: {
        isLoggedIn: function() {
            if (this.userInfo == null) return false;
            return this.userInfo.cert_user_id != null;
        }
    },
    methods: {
        showSigninModal: function() {
            this.$emit('show-signin-modal');
        },
        writeStory: function() {
            if (this.isLoggedIn) {
                // Navigate to write new story page
            } else {
                // Show Signin Modal if not logged in
                this.showSigninModal();
            }
        },
        toggleMenu: function() { // For touch devices
            this.menuShown = !this.menuShown;
        },
        goto: function(to) {
            this.menuShown = false;
            Router.navigate(to);
        }
    },
    template: `
            <nav class="navbar is-transparent" v-bind:class="{ 'has-shadow': shadow }">
                <div class="container">
                    <div class="navbar-brand">
                        <a class="navbar-item" href="./?/" style="font-weight: bold;" v-on:click.prevent="goto('')">ZeroMedium</a>
                        <a class="navbar-item is-hidden-desktop" v-if="isLoggedIn" style="margin-left: auto;">{{ userInfo ? userInfo.keyvalue.name : "" }}</a>
                        <a class="navbar-item is-hidden-desktop" v-on:click.prevent="showSigninModal()" v-else style="margin-left: auto;">Sign in / Sign up</a>
                        <div class="navbar-burger burger" v-bind:class="{ 'is-active': menuShown }" style="margin-right: 70px; margin-left: 0 !important;" v-on:click.prevent="toggleMenu()">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                    <div class="navbar-menu" v-bind:class="{ 'is-active': menuShown }">
                        <div class="navbar-start is-hidden-touch">
                            <a class="navbar-item" href="./?/newstory" v-on:click.prevent="goto('newstory')">Write a story</a>
                        </div>
                        <div class="navbar-end">
                            <div class="navbar-item has-dropdown is-hoverable">
                                <a class="navbar-link">{{ userInfo ? userInfo.keyvalue.name : "" }}</a>
                                <div class="navbar-dropdown is-right">
                                    <a class="navbar-item" href="./?/newstory" v-on:click.prevent="goto('newstory')">New Story</a>
                                    <a class="navbar-item" href="./?/me/stories" v-on:click.prevent="goto('me/stories')">Stories</a>
                                    <a class="navbar-item">Series</a>
                                    
                                    <hr class="navbar-divider">
                                    
                                    <a class="navbar-item">Bookmarks</a>
                                    <a class="navbar-item">Customize your interests</a>
                                    
                                    <hr class="navbar-divider">
                                    
                                    <a class="navbar-item" :href="'./?/' + (userInfo ? userInfo.auth_address : '')" v-on:click.prevent="goto(userInfo ? userInfo.auth_address : '')">Profile</a>
                                    <a class="navbar-item">Settings</a>
                                    <a class="navbar-item">Help</a>
                                    <a class="navbar-item">Change user</a>
                                </div>
                            </div>
                            <a class="navbar-item" v-on:click.prevent="showSigninModal()" v-else>Sign in / Sign up</a>
                        </div>
                    </div>
                </div>
            </nav>
        `
});