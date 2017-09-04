var Vue = require("vue/dist/vue.min.js");
var Router = require("../router.js");
var { sanitizeStringForUrl } = require("../util.js");
var moment = require("moment");

var Profile = {
	data: function() {
		return {
			profileInfo: {}
		}
	},
	beforeMount: function() {
		this.$emit('navbar-shadow-off');
		var that = this;
		page.getUserProfileInfo(Router.currentParams["userauthaddress"], true, (profileInfo) => {
			that.profileInfo = profileInfo;
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
		}
	},
	template: `
		<div>
			<profile-hero :name="profileInfo.name" :about="profileInfo.about" :cert-user-id="profileInfo.cert_user_id"></profile-hero>
			<profile-navbar></profile-navbar>
			<section class="section">
				<div class="container" v-if="profileInfo">
					<p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Latest</p>
					<div class="box" v-for="story in profileInfo.stories" :key="story.story_id">
						<p class="title is-5"><a :href="'./?/' + getStoryUrl(story)" v-on:click.prevent="goto(getStoryUrl(story))">{{ story.title }}</a></p>
						<p>{{ story.description }}</p>
						<p><em>Posted {{ datePosted(story.date_added) }}</em></p>
					</div>
				</div>
			</section>
		</div>
		`
}

Vue.component('profile-hero', {
	props: ['name', 'about', 'certUserId'],
    methods: {
    },
    template: `
        <div class="hero" style="border-top: 1px solid rgba(0,0,0,.05);">
            <div class="container">
                <div class="hero-body">
                    <span class="title">{{ name }}</span><br>
                    <span class="subtitle">{{ certUserId }}</span><br>
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
			        <a class="navbar-item is-tab">Latest</a>
			        <!--<a class="navbar-item is-tab">Highlights</a>--> <!-- TODO: FUTURE -->
			        <a class="navbar-item is-tab">Responses</a>
			    </div>
			</div>
		</div>
		`
});

module.exports = Profile;