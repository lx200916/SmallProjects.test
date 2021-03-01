//------------------------------------------------------------------------------
// Copyright (c) 2004, 2007 IBM Corporation.  All Rights Reserved.
//------------------------------------------------------------------------------
// This is the main application singleton instance for the dojo navigation frame work.
// Author: Jinhua Xi

dojo.addOnLoad(function(){
	theApp.init();
	theApp.loadFirstPage();
	});
dojo.addOnUnload(function(){theApp.cleanup();});

var theApp = {
	
	initialized: false,
	
	// the main window container
	mainWindow: null,
	
	// the split
	splitContainer:  null,
	
	contentContainer : null,
	//infoContainer : null,
	resultContainer : null,
	
	contentTopPane : null,
	searchWidget: null,
	searchScopeWidget: null,
	searchResultPane : null,
	bannerWidget : null,
	
	glossaryPane : null,
	indexPane : null,
	searchServlet : null,
	feedbackURL : null,
	infoFileName : null,
	bannerFileName : null,
	
	glossaryPaneUrl: "./process/glossary.htm",
	indexPaneUrl: "./index/contents.htm",
	
	
	// array of post init call backs
	// in case a call to the app is needed before the app is initialized
	// call addPostInitCallback() to add the callback into this list
	// this scenario happens sometimes, 
	// for example, when open a bookmark, the content page is loaded before the app is initialized,
	// in such a case, the breadcrumbs can't be generated
	// the content page should add a callback function to load the breadcrumbs after the app is initialized.
	postInitCallbacks: [],
	
	// define app settings as an array of options
	settings : [],
	
	// load the localizable strings
	res : new AppResource(),
	
	// define the AppBrowser for history and back/forward feature
	browser: new AppBrowser(),
	
	// floating modal dialog to show content
	//dialog: null,
	
	// define the navigation module for tree navigation and bookmark handling
	nav : new AppNavigation(), 
	
	init : function() {
		//alert("initializing dojo ...");
		
		if (this.settings.enableProfiling) {
			dojo.profile.start("theApp.init");
		}
		
		this.mainWindow = dojo.widget.byId("mainWindow");
		this.splitContainer = dojo.widget.byId("splitContainer");
		this.contentContainer = dojo.widget.byId("contentContainer");
		this.contentTopPane = dojo.widget.byId("contentTopPane");
		
		// check if search is enabled
		this.searchWidget = dojo.widget.byId("SearchWidget");
		if ( this.searchWidget == null ) {
			this.settings.enableSearch = false;
		} else if ( this.settings.enableSearch == false ) {
			this.searchWidget.hide();
			this.searchWidget = null;
		}
		
		this.bannerWidget = dojo.widget.byId("BannerWidget");
		
		// create the tree views
		this.nav.selector = dojo.widget.manager.getWidgetById("selector");
		this.nav.treeController = dojo.widget.byId("controller");	
		this.nav.navigationContainer = dojo.widget.byId("navigationContainer");	
			
		//alert("this.nav.navigationContainer: " + this.nav.navigationContainer);
		
		this.nav.createViews();
		
		// create widgets based on options		
		this._createInfoWidgets();
		
		// hook up the navigation events
		this._handleNavigation();
		
		//alert("url=" + location.href);
				
		if (this.settings.enableProfiling) {
			dojo.profile.end("theApp.init");		
			this.profilingPane._setContent(dojo.profile.dump(false));
		}	
		
		this.initialized = true;
		//alert("dojo app initialized");
		this._processPostInitCallbacks();
	},

	loadFirstPage: function() {
		var bookmarkUrl = this.getBookmarkUrl();
		
	//	bookmarkUrl = "openUp/openup_basic/guidances/supportingmaterials/resources/copyrite.htm";
		//alert("bookmark=" + bookmarkUrl);
		
		// if there is a bookmarked page, show it
		// now either show the first page of the default view, or show the bookmarked page
		if ( bookmarkUrl == null || bookmarkUrl == "" ) {
			this.nav.selectDefaultPage();
		} else {
			// show the bookmark page
			this.nav.selectPage(bookmarkUrl);
		}
	},
	
	cleanup:  function() {
		//alert("unload dojo, clean up here");
		this.contentContainer.domNode = null;
		
	},
	
	isInitialized: function() {
		return this.initialized;
	},
	
	addPostInitCallback: function(callback) {
		//alert("callback added: " + callback);
		// if already initialized, callback directly
		if ( this.isInitialized() ) {
			callback();
		} else {
			this.postInitCallbacks.push(callback);
		}
	},
	
	_processPostInitCallbacks: function() {
		for (var i = 0; i < this.postInitCallbacks.length; i++ ) {
			this.postInitCallbacks[i]();
		}
	},
	
	_createInfoWidgets : function() {
	
		if (this.settings.enableProfiling) {
			dojo.profile.start("theApp._createInfoWidgets");
		}
	
		if ( this.searchWidget != null ) {
			this.resultContainer = dojo.widget.createWidget("rmc:AccordionContainerEx", 
				{id: "resultContainer", sizeShare: 10, layoutAlign: "right", containerNodeClass: "viewContent"});	
			// add to the parent
			this.contentContainer.parent.addChild(this.resultContainer);
/*			
			this.searchResultPane = this.createContentPane( 
				{id: "searchResultPane", label: this.res.searchResultPaneLabel, 
					cacheContent: false, refreshOnShow: false, executeScripts: true});
*/			
			this.searchResultPane = dojo.widget.createWidget("rmc:SearchResultPane", 
				{id: "searchResultPane", label: this.res.searchResultPaneLabel, 
					cacheContent: false, refreshOnShow: false, executeScripts: true});
					
			// create the search scope
			this.searchScopeWidget = this.searchResultPane.createSearchScope();
						
			this.resultContainer.addChild(this.searchResultPane);
			dojo.html.addClass(this.searchResultPane.containerNode, "dojoContentPane");	
			
			// by default, hide the search result pane
			this.toggleSearch();
		}
		
		// put these into the navigation container
		if ( this.settings.showGlossary ) {
			this.glossaryPane = this.createContentPane( 
				{id: "glossaryPane", label: this.res.glossaryPaneLabel, adjustPaths: false, extractContent: false, parseContent: false});
			
			//this.glossaryPane = dojo.widget.createWidget("rmc:IFrameContentPane", {id: "glossaryPane", label: this.res.glossaryPaneLabel});
			
			dojo.html.addClass(this.glossaryPane.domNode, "dojoContentPane");
			this.nav.navigationContainer.addChild(this.glossaryPane);
			//this.glossaryPane.setUrl("./process/glossary.htm");
		}
		
		if ( this.settings.showIndex ) {
			this.indexPane = this.createContentPane( 
				{id: "indexPane", label: this.res.indexPaneLabel, adjustPaths: false, extractContent: false, parseContent: false });
			dojo.html.addClass(this.indexPane.domNode, "dojoContentPane");
				
			this.nav.navigationContainer.addChild(this.indexPane);
			//this.indexPane.setUrl("./index/contents.htm");
		}
		
//		this.glossaryPane.parent.hide();
//		this.indexPane.parent.hide();
//		this.nav.navigationContainer._setSizes();
		
		/*
		this.glossaryPane = dojo.widget.byId("glossaryPane");
		this.indexPane = dojo.widget.byId("indexPane");
		if ( this.glossaryPane == null ) this.settings.showGlossary = false;
		if ( this.indexPane == null ) this.settings.showIndex = false;
		*/
		
		if (this.settings.enableProfiling) {
			this.profilingPane = this.createContentPane({id: "profilingPane", label: this.res.profilingPaneLabel});
			dojo.html.addClass(this.profilingPane.domNode, "dojoContentPane");
			this.resultContainer.addChild(this.profilingPane);
		}
		
		if (this.settings.enableProfiling) {
			dojo.profile.end("theApp._createInfoWidgets");
		}
	},
		
	paneSelected: function(selectedPane) {
		var self = this;
		if ( selectedPane == this.glossaryPane ) {
			if ( this.glossaryPane.href != this.glossaryPaneUrl ) {
				setTimeout(function () { self.glossaryPane.setUrl(self.glossaryPaneUrl); }, 100);
			}
		} else if ( selectedPane == this.indexPane ) {
			if ( this.indexPane.href != this.indexPaneUrl ) {
				setTimeout(function () { self.indexPane.setUrl(self.indexPaneUrl); }, 100);
			}
		}
	},
	
	createContentPane : function(/*array*/attrs) {
	
		var w = dojo.widget.createWidget("rmc:ContentPaneEx", attrs);

		// need to create the DIV dom node and set the css class,
		// otherwise the scroll bar will not show
		var div = document.createElement("div");
		//div.setAttribute("class", "dojoContentPane");
		//div.setAttribute("id", view.id);
		//div.setAttribute("label", view.label);
		//alert("w=" + w.domNode.tagName);
		w.domNode = div;

		dojo.html.addClass(w.domNode, "dojoContentPane");
		
		return w;
	},

	_handleNavigation : function() {
		
		// connect the info panes
		if ( this.searchResultPane != null ) {
			dojo.event.connect(this.searchResultPane.domNode, "onclick", this, "handlerClick");
		}
		
		if ( this.indexPane != null ) {
			dojo.event.connect(this.indexPane.domNode, "onclick", this, "handlerClick");
		}
		
		
		// glossary click show in it's own pane
		if ( this.glossaryPane != null ) {
			dojo.event.connect(this.glossaryPane.domNode, "onclick", function(evt){
				var node = evt.target;
				name = node.nodeName.toLowerCase();
				
				var isLink = (name == "a" || name == "area");
				if (isLink == false) {
					node = node.parentNode;
					name = node.nodeName.toLowerCase();
				}				
				
				if(name == "a" || name == "area"){
					// it is a link, prevent the browser from unloading the page
					evt.preventDefault();
									
					var url = node.href;
					
					if (url == null || url == "" || url == "undefined" ) {
						return;
					}
					
					var i = url.indexOf("#");
					if ( i >=0 ) {
						
						var id = "_GLOSSARY_ITEM_" + url.substring(i+1);
						var e = dojo.byId(id);
						if ( e != null ) {
							// dojo's scroll into view does not scroll to top
							// we need to minic the bookmark navigation to scroll to top
							dojo.html.scrollIntoView(e);
							//e.scrollIntoView(true);
						}
					} else {
						//alert("url:" + url);
						theApp.setContentUrl(url);
					}
					
				}});
		}
		

		
		if (this.profilingPane != null) {
			dojo.event.connect(this.profilingPane.domNode, "onclick", function(evt) {
				theApp.profilingPane._setContent(dojo.profile.dump(false));
			});
		}		

	},
	
	// onload of the content pane
	onContentLoaded:  function(url) {
		if ( this.contentContainer != null ) {
		
			url = this.getRelativeUrl(url);
			
			//alert("onload page: " + this.contentContainer.getUrl());
			//alert("onload page: " + url);
			// set the history
			//var url = this.contentContainer.getUrl();
			if ( url != null ) {
				this.browser.addToHistory(url);	
				
				this.contentContainer.saveUrl(url);	
						
				//dojo.event.connect(this.contentContainer.domNode, "onclick", this, "handlerClick");
			}
		}
	},

	/*
	// on unload of the content pane 
	onUnloadContent : function() {
		//alert("onunload page");
		if (this.contentContainer ) {
			dojo.event.disconnect(this.contentContainer.domNode, "onclick", this, "handlerClick");
		}
	},
	*/
	
	handlerClick: function(evt){
		var node = evt.target;
				
		var url = node.href;
		var name = node.nodeName.toLowerCase();
		
		// note: if an <A tag contains another tag, such as a span, 
		// the event target is the contained node, not the A tag
		if(url == null) {
			var pNode = node.parentNode;
			url = pNode.href;
			name = pNode.nodeName.toLowerCase();
		}
		
		if (url == null || url == "" || url == "undefined" ) {
			evt.preventDefault();
			return;
		}
		
		
		if ( url == "#" ) {
			// scroll to top
			theApp.contentContainer.domNode.scrollTop = 0;
		} else if ( url != null && (name =="a" || name == "area") ) {	
			
			evt.preventDefault();
			
			var i = url.indexOf(this.browser.urlInfo.baseUrl);
			if ( i >=0 ) {
				url = url.substring(i+this.browser.urlInfo.baseUrl.length);
			}
			
			theApp.nav.selectPage(url);			
	       }
    	},

	setContentUrl: function(url, replace) {
		//alert("setContentUrl: " + url);
	
		var i = url.indexOf(this.browser.urlInfo.baseUrl);
		if ( i >=0 ) {
			url = url.substring(i+this.browser.urlInfo.baseUrl.length);
		}
			
		// set the history before the page is loaded
		// this will allow the onLoad method to get the correct url bookmark
		// do it in the onload event for iframe content pane since this method will not be called
		// since iframe maintains it's own url location so the delayed bookmark is ok
		//this.browser.addToHistory(url);	
		this.contentContainer.setUrl(url, replace);
		
								
		//alert(location.hash);
	},
	
	getBaseUrl: function() {
		return this.browser.urlInfo.baseUrl;
	},
	

	getContentUrl: function() {

		var base = this.getBaseUrl();
		var url = theApp.contentContainer.getUrl();
		if (url.indexOf("javascript") < 0 && url.indexOf(base) < 0 ) {;
			url = base + url;
		} 
		return url;
	},
		
	
	getBookmarkUrl : function(url) { 
		if ( url == null || url == "" || dojo.lang.isUndefined(url) ) {
			return this.browser.lastBookmark;
		}
		
		var info = this.browser.processUrlSegments(url);
		if ( info != null ) {
			return info.bookmarkUrl;
		}
		
		return null;
	},

	getRelativeUrl: function(url) {
		
		// remove bookmark
		var i = url.indexOf("#");
		if ( i >=0 ) {
			url = url.substring(0, i);
		}
		
		// remove base
		i = url.indexOf(this.browser.urlInfo.baseUrl);
		if ( i >=0 ) {
			url = url.substring(i+this.browser.urlInfo.baseUrl.length);
		}
		
		return url;
	},
	
	
	
	resolveContentUrl: function(url) {
		
		if ( url.indexOf("./") == 0 ) {
		
			var base = theApp.getContentUrl();
			//alert("base:" + base);
			var i = base.lastIndexOf("/");
			url = base.substring(0, i) + url.substring(1);
		}
		
		return url;
		
	},

	
	toggleGlossary : function() {
		this.nav.navigationContainer.togglePane(this.glossaryPane.parent);
		this.hideShowSplitPane(this.nav.navigationContainer);
		if ( this.glossaryPane.parent.isShowing() ) {
			this.nav.selectPane(this.glossaryPane.parent);
		}
	},

	toggleIndex : function() {
		this.nav.navigationContainer.togglePane(this.indexPane.parent);
		this.hideShowSplitPane(this.nav.navigationContainer);
		if ( this.indexPane.parent.isShowing() ) {
			this.nav.selectPane(this.indexPane.parent);
		}
	},

	showGlossary : function() {
		this.nav.navigationContainer.showPane(this.glossaryPane.parent);
		this.hideShowSplitPane(this.nav.navigationContainer);
		this.nav.selectPane(this.glossaryPane.parent);
	},

	showIndex : function() {
		this.nav.navigationContainer.showPane(this.indexPane.parent);
		this.hideShowSplitPane(this.nav.navigationContainer);
		this.nav.selectPane(this.indexPane.parent);
	},
	
	toggleSearch : function() {
		this.resultContainer.togglePane(this.searchResultPane.parent);
		this.hideShowSplitPane(this.resultContainer);
		if ( this.searchResultPane.parent.isShowing() ) {
			this.nav.selectPane(this.searchResultPane.parent);
		}
	},
	
	showSearchResultPane : function() {
		this.resultContainer.showPane(this.searchResultPane.parent);
		
		// make sure the pane is selected so the content will show
		this.resultContainer.selectChild(this.searchResultPane.parent);
		this.hideShowSplitPane(this.resultContainer);
	},
	
	showAll : function() {
		this.nav.navigationContainer.showAll();
		this.hideShowSplitPane(this.nav.navigationContainer);
		if ( this.resultContainer != null ) { 
			this.resultContainer.showAll();
			this.hideShowSplitPane(this.resultContainer);	
		}
	},
	
	hideAll : function() {
		this.nav.navigationContainer.hideAll();
		this.hideShowSplitPane(this.nav.navigationContainer);
		if ( this.resultContainer != null ) {
			this.resultContainer.hideAll();
			this.hideShowSplitPane(this.resultContainer);
		}
	},
	
	toggleView: function(viewId) {
		var pane = this.nav.navigationContainer.togglePane(viewId);
		this.hideShowSplitPane(this.nav.navigationContainer);
		if ( pane.isShowing() ) {
			this.nav.selectPane(pane);
		}
	},
	
	hideShowSplitPane:  function(pane) {
	
		if ( pane.getShowingCount() == 0 ) {
			this.splitContainer.hidePane(pane);
		} else {
			this.splitContainer.showPane(pane);
		}	
	},
	
	
	syncContentWithView: function() {
			this.nav.syncTreeNode();
	},
	
	/*
	showDialog: function() {
	
		var container = dojo.byId("ModalFloatingPaneContainer");
		if ( container == null ) {
			return;
		}
		
		var title = "about RMC";
		var url = "about.htm";
		
		var dialog = dojo.widget.createWidget("ModalFloatingPane", 
			{	id: "ModalFloatingPane", 
				title: title, 
				style: "width: 500px; height: 400px;", 
				bgColor: "white", 
				bgOpacity: "0.1", 
				toggle: "fade", 
				toggleDuration: "250"
			});
			
		//var pane = this.createContentPane([]);
		//pane.setUrl(url);
		//this.dialog.addChild(pane);
		container.appendChild(dialog.domNode);
		
		//alert("show dialog");
		//dialog.setUrl(url);
			
		dialog.show();
	},
	*/
	
	getIframePanes: function() {
		var panes = [];
		panes.push(this.contentContainer);
		/*
		if ( this.glossaryPane != null ) {
			panes.push(this.glossaryPane);
		}*/
		
		return panes;
	},
	
	_debug : false
	
};

