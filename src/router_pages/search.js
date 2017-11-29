var Router = require("../router.js");
var moment = require('moment');

var Search = {
	beforeMount: function() {
		this.$emit('navbar-shadow-on');
		var that = this;
		page.getTopics((topics) => {
            that.topics = topics;
        });
        this.getStories();
	},
	data: function() {
		return {
			topics: [],
			allStories: [],
			//listedStories: [],
			searchInput: "",
			isSearchStrict: false
		}
	},
	methods: {
		getStories: function() {
			var that = this;
			page.getAllStories(false, (story) => {
			    return true;
			}, (stories) => {
			    that.allStories = stories;
			    //that.listedStories = stories;
			});
		},
		goto: function(to) {
			Router.navigate(to);
		},
        toggleStrictness: function() {
			this.isSearchStrict = !this.isSearchStrict;
		}
	},
	computed: {
        getSearchedStories: function() {
        	var list = this.allStories.slice();
			if (this.searchInput == "" || !this.searchInput) return list;
			var searchInputWords = this.searchInput.trim().split(' ');
			var that = this;
			list = list.filter(function(story) {
				story.order = 0;
				var matches = 0;
				for (var i = 0; i < searchInputWords.length; i++) {
					var word = searchInputWords[i].trim().toLowerCase();
					if (story.tags && story.tags != "" && story.tags.toLowerCase().includes(word)) {
						story.order += 4;
						matches++;
						continue;
					}
					if (story.title && story.title.toLowerCase().includes(word)) {
						story.order += 3;
						matches++;
						continue;
					}
					if (story.cert_user_id && word[0] == "@" && word.length > 1) {
						var wordId = word.substring(1, word.length);
						if (story.cert_user_id.replace(/@.*\.bit/, '').toLowerCase().includes(wordId)) {
							story.order += 2;
							matches++;
							continue;
						}
					}
					if (story.cert_user_id && story.cert_user_id.toLowerCase().includes(word)) {
						story.order += 2;
						matches++;
						continue;
					}
					if (story.description && story.description.toLowerCase().includes(word)) {
						story.order++;
						matches++;
						continue;
					}
					if (story.body && story.body.toLowerCase().includes(word)) {
						matches++;
						continue;
					}
					if (that.isSearchStrict) {
						return false;
					} else {
						story.order--;
					}
				}
				if (!that.isSearchStrict && matches == 0) return false;
				else return true;
			});
			if (list.length > 1) {
				list.sort(function(a, b) {
					return b.order - a.order;
				});
			}
			return list;
        },
        getStrictText: function() {
			if (this.isSearchStrict) return "Inclusive";
			else return "Strict";
		}
	},
	template: `
		<div>
			<section class="section">
				<div class="columns is-centered">
					<div class="column is-three-quarters-tablet is-half-desktop">
						<div class="field has-addons">
							<p class="control has-icons-left is-expanded">
								<input type="search" class="input" v-model="searchInput" style="display: inline; margin-bottom: 10px;" placeholder="Search ...">
								<span class="icon is-small is-left">
									<i class="fa fa-search"></i>
								</span>
							</p>
							<div class="control">
								<!--<button class="button">+</button>-->
								<a href="./?/me/newstory" v-on:click.prevent="goto('me/newstory')" class="button is-primary">Write A Story</route-link>
							</div>
						</div>
						<a class="button is-link" v-on:click.prevent="toggleStrictness()">Use {{ getStrictText }}</a>
						<hr>
						<story v-for="story in getSearchedStories" :story="story" :show-name="true"></story>
					</div>
				</div>
			</section>
		</div>
		`
};

module.exports = Search;