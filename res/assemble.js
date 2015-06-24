(function() {

	var cXMLHttpRequest	= window.XMLHttpRequest || function() {
		return new ActiveXObject("Microsoft.XMLHTTP");
	};

	// Uri utilities
	var hUriCache	= {};
	function fGetUriComponents(sUri) {
		var aResult	= hUriCache[sUri] ||(hUriCache[sUri] = sUri.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/));
		return [aResult[1], aResult[3], aResult[5], aResult[6], aResult[8]];
	};

	function fResolveUri(sUri, sBaseUri) {
		if (sUri == '' || sUri.charAt(0) == '#')
			return sBaseUri;

		var aUri	= fGetUriComponents(sUri);
		if (aUri[0])	// scheme
			return sUri;

		var aBaseUri	= fGetUriComponents(sBaseUri);
		aUri[0]	= aBaseUri[0];	// scheme

		if (!aUri[1]) {
			// authority
			aUri[1]	= aBaseUri[1];

			// path
			if (aUri[2].charAt(0) != '/') {
				var aUriSegments		= aUri[2].split('/'),
					aBaseUriSegments	= aBaseUri[2].split('/');
				aBaseUriSegments.pop();

				var nBaseUriStart	= aBaseUriSegments[0] == '' ? 1 : 0;
				for (var nIndex = 0, nLength = aUriSegments.length; nIndex < nLength; nIndex++) {
					if (aUriSegments[nIndex] == '..') {
						if (aBaseUriSegments.length > nBaseUriStart)
							aBaseUriSegments.pop();
						else {
							aBaseUriSegments.push(aUriSegments[nIndex]);
							nBaseUriStart++;
						}
					}
					else
					if (aUriSegments[nIndex] != '.')
						aBaseUriSegments.push(aUriSegments[nIndex]);
				}
				if (aUriSegments[--nIndex] == '..' || aUriSegments[nIndex] == '.')
					aBaseUriSegments.push('');
				aUri[2]	= aBaseUriSegments.join('/');
			}
		}

		var aResult	= [];
		if (aUri[0])
			aResult.push(aUri[0]);
		if (aUri[1])	// '//'
			aResult.push(aUri[1]);
		if (aUri[2])
			aResult.push(aUri[2]);
		if (aUri[3])	// '?'
			aResult.push(aUri[3]);
		if (aUri[4])	// '#'
			aResult.push(aUri[4]);

		return aResult.join('');
	};

	function fAssemble(descriptor) {
		// get files list
		var oRequest	= new cXMLHttpRequest;
		oRequest.open("GET", descriptor, false);
		oRequest.send(null);

		// read files
		var source	= [];
		for (var n = 0, files	= oRequest.responseText.split(/\n/g), file; n < files.length; n++) {
			if ((file = files[n].replace(/^\s+/, "").replace(/\s+$/, "")) != '' && file.substr(0, 1) != "#") {
				file	= fResolveUri(file, descriptor);
				if (file.match(/.files$/))
					source[source.length]	= fAssemble(file);
				else {
					oRequest.open("GET", file, false);
					oRequest.send(null);
					source[source.length]	= oRequest.responseText;
				}
			}
		}
		return source.join("\n");
	};

	// Get baseUri
	var scripts	= document.getElementsByTagName("script"),
		self	= scripts[scripts.length-1],
		match	= self.src.match(/\?path=(.+)$/);

	//
	self.parentNode.removeChild(self);

	// Remove self
	var code	= fAssemble(match[1] + ".files");

	// Evaluate
	var oScript	= document.getElementsByTagName("head")[0].appendChild(document.createElement("script"));
	oScript.type	= "text/javascript";
	oScript.text	= 	"" +
						"(function(){" +
							code +
						"})();" +
						"";
})();