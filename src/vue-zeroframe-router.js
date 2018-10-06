//export default MyPlugin;

var Router = require("./router.js");

const VueRouteLink =  {
	props: ["to"],
	template: '<a v-bind:href="getHref" v-on:click.prevent="goto" v-bind:class="{ \'is-active\': active }"><slot></slot></a>',
	methods: {
		goto: function() {
			Router.navigate(this.to);
		}
	},
	computed: {
		active: function() {
			if (Router.currentRoute === this.to) {
				return true;
			}
			return false;
		},
		getHref: function() { // Middle Click - open in new tab
			return "./?/" + this.to;
		}
	}
};

const VueZeroFrameRouter = {
	routes: null,
	install(Vue) {
		/*Vue.mixin({ // Inject stuff into all components
			mounted() {
				console.log('Mounted');
			}
		});*/
		Vue.component('route-link', VueRouteLink);
		/*Vue.mixin({
			beforeCreate() {
				if (options.zeroframe_router) {
					this.$zeroframe_router = options.zeroframe_router;
				} else if (options.parent && options.parent.$zeroframe_router) {
					this.$zeroframe_router = options.parent.$zeroframe_router;
				}
				registerInstance();
			}
		});*/
		//Vue.currentView = options.routes[0];
		/*Router.hooks({
			after: function(currentRoute, params) {
				vueInstance.currentView = 'route-' + currentRoute.replace(/:/g, '').replace(/\//g, '-');
				if (currentRoute == '') {
					vueInstance.currentView = 'route-home';
				}
			}
		});*/


		//Router.init();
	}
};

function VueZeroFrameRouter_Init(vueInstance, routes) {
	VueZeroFrameRouter.routes = routes;
	for (var i = 0; i < routes.length; i++) {
		Router.add(routes[i].route, !routes[i].component.init ? function() {} : routes[i].component.init, {
			before: !routes[i].component.before ? function() { return true; } : routes[i].component.before,
			after: !routes[i].component.after ? function() {} : routes[i].component.after,
			leave: !routes[i].component.leave ? function() {} : routes[i].component.leave
		}, routes[i].component);
	}
	Router.vueInstance = vueInstance;
	Router.setView = function(route, object) {
		if (this.vueInstance.currentView == object) {
			/*var prevobj = object;
			object = Object.assign({route: route}, object)
			console.log(object == prevobj);*/
			vueInstance.$refs.view.$mount();
			vueInstance.$refs.view.$forceUpdate();
		} else {
			this.vueInstance.currentView = object;
		}
	}
	Router.init();
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
	  if ((new Date().getTime() - start) > milliseconds){
		break;
	  }
	}
  }

module.exports = {
	VueZeroFrameRouter: VueZeroFrameRouter,
	VueZeroFrameRouter_Init: VueZeroFrameRouter_Init
}