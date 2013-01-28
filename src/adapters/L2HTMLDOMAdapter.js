/*
 * jQuery XPath plugin (with full XPath 2.0 language support)
 *
 * Copyright (c) 2013 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

var oL2HTMLDOMAdapter	= new cLXDOMAdapter;

//
oL2HTMLDOMAdapter.getProperty	= function(oNode, sName) {
	if (sName == "localName") {
		if (oNode.nodeType == 1)
			return oNode.localName.toLowerCase();
	}
	if (sName == "namespaceURI")
		return oNode.nodeType == 1 ? "http://www.w3.org/1999/xhtml" : null;
	//
	return cLXDOMAdapter.prototype.getProperty.call(this, oNode, sName);
};