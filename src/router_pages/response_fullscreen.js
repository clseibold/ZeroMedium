// var Vue = require("vue/dist/vue.min.js");
var MediumEditor = require("medium-editor/dist/js/medium-editor");
var MediumEditorAutolist = require("../medium-editor-plugins/inline-markdown");
// Medium Editor Tables has problems with requirejs
// var MediumEditorTable = require("medium-editor-tables/dist/js/medium-editor-tables");
var Router = require("../router.js");
var moment = require("moment");
var { sanitizeStringForUrl, sanitizeStringForUrl_SQL, html_substr } = require('../util.js');

var ResponseFullscreen = {
	props: ["userInfo", "responseContent"],
	data: function() {
		return {
			response: null,
			referenceResponse: null,
			subResponses: null,
			responseEditor: null,
            reponsePublishBtnDisabled: false
		};
	},
	beforeMount: function() {
		this.$emit("navbar-shadow-on");
		var that = this;

		page.getResponse(Router.currentParams["userauthaddress"], Router.currentParams["id"], (response) => {
			that.response = response;
			if (response.reference_type === "r") {
				page.getResponse(response.reference_auth_address, response.reference_id, (response) => {
					that.referenceResponse = response;
				});
			}
			page.getResponses(Router.currentParams["userauthaddress"], response.response_id, "r", (responses) => {
				that.subResponses = responses;
			});
		});
	},
	mounted: function() {
        var autolist = new MediumEditorAutolist();
		this.responseEditor = new MediumEditor(".editableResponse", {
			placeholder: {
				text: "Write a response...",
				hideOnClick: false
			},
			toolbar: {
				buttons: ['bold', 'italic', 'underline', 'anchor', 'h2', 'h3', 'unorderedlist', 'orderedlist', 'quote']
			},
			buttonLabels: "fontawesome",
			anchor: {
		        customClassOption: null,
		        customClassOptionText: "Button",
		        linkValidation: false,
		        placeholderText: "Paste or type a link",
		        targetCheckbox: false,
		        targetCheckboxText: "Open in new window"
		    },
		    autoLink: true,
            extensions: {
                "autolist": autolist
            },
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
		});
	},
	methods: {
		goto: function(to) {
			Router.navigate(to);
		},
		postResponse: function() {
			var that = this;

            if (this.responseEditor.getContent() === "") { // TODO: Doesn't work all of the time
                page.cmd("wrapperNotification", ["error", "You cannot post an empty response."]);
                return;
            }

            this.reponsePublishBtnDisabled = true;
			page.postResponse(this.getAuthAddress, this.response.response_id, "r", this.responseEditor.getContent(), function() {
				that.responseEditor.resetContent();
				//Router.navigate(that.getAuthAddress + '/response/' + that.response.response_id);
				page.getResponses(Router.currentParams["userauthaddress"], that.response.response_id, "r", (responses) => {
					that.subResponses = responses;
                    that.reponsePublishBtnDisabled = false;
				});
			});
		},
		responseFullscreen: function() {
			Router.navigate(this.getAuthAddress + "/response/" + this.response.response_id + "/response");
		}
	},
	computed: {
		getStoryAuthAddress: function() {
			return this.response.story.directory.replace(/users\//, '').replace(/\//g, "");
		},
		getAuthAddress: function() {
			return this.response.directory.replace(/users\//, '').replace(/\//g, "");
		},
		datePosted: function() {
			return moment(this.response.date_added).fromNow();
		},
		getReferenceResponseAuthAddress: function() {
			return this.referenceResponse.directory.replace(/users\//, "").replace(/\//g, "");
		}
	},
	template: `
		<div>
			<section class="section">
				<div class="columns is-centered">
					<div class="column is-three-quarters-tablet is-half-desktop">
						<div v-if="response">
							<p style="margin-bottom: 5px;"><strong><a :href="'./?/' + getAuthAddress" v-on:click.prevent="goto(getAuthAddress)">{{ response.value }}</a></strong></p>
							<div style="margin-left: 20px; margin-bottom: 20px;" v-if="response.story">
								Responded to <a :href="'./?/' + getStoryAuthAddress + '/' + response.story.slug" v-on:click.prevent="goto(getStoryAuthAddress  + '/' + response.story.slug)">{{ response.story.title }}</a><br>
								<small>{{ response.story.value }}</small>
							</div>
							<div style="margin-left: 20px; margin-bottom: 20px;" v-if="referenceResponse">
								Responded to <a :href="'./?/' + getReferenceResponseAuthAddress + '/response/' + referenceResponse.response_id" v-on:click.prevent="goto(getReferenceResponseAuthAddress  + '/response/' + referenceResponse.response_id)">Response by {{ referenceResponse.value }}</a>
							</div>

							<div class="custom-content" style="margin-bottom: 5px;" v-html="page.sanitizeHtml(response.body)"></div>
							<small>Published {{ datePosted }}</small>
						</div>
						<div>
							<hr>
							<h2>Responses</h2>
							<div class="box" style="margin-top: 10px; margin-bottom: 25px;" v-show="userInfo && response">
								<p><strong>{{ userInfo ? userInfo.keyvalue.name : "" }}</strong></p>
								<div class="editableResponse custom-content" style="outline: none; margin-top: 10px; margin-bottom: 10px;"></div>
								<a v-on:click.prevent="postResponse()" class="button is-primary is-small is-outlined" :disabled="reponsePublishBtnDisabled">Publish</a>
								<a v-on:click.prevent="responseFullscreen()" class="button is-info is-small is-outlined">Fullscreen</a>
							</div>
							<response v-for="response in subResponses" :key="response.response_id" v-bind:response="response" v-bind:show-name="true" v-bind:show-reference="false"></response>
						</div>
					</div>
				</div>
			</section>
		</div>
		`
};

module.exports = ResponseFullscreen;