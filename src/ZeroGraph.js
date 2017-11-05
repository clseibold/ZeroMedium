var ZeroGraph = (zeroframe, debug = false) => {
	return {
		printDebug: function(message) { // Internal Ussage
			if (debug) {
				console.log("[ZeroGraph.js] " + message);
			}
		},
		addMerger: function(cb) {
			var that = this;
			zeroframe.cmd("mergerSiteList", [false], (merger_sites) => {
				if (merger_sites["1Q5gKHs3v6GBJRisQCJVCqXeoyii31mqCs"]) {
					that.printDebug("ZeroGraph already downloaded.");
					cb();
					return;
				}
				that.cmd("mergerSiteAdd", ["1Q5gKHs3v6GBJRisQCJVCqXeoyii31mqCs"], cb);
			});
		},
		requestPermission: function(site_info, cb) {
			if (site_info.settings.permissions.includes("Merger:ZeroGraph")) {
				this.printDebug("ZeroGraph already given permission!");
				cb();
				return;
			}

			zeroframe.cmd("wrapperPermissionAdd", ["Merger:ZeroGraph"], cb);
		},
		removeMerger: function(cb) {
			zeroframe.cmd("mergerSiteDelete", ["1Q5gKHs3v6GBJRisQCJVCqXeoyii31mqCs"], cb)
		}
	};
}

module.exports = ZeroGraph;

// Include like this:
// 
// var ZeroGraph = require('ZeroGraph.js')(zeroframeVariable, debugTrueOrFalse);