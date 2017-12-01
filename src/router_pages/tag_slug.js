var Router = require("../router.js");
var moment = require('moment');

var TagSlug = {
	props: ['userInfo'],
	data: function() {
		return {
			tagName: "Tag",
			stories: []
		}
	},
	beforeMount: function() {
		this.$emit('navbar-shadow-on');
		this.tagName = Router.currentParams.slug/*.replace(/---/, ' - ')*/.replace(/-/g, ' ');
		this.getStories(Router.currentParams.slug);
		/*var that = this;
		page.getTopics((topics) => {
            that.topics = topics;
            for (var i = 0; i < topics.length; i++) {
            	var topic = topics[i];
				if (topic.slug == Router.currentParams.slug) {
					that.topicName = topic.name;
					that.topicTags = topic.tags.split(',');
					that.getStories();
					return;
				}
			}
			that.topicName = "Topic Not Found";
        });*/
	},
	methods: {
		getStories: function(tagSlug) {
			var that = this;
			page.getStoriesFromTag(tagSlug, (stories) => {
				that.stories = stories;
			});
		},
		datePosted: function(date) {
			return moment(date).fromNow();
		},
		goto: function(to) {
			Router.navigate(to);
		},
		getStoryUrl(story) {
			return this.getStoryAuthAddress(story) + '/' + story.slug;
		},
		getStoryAuthAddress(story) {
			return story.directory.replace(/users\//, '').replace(/\//g, '');
		}
	},
	template: `
		<div>
			<section class="section">
				<div class="columns is-centered">
					<div class="column is-three-quarters-tablet is-half-desktop">
						<p class="title is-4">{{ tagName }}</p>
						<hr>
						<story v-for="story in stories" :key="story.story_id" v-bind:story="story" v-bind:show-name="true"></story>
					</div>
				</div>
			</section>
		</div>
		`
}

module.exports = TagSlug;