jQuery XPath 2 plugin
=============

This plugin features full XPath 2.0 query language support for HTML and XML documents
in all web browsers. It features DOM-agnostic XPath 2.0 engine [#xpath2.js](https://github.com/ilinsky/xpath2.js).

Usage
-----------------

Grab and include with your page `jquery.xpath2.js` or `jquery.xpath2.min.js` file.
Note that the 'min' does not have detailed error messages.

```html
<script type="text/javascript" src="jquery.xpath2.min.js"></script>
```

API Reference
-----------------

XPath 2 jQuery plugin comes with only two functions:

1. ` $(context).xpath(expression, resolver) `
2. ` $.xpath(context, expression, resolver) `

In both cases function type 'resolver' parameter is optional and is only needed when expression contains prefixes.
The node type 'context' parameter is not neccessary in case expression does not touch document.

### Running queries with context ###

```js
$(document).xpath("*")	// Returns element html (direct child of context item)
$(document).xpath("//head << //body")	// Returns boolean true (head is preceding body)
$(document.body).xpath("count(ancestor-or-self::node())")	// Returns number 3 (head is preceding body)
$(document.documentElement).xpath("body | head")	// Returns element head and body (document-ordered)
$(document.documentElement).xpath("body, head")	// Returns element body and head (not document-ordered)
```

### Running queries that do not require context ###

```js
$().xpath("0.1+0.2")	// Returns number 0.3 (Note: in JavaScript this will return 0.30000000000000004)
$().xpath("xs:date('2012-12-12')-xs:yearMonthDuration('P1Y1M')")	// Returns string '2011-11-12'
$().xpath("2 to 5")	// Returns {number} 1, 2, 3, 4 and 5
$().xpath("for $var in (1, 2, 3) return $var * 3")	// Returns number 3, 6 and 9
$().xpath("xs:double('-INF') castable as xs:decimal)")	// Returns boolean false
```

### Running queries with prefixes ###

```js
var resolver = function(prefix) {
	if (prefix == "my")
		return "http://www.w3.org/1999/xhtml";
};
$(document).xpath("my:body", resolver);	// Returns element body (since 'my' prefix was bound to HTML namespace)
```
