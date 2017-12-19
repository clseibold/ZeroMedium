// var Vue = require("vue/dist/vue.min.js");
var MediumEditor = require("medium-editor/dist/js/medium-editor");
var MediumEditorAutolist = require("../medium-editor-plugins/inline-markdown");
// Medium Editor Tables has problems with requirejs
// var MediumEditorTable = require("medium-editor-tables/dist/js/medium-editor-tables");
var Router = require("../router.js");
var { sanitizeStringForUrl } = require("../util.js");
var { cache_add, cache_replace, cache_remove, cache_get, cache_getOrAdd, cache_exists, cache_clear } = require("../cache.js");

var EditStory = {
	props: ["userInfo"],
	data: function() {
		return {
			profileInfo: null,
			story: null,
			title: "",
			storyLanguage: "",
			status: "Unsaved changes"
		};
	},
	beforeMount: function() {
		this.$emit("navbar-shadow-on");
		if (this.userInfo) {
			this.getStory(this.userInfo);
		} else {
			this.$parent.$on("setUserInfo", this.getStory);
		}
	},
	methods: {
		getStory: function(userInfo) {
			/* page.getUserProfileInfo(userInfo.auth_address, false, (profileInfo) => {
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
				that.$emit("setDefaults", story.tags, story.description);
				that.createEditor();
			});
		},
		createEditor: function() {
			var autolist = new MediumEditorAutolist();

			this.editor = new MediumEditor(".editable", {
				imageDragging: true,
				placeholder: {
					text: "Tell your story...",
					hideOnClick: true
				},
				toolbar: {
					buttons: ["bold", "italic", "underline", "anchor", "h2", "h3", "unorderedlist", "orderedlist", "quote"]
				},
				buttonLabels: "fontawesome",
				anchor: {
			        /* These are the default options for anchor form,
			           if nothing is passed this is what it used */
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
	                        command: "bold",
	                        key: 'B',
	                        meta: true,
	                        shift: false,
	                        alt: false
	                    },
	                    {
	                        command: "italic",
	                        key: 'I',
	                        meta: true,
	                        shift: false,
	                        alt: false
	                    },
	                    {
	                        command: "underline",
	                        key: 'U',
	                        meta: true,
	                        shift: false,
	                        alt: false
	                    },
	                    {
	                    	command: "append-h2",
	                    	key: '2',
	                    	meta: true,
	                    	shift: false,
	                    	alt: false
	                    },
	                    {
	                    	command: "append-h3",
	                    	key: '3',
	                    	meta: true,
	                    	shift: false,
	                    	alt: false
	                    },
	                    {
	                    	command: "append-blockquote",
	                    	key: 'Q',
	                    	meta: true,
	                    	shift: false,
	                    	alt: false
	                    },
	                    {
	                    	command: "strikeThrough", // TODO: change this to something else?
	                    	key: 'S',
	                    	meta: true,
	                    	shift: false,
	                    	alt: false
	                    },
	                    {
	                    	command: "superscript",
	                    	key: '6',
	                    	meta: true,
	                    	shift: true,
	                    	alt: false
	                    },
	                    {
	                    	command: "subscript",
	                    	key: '6',
	                    	meta: true,
	                    	shift: false,
	                    	alt: false
	                    },
	                    {
	                    	command: "insertUnorderedList",
	                    	key: '8',
	                    	meta: true,
	                    	shift: true,
	                    	alt: false
	                    },
	                    {
	                    	command: "insertOrderedList",
	                    	key: '8',
	                    	meta: true,
	                    	shift: false,
	                    	alt: false
	                    },
	                    {
	                    	command: "insertHorizontalRule",
	                    	key: 'H',
	                    	meta: true,
	                    	shift: false,
	                    	alt: false
	                    },
	                    {
	                    	command: "justifyCenter",
	                    	key: 'E',
	                    	meta: true,
	                    	shift: false,
	                    	alt: false
	                    },
	                    {
	                    	command: "justifyRight",
	                    	key: 'R',
	                    	meta: true,
	                    	shift: false,
	                    	alt: false
	                    },
	                    {
	                    	command: "justifyLeft",
	                    	key: 'L',
	                    	meta: true,
	                    	shift: false,
	                    	alt: false
	                    },
	                    {
	                    	command: "justifyFull",
	                    	key: 'J',
	                    	meta: true,
	                    	shift: false,
	                    	alt: false
	                    }
	                ]
	            }
			});
			this.editor.setContent(this.story.body);
		},
		publish: function(tags, description, language) {
			var that = this;

			if (this.editor.getContent().trim() === "" || this.title.trim() === "") { // TODO: Doesn't work all of the time, need to remove all html elements for body to work correctly
				page.cmd("wrapperNotification", ["error", "You cannot post an empty story."]);
				return;
			}
			
			if (language == "") language = null;
			page.editStory(this.story.story_id, this.title, description, this.editor.getContent(), tags, language, function(storySlug) {
				//cache_clear();
				Router.navigate(that.userInfo.auth_address + '/' + storySlug);
			});
		},
		save: function(tags, description, language) {
			if (language == "") language = null;
			page.unimplemented();
		},
		uploadFile: function() {
			if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
				alert("The File APIs are not fully supported in this browser.");
				return;
			}

			var that = this;
			var fileUpload = document.getElementById("fileUpload");
			var files = fileUpload.files;

			if (!files) {
				return;
			}

			for (let fX in files) {
				let fY = files[fX];

				if (!fY || typeof fY !== "object" || !fY.type.match("(image)\/(png|jpg|jpeg|gif)|(audio)\/(mp3|flac|ogg)|(video)\/(ogg|mp4|webm)")) { // |audio|video      || !fY.name.match(/\.IMAGETYPE$/gm)
					//page.cmd("wrapperNotification", ["error", "That file type is not supported."]);
					continue;
				}

				let reader = new FileReader();
				reader.onload = function(event) {
						let f_data = btoa(event.target.result);
						let file_type = fY.type;

						// Add to Medium-editor
						if (file_type.split("/")[0] === "image") {
							page.uploadImage(fY, f_data, false, (output_url) => {
								fileUpload.value = null;
								that.editor.execAction("insertHtml", {
								    value: '<div><img src="' + output_url + '"></div>'
								});
							});
						} else if (file_type.split("/")[0] === "audio") {
							page.uploadBigFile(fY, (output_url) => {
								fileUpload.value = null;
								that.editor.execAction("insertHtml", {
								    value: '<div><audio src="' + output_url + '" controls></audio></div>' // TODO: Remove or rename img class?
								});
							});
						} else if (file_type.split("/")[0] === "video") {
							page.uploadBigFile(fY, (output_url) => {
								fileUpload.value = null;
								that.editor.execAction("insertHtml", {
								    value: '<div><video src="' + output_url + '" controls></video></div>'
								});
							});
						} else {
							that.editor.execAction("insertHtml", {
							    value: ' <a class="file" href="' + output_url + '" download>Download File</a> '
							});
						}
					};
				reader.readAsBinaryString(fY);
			}
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
						<small>Note: Make sure the editor is in focus <em>before</em> selecting a photo, audio, or video to upload.</small>
						<div class="file is-info" style="margin-bottom: 30px; margin-top: 5px;">
							<label class="file-label">
								<input class="file-input" type="file" accept="image/*,audio/*,video/*" id="fileUpload" v-on:change="uploadFile()">
								<span class="file-cta">
									<span class="file-icon">
										<i class="fa fa-upload"></i>
									</span>
									<span class="file-label">Upload a File...</span>
								</span>
							</label>
						</div>
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
