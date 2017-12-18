// var Vue = require("vue/dist/vue.min.js");
var MediumEditor = require("medium-editor/dist/js/medium-editor");
var MediumEditorAutolist = require("../medium-editor-plugins/inline-markdown");
var Router = require("../router.js");
var moment = require('moment');
var { sanitizeStringForUrl, sanitizeStringForUrl_SQL, html_substr } = require('../util.js');

var ProfileStory = {
	props: ["userInfo"],
	data: function() {
		return {
			responseEditor: null,
			profileInfo: null,
			story: null,
			storyAuthor: "",
			sanitizedBody: "", // NOTE: Use this instead of story.body for security reasons - it's sanitized
			responses: [],
			claps: [],
			reponsePublishBtnDisabled: false
		}
	},
	beforeMount: function() {
		this.$emit("navbar-shadow-on");
		this.$emit("set-response-content", "");
		var that = this;

		page.getUserProfileInfo(Router.currentParams["userauthaddress"], false, false, (profileInfo) => {
			that.profileInfo = profileInfo;
			page.getStory(Router.currentParams["userauthaddress"], Router.currentParams["slug"], (story) => {
				that.story = story;
				that.storyAuthor = story.value;
				
				var newBody = page.sanitizeHtml(story.body);
				var re_image = /<img .*? \/>/ig;
				var m_image;
				var re_audio = /<audio .*?><\/audio>/ig;
				var m_audio;
				var re_video = /<video .*?><\/video>/ig;
				var m_video;

				var getInfo = (m) => {
					let re_src = /src=('|")(.*?)('|")/ig;
					let re_width = /width=('|")(.*?)('|")/ig;
					let re_height = /height=('|")(.*?)('|")/ig;
					
					let src = re_src.exec(m[0])[2];
					let width = re_width.exec(m[0]);

					if (width) {
						width = width[2];
					}
					let height = re_height.exec(m[0]);
					
					if (height) {
						height = height[2];
					}

					let width_int = 0;
					
					if (width) {
						width_int = parseInt(width);
					}
					let height_int = 0;
					
					if (height) {
						height_int = parseInt(height);
					}

					return [ src, width, height ];
				}

				// Get all images in the story's body
				do {
					m_image = re_image.exec(newBody);
					m_audio = re_audio.exec(newBody);
					m_video = re_video.exec(newBody);

					if (m_image) {
						// Get image's src, width, and height
						var [ imgSrc, imgWidth_int, imgHeight_int ] = getInfo(m_image);

						// Create the string for the placeholder box html
						let placeholderHtml = "";

						if (imgWidth_int === 0 && imgHeight_int === 0) {
							placeholderHtml = `<div id="${imgSrc}" onclick="page.showImage(this, '${imgSrc}', ${imgWidth_int}, ${imgHeight_int}); return false;" style="text-align: center; width: 100%; height: 30px; background-color: #555555; color: white; cursor: pointer;">Show Image</div>`;
						} else if (imgHeight_int === 0) {
							placeholderHtml = `<div id="${imgSrc}" onclick="page.showImage(this, '${imgSrc}', ${imgWidth_int}, ${imgHeight_int}); return false;" style="text-align: center; width: ${imgWidth_int}px; height: 30px; background-color: #555555; color: white; cursor: pointer;">Show Image</div>`;
						} else if (imgWidth_int === 0) {
							placeholderHtml = `<div id="${imgSrc}" onclick="page.showImage(this, '${imgSrc}', ${imgWidth_int}, ${imgHeight_int}); return false;" style="text-align: center; width: 100%; height: ${imgHeight_int}px; background-color: #555555; color: white; cursor: pointer;">Show Image</div>`;
						} else {
							placeholderHtml = `<div id="${imgSrc}" onclick="page.showImage(this, '${imgSrc}', ${imgWidth_int}, ${imgHeight_int}); return false;" style="text-align: center; width: ${imgWidth_int}px; height: ${imgHeight_int}px; background-color: #555555; color: white; cursor: pointer;">Show Image</div>`;
						}

						let inner_path = imgSrc.replace(/(http:\/\/)?127.0.0.1:43110\//, '').replace(/(https:\/\/)?127.0.0.1:43110\//, '').replace(/18GAQeWN4B7Uum6rvJL2zh9oe4VfcnTM18\//, '').replace(/1CVmbCKWtbskK2GAZLM6gnMuiL6Je25Yds\//, '').replace(/ZeroMedium.bit\//, '');
						
						page.cmd("optionalFileInfo", { "inner_path": inner_path.slice(1) }, (row) => {
							let imgContainer = document.getElementById(imgSrc);

							if (!row) {
								console.log("Cannot Find Image Info.");
								imgContainer.innerHTML = "Show Image";
							} else if (row.is_downloaded) {
								imgContainer.click();
							} else {
								imgContainer.innerHTML = "Show Image (peers: " + row.peer + ", size: " + row.size / 1000 + "KB)";
							}
						});

						// Replace the image tag with the placeholder html
						newBody = newBody.slice(0, m_image.index) + placeholderHtml + newBody.slice(m_image.index).replace(m_image[0], '');
					} else if (m_audio) {
						var [ src, width, height ] = getInfo(m_audio);

						let placeholderHtml = "";

						if (width === 0 && height === 0) {
							placeholderHtml = `<div id="${src}" onclick="page.showAudio(this, '${src}', ${width}, ${height}); return false;" style="text-align: center; width: 100%; height: 30px; background-color: #555555; color: white; cursor: pointer;">Show Audio</div>`;
						} else if (height === 0) {
							placeholderHtml = `<div id="${src}" onclick="page.showAudio(this, '${src}', ${width}, ${height}); return false;" style="text-align: center; width: ${width}px; height: 30px; background-color: #555555; color: white; cursor: pointer;">Show Audio/div>`;
						} else if (width === 0) {
							placeholderHtml = `<div id="${src}" onclick="page.showAudio(this, '${src}', ${width}, ${height}); return false;" style="text-align: center; width: 100%; height: ${height}px; background-color: #555555; color: white; cursor: pointer;">Show Audio</div>`;
						} else {
							placeholderHtml = `<div id="${src}" onclick="page.showAudio(this, '${src}', ${width}, ${height}); return false;" style="text-align: center; width: ${width}px; height: ${height}px; background-color: #555555; color: white; cursor: pointer;">Show Audio</div>`;
						}

						let inner_path = src.replace(/(http:\/\/)?127.0.0.1:43110\//, '').replace(/(https:\/\/)?127.0.0.1:43110\//, '').replace(/18GAQeWN4B7Uum6rvJL2zh9oe4VfcnTM18\//, '').replace(/1CVmbCKWtbskK2GAZLM6gnMuiL6Je25Yds\//, '').replace(/ZeroMedium.bit\//, '');

						page.cmd("optionalFileInfo", { "inner_path": inner_path.slice(1) }, (row) => {
							let container = document.getElementById(src);

							if (!row) {
								console.log("Cannot Find Audio Info");
								container.innerHTML = "Show Audio";
							} else if (row.is_downloaded) {
								container.click();
							} else {
								container.innerHTML = "Show Audio (peers: " + row.peer + ", size: " + row.size / 1000 + "KB)";
							}
						});

						// Replace the image tag with the placeholder html
						newBody = newBody.slice(0, m_audio.index) + placeholderHtml + newBody.slice(m_audio.index).replace(m_audio[0], '');
					} else if (m_video) {
						var [ src, width, height ] = getInfo(m_video);

						let placeholderHtml = "";

						if (width === 0 && height === 0) {
							placeholderHtml = `<div id="${src}" onclick="page.showVideo(this, '${src}', ${width}, ${height}); return false;" style="text-align: center; width: 100%; height: 30px; background-color: #555555; color: white; cursor: pointer;">Show Video</div>`;
						} else if (height === 0) {
							placeholderHtml = `<div id="${src}" onclick="page.showVideo(this, '${src}', ${width}, ${height}); return false;" style="text-align: center; width: ${width}px; height: 30px; background-color: #555555; color: white; cursor: pointer;">Show Video/div>`;
						} else if (width === 0) {
							placeholderHtml = `<div id="${src}" onclick="page.showVideo(this, '${src}', ${width}, ${height}); return false;" style="text-align: center; width: 100%; height: ${height}px; background-color: #555555; color: white; cursor: pointer;">Show Video</div>`;
						} else {
							placeholderHtml = `<div id="${src}" onclick="page.showVideo(this, '${src}', ${width}, ${height}); return false;" style="text-align: center; width: ${width}px; height: ${height}px; background-color: #555555; color: white; cursor: pointer;">Show Video</div>`;
						}

						let inner_path = src.replace(/(http:\/\/)?127.0.0.1:43110\//, '').replace(/(https:\/\/)?127.0.0.1:43110\//, '').replace(/18GAQeWN4B7Uum6rvJL2zh9oe4VfcnTM18\//, '').replace(/1CVmbCKWtbskK2GAZLM6gnMuiL6Je25Yds\//, '').replace(/ZeroMedium.bit\//, '');

						page.cmd("optionalFileInfo", { "inner_path": inner_path.slice(1) }, (row) => {
							let container = document.getElementById(src);

							if (!row) {
								console.log("Cannot Find Video Info");
								container.innerHTML = "Show Video";
							} else if (row.is_downloaded) {
								container.click();
							} else {
								container.innerHTML = "Show Video (peers: " + row.peer + ", size: " + row.size / 1000 + "KB)";
							}
						});

						// Replace the image tag with the placeholder html
						newBody = newBody.slice(0, m_video.index) + placeholderHtml + newBody.slice(m_video.index).replace(m_video[0], '');
					}
				} while (m_image || m_audio || m_video);

				that.sanitizedBody = newBody;

				page.getResponses(that.profileInfo.auth_address, that.story.story_id, "s", (responses) => {
					that.responses = responses;
					that.getClaps();
				});
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
	},
	methods: {
		getClaps: function() {
			var that = this;

			page.getClaps(that.profileInfo.auth_address, that.story.story_id, "s", (claps) => {
				that.claps = claps;
			});
		},
		getTagSlug(tag) {
			return tag.replace(/ /, "-");
		},
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
			page.postResponse(this.profileInfo.auth_address, this.story.story_id, 's', this.responseEditor.getContent(), function() {
				// Get the responses again.
				page.getResponses(that.profileInfo.auth_address, that.story.story_id, "s", (responses) => {
					that.responses = responses;
					that.responseEditor.resetContent();
					that.reponsePublishBtnDisabled = false;
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
			this.$emit("set-response-content", this.responseEditor.getContent());
			this.goto(this.profileInfo.auth_address + "/" + this.story.slug + "/response");
		}
	},
	computed: {
		getTags: function() {
			return this.story.tags.split(",").map(function(tag) {
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
				var clap_auth_address = clap.directory.replace(/users\//, "").replace(/\//g, "");
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
							<p class="title is-3">{{ story.title.trim() !== "" ? story.title : "[NO TITLE]" }}</p>
							<p class="subtitle is-5">By <a :href="'./?/' + profileInfo.auth_address" v-on:click.prevent="goto(profileInfo.auth_address)">{{ storyAuthor }}</a> - {{ datePosted(story.date_added) }}</p>
							<div id="storyBody" class="custom-content" v-html="sanitizedBody"></div>
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
								<a v-on:click.prevent="postResponse()" class="button is-primary is-small is-outlined" :disabled="reponsePublishBtnDisabled">Publish</a>
								<a v-on:click.prevent="responseFullscreen()" class="button is-info is-small is-outlined">Fullscreen</a>
							</div>
							<response v-for="response in responses" :key="response.response_id" v-bind:response="response" v-bind:show-name="true" v-bind:show-reference="false"></response>
						</div>
					</div>
				</div>
			</section>
		</div>
		`
};

module.exports = ProfileStory;