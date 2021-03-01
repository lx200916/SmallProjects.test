//------------------------------------------------------------------------------
// Copyright (c) 2004, 2007 IBM Corporation.  All Rights Reserved.
//------------------------------------------------------------------------------
// A content pane with an embedded Dojo tree control.
// The tree navigation APIs are exposed directly by this widget.
//
// Author: Jinhua Xi
// Author: Kelvin Low

dojo.provide("rmc.widget.DojoTreePane");

dojo.require("dojo.widget.*");
dojo.require("dojo.io.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.string");
dojo.require("dojo.string.extras");
dojo.require("dojo.html.style");

dojo.require("dojo.widget.TreeV3");
dojo.require("dojo.widget.TreeNodeV3");
dojo.require("dojo.widget.TreeBasicControllerV3");
dojo.require("dojo.widget.TreeDocIconExtension");
dojo.require("dojo.widget.TreeSelectorV3");
dojo.require("dojo.widget.TreeEmphasizeOnSelect");
dojo.require("dojo.widget.TreeDeselectOnDblselect");
dojo.require("dojo.widget.TreeExpandToNodeOnSelect");

dojo.widget.defineWidget(
	"rmc.widget.DojoTreePane",
	dojo.widget.ContentPane,
	{
		treeController: null,
		selector: null,
		src: null,
		objectId: null,
		
		// the tree root is already shown in the drawer's title
		// there is no need to show it as a tree root any more
		showTreeRootNode: false,
		
		// flag to indicate isLoading state
		isLoading: false,
		
		// deferedCalls, wait till tree is loaded
		// an array of [func, callback, args]
		deferredCalls: [],
		
		// flag to indicate that load content is allowed.
		// find node will trigger select node event, 
		// that will then trigger a load content operation. this operation should be avoided
		// don't load content when this flag is true
		allowLoadContent: true,
		previousAllowLoadContent: true,
		
		// save the node of the current content page
		// used for node synchronization,
		currentNode: null,
	
		postCreate: function(args, frag, parentComp) {
			rmc.widget.DojoTreePane.superclass.postCreate.apply(this, arguments);
			//alert("DojoTreePane: postCreate: " + this.domNode.tagName);
		},
		
		fillInTemplate: function(args, frag) {
			rmc.widget.DojoTreePane.superclass.fillInTemplate.apply(this, arguments);
			//alert("DojoTreePane: fillInTemplate: " + this.domNode.tagName);
			
			// by default dojo create a SPAN as the contained DOM, need to be a DIV 
			var div = document.createElement("div");
			this.domNode = div;
			
			dojo.html.addClass(this.domNode, "dojoContentPane");
			
			// define a global tree selector and controller
			// shared by all trees, only create once
			// make sure the tree selector and tree controller are created
			// define only one such section for the document
			// may be shared by multiple trees
			div = document.getElementById("DojoTreeControllerSelectorSection");
			if (div == null ) {
				//alert("creating controller");
				var body = dojo.body();
	    		div = document.createElement("div");
			    div.setAttribute("id", "DojoTreeControllerSelectorSection");
			    
			    var w = dojo.widget.createWidget("TreeBasicControllerV3", {widgetId: "controller"});
			    div.appendChild(w.domNode);
			    
			    w = dojo.widget.createWidget("TreeSelectorV3", {widgetId: "selector"});
			    div.appendChild(w.domNode);
			    
			    w = dojo.widget.createWidget("TreeDocIconExtension", {widgetId: "nodeIcons"});
			    div.appendChild(w.domNode);
			    
			    dojo.widget.createWidget("TreeEmphasizeOnSelect", {selector: "selector"});
			    div.appendChild(w.domNode);
			    
			    dojo.widget.createWidget("TreeDeselectOnDblselect", {selector: "selector"});
			    div.appendChild(w.domNode);
			    
			    dojo.widget.createWidget("TreeExpandToNodeOnSelect", {selector: "selector", controller: "controller"});
			    div.appendChild(w.domNode);
				
			    body.appendChild(div);
				
				this.treeController = dojo.widget.byId("controller");
				this.selector = dojo.widget.byId("selector");
				
				//alert("controller: " + this.treeController);
				
				// establish the dojo connections
				// handle tree selection
				var self = this;
				var selector = this.selector; 
				dojo.event.connect(selector, 'select', function(evt) {
					//alert("selected: canLoad=" + self._canLoadContent());
					if (self._canLoadContent()) {
						//var selector = dojo.widget.manager.getWidgetById('selector');
						if (selector.selectedNodes.length == 1) {
							var node = selector.selectedNodes[0];
							//alert("node: " + node);
							var url = "about:blank";
							if (node.url) {
								url = node.url;
							}
							
							//alert("tree node selected, set url: " + url);
							theApp.setContentUrl(url);
						}
					}
				});
			}
			
			this.treeController = dojo.widget.byId("controller");
			this.selector = dojo.widget.byId("selector");
			
			//alert("DojoTreePane: fillInTemplate: done");
		},
		
		destroy: function() {
			rmc.widget.DojoTreePane.superclass.destroy.apply(this, arguments);
		},
		
		onLoad: function(e) {
			rmc.widget.DojoTreePane.superclass.onLoad.apply(this, arguments);
		},
		
		isTreeLoaded : function() {
			return (this.children.length > 0);
		},
						
		loadTree : function() {
			if (this.isTreeLoaded() || this.isLoading) {
				return;
			}
			
			this.isLoading = true;
			var url = theApp.getBaseUrl() + this.src;
			var bindArgs = {
				url: url,
				encoding: "utf-8",
				error: function(type, data, evt){
					alert(theApp.res.dojoTreePane_error_load_tree);
				},
				mimetype: "text/json"
 			};
 			
			//alert("loading tree from url: " + url);
			var req = dojo.io.bind(bindArgs);
			dojo.event.connect(req, "load", this, "_populateTree");
			//alert("done loading tree from url: " + url);
		},
		
		_populateTree: function(type, data, evt) {
			//alert("tree loaded: " + data);
			
			// a tab is selected, show the navigation tree
			var treeid = this.widgetId;
			if (data != null) {
				if (this.showTreeRootNode) {
					this._createTree(data);
				} else {
					// show the childrens
					for (var i = 0; i < data.length; i++) {
						var td = data[i];
						this._createTree(td.children);
					}
				}
			}
			
			this.isLoading = false;
			
			this._processPendingActions();
		},
		
		_createTree: function(/*json*/data) {
			 if (data != null) {
				var tree = dojo.widget.createWidget("TreeV3", 
					{listeners: ["controller", "selector", "nodeIcons"], 
					selector: "selector",
					eagerWidgetInstantiation: false}); // eagerWidgetInstantiation = true does not work				
				
				// lazy initialization is in effect, only root-level widgets will be created
				// don't show the root node since it's already shown in the tab
				// TODO
				tree.setChildren(data);
				this.addChild(tree);
				
				//alert("added tree:" + this.children);
			 }
		},
		
		_processPendingActions: function() {
			//alert("_processPendingActions: " + this.deferredCalls.length);
			
			while (this.deferredCalls.length > 0) {
				var callInfo = this.deferredCalls.shift();
				try {
					this._execute(callInfo);
				} catch (e) {
				}
			}
		},
		
		_test: function(str) {
			alert("ttest: " + str);
		},
		
		_execute: function(callInfo) {
			//var f = eval("this._test");
			//alert("function: " + f);
			//f.apply(this, "test str");
			
			var fun = callInfo[0];
			var args = callInfo[1];
			var callback = callInfo[2];
			//var fun = eval(funSrc);
			//alert("executing function: " + fun);
			var ret = fun(args);
			//var ret = fun.apply(this, args);
			if (callback != null) {
				callback(ret);
			}
		},
		
		// tree navigation APIs
		selectFirstNode: function() {
			var self = this;
			var fun = function() {				
				// most likely a pane only have one tree root
				// but if we hide the top view item, 
				// then the pane will contain all the top level children as tree root.
				//alert("_selectFirstNode of children: " + self.children);
				for (var i in self.children) {
					var tree = self.children[i];
					
					// select the first node
					var node = tree.children[0];
					//alert("selecting node: " + node);
					
					// save the current node for synchronization
					self.currentNode = node;
					
					self._selectTreeNode(node, false);
					break;
				}
			};
			
			//alert("selectFirstNode caled");
			if (this.isTreeLoaded()) {
				fun();
			} else {
				this.deferredCalls.push([fun, null, null]);
				this.loadTree();
			}
		},
		
		// find the page node with the given url in the specified treeContainer.
	 	// return the node if found, null otherwise 
		_findNode: function(url) {		
			// most likely a pane only have one tree root
			// but if we hide the top view item, 
			// then the pane will contain all the top level children as tree root.
			for (var i in this.children) {
				var tree = this.children[i];
				var stack = [];
				var node = this._findTreeNode(tree, url, stack);
				if (node != null) {
					if (!this._isTreeNode(node)) {
						// expand the node tree to create the tree nodes
						node = this._expandNodes(stack);
					}
					
					return node;				
				}
			}
			
			return null;
		},
		
		_saveNode: function(node) {
			// save the current node for synchronization
			this.currentNode = node;
		},
		
		// find the node by path. The path is an array of node ids starting with the top tree node.
		// The routine will return the ndoe of the last mated path id. 
		// That means even though some path ids at the end of the list is not matched, 
		// we still return the last matched node insted of null.
		_findNodeByPath : function(/*Array*/path, /*int*/startIndex) {
			// reset the node
			this._saveNode(null);
			
			if (!dojo.lang.isNumber(startIndex)) {
				startIndex = 0;
			}
			
			// most likely a pane only have one tree root
			// but if we hide the top view item, 
			// then the pane will contain all the top level children as tree root.
			
			// trace the nodes found for each tree, 
			// if the node is found in one tree, return that node,
			// otherwise, return the last matched node from the tree that has the most matches
			var matchedNodes = [];
			
			for (var i in this.children) {
				matchedNodes[i] = [];
				
				var found = true;
				
				var tree = this.children[i];
				//alert(paneId + ", " + tree.children.length);
				
				// try each tree and find the node path
				// the first tree node should have the same id as the pane
				var node = tree;
				for (var p = startIndex; p < path.length; p++) {
					this.treeController.expand(node);
					node = this._findChildNode(node, path[p]);
					if (node == null) {
						found = false;
						//alert("not found: " + path[p]);
						break; // not in this trr, try the next if any
					}
					
					// save the node matched
					matchedNodes[i].push(node);
				}
				
				if (found) {
					this._saveNode(node);
					return node;
				}
			}
			
			if (matchedNodes.length == 0) {
				return null;
			}
			
			var goodIndex = 0;
			var maxLength = 0;
			for (var i = 0; i < matchedNodes.length; i++) {
				var len = matchedNodes[i].length;
				if (len > maxLength) {
					maxLength = len;
					goodIndex = i;
				}
			}
			
			node = matchedNodes[goodIndex].pop();
			this._saveNode(node);
			return node;
		},
		
		_findChildNode: function(parentNode, id) {
			//alert("id, nodes: " + id + ", " + parentNode.children);
			for (var i in parentNode.children) {
				var childNode = parentNode.children[i];
				//alert("child: " + childNode.widgetId);
				
				if (childNode.objectId == id) {
					return childNode;
				}
			}
			
			return null;
		},

		// find the page from the specified tree, return the tree node, null if not found
		_findTreeNode: function(node, bookmarkUrl, stack) {
			stack.push(node);
			
			if (this._sameUrl(node.url, bookmarkUrl)) {
				return node;
			}
						
			for (var i in node.children) {
				var childNode = node.children[i];
				//alert("child: " + childNode);
				
				var node_found = this._findTreeNode(childNode, bookmarkUrl, stack);
				if (node_found != null) {
					return node_found;
				}
			}
			
			// nothing found
			stack.pop();
					
			return null;
		},

		// expand the nodes in the array and return the last nodes
		_expandNodes : function(/*Array*/nodes) {
			if (nodes == null || nodes.length == 0) {
				return null;
			}
			
			/*
			alert("1, node.length: " + nodes.length);
			for (var x in nodes) {
				alert( x + " = " + nodes[x].url);
			}
			*/
			
			// if the last node is a tree node, retutn it
			var node = nodes[nodes.length-1];
			
			if (this._isTreeNode(node)) {
				return node;
			}
			
			var level = 0;
			var i;
			while (i < nodes.length) {
				if (!this._isTreeNode(nodes[i])) {
					level = i -1;
					break;
				}
			}
			
			var found = true;
			node = nodes[level];
			while (found && level < nodes.length -1) {
				this.treeController.expand(node);
				level++;
				found = false;
				for (var x in node.children) {
					var child = node.children[x];
					if (this._sameUrl(child.url, nodes[level].url)) {
						node = child;
						found = true;
						//alert(level + " =: " + node);
						break;
					}
				}
			}
			
			if (found) {
				return node;
			}
		},
		
		_disableContentLoading: function() {
			this.previousAllowLoadContent = this.allowLoadContent;
			this.allowLoadContent = false;
		},
		
		_enableContentLoading: function() {
			this.allowLoadContent = this.previousAllowLoadContent;
			this.previousAllowLoadContent = true;
		},
		
		_canLoadContent: function() {
			return this.allowLoadContent;
		},
		
		_getSelectedNode: function() {
			if (this.selector.selectedNodes.length == 1) {
				return this.selector.selectedNodes[0];
			}
			return null;
		},
		
		isCurrentSelection: function(url) {
			var node = this._getSelectedNode();
			return (node != null) && this._sameUrl(url, node.url);
		},
		
		_sameUrl: function(nodeUrl, externalUrl) {
			if (nodeUrl == externalUrl) {
				return true;
			}
			return this._trimUrl(nodeUrl) == this._trimUrl(externalUrl);
		},
		
		_trimUrl: function(url) {
			if (url == null) {
				return "";
			}
			
			var i;
			/*
			i = url.indexOf("?");
			if (i >= 0) {
				url = url.substring(0, i);
			}
			*/
			
			i = url.indexOf("#");
			if (i >= 0) {
				url = url.substring(0, i);
			}
			
			return url;
		},
		
		_isTreeNode: function(node) {
			return (node != null) && (node instanceof dojo.widget.TreeNodeV3);
		},
		
		_selectTreeNode: function(node, scrollIntoView) {
			// if selected, do nothing
			if (this._getSelectedNode() == node) {
				return;
			}
			
			this.selector.deselectAll();	
			if (this._isTreeNode(node)) {
							
				this.selector.select(node);
				if (scrollIntoView) {
					dojo.html.scrollIntoView(node.domNode);
				}
				
				// set the focus, a workaround for firefox
				this._focusNode(node);
			}
		},

		_focusNode: function(node) {
			var self = this;
			var f = new function() {
				
				// expand the tree first
				// this method is buggy, it does not expand the top parent 
				// if some node in the parent chain is expanded already
				//self.treeController.expandToNode(node, true);				
				var s = [];
				var n = node.parent;
				while ( self._isTreeNode(n) ) {
					s.push(n);
					n = n.parent;
				}				
				dojo.lang.forEach(s, function(n) { n.expand() });
		
				// now since the tree is expanded, we  can focus it.
				self.treeController._focusLabel(node);
			};
			setTimeout(f, 1);
		},
		
		// get an array of breadcrumb {url:url, title:title}, 
		// call the callback function with the breadcrumbs
		getBreadcrumbs: function(url, callback) {
			var self = this;
			var fun = function(url) {
				//alert("getBreadcrumbs: " + url);
				var bookmark = theApp.getBookmarkUrl(url);
				if (bookmark == null || bookmark == "") {
					bookmark = theApp.getRelativeUrl(url);
				}
				
				self._disableContentLoading();
				
				var node = self._getSelectedNode();
				if (node == null || !self._sameUrl(bookmark, node.url)) {
					// find the page
					//alert("find node for: " + bookmark);
					node = self._findNode(bookmark);
				}
				
				var bcs = [];
				
				if (node != null) {
					bcs = self._internalGetBreadcrumbs(node);
				}
				
				self._enableContentLoading();
				
				return bcs;
			};
			
			if (this.isTreeLoaded()) {
				var ret = fun(url);
				callback(ret);
			} else {
				this.deferredCalls.push([fun, url, callback]);
				this.loadTree();
			}
		},
		
		getBreadcrumbsByPath: function(/*Array*/path, callback) {
			// note the first item in the path is the view's guid
			// if showTreeRootNode is false, we need to skip that one
			var startIndex = 0;
			if (!this.showTreeRootNode) {
				startIndex = 1;
			}
			
			var self = this;
			var fun = function(path) {		
				// alert("getBreadcrumbsByPath: " + path);
				self._disableContentLoading();
				
				var node = self._findNodeByPath(path, startIndex);
				var bcs = self._internalGetBreadcrumbs(node);
				self._enableContentLoading();
				
				return bcs;
			};
			
			if (this.isTreeLoaded()) {
				var ret = fun(path);
				callback(ret);
			} else {
				this.deferredCalls.push([fun, path, callback]);
				this.loadTree();
			}
		},
		
		getSelectedNodePath: function() {
			var node = this._getSelectedNode();
			if (node == null) return null;
			
			var path = [];
						
			path.push(node.objectId);
			while (((node=node.parent) != null) && this._isTreeNode(node)) {
				path.push(node.objectId);
			}
			
			// if the root is not in the tree, append it
			if (!this.showTreeRootNode) {
				path.push(this.objectId);
			}
			
			return path.reverse();
		},
		
		syncTreeNode: function() {		
			this._disableContentLoading();
			
			if (this.currentNode != null) {
				this._selectTreeNode(this.currentNode, true);
			}
			
			this._enableContentLoading();
		},
		
		_internalGetBreadcrumbs: function(node) {
			var bcs = [];
		
			if (node == null) {
				//can't find the node,
				//alert("no node");
				return bcs;
			}
			
			// select the node as needed
			// the node will be selected if found, so don't select here since this will trigger extra load event
			//this._selectTreeNode(node);
			
			var count = 0;
			while (this._isTreeNode(node) && node.url != null) {
				bcs[count++] = this._constructBreadcrumb(node);
				node = node.parent;
			}
			
			//alert(bcs);
			
			// need to reverse the list so that the first one is the root node
			return bcs.reverse();
		},
		
		_constructBreadcrumb: function(node) {
			return {id: node.objectId, url: theApp.getBaseUrl() + node.url, title: node.title};
		},

 		__END: true
	}
	
);
