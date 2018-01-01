var Vue = require("vue/dist/vue.min.js");
var Router = require("../router.js");
var moment = require('moment');
var { sanitizeStringForUrl, sanitizeStringForUrl_SQL, html_substr } = require('../util.js');

Vue.component("response", {
	props: ["response", "showName", "showReference", "shorten"],
	data: function() {
		return {
			story: null,
			referenceResponse: null,
			subResponses: null
		}
	},
	beforeMount: function() {
		this.getResponses();
	},
	mounted: function() {
		if (this.showReference) {
			if (this.response.reference_type === "s") {
				this.getResponseStory();
			} else if (this.response.reference_type === "r") {
				this.getResponseResponse();
			}
		}
	},
	methods: {
		goto: function(to) {
			Router.navigate(to);
		},
		getResponseStory: function() {
			var that = this;
			/*page.getStoryMinimal(this.response.reference_auth_address, this.response.reference_id, (story) => {
				that.story = story;
			});*/
			page.getStoryMinimal(this.response.reference_auth_address, this.response.reference_id)
				.then((stories) => {
					that.story = stories[0];
				});
		},
		getResponseResponse: function() {
			var that = this;

			page.getResponse(this.response.reference_auth_address, this.response.reference_id, (response) => {
				that.referenceResponse = response;
				// that.referenceAuthor = response.value;
			});
		},
		getResponses: function() {
			// TODO: Performance (only get number?)
			//  show only some responses (perhaps from author of story and/or original/root response's author)
			var that = this;

			page.getResponses(this.getAuthAddress, this.response.response_id, "r", (responses) => {
				// console.log(responses);
				that.subResponses = responses;
			});
		},
		datePosted: function(date) {
			return moment(date).fromNow();
		},
		getStoryAuthAddress: function(story) {
			return story.directory.replace(/users\//, "").replace(/\//, "");
		},
		getShortened: function(body) {
			// console.log(body);
			// console.log(html_substr(body, 300));
			return html_substr(body, 300);
		},
		fullscreen: function() { // TODO: Not used right now because of a router bug.
			this.goto(this.getAuthAddress + "/response/" + this.response.response_id);
		},
		respond: function() {
			this.goto(this.getAuthAddress + "/response/" + this.response.response_id + "/response");
		}
	},
	computed: {
		getAuthAddress: function() {
			return this.response.directory.replace(/users\//, "").replace(/\//, "");
		},
		getReferenceResponseAuthAddress: function() {
			return this.referenceResponse.directory.replace(/users\//, "").replace(/\//g, "");
		}
	},
	template: `
		<div class="box" style="margin-bottom: 20px;">
			<slot></slot>
			<p v-if="showName" style="margin-bottom: 5px;"><strong><a :href="'./?/' + getAuthAddress" v-on:click.prevent="goto(getAuthAddress)">{{ response.value }}</a></strong></p>
			<div style="margin-left: 20px; margin-bottom: 20px;" v-if="showReference && story">
				Responded to <a :href="'./?/' + getStoryAuthAddress(story) + '/' + story.slug" v-on:click.prevent="goto(getStoryAuthAddress(story)  + '/' + story.slug)">{{ story.title.trim() !== "" ? story.title : "[NO TITLE]" }}</a><br>
				<small>{{ story.value }}</small>
			</div>
			<div style="margin-left: 20px; margin-bottom: 20px;" v-if="showReference && referenceResponse">
				Responded to <a :href="'./?/' + getReferenceResponseAuthAddress + '/response/' + referenceResponse.response_id" v-on:click.prevent="goto(getReferenceResponseAuthAddress  + '/response/' + referenceResponse.response_id)">Response by {{ referenceResponse.value }}</a>
			</div>
			<div class="custom-content" style="margin-bottom: 5px;" v-html="!this.shorten ? page.sanitizeHtml(this.response.body) : page.sanitizeHtml(getShortened(this.response.body))"></div>
			<small>Published {{ datePosted(response.date_added) }}</small>
			<div style="margin-top: 10px;">
				<a class="button is-small is-outlined is-primary" v-on:click.prevent="respond()">Respond</a>
				<a class="button is-small is-outlined is-info" :href="'./?/' + getAuthAddress + '/response/' + response.response_id" v-if="subResponses && subResponses.length > 0">{{ subResponses.length }} Responses</a>
			</div>
		</div>
		`
});