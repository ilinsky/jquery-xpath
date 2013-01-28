jQuery XPath plugin
=============

This plugin is a fully featured XPath 2.0 query language implementation which can be used to query both HTML and XML documents in all web browsers.
It uses the DOM-agnostic XPath 2.0 engine [xpath.js](https://github.com/ilinsky/xpath.js) originally developed for [Ample SDK UI Framework](https://github.com/clientside/amplesdk).

Usage
-----------------

Download and include ` jquery.xpath.js ` or ` jquery.xpath.min.js ` file on your page.
Please be aware that the 'min' version does not have the detailed error messages that the ` jquery.xpath.js ` has but has been efficiently minimised to reduce its file size.

```html
<script type="text/javascript" src="jquery.xpath.js"></script>
```

API Reference
-----------------

jQuery XPath plugin comes with two easy to use entrance points:

1. ` $(context).xpath(expression, resolver) `
2. ` $.xpath(context, expression, resolver) `

In both cases the `resolver` function type parameter is optional and is only needed when the expression contains prefixes.
In cases where the expression does not touch the document, the node type `context` parameter is not required.

Below are the sample queries.

### Running queries with context ###

```js
$(document).xpath("*"); // Returns {Element} html (direct child of context item - document)
$(document).xpath("//head << //body"); // Returns {Boolean} true (head is preceding body)
$(document).xpath("//*[parent::html][last()]") // Returns {Element} body (last child of html)
$(document.body).xpath("count(ancestor::node())"); // Returns {Number} 2 (2 ancestor nodes)
$(document.body).xpath("preceding-sibling::element()"); // Returns {Element} head (prev sibling)
$(document.documentElement).xpath("body | head"); // Returns {Element} head and body (ordered)
$(document.documentElement).xpath("body, head"); // Returns {Element} body and head (not ordered)
```

### Running queries that do not require context ###

```js
$().xpath("0.1+0.2"); // Returns {Number} 0.3 (Note: in JavaScript it returns 0.30000000000000004)
$().xpath("xs:date('2012-12-12')-xs:yearMonthDuration('P1Y1M')"); // Returns {String} '2011-11-12'
$().xpath("2 to 5"); // Returns {Number} 2, 3, 4 and 5
$().xpath("for $var in (1, 2, 3) return $var * 3"); // Returns {Number} 3, 6 and 9
$().xpath("round-half-to-even(35540, -2)"); // Returns {Number} 35500
$().xpath("translate('bar','abc','ABC')"); // Returns {String} BAr
$().xpath("matches('helloworld', 'hello world', 'x')"); // Returns {Boolean} true
$().xpath("xs:double('-INF') castable as xs:decimal)"); // Returns {Boolean} false
$().xpath("1e2 instance of xs:double"); //  Returns {Boolean} true
$().xpath("1.5 cast as xs:integer"); // Returns {Number} 1
```

### Running queries with prefixes ###

```js
$(document).xpath("//my:body", function(prefix) {
	if (prefix == "my")
		return "http://www.w3.org/1999/xhtml";
});	// Returns {Element} body ('my' prefix resolved to XHTML namespace)
```

Error reporting
-----------------
Unlike browser's native XPath 1.0 processing which have very poor error reporting, the jQuery XPath plugin reports syntax and evaluation errors with a great level of detail.
Provided that XPath expressions are not easy, it is extremely helpful to have good level of feedback from the processor.

Below are examples of the detailed error reporting.

### Syntax errors ###
```js
$().xpath("1 to "); // Throws "Error: Expected second operand in range expression"
$().xpath("$*"); // Throws "Error: Illegal use of wildcard in var expression variable name"
$(document).xpath("self::document()"); // Throws "Error: Unknown 'document' kind test"
```

### Evaluation errors ###

```js
$().xpath("1+'2'") // Throws "Error: Arithmetic operator is not defined for provided arguments"
$().xpath("self::node()"); // Throws "Error: In an axis step, the context item is not a node."
$().xpath("max((1,'2'))"); // Throws "Error: Input to max() contains a mix of not comparable values"
```

### XPath 2.0 trace() function ###

``` trace ``` is a very helpful XPath 2.0 function, that will let you print the result of the sub-expression
during its evaluation right into the browser console log.
Function ``` trace ``` requires 2 arguments: first - any type, second - string, it prints its arguments to the console and returns the first argument to the evaluator.

```js
$().xpath("for $a in (1, 2), $b in (3 to 4) return trace($b, 'b: ') - $a"); // See browser console
```

Bear in mind that the items reported will either have a type of nodes, or internal XML Schema data types ;)

