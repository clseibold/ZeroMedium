var Router = require("../router.js");
var moment = require('moment');

var Search = {
	beforeMount: function() {
		this.$emit('navbar-shadow-on');
		var that = this;
		page.getTopics((topics) => {
            that.topics = topics;
        });
        page.getAllStories(function(story) {
            return true;
        }, (stories) => {
            that.allStories = stories;
            that.listedStories = stories;
        });
	},
	data: function() {
		return {
			topics: [],
			allStories: [],
			listedStories: [],
			searchInput: "",
			isSearchStrict: false
		}
	},
	methods: {
		goto: function(to) {
			Router.navigate(to);
		},
		datePosted: function(date) {
            return moment(date).fromNow();
        },
        getStoryUrl(story) {
            return this.getStoryAuthAddress(story) + '/' + story.slug;
        },
        getStoryAuthAddress(story) {
            return story.directory.replace(/users\//, '').replace(/\//g, '');
        },
        toggleStrictness: function() {
			this.isSearchStrict = !this.isSearchStrict;
		}
	},
	computed: {
        getStories() { // TODO: Add ability to search name also
        	var list = this.allStories;
			if (this.searchInput == "" || !this.searchInput) return list;
			var searchInputWords = this.searchInput.trim().split(' '); // TODO
			var that = this;
			list = list.filter(function(story) {
				story.order = 0;
				var matches = 0;
				for (var i = 0; i < searchInputWords.length; i++) {
					var word = searchInputWords[i].trim().toLowerCase();
					if (story.tags && story.tags.toLowerCase().includes(word)) {
						story.order += 4;
						matches++;
						continue;
					}
					if (story.title.toLowerCase().includes(word)) {
						story.order += 3;
						matches++;
						continue;
					}
					if (word[0] == "@") {
						var wordId = word.substring(1, word.length);
						if (story.cert_user_id.replace(/@.*\.bit/, '').toLowerCase().includes(wordId)) {
							story.order += 2;
							matches++;
							continue;
						}
					}
					if (story.cert_user_id.toLowerCase().includes(word)) {
						story.order += 2;
						matches++;
						continue;
					}
					if (story.description.toLowerCase().includes(word)) {
						story.order++;
						matches++;
						continue;
					}
					if (story.body.toLowerCase().includes(word)) {
						continue;
						matches++;
					}
					if (that.isSearchStrict) {
						return false;
					} else {
						story.order--;
					}
				}
				//console.log(that.isSearchStrict);
				if (!that.isSearchStrict) {
					if (matches == 0) return false;
					else return true;
				} else {
					return true;
				}
			});
			list.sort(function(a, b) {
				return b.order - a.order;
			});
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
						<a class="button is-link" v-on:click.prevent="toggleStrictness()">Use {{ getStrictText }}</a>\
						<hr>
						<div class="box" v-for="story in getStories" :key="story.story_id">
                            <p class="title is-5" style="margin-bottom: 0;"><a :href="'./?/' + getStoryUrl(story)" v-on:click.prevent="goto(getStoryUrl(story))">{{ story.title }}</a></p>
                        	<small style="margin-bottom: 10px;">By <a :href="'./?/' + getStoryAuthAddress(story)" v-on:click.prevent="goto(getStoryAuthAddress(story))">{{ story.value }}</a></small>
                            <p style="margin-bottom: 5px;">{{ story.description }}</p>
                            <small>Published {{ datePosted(story.date_added) }}</small>
                        </div>
					</div>
				</div>
			</section>
		</div>
		`
};

module.exports = Search;