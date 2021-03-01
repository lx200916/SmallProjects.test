//------------------------------------------------------------------------------
// Copyright (c) 2004, 2007 IBM Corporation.  All Rights Reserved.
//------------------------------------------------------------------------------
// Extends the dojo.widget.ContentPane to display the search result. Includes a
// Search Scope section for the user to define the number of search hits per
// page.
//
// Author: Jinhua Xi

dojo.provide("rmc.widget.SearchResultPane");

dojo.require("dojo.widget.*");
dojo.require("dojo.io.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.string");
dojo.require("dojo.string.extras");
dojo.require("dojo.html.style");

dojo.widget.defineWidget(
	"rmc.widget.SearchResultPane",
	dojo.widget.ContentPane,
	{
		ns: "rmc",
		
		searchScopeNode: null,
		
	    templatePath: dojo.uri.dojoUri("../rmc/widget/templates/SearchResultPane.html"),
        templateCssPath: dojo.uri.dojoUri("../rmc/widget/templates/SearchResultPane.css"),
		//templateCssPath: dojo.uri.dojoUri("../css/default.css"),
		
		postCreate: function(args, frag, parentComp){
			rmc.widget.SearchResultPane.superclass.postCreate.apply(this, arguments);
		},
		
		fillInTemplate: function(args, frag) {
			rmc.widget.SearchResultPane.superclass.fillInTemplate.apply(this, arguments);						
		},
		
		destroy: function() {
			rmc.widget.SearchResultPane.superclass.destroy.apply(this, arguments);
		},
		
		createSearchScope: function() {
			this.searchScopeNode = dojo.widget.createWidget("rmc:SearchScopeWidget");
			//this.registerChild(this.searchScopeNode, 0);
			//alert("searchScopeNode: " + this.searchScopeNode.domNode.innerHTML);
			
			this.searchScopeNodeContainer.appendChild(this.searchScopeNode.domNode);
			
			return this.searchScopeNode;	
		},
		
 		__END: true
	}
);
