//------------------------------------------------------------------------------
// Copyright (c) 2004, 2007 IBM Corporation.  All Rights Reserved.
//------------------------------------------------------------------------------
// This class is responsible for the application tree navigation. 
// It creates and maintains a lazyloading DojoTreePane widget and handles 
// the tree node selection, breadcrumbs, etc.
//
// Author: Jinhua Xi
// Author: Kelvin Low

AppNavigation = function(){
	// data
	this.treeViews = [];
	
	// tree node path for processes
	// this allows descriptors to find their tree node 
	this.treeNodePaths = [];

	// UI
	this.navigationContainer = null;
	this.defaultViewId = null;
	
	// true if the pane is selected by user's keyboard or mouse click
	this.isUserSelect = true;
};


AppNavigation.prototype.createViews = function() {
	if ( this.treeViews == null 
		|| this.navigationContainer == null ) {
		return;
	}
	
	if (theApp.settings.enableProfiling) {
		dojo.profile.start("AppNavigation.createViews");
	}
	
	for ( var i in this.treeViews ) {
		var view = this.treeViews[i];
		
		if (this.defaultViewId == null || view.isDefault ) {
			this.defaultViewId = view.id;
		}
		
		//var w = theApp.createContentPane({id: view.id, label: view.label });
		//alert("creating vew: " + view.id);
		//var w = dojo.widget.createWidget("rmc:IFrameTreePane", {id: view.id, label: view.label});
		//alert("view created: " + w);
		var w = dojo.widget.createWidget("rmc:DojoTreePane", {id: view.id, objectId: view.objectId, src: view.src, label: view.label});
		
		this.navigationContainer.addChild(w);
	}	
	
	// hook up the navigation events
	this._handleNavigation();
	
	if (theApp.settings.enableProfiling) {
		dojo.profile.end("AppNavigation.createViews");
	}
};
	


/* select the default page, for now, it's the first page of the default view */
AppNavigation.prototype.selectDefaultPage = function() {

	// initialize the selection
	// selet the first
	var treeContainer = null;
	if (this.defaultViewId == null ) {
		if ( this.navigationContainer.children.length > 0 ) {
			treeContainer = container.children[0];
			this.navigationContainer.selectChild(treeContainer);
		}
	} else {
		treeContainer = this.selectPane(this.defaultViewId);
	}
	
	if ( treeContainer != null ) {
		setTimeout(function () { treeContainer.selectFirstNode(); }, 50);
	}
	
};


/* find the page from the default view, or maybe all views ??? */
AppNavigation.prototype.selectPage = function(bookmarkUrl) {
	
	// always show the page
	theApp.setContentUrl(bookmarkUrl);	
	
	/*
	// set url will auto-select the tree node when finding bookmark
	// disabled auto-selection, so still need to select here
	var node = this.findPage(bookmarkUrl);
	if ( node != null ) {
		this._selectTreeNode(node);	
	}
	*/
	
};


/* find the page node with the given url */
/*
AppNavigation.prototype.findPage = function(url) {

	// if the node is already selected
	var node = this.getSelectedNode();
	if (node != null && this._sameUrl(url, node.url) ) {
		return node;
	}
	
	
	// check if the path is defined.
	// if more than one path, use the first one
	var paths = this.getBreadcrumbPaths(url);

	if ( paths != null && paths.length > 0 ) {

		var path = paths[0];
		return this.findNodeByPath(path.view, path.path);
	}

	// otherwise, navigate the tree and find the node with the given url, this is slow



	var treeContainer = null;
	var node = null;
	var currentId = null;
	
	// always check the current pane first
	treeContainer = this._getSelectedPane();
	if ( treeContainer != null ) {
		currentId = treeContainer.widgetId;		
		node = this.findPageInPane(treeContainer, url);
		if ( node != null ) {
			return node;
		}
		//alert("not in current pane: " + url);
	}
		
	// then try the default pane
	if (this.defaultViewId != null ) {
		treeContainer = this.selectPane(this.defaultViewId);
		node = this.findPageInPane(treeContainer, url);
		if ( node != null ) {
			return node;
		}
		//alert("not in default pane: " + url);
	}

			
	
	//iterate all views and find the node
	for ( var i in this.treeViews ) {
		var view = this.treeViews[i];		
		if (this.defaultViewId == view.id || currentId == view.id ) {
			continue;
		}
		
		treeContainer = this.selectPane(view.id);
		node = this.findPageInPane(treeContainer, url);
		if ( node != null ) {
			return node;
		}
		
		//alert("not in pane " + view.id + ": " + url);

	}	
	
	//alert("not in any pane: " + url);

	return null;
}
*/


/* select a pane with the specified id, return the selected pane*/
AppNavigation.prototype.selectPane = function(/*pane or paneId*/pane) {

	if (dojo.lang.isString(pane) ) {
		pane = dojo.widget.byId(pane);
	}

	if ( pane != null ) {
		var ap = pane;
		if (  this._isAccordionContainer(this.navigationContainer) && 
			 !this._isAccordionPane(pane) ) {
			ap = pane.parent;
		}
		
		//var oldSel = this.isUserSelect;
		this.isUserSelect = false;
		this.navigationContainer.selectChild(ap);
		this.isUserSelect = true;
	}
	
	// note, we want to return the pane, not the accordian pane
	// since the pane itself contains the content we want to manipulate
	return pane;
};


AppNavigation.prototype._isAccordionContainer = function(container) {
	return (container.widgetType) && 
		(container.widgetType == "AccordionContainer" 
		|| container.widgetType == "AccordionContainerEx");
}

AppNavigation.prototype._isAccordionPane = function(pane) {
	return (pane.widgetType) && 
		(pane.widgetType == "AccordionPane" 
		|| pane.widgetType == "AccordionPaneEx");
}

/* get the currently selected pane */
AppNavigation.prototype._getSelectedPane = function() {

	var selectedPane = null;
	var container = this.navigationContainer;
	//alert("container: " + container);
	
	// container is not initialized? this could happen when open a bookmark from the browser
	// the browser trigger to load the content page before the navigation framework is ready
	if ( container == null ) {
		return null;
	}
	
	if ( container.widgetType == "TabContainer") {
		selectedPane = container.selectedChildWidget;
	} else if ( this._isAccordionContainer(container) ) {
		for (var i = 0; i < container.children.length; i++ ) {
			if ( container.children[i].selected ) {
				selectedPane = container.children[i];
				if ( this._isAccordionPane(selectedPane) ) {
					selectedPane = selectedPane.children[0];
				}
				break;
			}
		}
	} else {
		// not handled
	}
	
	return selectedPane;
};

AppNavigation.prototype._getViewData = function(viewId) {

	for ( var i in this.treeViews ) {
		var view = this.treeViews[i];
		
		if (viewId == view.id ) {
			return view;
		}
	}	
	
	return null;
};

AppNavigation.prototype.getViews = function() {
	return this.treeViews;
};

AppNavigation.prototype._isView = function(viewId) {

	for ( var i in this.treeViews ) {
		var view = this.treeViews[i];
		
		if (viewId == view.id ) {
			return true;
		}
	}	
	
	return false;
};

AppNavigation.prototype._handleNavigation = function() {

  	var self = this;
	dojo.event.connect(this.navigationContainer, "selectChild", function (evt) {
		var selectedPane = self._getSelectedPane();	
		//alert("selected: " + 	selectedPane) ;
			
		if ( selectedPane != null ) {
			//don't call load tree at this moment. wait till transversing the tree
			if ( self._isView(selectedPane.widgetId) ) {
				if ( !selectedPane.isTreeLoaded() ) {
					if (theApp.settings.enableProfiling) {
						dojo.profile.start("DojoTreePane.loadTree: " + selectedPane.label);
					}
					selectedPane.loadTree();
					if (theApp.settings.enableProfiling) {
						dojo.profile.end("DojoTreePane.loadTree: " + selectedPane.label);
					}
				}

				// select the first node 
				if ( self.isUserSelect ) {
					setTimeout(function () { selectedPane.selectFirstNode(); }, 100);
				}		
			} else {
				theApp.paneSelected(selectedPane);
			}
		}
	});
};


/* return an array of breadcrumb {url:url, title:title} as parameter of the callback function*/
AppNavigation.prototype.getBreadcrumbs = function(url, callback) {
//alert("before, url=" + url);

	dojo.profile.start("AppNavigation.getBreadcrumbs");

	var bookmark = theApp.getBookmarkUrl(url);
	if ( bookmark == null || bookmark == "" ) {
		bookmark = theApp.getRelativeUrl(url);
	}
	
	// if the node is already selected
	var pane = this._getSelectedPane();
	if ( pane != null && pane.isCurrentSelection(bookmark) ) {
		//alert("is current: " + bookmark);
		pane.getBreadcrumbs(bookmark, callback);
	} else {	
		// check if the path is defined.
		// if more than one path, use the first one
		var paths = this.getBreadcrumbPaths(bookmark);
		if ( paths != null && paths.length > 0 ) {
			var path = paths[0];
			pane = this.selectPane(path.view);
			if ( pane != null ) {
				pane.getBreadcrumbsByPath(path.path, callback);
			}
		}
	}
	
	dojo.profile.start("AppNavigation.getBreadcrumbs");
};

/* compare path up to the specified length*/
AppNavigation.prototype._isSamePath = function(path1, path2, length) {
	if ( path1 == null || path2 == null ) {
		return false;
	}
	
	if ( path1.length < length || path2.length < length) {
		return false;
	}
	
	for (var i = 0; i < length; i++ ) {
		if ( path1[i] != path2[i] ) {
			return false;
		}
	}
	
	return true;
};


AppNavigation.prototype.syncTreeNode = function() {
	var selPane = this._getSelectedPane();
	if ( (selPane != null ) && this._isView(selPane.widgetId) ) {
		selPane.syncTreeNode();
	} else {
		// TODO: with with getBreadcrumbsByPath to find the node and sync to the node
		// this is usually the case when the page is validated from an index page
		
	}
};


/* return an array of breadcrumb {url:url, title:title} as parameter of the callback function
	paths is an array of nodeInfo {view:viewId, path:[]} object
	appendPath is an array of additional path that should be added to the end of each nodeInfo.path.
*/
AppNavigation.prototype.getBreadcrumbsByPath = function(paths, appendPath, callback) {

	if ( paths == null || paths.length == 0 ) {
		return;
	}

	var pane, path;
	var pathInfo;
	var selPane = this._getSelectedPane();
	var selPath = null;
	var goodIndex = 0;
	
	// if the sel pane is not a view, ignore it
	if ( (selPane != null ) && !this._isView(selPane.widgetId) ) {
		
		// TODO: if you want to show the breadcrumbs 
		// or use the sync node icon to sync to the node in the view,
		// save the parameters and then process it in the syncTreeNode call
		// for now, we just ignore this case
		return;
	}
	
	if ( selPane != null ) {
		selPath = selPane.getSelectedNodePath();
		//alert("selcted node: " + selPath);
				
		if (selPath != null) {
			for ( var i = 0; i < paths.length; i++ ) {
				pathInfo = paths[i];
				if ( pathInfo.view != selPane.widgetId ) {
					continue;
				}
						
				goodIndex = i;
				if ( !this._isSamePath(selPath, pathInfo.path, pathInfo.path.length) ) {
					continue;
				}
				
				//alert("path found");
				// it's the same path, save it and compare with appendPath later
				path = pathInfo.path;
				if ( appendPath != null ) {
					path = path.concat(appendPath);
				}

				selPane.getBreadcrumbsByPath(path, callback);
				return;
				
			}
		}
		
	}
	
	
	pathInfo = paths[goodIndex];
		
	pane = this.selectPane(pathInfo.view);
	path = pathInfo.path;
	if ( pane == null ) {
		return;
	}

	if ( appendPath != null && appendPath.length > 0 ) {
		path = path.concat(appendPath);
	}

	pane.getBreadcrumbsByPath(path, callback);
	
};


AppNavigation.prototype.getNodeInfo = function(id) {
	return this.treeNodePaths[id];
};

/*
AppNavigation.prototype.togglePane = function(paneId) {
	var pane = dojo.widget.byId(paneId);
	if ( pane != null ) {	
		if ( this._isAccordionContainer(this.navigationContainer) ) {
			pane = pane.parent;
		} 
	}
		
	if ( pane.isShowing() ) {
		pane.hide();
	} else {
		pane.show();
	}
};

AppNavigation.prototype.showAll = function() {
	var container = this.navigationContainer;
	for (var i = 0; i < container.children.length; i++ ) {
		var pane = container.children[i];
		if ( !pane.isShowing() ) {
			pane.show();
		}
	}
};

AppNavigation.prototype.hideAll = function() {
	var container = this.navigationContainer;
	for (var i = 0; i < container.children.length; i++ ) {
		var pane = container.children[i];
		if ( pane.isShowing() ) {
			pane.hide();
		}
	}
}
*/


