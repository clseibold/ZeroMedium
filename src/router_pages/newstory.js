var Vue = require("vue/dist/vue.min.js");
var MediumEditor = require("medium-editor/dist/js/medium-editor");
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
		this.editor = new MediumEditor('.editable', {
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