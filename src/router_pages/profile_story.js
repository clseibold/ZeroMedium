var Vue = require("vue/dist/vue.min.js");
var MediumEditor = require("medium-editor/dist/js/medium-editor");
var Router = require("../router.js");
var moment = require('moment');
var { sanitizeStringForUrl, sanitizeStringForUrl_SQL, html_substr } = require('../util.js');

var ProfileStory = {
	props: ['userInfo'],
	data: function() {
		return {
			responseEditor: null,
			profileInfo: null,
			story: null,
			storyAuthor: "",
			sanitizedBody: "", // NOTE: Use this instead of story.body for security reasons - it's sanitized
			responses: [],
			claps: []
		}
	},
	beforeMount: function() {
		this.$emit('navbar-shadow-on');
		this.$emit('set-response-content', "");
		var that = this;
		page.getUserProfileInfo(Router.currentParams["userauthaddress"], false, false, (profileInfo) => {
			that.profileInfo = profileInfo;
			page.getStory(Router.currentParams["userauthaddress"], Router.currentParams["slug"], (story) => {
				that.story = story;
				that.storyAuthor = story.value;
				that.sanitizedBody = page.sanitizeHtml(story.body);
				page.getResponses(that.profileInfo.auth_address, that.story.story_id, "s", (responses) => {
					that.responses = responses;
					that.getClaps();
				});
			});
		});
	},
	mounted: function() {
		this.responseEditor = new MediumEditor('.editableResponse', {
			placeholder: {
				text: "Write a response...",
				hideOnClick: false
			},
			toolbar: {
				buttons: ['bold', 'italic', 'underline', 'anchor', 'h2', 'h3', 'unorderedlist', 'orderedlist', 'quote'] // Got rid of 'quote'
			},
			buttonLabels: "fontawesome",
			anchor: {
		        /* These are the default options for anchor form,
		           if nothing is passed this is what it used */
		        customClassOption: null,
		        customClassOptionText: 'Button',
		        linkValidation: false,
		        placeholderText: 'Paste or type a link',
		        targetCheckbox: false,
		        targetCheckboxText: 'Open in new window'
		    },
		    autoLink: true,
    	    keyboardCommands: {
    		    commands: [
                    {
                        command: 'bold',
                        key: 'B',
                        meta: true,
                        shift: false,
                        alt: false
                    },
                    {
                        command: 'italic',
                        key: 'I',
                        meta: true,
                        shift: false,
                        alt: false
                    },
                    {
                        command: 'underline',
                        key: 'U',
                        meta: true,
                        shift: false,
                        alt: false
                    },
                    {
                    	command: 'append-h2',
                    	key: '2',
                    	meta: true,
                    	shift: false,
                    	alt: false
                    },
                    {
                    	command: 'append-h3',
                    	key: '3',
                    	meta: true,
                    	shift: false,
                    	alt: false
                    },
                    {
                    	command: 'append-blockquote',
                    	key: 'Q',
                    	meta: true,
                    	shift: false,
                    	alt: false
                    },
                    {
                    	command: 'strikeThrough', // TODO: change this to something else?
                    	key: 'S',
                    	meta: true,
                    	shift: false,
                    	alt: false
                    },
                    {
                    	command: 'superscript',
                    	key: '6',
                    	meta: true,
                    	shift: true,
                    	alt: false
                    },
                    {
                    	command: 'subscript',
                    	key: '6',
                    	meta: true,
                    	shift: false,
                    	alt: false
                    },
                    {
                    	command: 'insertUnorderedList',
                    	key: '8',
                    	meta: true,
                    	shift: true,
                    	alt: false
                    },
                    {
                    	command: 'insertOrderedList',
                    	key: '8',
                    	meta: true,
                    	shift: false,
                    	alt: false
                    },
                    {
                    	command: 'insertHorizontalRule',
                    	key: 'H',
                    	meta: true,
                    	shift: false,
                    	alt: false
                    },
                    {
                    	command: 'justifyCenter',
                    	key: 'E',
                    	meta: true,
                    	shift: false,
                    	alt: false
                    },
                    {
                    	command: 'justifyRight',
                    	key: 'R',
                    	meta: true,
                    	shift: false,
                    	alt: false
                    },
                    {
                    	command: 'justifyLeft',
                    	key: 'L',
                    	meta: true,
                    	shift: false,
                    	alt: false
                    },
                    {
                    	command: 'justifyFull',
                    	key: 'J',
                    	meta: true,
                    	shift: false,
                    	alt: false
                    }
                ]
            }
		    /*extensions: {
		    	table: new MediumEditorTable()
		    }*/
		});
	},
	methods: {
		getClaps: function() {
			var that = this;
			page.getClaps(that.profileInfo.auth_address, that.story.story_id, "s", (claps) => {
				that.claps = claps;
			});
		},
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
					that.responseEditor.resetContent();
				});
			});
		},
		datePosted: function(date) {
			return moment(date).fromNow();
		},
		clap: function() {
			var that = this;
			page.postClap(this.profileInfo.auth_address, this.story.story_id, "s", () => {
				that.getClaps();
			});
		},
		responseFullscreen: function() {
			this.$emit('set-response-content', this.responseEditor.getContent());
			this.goto(this.profileInfo.auth_address + '/' + this.story.slug + '/response');
		}
	},
	computed: {
		getTags: function() {
			return this.story.tags.split(',').map(function(tag) {
				return tag.toLowerCase().trim();
			});
		},
		getClapAmount: function() {
			var amount = 0;
			for (var i = 0; i < this.claps.length; i++) {
				var clap = this.claps[i];
				amount += clap.number;
			}

			if (amount > 0) {
				return amount.toString();
			} else {
				return "";
			}
		},
		isClapped: function() {
			if (!this.userInfo) return false;
			for (var i = 0; i < this.claps.length; i++) {
				var clap = this.claps[i];
				var clap_auth_address = clap.directory.replace(/users\//, '').replace(/\//g, '');
				if (clap_auth_address == this.userInfo.auth_address) {
					if (clap.number > 0) {
						return true;
					} else {
						return false;
					}
				}
			}
			return false;
		}
	},
	template: `
		<div>
			<section class="section">
				<div class="columns is-centered">
					<div class="column is-three-quarters-tablet is-half-desktop">
						<div v-if="profileInfo && story">
							<p class="title is-3">{{ story.title }}</p>
							<p class="subtitle is-5">By <a :href="'./?/' + profileInfo.auth_address" v-on:click.prevent="goto(profileInfo.auth_address)">{{ storyAuthor }}</a> - {{ datePosted(story.date_added) }}</p>
							<div class="custom-content" v-html="sanitizedBody"></div>
							<div class="tags" style="margin-top: 10px;" v-if="story.tags != ''">
								<a class='tag' v-for="tag in getTags" :href="'./?/tag/' + getTagSlug(tag)" v-on:click.prevent="goto('tag/' + getTagSlug(tag))">{{ tag }}</a>
							</div>
							<div style="margin-top: 20px;" v-if="story.tags == ''"></div>
							<a v-on:click="clap()" class="button is-small is-info" :class="{ 'is-outlined': !isClapped }">Clap</a><span style="margin-left: 10px;">{{ getClapAmount }}</span>
						</div>
						<div v-show="profileInfo && story">
							<hr>
							<h2>Responses</h2>
							<div class="box" style="margin-top: 10px; margin-bottom: 25px;" v-show="userInfo">
								<p><strong>{{ userInfo ? userInfo.keyvalue.name : "" }}</strong></p>
								<div class="editableResponse custom-content" style="outline: none; margin-top: 10px; margin-bottom: 10px;"></div>
								<a v-on:click.prevent="postResponse()" class="button is-primary is-small is-outlined">Publish</a>
								<a v-on:click.prevent="responseFullscreen()" class="button is-info is-small is-outlined">Fullscreen</a>
							</div>
							<response v-for="response in responses" :key="responses.response_id" v-bind:response="response" v-bind:show-name="true" v-bind:show-reference="false"></response>
						</div>
					</div>
				</div>
			</section>
		</div>
		`
};

module.exports = ProfileStory;