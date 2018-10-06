// Debug Levels: // TODO: Add warning between info and error
// * info - errors and things like user not being logged in when trying to post an object, for example
// * error - major errors

var ZeroGraph = (zeroframe, debugLevel = "info") => {
	return {
		printDebug: function(level, message) { // Internal Usage
			if (level === "info") {
				if (debugLevel === "info") {
					console.log("[ZeroGraph.js] " + level + ": " + message);
				}
			} else if (level === "error") {
				if (debugLevel === "info" || debugLevel === "error") {
					console.log("[ZeroGraph.js] " + level + ": " + message);
				}
			}
		},
		addMerger: function(cb = null) {
			var that = this;
			zeroframe.cmd("mergerSiteList", [false], (merger_sites) => {
				if (merger_sites["1Q5gKHs3v6GBJRisQCJVCqXeoyii31mqCs"]) {
					that.printDebug("info", "ZeroGraph already downloaded.");
					if (cb != null && typeof cb == 'function') cb();
					return;
				}
				zeroframe.cmd("mergerSiteAdd", ["1Q5gKHs3v6GBJRisQCJVCqXeoyii31mqCs"], cb);
			});
		},
		requestPermission: function(site_info, cb = null) {
			if (site_info.settings.permissions.includes("Merger:ZeroGraph")) {
				this.printDebug("info", "ZeroGraph already given permission!");
				if (cb != null && typeof cb == 'function') cb();
				return;
			}

			zeroframe.cmd("wrapperPermissionAdd", ["Merger:ZeroGraph"], cb);
		},
		removeMerger: function(cb) {
			zeroframe.cmd("mergerSiteDelete", ["1Q5gKHs3v6GBJRisQCJVCqXeoyii31mqCs"], cb)
		},
		createZiteTypeObject: function(creator) { // TODO: Check that creator isn't empty
			return {
				"type": "zite",
				"creator": creator
			};
		},
		createArticleTypeObject: function(author) { // TODO: Check that author isn't empty
			return {
				"type": "article",
				"author": author
			};
		},
		// Returns the newly added object's share url (of the form 'zerograph://auth_address/date')
		// TODO: Check that required fields aren't empty
		postObject(cert_user_id, auth_address, title, type_object, url, zitename, description, locale, cb = null) {
			if (!cert_user_id) {
				this.printDebug("error", "User not logged in!"); // TODO: Make this warning instead
				return;
			}

			if (!type_object["type"]) {
				this.printDebug("error", "No type field in type object!");
				return;
			}

			// TODO: make sure merger site is added and given permission!

			var data_inner_path = "merged-ZeroGraph/1Q5gKHs3v6GBJRisQCJVCqXeoyii31mqCs/data/users/" + auth_address + "/data.json";
			var content_inner_path = "merged-ZeroGraph/1Q5gKHs3v6GBJRisQCJVCqXeoyii31mqCs/data/users/" + auth_address + "/content.json";

			zeroframe.cmd("fileGet", { "inner_path": data_inner_path, "required": false }, (data) => {
				data = JSON.parse(data);
				if (!data) {
					data = {
						"objects": []
					};
				}

				if (!data["objects"]) data["objects"] = [];

				var type_object_string = unescape(encodeURIComponent(JSON.stringify(type_object, undefined, ' ')));
				var date = Date.now();

				data["objects"].push({
					"title": title,
					"type": type_object_string,
					"url": url,
					"zite_name": zitename,
					"description": description,
					"locale": locale,
					"date_added": date
				});

				var json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, "\t")));
				var object_share_url = "zerograph://" + auth_address + "/" + date;

				page.cmd("fileWrite", [data_inner_path, btoa(json_raw)], (res) => {
				    if (res === "ok") {
				        page.cmd("siteSign", { "inner_path": content_inner_path }, () => {
				            if (cb != null && typeof cb === "function") {
				            	cb(object_share_url);
				            }
				            page.cmd("sitePublish", { "inner_path": content_inner_path, "sign": false });
				        });
				    }
				});
			});
		},
		getAllObjects: function(cb) {
			zeroframe.cmd("dbQuery", ["SELECT * FROM objects LEFT JOIN json USING (json_id)"], cb);
		},
		// Share url of the form zerograph://auth_address/date
		getObject: function(object_share_url, cb) {
			// TODO: make sure merger site is added and given permission
			object_share_url = object_share_url.replace(/zerograph:\/\//, '').split('/');
			var auth_address = object_share_url[0];
			var date = object_share_url[1];
			zeroframe.cmd("dbQuery", ['SELECT * FROM objects LEFT JOIN json USING (json_id) WHERE directory="data/users/' + auth_address + '" AND date_added=' + date + ' LIMIT 1'], (objects) => {
				console.log(objects);
				var object = JSON.parse(objects[0].type);

				object["title"] = objects[0].title;
				object["url"] = objects[0].url;
				object["zite_name"] = objects[0].zite_name;
				object["locale"] = objects[0].locale;
				object["description"] = objects[0].description;
				object["date_added"] = objects[0].date_added;
				object["directory"] = objects[0].directory;
				object["json_id"] = objects[0].json_id;
				cb(object);
			});
		}
	};
}

module.exports = ZeroGraph;

// Include like this:
// 
// var ZeroGraph = require('ZeroGraph.js')(zeroframeVariable, debugTrueOrFalse);