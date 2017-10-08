var Vue = require("vue/dist/vue.min.js");
var Router = require("../router.js");
var moment = require('moment');
var { sanitizeStringForUrl, sanitizeStringForUrl_SQL, html_substr } = require('../util.js');

Vue.component('response', {
	props: ['response', 'showName', 'showReference', 'shorten'],
	data: function() {
		return {
			story: null
		}
	},
	mounted: function() {
		if (this.showReference) {
			this.getResponseStory();
		}
	},
	methods: {
		goto: function(to) {
			Router.navigate(to);
		},
		getResponseStory: function() {
			var that = this;
			page.getStoryMinimal(this.response.reference_auth_address, this.response.reference_id, (story) => {
				that.story = story;
			});
		},
		datePosted: function(date) {
			return moment(date).fromNow();
		},
		getAuthAddress: function() {
			return this.response.directory.replace(/users\//, '').replace(/\//, '');
		},
		getStoryAuthAddress: function(story) {
			return story.directory.replace(/users\//, '').replace(/\//, '');
		},
		getShortened: function(body) {
			console.log(body);
			console.log(html_substr(body, 300));
			return html_substr(body, 300);
		}
	},
	template: `
		<div class="box" style="margin-bottom: 20px;">
			<slot></slot>
			<p v-if="showName" style="margin-bottom: 5px;"><strong><a :href="'./?/' + getAuthAddress(response)" v-on:click.prevent="goto(getAuthAddress(response))">{{ response.value }}</a></strong></p>
			<div style="margin-left: 20px; margin-bottom: 20px;" v-if="showReference && story">
				Responded to <a :href="'./?/' + getStoryAuthAddress(story) + '/' + story.slug" v-on:click.prevent="goto(getStoryAuthAddress(story)  + '/' + story.slug)">{{ story.title }}</a><br>
				<small>{{ story.value }}</small>
			</div>
			<div class="content" style="margin-bottom: 5px;" v-html="!this.shorten ? page.sanitizeHtml(this.response.body) : page.sanitizeHtml(getShortened(this.response.body))"></div>
			<small>Published {{ datePosted(response.date_added) }}</small>
		</div>
		`
});