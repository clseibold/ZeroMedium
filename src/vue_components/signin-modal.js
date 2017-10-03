var Vue = require("vue/dist/vue.min.js");

Vue.component('signin-modal', {
    props: ['value', 'userInfo'],
    beforeMount: function() {
        if (page.site_info.cert_user_id != null) {
            this.close();
        }
        this.currentSlide = 0;
        this.slideTitle = "";
        this.name = "";
        this.about = "";
        /*if (page.site_info.cert_user_id != null && !this.userInfo.keyvalue.name) {
            this.currentSlide = 1;
            this.slideTitle += "Setup Profile";
        }*/
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
            topics: [],
            interests: [],
            existingUsers: []
        }
    },
    methods: {
        close: function() {
            this.$emit('input', false);
        },
        signin: function() {
            var previousId = page.site_info.cert_user_id;
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
        newUserData: function(name = null, about = null, interests = null) {
            var interestsString = "";
            for (i = 0; i < interests.length; i++) {
                interestsString += interests[i];
                if (i < interests.length - 1) {
                    interestsString += ",";
                }
            }

            return {
                name: name,
                about: about,
                interests: interestsString
            }
        },
        createId: function(from) {
            if (from == 'zeroid') {
                page.cmd("wrapperOpenWindow", ["../zeroid.bit", "_blank"]);
            }
            if (from == 'kaffieid') {
                page.cmd("wrapperOpenWindow", ["../id.kaffie.bit", "_blank"]);
            }
            if (from == 'cryptoid') {
                page.cmd("wrapperOpenWindow", ["../cryptoid.bit", "_blank"]);
            }
        },
        usersFileExists: function(f) {
            var data_inner_path = "data/users/" + page.site_info.auth_address + "/data.json";
            var content_inner_path = "data/users/" + page.site_info.auth_address + "/content.json";
            
            page.cmd("fileGet", {"inner_path": data_inner_path, "required": false}, (data) => {
                if (data)
                    f(true, null, null, null);
                else f(false, data, data_inner_path, content_inner_path);
            });
        },
        showNext: function() {
            if (this.currentSlide == 1) {
                // Username blacklist
                var name = this.name.toLowerCase();
                if (name == "admin" || name == "Admin" || name == "account" || name == "blog"
                    || name == "api" || name == "cache" || name == "changelog" || name == "enterprise"
                    || name == "gist" || name == "help" || name == "jobs" || name == "lists" || name == "login"
                    || name == "logout" || name == "mine" || name == "news" || name == "plans"
                    || name == "popular" || name == "projects" || name == "security" || name == "shop" || name == "translations"
                    || name == "signup" || name == "register" || name == "status" || name == "wiki" || name == "stories" || name == "medium"
                    || name == "organizations" || name == "better" || name == "compare" || name == "hosting" || name == "tour" || name == "styleguide") {
                    page.cmd("wrapperNotification", ["error", "You aren't allowed to use this username!"]);
                    return;
                }
                for (var i = 0; i < this.existingUsers.length; i++) {
                    if (!this.existingUsers[i].value || typeof this.existingUsers[i].value != "string") continue;
                    var existingName = this.existingUsers[i].value.toLowerCase().trim();
                    if (existingName == name) {
                        page.cmd("wrapperNotification", ["error", "Username already taken!"]);
                        return;
                    }
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
                    data = that.newUserData(that.name.trim(), that.about.trim(), that.interests);

                    var json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, '\t')));

                    page.cmd("fileWrite", [data_inner_path, btoa(json_raw)], (res) => {
                        if (res == "ok") {
                            // Get user info again
                            page.cmd("siteSign", {"inner_path": content_inner_path}, (res) => {
                                page.cmd("wrapperNotification", ["error", "Please Refresh the page after publish!"]);
                                page.cmd("sitePublish", {"inner_path": content_inner_path, "sign": false}, () => {
                                    that.$emit('get-user-info'); // TODO: Doesn't seem to be working
                                });
                            });
                        } else {
                            page.cmd("wrapperNotification", ["error", "File write error: #{res}"]);
                        }
                    });
                    that.close();
                    // TODO: Navigate to a certain page after signup?
                }
            });
        },
        toggleInterest(name) {
            for (var i = 0; i < this.interests.length; i++) {
                if (this.interests[i] == name) {
                    this.interests.splice(i, 1);
                    return;
                }
            }
            this.interests.push(name);
        },
        isChecked(name) {
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
                    <button class="delete" v-on:click.prevent="close()"></button>
                </header>
                <section class="modal-card-body" v-if="currentSlide == 0">
                    <a class="button is-info" style="width: 100%; padding-top: 25px; padding-bottom: 25px; margin-top: 5px;" v-on:click.prevent="signin()">Sign in</a>
                    <a class="button" style="width: 100%; padding-top: 25px; padding-bottom: 25px; margin-top: 5px;" v-on:click.prevent="createId('zeroid')">Register with ZeroId</a>
                    <a class="button" style="width: 100%; padding-top: 25px; padding-bottom: 25px; margin-top: 5px;" v-on:click.prevent="createId('kaffieid')">Register with KaffieId</a>
                    <a class="button" style="width: 100%; padding-top: 25px; padding-bottom: 25px; margin-top: 5px;" v-on:click.prevent="createId('cryptoid')">Register with CryptoId</a>
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

                    <button class="button" v-on:click.prevent="showNext()">Next</button>
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