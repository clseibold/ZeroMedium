var Vue = require("vue/dist/vue.min.js");
var Router = require("../router.js");
// var moment = require("moment");
var { cache_add, cache_replace, cache_remove, cache_get, cache_getOrAdd, cache_exists, cache_clear } = require("../cache.js");

var Home = {
    props: ["userInfo"],
    beforeMount: function() {
        this.$emit("navbar-shadow-off");
        var that = this;

        if (cache_exists("home_topics")) {
            this.topics = cache_get("home_topics");
        } else {
            page.getTopics((topics) => {
                that.topics = topics;
                cache_add("home_topics", topics);
            });
        }
        this.getStories();
    },
    computed: {
        isLoggedIn: function() {
            if (!this.userInfo || this.userInfo == null) {
                return false;
            }
            return this.userInfo.cert_user_id != null;
        }
    },
    methods: {
        getStories: function() {
            var that = this;

            that.recentStories = [];
            that.topStories = [];

            var now = Date.now();

            if (cache_exists("home_recentStories") && cache_exists("home_topStories")) {
                that.recentStories = cache_get("home_recentStories");
                that.topStories = cache_get("home_topStories");
            }
            page.getAllStories(true, (story) => {
                var responses = story.responses;
                var claps = story.claps;

                responses = responses.filter((response) => {
                    return (now - response.date_added) < 8.645e+7;
                });
                claps = claps.filter((clap) => {
                    return ((now - clap.date_added) < 8.645e+7) && clap.number == 1;
                });

                story["responses"] = responses;
                story["claps"] = claps;

                // return (now - story.date_added) < 8.64e+7;
                return true;
            }, (stories) => {
                // Limit to 5 stories for putting into recent stories
                var newRecentStories = [];
                
                for (i = 0; newRecentStories.length < 5 && i < stories.length; i++) {
                    newRecentStories.push(stories[i]);
                }
                that.recentStories = newRecentStories;
                cache_add("home_recentStories", that.recentStories);

                // Sort stories by how many responses and claps they have
                stories.sort((a, b) => {
                    return (b.responses.length + b.claps.length) - (a.responses.length + a.claps.length);
                });

                var newTopStories = [];

                for (i = 0; newTopStories.length < 5 && i < stories.length; i++) {
                    newTopStories.push(stories[i]);
                }
                that.topStories = newTopStories;
                cache_add("home_topStories", that.topStories);
            });
        },
        showSigninModal: function() {
            // this.signin_modal_visible = !this.signin_modal_visible;
            this.$emit('show-signin-modal');
        },
        topicClick: function(slug) {
            Router.navigate('topic/' + slug);
        },
        goto: function(to) {
            Router.navigate(to);
        }
    },
    data: function() {
        return {
            topStories: [],
            recentStories: [],
            topics: []
        }
    },
    template: `
        <div>
            <div class="navbar is-transparent has-shadow" style="border-top: 1px solid rgba(0,0,0,.05);">
                <div class="container" style="overflow-x: hidden;">
                    <div class="navbar-brand" style="overflow-x: hidden;">
                        <!-- Categories -->
                        <!--<a class="navbar-item is-active">Home</a>-->
                        <!--<a class="navbar-item">Popular</a>-->
                        <!--<a class="navbar-item">Staff Picks</a>-->
                        <a class="navbar-item" v-on:click.prevent="goto('topics')">All Topics</a>
                        <a class="navbar-item" v-for="topic in topics" :key="topic.topic_id" :href="'./?/topic/' + topic.slug" v-on:click.prevent="topicClick(topic.slug)">{{topic.name}}</a>
                    </div>
                </div>
            </div>
            <home-hero v-on:show-signin-modal="showSigninModal()" v-if="!isLoggedIn"></home-hero>
            <section class="section">
                <div class="columns is-centered">
                    <div class="column is-three-quarters-tablet is-three-quarters-desktop">
                        <div style="margin-bottom: 1.5em;">
                            <strong>Current Version:</strong> <a href="?/12gAes6NzDS9E2q6Q1UXrpUdbPS6nvuBPu/version-info" v-on:click.prevent="goto('12gAes6NzDS9E2q6Q1UXrpUdbPS6nvuBPu/version-info')">{{ version }} beta</a>
                            <br>
                            <small>To report a bug, click on the 'Report Bug' link in the navbar. You will be redirected to the Git Center Repo. Create an issue with the tags: "{{ version }} beta" and "bug".</small>
                        </div>
                        <home-user-interests v-if="userInfo && isLoggedIn && userInfo.keyvalue.interests" :user-info="userInfo"></home-user-interests>
                        <p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Today's Top Stories</p>
                        <div v-if="topStories.length > 0 && recentStories.length > 0">
                            <story v-for="story in topStories" :story="story" :show-name="true"></story>

                            <p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Recent Stories</p>
                            <story v-for="story in recentStories" :story="story" :show-name="true"></story>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        `
};

Vue.component("home-hero", {
    methods: {
        showSigninModal: function() {
            this.$emit("show-signin-modal");
        }
    },
    template: `
        <div class="hero">
            <div class="columns is-centered">
                <div class="column is-three-quarters-tablet is-three-quarters-desktop">
                    <div class="hero-body">
                        <p class="title">ZeroMedium</p>
                        <p>Blogs on many different topics, from many different people.</p>
                        <br>
                        <a class="button is-dark is-small" v-on:click.prevent="showSigninModal()">Get Started</a>
                        <a class="button is-small" href="bitcoin:1CVmbCKWtbskK2GAZLM6gnMuiL6Je25Yds?message=Donation to ZeroMedium">Donate via Bitcoin</a>
                    </div>
                </div>
            </div>
        </div>
        `
});

Vue.component("home-user-interests", {
    props: ["userInfo"],
    computed: {
        getInterests: function() {
            return this.userInfo.keyvalue.interests.split(",");
        }
    },
    methods: {
        goto: function(to) {
            Router.navigate(to);
        },
        getInterestSlug: function(name) {
            return name.toLowerCase().replace(/ /, "-");
        }
    },
    template: `
        <div style="margin-bottom: .2rem;">
            <p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Your Interests</p>
            <div class="box" v-for="interest in getInterests" style="display: inline-block; margin-right: 1.3rem; margin-bottom: 1.3rem; padding-top: 1.1rem; padding-bottom: 1.1rem; cursor: pointer;" v-on:click.prevent="goto('topic/' + getInterestSlug(interest))">
                <em>{{ interest }}</em>
            </div>
        </div>
        `
});

module.exports = Home;
