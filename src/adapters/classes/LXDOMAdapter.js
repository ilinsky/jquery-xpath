/*
 * jQuery XPath plugin (with full XPath 2.0 language support)
 *
 * Copyright (c) 2013 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cLXDOMAdapter() {

};

cLXDOMAdapter.prototype	= new cDOMAdapter;

// Create default static context object to enable access implementation functions
var oLXDOMAdapter_staticContext	= new cStaticContext;

// Standard members
cLXDOMAdapter.prototype.getProperty	= function(oNode, sName) {
	// Run native if there is one
	if (sName in oNode)
		return oNode[sName];

	// Otherwise run JS fallback
	if (sName == "baseURI") {
		var sBaseURI	= '',
			fResolveUri	= oLXDOMAdapter_staticContext.getFunction('{' + "http://www.w3.org/2005/xpath-functions" + '}' + "resolve-uri"),
			cXSString	= oLXDOMAdapter_staticContext.getDataType('{' + "http://www.w3.org/2001/XMLSchema" + '}' + "string");

		for (var oParent = oNode, sUri; oParent; oParent = oParent.parentNode)
			if (oParent.nodeType == 1 /* cNode.ELEMENT_NODE */ && (sUri = oParent.getAttribute("xml:base")))
				sBaseURI	= fResolveUri(new cXSString(sUri), new cXSString(sBaseURI)).toString();
		//
		return sBaseURI;
	}
	else
	if (sName == "textContent") {
		var aText = [];
		(function(oNode) {
			for (var nIndex = 0, oChild; oChild = oNode.childNodes[nIndex]; nIndex++)
				if (oChild.nodeType == 3 /* cNode.TEXT_NODE */ || oChild.nodeType == 4 /* cNode.CDATA_SECTION_NODE */)
					aText.push(oChild.data);
				else
				if (oChild.nodeType == 1 /* cNode.ELEMENT_NODE */ && oChild.firstChild)
					arguments.callee(oChild);
		})(oNode);
		return aText.join('');
	}
};

cLXDOMAdapter.prototype.compareDocumentPosition	= function(oNode, oChild) {
	// Run native if there is one
	if ("compareDocumentPosition" in oNode)
		return oNode.compareDocumentPosition(oChild);

	// Otherwise run JS fallback
	if (oChild == oNode)
		return 0;

	//
	var oAttr1	= null,
		oAttr2	= null,
		aAttributes,
		oAttr, oElement, nIndex, nLength;
	if (oNode.nodeType == 2 /* cNode.ATTRIBUTE_NODE */) {
		oAttr1	= oNode;
		oNode	= this.getProperty(oAttr1, "ownerElement");
	}
	if (oChild.nodeType == 2 /* cNode.ATTRIBUTE_NODE */) {
		oAttr2	= oChild;
		oChild	= this.getProperty(oAttr2, "ownerElement");
	}

	// Compare attributes from same element
	if (oAttr1 && oAttr2 && oNode && oNode == oChild) {
		for (nIndex = 0, aAttributes = this.getProperty(oNode, "attributes"), nLength = aAttributes.length; nIndex < nLength; nIndex++) {
			oAttr	= aAttributes[nIndex];
			if (oAttr == oAttr1)
				return 32 /* cNode.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC */ | 4 /* cNode.DOCUMENT_POSITION_FOLLOWING */;
			if (oAttr == oAttr2)
				return 32 /* cNode.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC */ | 2 /* cNode.DOCUMENT_POSITION_PRECEDING */;
		}
	}

	//
	var aChain1	= [], nLength1, oNode1,
		aChain2	= [], nLength2, oNode2;
	//
	if (oAttr1)
		aChain1.push(oAttr1);
	for (oElement = oNode; oElement; oElement = oElement.parentNode)
		aChain1.push(oElement);
	if (oAttr2)
		aChain2.push(oAttr2);
	for (oElement = oChild; oElement; oElement = oElement.parentNode)
		aChain2.push(oElement);
	// If nodes are from different documents or if they do not have common top, they are disconnected
	if (((oNode.ownerDocument || oNode) != (oChild.ownerDocument || oChild)) || (aChain1[aChain1.length - 1] != aChain2[aChain2.length - 1]))
		return 32 /* cNode.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC */ | 1 /* cNode.DOCUMENT_POSITION_DISCONNECTED */;
	//
	for (nIndex = cMath.min(nLength1 = aChain1.length, nLength2 = aChain2.length); nIndex; --nIndex)
		if ((oNode1 = aChain1[--nLength1]) != (oNode2 = aChain2[--nLength2])) {
			//
			if (oNode1.nodeType == 2 /* cNode.ATTRIBUTE_NODE */)
				return 4 /* cNode.DOCUMENT_POSITION_FOLLOWING */;
			if (oNode2.nodeType == 2 /* cNode.ATTRIBUTE_NODE */)
				return 2 /* cNode.DOCUMENT_POSITION_PRECEDING */;
			//
			if (!oNode2.nextSibling)
				return 4 /* cNode.DOCUMENT_POSITION_FOLLOWING */;
			if (!oNode1.nextSibling)
				return 2 /* cNode.DOCUMENT_POSITION_PRECEDING */;
			for (oElement = oNode2.previousSibling; oElement; oElement = oElement.previousSibling)
				if (oElement == oNode1)
					return 4 /* cNode.DOCUMENT_POSITION_FOLLOWING */;
			return 2 /* cNode.DOCUMENT_POSITION_PRECEDING */;
		}
	//
	return nLength1 < nLength2 ? 4 /* cNode.DOCUMENT_POSITION_FOLLOWING */ | 16 /* cNode.DOCUMENT_POSITION_CONTAINED_BY */ : 2 /* cNode.DOCUMENT_POSITION_PRECEDING */ | 8 /* cNode.DOCUMENT_POSITION_CONTAINS */;
};

cLXDOMAdapter.prototype.lookupNamespaceURI	= function(oNode, sPrefix) {
	// Run native if there is one
	if ("lookupNamespaceURI" in oNode)
		return oNode.lookupNamespaceURI(sPrefix);

	// Otherwise run JS fallback
	for (; oNode && oNode.nodeType != 9 /* cNode.DOCUMENT_NODE */ ; oNode = oNode.parentNode)
		if (sPrefix == this.getProperty(oChild, "prefix"))
			return this.getProperty(oNode, "namespaceURI");
		else
		if (oNode.nodeType == 1)	// cNode.ELEMENT_NODE
			for (var oAttributes = this.getProperty(oNode, "attributes"), nIndex = 0, nLength = oAttributes.length, sName = "xmlns" + ':' + sPrefix; nIndex < nLength; nIndex++)
				if (this.getProperty(oAttributes[nIndex], "nodeName") == sName)
					return this.getProperty(oAttributes[nIndex], "value");
	return null;
};

// Element/Document object members
cLXDOMAdapter.prototype.getElementsByTagNameNS	= function(oNode, sNameSpaceURI, sLocalName) {
	// Run native if there is one
	if ("getElementsByTagNameNS" in oNode)
		return oNode.getElementsByTagNameNS(sNameSpaceURI, sLocalName);

	// Otherwise run JS fallback
	var aElements	= [],
		bNameSpaceURI	= '*' == sNameSpaceURI,
		bLocalName		= '*' == sLocalName;
	(function(oNode) {
		for (var nIndex = 0, oChild; oChild = oNode.childNodes[nIndex]; nIndex++)
			if (oChild.nodeType == 1) {	// cNode.ELEMENT_NODE
				if ((bLocalName || sLocalName == this.getProperty(oChild, "localName")) && (bNameSpaceURI || sNameSpaceURI == this.getProperty(oChild, "namespaceURI")))
					aElements[aElements.length]	= oChild;
				if (oChild.firstChild)
					arguments.callee(oChild);
			}
	})(oNode);
	return aElements;
};