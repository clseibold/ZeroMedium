import { sayHello } from "./greet";
import { ZeroFrame, SiteInfo, Message } from "./ZeroFrame";

//showHello("greeting", "Typescript!");

class ZeroApp extends ZeroFrame {
    public site_info: SiteInfo;

    onOpenWebsocket() {
        this.cmd("siteInfo", {}, (site_info: SiteInfo) => {
            this.site_info = site_info;
            this.showHello("greeting", site_info.auth_address);
            console.log(site_info);
        });
        this.cmd("wrapperNotification", ["info", "This is still in development!"]);
    }

    onRequest(cmd: string, message: Message) {
        if (cmd == "setSiteInfo") {
            this.site_info = message.params;
        }
        console.log(message);
    }

    showHello(divName: string, name: string) {
        const elt = document.getElementById(divName);
        elt.innerText = sayHello(name);
    }
}

let app = new ZeroApp();