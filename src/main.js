// Zeroframe
var ZeroFrame = require("./ZeroFrame.js");

// Router
var Router = require("./router.js");

// Vue
var Vue = require("vue/dist/vue.min.js");
var VueZeroFrameRouter = require("./vue-zeroframe-router.js");

// Vue Components
require("./vue_components/navbar.js");
require("./vue_components/signin-modal.js");

var sanitizeHtml = require('sanitize-html');
var { sanitizeStringForUrl, sanitizeStringForUrl_SQL } = require('./util.js');

Vue.use(VueZeroFrameRouter.VueZeroFrameRouter);

var app = new Vue({
    el: "#app",
    template: `
        <div>
            <custom-nav v-on:show-signin-modal="showSigninModal()" v-on:get-user-info="getUserInfo()" v-bind:user-info="userInfo" v-bind:shadow="navbarShadow"></custom-nav>
            <component v-bind:is="currentView" v-on:show-signin-modal="showSigninModal()" v-on:navbar-shadow-on="navbarShadowOn()" v-on:navbar-shadow-off="navbarShadowOff()" v-on:get-user-info="getUserInfo()" v-bind:user-info="userInfo"></component>
            <signin-modal v-model="signin_modal_active" v-on:get-user-info="getUserInfo()" v-if="signin_modal_active" v-bind:user-info="userInfo"></signin-modal>
        </div>
        `,
    data: {
        //page: null,
        currentView: null,
        siteInfo: null,
        userInfo: null,
        navbarShadow: false,
        signin_modal_active: false
    },
    methods: {
        navbarShadowOn: function() {
            this.navbarShadow = true;
        },
        navbarShadowOff: function() {
            this.navbarShadow = false;
        },
        showSigninModal: function() {
            if (this.siteInfo == null) return;
            this.signin_modal_active = true;
        },
        closeSigninModal: function() {
            this.signin_modal_active = false;
        },
        getUserInfo: function() {
            if (this.siteInfo == null || this.siteInfo.cert_user_id == null) {
                this.userInfo = null;
                return;
            }

            var that = this;
            page.cmd('dbQuery', ['SELECT key, value FROM keyvalue LEFT JOIN json USING (json_id) WHERE cert_user_id="' + this.siteInfo.cert_user_id + '" AND directory="users/' + this.siteInfo.auth_address + '"'], (rows) => {
                var keyvalue = {};
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    keyvalue[row.key] = row.value;
                }
                if (!keyvalue.name || keyvalue.name == "") return;
                that.userInfo = {
                    cert_user_id: that.siteInfo.cert_user_id,
                    auth_address: that.siteInfo.auth_address,
                    keyvalue: keyvalue
                };

                this.$emit('setUserInfo', that.userInfo);
            });
        }
    }
});

class ZeroApp extends ZeroFrame {
    onOpenWebsocket() {
        this.cmd("siteInfo", {}, (site_info) => {
            this.site_info = site_info;
            app.siteInfo = this.site_info;
            app.getUserInfo();
        });
        this.cmd("wrapperNotification", ["info", "This is still in development!"]);
    }
    
    onRequest(cmd, message) {
        if (cmd == "setSiteInfo") {
            this.site_info = message.params;
            //app.from = this.site_info.auth_address;
            app.siteInfo = this.site_info;
            app.getUserInfo();
        }
        Router.listenForBack(cmd, message);
        console.log(message);
        console.log(app.userInfo.keyvalue);
        console.log();
        for (var i = 0; i < app.userInfo.keyvalue.length; i++) {
            console.log(app.userInfo.keyvalue[i]);
        }
    }
    
    selectUser(f = null) {
        this.cmd("certSelect", {accepted_domains: ["zeroid.bit", "kaffie.bit", "cryptoid.bit"]}, () => {
            // TODO: Will this work always?
            //app.getUserInfo();
            if (f != null && typeof f == 'function') f();
        });
        return false;
    }

    getTopics(f = null) {
        page.cmd('dbQuery', ['SELECT * FROM topics'], (topics) => {
            if (f != null && typeof f == 'function') f(topics);
        });
    }

    getUserProfileInfo(auth_address, getStoryList, f = null) {
        var userProfileInfo = {};
        userProfileInfo["auth_address"] = auth_address;
        // Get Keyvalue data
        page.cmd('dbQuery', ['SELECT key, value, cert_user_id FROM keyvalue LEFT JOIN json USING (json_id) WHERE directory="users/' + auth_address + '"'], (rows) => {
            //console.log(rows); // TODO
            if (rows && rows.length > 0 && rows[0]) {
                userProfileInfo["cert_user_id"] = rows[0].cert_user_id;
            }
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (row.key == 'name') userProfileInfo["name"] = row.value;
                if (row.key == 'about') userProfileInfo["about"] = row.value;
            }

            // Get blog posts
            if (getStoryList) {
                userProfileInfo["stories"] = [];
                page.cmd('dbQuery', ['SELECT title, slug, description, tags, date_updated, date_added, cert_user_id FROM stories LEFT JOIN json USING (json_id) WHERE directory="users/' + auth_address + '"'], (stories) => {
                    userProfileInfo["stories"] = stories;

                    if (f != null && typeof f == 'function') f(userProfileInfo);
                });
            } else {
                if (f != null && typeof f == 'function') f(userProfileInfo);
            }
        });
    }

    sanitizeHtml(text) {
        return sanitizeHtml(text, {
            allowedTags: ['b', 'i', 'em', 'strong', 'u', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'div', 'blockquote', 'code', 'strike', 'ul', 'li', 'ol', 'nl', 'hr', 'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre'],
            allowedAttributes: {
                'a': [ 'href', 'name', 'target' ],
                'img': ['src']
            },
            allowedSchemesByTag: {
              img: [ 'data' ]
            }
        });
    }

    // TODO: Check that slug doesn't already exist, if so, add date at end (or ask user to customize)
    postStory(title, description, body, tags, f = null) {
        if (!app.userInfo || !app.userInfo.cert_user_id) {
            this.cmd("wrapperNotification", ["info", "Please login to publish."]);
            page.selectUser(); // TODO: Check if user has data, if not, show the registration modal.
            return;
        }

        var data_inner_path = "data/users/" + app.userInfo.auth_address + "/data.json";
        var content_inner_path = "data/users/" + app.userInfo.auth_address + "/content.json";

        page.cmd('fileGet', {"inner_path": data_inner_path, "required": false}, (data) => {
            if (!data) {
                // TODO: Show registration modal.
                return;
            } else {
                data = JSON.parse(data);
            }

            if (!data["stories"]) data["stories"] = [];

            data["stories"].push({
                "story_id": app.userInfo.keyvalue["next_story_id"] || 1,
                "title": title,
                "slug": sanitizeStringForUrl(title),
                "description": description,
                "body": this.sanitizeHtml(body),
                "tags": tags,
                "date_added": Date.now()
            });

            if (!app.userInfo.keyvalue["next_story_id"] || app.userInfo.keyvalue["next_story_id"] == null) app.userInfo.keyvalue["next_story_id"] = 1;
            console.log(app.userInfo.keyvalue);
            app.userInfo.keyvalue["next_story_id"]++;
            data["next_story_id"] = app.userInfo.keyvalue["next_story_id"];

            var json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, '\t')));

            page.cmd('fileWrite', [data_inner_path, btoa(json_raw)], (res) => {
                if (res == "ok") {
                    page.cmd('siteSign', {"inner_path": content_inner_path}, (res) => {
                        if (f != null && typeof f == 'function') f();
                        page.cmd('sitePublish', {"inner_path": content_inner_path, "sign": false});
                    });
                }
            });
        });
    }

    editStory(story_id, title, description, body, tags, f = null) {
        if (!app.userInfo || !app.userInfo.cert_user_id) {
            this.cmd("wrapperNotification", ["info", "Please login to publish."]);
            page.selectUser(); // TODO: Check if user has data, if not, show the registration modal.
            return;
        }

        var data_inner_path = "data/users/" + app.userInfo.auth_address + "/data.json";
        var content_inner_path = "data/users/" + app.userInfo.auth_address + "/content.json";

        page.cmd('fileGet', {"inner_path": data_inner_path, "required": false}, (data) => {
            if (!data) {
                // TODO: Error out
                console.log("ERROR");
                return;
            } else {
                data = JSON.parse(data);
            }

            if (!data["stories"]) {
                // TODO: Error out
                console.log("ERROR");
                return;
            }

            for (var i = 0; i < data["stories"].length; i++) {
                var story = data["stories"][i];
                if (story.story_id == story_id) {
                    story.title = title;
                    story.slug = sanitizeStringForUrl(title); // TODO: IFFY
                    story.body = this.sanitizeHtml(body);
                    story.tags = tags;
                    story.description = description;
                    story.date_updated = Date.now();
                    break;
                }
            }

            var json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, '\t')));

            page.cmd('fileWrite', [data_inner_path, btoa(json_raw)], (res) => {
                if (res == "ok") {
                    page.cmd('siteSign', {"inner_path": content_inner_path}, (res) => {
                        if (f != null && typeof f == 'function') f();
                        page.cmd('sitePublish', {"inner_path": content_inner_path, "sign": false});
                    });
                }
            });
        });
    }

    getStory(auth_address, slug, f = null) {
        // TODO: If two stories have the same title, go with the oldest (ORDER BY ___)
        page.cmd('dbQuery', ['SELECT * FROM stories LEFT JOIN json USING (json_id) WHERE directory="users/' + auth_address + '" AND slug="' + slug + '"'], (stories) => {
            if (!stories || stories.length == 0) {
                f(null);
                return;
            }
            if (f != null && typeof f == 'function') f(stories[0]);
        });
    }
}

page = new ZeroApp();

// Router Pages
var Home = require("./router_pages/home.js");
var TopicSlug = require("./router_pages/topic_slug.js");
var Newstory = require("./router_pages/newstory.js");
var Profile = require("./router_pages/profile.js");
var ProfileStory = require("./router_pages/profile_story.js");
var MeStories = require("./router_pages/me_stories.js");
var EditStory = require("./router_pages/edit_story.js");

VueZeroFrameRouter.VueZeroFrameRouter_Init(Router, app, [
    { route: 'topic/:slug', component: TopicSlug },
    { route: 'me/newstory', component: Newstory },
    { route: 'me/stories/:slug/edit', component: EditStory },
    { route: 'me/stories', component: MeStories },
    { route: ':userauthaddress/:slug', component: ProfileStory },
    { route: ':userauthaddress', component: Profile }, // TODO: Have tabs use '&tab='
    { route: '', component: Home }
]);