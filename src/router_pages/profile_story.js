var MediumEditor = require("medium-editor/dist/js/medium-editor");
var Router = require("../router.js");
var moment = require('moment');

var ProfileStory = {
	props: ['userInfo'],
	data: function() {
		return {
			responseEditor: null,
			profileInfo: null,
			story: null,
			sanitizedBody: "", // NOTE: Use this instead of story.body for security reasons - it's sanitized
			responses: []
		}
	},
	beforeMount: function() {
		this.$emit('navbar-shadow-on');
		var that = this;
		page.getUserProfileInfo(Router.currentParams["userauthaddress"], false, (profileInfo) => {
			that.profileInfo = profileInfo;
			page.getStory(Router.currentParams["userauthaddress"], Router.currentParams["slug"], (story) => {
				that.story = story;
				that.sanitizedBody = page.sanitizeHtml(story.body);
				page.getResponses(that.profileInfo.auth_address, that.story.story_id, "s", (responses) => {
					console.log(responses);
					that.responses = responses;
				});
			});
		});
	},
	mounted: function() {
		this.responseEditor = new MediumEditor('.editableResponse', {
			placeholder: {
				text: "Write a response...",
				hideOnClick: false
			}
		});
	},
	methods: {
		getTagSlug(tag) {
			return tag.replace(/ /, '-');
		},
		goto: function(to) {
			Router.navigate(to);
		},
		postResponse: function() {
			var that = this;
			page.postResponse(this.profileInfo.auth_address, this.story.story_id, 's', this.responseEditor.getContent(), function() {
				// Get the responses again.
				page.getResponses(that.profileInfo.auth_address, that.story.story_id, "s", (responses) => {
					that.responses = responses;
				});
			});
		},
		datePosted: function(date) {
			return moment(date).fromNow();
		},
	},
	computed: {
		getTags: function() {
			return this.story.tags.split(',').map(function(tag) {
				return tag.toLowerCase().trim();
			});
		}
	},
	template: `
		<div>
			<section class="section">
				<div class="columns is-centered">
					<div class="column is-three-quarters-tablet is-half-desktop">
						<div v-if="profileInfo && story">
							<p class="title is-3">{{ story.title }}</p>
							<div v-html="sanitizedBody"></div>
							<div class="tags" style="margin-top: 10px;">
								<a class='tag' v-for="tag in getTags" :href="'./?/tag/' + getTagSlug(tag)" v-on:click.prevent="goto('tag/' + getTagSlug(tag))">{{ tag }}</a>
							</div>
						</div>
						<div v-show="profileInfo && story">
							<hr>
							<h2>Responses</h2>
							<div class="box" style="margin-top: 10px; margin-bottom: 25px;" v-show="userInfo">
								<p><strong>{{ userInfo ? userInfo.keyvalue.name : "" }}</strong></p>
								<div class="editableResponse" style="outline: none; margin-top: 10px; margin-bottom: 10px;"></div>
								<a v-on:click.prevent="postResponse()" class="button is-primary is-small is-outlined">Publish</a>
							</div>
							<div class="box" v-for="response in responses" :key="responses.response_id" style="margin-bottom: 20px;">
								<p style="margin-bottom: 5px;" v-html="page.sanitizeHtml(response.body)"></p>
								<small>Published {{ datePosted(response.date_added) }}</small>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
		`
};

module.exports = ProfileStory;