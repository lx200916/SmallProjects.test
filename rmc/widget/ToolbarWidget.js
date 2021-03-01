//------------------------------------------------------------------------------
// Copyright (c) 2004, 2007 IBM Corporation.  All Rights Reserved.
//------------------------------------------------------------------------------
// A toolbar that contains a drop-down menu and tool buttons.
//
// Author: Jinhua Xi
// Author: Kelvin Low

dojo.provide("rmc.widget.ToolbarWidget");

dojo.require("dojo.widget.DropdownContainer");

dojo.widget.defineWidget(
	// widget name and class
	"rmc.widget.ToolbarWidget",
	
	// superclass
	dojo.widget.HtmlWidget,
	
	// properties and methods
	{
		// parameters
		title: "ToolbarWidget",		
		ns: "rmc",  //Be sure to override the namespace parameter
		
		// define ids
		ID_toolbar_display_menu : "toolbar_display_menu",
		ID_toolbar_show_glossary : "toolbar_show_glossary",
		ID_toolbar_show_index : "toolbar_show_index",
		ID_toolbar_synchronize : "toolbar_synchronize",
		ID_toolbar_send_email : "toolbar_send_email",
		ID_toolbar_show_info : "toolbar_show_info",
		
		ID_toolbar_menu_popup : "toolbar_menu_popup",
		
		// alt text
		text_toolbar_display_menu : theApp.res.toolbar_tooltip_display_dropdown_menu,
		text_toolbar_show_glossary : theApp.res.toolbar_tooltip_display_glossary,
		text_toolbar_show_index : theApp.res.toolbar_tooltip_display_index,
		text_toolbar_synchronize : theApp.res.toolbar_tooltip_sync,
		text_toolbar_send_email : theApp.res.toolbar_tooltip_email,
		text_toolbar_show_info : theApp.res.toolbar_tooltip_info,
		
		ID_toolbar_menu_popup : "toolbar_menu_popup",

		isContainer: true,
		
		// containerToggle: String: toggle property of the dropdown
		containerToggle: "plain",

		// containerToggleDuration: Integer: toggle duration property of the dropdown
		containerToggleDuration: 150,
		
		// node for glossary and index, hide th nodes if not enabled
		glossaryNode: null,
		indexNode: null,
		
		// the popup menu
		//popup: null,
		
		//Template paths here are relative to the "dojo" directory containing "dojo.js".
        templatePath: dojo.uri.dojoUri("../rmc/widget/templates/ToolbarWidget.html"),
        templateCssPath: dojo.uri.dojoUri("../rmc/widget/templates/ToolbarWidget.css"),
        
		postCreate: function() {
			/*
			alert("toolbar post create");	
			var w = dojo.widget.createWidget("DropdownContainer");
			alert("DropdownContainer: " + w);
					
			w = dojo.widget.createWidget("rmc:DropdownMenu");
			alert("rmc:DropdownMenu: " + w);
			*/
				
			dlg = dojo.widget.byId("ModalFloatingPane");
			dlg.hide();
		},
		
		fillInTemplate: function(args, frag) {
			//alert("toolbar fillInTemplate");
		},		
			
		attachTemplateNodes: function() {
			// summary: use attachTemplateNodes to specify containerNode, as fillInTemplate is too late for this
			rmc.widget.ToolbarWidget.superclass.attachTemplateNodes.apply(this, arguments);
			
			// create the drop down menu
			//this.popup = dojo.widget.createWidget("PopupContainer", {toggle: this.containerToggle, toggleDuration: this.containerToggleDuration});
			this.popup = dojo.widget.createWidget("PopupMenu2", {targetNodeIds:[], templateCssPath: dojo.uri.dojoUri("../skin/skin.css")});

			var self = this;
			
			this._createMenuItem(theApp.res.toolbar_menu_showall, function(e) {
				theApp.showAll();
			});
			
			this._createMenuItem(theApp.res.toolbar_menu_closeall, function(e) {
				theApp.hideAll();
			});

			this._createMenuSeparator();
							
			// views show up here
			var views = theApp.nav.getViews();
			if (views != null && views.length > 0) {
				for (var i in views) {
					//var view = views[i];					
					// create a menu
					
					// the views[i].id always get the last one since i changed to the last one when the function is executed
					// need to find a way to avoid that
					// resolved by pass the variables to the function so it binds locally
					// Jinhua Xi, 3/19/07
					var id = views[i].id;
					var label = views[i].label;
					this._createViewMenuItem(id, label);					
				}
				this._createMenuSeparator();
			}
				
			if ( theApp.settings.showIndex || theApp.settings.showGlossary || theApp.settings.enableSearch ) {
				
				if ( theApp.settings.showGlossary ) {
					this._createMenuItem(theApp.res.toolbar_menu_glossary, 
					function(e) {
						theApp.toggleGlossary();
					}
					);
				}
				
				if ( theApp.settings.showIndex ) {
					this._createMenuItem(theApp.res.toolbar_menu_index, function(e) {
						theApp.toggleIndex();
					});
				}
				
				if ( theApp.settings.enableSearch ) {
					this._createMenuItem(theApp.res.toolbar_menu_search, function(e) {
						theApp.toggleSearch();
					});
				}
				
				this._createMenuSeparator();
			}
			
			this._createMenuItem(theApp.res.toolbar_menu_sync, function(e) {
				theApp.syncContentWithView();
			});
			
			this._createMenuItem(theApp.res.toolbar_menu_feedback, function(e) {
				self._sendFeedback();
			});
			
			this._createMenuItem(theApp.res.toolbar_menu_about, function(e) {
				self._showInfoPage();
			});

			this.containerNode = this.popup.domNode;
			//dojo.event.connect(this.popup.domNode, "onclick", this, "onClick");
			
			// hide the glossary and index node as needed
			if ( !theApp.settings.showGlossary && this.glossaryNode != null ) {			
				this.glossaryNode.style.display = "none";
			}
			
			if ( !theApp.settings.showIndex && this.indexNode != null ) {			
				this.indexNode.style.display = "none";
			}
			
		},
		
		_createViewMenuItem: function(id, label) {
		
			var f = function(e) {
				theApp.toggleView(id);
			};
			
			var item = dojo.widget.createWidget("MenuItem2", {caption: label, onClick: f});
			this.popup.addChild(item);
			
			/* don't listen to the event, override the onClick method instead
			dojo.event.connect(item.domNode, "onclick", f);
			dojo.event.connect(item.domNode, "onkeypress", function(e) {
				if (e.keyCode == dojo.event.browser.keys.KEY_ENTER) { 
					f(e);
				}
			});
			*/
		},
		
		_createMenuItem: function(caption, handler) {
			var item = dojo.widget.createWidget("MenuItem2", {caption: caption, onClick: handler});
			this.popup.addChild(item);
			
			/* don't listen to the event, override the onClick method instead
			dojo.event.connect(item.domNode, "onclick", handler);
			dojo.event.connect(item.domNode, "onkeypress", function(e) {
			alert(e.keyCode);
				if (e.keyCode == dojo.event.browser.keys.KEY_ENTER) { 
					handler(e);
				}
			});
			*/
		},
		
		_createMenuSeparator: function() {
			var w = dojo.widget.createWidget("MenuSeparator2", {});
			this.popup.addChild(w);
		},
		
		// handle the key events
		onButtonKeyPress: function (evt) {
			var node = evt.target;
			
			if (node.id == this.ID_toolbar_display_menu) {
													
				// IE only response to ENTER key
				// Mozilla does not, so use DOWN arrow
				if (evt.keyCode == dojo.event.browser.keys.KEY_ENTER || 
					evt.keyCode == dojo.event.browser.keys.KEY_DOWN_ARROW) {
					if (this.popup != null) {
						if (!this.popup.isShowingNow) {
							this.popup.open(node, this, null);
						} 
					} 
				}
				
			} else if (evt.keyCode == dojo.event.browser.keys.KEY_ENTER) {
				this.onButtonClick(evt);
			}	
		},
		
		// callbacks
		onButtonClick: function(evt){
			var node = evt.target;
			
			if (node.id == this.ID_toolbar_show_glossary) {
				theApp.showGlossary();
			} else if (node.id == this.ID_toolbar_show_index) {
				theApp.showIndex();
			} else if (node.id == this.ID_toolbar_synchronize) {
				theApp.syncContentWithView();
			} else if (node.id == this.ID_toolbar_send_email) {
				this._sendFeedback();
			} else if (node.id == this.ID_toolbar_show_info) {
				this._showInfoPage();
			} else if (node.id == this.ID_toolbar_display_menu) {
				if (this.popup != null) {
					if (!this.popup.isShowingNow) {
						this.popup.open(node, this, null);
					} 
				} 
			} 
		},
		
		_sendFeedback : function() {
			var url = theApp.getBookmarkUrl();
			var feedbackUrl = theApp.feedbackURL;
			var fullUrl = theApp.getContentUrl();
			var configurationTitle = theApp.configurationTitle;

			if ( feedbackUrl == null ) {
				return;
			}
			
			
			if (feedbackUrl.indexOf("http") < 0) {
				if (url != null) {		
					var qFeedbackSubject = feedbackUrl.indexOf("?subject=");
					var aFeedbackSubject = feedbackUrl.indexOf("@subject=");
					if (qFeedbackSubject < 0 && aFeedbackSubject < 0) {
						var qMark = url.indexOf("?");
						feedbackUrl = feedbackUrl + "?subject=";
						if (configurationTitle != null) {
							feedbackUrl = feedbackUrl + escape(configurationTitle) + ": ";
						}
						if (qMark > 0) {
							feedbackUrl =  feedbackUrl + escape(url.substring(0, qMark));
						}
						else {
							feedbackUrl =  feedbackUrl + escape(url);
						}
					}
				}
				var str = feedbackUrl + "&BODY=" + escape(fullUrl);			
				if (str.length > 246) {
					var len = feedbackUrl.length;
				 	if (len > 123) {
				 		if (feedbackUrl.substring(len-1) == "\"") {
				 			feedbackUrl = feedbackUrl.substr(0,122) + "\"";
				 		} else {
				 			feedbackUrl = feedbackUrl.substr(0,123);
				 		}
				 	}
				 	var ix = fullUrl.lastIndexOf("/");
				 	if (ix > 0) {
				 		str = feedbackUrl + "&BODY=.../" + escape(fullUrl.substring(ix+1));	
				 	}
				 	if (str.length > 246) {
				 		str = feedbackUrl + "&BODY=...";	
				 	}
				}
				location.href=str;
			}
			else {
				location.href=feedbackUrl;
			}
		},
		
		_showInfoPage: function() {
			var title = theApp.res.about_box_title;
			var infoFileName = theApp.infoFileName;
			
			var dlg = dojo.widget.byId("ModalFloatingPane");
			dlg.setTitle(title);
			dlg.setUrl(infoFileName);
			dlg.show();
		},
		
		_END : true
	}
);