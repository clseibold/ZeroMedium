var Vue = require("vue/dist/vue.min.js");
var MediumEditor = require("medium-editor/dist/js/medium-editor");
var MediumEditorAutolist = require("../medium-editor-plugins/inline-markdown");
// Medium Editor Tables has problems with requirejs
//var MediumEditorTable = require("medium-editor-tables/dist/js/medium-editor-tables");
var Router = require("../router.js");

var ResponseFullscreenEditor = {
	props: ["userInfo", "responseContent"],
	data: function() {
		return {
			story: null, // Change to reference?
			response: null,
			referenceAuthor: "",
			referenceProfileInfo: null,
			editor: null,
			title: "",
			status: "Unsaved changes",
			mobileTags: "",
			mobileDescription: ""
		};
	},
	beforeMount: function() {
		this.$emit("navbar-shadow-off");
		var that = this;

		if (Router.currentParams["slug"]) {
			// Respond to story
			page.getUserProfileInfo(Router.currentParams["userauthaddress"], false, false, (profileInfo) => {
				that.referenceProfileInfo = profileInfo;
				page.getStory(Router.currentParams["userauthaddress"], Router.currentParams["slug"], (story) => {
					that.story = story;
					that.referenceAuthor = story.value;
				});
			});
		} else if (Router.currentParams["id"]) {
			// Respond to response
			page.getUserProfileInfo(Router.currentParams["userauthaddress"], false, false, (profileInfo) => {
				that.referenceProfileInfo = profileInfo;
				page.getResponse(Router.currentParams["userauthaddress"], Router.currentParams["id"], (response) => {
					that.response = response;
					that.referenceAuthor = response.value;
				});
			});
		}
	},
	mounted: function() {
		var autolist = new MediumEditorAutolist();

		this.editor = new MediumEditor(".editable", {
			placeholder: {
				text: "Write a response...",
				hideOnClick: false
			},
			toolbar: {
				buttons: ["bold", "italic", "underline", "anchor", "h2", "h3", "unorderedlist", "orderedlist", "quote"]
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
		    /*extensions: {
		    	table: new MediumEditorTable()
		    }*/
		});

		if (this.responseContent && this.responseContent !== "") {
			this.editor.setContent(this.responseContent);	
		}
	},
	methods: {
		goto: function(to) {
			Router.navigate(to);
		},
		publish: function(tags, description) {
			var that = this;

			if (this.editor.getContent() === "") { // TODO: Doesn't work all of the time
				page.cmd("wrapperNotification", ["error", "You cannot post an empty response."]);
				return;
			}

			if (this.story) {
				page.postResponse(this.referenceProfileInfo.auth_address, this.story.story_id, "s", this.editor.getContent(), function() {
					that.editor.resetContent();
					Router.navigate(that.referenceProfileInfo.auth_address + "/" + that.story.slug);
				});
			} else if (this.response) {
				page.postResponse(this.referenceProfileInfo.auth_address, this.response.response_id, "r", this.editor.getContent(), function() {
					that.editor.resetContent();
					Router.navigate(that.referenceProfileInfo.auth_address + "/response/" + that.response.response_id);
				});
			}
		},
		save: function(tags, description) {
			page.unimplemented();
		}
	},
	template: `
		<div>
			<response-editor-nav v-on:publish="publish" v-on:save="save">
				<span slot="status">{{status}}</span>
			</response-editor-nav>
			<section class="section">
				<div class="columns is-centered">
					<div class="column is-three-quarters-tablet is-half-desktop">
						<div style="margin-left: 20px; margin-bottom: 20px;" v-if="story">
							Responding to <a :href="'./?/' + referenceProfileInfo.auth_address + '/' + story.slug" v-on:click.prevent="goto(referenceProfileInfo.auth_address  + '/' + story.slug)">{{ story.title !== "" ? story.title : "[NO TITLE]" }}</a><br>
							<small>{{ referenceAuthor }}</small>
						</div>
						<div style="margin-left: 20px; margin-bottom: 20px;" v-if="response">
							Responding to <a :href="'./?/' + referenceProfileInfo.auth_address + '/response/' + response.response_id" v-on:click.prevent="goto(referenceProfileInfo.auth_address  + '/response/' + response.response_id)">Response by {{ referenceAuthor }}</a>
						</div>
						<!--<input class="input title" type="text" placeholder="Title" style="border: none; border-left: 1px solid #CCCCCC; background: inherit; box-shadow: none;" v-model="title">-->
						<!--<textarea class="textarea" style="border: none; background: inherit; box-shadow: none;"></textarea>-->
						<div class="editable custom-content"></div>
					</div>
				</div>
			</section>
		</div>
		`
};

Vue.component("response-editor-nav", {
	props: ["value"],
	methods: {
		publish: function() {
			this.$emit("publish");
		},
		save: function() {
			this.$emit("save");
		}
	},
	template: `
		<div>
			<div class="navbar is-transparent has-shadow" style="border-top: 1px solid rgba(0,0,0,.05);">
	            <div class="container">
	            	<div class="navbar-brand">
	                	<div class="navbar-item"><slot>Draft</slot></div>
	                	<div class="navbar-item" style="padding-left: 5px; padding-right: 5px; color: #9A9A9A;"><small><slot name="status">Unsaved changes</slot><small></div>
	                </div>
	                <div class="navbar-menu">
	                	<div class="navbar-start">
	                	</div>
	                	<div class="navbar-end">
	                		<a class="navbar-item" v-on:click.prevent="save">Save Draft</a>
	                		<a class="navbar-item" v-on:click.prevent="publish">Publish</a>
	                	</div>
	                </div>
	            </div>
	        </div>
	        <div class="columns is-centered is-hidden-desktop">
				<div class="column is-three-quarters-tablet is-half-desktop" style="margin-top: 20px;">
	        		<a class="button is-outlined is-info is-small" v-on:click.prevent="save">Save Draft</a>
					<a class="button is-primary is-outlined is-small" v-on:click.prevent="publish">Publish</a>
				</div>
	        </div>
        </div>`
});

module.exports = ResponseFullscreenEditor;