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
						<p>This function has not been implemented yet!</p>
					</div>
				</div>
			</section>
		</div>
		`
}

module.exports = TagSlug;