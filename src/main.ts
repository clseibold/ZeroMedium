// Zeroframe
import { ZeroFrame, SiteInfo, Message } from "./ZeroFrame";

// Router
import { Router } from "./router"

// Router Pages
import { Home } from "./router_pages/home"

// Vue
import * as Vue from "vue/dist/vue.min.js";
import { VueZeroFrameRouter, VueZeroFrameRouter_Init } from "./vue-zeroframe-router"

// Vue Components
import "./vue_components/navbar";
import "./vue_components/signin-modal";

Vue.use(VueZeroFrameRouter);

let app = new Vue({
    el: "#app",
    template: `
    <div>
        <custom-nav></custom-nav>
        <component v-bind:is="currentView"></component>
        <signin-modal v-bind:active="signin_modal_active"></signin-modal>
    </div>
    `,
    data: {
        currentView: null,
        from: "[Loading...]",
        signin_modal_active: true
    }
});

class ZeroApp extends ZeroFrame {
    public site_info: SiteInfo;

    onOpenWebsocket() {
        this.cmd("siteInfo", {}, (site_info: SiteInfo) => {
            this.site_info = site_info;
            //this.showHello("greeting", site_info.auth_address);
            app.from = site_info.auth_address;
        });
        this.cmd("wrapperNotification", ["info", "This is still in development!"]);
    }

    onRequest(cmd: string, message: Message) {
        if (cmd == "setSiteInfo") {
            this.site_info = message.params;
            app.from = this.site_info.auth_address;
        }
        Router.listenForBack(cmd, message);
        console.log(message);
    }
    
    selectUser() {
        this.cmd("certSelect", {accepted_domains: ["zeroid.bit", "kaffie.bit", "cryptoid.bit"]});
        return false;
    }
}

let page = new ZeroApp();

VueZeroFrameRouter_Init(Router, app, [
    { route: '', component: Home }
]);