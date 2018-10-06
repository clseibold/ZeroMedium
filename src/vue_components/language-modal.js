var Vue = require("vue/dist/vue.min.js");
var Router = require("../router.js");

Vue.component("language-modal", {
    props: ["value", "userInfo"],
    beforeMount: function() {
        if (!this.userInfo || page.site_info.cert_user_id == null) {
            this.close();
        }
    },
    data: function() {
        return {
            primaryLanguage: "",
            secondaryLanguages: [],
            languages: [{ code: "EN", name: "English" }, { code: "ES", name: "Español" }, { code: "ZH", name: "Chinese" }, { code: "UK", name: "Українська" }, { code: "RU", name: "Русский" }]
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
        usersFileExists: function(f) {
            var data_inner_path = "data/users/" + page.site_info.auth_address + "/data.json";
            var content_inner_path = "data/users/" + page.site_info.auth_address + "/content.json";

            page.cmd("fileGet", { "inner_path": data_inner_path, "required": false }, (data) => {
                if (data) {
                    f(true, JSON.parse(data), data_inner_path, content_inner_path);
                } else {
                    f(false, null, data_inner_path, content_inner_path);
                }
            });
        },
        finish: function() {
            var that = this;

            if (this.primaryLanguage == "") {
                page.cmd("wrapperNotification", ["error", "Please select a primary language."]);
                return;
            }

            this.usersFileExists((exists, data, data_inner_path, content_inner_path) => {
                if (exists) {
                    // Make sure primaryLanguage isn't in secondaryLanguages array
                    var index = that.secondaryLanguages.indexOf(that.primaryLanguage);
                    var languages = "";

                    if (index > -1) {
                        that.secondaryLanguages.splice(index, 1);
                    }

                    if (!that.secondaryLanguages || that.secondaryLanguages.length === 0) {
                        languages = that.primaryLanguage;
                    } else {
                        languages = that.primaryLanguage + "," + that.secondaryLanguages.join(",");
                    }
                    data["languages"] = languages;

                    // Set language of all current stories to primary language (as long as language isn't already set.
                    if (data["stories"]) {
                        for (var i = 0; i < data["stories"].length; i++) {
                            if (!data["stories"][i]["language"] || data["stories"][i]["language"] === "") {
                                data["stories"][i]["language"] = that.primaryLanguage;
                            }
                        }
                    }

                    var json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, "\t")));

                    page.cmd("fileWrite", [data_inner_path, btoa(json_raw)], (res) => {
                        if (res === "ok") {
                            // Get user info again
                            page.cmd("siteSign", { "inner_path": content_inner_path }, () => {
                                // that.$emit('get-user-info');
                                that.$emit("setUserLanguages", languages);
                                page.cmd("sitePublish", { "inner_path": content_inner_path, "sign": false });
                                Router.navigate("help");
                            });
                        } else {
                            page.cmd("wrapperNotification", ["error", "File write error: #{res}"]);
                        }
                    });
                }

                that.close();
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
            return this.secondaryLanguages.includes(language.code) || language.code === this.primaryLanguage;
        }
    },
    template: `
        <div class="modal" v-bind:class="{ 'is-active': value }">
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Set Languages</p>
                    <button class="delete" v-on:click.prevent="close()" v-if="shouldShowClose"></button>
                </header>
                <section class="modal-card-body">
                    <p>
                        It appears you have no languages set. Please select your primary and secondary languages, which will be used to filter the
                        stories as well as add language options while creating and editing stories (defaulting to your primary language).
                        All of your current stories will be set to your primary language automatically. If you have a story in a different language,
                        please edit the story to change its language.
                    </p>
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
                    <button class="button" v-on:click.prevent="finish()" style="margin-top: 10px;">Finish</button>
                </section>
            </div>
        </div>
        `
});
