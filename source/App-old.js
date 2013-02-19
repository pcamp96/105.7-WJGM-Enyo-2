enyo.kind({
	name: "App",
	kind: "FittableRows",
	components:[
	{kind: "Panels", name:"mainPanels", classes:"panels enyo-fit", arrangerKind: "CollapsingArranger", components: [
			{kind: "ViewStack", name:"navPanels", onTransitionFinish:"navChanged", classes:"enyo-fit"},
			{kind: "Panels", name:"contentPanels", arrangerKind:"CollapsingArranger", draggable:false, classes:"panels enyo-fit", onTransitionFinish: "contentTransitionComplete", components: [
				{kind: "FittableRows", classes:"wide", components: [
					{kind:"Scroller", name:"sampleContent", horizontal: "hidden", fit:true, classes:"onyx enyo-unselectable"},
					{kind: "onyx.Toolbar", layoutKind:"FittableColumnsLayout", name:"viewSourceToolbar", noStretch: true, classes: "footer-toolbar", components: [
						{kind: "onyx.Grabber", ontap:"toggleFullScreen"},
						{fit:true}, // Spacer
						]},
					]}
				]}
			]}

	],
		create: function() {
		this.inherited(arguments);
		this.parseQueryString();
		window.onhashchange = enyo.bind(this, "hashChange");
		this.loadNavigation();
		this.resized();
	},

	loadNavigation: function() {
		// Remove all navigation views
		this.$.navPanels.popAll();
		// Get the sample manifest
		new enyo.Ajax({url: "assets/manifest.json"})
			.response(this, function(inSender, inSamples) {
				// This is the root of the sample tree
				this.navigation = inNavigation;
				this.navigation.isTop = true;
				// The path to find the JS/CSS source to display in the source viewer can
				// be specified in the manifest (or query string), which is useful when deploying
				var sourcePath = this.sourcePath || localStorage.getItem("sourcePath") || this.samples.sourcePath;
				if (sourcePath) {
					enyo.path.addPath("lib", sourcePath + "/lib");
					enyo.path.addPath("enyo", sourcePath + "/enyo");
				}
				// When using an explicit source path, we go ahead and
				// actually re-load the kind definitions from that location (tricky!)
				if (this.sourcePath || localStorage.getItem("sourcePath")) {
					this.loadSamplePackages(inSamples);
				}
				// We can specify additional sample manifests to add via a comma-separated
				// query string parameter which is stored in localStorage
				this.addNavigation = enyo.json.parse(localStorage.getItem("addNavigation"));
				this.loadAddNavigation();
			})
			.go();
	},

	loadAddNavigation: function() {
		if (this.addNavigation && this.addNavigation.length) {
			// Load any additional sample manifests one-by-one
			var addManifest = this.addNavigation.shift();
			new enyo.Ajax({url: addManifest})
				.response(this, function(inSender, inNavigation) {
					// To support manifests being on totally different servers, rewrite paths
					// relative to where this manifest lives
					var path = addManifest.substring(0, addManifest.lastIndexOf("/") + 1);
					this.aliasSamplePaths(inNavigation, path + inNavigation.sourcePath);
					// Additional sample manifests are pushed onto the end of the
					// master manifest list
					this.navigation.navigation.push(inNavigation);
					// Since the source for addSamples were not included in the app's package.js,
					// we need to runtime-load the source packages
					this.loadNavigationPackages(inNavigation);
					// Recurse, until the addSamples list is exhausted
					this.loadAddNavigation();
				})
				.error(this, function() {
					this.loadAddNavigation();
				})
				.go();
		} else {
			// All additional samples loaded; push the first sample menu
			this.pushNavigationList(this.navigation);
		}
	},
	loadNavigationPackages: function(inNavigation) {
		// Recurse over the samples tree and load the source for the samples
		if (inNavigation.loadNavigation) {
			var packages = inNavigation.loadPackages.split(" ");
			enyo.log("Loading " + packages);
			enyo.load(packages);
		}
		if (inNavigation.navigation) {
			for (var i in inNavigation.navigation) {
				this.loadNavigationPackages(inNavigation.navigation[i]);
			}
		}
	},


	rendered: function() {
		this.inherited(arguments);
	},

	pushNavigationList: function(inNavigation) {
		// Add a new NavigationList
		this.$.navPanels.pushView(
			{kind:"NavigationList",
				samples: inNavigation,
				onNavTap: "navTap",
				onNavBack: "navBack",
				onMenuAction: "handleMenuAction",
				version: this.versionContent},
			{owner:this}
		);
	},

	toggleFullScreen: function() {
		this.$.mainPanels.setIndex(this.$.mainPanels.index ? 0 : 1);
	},

	navTap: function(inSender, inEvent) {
		var navigation = inSender.navigation.navigation[inEvent.index];
		if (navigation.navigation) {
			this.pushNavigationList(navigation);
		}
		if (navigation.path) {
			this.renderNavigation(navigation);
		}
		if (!navigation.navigations && !navigations.path) {
			this.$.navigationContent.createComponent({content:"Sorry, no navigation yet for \"" + navigation.name + "\"."});
			this.$.navigationContent.render();
			// Advance to the sample panel
			if (enyo.Panels.isScreenNarrow()) {
				this.$.mainPanels.next();
			}
		}
	},

	renderSample: function(navigation) {
		// Create a new sample kind instance inside sampleContent
		this.resetNavigation();
		var kind = navigation.path.substring(navigation.path.lastIndexOf("/") + 1);
		var kindNamespace = navigation.ns || this.currNamespace;
		var path = navigation.path.substring(0, navigation.path.lastIndexOf("/") + 1);
		this.kind = kindNamespace + "." + kind;
		var instance = this.$.navigationContent.createComponent({kind:this.kind});
		window.navigation=instance;
		this.$.navigationContent.render();
		this.$.navigationContent.resized();
		// Load the source code for the sample
		this.externalURL = enyo.path.rewrite(navigation.path + ".html");
		if ((this.externalURL.indexOf("http") !== 0) || (this.externalURL.indexOf(window.location.origin) === 0)) {
			new enyo.Ajax({url: enyo.path.rewrite(navigation.path + ".js"), handleAs:"text"})
				.response(this, function(inSender, inSource) {
					this.jsSource = inSource;
					var components = this.getComponents();
					for(var i=0;i<components.length;i++) {
						if(components[i].name == "sourceViewer") {
							this.$.sourceViewer.jsSource = inSource;
							this.$.sourceViewer.jsSourceChanged();
							break;
						}
					}
				})
				.go();
			new enyo.Ajax({url: enyo.path.rewrite(path + (navigation.css || kind) + ".css"), handleAs:"text"})
				.response(this, function(inSender, inSource) {
					this.cssSource = inSource;
					var components = this.getComponents();
					for(var i=0, showingSource=false;i<components.length;i++) {
						if(components[i].name == "sourceViewer") {
							this.$.sourceViewer.cssSource = inSource;
							this.$.sourceViewer.cssSourceChanged();
							break;
						}
					}
				})
				.go();
		} else {
			this.$.jsContent.setContent("Sorry, the source for this sample is on a separate server and cannot be displayed due to cross-origin restrictions.");
			this.$.cssContent.setContent("Sorry, the source for this sample is on a separate server and cannot be displayed due to cross-origin restrictions.");
		}
		// Advance to the sample panel
		if (enyo.Panels.isScreenNarrow()) {
			this.$.mainPanels.next();
		}
		this.$.viewSourceToolbar.resized();
	},
});
