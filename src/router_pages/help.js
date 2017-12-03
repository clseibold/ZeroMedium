// var Vue = require("vue/dist/vue.min.js");
// var Router = require("../router.js");

var Help = {
	props: ["userInfo"],
	beforeMount: function() {
		this.$emit("navbar-shadow-on");
	},
	template: `
		<div>
			<section class="section">
			    <div class="columns is-centered">
			        <div class="column is-three-quarters-tablet is-three-quarters-desktop">
			       		<div>
							<p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Navigation</p>
							<strong>Homepage</strong>
							<p>
								The homepage is the first thing you will see when you visit the zite. It brings the many navigational methods together to allow you to
								easily explore ZeroMedium. The first thing that should be noted is the list of topics at the top. You can click on any one of these
								to see the posts within those topics. This is useful for filtering out the types of posts you want to explore. Next is the Top Stories
								section. This lists the top stories for the current day. Top Stories are determined by the amount of responses and claps given to that
								post <em>during the current day</em> (not all-time). The final section is a list of the most recently posted stories.
							</p>
							<br>
							<p>
								Future updates will provide a better interface for logged-in users by integrating your interests into the homepage.
							</p>
							<br>
							<strong>Navbar</strong>
							<p>
								The navbar provides a means to explore the rest of the zite. It is most helpful for logged-in users. There are two slightly different
								views, one for mobile and one for desktop/laptop. The main difference between the two is that the navigational items are located under a
								menu denoted by 3 vertical lines stacked on top of each other. Click that menu button, and the menu appears with all of the items listed
								underneath the navbar. Click it again and the list disappears. On desktop, however, the majority of the items are located under a dropdown
								menu denoted by the currently logged-in user's name. If a user is not logged-in, the dropdown is replaced by a sign-in button.
							</p>
							<br>
							<p>
								The navigational items are listed in a particular order. The first 3 are items that allow you to manage posts within the zite. This includes
								stories and series'. The next two are things that are private, namely bookmarks and interests. The final four are items related to your profile,
								settings, help, and logout/switch user. These will probably be the least-used, and are therefore the last items listed.
							</p>
							<br>
							<strong>Managing Stories</strong>
							<p>
								The stories page, which you can get to by clicking stories in the dropdown menu, provides a way for you to see a list of all the stories you
								have posted and the ability to edit and delete them. To edit a story, click the dropdown array below the story (next to it's published date)
								and click 'Edit Story'. This is also where you can delete the story by clicking 'Delete Story'. You can go directly to the stories page by
								clicking on the story's title.
							</p>
						</div>

						<br>
						<div>
							<p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Profile</p>
							<p>
								Your profile is a means for your followers and others to explore all the stories, responses, and claps you have posted on ZeroMedium. It
								also gives them a means to know more about you through your About Me section and to donate to you using the Auth Address that was given to
								you by your ID Provider (i.e. ZeroId, KaffieId, CryptoId ...). Users are also provided an option to either start or stop following you. By
								following a user, they are able to see your stories and responses within the ZeroHello News Feed.
							</p>
							<br>
							<p>
								The first tab ('Profile') shows a limited view of the latest posts, responses, and claps the user has made. You can then click on any of
								the other tabs to see all posts of that respective type.
							</p>
						</div>

						<br>
						<div>
							<p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Story and Response Editor</p>
							<p>
								There are currently three different ways to edit text within a story or response. This section will talk about two of them, using the menu bar
								and using keyboard shortcuts.
							</p>
							<br>
							<strong>Using The Menu Bar</strong>
							<p>
								For people who prefer to highlight text and click a button to change the formatting of the text, there is a menu bar, much like Medium.com's,
								that allows you to do so. The menu bar doesn't appear until you have selected text that you want to modify. However, it should be noted that
								not all of the supported text formatting features are listed in this bar. To utilize these features, you must use keyboard shortcuts (or
								inline markdown, which will be discussed in the next section).
							</p>
							<br>
							<strong>Using Keyboard Shortcuts</strong>
							<p>
								Keyboard Shortcuts have been provided for people who do not like to use the mouse and for times when you have to quickly type something up.
								Here is a full list of all available keyboard shortcuts within the story and response editors:
								<br><br>
								<ul>
									<li><strong>Ctrl-B</strong> - Bold</li>
									<li><strong>Ctrl-I</strong> - Italic</li>
									<li><strong>Ctrl-U</strong> - Underline</li>
									<li><strong>Ctrl-2</strong> - Heading (technically h2)</li>
									<li><strong>Ctrl-3</strong> - Heading 2 (technically h3)</li>
									<li><strong>Ctrl-Q</strong> - Blockquote</li>
									<li><strong>Ctrl-S</strong> - Strikethrough</li>
									<li><strong>Ctrl-6</strong> - Subscript</li>
									<li><strong>Ctrl-Shift-6</strong> - Superscript</li>
									<li><strong>Ctrl-8</strong> - Ordered List (numbered list)</li>
									<li><strong>Ctrl-Shift-8</strong> - Unordered List (bulleted list)</li>
									<li><strong>Ctrl-H</strong> - Horizontal Rule/Line</li>
									<li><strong>Ctrl-E</strong> - Justify Center</li>
									<li><strong>Ctrl-L</strong> - Justify Left</li>
									<li><strong>Ctrl-R</strong> - Justify Right</li>
									<li><strong>Ctrl-J</strong> - Full Justify</li>
								</ul>
							</p>
						</div>

						<br>
						<div>
							<p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Inline Markdown</p>
							<p>
								For people who like markdown, <em>some</em> inline markdown has been added. It should be noted that you must put a space after the markdown
								so that it is automatically converted to visual rich text form. Inline Markdown support will be improved in the future. Here is a list of the
								markdown that is currently supported:
								<br><br>
								<ul>
									<li><strong>**[text]** <em>or</em> __[text]__ </strong> - Bold</li>
									<li><strong>*[text]* <em>or</em> _[text]_ </strong> - Italics</li>
									<li><strong>~[text]~ <em>or</em> ~~[text]~~ </strong> - Strikethrough</li>
									<li><strong>* </strong> - Unordered/Bulleted List</li>
									<li><strong>[number]. </strong> - Ordered/Numbered List</li>
									<li><strong># <em>or</em> ## </strong> - Headings 1 and 2 (respectively)</li>
									<li><strong>&gt; </strong> - Blockquote</li>
									<li><strong>--- </strong> - Horizontal Rule/Line</li>
								</ul>
							</p>
							<br>
							<p>
								There are two other things that don't work so well right now: pasting in markdown and nested markdown. These will be fixed in the future.
							</p>
						</div>

						<br>
						<div>
							<p class="title is-4" style="border-bottom: 1px solid #AAAAAA; padding-bottom: 10px;">Managing Settings</p>
							<p>
								You can get to the settings page by clicking on the settings item in the dropdown. The only settings that are provided at this moment
								is the ability to change your profile's About Me section, and the ability to see any responses to your posts in the ZeroHello News Feed.
								It should be noted that the News Feed settings are client-specific; you must enable it on every client. It also default to disabled.
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
		`
};

module.exports = Help;