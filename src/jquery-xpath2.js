/*
 * jquery-xpath2.js - jQuery XPath plugin (with full XPath 2.0 language support)
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

var cHTMLDocument	= window.HTMLDocument,
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
function fXPath2_evaluate(sExpression, oQuery, fNSResolver) {
	var oNode	= oQuery[0];
	if (typeof oNode == "undefined")
		oNode	= null;

	var oStaticContext	= oNode && (oNode == oDocument || oNode.ownerDocument == oDocument) ? oHTMLStaticContext : oXMLStaticContext;
	oStaticContext.namespaceResolver	= fNSResolver;

	// Create expression
	var oExpression	= new cExpression(sExpression, oStaticContext);

	// Evaluate expression
	var aSequence,
		oSequence	= new jQuery,
		oAdapter	= oLXDOMAdapter;

	// Evaluate expression

	// Determine which DOMAdapter to use based on browser and DOM type
	if (oNode && oNode.nodeType && bOldMS)
		oAdapter	= "selectNodes" in oNode ? oMSXMLDOMAdapter : oMSHTMLDOMAdapter;

	// Evaluate expression
	aSequence	= oExpression.evaluate(new cDynamicContext(oExpression.staticContext, oNode, null, oAdapter));
	for (var nIndex = 0, nLength = aSequence.length, oItem; nIndex < nLength; nIndex++)
		oSequence.push(oAdapter.isNode(oItem = aSequence[nIndex]) ? oItem : cStaticContext.xs2js(oItem));

	return oSequence;
};

// Extend jQuery
jQuery.extend(jQuery, {
	"xpath":	function(sExpression, oQuery, fNSResolver) {
		return fXPath2_evaluate(sExpression, oQuery instanceof jQuery ? oQuery : new jQuery(oQuery), fNSResolver);
	}
});

jQuery.extend(jQuery.prototype, {
	"xpath":	function(sExpression, fNSResolver) {
		return fXPath2_evaluate(sExpression, this, fNSResolver);
	}
});