var Vue = require("vue/dist/vue.min.js");
var Router = require("../router.js");

Vue.component("signin-modal", {
    props: ["value", "userInfo"],
    beforeMount: function() {
        if (this.userInfo && page.site_info.cert_user_id != null) {
            this.close();
        }
        this.currentSlide = 0;
        this.slideTitle = "";
        this.name = "";
        this.about = "";

        var that = this;

        page.getTopics((topics) => {
            that.topics = topics;
        });
        page.getUsers((users) => {
            that.existingUsers = users;
        });
    },
    data: function() {
        return {
            currentSlide: 0,
            slideTitle: "",
            name: "",
            about: "",
            primaryLanguage: "",
            secondaryLanguages: [],
            topics: [],
            interests: [],
            existingUsers: [],
            languages: [{ code: "EN", name: "English" }, { code: "ES", name: "Espanol" }, { code: "ZH", name: "Chineese" }]
        };
    },
    computed: {
        shouldShowClose: function() {
            return this.currentSlide === 0;
        }
    },
    methods: {
        close: function() {
            this.$emit("input", false);
        },
        signin: function() {
            // var previousId = page.site_info.cert_user_id;
            var that = this;

            page.selectUser(function() {
                that.usersFileExists((exists) => {
                    if (exists) {
                        that.close();
                    } else {
                        that.showNext();
                    }
                });
            });
        },
        newUserData: function(name = null, about = null, primaryLanguage = null, secondaryLanguages = null, interests = null) {
            var interestsString = "";

            for (i = 0; i < interests.length; i++) {
                interestsString += interests[i];
                if (i < interests.length - 1) {
                    interestsString += ",";
                }
            }

            // Make sure primaryLanguage isn't in secondaryLanguages array
            var index = secondaryLanguages.indexOf(primaryLanguage);

            if (index > -1) {
                secondaryLanguages.splice(index, 1);
            }

            return {
                name: name,
                about: about,
                languages: primaryLanguage + "," + secondaryLanguages.join(","),
                interests: interestsString
            };
        },
        createId: function(from) {
            if (from === "zeroid") {
                page.cmd("wrapperOpenWindow", ["../zeroid.bit", "_blank"]);
            }
            if (from === "kaffieid") {
                page.cmd("wrapperOpenWindow", ["../id.kaffie.bit", "_blank"]);
            }
            if (from === "cryptoid") {
                page.cmd("wrapperOpenWindow", ["../cryptoid.bit", "_blank"]);
            }
        },
        usersFileExists: function(f) {
            var data_inner_path = "data/users/" + page.site_info.auth_address + "/data.json";
            var content_inner_path = "data/users/" + page.site_info.auth_address + "/content.json";
            
            page.cmd("fileGet", { "inner_path": data_inner_path, "required": false }, (data) => {
                if (data) {
                    f(true, null, null, null);
                } else {
                    f(false, data, data_inner_path, content_inner_path);
                }
            });
        },
        showNext: function() {
            if (this.currentSlide == 1) {
                // Username blacklist
                var name = this.name.toLowerCase();

                if (name === "") {
                    page.cmd("wrapperNotification", ["error", "Please enter a username."]);
                    return;
                }

                if (name === "admin" || name === "Admin" || name === "account" || name === "blog"
                    || name === "api" || name === "cache" || name === "changelog" || name === "enterprise"
                    || name === "gist" || name === "help" || name === "jobs" || name === "lists" || name === "login"
                    || name === "logout" || name === "mine" || name === "news" || name === "plans"
                    || name === "popular" || name === "projects" || name === "security" || name === "shop" || name === "translations"
                    || name === "signup" || name === "register" || name === "status" || name === "wiki" || name === "stories" || name === "medium"
                    || name === "organizations" || name === "better" || name === "compare" || name === "hosting" || name === "tour" || name === "styleguide") {
                    page.cmd("wrapperNotification", ["error", "You aren't allowed to use this username!"]);
                    return;
                }

                for (var i = 0; i < this.existingUsers.length; i++) {
                    if (!this.existingUsers[i].value || typeof this.existingUsers[i].value !== "string") continue;
                    var existingName = this.existingUsers[i].value.toLowerCase().trim();

                    if (existingName === name) {
                        page.cmd("wrapperNotification", ["error", "Username already taken!"]);
                        return;
                    }
                }

                if (this.primaryLanguage == "") {
                    page.cmd("wrapperNotification", ["error", "Please select a primary language."]);
                    return;
                }
            }
            this.currentSlide++;
            this.slideTitle = " - ";
            if (this.currentSlide == 1) {
                this.slideTitle += "Setup Profile";
            } else if (this.currentSlide == 2) {
                this.slideTitle += "Interests";
            }
        },
        finish: function() {
            var that = this;

            this.usersFileExists((exists, data, data_inner_path, content_inner_path) => {
                if (exists) {
                    that.close();
                } else {
                    data = that.newUserData(that.name.trim(), that.about.trim(), that.primaryLanguage, that.secondaryLanguages, that.interests);

                    var json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, "\t")));

                    page.cmd("fileWrite", [data_inner_path, btoa(json_raw)], (res) => {
                        if (res === "ok") {
                            // Get user info again
                            page.cmd("siteSign", { "inner_path": content_inner_path }, () => {
                                that.$emit("get-user-info");
                                page.cmd("sitePublish", { "inner_path": content_inner_path, "sign": false });
                                Router.navigate("help");
                            });
                        } else {
                            page.cmd("wrapperNotification", ["error", "File write error: #{res}"]);
                        }
                    });
                    that.close();
                }
            });
        },
        toggleLanguage: function(language) {
            if (language.code === this.primaryLanguage) {
                return;
            }
            
            var index = this.secondaryLanguages.indexOf(language.code);

            if (index > -1) {
                this.secondaryLanguages.splice(index, 1);
            } else {
                this.secondaryLanguages.push(language.code);
            }
        },
        isLanguageChecked: function(language) {
            return this.secondaryLanguages.includes(language.code) || language.code == this.primaryLanguage;
        },
        toggleInterest: function(name) {
            for (var i = 0; i < this.interests.length; i++) {
                if (this.interests[i] == name) {
                    this.interests.splice(i, 1);
                    return;
                }
            }
            this.interests.push(name);
        },
        isChecked: function(name) {
            for (var i = 0; i < this.interests.length; i++) {
                if (this.interests[i] == name) {
                    return true;
                }
            }

            return false;
        }
    },
    template: `
        <div class="modal" v-bind:class="{ 'is-active': value }">
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Signin / Signup{{ slideTitle }}</p>
                    <button class="delete" v-on:click.prevent="close()" v-if="shouldShowClose"></button>
                </header>
                <section class="modal-card-body" v-if="currentSlide == 0">
                    <p>
                        If you have an Id from a supported Id provider, <em>even if it's your first time logging in</em>, click this sign in button:
                    </p>
                    <a class="button is-info" style="width: 100%; padding-top: 25px; padding-bottom: 25px; margin-top: 5px;" v-on:click.prevent="signin()">Sign in/Register with Id</a>
                    <br>
                    <p>
                        If you don't already have an Id from one of the Id Providers below, click on the button to register, then come back here and click signin to use that newly created id provider.
                    </p>
                    <a class="button" style="width: 100%; padding-top: 25px; padding-bottom: 25px; margin-top: 5px;" v-on:click.prevent="createId('zeroid')">Create an Id from ZeroId</a>
                    <a class="button" style="width: 100%; padding-top: 25px; padding-bottom: 25px; margin-top: 5px;" v-on:click.prevent="createId('kaffieid')">Create an Id from KaffieId</a>
                    <a class="button" style="width: 100%; padding-top: 25px; padding-bottom: 25px; margin-top: 5px;" v-on:click.prevent="createId('cryptoid')">Create an Id from CryptoId</a>
                </section>
                <section class="modal-card-body" v-if="currentSlide == 1">
                    <p><a v-on:click.prevent="signin()">{{ userInfo ? userInfo.cert_user_id : "" }}</a></p>
                    <div class="field">
                        <label class="label">Name</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Name" v-model="name">
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">About</label>
                        <div class="control">
                            <textarea class="textarea" placeholder="About" v-model="about"></textarea>
                        </div>
                    </div>
					
                    <div class="field">
                        <label class="label">Primary Language</label>
                        <div class="select">
    						<select v-model="primaryLanguage">
                                <option v-for="language in languages" :value="language.code">{{ language.code }} - {{ language.name }}</option>
    						</select>
    					</div>
                    </div>

                    <div class="field">
                        <label class="label">Other Languages</label>
                        <div v-for="language in languages" :key="language.code" style="float: left; margin-right: 10px;">
                            <a style="margin-right: 10px; display: inline-block;" v-on:click.prevent="toggleLanguage(language)">
                                <span v-if="isLanguageChecked(language)" class="icon is-small">
                                    <i class="fa fa-check" aria-hidden="true"></i>
                                </span>
                                {{ language.name }}
                            </a>
                        </div>
                    </div>

                    <br>
                    <button class="button" v-on:click.prevent="showNext()" style="margin-top: 10px;">Next</button>
                </section>
                <section class="modal-card-body" v-if="currentSlide == 2 && topics">
                    <p><a v-on:click.prevent="signin()">{{ userInfo ? userInfo.cert_user_id : "" }}</a></p>
                    <div v-for="topic in topics" :key="topic.slug" style="float: left; margin-right: 10px;">
                        <a style="margin-right: 10px; display: inline-block;" v-on:click.prevent="toggleInterest(topic.name)">
                            <span v-if="isChecked(topic.name)" class="icon is-small">
                                <i class="fa fa-check" aria-hidden="true"></i>
                            </span>
                            {{ topic.name }}
                        </a>
                    </div>
                    <div style="clear: both;"></div>
                    <button class="button" v-on:click.prevent="finish()" style="margin-top: 5px;">Finish</button>
                </section>
            </div>
        </div>
        `
});
