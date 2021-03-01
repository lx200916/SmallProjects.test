//------------------------------------------------------------------------------
// Copyright (c) 2005, 2006 IBM Corporation and others.
// All rights reserved. This program and the accompanying materials
// are made available under the terms of the Eclipse Public License v1.0
// which accompanies this distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html
// 
// Contributors:
// IBM Corporation - initial implementation
//------------------------------------------------------------------------------

// define the class here so we don't need to load the detail implementations 
ContentPageSubSection = function() {

	this.parent = contentPage;
	// by default, we reuse the images from section
	this.expandImage = this.parent.section.expandImage;		
	this.collapseImage = this.parent.section.collapseImage;
	this.expandAllImage = this.parent.section.expandAllImage;	
	this.collapseAllImage = this.parent.section.collapseAllImage;

	// and use the default test, orerride this as needed
	this.expandAllText = contentPage.res.expandAllSubSectionsText;
	this.collapseAllText = contentPage.res.collapseAllSubSectionsText;	

	this.collapseStepsByDefault = true;
	this.firstStepSection = null;

	this.stepCollapseDivs = null;
	this.stepCollapseLinks = null;
		
};

// Creates the collapsible step section links.
ContentPageSubSection.prototype.createStepLinks = function(tagName, classSelector) {
	
	if (document.getElementsByTagName) {
		var elements = document.getElementsByTagName(tagName);
		if (elements.length == 0) return;
		var stepElements = new Array(elements.length);
		var totalLinks = 0;
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];
			if (element.className == classSelector) {
				stepElements[totalLinks++] = element;
			}
		}
		if (totalLinks == 0) return;
		stepElements.length = totalLinks;
		this.stepCollapseDivs = new Array(totalLinks);
		this.stepCollapseLinks = new Array(totalLinks);
		this.firstStepSection = stepElements[0];
		for (var i = 0; i < stepElements.length; i++) {
			var element = stepElements[i];
			var siblingContainer;
			if (document.createElement && (siblingContainer = document.createElement('div')) && siblingContainer.style) {
				var nextSibling = element.nextSibling;
				element.parentNode.insertBefore(siblingContainer, nextSibling);
				var nextElement = stepElements[i + 1];
				while (nextSibling != nextElement && nextSibling != null) {
					var toMove = nextSibling;
					nextSibling = nextSibling.nextSibling;
					siblingContainer.appendChild(toMove);
				}
				if (this.collapseStepsByDefault) {
    				siblingContainer.style.display = 'none';
    			}
    			siblingContainer.style.display = 'none';
    			this.stepCollapseDivs[i] = siblingContainer;
    			this.createCollapsibleStepSection(element, siblingContainer, i);
			}
			else {
				return;
			}
		}
		this.createExpandCollapseAllStepsLinks(stepElements[0]);
	}
};

// Creates a collapsible step section.
ContentPageSubSection.prototype.createCollapsibleStepSection = function(element, siblingContainer, index) {
	if (document.createElement) {
		var span = document.createElement('span');
		var link = document.createElement('a');
		link.collapseDiv = siblingContainer;
		link.href = '';
		var image = document.createElement('img');
		if (this.collapseStepsByDefault) {
			image.src = this.expandImage;
			image.alt = contentPage.res.expandText;
			image.title = contentPage.res.expandText;	
		}
		else {
			image.src = this.collapseImage;
			image.alt = contentPage.res.collapseText;
			image.title = contentPage.res.collapseText;	
		}
		image.width = '17';
		image.height = '15';
		image.border = '0';
		image.align = 'absmiddle';
		link.appendChild(image);
		
		var self = this;
		link.onclick = /*this.expandCollapseStepSection;*/function(evt) {
			if (this.collapseDiv.style.display == '') {
				this.parentNode.parentNode.nextSibling.style.display = 'none';
				this.firstChild.src = self.expandImage;
				this.firstChild.alt = contentPage.res.expandText;
				this.firstChild.title = contentPage.res.expandText;	
			}
			else {
				this.parentNode.parentNode.nextSibling.style.display = '';
				this.firstChild.src = self.collapseImage;
				this.firstChild.alt = contentPage.res.collapseText;
				this.firstChild.title = contentPage.res.collapseText;					
			}
			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}
			return false;
		};
		this.stepCollapseLinks[index] = link;
		span.appendChild(link);
		element.insertBefore(span, element.firstChild);
		element.appendChild(document.createTextNode(String.fromCharCode(160)));
		element.appendChild(document.createTextNode(String.fromCharCode(160)));
	}
};

					
// Creates the Expand All and Collapse All Steps links.
ContentPageSubSection.prototype.createExpandCollapseAllStepsLinks = function(firstElement) {
	var div;
	var self = this;
	
	if (document.createElement && (div = document.createElement('div'))) {
		div.className = 'expandCollapseLink';
		div.align = 'right';		
		var image = document.createElement('img');
		image.src = this.expandAllImage;
		image.alt = this.expandAllText
		image.title = this.expandAllText
		image.width = '16';
		image.height = '16';
		image.border = '0';
		image.align = 'absmiddle';
		var link = document.createElement('a');
		link.className = 'expandCollapseLink';
		link.href = '';
		link.appendChild(image);
		link.onclick = /*this.expandAllSteps;*/function(evt) {
			 for (var i = 0; i < self.stepCollapseDivs.length; i++) {
			 	self.stepCollapseDivs[i].style.display = '';
			 	self.stepCollapseLinks[i].firstChild.src = self.collapseImage;
			 }
			 if (evt && evt.preventDefault) {
			 	evt.preventDefault();
			 }
			 return false;
		};
		var span = document.createElement('span');
		span.className = 'expandCollapseText';
		span.appendChild(document.createTextNode(this.expandAllText));
		link.appendChild(span);
		div.appendChild(link);
		div.appendChild(document.createTextNode(String.fromCharCode(160)));
		
		image = document.createElement('img');
		image.src = this.collapseAllImage;
		image.alt = this.collapseAllText
		image.title = this.collapseAllText
		image.width = '16';
		image.height = '16';
		image.border = '0';
		image.align = 'absmiddle';
		link = document.createElement('a');
		link.className = 'expandCollapseLink';
		link.href = '';
		link.appendChild(image);
		link.onclick = /*this.collapseAllSteps;*/function(evt) {
			for (var i = 0; i < self.stepCollapseDivs.length; i++) {
				self.stepCollapseDivs[i].style.display = 'none';
				self.stepCollapseLinks[i].firstChild.src = self.expandImage;
			}
			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}
			return false;
		};
		span = document.createElement('span');
		span.className = 'expandCollapseText';
		span.appendChild(document.createTextNode(this.collapseAllText));
		link.appendChild(span);
		div.appendChild(link);
		
		if (this.firstStepSection) {
			this.firstStepSection.parentNode.insertBefore(div, this.firstStepSection);
		}
	}
};


