var Vue = require("vue/dist/vue.min.js");
var Router = require("../router.js");
var { sanitizeStringForUrl, sanitizeStringForUrl_SQL, html_substr, stripHTML_SQL } = require("../util.js");

var MeSettings = {
	props: ['userInfo'],
	data: function() {
		return {
			name: this.userInfo ? this.userInfo.keyvalue.name : '',
			about: this.userInfo ? this.userInfo.keyvalue.about : '',
			followResponsesText: 'Follow'
		}
	},
	beforeMount: function() {
		this.$emit('navbar-shadow-on');
		if (!this.userInfo) {
			this.$emit('get-user-info');
			//this.name = this.userInfo.name;
			//this.about = this.userInfo.about;
		}
		this.isFollowingResponses();
	},
	mounted: function() {
		this.$parent.$on('setUserInfo', this.setUserInfo);
	},
	methods: {
		setUserInfo: function(userInfo) {
			this.name = userInfo.keyvalue.name;
			this.about = userInfo.keyvalue.about;
		},
		saveBasic: function() {
			page.unimplemented();
			if (!this.userInfo) return;
			var that = this;
			var data_inner_path = "data/users/" + this.userInfo.auth_address + "/data.json";
            var content_inner_path = "data/users/" + this.userInfo.auth_address + "/content.json";
            
            page.cmd("fileGet", {"inner_path": data_inner_path, "required": false}, (data) => {
                if (!data) {
                	page.cmd("wrapperNotification", ["error", "You must be signed in to save profile settings!"]);
                	return;
                }

                data = JSON.parse(data);

                data.about = that.about;

                var json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, '\t')));

                page.cmd("fileWrite", [data_inner_path, btoa(json_raw)], (res) => {
                    if (res == "ok") {
                        // Get user info again
                        page.cmd("siteSign", {"inner_path": content_inner_path}, (res) => {
                            page.cmd("wrapperNotification", ["error", "Please Refresh the page after publish!"]);
                            page.cmd("sitePublish", {"inner_path": content_inner_path, "sign": false}, () => {
                                that.$emit('get-user-info'); // TODO: Doesn't seem to be working
                            });
                        });
                    } else {
                        page.cmd("wrapperNotification", ["error", "File write error: #{res}"]);
                    }
                });
            });
		},
		isFollowingResponses: function() {
			var that = this;
			page.cmd("feedListFollow", [], (followList) => {
				if (followList["you_responses"]) {
					that.followResponsesText = "Following";
				} else {
					that.followResponsesText = "Follow";
				}
			});
		},
		followResponses: function() {
			var that = this;
			page.cmd("feedListFollow", [], (followList) => {
				var query = "SELECT responses.response_id AS event_uri, 'article' AS type, responses.date_added AS date_added, keyvalue.value || ': Response to your post' AS title, " + stripHTML_SQL('responses.body') + " AS body, '?/' || REPLACE(json.directory, 'users/', '') || '/response/' || responses.response_id AS url FROM responses LEFT JOIN json USING (json_id) LEFT JOIN keyvalue USING (json_id) WHERE responses.reference_auth_address='" + that.userInfo.auth_address + "' AND key='name'";
				var params = "";
				var newList = followList;
				if (followList["you_responses"]) {
					delete newList["you_responses"];
					that.followResponsesText = "Follow";
				} else {
					newList["you_responses"] = [query, params];
					that.followResponsesText = "Following";
				}
				page.cmd("feedFollow", [newList]);
			});
		}
	},
	template: `
		<div>
			<section class="section">
				<div class="columns is-centered">
					<div class="column is-three-quarters-tablet is-half-desktop">
						<h1>Settings</h1>
						
						<br>
						<h2>Basic</h2>
						<!--<div class="field">
						    <label class="label">Name</label>
						    <div class="control">
						        <input class="input" type="text" placeholder="Name" v-model="name">
						    </div>
						</div>-->

						<div class="field">
						    <label class="label">About</label>
						    <div class="control">
						        <textarea class="textarea" placeholder="About" v-model="about"></textarea>
						    </div>
						</div>

						<button class="button is-primary is-outlined" v-on:click.prevent="saveBasic()">Save</button>

						<br><br>
						<h2>Following</h2>
						<a v-on:click.prevent="followResponses()">
							<span v-show="followResponsesText == 'Following'" class="icon is-small">
							    <i class="fa fa-check" aria-hidden="true"></i>
							</span>
							{{ followResponsesText }} responses on your posts
						</a>
					</div>
				</div>
			</section>
		</div>
		`
};

module.exports = MeSettings;