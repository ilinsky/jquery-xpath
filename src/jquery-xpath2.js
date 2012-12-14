/*
 * jQuery XPath 2 plugin (with full XPath 2.0 language support)
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

var cHTMLDocument	= window.HTMLDocument,
	cQuery		= window.jQuery,
	oDocument	= window.document,
	bOldMS	= !!oDocument.namespaces && !oDocument.createElementNS;	// Internet Explorer before 9

//
var oLXDOMAdapter	= new cLXDOMAdapter,
// Create two separate HTML and XML contexts
	oHTMLStaticContext	= new cStaticContext,
	oXMLStaticContext	= new cStaticContext;

// Initialize HTML context (this has default xhtml namespace)
oHTMLStaticContext.baseURI	= oDocument.location.href;
oHTMLStaticContext.defaultFunctionNamespace	= "http://www.w3.org/2005/xpath-functions";
oHTMLStaticContext.defaultElementNamespace	= "http://www.w3.org/1999/xhtml";

// Initialize XML context (this has default element null namespace)
oXMLStaticContext.defaultFunctionNamespace	= oHTMLStaticContext.defaultFunctionNamespace;

//
function fXPath2_evaluate(oQuery, sExpression, fNSResolver) {
	var oNode	= oQuery[0];
	if (typeof oNode == "undefined")
		oNode	= null;

	var oStaticContext	= oNode && (oNode == oDocument || oNode.ownerDocument == oDocument) ? oHTMLStaticContext : oXMLStaticContext;
	oStaticContext.namespaceResolver	= fNSResolver;

	// Create expression
	var oExpression	= new cExpression(sExpression, oStaticContext);

	// Evaluate expression
	var aSequence,
		oSequence	= new cQuery,
		oAdapter	= oLXDOMAdapter;

	// Evaluate expression

	// Determine which DOMAdapter to use based on browser and DOM type
	if (oNode && oNode.nodeType && bOldMS)
		oAdapter	= "selectNodes" in oNode ? oMSXMLDOMAdapter : oMSHTMLDOMAdapter;

	// Evaluate expression
	aSequence	= oExpression.evaluate(new cDynamicContext(oStaticContext, oNode, null, oAdapter));
	for (var nIndex = 0, nLength = aSequence.length, oItem; nIndex < nLength; nIndex++)
		oSequence.push(oAdapter.isNode(oItem = aSequence[nIndex]) ? oItem : cStaticContext.xs2js(oItem));

	return oSequence;
};

// Extend jQuery
var oObject	= {};
oObject.xpath	= function(oQuery, sExpression, fNSResolver) {
	return fXPath2_evaluate(oQuery instanceof cQuery ? oQuery : new cQuery(oQuery), sExpression, fNSResolver);
};
cQuery.extend(cQuery, oObject);

oObject	= {};
oObject.xpath	= function(sExpression, fNSResolver) {
	return fXPath2_evaluate(this, sExpression, fNSResolver);
};
cQuery.extend(cQuery.prototype, oObject);
