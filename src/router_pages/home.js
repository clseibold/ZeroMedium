var Vue = require("vue/dist/vue.min.js");
var Router = require("../router.js");

var Home = {
    mounted: function() {
        this.$emit("navbar-shadow-off");
        var that = this;
        page.getTopics((topics) => {
            that.topics = topics;
        });
    },
    methods: {
        showSigninModal: function() {
            //this.signin_modal_visible = !this.signin_modal_visible;
            this.$emit('show-signin-modal');
        },
        topicClick: function(slug) {
            Router.navigate('topic/' + slug);
        }
    },
    data: function() {
        return {
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
                        <a class="navbar-item">Staff Picks</a>
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
                <div class="container">
                    <p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Today's Top Stories</p>
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
            <div class="container">
                <div class="hero-body">
                    <p class="title">ZeroMedium</p>
                    <p>Blogs on many different topics, from many different people.</p>
                    <br>
                    <a class="button is-dark is-small" v-on:click.prevent="showSigninModal()">Get Started</a>
                    <a class="button is-small">Learn More</a>
                </div>
            </div>
        </div>
        `
});

module.exports = Home;