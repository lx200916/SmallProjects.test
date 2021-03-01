//------------------------------------------------------------------------------
// Copyright (c) 2004, 2007 IBM Corporation.  All Rights Reserved.
//------------------------------------------------------------------------------
// Extends the dojo.widget.ModalFloatingPane to provide additional customization.
//
// Author: Jinhua Xi

dojo.provide("rmc.widget.ModalFloatingPaneEx");

dojo.require("dojo.widget.FloatingPane");

dojo.widget.defineWidget(
	"rmc.widget.ModalFloatingPaneEx",
	dojo.widget.ModalFloatingPane,
	{	
		ns: "rmc",  //Be sure to override the namespace parameter
		
		postCreate: function(args, frag, parentComp){
			rmc.widget.ModalFloatingPaneEx.superclass.postCreate.apply(this, arguments);
		},
	
	
		destroy: function(){
			rmc.widget.ModalFloatingPaneEx.superclass.destroy.apply(this, arguments);
		},
		
		/* override close pane, don't distroy the window, just hide it*/
		closeWindow: function(){
			this.hide();
		},
		
		setTitle: function(title) {
			this.titleBarText.innerHTML = title;
		},
		
 		__END: true
	}
);
