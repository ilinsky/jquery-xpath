/*
 * jQuery XPath plugin (with full XPath 2.0 language support)
 *
 * Copyright (c) 2013 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

// Source code loader
(function() {
	// Get base folder
	var scripts	= document.getElementsByTagName("script"),
		self	= scripts[scripts.length-1],
		base	= self.src.replace(/\/?[^\/]+$/, '/');
	// Remove self
	self.parentNode.removeChild(self);
	// Include loader
	document.write('<script type="text/javascript" src="' + base + '../res/assemble.js?path=' + base + '"></script>');
})();
