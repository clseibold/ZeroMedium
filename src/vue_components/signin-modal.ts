import * as Vue from "vue/dist/vue.min.js";

Vue.component('signin-modal', {
    props: ['active'],
    methods: {
        toggle: function() {
            this.active = !this.active;
        }
    },
    template: `
        <div class="modal" v-bind:class="{ 'is-active': active }">
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Signin / Signup</p>
                    <button class="delete" v-on:click="toggle()"></button>
                </header>
                <section class="modal-card-body">
                    <a class="button is-info" style="width: 100%;" onclick="page.selectUser()">Sign in</a>
                </section>
            </div>
        </div>
        `
});