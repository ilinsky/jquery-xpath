/*
 * jQuery XPath 2 plugin (with full XPath 2.0 language support)
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

var oMSXMLDOMAdapter	= new cLXDOMAdapter;

//
oMSXMLDOMAdapter.getProperty	= function(oNode, sName) {
	if (sName == "localName")
		return oNode.nodeType == 7 ? null : oNode.baseName;
	if (sName == "prefix" || sName == "namespaceURI")
		return oNode[sName] || null;
	if (sName == "textContent")
		return oNode.text;
	//
	return cLXDOMAdapter.prototype.getProperty.call(this, oNode, sName);
};

// Document object members
oMSXMLDOMAdapter.getElementById	= function(oDocument, sId) {
	return oDocument.nodeFromID(sId);
};

/*oMSXMLDOMAdapter.getElementById	= function(oNode, sId) {
	return oNode.selectSingleNode('/' + '/' + '*[@id="' + sId + '"]');
};*/
