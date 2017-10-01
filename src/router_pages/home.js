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
        page.getAllStories(function(story) {
            var now = Date.now();
            return (now - story.date_added) < 8.64e+7;
        }, (stories) => {
            // Limit to 5 stories - NOTE/TODO: Performance can be improved by putting the limit into the dbquery instead!
            for (i = 0; i < 5 && i < stories.length; i++) {
                that.stories.push(stories[i]);
            }
            //that.stories = stories;
        });
        // TODO: Do a sort based on number of likes/claps and maybe responses (only responses made during that day).
    },
    methods: {
        showSigninModal: function() {
            //this.signin_modal_visible = !this.signin_modal_visible;
            this.$emit('show-signin-modal');
        },
        topicClick: function(slug) {
            Router.navigate('topic/' + slug);
        },
        datePosted: function(date) {
            return moment(date).fromNow();
        },
        goto: function(to) {
            Router.navigate(to);
        },
        getStoryUrl(story) {
            return this.getStoryAuthAddress(story) + '/' + story.slug;
        },
        getStoryAuthAddress(story) {
            return story.directory.replace(/users\//, '').replace(/\//g, '');
        }
    },
    data: function() {
        return {
            stories: [],
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
                        <p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Today's Stories</p>
                        <div class="box" v-for="story in stories" :key="story.story_id">
                            <p class="title is-5" style="margin-bottom: 0;"><a :href="'./?/' + getStoryUrl(story)" v-on:click.prevent="goto(getStoryUrl(story))">{{ story.title }}</a></p>
                            <small style="margin-bottom: 10px;">By <a :href="'./?/' + getStoryAuthAddress(story)" v-on:click.prevent="goto(getStoryAuthAddress(story))">{{ story.value }}</a></small>
                            <p style="margin-bottom: 5px;">{{ story.description }}</p>
                            <small>Published {{ datePosted(story.date_added) }}</small>
                        </div>
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
                        <a class="button is-small">Learn More</a>
                    </div>
                </div>
            </div>
        </div>
        `
});

module.exports = Home;