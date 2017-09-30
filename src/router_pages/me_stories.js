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
		getStoryUrl: function(story) {
			return this.userInfo.auth_address + '/' + story.slug;
		},
		getStoryEditUrl: function(story) {
			return 'me/stories/' + story.slug + '/edit';
		},
		deleteStory: function(story) {
			page.unimplemented();
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
						<div class="box" v-for="story in stories" :key="story.story_id">
							<p class="title is-5" style="margin-bottom: 5px;"><a :href="'./?/' + getStoryUrl(story)" v-on:click.prevent="goto(getStoryUrl(story))">{{ story.title }}</p>
							<p style="margin-bottom: 5px;">{{ story.description }}</p>
							<small>
								Published {{ datePosted(story.date_added) }}
								<div class="dropdown is-hoverable">
									<div class="dropdown-trigger">
										<a style="margin-left: 5px;">
											<span class="icon is-small">
									        	<i class="fa fa-angle-down" aria-hidden="true"></i>
									      	</span>
										</a>
									</div>
									<div class="dropdown-menu" id="dropdown-menu" role="menu">
									    <div class="dropdown-content">
									    	<a class="dropdown-item" :href="getStoryEditUrl(story)" v-on:click.prevent="goto(getStoryEditUrl(story))">Edit Story</a>
									    	<a class="dropdown-item" v-on:click.prevent="deleteStory(story)">Delete Story</a>
									    </div>
									</div>
								</div>
							</small>
						</div>
					</div>
				</div>
			</section>
		</div>
		`
}

module.exports = MeStories;
