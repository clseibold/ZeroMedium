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
			searchInput: ""
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
        }
	},
	template: `
		<div>
			<section class="section">
				<div class="columns is-centered">
					<div class="column is-three-quarters-tablet is-three-quarters-desktop">
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
						<hr>
						<div class="box" v-for="story in listedStories" :key="story.story_id">
                            <p class="title is-5" style="margin-bottom: 5px;"><a :href="'./?/' + getStoryUrl(story)" v-on:click.prevent="goto(getStoryUrl(story))">{{ story.title }}</a></p>
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