var Vue = require("vue/dist/vue.min.js");
var MediumEditor = require("medium-editor/dist/js/medium-editor");
var MediumEditorAutolist = require("../medium-editor-plugins/inline-markdown");
// Medium Editor Tables has problems with requirejs
//var MediumEditorTable = require("medium-editor-tables/dist/js/medium-editor-tables");
var Router = require("../router.js");
var { sanitizeStringForUrl } = require("../util.js");
var { cache_add, cache_replace, cache_remove, cache_get, cache_getOrAdd, cache_exists, cache_clear } = require("../cache.js");

var EditStory = {
	props: ["userInfo"],
	data: function() {
		return {
			profileInfo: null,
			story: null,
			title: '',
			storyLanguage: '',
			status: 'Unsaved changes'
		}
	},
	beforeMount: function() {
		this.$emit('navbar-shadow-on');
		if (this.userInfo) {
			this.getStory(this.userInfo);
		} else {
			this.$parent.$on('setUserInfo', this.getStory);
		}
	},
	methods: {
		getStory: function(userInfo) {
			/*page.getUserProfileInfo(userInfo.auth_address, false, (profileInfo) => {
				that.profileInfo = profileInfo;
				page.getStory(userInfo.auth_address, Router.currentParams["slug"], (story) => {
					that.story = story;
					that.title = story.title;
					that.$emit('setDefaults', story.tags, story.description);
					that.createEditor();
				});
			});*/
			var that = this;
			page.getStory(userInfo.auth_address, Router.currentParams["slug"], (story) => {
				that.title = story.title;
				that.storyLanguage = story.language;
				that.story = story;
				console.log(story.language)
				that.$emit('setDefaults', story.tags, story.description);
				that.createEditor();
			});
		},
		createEditor: function() {
			var autolist = new MediumEditorAutolist();
			this.editor = new MediumEditor('.editable', {
				imageDragging: true,
				placeholder: {
					text: "Tell your story...",
					hideOnClick: true
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
			    extensions: {
			        'autolist': autolist
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
			this.editor.setContent(this.story.body);
		},
		publish: function(tags, description, language) {
			var that = this;
			if (language == '') language = null;
			page.editStory(this.story.story_id, this.title, description, this.editor.getContent(), tags, language, function() {
				//cache_clear();
				Router.navigate(that.userInfo.auth_address + '/' + sanitizeStringForUrl(that.title));
			});
		},
		save: function(tags, description, language) {
			if (language == '') language = null;
			page.unimplemented();
		}
	},
	template: `
		<div>
			<editor-nav v-on:publish="publish" v-on:save="save" :user-info="userInfo" :story-language="storyLanguage">
				Edit
				<span slot="status">{{status}}</span>
			</editor-nav>
			<section class="section">
				<div class="columns is-centered">
					<div class="column is-three-quarters-tablet is-half-desktop">
						<input class="input title" type="text" placeholder="Title" style="border: none; border-left: 1px solid #CCCCCC; background: inherit; box-shadow: none;" v-model="title">
						<!--<textarea class="textarea" style="border: none; background: inherit; box-shadow: none;" placeholder="Tell your story..."></textarea>-->
						<div class="editable custom-content" placeholder="Tell your story..."></div>
					</div>
				</div>
			</section>
		</div>
		`
}

module.exports = EditStory;
