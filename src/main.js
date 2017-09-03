// Zeroframe
var ZeroFrame = require("./ZeroFrame.js");

// Router
var Router = require("./router.js");

// Router Pages
var Home = require("./router_pages/home.js");

// Vue
var Vue = require("vue/dist/vue.min.js");
var VueZeroFrameRouter = require("./vue-zeroframe-router.js");

// Vue Components
require("./vue_components/navbar.js");
require("./vue_components/signin-modal.js");

Vue.use(VueZeroFrameRouter.VueZeroFrameRouter);

var app = new Vue({
    el: "#app",
    template: `
        <div>
            <custom-nav v-on:show-signin-modal="showSigninModal()" v-bind:user="getUser"></custom-nav>
            <component v-bind:is="currentView" v-on:show-signin-modal="showSigninModal()"></component>
            <signin-modal v-model="signin_modal_active" v-if="signin_modal_active"></signin-modal>
        </div>
        `,
    data: {
        //page: null,
        currentView: null,
        siteInfo: null,
        signin_modal_active: false
    },
    computed: {
        getUser: function() {
            if (this.siteInfo) {
                return this.siteInfo.cert_user_id;
            }
            return null;
        }
    },
    methods: {
        showSigninModal: function() {
            this.signin_modal_active = true;
        },
        closeSigninModal: function() {
            this.signin_modal_active = false;
        }
    }
});

class ZeroApp extends ZeroFrame {
    onOpenWebsocket() {
        this.cmd("siteInfo", {}, (site_info) => {
            this.site_info = site_info;
            app.siteInfo = this.site_info;
        });
        this.cmd("wrapperNotification", ["info", "This is still in development!"]);
    }
    
    onRequest(cmd, message) {
        if (cmd == "setSiteInfo") {
            this.site_info = message.params;
            //app.from = this.site_info.auth_address;
            app.siteInfo = this.site_info;
        }
        Router.listenForBack(cmd, message);
        console.log(message);
    }
    
    selectUser(f = null) {
        this.cmd("certSelect", {accepted_domains: ["zeroid.bit", "kaffie.bit", "cryptoid.bit"]}, () => {
            if (f != null && typeof f == 'function') f();
        });
        return false;
    }
}

page = new ZeroApp();
/*app.page = (<any>page);*/
//app.page = page;
//Object.defineProperty(app, 'page', () => page);
//app.page = page;

VueZeroFrameRouter.VueZeroFrameRouter_Init(Router, app, [
    { route: '', component: Home }
]);