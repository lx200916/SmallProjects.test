//------------------------------------------------------------------------------
// Copyright (c) 2004, 2007 IBM Corporation.  All Rights Reserved.
//------------------------------------------------------------------------------
// Displays the search scope section in the search view.
//
// Author: Jinhua Xi

dojo.provide("rmc.widget.SearchScopeWidget");

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
	"rmc.widget.SearchScopeWidget",
	dojo.widget.HtmlWidget,
	{
		ns: "rmc",
			
		title: theApp.res.searchScope_title,
		type_text: theApp.res.searchScope_type_text,
		rpp: theApp.res.searchScope_rpp,
		
		templatePath: dojo.uri.dojoUri("../rmc/widget/templates/SearchScope.html"),
        templateCssPath: dojo.uri.dojoUri("../rmc/widget/templates/SearchScope.css"),
		
		closedIcon: "rmc/widget/images/arrow_closed.gif",
		openedIcon: "rmc/widget/images/arrow_opened.gif",
		
		ID_searchScopeIcon: "searchScopeIcon",
		ID_searchScopeContent: "searchScopeContent",
		
		treeData: null,

		// save all the input ids for easy navigation
		inputIds: [],
		
		_getCheckBox: function(title, value) {
			var id = "searchScopeOption_" + this.inputIds.length;
			this.inputIds.push(id);
			
			var str = "<div><input type='checkbox' id='" + id + "' value='" + value + "' checked />" + title + "</div>";
			return str;
		},
		
		getSearchScopeData: function() {
			var values = [];
			for (var i = 0; i < this.inputIds.length; i++) {
				var id = this.inputIds[i];
				var cb = dojo.byId(id);
				// the control might not be created, if so, treat as not set
				if (cb != null) {
					if (cb.checked) {
						values.push(cb.value);
					}
				}
			}
			
			//alert(values);
			
			return values;
		},
		
		getResultPerPage: function() {
			var ob = dojo.byId("searchScopeSizePerPage");
			return ob.options[ob.selectedIndex].value;
		},
		
		postCreate: function(args, frag, parentComp) {
			rmc.widget.SearchScopeWidget.superclass.postCreate.apply(this, arguments);
			
			// no element filtering in 7.2
			//this._createTree();
		},
			
		_createTree: function() {
			// create tree controllers
			var body = dojo.body();
    		div = document.createElement("div");
		    div.setAttribute("id", "searchScope-TreeControllerSelectorSection");
		    
		    var treeController = dojo.widget.createWidget("TreeBasicControllerV3", {widgetId: "searchScope-controller"});
		    div.appendChild(treeController.domNode);
		    
		    var selector = dojo.widget.createWidget("TreeSelectorV3", {widgetId: "searchScope-selector"});
		    div.appendChild(selector.domNode);    
		   
		    var treeIcon = dojo.widget.createWidget("TreeDocIconExtension", {widgetId: "searchScope-nodeIcons"});
		    div.appendChild(treeIcon.domNode);
		    
		    /*
		    dojo.widget.createWidget("TreeEmphasizeOnSelect", {selector: "searchScope-selector"});
		    div.appendChild(w.domNode);
		    
		    dojo.widget.createWidget("TreeDeselectOnDblselect", {selector: "searchScope-selector"});
		    div.appendChild(w.domNode);
		    
		    dojo.widget.createWidget("TreeExpandToNodeOnSelect", {selector: "searchScope-selector", controller: "searchScope-controller"});
		    div.appendChild(w.domNode);
			*/
			
		    body.appendChild(div);
			    
			// now create the tree 
			var content = dojo.byId("searchScopeContent");
			//var tree = dojo.widget.byId("searchScopeTree");
				
			var tree = dojo.widget.createWidget("TreeV3", 
				{listeners: ["searchScope-controller", "searchScope-selector", "searchScope-nodeIcons"], 
					selector: "searchScope-selector",
					eagerWidgetInstantiation: false});
									
			tree.setChildren(this._getTreeData());
			
			// expand all nodes to make sure the controls are created
			treeController.expandAll(tree);
			
			content.appendChild(tree.domNode);
		},
		
		_getTreeData: function() {
			if (this.treeData == null) {
				this.treeData =
				[
					{title: this._getCheckBox(theApp.res.searchScope_mc, "mc"), children: [
						{title: this._getCheckBox(theApp.res.searchScope_role, "role")},
						{title: this._getCheckBox(theApp.res.searchScope_task, "task")},
						{title: this._getCheckBox(theApp.res.searchScope_wp, "wp")},
						{title: this._getCheckBox(theApp.res.searchScope_guidance, "guidance")}]
					},
					
					{title: this._getCheckBox(theApp.res.searchScope_process, "process"), children: [
						{title: this._getCheckBox(theApp.res.searchScope_activity, "activity")}
						]
					},
					
					{title: this._getCheckBox(theApp.res.searchScope_general, "general")}
				];
			}
			
			return this.treeData;
		},
		
		fillInTemplate: function(args, frag) {
			rmc.widget.SearchScopeWidget.superclass.fillInTemplate.apply(this, arguments);	
		},
		
		destroy: function() {
			rmc.widget.SearchScopeWidget.superclass.destroy.apply(this, arguments);
		},
		
		onIconClick: function(evt) {
			var icon = dojo.byId(this.ID_searchScopeIcon);
			var content = dojo.byId(this.ID_searchScopeContent);
			
			if (icon.src.indexOf(this.closedIcon) >= 0) {
				icon.src = this.openedIcon;
				//dojo.html.removeClass(content, "searchScopeHideContent");
				//dojo.html.setClass(content, "searchScopeShowContent");
				//dojo.html.setStyleAttributes(content, "display:block");

				content.style.display = "block";
			} else {
				icon.src = this.closedIcon;
				//dojo.html.removeClass(content, "searchScopeShowContent");
				//dojo.html.setClass(content, "searchScopeHideContent");
				//dojo.html.setStyleAttributes(content, "display:none");
				//content.style.visibility = "hidden";
				content.style.display = "none";
			}
		},
			
		onIconPress: function(evt) {
			var node = evt.target;
			if (evt.keyCode == dojo.event.browser.keys.KEY_ENTER) {
				this.onIconClick(evt);
			}			
		},
			
 		__END: true
	}
);
