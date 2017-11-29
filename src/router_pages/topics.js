var Router = require("../router.js");
var moment = require("moment");
var { cache_add, cache_replace, cache_remove, cache_get, cache_getOrAdd, cache_exists, cache_clear } = require("../cache.js");

var Topics = {
	props: ['userInfo'],
	data: function() {
		return {
			topics: [],
			interests: []
		}
	},
	beforeMount: function() {
		this.$emit('navbar-shadow-on');
		this.getTopics();
		if (this.userInfo) {
			this.loadInterests(this.userInfo);
		} else {
			this.$emit('get-user-info');
			this.$parent.$on('setUserInfo', this.loadInterests);
		}
	},
	methods: {
		goto: function(to) {
			Router.navigate(to);
		},
		loadInterests: function(userInfo) {
			this.interests = userInfo.keyvalue.interests.split(',');
		},
		getTopics: function() {
			var that = this;
			if (cache_exists("home_topics")) {
	            this.topics = cache_get("home_topics");
	        } else {
	            page.getTopics((topics) => {
	                that.topics = topics;
	                cache_add("home_topics", topics);
	            });
	        }
		},
		getTopicName: function(slug) {
			return slug[0].toUpperCase() + slug.substring(1).replace(/-/, ' ');
		},
		checkInterestFollowed: function(slug) {
			return this.interests.includes(this.getTopicName(slug));
		},
		followInterest: function(slug) {
			var newInterests = this.interests.slice();
			newInterests.push(this.getTopicName(slug));
			var that = this;
			page.setInterests(newInterests.join(','), () => {
				that.interests = newInterests;
			});
		},
		unfollowInterest: function(slug) {
			var newInterests = this.interests.slice();
			var index = newInterests.indexOf(this.getTopicName(slug));
			if (index > -1) {
				newInterests.splice(index, 1);
			}
			var that = this;
			page.setInterests(newInterests.join(','), () => {
				that.interests = newInterests;
			});
		}
	},
	computed: {
		getLeftTopics: function() {
			var newList = [];
			for (var i = 0; i < this.topics.length; i++) {
				if (i % 2 == 0) {
					newList.push(this.topics[i]);
				}
			}
			return newList;
		},
		getRightTopics: function() {
			var newList = [];
			for (var i = 0; i < this.topics.length; i++) {
				if (i % 2 == 1) {
					newList.push(this.topics[i]);
				}
			}
			return newList;
		}
	},
	template: `
		<div>
			<section class="section">
				<div class="columns is-centered">
					<div class="column is-three-quarters-tablet is-half-desktop">
						<p class="title is-4">All Topics</p>
						<hr>
						<div class="columns">
							<div class="column">
								<div class="box" v-for="topic in getLeftTopics">
									<h2>
										<a v-on:click.prevent="goto('topic/' + topic.slug)">{{ getTopicName(topic.slug) }}</a>
										<a v-if="userInfo && !checkInterestFollowed(topic.slug)" class="button is-primary is-outlined" style="float: right;" v-on:click.prevent="followInterest(topic.slug)">Follow</a>
										<a v-if="userInfo && checkInterestFollowed(topic.slug)" class="button is-primary" style="float: right;" v-on:click.prevent="unfollowInterest(topic.slug)">Following</a>
									</h2>
								</div>
							</div>
							<div class="column">
								<div class="box" v-for="topic in getRightTopics">
									<h2>
										<a v-on:click.prevent="goto('topic/' + topic.slug)">{{ getTopicName(topic.slug) }}</a>
										<a v-if="userInfo && !checkInterestFollowed(topic.slug)" class="button is-primary is-outlined" style="float: right;" v-on:click.prevent="followInterest(topic.slug)">Follow</a>
										<a v-if="userInfo && checkInterestFollowed(topic.slug) && userInfo" class="button is-primary" style="float: right;" v-on:click.prevent="unfollowInterest(topic.slug)">Following</a>
									</h2>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
		`
};

module.exports = Topics;
