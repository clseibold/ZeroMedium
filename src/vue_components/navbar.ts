import * as Vue from "vue/dist/vue.min.js";

Vue.component('custom-nav', {
    template: `
            <nav class="navbar is-transparent">
                <div class="container">
                    <div class="navbar-brand">
                        <a class="navbar-item" href="#" style="font-weight: bold;">ZeroMedium</a>
                        <a class="navbar-item is-hidden-desktop">Sign in / Sign up</a>
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
                            <a class="navbar-item">Sign in / Sign up</a>
                        </div>
                    </div>
                </div>
            </nav>
        `
});