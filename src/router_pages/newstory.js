var Vue = require("vue/dist/vue.min.js");
var MediumEditor = require("medium-editor/dist/js/medium-editor");
var Router = require("../router.js");
var { sanitizeStringForUrl } = require("../util.js");

var Newstory = {
	props: ["userInfo"],
	data: function() {
		return {
			editor: null,
			title: '',
			status: 'Unsaved changes'
		}
	},
	beforeMount: function() {
		this.$emit('navbar-shadow-off');
	},
	mounted: function() {
		this.editor = new MediumEditor('.editable', {
			placeholder: {
				text: "Tell your story...",
				hideOnClick: true
			}
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
			console.log("save");
		}
	},
	template: `
		<div>
			<editor-nav v-on:publish="publish" v-on:save="save">
				<span slot="status">{{status}}</span>
			</editor-nav>
			<section class="section">
				<div class="container">
					<input class="input title" type="text" placeholder="Title" style="border: none; border-left: 1px solid #CCCCCC; background: inherit; box-shadow: none;" v-model="title">
					<!--<textarea class="textarea" style="border: none; background: inherit; box-shadow: none;" placeholder="Tell your story..."></textarea>-->
					<div class="editable" placeholder="Tell your story..."></div>
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
                		<a class="navbar-item" v-on:click.prevent="save">Save</a>
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
        `
});

module.exports = Newstory;