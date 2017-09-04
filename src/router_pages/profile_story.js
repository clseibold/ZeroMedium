var Router = require("../router.js");

var ProfileStory = {
	data: function() {
		return {
			profileInfo: null,
			story: null
		}
	},
	beforeMount: function() {
		this.$emit('navbar-shadow-on');
		var that = this;
		page.getUserProfileInfo(Router.currentParams["userauthaddress"], false, (profileInfo) => {
			that.profileInfo = profileInfo;
			page.getStory(Router.currentParams["userauthaddress"], Router.currentParams["slug"], (story) => {
				that.story = story;
			});
		});
	},
	template: `
		<div>
			<section class="section">
				<div class="container" v-if="profileInfo && story">
					<p class="title is-3">{{ story.title }}</p>
					<div v-html="story.body">
					</div>
				</div>
			</section>
		</div>
		`
};

module.exports = ProfileStory;