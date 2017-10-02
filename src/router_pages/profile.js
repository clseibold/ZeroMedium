var Vue = require("vue/dist/vue.min.js");
var Router = require("../router.js");
var { sanitizeStringForUrl } = require("../util.js");
var moment = require("moment");

var Profile = {
	data: function() {
		return {
			profileInfo: {},
			claps: []
		}
	},
	beforeMount: function() {
		this.$emit('navbar-shadow-off');
		var that = this;
		page.getUserProfileInfo(Router.currentParams["userauthaddress"], true, true, (profileInfo) => {
			that.profileInfo = profileInfo;
			page.getUserClaps(Router.currentParams["userauthaddress"], (claps) => {
				that.claps = claps;
				console.log(claps);
			});
		});
	},
	methods: {
		datePosted: function(date) {
			return moment(date).fromNow();
		},
		goto: function(to) {
			Router.navigate(to);
		},
		getStoryUrl(story) {
			return this.profileInfo.auth_address + '/' + story.slug;
		},
		getClapStoryUrl(story) {
			return this.getClapStoryAuthAddress(story) + '/' + story.slug;
		},
		getClapStoryAuthAddress(story) {
			console.log(story);
			return story.directory.replace(/users\//, '').replace(/\//g, '');
		},
	},
	template: `
		<div>
			<profile-hero :name="profileInfo.name" :about="profileInfo.about" :cert-user-id="profileInfo.cert_user_id" :auth-address="profileInfo.auth_address"></profile-hero>
			<profile-navbar></profile-navbar>
			<section class="section">
				<div class="columns is-centered" v-if="profileInfo">
					<div class="column is-three-quarters-tablet is-three-quarters-desktop">
						<p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Latest</p>
						<div class="box" v-for="story in profileInfo.stories" :key="story.story_id">
							<p class="title is-5" style="margin-bottom: 5px;"><a :href="'./?/' + getStoryUrl(story)" v-on:click.prevent="goto(getStoryUrl(story))">{{ story.title }}</a></p>
							<p style="margin-bottom: 5px;">{{ story.description }}</p>
							<small>Published {{ datePosted(story.date_added) }}</small>
						</div>
						<p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Responses</p>
						<response v-for="response in profileInfo.responses" :key="response.response_id" v-bind:response="response" v-bind:show-name="false" v-bind:show-reference="true">
							<p style="margin-bottom: 20px;"><strong>{{ profileInfo.name }}</strong></p>
						</response>
						<p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Claps</p>
						<div class="box" v-for="clap in claps" :key="clap.story.story_id" v-if="claps">
							<p class="title is-5" style="margin-bottom: 0;"><a :href="'./?/' + getClapStoryUrl(clap.story)" v-on:click.prevent="goto(getClapStoryUrl(clap.story))">{{ clap.story.title }}</a></p>
							<small style="margin-bottom: 10px;">By <a :href="'./?/' + getClapStoryAuthAddress(clap.story)" v-on:click.prevent="goto(getClapStoryAuthAddress(clap.story))">{{ clap.story.value }}</a></small>
							<p style="margin-bottom: 5px;">{{ clap.story.description }}</p>
							<small>Published {{ datePosted(clap.story.date_added) }}</small>
						</div>
					</div>
				</div>
			</section>
		</div>
		`
}

Vue.component('profile-hero', {
	props: ['name', 'about', 'certUserId', 'authAddress'],
    methods: {
    },
    template: `
        <div class="hero" style="border-top: 1px solid rgba(0,0,0,.05);">
            <div class="container">
                <div class="hero-body">
                    <span class="title">{{ name }}</span><br>
                    <span class="subtitle">{{ certUserId }}</span><br>
                    <p v-if="authAddress" style="margin-top: 5px;">Donate: {{ authAddress }}</p>
                    <p style="margin-top: 5px; margin-bottom: 15px;">{{ about }}</p>
                    <a class="button is-success is-small is-outlined">Follow</a>
                </div>
            </div>
        </div>
        `
});

Vue.component('profile-navbar', {
	template: `
		<div class="navbar is-transparent has-shadow" style="border-top: 1px solid rgba(0,0,0,.05);">
			<div class="container">
			    <div class="navbar-brand" style="overflow-x: hidden;">
			        <a class="navbar-item is-active is-tab">Profile</a>
			        <a class="navbar-item is-tab" onclick="page.unimplemented();">Latest</a>
			        <!--<a class="navbar-item is-tab">Highlights</a>--> <!-- TODO: FUTURE -->
			        <a class="navbar-item is-tab" onclick="page.unimplemented();">Responses</a>
			    </div>
			</div>
		</div>
		`
});

module.exports = Profile;