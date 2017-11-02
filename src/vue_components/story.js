var Vue = require("vue/dist/vue.min.js");
var Router = require("../router.js");
var moment = require('moment');

Vue.component('story', {
	props: ['story', 'showName', 'showOptions', 'editUrl'],
	methods: {
		goto: function(to) {
			Router.navigate(to);
		},
		deleteStory: function() {
			this.$emit('delete');
		}
	},
	computed: {
		datePosted: function() {
			return moment(this.story.date_added).fromNow();
		},
		getStoryUrl: function() {
			return this.getStoryAuthAddress + '/' + this.story.slug;
		},
		getStoryAuthAddress: function() {
			return this.story.directory.replace(/users\//, '').replace(/\//g, '');
		}
	},
	template: `
		<div class="box">
			<p class="title is-5" style="margin-bottom: 0;"><a :href="'./?/' + getStoryUrl" v-on:click.prevent="goto(getStoryUrl)">{{ story.title }}</a></p>
			<small style="margin-bottom: 10px;" v-if="showName">By <a :href="'./?/' + getStoryAuthAddress" v-on:click.prevent="goto(getStoryAuthAddress)">{{ story.value }}</a></small>
			<p style="margin-bottom: 5px;">{{ story.description }}</p>
			<small>
				Published {{ datePosted }}
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