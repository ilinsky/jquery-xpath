/*
 * jQuery XPath plugin (with full XPath 2.0 language support)
 *
 * Copyright (c) 2013 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

var oMSXMLDOMAdapter	= new cLXDOMAdapter;

//
oMSXMLDOMAdapter.getProperty	= function(oNode, sName) {
	if (sName == "localName") {
		if (oNode.nodeType == 7)
			return null;
		if (oNode.nodeType == 1)
			return oNode.baseName;
	}
	if (sName == "prefix" || sName == "namespaceURI")
		return oNode[sName] || null;
	if (sName == "textContent")
		return oNode.text;
	if (sName == "attributes" && oNode.nodeType == 1) {
		var aAttributes	= [];
		for (var nIndex = 0, oAttributes = oNode.attributes, nLength = oAttributes.length, oNode2, oAttribute; nIndex < nLength; nIndex++) {
			oNode2	= oAttributes[nIndex];
			if (oNode2.specified) {
				oAttribute	= new cAttr;
				oAttribute.nodeType		= 2;
				oAttribute.ownerElement	= oNode;
				oAttribute.ownerDocument= oNode.ownerDocument;
				oAttribute.specified	= true;
				oAttribute.value		=
				oAttribute.nodeValue	= oNode2.nodeValue;
				oAttribute.name			=
				oAttribute.nodeName		= oNode2.nodeName;
				//
				oAttribute.localName	= oNode2.baseName;
				oAttribute.prefix		= oNode2.prefix || null;
				oAttribute.namespaceURI	= oNode2.namespaceURI || null;
				//
				aAttributes[aAttributes.length]	= oAttribute;
			}
		}
		return aAttributes;
	}
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
