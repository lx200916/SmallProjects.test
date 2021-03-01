//------------------------------------------------------------------------------
// Copyright (c) 2004, 2007 IBM Corporation.  All Rights Reserved.
//------------------------------------------------------------------------------
// Extends the dojo.widget.ContentPane to provide additional customization.
//
// Author: Jinhua Xi

dojo.provide("rmc.widget.ContentPaneEx");

dojo.require("dojo.widget.*");
dojo.require("dojo.io.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.string");
dojo.require("dojo.string.extras");
dojo.require("dojo.html.style");

dojo.widget.defineWidget(
	"rmc.widget.ContentPaneEx",
	dojo.widget.ContentPane,
	{
		history: {
		},
		
		postCreate: function(args, frag, parentComp) {
			rmc.widget.ContentPaneEx.superclass.postCreate.apply(this, arguments);
		},
		
		destroy: function() {
			rmc.widget.ContentPaneEx.superclass.destroy.apply(this, arguments);
		},
		
		onLoad: function(e) {
			rmc.widget.ContentPaneEx.superclass.onLoad.apply(this, arguments);
			//alert("loaded: " + this.href);
			//alert("home: " + location.href);
			//alert("hash: " + location.hash); 
		},
	
		onDownloadEnd: function(url, data){
			
			// this is a workaround. ContentPane adjustpath is toooo slow.
			// so we disable it and manually fix the urls
			// currently this only apply to the Index pane
			if ( !this.adjustPaths) {
				data = data.replace(/\.\.\//g, "");		
			}
			
			rmc.widget.ContentPaneEx.superclass.onDownloadEnd.apply(this, arguments);

		},	
		
		
 		__END: true
	}
);
