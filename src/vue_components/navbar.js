var Vue = require("vue/dist/vue.min.js");
var Router = require("../router.js");
var { cache_add, cache_replace, cache_remove, cache_get, cache_getOrAdd, cache_exists, cache_clear } = require("../cache.js");

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
        },
        signout: function() {
            var that = this;

            page.signout(function() {
                that.menuShown = false;
                cache_remove("home_topics");
                if (Router.currentRoute == "") {
                    that.$parent.$refs.view.getTopics();
                } else {
                    Router.navigate("");
                }
            });
        }
    },
    template: `
            <nav class="navbar is-transparent" v-bind:class="{ 'has-shadow': shadow }">
                <div class="container">
                    <div class="navbar-brand">
                        <a class="navbar-item" href="./?/" style="font-weight: bold;" v-on:click.prevent="goto('')">ZeroMedium BETA</a>
                        <a class="navbar-item is-hidden-desktop" v-if="isLoggedIn" style="margin-left: auto;" :href="'./?/' + (userInfo ? userInfo.auth_address : '')" v-on:click.prevent="goto(userInfo ? userInfo.auth_address : '')">{{ userInfo ? userInfo.keyvalue.name : "" }}</a>
                        <a class="navbar-item is-hidden-desktop" v-on:click.prevent="showSigninModal()" v-else style="margin-left: auto;">Sign in / Sign up</a>
                        <div class="navbar-burger burger" v-bind:class="{ 'is-active': menuShown }" style="margin-right: 70px; margin-left: 0 !important;" v-on:click.prevent="toggleMenu()">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                    <div class="navbar-menu" v-bind:class="{ 'is-active': menuShown }">
                        <div class="navbar-start is-hidden-touch">
                            <a class="navbar-item" href="./?/me/newstory" v-on:click.prevent="goto('me/newstory')">Write a story</a>
                            <a class="navbar-item" href="/1BEPbMfV8QtaZCD2cPNbabfDKnmhTAZRPx">Report Bug</a>
                        </div>
                        <div class="navbar-end">
                            <div class="navbar-item has-dropdown is-hoverable" v-if="isLoggedIn">
                                <a class="navbar-link is-hidden-touch">{{ userInfo ? userInfo.keyvalue.name : "" }}</a>
                                <!--<a class="navbar-link" v-on:click.prevent="showSigninModal()" v-else>Sign in / Sign up</a>-->
                                <div class="navbar-dropdown is-right">
                                    <a class="navbar-item is-hidden-desktop" href="./?/search" v-on:click.prevent="goto('search')">Search</a>

                                    <a class="navbar-item" href="./?/me/newstory" v-on:click.prevent="goto('me/newstory')">New Story</a>
                                    <a class="navbar-item" href="./?/me/stories" v-on:click.prevent="goto('me/stories')">Stories</a>
                                    <a class="navbar-item">Series</a>
                                    
                                    <hr class="navbar-divider">
                                    
                                    <a class="navbar-item">Bookmarks</a>
                                    <a class="navbar-item" v-on:click.prevent="goto('topics')">Customize your interests</a>
                                    
                                    <hr class="navbar-divider">
                                    
                                    <a class="navbar-item" :href="'./?/' + (userInfo ? userInfo.auth_address : '')" v-on:click.prevent="goto(userInfo ? userInfo.auth_address : '')">Profile</a>
                                    <a class="navbar-item" :href="'./?/me/settings'" v-on:click.prevent="goto('me/settings')">Settings</a>
                                    <a class="navbar-item" :href="'./?/help'" v-on:click.prevent="goto('help')">Help</a>
                                    <a class="navbar-item" v-on:click.prevent="signout()">Signout</a>
                                </div>
                            </div>
                            <a class="navbar-item" v-on:click.prevent="showSigninModal()" v-else>Sign in / Sign up</a>
                            <a class="navbar-item" :class="{ 'is-hidden-touch': isLoggedIn }" v-on:click.prevent="goto('search')">Search</a>
                        </div>
                    </div>
                </div>
            </nav>
        `
});
