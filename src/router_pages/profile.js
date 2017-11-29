var Vue = require("vue/dist/vue.min.js");
var Router = require("../router.js");
var { sanitizeStringForUrl, sanitizeStringForUrl_SQL, html_substr, stripHTML_SQL } = require("../util.js");
var { cache_add, cache_replace, cache_remove, cache_get, cache_getOrAdd, cache_exists, cache_clear } = require("../cache.js");
// var moment = require("moment");

var Profile = {
	props: ["userInfo"],
	data: function() {
		return {
			profileInfo: {},
			claps: [],
			currentTab: 0,
			followText: "Follow"
		}
	},
	beforeMount: function() {
		this.$emit("navbar-shadow-off");
		var that = this;
		if (this.userInfo && this.userInfo.auth_address === Router.currentParams["userauthaddress"]) {
			var userProfileInfo = cache_get("user_profileInfo");
			var userClaps = cache_get("user_claps");

			if (userProfileInfo) {
				that.profileInfo = userProfileInfo;
			}

			if (userClaps) {
				that.claps = userClaps;
			}
		}
		page.getUserProfileInfo(Router.currentParams["userauthaddress"], true, true, (profileInfo) => {
			that.profileInfo = profileInfo;
			if (that.userInfo && that.userInfo.auth_address === Router.currentParams["userauthaddress"]) {
				cache_add("user_profileInfo", profileInfo);
			}
			that.isFollowing();
			page.getUserClaps(Router.currentParams["userauthaddress"], (claps) => {
				that.claps = claps;
				if (that.userInfo && that.userInfo.auth_address == Router.currentParams["userauthaddress"]) {
					cache_add("user_claps", claps);
				}
			});
		});
	},
	methods: {
		goto: function(to) {
			Router.navigate(to);
		},
		limitStories: function(limit) { // Returns list of stories limited to 'limit'
			var stories = [];
			if (!this.profileInfo.stories) {
				return stories;
			}
			for (var i = 0; i < limit && i < this.profileInfo.stories.length; i++) {
				stories.push(this.profileInfo.stories[i]);
			}
			return stories;
		},
		limitResponses: function(limit) { // Returns list of responses limited to 'limit'
			var responses = [];

			if (!this.profileInfo.responses) return responses;
			for (var i = 0; i < limit && i < this.profileInfo.responses.length; i++) {
				responses.push(this.profileInfo.responses[i]);
			}
			return responses;
		},
		limitClaps: function(limit) { // Returns list of claps limited to 'limit'
			var claps = [];

			if (!this.claps) return claps;
			for (var i = 0; i < limit && i < this.claps.length; i++) {
				claps.push(this.claps[i]);
			}
			return claps;
		},
		isFollowing: function() {
			var that = this;
			page.cmd("feedListFollow", [], (followList) => {
				if (followList[that.profileInfo.auth_address + "_stories"]) {
					that.followText = "Following";
				} else {
					that.followText = "Follow";
				}
			});
		},
		follow: function() {
			var that = this;
			page.cmd("feedListFollow", [], (followList) => {
				var query = "SELECT stories.story_id AS event_uri, 'article' AS type, stories.date_added AS date_added, '" + that.profileInfo.name + ": ' || stories.title AS title, " + stripHTML_SQL("stories.body") + " AS body, '?/" + that.profileInfo.auth_address + "/' || stories.slug AS url FROM stories LEFT JOIN json USING (json_id) WHERE json.directory='users/" + that.profileInfo.auth_address + "'";
				var queryResponses = "SELECT responses.response_id AS event_uri, 'article' AS type, responses.date_added AS date_added, '" + that.profileInfo.name + ": Response' AS title, " + stripHTML_SQL("responses.body") + " AS body, '?/" + that.profileInfo.auth_address + "/response/' || responses.response_id AS url FROM responses LEFT JOIN json USING (json_id) WHERE json.directory='users/" + that.profileInfo.auth_address + "'";
				var params = "";
				var paramsResponses = "";
				var newList = followList;
				if (followList[that.profileInfo.auth_address + "_stories"] || followList[that.profileInfo.auth_address + "_responses"]) {
					delete newList[that.profileInfo.auth_address + "_stories"];
					delete newList[that.profileInfo.auth_address + "_responses"];
					that.followText = "Follow";
				} else {
					newList[that.profileInfo.auth_address + "_stories"] = [query, params];
					newList[that.profileInfo.auth_address + "_responses"] = [queryResponses, paramsResponses];
					that.followText = "Following";
				}
				page.cmd("feedFollow", [newList]);
			});
		},
		mute: function() {
			var that = this;
			page.cmd("muteAdd", [this.profileInfo.auth_address, this.profileInfo.cert_user_id, ""], () => {
				Router.navigate('');
			});
		}
	},
	template: `
		<div>
			<profile-hero :user-info="userInfo" :name="profileInfo.name" :about="profileInfo.about" :cert-user-id="profileInfo.cert_user_id" :auth-address="profileInfo.auth_address" :follow-text="followText" v-on:follow="follow" v-on:mute="mute"></profile-hero>
			<profile-navbar v-model="currentTab"></profile-navbar>
			<section class="section">
				<div class="columns is-centered" v-if="profileInfo">
					<div class="column is-three-quarters-tablet is-three-quarters-desktop" v-if="currentTab==0">
						<p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Latest</p>
						<story v-for="story in limitStories(3)" :key="story.story_id" :story="story" :show-name="false"></story>

						<p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Responses</p>
						<response v-for="response in limitResponses(4)" :key="response.response_id" v-bind:response="response" v-bind:show-name="false" v-bind:show-reference="true" v-bind:shorten="true">
							<p style="margin-bottom: 20px;"><strong>{{ profileInfo.name }}</strong></p>
						</response>

						<p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Claps</p>
						<story v-for="clap in limitClaps(5)" v-if="claps && clap.story" :key="clap.story.story_id" :story="clap.story" :show-name="true"></story>
					</div>

					<div class="column is-three-quarters-tablet is-three-quarters-desktop" v-if="currentTab==1 && profileInfo.stories">
						<p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Stories</p>
						<story v-for="story in profileInfo.stories" :key="story.story_id" :story="story" :show-name="false"></story>
					</div>

					<div class="column is-three-quarters-tablet is-three-quarters-desktop" v-if="currentTab==2 && profileInfo.responses">
						<p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Responses</p>
						<response v-for="response in profileInfo.responses" :key="response.response_id" v-bind:response="response" v-bind:show-name="false" v-bind:show-reference="true" v-bind:shorten="true">
							<p style="margin-bottom: 20px;"><strong>{{ profileInfo.name }}</strong></p>
						</response>
					</div>

					<div class="column is-three-quarters-tablet is-three-quarters-desktop" v-if="currentTab==3 && claps">
						<p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Claps</p>
						<story v-for="clap in claps" v-if="clap.story" :key="clap.story.story_id" :story="clap.story" :show-name="true"></story>
					</div>
				</div>
			</section>
		</div>
		`
}

Vue.component("profile-hero", {
	props: ["userInfo", "name", "about", "certUserId", "authAddress", "followText"],
	methods: {
		follow: function() {
			this.$emit("follow");
		},
		mute: function() {
			this.$emit("mute");
		}
	},
    template: `
        <div class="hero" style="border-top: 1px solid rgba(0,0,0,.05);">
            <div class="container">
                <div class="hero-body">
                    <span class="title">{{ name }}</span><br>
                    <span class="subtitle">{{ certUserId }}</span><br>
                    <p v-if="authAddress" style="margin-top: 5px;">Donate: <a :href="'bitcoin:' + authAddress + '?message=Donation to ' + name">{{ authAddress }}</a></p>
                    <p style="margin-top: 5px; margin-bottom: 15px;">{{ about }}</p>
                    <a class="button is-success is-small" :class="{ 'is-outlined': followText == 'Follow' }" v-on:click.prevent="follow()">{{ followText }}</a>
                    <a class="button is-danger is-small" v-on:click.prevent="mute()" v-if="userInfo && userInfo.auth_address != authAddress">Mute</a>
                </div>
            </div>
        </div>
        `
});

Vue.component("profile-navbar", {
	props: ['value'],
	methods: {
		setTab: function(i) {
			this.$emit("input", i);
		}
	},
	template: `
		<div class="navbar is-transparent has-shadow" style="border-top: 1px solid rgba(0,0,0,.05);">
			<div class="container">
			    <div class="navbar-brand" style="overflow-x: hidden;">
			        <a class="navbar-item is-tab" :class="{ 'is-active': value==0 }" v-on:click.prevent="setTab(0)">Profile</a>
			        <a class="navbar-item is-tab" :class="{ 'is-active': value==1 }" v-on:click.prevent="setTab(1)">Stories</a>
			        <!--<a class="navbar-item is-tab">Highlights</a>--> <!-- TODO: FUTURE -->
			        <a class="navbar-item is-tab" :class="{ 'is-active': value==2 }" v-on:click.prevent="setTab(2)">Responses</a>
			        <a class="navbar-item is-tab" :class="{ 'is-active': value==3 }" v-on:click.prevent="setTab(3)">Claps</a>
			    </div>
			</div>
		</div>
		`
});

module.exports = Profile;