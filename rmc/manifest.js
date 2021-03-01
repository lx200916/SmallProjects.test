//------------------------------------------------------------------------------
// Copyright (c) 2004, 2005 IBM Corporation.  All Rights Reserved.
//------------------------------------------------------------------------------
// this js file define the mapping of the RMC widgets and their name space
//
// Author: Alfredo Bencomo
// Author: Jinhua Xi
//

// This is used for widget autoloading - no dojo.require() is necessary.
dojo.registerNamespaceResolver("rmc", function(name) {
		// Calling the dojo.string.capitalize function on "searchwidget" will give you
		// "SearchWidget", without the capital W.  The solution to this is to do
		// what Dojo does in it's own manifest file at src/namespaces/dojo.js,
		// which is map all widget short names to their full package names
		var map = {
			"searchwidget": "SearchWidget",
			"searchscopewidget": "SearchScopeWidget",
			"searchresultpane": "SearchResultPane",
			"toolbarwidget": "ToolbarWidget",
			"splitcontainerex": "SplitContainerEx",			
			"contentpaneex": "ContentPaneEx",	
			"accordioncontainerex" : "AccordionContainerEx",		
			"iframecontentpane": "IFrameContentPane",
			"dojotreepane": "DojoTreePane",
			"splitsizer": "SplitSizer",
			"modalfloatingpaneex": "ModalFloatingPaneEx",
			"bannerwidget": "BannerWidget"
		};
		return "rmc.widget." + map[name.toLowerCase()];
	}
);