enyo.kind({
	name: "App",
	kind: "FittableColumns", 
	classes: "enyo-fit", 
	components: [
	{kind: "Panels", name:"mainPanels", classes:"panels enyo-fit", arrangerKind: "CollapsingArranger", components: [
	{kind: "Panels", name:"contentPanels", arrangerKind:"CollapsingArranger", draggable:false, classes:"panels enyo-fit",   style: "width: 20%;", onTransitionFinish: "contentTransitionComplete", components: [
			{kind: "FittableRows", components: [
			{fit: true,},
			{fit: true, components: [
			{kind: "onyx.Toolbar", style: "height: 40px;"}
			]}
		]}
		]},
		{kind: "FittableRows", fit: true, components: [
			{fit: true, classes: "fittable-sample-fitting-color"},
			{fit: true, components: [
			{kind: "onyx.Toolbar", style: "height: 40px;", ontap:"toggleFullScreen", components: [
				{kind: "onyx.Grabber"}
			]}
		]}
	]}
	]},	
],	
	create: function() {
		this.inherited(arguments);
	},
	toggleFullScreen: function() {
		this.$.mainPanels.setIndex(this.$.mainPanels.index ? 0 : 1);
	},
});