var Router = require("../router.js");
var moment = require('moment');

var TopicSlug = {
	props: ['userInfo'],
	data: function() {
		return {
			topicName: "",
			topicTags: "",
			topics: [],
			stories: []
		}
	},
	beforeMount: function() {
		this.$emit('navbar-shadow-on');
		var that = this;
		page.getTopics((topics) => {
            that.topics = topics;
            for (var i = 0; i < topics.length; i++) {
            	var topic = topics[i];
				if (topic.slug == Router.currentParams.slug) {
					that.topicName = topic.name;
					that.topicTags = topic.tags.split(',').map(function(tag) {
						return tag.toLowerCase().trim();
					});
					that.getStories();
					return;
				}
			}
			that.topicName = "Topic Not Found";
        });
	},
	methods: {
		getStories: function() {
			var that = this;
			if (this.topicTags == "") return;
			var amount = 0;
			page.getAllStories(function(story) {
				var amount = 0;
				var storyTags = story.tags.split(',').map(function(tag) {
					return tag.toLowerCase().trim();
				});
				for (var i = 0; i < that.topicTags.length; i++) {
					if (story.tags.includes(that.topicTags[i])) {
						amount++;
					}
				}
				story["amount"] = amount;
				return amount > 0;
			}, (stories) => {
				stories.sort(function(a, b) {
					return b.amount - a.amount;
				});
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
		},
		getTagSlug(tag) {
			return tag.replace(/ /, '-');
		}
	},
	template: `
		<div>
			<section class="section">
				<div class="columns is-centered">
					<div class="column is-three-quarters-tablet is-three-quarters-desktop">
						<p class="title is-4">{{ topicName }}</p>
						<!--<div class="tags">
							<a class="tag" v-for="tag in topicTags" :key="tag" :href="'./?/tag/' + getTagSlug(tag)" v-on:click.prevent="goto('tag/' + getTagSlug(tag))">{{ tag }}</span>
						</div>-->
						<hr>
						<div class="box" v-for="story in stories" :key="story.story_id">
							<p class="title is-5" style="margin-bottom: 5px;"><a :href="'./?/' + getStoryUrl(story)" v-on:click.prevent="goto(getStoryUrl(story))">{{ story.title }}</a></p>
							<p style="margin-bottom: 5px;">{{ story.description }}</p>
							<small>Published {{ datePosted(story.date_added) }}</small>
						</div>
					</div>
				</div>
			</section>
		</div>
		`
}

module.exports = TopicSlug;