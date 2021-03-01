//------------------------------------------------------------------------------
// Copyright (c) 2004, 2007 IBM Corporation.  All Rights Reserved.
//------------------------------------------------------------------------------
// The sizer bar for the rmc.widget.SplitContainerEx widget.
//
// Author: Jinhua Xi

dojo.provide("rmc.widget.SplitSizer");

dojo.require("dojo.widget.*");
dojo.require("dojo.io.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.string");
dojo.require("dojo.string.extras");
dojo.require("dojo.html.style");

dojo.widget.defineWidget(
	"rmc.widget.SplitSizer",
	dojo.widget.HtmlWidget,
	{
		ns: "rmc",
		
		templatePath: dojo.uri.dojoUri("../rmc/widget/templates/SplitSizer.html"),
        templateCssPath: dojo.uri.dojoUri("../rmc/widget/templates/SplitSizer.css"),
		
		icon_handle_right: "rmc/widget/images/sash-chevron-right.gif",
		icon_handle_left: "rmc/widget/images/sash-chevron-left.gif",
		
		handleIcon: "rmc/widget/images/sash-chevron-left.gif",
		
		sizerNode: null,
		leftNode: null,
		rightNode: null,
		
		postCreate: function(args, frag, parentComp) {
			rmc.widget.SplitSizer.superclass.postCreate.apply(this, arguments);
		},
		
		destroy: function() {
			rmc.widget.SplitSizer.superclass.destroy.apply(this, arguments);
		},

		checkSize: function() {	
			rmc.widget.SplitSizer.superclass.checkSize.apply(this, arguments);
			
			// any better way to trigger a refresh???
			// need to do it for IE6 to refresh the layout after browser resizing
			this.switchBack();
			this.switchBack();
		},
				
		left: function() {
			this.leftNode.style.display = "block";
			this.rightNode.style.display = "none";
		},
		
		right: function() {
			this.leftNode.style.display = "none";
			this.rightNode.style.display = "block";
		},
		
		switchBack: function() {
			if (this.leftNode.style.display == "none") {
				this.left();
			} else {
				this.right();
			}
		},
		
 		__END: true
	}
);
