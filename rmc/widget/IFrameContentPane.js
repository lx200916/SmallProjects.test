//------------------------------------------------------------------------------
// Copyright (c) 2004, 2007 IBM Corporation.  All Rights Reserved.
//------------------------------------------------------------------------------
// A content pane that uses an embedded iframe to display the HTML content.
//
// Author: Jinhua Xi

dojo.provide("rmc.widget.IFrameContentPane");

dojo.widget.defineWidget(
	// widget name and class
	"rmc.widget.IFrameContentPane",
	
	// superclass
	dojo.widget.HtmlWidget,
	
	// properties and methods
	{
		// parameters
		title: "IFrameContentPane",		
		ns: "rmc",  //Be sure to override the namespace parameter
		src: "",  // src url to show in the pane
		
		frame: null,
		//location: null,
		
		currentUrl: null,
		
		//Template paths here are relative to the "dojo" directory containing "dojo.js".
       	templatePath: dojo.uri.dojoUri("../rmc/widget/templates/IFrameContentPane.html"),
        templateCssPath: dojo.uri.dojoUri("../rmc/widget/templates/IFrameContentPane.css"),

		postCreate: function(args, frag, parentComp){
			rmc.widget.IFrameContentPane.superclass.postCreate.apply(this, arguments);
		
			//alert("post create content frame");
			this.frame = dojo.byId(this.widgetId + "_iframe");
			if ( this.frame == null ) {
				//alert("error: no frame");
				return;
			}
			
			
						
			//alert("name: " + this.frame.name);
			//alert("id: " + this.widgetId);
			
			// note: can't use this.frame.location, it does not work
			//alert(this.frame.name);
			//this.location = frames[this.frame.name].location;
			//alert("location: " + this.location);
			
			//alert("created: " + this.frame);			

			if (this.frame.addEventListener) {
				// for mozilla
				this.frame.addEventListener("load", this.onLoad, false);
				//this.frame.addEventListener("click", this.onClick, false);
			}
			else if (this.frame.attachEvent){
				// for IE
				this.frame.detachEvent("onload", this.onLoad); 
				this.frame.attachEvent("onload", this.onLoad);
			
				//this.frame.attachEvent("onclick", this.onClick);
			}
			
			
			// catch the onclick event and navigate the url with replace to avoid history change
			//dojo.event.connect(this.frame, "onclick", function(evt){
			//var win = frames[this.frame.name];
			
				
			if ( this.src != null && this.src != "" ) {
				this.setUrl(this.src);
			}
			
			if ( this.resizeIframe ) {
				this.resizeIframe();
			}
		},
	
		/*
		onClick : function(evt) {
			alert("clicked");
				var node = evt.target;
				name = node.nodeName.toLowerCase();
				if(name == "a" || name == "area"){
					// it is a link, prevent the browser from unloading the page
					evt.preventDefault();
									
					var url = node.href;
					alert("url:" + url);
				}			
		},
		*/		
		fillInTemplate: function(args, frag){
			rmc.widget.IFrameContentPane.superclass.fillInTemplate.apply(this, arguments);
			//alert("fillInTemplate for " + this.frame);
			
			/*
						var frameHtml = "<div>" + 
				"<iframe id=\"rmc_widget_IFrameContentPane_iframe\" " + 
				"name=\"rmc_widget_IFrameContentPane_iframe\" " + 
				"scrolling=\"auto\" marginwidth=\"0\" marginheight=\"0\" frameborder=\"0\" vspace=\"0\" hspace=\"0\" " + 
				"style=\"overflow:auto; width:100%; height:100%; display:block\" >" + 
				"</iframe>" + 
				"</div>";
			this.domNode.innerHTML = frameHtml;
		
			
			var div = document.createElement('div');
			this.frame = document.createElement('iframe');
			this.frame.id = "rmc_widget_IFrameContentPane_iframe";
			this.frame.name = "rmc_widget_IFrameContentPane_iframe";
			this.frame.setAttribute("scrolling", "auto");
			this.frame.setAttribute("marginwidth", "0");
			this.frame.setAttribute("marginheight", "0");
			this.frame.setAttribute("frameborder", "0");
			this.frame.setAttribute("vspace", "0");
			this.frame.setAttribute("hspace", "0");
			this.frame.setAttribute("style", "overflow:auto; width:100%; height:100%; display:block");

			var wh = dojo.html.getMarginBox(this.domNode);
			
			//alert("size: " + wh.width + ", " + wh.height);
			this.frame.width= wh.width;
			this.frame.height= wh.height;


			div.appendChild(this.frame);
			this.domNode.appendChild(div);	
				*/			
		},
		
		destroy: function(){
			rmc.widget.IFrameContentPane.superclass.destroy.apply(this, arguments);
		},
		
		onLoad: function(e){
			//alert("IFrameContentPane: loaded: ");
		
			//alert("loaded: " + this.location.href);
			//rmc.widget.IFrameContentPane.superclass.onLoad.apply(this, arguments);
			//alert("home: " + location.href); 
			//alert("hash: " + location.hash); 
			//this.onResized();
			if ( this.resizeIframe ) {
				this.resizeIframe();
			}
		},
		
		
		resizeSoon: function(){
			// summary
			//	schedule onResized() to be called soon, after browser has had
			//	a little more time to calculate the sizes
			if(this.isShowing()){
				dojo.lang.setTimeout(this, this.onResized, 0);
			}
			
			//alert("resize soon");
		},
		
		onResized: function(){
			rmc.widget.IFrameContentPane.superclass.onResized.apply(this, arguments);	
					
			var wh = dojo.html.getMarginBox(this.domNode);
			
			//alert("onResized size: " + wh.width + ", " + wh.height);
			//this.frame.width= wh.width;
			//this.frame.height= wh.height;
			//this.resizeIframe();
		},
		
		beginSizing: function() {
			this.frame.style.display = "none";
		},
		
		endSizing: function() {
			this.frame.style.display = "block";
		},
		
		_sameUrl: function(url1, url2) {
			if (url1 == url2) {
				return true;
			}
			return this._trimUrl(url1) == this._trimUrl(url2);
		},

		_trimUrl: function(url) {
			if (url == null) {
				return "";
			}

			var i;
			i = url.indexOf("#");
			if (i >= 0) {
				url = url.substring(0, i);
			}

			return url;
		},
		
		saveUrl: function(url) {
			if ( !this._sameUrl(this.currentUrl,url) ) {
				this.currentUrl = url;
			}
		},
		
		_isExternalUrl: function (url) {
			return  url.indexOf("http") == 0 || url.indexOf("file:") == 0; 
		},
		
		setUrl:  function(url, replace) {
			//this.frame.src = url;
						
			// if the url is a local file which does not exist
			// the location object will be invalid
			// so save the url in a seperate variable
			if ( !this._sameUrl(this.currentUrl,url) ) {
				//alert("url set: new url: " + url + "\nold url: " + this.currentUrl);
				this.currentUrl = url;
				
				// this will cause a new history
				// we don't want the iframe load to generate new history
				// since this will mess up the history management system
				// so use location.replace instead
				// works for IE though
				var win = frames[this.frame.name];
				if ( win != null ) {
				
					// this strategy is not perfact since the url navigation within the frame 
					// will cause a new history any way, so fir firefox there will be two history entry for each page
					// we should avoid adding new history in the history handling system
					// so always create history when the url is set
					
					if ( !this._isExternalUrl(url) ) {
						url = theApp.getBaseUrl() + url;
					}
					
					if( replace == true) {
						win.location.replace(url);
					} else {
						win.location.href = url;
					}
				}
			}
		},
		
		getUrl: function() {
		
			return this.currentUrl;
		
			/*
			// this will cause access error if the location object is invalid 
			//alert("getUrl: " + this.location);
			if ( location ) {
				return theApp.getRelativeUrl(location.href);
			} else {
				return "";
			}
			*/
		},
		
		
		resizeIframe: function() {
			if ( this.getUrl() == null ) {
				return;
			}
			
			if (this.frame.contentDocument && this.frame.contentDocument.body.offsetHeight) { 
				this.frame.height = this.frame.contentDocument.body.offsetHeight+FFextraHeight;
			}
			else if (this.frame.Document && this.frame.Document.body.scrollHeight) { 
				this.frame.height = this.frame.Document.body.scrollHeight;
			}
			
			
			/*
			//alert("resizing ...  ");
			var getFFVersion=navigator.userAgent.substring(navigator.userAgent.indexOf("Firefox")).split("/")[1];
			var FFextraHeight=0; //parseFloat(getFFVersion)>=0.1? 16 : 0; //extra height in px to add to iframe in FireFox 1.0+ browsers
		
			if (!window.opera){
			}
			*/
		},
		
	
		_END_: true
	}	
);