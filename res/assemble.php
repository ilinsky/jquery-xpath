<?php
	if (isset($_GET["path"])) {
		$path	= $_GET["path"];
		$prod	= isset($_GET["prod"]) && $_GET["prod"] == "true";

		// Read files
		$output	= fAssemble($path . ".files");

		$output	= fStripTags($output, "Source");

		if ($prod) {
			$output	= fStripTags($output, "Debug");
			$output	= fStripTags($output, "Guard");
		}

		header("Content-type: application/javascript");

		echo 	"" .
//				"var d = new Date;" .
				"(function(){" .
					$output .
				"})();".
//				";alert(new Date - d)" .
				"";
	}
	else {
		echo "GET path parameter missing.";
	}

	function fStripTags($sInput, $sTagName) {
		return preg_replace('/\/\/\->' . $sTagName . '.+\/\/<\-' . $sTagName . '/Us', "", $sInput);
	}

	function fAssemble($descriptor) {
		$files	= file($descriptor);

		$output	= "";
		for ($n = 0; $n < count($files); $n++)
			if (($file = trim($files[$n])) != "" && substr($file, 0, 1) != "#") {
				$file	= fResolveUri($file, $descriptor);
				if (preg_match("/\.files$/", $file, $match))
					$source	.= fAssemble($file);
				else
					$source	.= join('', file($file)) . "\n";
			}
		return $source;
	};

	// Uri utilities
	$hUriCache	= array();
	function fGetUriComponents($sUri) {
		if (!isset($hUriCache[$sUri])) {
			preg_match("/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/", $sUri, $match);
			$hUriCache[$sUri]	= array($match[1], $match[3], $match[5], $match[6], $match[8]);
		}
		return $hUriCache[$sUri];
	};

	function fResolveUri($sUri, $sBaseUri) {
		if ($sUri == '' || substr($sUri, 0, 1) == '#')
			return $sBaseUri;

		$aUri	= fGetUriComponents($sUri);
		if ($aUri[0])	// scheme
			return $sUri;

		$aBaseUri	= fGetUriComponents($sBaseUri);
		$aUri[0]	= $aBaseUri[0];	// scheme

		if (!$aUri[1]) {
			// authority
			$aUri[1]	= $aBaseUri[1];

			// path
			if (substr($aUri[2], 0, 1) != '/') {
				$aUriSegments		= explode("/", $aUri[2]);
				$aBaseUriSegments	= explode("/", $aBaseUri[2]);
				array_pop($aBaseUriSegments);

				$nBaseUriStart	= $aBaseUriSegments[0] == '' ? 1 : 0;
				for ($nIndex = 0, $nLength = count($aUriSegments); $nIndex < $nLength; $nIndex++) {
					if ($aUriSegments[$nIndex] == '..') {
						if ($aBaseUriSegments.length > $nBaseUriStart)
							array_pop($aBaseUriSegments);
						else {
							array_push($aBaseUriSegments, $aUriSegments[$nIndex]);
							$nBaseUriStart++;
						}
					}
					else
						if ($aUriSegments[$nIndex] != '.')
							array_push($aBaseUriSegments, $aUriSegments[$nIndex]);
				}
				if ($aUriSegments[--$nIndex] == '..' || $aUriSegments[$nIndex] == '.')
					array_push($aBaseUriSegments, '');
				$aUri[2]	= implode($aBaseUriSegments, '/');
			}
		}

		$result	= "";
		if ($aUri[0])
			$result	.= $aUri[0];
		if ($aUri[1])	// '//'
			$result	.= $aUri[1];
		if ($aUri[2])
			$result	.= $aUri[2];
		if ($aUri[3])	// '?'
			$result	.= $aUri[3];
		if ($aUri[4])	// '#'
			$result	.= $aUri[4];

		return $result;
	};
?>