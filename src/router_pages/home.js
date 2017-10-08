var Vue = require("vue/dist/vue.min.js");
var Router = require("../router.js");
var moment = require('moment');

var Home = {
    beforeMount: function() {
        this.$emit("navbar-shadow-off");
        var that = this;
        page.getTopics((topics) => {
            that.topics = topics;
        });
        this.getStories();
        // TODO: Do a sort based on number of likes/claps and maybe responses (only responses made during that day).
    },
    methods: {
        getStories: function() {
            var that = this;
            that.recentStories = [];
            that.topStories = [];
            var now = Date.now();
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

                //return (now - story.date_added) < 8.64e+7;
                return true;
            }, (stories) => {
                // Limit to 5 stories for putting into recent stories
                for (i = 0; that.recentStories.length < 5 && i < stories.length; i++) {
                    that.recentStories.push(stories[i]);
                }

                // Sort stories by how many responses and claps they have
                stories.sort((a, b) => {
                    return (b.responses.length + b.claps.length) - (a.responses.length + a.claps.length);
                });

                for (i = 0; that.topStories.length < 5 && i < stories.length; i++) {
                    that.topStories.push(stories[i]);
                }

            });
        },
        showSigninModal: function() {
            //this.signin_modal_visible = !this.signin_modal_visible;
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
                <div class="container">
                    <div class="navbar-brand" style="overflow-x: hidden;">
                        <!-- Categories -->
                        <a class="navbar-item is-active">Home</a>
                        <a class="navbar-item">Popular</a>
                        <!--<a class="navbar-item">Staff Picks</a>-->
                        <a class="navbar-item" v-for="topic in topics" :key="topic.topic_id" :href="'./?/topic/' + topic.slug" v-on:click.prevent="topicClick(topic.slug)">{{topic.name}}</a>
                        <!--<a class="navbar-item">Technology</a>
                        <a class="navbar-item">Politics</a>
                        <a class="navbar-item">Creativity</a>
                        <a class="navbar-item">Programming</a>
                        <a class="navbar-item">Culture</a>-->
                    </div>
                </div>
            </div>
            <home-hero v-on:show-signin-modal="showSigninModal()"></home-hero>
            <section class="section">
                <div class="columns is-centered">
                    <div class="column is-three-quarters-tablet is-three-quarters-desktop">
                        <p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Today's Top Stories</p>
                        <story v-for="story in topStories" :key="story.story_id" :story="story" :show-name="true"></story>

                        <p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Recent Stories</p>
                        <story v-for="story in recentStories" :key="story.story_id" :story="story" :show-name="true"></story>
                    </div>
                </div>
            </section>
        </div>
        `
};

Vue.component('home-hero', {
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

module.exports = Home;