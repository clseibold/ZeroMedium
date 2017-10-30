var Vue = require("vue/dist/vue.min.js");
var Router = require("../router.js");
var moment = require('moment');

Vue.component('story', {
	props: ['story', 'showName', 'showOptions', 'editUrl'],
	methods: {
		datePosted: function(date) {
			return moment(date).fromNow();
		},
		goto: function(to) {
			Router.navigate(to);
		},
		getStoryUrl: function(story) {
			return this.getStoryAuthAddress(story) + '/' + story.slug;
		},
		getStoryAuthAddress: function(story) {
			return story.directory.replace(/users\//, '').replace(/\//g, '');
		},
		deleteStory: function() {
			this.$emit('delete');
		}
	},
	template: `
		<div class="box">
			<p class="title is-5" style="margin-bottom: 0;"><a :href="'./?/' + getStoryUrl(story)" v-on:click.prevent="goto(getStoryUrl(story))">{{ story.title }}</a></p>
			<small style="margin-bottom: 10px;" v-if="showName">By <a :href="'./?/' + getStoryAuthAddress(story)" v-on:click.prevent="goto(getStoryAuthAddress(story))">{{ story.value }}</a></small>
			<p style="margin-bottom: 5px;">{{ story.description }}</p>
			<small>
				Published {{ datePosted(story.date_added) }}
				<div class="dropdown is-hoverable" v-if="showOptions">
					<div class="dropdown-trigger">
						<a style="margin-left: 5px;">
							<span class="icon is-small">
					        	<i class="fa fa-angle-down" aria-hidden="true"></i>
					      	</span>
						</a>
					</div>
					<div class="dropdown-menu" id="dropdown-menu" role="menu">
					    <div class="dropdown-content">
					    	<a class="dropdown-item" v-if="editUrl" :href="editUrl" v-on:click.prevent="goto(editUrl)">Edit Story</a>
					    	<a class="dropdown-item" v-on:click.prevent="deleteStory()">Delete Story</a>
					    </div>
					</div>
				</div>
			</small>
		</div>
		`
});