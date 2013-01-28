/*
 * jQuery XPath plugin (with full XPath 2.0 language support)
 *
 * Copyright (c) 2013 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

var cAttr	= function() {

};

// Node
cAttr.prototype.nodeType		= 2;
cAttr.prototype.nodeName		=
cAttr.prototype.nodeValue		=
cAttr.prototype.ownerDocument	=
cAttr.prototype.localName		=
cAttr.prototype.namespaceURI	=
cAttr.prototype.prefix			=
cAttr.prototype.attributes		=
cAttr.prototype.childNodes		=
cAttr.prototype.firstChild		=
cAttr.prototype.lastChild		=
cAttr.prototype.previousSibling	=
cAttr.prototype.nextSibling		=
cAttr.prototype.parentNode		=

// Attr
cAttr.prototype.name			=
cAttr.prototype.specified		=
cAttr.prototype.value			=
cAttr.prototype.ownerElement	= null;
