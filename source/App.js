enyo.kind({
	name: "App",
	kind: "FittableColumns", 
	classes: "enyo-fit", 
	components: [
	// This is the main panel, that has all the other panels inside of it and allows the main panel to slide
	{kind: "Panels", name:"mainPanels", classes:"panels enyo-fit", arrangerKind: "CollapsingArranger", components: [
	// This is the secondary panel, the one that is on the far left that will house the buttons
	{kind: "Panels", name:"contentPanels", arrangerKind:"CollapsingArranger", draggable:false, classes:"panels enyo-fit",   style: "width: 20%;", onTransitionFinish: "contentTransitionComplete", components: [
			{kind: "FittableRows", components: [
			// This is the button that is at the top of the panel on the left of the page
			{kind: "onyx.Button", name: "testingButton", content: "Testing button", style: "width: 100%;", ontap: "testingButtonTap"},
			{fit: true},
			{fit: true, components: [
			// This is the toolbar that is at the bottom of the left panel
			{kind: "onyx.Toolbar", style: "height: 40px;"}
			]}
		]}
		]},
		// This is the MAIN panel, the one that will house all of the information
		{kind: "FittableRows", fit: true, components: [
			{fit: true, classes: "fittable-sample-fitting-color"},
			{fit: true, components: [
			// This is the toolbar on the main panel
			{kind: "onyx.Toolbar", style: "height: 40px;", ontap:"toggleFullScreen", components: [
				// This is the grabber for the main panel, to show that it can be colapsed. Though a tap anywhere will colapse the panel
				{kind: "onyx.Grabber"}
			]}
		]}
	]}
	]},	
],	
	create: function() {
		this.inherited(arguments);
	},
	// This is the function to toggle the colapse of the main panel
	toggleFullScreen: function() {
		this.$.mainPanels.setIndex(this.$.mainPanels.index ? 0 : 1);
	},
	// This is the function to toggle the content of the testingButton, obviously this isn't the final function of the button, but it's a start
	testingButtonTap: function() {
		this.$.testingButton.setContent("Testing Button was tapped!!!");
	},
});