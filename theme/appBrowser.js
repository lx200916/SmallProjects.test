//------------------------------------------------------------------------------
// Copyright (c) 2004, 2005 IBM Corporation.  All Rights Reserved.
//------------------------------------------------------------------------------
// This class handles the brower related tasks such as bookmarking and history.
// Author: Jinhua Xi

AppBrowser = function(){

	this.initialized = false;
	this.lastBookmark = null;
	this.urlInfo = this.processUrlSegments(location.href);
	this.lastBookmark = this.urlInfo.bookmarkUrl;
	
	// save the current processing history url to acoid adding into history again
	this.currentHistoryBookmark = null;
	
	this.inBackFowardOperation = false;
	
	// need to check the location changes for back/forward button
	this.locationTimer = null;
	
	if ( !dojo.render.html.ie ) {
		this.locationTimer = setInterval("theApp.browser._checkLocation();", 200);
	}
	
	// record the history
	//this.historyStack = [];
	
};

// call this method when url is changed
AppBrowser.prototype.processUrlSegments = function(url) {
	
	var urlInfo = {
		url: url,
		baseUrl: url,
		bookmarkUrl: null,
		queryString: ""
	};

	// bookmark may contains /
	var i = url.indexOf("#");
	if ( i >=0 ) {
		urlInfo.bookmarkUrl = url.substring(i+1);		
		urlInfo.baseUrl = url.substring(0, i);			
	}

	// check if there is parameters, parameters will be in the url part, not the bookmark part
	// we need to append it to the end of the bookmark url
	// what about if the bookmark url contains bookmark itself???
	// handle later, TODO
	i = urlInfo.baseUrl.indexOf("?");
	if ( i > 0 ) {		
		urlInfo.queryString = urlInfo.baseUrl.substring(i);
		urlInfo.baseUrl = urlInfo.baseUrl.substring(0, i);
	}

	if ( urlInfo.queryString != null && urlInfo.bookmarkUrl != null ) {
		urlInfo.bookmarkUrl += urlInfo.queryString;
	}	

	i = urlInfo.baseUrl.lastIndexOf("/");
	if ( i > 0 ) {
		urlInfo.baseUrl = urlInfo.baseUrl.substring(0, i+1);
	}

	if ( urlInfo.bookmarkUrl != null ) {
		// the bookmark url should be relative to the base
		i = urlInfo.bookmarkUrl.indexOf(urlInfo.baseUrl);
		if ( i >=0 ) {
			urlInfo.bookmarkUrl = urlInfo.bookmarkUrl.substring(i+urlInfo.baseUrl.length);
		}
	}

	return urlInfo;
};
	
AppBrowser.prototype.addToHistory = function(bookmarkValue) {

	//alert("histry.length before: " + window.history.length);
	// don't add cuplicate ones repeatedly
	if ( this.lastBookmark == bookmarkValue ) {
		return;
	}
	
	this.lastBookmark = bookmarkValue;
	
	// if in the back/forward operation, don't change the url any more
	if ( !this.inBackFowardOperation && 
		(dojo.render.html.ie || theApp.settings.enableBookmark) ) {
		this._setHash();
	} 
	
	
	this.processUrlSegments(location.href);

	//	alert("histry.length after: " + window.history.length);
	//	alert("histry.length before: " + window.history.length);
		
	this.inBackFowardOperation = false;

};

AppBrowser.prototype._setHash = function() {

	this.inBackFowardOperation = true;
	
	// turn off the timmer before setting the url
	//if ( this.locationTimer != null ) {
	//	clearInternal(this.locationTimer);
	//}

	//if ( dojo.render.html.ie || theApp.settings.enableBookmark) {
	
		//window.location.hash = "#" + this.lastBookmark;
		var newUrl = window.location.href;
		var i = newUrl.indexOf("#");
		if ( i > 0 ) {
			newUrl = newUrl.substring(0, i);
		}

		newUrl += "#" + this.lastBookmark;
		
		window.location.replace(newUrl);
		

	//} 
	
	/*	
	// the following part does not work fully
	// causing many navigation problems, disable it
	// need to find a better solution
	
	
	//	alert("hash: " + window.location.hash);
	//	alert("histry.length before: " + window.history.length);
	
	//var newUrl = window.location.href + "#" + this.lastBookmark;
	//setTimeout("window.location.replace = '"+newUrl+"';", 1);
	

	if ( window.location.hash != "#" + this.lastBookmark 
		&& this.currentHistoryBookmark != this.lastBookmark ) {
		
		//alert("Add to History: " + bookmarkValue);
		
		// clear the currentHistoryBookmark
		this.currentHistoryBookmark = null;
		
		if (!this.initialized) {	
			dojo.undo.browser.setInitialState(this.createState(""));
			this.initialized = true;
		}
		
		var state = this.createState(bookmarkValue);
		dojo.undo.browser.addToHistory(state);		
	}
	*/	
	
}

AppBrowser.prototype._checkLocation = function() {

	if ( dojo.render.html.ie || this.inBackFowardOperation ) {
		return;
	}
	
	var bookmark = theApp.getBookmarkUrl(window.location.href);

	if ( bookmark != this.lastBookmark ) {
		//alert(bookmark + "\n" + this.lastBookmark );
		this.inBackFowardOperation = true;
		theApp.setContentUrl(bookmark, true);
	}
};



AppBrowser.prototype.back = function() {
	window.history.back();
};

AppBrowser.prototype.forward = function() {
	window.history.forward();
};

/*
AppBrowser.prototype.isInHistory = function(bookmarkValue) {
	for ( var i = this.historyStack.length-1; i >=0; i-- ) {
		if ( this.historyStack[i] == bookmarkValue ) {
			return true;
		}
	}
	
	return false;
};

AppBrowser.prototype.createState = function(bookmarkValue){
	var state = new AppState(bookmarkValue);
	return state;
};


AppState = function(bookmarkValue){

	this.changeUrl = bookmarkValue;

};

AppState.prototype.back = function(){
	//alert("BACK to: " + this.changeUrl);
	if( typeof theApp == "undefined") {
		return;
	}
	
	if ( this.changeUrl == null || this.changeUrl == "" ) {
		return;
	}
		
	theApp.browser.currentHistoryBookmark = this.changeUrl;
	theApp.contentContainer.setUrl(this.changeUrl);
};

AppState.prototype.forward = function(){
	//alert("FORWARD to: " + this.changeUrl);
	if( typeof theApp == "undefined") {
		return;
	}
	
	if ( this.changeUrl == null || this.changeUrl == "" ) return;
	
	theApp.browser.currentHistoryBookmark = this.changeUrl;
	theApp.contentContainer.setUrl(this.changeUrl);
};

*/

