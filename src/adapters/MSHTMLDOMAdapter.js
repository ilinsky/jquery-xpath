/*
 * XPath2.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

var oMSHTMLDOMAdapter	= new cLXDOMAdapter;

//
oMSHTMLDOMAdapter.getProperty	= function(oNode, sName) {
	if (sName == "localName")
		return oNode.nodeType == 1 || oNode.nodeType == 2 ? oNode.nodeName.toLowerCase() : null;
	if (sName == "prefix")
		return null;
	if (sName == "namespaceURI")
		return oNode.nodeType == 1 ? "http://www.w3.org/1999/xhtml" : null;
	if (sName == "textContent")
		return oNode.innerText;
	if (sName == "attributes") {
		var aAttributes	= [];
		for (var nIndex = 0, oAttributes = oNode.attributes, nLength = oAttributes.length; nIndex < nLength; nIndex++)
			if (oAttributes[nIndex].specified)
				aAttributes[aAttributes.length]	= oAttributes[nIndex];
		return aAttributes;
	}
	//
	return cLXDOMAdapter.prototype.getProperty.call(this, oNode, sName);
};
