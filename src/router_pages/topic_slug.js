var Router = require("../router.js");

var TopicSlug = {
	data: function() {
		return {
			topicName: "",
			topics: []
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
					return;
				}
			}
			that.topicName = "Topic Not Found";
        });
	},
	template: `
		<div>
			<section class="section">
				<div class="container">
					<p class="title is-4">{{ topicName }}</p>
					<hr>
				</div>
			</section>
		</div>
		`
}

module.exports = TopicSlug;