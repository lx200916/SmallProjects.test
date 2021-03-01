//------------------------------------------------------------------------------
// Copyright (c) 2004, 2007 IBM Corporation.  All Rights Reserved.
//------------------------------------------------------------------------------
// Displays a search field and performs search operation via an applet or
// serlvet. The search result is displayed in the Search view.
//
// Author: Jinhua Xi
// Author: Alfredo Bencomo

dojo.provide("rmc.widget.SearchWidget");

dojo.widget.defineWidget(
	// widget name and class
	"rmc.widget.SearchWidget",
	
	// superclass
	dojo.widget.HtmlWidget,
	
	// properties and methods
	{
		// parameters
		title: "SearchWidget",		
		ns: "rmc",  //Be sure to override the namespace parameter

		// settings
		moreOption: false,
		isContainer: true,
		
		form: null,
		
		applet: null,
		
		appletInitialized : false,
		
		//Template paths here are relative to the "dojo" directory containing "dojo.js".
        templatePath: dojo.uri.dojoUri("../rmc/widget/templates/SearchWidget.html"),
        templateCssPath: dojo.uri.dojoUri("../rmc/widget/templates/SearchWidget.css"),

		postCreate: function() {
					
			// if search is not enabled, hide the widget
			// note: at this moment, the search result pane might not be created yet
			if ( !theApp.settings.enableSearch ) {
				this.hide();
				return;
			}
						
			
			if ( this.isAppletSearch() ) {
				
			 	form = new dojo.io.FormBind({
					formNode: "searchForm"
					/* 
					This caused server error under IE.
					don't bind any url and load function
					instead, make direct applet search in onSubmit event
					load: this._loadForm,
					error: function(type, error, e) { 
						//dj_debug(e.message);
						//dj_debug(e.responseText); 
						alert("e.message: " + e.message);
						alert("e.responseText: " + e.responseText);
					}
					*/
				});
				
			}
			else {
				form = new dojo.io.FormBind({
					url: theApp.settings.searchServlet,
					formNode: "searchForm",
					load: this._loadForm,
					encoding: "utf8",
					error: function(type, error, e) { 
						dj_debug(e.message);
						dj_debug(e.responseText); 
						
					}
				});	
			}
			
			
			form.onSubmit = dojo.lang.hitch(this, function() { 
			
				if (theApp.searchScopeWidget != null ) {						
					form.bindArgs.content = { hitsPerPage: theApp.searchScopeWidget.getResultPerPage() };
				}
									
				searchMessage = theApp.res.searchWidget_inprogress;				

				
				// make sure the pane is visible
				theApp.showSearchResultPane();
				theApp.searchResultPane.setContent(searchMessage);

				if ( this.isAppletSearch() ) {
					var waitForInit = !this.appletInitialized;
					this._bindApplet();
					
					// if applet is just initialized, we need to wait till the applet is really initialized			
					if ( waitForInit ) {
						var self = this;
						setTimeout(function () { self._runApplet(); }, 300);
						
					} else {
						this._runApplet();
					}
				}

				return true;
				
			});			
		},
		
		fillInTemplate: function(args, frag){
			if (!document.getElementById("SearchApplet") && theApp.settings.searchServlet == null) {
				var body = dojo.body();
	    			var div = document.createElement("div");
			   	div.setAttribute("id", "SearchApplet");
			   	body.appendChild(div);
			}
		},		
		
		isSearchEnabled: function() {
			return theApp.settings.enableSearch && (theApp.searchResultPane != null);
		},
		
		isAppletSearch: function() {
			return (theApp.settings.searchServlet == null);
		},
		
		getApplet: function() {
			//alert(this.applet);
			
			return this.applet;
		},
		
		getAppletNextPage: function()
		{
			var html  = this.getApplet().getNextPageResult() + "";
			theApp.searchResultPane.setContent(html);
			
		},
		
		getServerPrevNextPage: function(url)
		{
			theApp.searchResultPane.setUrl(url);
		},

		getAppletPrevPage: function()
		{
			var html  = this.getApplet().getPrevPageResult() + "";
			theApp.searchResultPane.setContent(html);
			
		},
	
	
		_runApplet: function() {
		
			var searchString = document.searchForm.searchInput.value;
			//alert("searchString: " + searchString);
			var hitsPerPage = 10; 
			var dataArray = [];
			if (theApp.searchScopeWidget != null ) {						
				hitsPerPage = theApp.searchScopeWidget.getResultPerPage();
				//alert("hitsPerPage: " + hitsPerPage);
				dataArray = theApp.searchScopeWidget.getSearchScopeData();
				//alert("dataArray: " + dataArray);
			}

			// parse the search filter data into the search
			// TODO
			var html  = this.getApplet().runSearch(searchString, hitsPerPage) + "";

			// firfox's file url is file://///
			// IE's pattern file://, but also works for file://///
			// the returned html contains absolute path
			// for network file sharing, the path is in the "file://" format
			// which does not work for firefox
			if ( theApp.getBaseUrl().indexOf("file://///") == 0 ) {
				html = html.replace(/file:\/\//g, "file://///");
			}
						
			//alert("search returned: " + html);
			theApp.searchResultPane.setContent(html);
			theApp.showSearchResultPane();
		
		},
		
		_loadForm: function(type, data, e) {
			errorMessage = theApp.res.searchWidget_errorMessage;
	
			try {
				var self = theApp.searchWidget;
				
				if ( self.isAppletSearch() ) {
					self._runApplet();

				} else {
					// relay the server response to cpane.setContent
					theApp.searchResultPane.setContent(data);
					theApp.showSearchResultPane();
				}
				
			}
			catch (error) {
			    alert(errorMessage + ": " + error);
			}
		},
		
				

		_bindApplet: function() {
		
			if ( this.appletInitialized ) {
				return;
			}
			
			// with IBM JRE 1.4, set inner html does not load the applet
			// change to create the dom object instead
			
			/*
			//alert("binding applet");

			// Using object detection to detect browser support for applet
			var html;
			if (document.applets) {
				html = "<APPLET ARCHIVE=\"applet/SearchApplet.jar,search/epf-web-search.jar,search/lucene-core-1.9.1.jar,search/icu4j_3_4.jar,applet/localization/\" CODEBASE=\".\" CODE=\"com.ibm.rmc.search.SearchApplet.class\" NAME=\"SearchApplet\" WIDTH=1 HEIGHT=1 MAYSCRIPT></APPLET>";
			}
			else {			
				html = "<object classid=\"clsid:8AD9C840-044E-11D1-B3E9-00805F499D93\" width=1 height=1 name=\"SearchApplet\" codebase=\".\">" +
				"<param name=CODE value=\"com.ibm.rmc.search.SearchApplet.class\">" +
				"<param name=ARCHIVE value=\"applet/SearchApplet.jar,search/epf-web-search.jar,search/lucene-core-1.9.1.jar,search/icu4j_3_4.jar,applet/localization/\">" +
				"<param name=NAME value=\"SearchApplet\">" +
				"<param name=\"type\" value=\"application/x-java-applet;version=1.4.2\">" +
				"<param name=\"scriptable\" value=\"true\">" +
				"<comment>" +
				"<embed type=\"application/x-java-applet;version=1.4.2\" CODE=\"com.ibm.rmc.search.SearchApplet.class\" CODEBASE=\".\" ARCHIVE=\"applet/SearchApplet.jar,search/epf-web-search.jar,search/lucene-core-1.9.1.jar,search/icu4j_3_4.jar,applet/localization/\" NAME=\"SearchApplet\" WIDTH=1 HEIGHT=1 HIDDEN=TRUE TARGET=\"ory_doc\" MAYSCRIPT=true scriptable=true pluginspage=\"http://java.sun.com/products/archive/j2se/1.4.2_12/index.html\">" +
				"<noembed>" +
				"<\/noembed>" +
				"<\/embed>" +
				"<\/comment>" +
				"<\/object>";
			}
			
			dojo.byId("SearchApplet").innerHTML = html;
			
			*/
			
			var el = dojo.byId("SearchApplet");
			
			this.applet = document.createElement('APPLET');
			this.applet.name = "SearchApplet";
			this.applet.width="1px";
			this.applet.height="1px";
			
			this.applet.setAttribute("ARCHIVE", "applet/SearchApplet.jar,search/epf-web-search.jar,search/lucene-core-1.9.1.jar,search/icu4j_3_4.jar,applet/localization/");
			this.applet.setAttribute("CODEBASE", ".");
			this.applet.setAttribute("CODE", "com.ibm.rmc.search.SearchApplet.class");
			this.applet.setAttribute("MAYSCRIPT", "true");
			
			el.appendChild(this.applet);
			
			this.appletInitialized = true;
		}		
	}	
);