var Vue = require("vue/dist/vue.min.js");

Vue.component('custom-nav', {
    props: ['user'],
    computed: {
        isLoggedIn: function() {
            console.log(this.user);
            return this.user != null;
        }
    },
    methods: {
        showSigninModal: function() {
            this.$emit('show-signin-modal');
        }
    },
    template: `
            <nav class="navbar is-transparent">
                <div class="container">
                    <div class="navbar-brand">
                        <a class="navbar-item" href="#" style="font-weight: bold;">ZeroMedium</a>
                        <a class="navbar-item is-hidden-desktop" v-if="isLoggedIn">{{ user }}</a>
                        <a class="navbar-item is-hidden-desktop" v-on:click.prevent="showSigninModal()" v-else>Sign in / Sign up</a>
                        <div class="navbar-burger burger" style="margin-right: 70px;">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                    <div class="navbar-menu">
                        <div class="navbar-start">
                            <a class="navbar-item">
                                Write a story
                            </a>
                        </div>
                        <div class="navbar-end">
                        <a class="navbar-item" v-if="isLoggedIn">{{ user }}</a>
                            <a class="navbar-item" v-on:click.prevent="showSigninModal()" v-else>Sign in / Sign up</a>
                        </div>
                    </div>
                </div>
            </nav>
        `
});