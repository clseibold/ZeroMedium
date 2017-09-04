var Router = require('../router.js');
var moment = require('moment');

var MeStories = {
	props: ["userInfo"],
	data: function() {
		return {
			stories: null
		}
	},
	beforeMount: function() {
		this.$emit('navbar-shadow-off');
		if (this.userInfo) {
			this.getUserProfileInfo(this.userInfo);
		}
	},
	mounted: function() {
		this.$parent.$on('setUserInfo', this.getUserProfileInfo);
	},
	methods: {
		goto: function(to) {
			Router.navigate(to);
		},
		getUserProfileInfo: function(userInfo) {
			var that = this;
			page.getUserProfileInfo(userInfo.auth_address, true, (profileInfo) => {
				that.stories = profileInfo.stories;
			});
		},
		datePosted: function(date) {
			return moment(date).fromNow();
		},
		getStoryUrl(story) {
			return this.userInfo.auth_address + '/' + story.slug;
		}
	},
	template: `
		<div>
			<div class="hero" style="border-top: 1px solid rgba(0,0,0,.05);">
	            <div class="container">
	                <div class="hero-body">
	                    <span class="title">Your Stories</span><br>
	                    <a href="./?/newstory" v-on:click.prevent="goto('newstory')" class="button is-success is-small is-outlined" style="margin-top: 10px;">Write a story</a>
	                    <a v-if="userInfo" :href="'./?/' + userInfo.auth_address" v-on:click.prevent="goto(userInfo.auth_address)" class="button is-info is-small is-outlined" style="margin-top: 10px;">Profile</a>
	                </div>
	            </div>
	        </div>
	        <div class="navbar is-transparent has-shadow" style="border-top: 1px solid rgba(0,0,0,.05);">
				<div class="container">
				    <div class="navbar-brand" style="overflow-x: hidden;">
				        <a class="navbar-item is-active is-tab">Drafts</a>
				        <a class="navbar-item is-tab">Public</a>
				        <a class="navbar-item is-tab">Unlisted</a>
				    </div>
				</div>
			</div>
			<section class="section" v-if="stories">
				<div class="container">
					<div class="box" v-for="story in stories" :key="story.story_id">
						<p class="title is-5"><a :href="'./?/' + getStoryUrl(story)" v-on:click.prevent="goto(getStoryUrl(story))">{{ story.title }}</p>
						<p>{{ story.description }}</p>
						<p><em>You posted {{ datePosted(story.date_added) }}</em></p>
					</div>
				</div>
			</section>
		</div>
		`
}

module.exports = MeStories;
