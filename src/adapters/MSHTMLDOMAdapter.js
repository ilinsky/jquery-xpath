/*
 * jQuery XPath plugin (with full XPath 2.0 language support)
 *
 * Copyright (c) 2013 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

var oMSHTMLDOMAdapter	= new cLXDOMAdapter;

//
oMSHTMLDOMAdapter.getProperty	= function(oNode, sName) {
	if (sName == "localName") {
		if (oNode.nodeType == 1)
			return oNode.nodeName.toLowerCase();
	}
	if (sName == "prefix")
		return null;
	if (sName == "namespaceURI")
		return oNode.nodeType == 1 ? "http://www.w3.org/1999/xhtml" : null;
	if (sName == "textContent")
		return oNode.innerText;
	if (sName == "attributes" && oNode.nodeType == 1) {
		var aAttributes	= [];
		for (var nIndex = 0, oAttributes = oNode.attributes, nLength = oAttributes.length, oNode2, oAttribute; nIndex < nLength; nIndex++) {
			oNode2	= oAttributes[nIndex];
			if (oNode2.specified) {
				oAttribute	= new cAttr;
				oAttribute.ownerElement	= oNode;
				oAttribute.ownerDocument= oNode.ownerDocument;
				oAttribute.specified	= true;
				oAttribute.value		=
				oAttribute.nodeValue	= oNode2.nodeValue;
				oAttribute.name			=
				oAttribute.nodeName		=
				//
				oAttribute.localName	= oNode2.nodeName.toLowerCase();
				//
				aAttributes[aAttributes.length]	= oAttribute;
			}
		}
		return aAttributes;
	}
	//
	return cLXDOMAdapter.prototype.getProperty.call(this, oNode, sName);
};
