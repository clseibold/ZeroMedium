//import { sayHello } from "./greet";
import { ZeroFrame, SiteInfo, Message } from "./ZeroFrame";
import * as Vue from "vue/dist/vue.min.js";

//showHello("greeting", "Typescript!");

let app = new Vue({
    el: "#app",
    template: '<p>Hello to {{from}}!</p>',
    data: {
        from: "[Loading...]"
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
        console.log(message);
    }
}

let page = new ZeroApp();