var Vue = require("vue/dist/vue.min.js");
var MediumEditor = require("medium-editor/dist/js/medium-editor");
var MediumEditorAutolist = require("../medium-editor-plugins/inline-markdown");
var MediumEditorZeroGraphLinks = require("../medium-editor-plugins/zerograph-links");
// Medium Editor Tables has problems with requirejs
// var MediumEditorTable = require("medium-editor-tables/dist/js/medium-editor-tables");
var Router = require("../router.js");
var { sanitizeStringForUrl } = require("../util.js");
var { cache_add, cache_replace, cache_remove, cache_get, cache_getOrAdd, cache_exists, cache_clear } = require("../cache.js");

var Newstory = {
	props: ["userInfo"],
	data: function() {
		return {
			editor: null,
			title: "",
			status: "Unsaved changes",
			mobileTags: "",
			mobileDescription: "",
			mobileLanguage: ""
		};
	},
	beforeMount: function() {
		this.$emit("navbar-shadow-off");
	},
	mounted: function() {
		var autolist = new MediumEditorAutolist();
		var zerograph_links = new MediumEditorZeroGraphLinks();

		this.editor = new MediumEditor(".editable", {
			imageDragging: true,
			placeholder: {
				text: "Tell your story...",
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
		    extensions: {
		        "autolist": autolist,
		        "zerographlinks": zerograph_links
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
		publish: function(tags, description, language) {
			var that = this;

			if (this.editor.getContent() === "" || this.title === "") { // TODO: Doesn't work all of the time
				page.cmd("wrapperNotification", ["error", "You cannot post an empty story."]);
				return;
			}

			if (language === "") {
				language = null;
			}
			page.postStory(this.title, description, this.editor.getContent(), tags, language, function(slug) {
				Router.navigate(that.userInfo.auth_address + "/" + slug);
			});
		},
		save: function(tags, description, language) {
			if (language === "") {
				language = null;
			}
			page.unimplemented();
		},
		uploadFile: function() {
			if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
				alert("The File APIs are not fully supported in this browser.");
				return;
			}

			var that = this;
			var imageUpload = document.getElementById("imageUpload");
			var files = imageUpload.files;

			if (!files) {
				return;
			}

			for (let fX in files) {
				let fY = files[fX];

				if (!fY || typeof fY !== "object" || !fY.type.match("(image)\/(png|jpg|jpeg|gif)|(audio)\/(mp3|ogg)|(video)\/(ogg|mp4)")) { // |audio|video      || !fY.name.match(/\.IMAGETYPE$/gm)
					page.cmd("wrapperNotification", ["error", "That file type is not supported."]);
					continue;
				}

				let reader = new FileReader();
				reader.onload = function(event) {
						let f_data = btoa(event.target.result);
						let file_type = fY.type;

						page.uploadImage(fY, f_data, false, (output_url) => {
							imageUpload.value = null;

							// Add to Medium-editor
							if (file_type.split("/")[0] === "image") {
								that.editor.execAction("insertHtml", {
								    value: '<div><img src="' + output_url + '"></div>'
								});
							} else if (file_type.split("/")[0] === "audio") {
								that.editor.execAction("insertHtml", {
								    value: '<div><audio src="' + output_url + '" controls></audio></div>' // TODO: Remove or rename img class?
								});
							} else if (file_type.split("/")[0] === "video") {
								that.editor.execAction("insertHtml", {
								    value: '<div><video src="' + output_url + '" controls></video></div>'
								});
							} else {
								that.editor.execAction("insertHtml", {
								    value: ' <a class="file" href="' + output_url + '" download>Download File</a> '
								});
							}
						});
						
					};
				reader.readAsBinaryString(fY);
			}
		}
	},
	template: `
		<div>
			<editor-nav v-on:publish="publish" v-on:save="save" :user-info="userInfo">
				<span slot="status">{{status}}</span>
			</editor-nav>
			<section class="section">
				<div class="columns is-centered">
					<div class="column is-three-quarters-tablet is-half-desktop">
						<small>Note: Make sure the editor is in focus <em>before</em> selecting a photo to upload.</small>
						<div class="file is-info" style="margin-bottom: 30px; margin-top: 5px;">
							<label class="file-label">
								<input class="file-input" type="file" accept="image/*,audio/*,video/*" id="imageUpload" v-on:change="uploadFile()">
								<span class="file-cta">
									<span class="file-icon">
										<i class="fa fa-upload"></i>
									</span>
									<span class="file-label">Upload a File...</span>
								</span>
							</label>
						</div>
						<input class="input title" type="text" placeholder="Title" style="border: none; border-left: 1px solid #CCCCCC; background: inherit; box-shadow: none;" v-model="title">
						<!--<textarea class="textarea" style="border: none; background: inherit; box-shadow: none;"></textarea>-->
						<div class="editable custom-content"></div>
					</div>
				</div>
			</section>
		</div>
		`
}

Vue.component("editor-nav", {
	props: ["value", "userInfo", "storyLanguage"],
	data: function() {
		return {
			tags: "",
			description: "",
			language: ""
		}
	},
	mounted: function() {
		this.$parent.$on("setDefaults", this.setDefaults);
	},
	methods: {
		publish: function() {
			this.$emit("publish", this.tags, this.description, this.language);
		},
		save: function() {
			this.$emit("save", this.tags, this.description, this.language);
		},
		setDefaults: function(tags, description) {
			this.tags = tags;
			this.description = description;
		},
	},
	computed: {
		getUserDefaultLanguage: function() {
			if (!this.userInfo || !this.userInfo.keyvalue) {
				return "";
			}

			return this.userInfo.keyvalue.languages.split(",")[0];
		},
		getLanguages: function() {
			if (!this.userInfo || !this.userInfo.keyvalue) {
				return [];
			}
			
			var userLanguages = this.userInfo.keyvalue.languages.split(",");
			var returnLanguages = [];

			for (var i = 0; i < userLanguages.length; i++) {
				returnLanguages.push({
					code: userLanguages[i],
					name: page.languageNameFromCode(userLanguages[i])
				});
			}

			return returnLanguages;
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
	                		<div class="navbar-item has-dropdown is-hoverable">
	                			<a class="navbar-link">Publish</a>
	                			<div class="navbar-dropdown is-right" style="width: 300px;">
	                				<div class="dropdown-item">
	                					<textarea class="textarea" rows="2" style="min-height: 50px;" placeholder="Tags" v-model="tags"></textarea>
	                				</div>
	                				<div class="dropdown-item">
	                					<textarea class="textarea" rows="2" style="min-height: 50px;" placeholder="Description" v-model="description"></textarea>
	                				</div>
	                				<div class="dropdown-item">
	                					<div class="select" style="width: 100%;">
		                					<select v-model="language" style="width: 100%;">
		                						<option value="">{{ storyLanguage && storyLanguage != '' ? 'Current (' + storyLanguage + ')' : 'Default (' + getUserDefaultLanguage + ')' }}</option>
		                						<option v-for="language in getLanguages" :key="language.code" :value="language.code">{{ language.code }} - {{ language.name }}</option>
		                					</select>
		                				</div>
	                				</div>
	                				<div class="dropdown-item">
	                					<a class="button is-success is-outlined is-small" v-on:click.prevent="publish">Publish</a>
	                				</div>
	            				</div>
	            			</div>
	                	</div>
	                </div>
	            </div>
	        </div>
	        <div class="columns is-centered is-hidden-desktop">
				<div class="column is-three-quarters-tablet is-half-desktop" style="margin-top: 20px;">
	        		<a class="button is-outlined is-info is-small" v-on:click.prevent="save">Save Draft</a>
					<div class="dropdown is-hoverable">
						<div class="dropdown-trigger">
							<button class="button is-primary is-outlined is-small" aria-haspopup="true" aria-controls="dropdown-menu-publish-mobile">
								Publish 
								<span class="icon is-small">
									<i class="fa fa-angle-down" aria-hidden="true"></i>
							  	</span>
							</button>
						</div>
            			<div class="dropdown-menu" id="dropdown-menu4" role="menu">
    						<div class="dropdown-content">
	            				<div class="dropdown-item">
	            					<textarea class="textarea" rows="2" style="min-height: 50px;" placeholder="Tags" v-model="tags"></textarea>
	            				</div>
	            				<div class="dropdown-item">
	            					<textarea class="textarea" rows="2" style="min-height: 50px;" placeholder="Description" v-model="description"></textarea>
	            				</div>
                				<div class="dropdown-item">
                					<div class="select" style="width: 100%;">
	                					<select v-model="language" style="width: 100%;">
	                						<option value="">{{ storyLanguage && storyLanguage != '' ? 'Current (' + storyLanguage + ')' : 'Default (' + getUserDefaultLanguage + ')' }}</option>
	                						<option v-for="language in getLanguages" :key="language.code" :value="language.code">{{ language.code }} - {{ language.name }}</option>
	                					</select>
	                				</div>
                				</div>
	            				<div class="dropdown-item">
	            					<a class="button is-success is-outlined is-small" v-on:click.prevent="publish">Publish</a>
	            				</div>
	            			</div>
        				</div>
        			</div>
				</div>
	        </div>
        </div>`
});

module.exports = Newstory;