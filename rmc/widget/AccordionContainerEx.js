//------------------------------------------------------------------------------
// Copyright (c) 2004, 2007 IBM Corporation.  All Rights Reserved.
//------------------------------------------------------------------------------
// Extends the dojo.widget.AccordionContainer to add the following UI elements
// to its accordion panes:
//   1. Expand/Collapse indicators
//   2. Close buttons
//
// Author: Jinhua Xi
// Author: Kelvin Low

dojo.provide("rmc.widget.AccordionContainerEx");
dojo.require("dojo.widget.*");
dojo.require("dojo.io.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.string");
dojo.require("dojo.string.extras");
dojo.require("dojo.html.style");

dojo.widget.defineWidget(
	"rmc.widget.AccordionContainerEx",
	dojo.widget.AccordionContainer,
	{
		ns: "rmc",
		
		postCreate: function(args, frag, parentComp) {
			rmc.widget.AccordionContainerEx.superclass.postCreate.apply(this, arguments);
			this.duration = 10;
		},
		
		destroy: function() {
			rmc.widget.AccordionContainerEx.superclass.destroy.apply(this, arguments);
		},
		
		_addChild: function(/*Widget*/ widget) {
			// summary
			//		Internal call to add child, used during postCreate() and by the real addChild() call
			if (widget.open) {
				dojo.deprecated("open parameter deprecated, use 'selected=true' instead will be removed in ", "0.5");
				dojo.debug(widget.widgetId + ": open == " + widget.open);
				widget.selected = true;
			}
			if (widget.widgetType != "AccordionPaneEx") {
				var wrapper=dojo.widget.createWidget("AccordionPaneEx",{label: widget.label, selected: widget.selected, labelNodeClass: this.labelNodeClass, containerNodeClass: this.containerNodeClass, allowCollapse: this.allowCollapse });
				wrapper.addChild(widget);
				this.addWidgetAsDirectChild(wrapper);
				this.registerChild(wrapper, this.children.length);
				return wrapper;	// Widget
			} else {
				dojo.html.addClass(widget.containerNode, this.containerNodeClass);
				dojo.html.addClass(widget.labelNode, this.labelNodeClass);
				this.addWidgetAsDirectChild(widget);
				this.registerChild(widget, this.children.length);
				return widget;	// Widget
			}
		},
		
		_isAccordionPane: function(pane) {
			return pane.widgetType && 
				(pane.widgetType == "AccordionPane"
				|| pane.widgetType == "AccordionPaneEx");
		},
		
		showAll: function() {
			for (var i = 0; i < this.children.length; i++) {
				var pane = this.children[i];
				if (!pane.isShowing()) {
					pane.show();
				}
			}
		},
		
		hideAll : function() {
			for (var i = 0; i < this.children.length; i++) {
				var pane = this.children[i];
				if (pane.isShowing()) {
					pane.hide();
				}
			}
		},
		
		togglePane: function(/*Widget or id*/pane) {
			if (dojo.lang.isString(pane)) {
				pane = dojo.widget.byId(pane);
				if (pane != null) {
					if (!this._isAccordionPane(pane)) {
						pane = pane.parent;
					}
				}
			}
			
			if (pane.isShowing()) {
				pane.hide();
			} else {
				pane.show();
			}
			
			return pane;
		},
		
		showPane: function(/*Widget or id*/pane) {
			if (dojo.lang.isString(pane)) {
				pane = dojo.widget.byId(pane);
				if (pane != null) {
					if (!this._isAccordionPane(pane)) {
						pane = pane.parent;
					}
				}
			}
			
			if (!pane.isShowing()) {
				pane.show();
			}
			
			return pane;
		},
		
		hidePane: function(/*Widget or id*/pane) {
			if (dojo.lang.isString(pane)) {
				pane = dojo.widget.byId(pane);
				if (pane != null) {
					if (!this._isAccordionPane(pane)) {
						pane = pane.parent;
					}
				}
			}
			
			if (pane.isShowing()) {
				pane.hide();
			}
			
			return pane;
		},
		
		getShowingCount: function() {
			var count = 0;
			for (var i = 0; i < this.children.length; i++) {
				var pane = this.children[i];
				if (pane.isShowing()) {
					count++;
				}
			}
			
			return count;
		},
		
 		__END: true
	}
);

dojo.widget.defineWidget(
	"rmc.widget.AccordionPaneEx",
	dojo.widget.AccordionPane,
	{
		ns: "rmc",
		
		oldSize: null,
		
		templatePath: dojo.uri.dojoUri("../rmc/widget/templates/AccordionPaneEx.html"),
		templateCssPath: dojo.uri.dojoUri("../rmc/widget/templates/AccordionPaneEx.css"),
		
		postCreate: function(args, frag, parentComp) {
			rmc.widget.AccordionPaneEx.superclass.postCreate.apply(this, arguments);
			dojo.html.setVisibility(this.containerNode, false);
		},
		
		destroy: function() {
			rmc.widget.AccordionPaneEx.superclass.destroy.apply(this, arguments);
		},
		
		setSelected: function(/*Boolean*/ isSelected) {	
			rmc.widget.AccordionPaneEx.superclass.setSelected.apply(this, arguments);
			dojo.html.setVisibility(this.containerNode, this.selected);
		},
		
		show: function() {
			if (!this.isShowing()) {
				rmc.widget.AccordionPaneEx.superclass.show.apply(this, arguments);
				this.parent._setSizes();
			}
		},
		
		hide: function() {
			if (this.isShowing() ) {
				rmc.widget.AccordionPaneEx.superclass.hide.apply(this, arguments);
				this.parent._setSizes();
			}
		},
		
		minimizeLabel: function() {
		},

		restoreLabel: function() {
		},
		
		onCloseButtonClick: function() {
			this.hide();
			theApp.hideShowSplitPane(this.parent);
		},
		
		// handle key events
		onLabelKeyPress: function(/*Event*/ evt) {
	 		if (evt.keyCode == dojo.event.browser.keys.KEY_ENTER) {
	 			this.onLabelClick();
	 		}
		},
		
		onCloseButtonKeyPress: function(/*Event*/ evt) {
	 		if (evt.keyCode == dojo.event.browser.keys.KEY_ENTER) {
	 			this.onCloseButtonClick();
	 		}
		},
		
		__END: true
	}
);