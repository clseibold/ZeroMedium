var Router = require('../router.js');
var moment = require('moment');
var { cache_add, cache_replace, cache_remove, cache_get, cache_getOrAdd, cache_exists, cache_clear } = require("../cache.js");

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
			page.getUserProfileInfo(userInfo.auth_address, true, false, (profileInfo) => { // TODO: responses?
				that.stories = profileInfo.stories;
			});
		},
		getStoryEditUrl: function(story) {
			return 'me/stories/' + story.slug + '/edit';
		},
		deleteStory: function(story) {
			var that = this;
			page.deleteStory(story.story_id, () => {
				cache_clear();
				that.getUserProfileInfo(that.userInfo);
			});
		}
	},
	template: `
		<div>
			<div class="hero" style="border-top: 1px solid rgba(0,0,0,.05);">
	            <div class="container">
	                <div class="hero-body">
	                    <span class="title">Your Stories</span><br>
	                    <a href="./?/me/newstory" v-on:click.prevent="goto('me/newstory')" class="button is-success is-small is-outlined" style="margin-top: 10px;">Write a story</a>
	                    <a v-if="userInfo" :href="'./?/' + userInfo.auth_address" v-on:click.prevent="goto(userInfo.auth_address)" class="button is-info is-small is-outlined" style="margin-top: 10px;">Profile</a>
	                </div>
	            </div>
	        </div>
	        <div class="navbar is-transparent has-shadow" style="border-top: 1px solid rgba(0,0,0,.05);">
				<div class="container">
				    <div class="navbar-brand" style="overflow-x: hidden;">
				        <a class="navbar-item is-active is-tab">Public</a>
				        <!--<a class="navbar-item is-tab">Drafts</a>-->
				        <a class="navbar-item is-tab" onclick="page.unimplemented();">Unlisted</a>
				    </div>
				</div>
			</div>
			<section class="section" v-if="stories">
				<div class="columns is-centered">
					<div class="column is-three-quarters-tablet is-three-quarters-desktop">
						<story v-for="story in stories" :key="story.story_id" :story="story" :show-name="false" :show-options="true" :editUrl="getStoryEditUrl(story)" v-on:delete="deleteStory(story)"></story>
					</div>
				</div>
			</section>
		</div>
		`
}

module.exports = MeStories;
