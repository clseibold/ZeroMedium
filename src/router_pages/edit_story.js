var Vue = require("vue/dist/vue.min.js");
var MediumEditor = require("medium-editor/dist/js/medium-editor");
var Router = require("../router.js");
var { sanitizeStringForUrl } = require("../util.js");

var EditStory = {
	props: ["userInfo"],
	data: function() {
		return {
			profileInfo: null,
			story: null,
			title: '',
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
				that.story = story;
				that.title = story.title;
				that.$emit('setDefaults', story.tags, story.description);
				that.createEditor();
			});
		},
		createEditor: function() {
			this.editor = new MediumEditor('.editable', {
				placeholder: {
					text: "Tell your story...",
					hideOnClick: true
				},
				toolbar: {
					buttons: ['bold', 'italic', 'underline', 'anchor', 'h2', 'h3', 'unorderedlist'] // Got rid of 'quote'
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
			    autoLink: true
			});
			this.editor.setContent(this.story.body);
		},
		publish: function(tags, description) {
			var that = this;
			page.editStory(this.story.story_id, this.title, description, this.editor.getContent(), tags, function() {
				Router.navigate(that.userInfo.auth_address + '/' + sanitizeStringForUrl(that.title));
			});
		},
		save: function(tags, description) {
		}
	},
	template: `
		<div>
			<editor-nav v-on:publish="publish" v-on:save="save">
				Edit
				<span slot="status">{{status}}</span>
			</editor-nav>
			<section class="section">
				<div class="columns is-centered">
					<div class="column is-three-quarters-tablet is-half-desktop">
						<input class="input title" type="text" placeholder="Title" style="border: none; border-left: 1px solid #CCCCCC; background: inherit; box-shadow: none;" v-model="title">
						<!--<textarea class="textarea" style="border: none; background: inherit; box-shadow: none;" placeholder="Tell your story..."></textarea>-->
						<div class="editable" placeholder="Tell your story..."></div>
					</div>
				</div>
			</section>
		</div>
		`
}

module.exports = EditStory;
