var Vue = require("vue/dist/vue.min.js");
var MediumEditor = require("medium-editor/dist/js/medium-editor");
var MediumEditorAutolist = require("../medium-editor-plugins/inline-markdown");
// Medium Editor Tables has problems with requirejs
// var MediumEditorTable = require("medium-editor-tables/dist/js/medium-editor-tables");
var Router = require("../router.js");
var { sanitizeStringForUrl } = require("../util.js");

var Newstory = {
	props: ["userInfo"],
	data: function() {
		return {
			editor: null,
			title: '',
			status: 'Unsaved changes',
			mobileTags: '',
			mobileDescription: ''
		}
	},
	beforeMount: function() {
		this.$emit('navbar-shadow-off');
	},
	mounted: function() {
		var autolist = new MediumEditorAutolist();
		this.editor = new MediumEditor('.editable', {
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
	},
	methods: {
		publish: function(tags, description) {
			var that = this;
			page.postStory(this.title, description, this.editor.getContent(), tags, function() {
				Router.navigate(that.userInfo.auth_address + '/' + sanitizeStringForUrl(that.title));
			});
		},
		save: function(tags, description) {
			page.unimplemented();
		},
		uploadImage: function() {
			if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
				alert('The File APIs are not fully supported in this browser.');
				return;
			}

			var that = this;
			var imageUpload = document.getElementById('imageUpload');
			var files = imageUpload.files;
			if (!files) return;

			for (let fX in files) {
				let fY = files[fX];
				console.log(fX, fY);

				if (!fY || typeof fY !== 'object' || !fY.type.match('(image)\/(png|jpg|jpeg|gif)|(audio)\/(mp3|ogg)|(video)\/(ogg|mp4)')) // |audio|video      || !fY.name.match(/\.IMAGETYPE$/gm)
					continue;

				let reader = new FileReader();
				reader.onload = function(event) {
						console.log("Reading ", fY, "with event ", event);

						var f_data = btoa(event.target.result);

						var data_inner_path = "data/users/" + page.site_info.auth_address + "/data.json";
						var content_inner_path = "data/users/" + page.site_info.auth_address + "/content.json";

						// Verify that user has correct "optional" and "ignore" values
						page.checkOptional(false, function() {
							page.cmd("fileGet", { "inner_path": data_inner_path, "required": false }, (data) => {
								if (!data) {
									//page.cmd("wrapperNotification");
									return; // ERROR
								}

								data = JSON.parse(data);

								if (!data["images"]) {
									data["images"] = [];
								}

								data["images"].push({
									"file_name": fY.name,
									"date_added": Date.now()
								});

								var f_path = "data/users/" + page.site_info.auth_address + "/" + fY.name;

								var json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, '\t')));

								// Write image to disk
								page.cmd("fileWrite", [f_path, f_data], (res) => {
									if (res == "ok") {
										imageUpload.value = null;
										/* if (imageUpload.value) {
											imageUpload.parentNode.replaceChild(imageUpload.cloneNode(true), imageUpload)
										}*/

										// Write data to disk
										page.cmd("fileWrite", [data_inner_path, btoa(json_raw)], (res) => {
											if (res == "ok") {
												var output_url = "/" + page.site_info.address + "/" + f_path;
												// Add to Medium-editor
												that.editor.execAction('insertImage', {
													value: output_url
												});

												// NOTE: Disabled signing and publishing because publishing the story will do this.
												// Sign and Publish file
												/*page.cmd('siteSign', {"inner_path": content_inner_path}, (res) => {
												    //if (f != null && typeof f == 'function') f();
												    page.cmd('sitePublish', {"inner_path": content_inner_path, "sign": false});
												});*/
											} else {
												page.cmd("wrapperNotification", ["error", "File write error: " + JSON.stringify(res)]);
											}
										});
									} else {
										page.cmd("wrapperNotification", [
                                                "error", "Image-File write error: " + JSON.stringify(res)
										]);
									}
								});
							});
						});
						
					};
				reader.readAsBinaryString(fY);
			}
		}
	},
	template: `
		<div>
			<editor-nav v-on:publish="publish" v-on:save="save">
				<span slot="status">{{status}}</span>
			</editor-nav>
			<section class="section">
				<div class="columns is-centered">
					<div class="column is-three-quarters-tablet is-half-desktop">
						<input type="file" accept="image/*" id="imageUpload">
						<button class="button is-info" v-on:click.prevent="uploadImage()">Upload Image</button>
						<input class="input title" type="text" placeholder="Title" style="border: none; border-left: 1px solid #CCCCCC; background: inherit; box-shadow: none;" v-model="title">
						<!--<textarea class="textarea" style="border: none; background: inherit; box-shadow: none;"></textarea>-->
						<div class="editable custom-content"></div>
					</div>
				</div>
			</section>
		</div>
		`
}

Vue.component('editor-nav', {
	props: ['value'],
	data: function() {
		return {
			tags: '',
			description: ''
		}
	},
	mounted: function() {
		this.$parent.$on('setDefaults', this.setDefaults);
	},
	methods: {
		publish: function() {
			this.$emit('publish', this.tags, this.description);
		},
		save: function() {
			this.$emit('save', this.tags, this.description);
		},
		setDefaults: function(tags, description) {
			this.tags = tags;
			this.description = description;
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