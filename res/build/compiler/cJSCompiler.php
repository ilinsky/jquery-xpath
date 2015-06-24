<?php
	class cJSCompiler
	{
		var $output		= "";
		var $aStrings	= array();

		var $keyword	= "munged";
		var $debug		= false;

		function cJSCompiler() {

		}

		function readFromString($sString) {
			$this->output	= $sString;
		}

		function readFromFile($sFileName) {
			$this->output	= $this->output . join("", file($sFileName));
		}

		function getOutput() {
			return $this->output;
		}

		function addOmmitArray($aOmmit) {
			for ($nIndex = 0; $nIndex < count($aOmmit); $nIndex++)
				$this->addOmmitString($aOmmit[$nIndex]);
		}

		function addOmmitString($sString) {
			if (!in_array($sString, $this->aStrings))
				array_push($this->aStrings, $sString);
		}

		function stripComments() {
			$sData	= $this->output;

			// Strip '//' comments
			$sData	= str_replace('://', '?????', $sData);
			$sData	= preg_replace('/\/\/.*(\r?\n)/', "", $sData);
			$sData	= str_replace('?????', '://', $sData);

			// Strip '/* comment */' comments
			$sData	= preg_replace('/\/\*.+\*\//Us', "", $sData);

			$this->output	= $sData;
		}

		function stripSpaces() {
			$sData	= $this->output;

			// replace tabs with spaces
			$sData	= str_replace("	",				" ",		$sData);

			// Strip ' : ' spaces around
			$sData	= preg_replace('/\s*([=\+\-\*\/\?\:\|\&\^\!<>\{\},%;\(\)])\s*/', '\\1', $sData);
			//
			$sData	= preg_replace('/\s*(if|for|with|do|while|try|catch)\s+/', '\\1', $sData);

			// strip carriage returns
			$sData	= preg_replace("/\r\n|\r|\n/",	"",			$sData);
			// strip all more than one spaces
			$sData	= preg_replace("/\s\s+/",		" ",		$sData);

			// Additional tweaks
			$sData	= str_replace(";}",			"}",		$sData);

			$this->output	= $sData;
		}

		/*
		 * Obfuscates variables (starting with any known variable prefix)
		 *
		 */
		function obfuscateVariables() {
			$sData	= $this->output;

			preg_match_all('/[^a-zA-Z]([a-z][A-Z][a-zA-Z0-9_]+)/', $sData, $aTemp);

			$aValues	= array_unique($aTemp[1]);
			sort($aValues);
			reset($aValues);

//			$aValues	= $this->_normalizeArray($aTemp[1]);

			// Debug
			if ($this->debug)
				echo "Processing local variables:\n";

			for ($nIndex = count($aValues)-1; $nIndex >= 0; $nIndex--) {
				$sReplace	= /*$nIndex < 26 ? chr(97 + $nIndex) :*/ $this->createToken($nIndex);

				$sData	= str_replace($aValues[$nIndex], $sReplace, $sData);
//				$sData	= preg_replace('/(\W)' . $aValues[$nIndex] . '(\W)/',	'$1' . $sReplace . '$2',	$sData);

				// Debug
				if ($this->debug)
					echo $aValues[$nIndex] . " [" . count(array_intersect($aTemp[1], array($aValues[$nIndex]))). "] -> " . $sReplace . "\n";
			}
			// Debug
			if ($this->debug)
				echo "\n";

			$this->output	= $sData;
		}

		/*
		 * Obfuscates private properties (starting with "_" prefix)
		 *
		 */
		function obfuscatePrivates() {
			$sData	= $this->output;

			preg_match_all('/(\._[a-z_]+)/i', $sData, $aTemp);
			$aValues	= array_unique($aTemp[1]);
			sort($aValues);
			reset($aValues);

			// Debug
			if ($this->debug)
				echo "Processing private members:\n";

			for ($nIndex = count($aValues)-1; $nIndex >= 0; $nIndex--) {
				$sReplace	= "." . $this->createToken($nIndex);
				$sData		= str_replace($aValues[$nIndex], $sReplace, $sData);

				// Debug
				if ($this->debug)
					echo $aValues[$nIndex] . " [" . count(array_intersect($aTemp[1], array($aValues[$nIndex]))). "] -> " . $sReplace . "\n";
			}
			// Debug
			if ($this->debug)
				echo "\n";

			$this->output	= $sData;
		}

		function obfuscateStrings() {
			$sData		= $this->output;
			$sDataTemp	= $sData;
			if (count($this->aStrings))
				$sDataTemp	= str_replace($this->aStrings, array_fill(0, count($this->aStrings), ""), $sDataTemp);

			// find "values"
			preg_match_all('/\"([a-z0-9_\-+\#\:\;\/\.]{2,})\"/i', $sDataTemp, $aTempValues);

			// find .properties
			preg_match_all('/\.(\$?[a-z][a-z0-9_]{2,})/i', $sDataTemp, $aTempProperties);
/*
			$this->aStrings	= array_unique(array_merge($this->aStrings, $aTempValues[1], $aTempProperties[1]));
			sort($this->aStrings);
			reset($this->aStrings);
*/
			$this->aStrings	= $this->_normalizeArray(array_merge($this->aStrings, $aTempValues[1], $aTempProperties[1]));

			// Debug
			if ($this->debug)
				echo "Processing public properties and string values:\n";

			// manually replace most used property "prototype"
			$sData	= str_replace(".prototype", "[$]", $sData);

			// Strings
			for ($nIndex = count($this->aStrings)-1; $nIndex >= 0; $nIndex--)
				$sData	= str_replace(	'"' . $this->aStrings[$nIndex] . '"',	"_[" . $nIndex . ']',	$sData);

			// Properties
			for ($nIndex = count($this->aStrings)-1; $nIndex >= 0; $nIndex--) {
/*
				$sData	= str_replace(	'.' . $this->aStrings[$nIndex],			"[_[" . $nIndex . ']]',	$sData);
*/
				$sData	= preg_replace(	'/\.' .
											str_replace(
												array('/', '.', '$'),
												array('\/', '\.', '\$'),
												$this->aStrings[$nIndex]
											). '(?!\w)/',	"[_[" . $nIndex . ']]',	$sData);

				// Debug
				if ($this->debug)
					echo $this->aStrings[$nIndex] . " [" . count(array_intersect(array_merge($aTempValues[1], $aTempProperties[1]), array($this->aStrings[$nIndex]))). "]\n";
			}

			// Debug
			if ($this->debug)
				echo "\n";

			$this->output		= $sData;
		}

		function obfuscate() {
			// get or create obfuscated properties
			$nWString		= array_search("String",		$this->aStrings);
			if (!$nWString)
				$nWString	= array_push($this->aStrings, "String") - 1;
			$nWMath			= array_search("Math",			$this->aStrings);
			if (!$nWMath)
				$nWMath		= array_push($this->aStrings, "Math") - 1;
			$nWRegExp		= array_search("RegExp",		$this->aStrings);
			if (!$nWRegExp)
				$nWRegExp	= array_push($this->aStrings, "RegExp") - 1;
			$nWFunction		= array_search("Function",		$this->aStrings);
			if (!$nWFunction)
				$nWFunction	= array_push($this->aStrings, "Function") - 1;
			$nWlength		= array_search("length",		$this->aStrings);
			if (!$nWlength)
				$nWlength	= array_push($this->aStrings, "length") - 1;
			$nWreplace		= array_search("replace",		$this->aStrings);
			if (!$nWreplace)
				$nWreplace	= array_push($this->aStrings, "replace") - 1;
			$nWsplit		= array_search("split",			$this->aStrings);
			if (!$nWsplit)
				$nWsplit	= array_push($this->aStrings, "split") - 1;
			$nWfromCharCode	= array_search("fromCharCode",	$this->aStrings);
			if (!$nWfromCharCode)
				$nWfromCharCode	= array_push($this->aStrings, "fromCharCode") - 1;
			$nWcharCodeAt	= array_search("charCodeAt",	$this->aStrings);
			if (!$nWcharCodeAt)
				$nWcharCodeAt	= array_push($this->aStrings, "charCodeAt") - 1;
			$nWfloor		= array_search("floor",			$this->aStrings);
			if (!$nWfloor)
				$nWfloor	= array_push($this->aStrings, "floor") - 1;

			$output	= $this->output;
			$sKeyWords	= "";
			$nShift		= 1;

			if (true) {
				$aKeyWords	= array();
				$aKeyWords	= array_merge($aKeyWords, array("in", "break", "case", "catch", "continue", "default", "delete", "else", "for", "function", "if", "instanceof", "new", "return", "throw", "typeof", "switch", "try", "var", "while", "with"));
				$aKeyWords	= array_merge($aKeyWords, array("false", "null", "true"));
				$aKeyWords	= array_merge($aKeyWords, array("arguments", "this", "window"));
				$aKeyWords	= array_merge($aKeyWords, array("[_[", "]]", "[$]"));
				$aKeyWords	= array_merge($aKeyWords, array("[]", "{}", "()", "&&", "||", "===", "==", "!!", "!==", "!=", "+=", "-=", "++", "--", "<=", ">="));

				// replace js keywords
				for ($nIndex = count($aKeyWords) - 1; $nIndex >= 0; $nIndex--)
					$output	= str_replace($aKeyWords[$nIndex], ($nIndex % 10) . chr(122 - floor($nIndex/10)), $output);

				// encode keywords
				$sKeyWords	= join(" ", $aKeyWords);
				$sKeyWords2	= "";
				for ($nIndex = strlen($sKeyWords) - 1; $nIndex >= 0; $nIndex--)
					$sKeyWords2	.= chr(ord(substr($sKeyWords, $nIndex, 1)) + $nShift);
				$sKeyWords	= $sKeyWords2;
			}

			$m	= $this->keyword[0];
			$u	= $this->keyword[1];
			$n	= $this->keyword[2];
			$g	= $this->keyword[3];
			$e	= $this->keyword[4];
			$d	= $this->keyword[5];

			// create JS wrapper
			$sData	=	"(function({$m},{$u},{$n},{$g},{$e},{$d}){";
			if (true) {
				// decode js keywords
				$sData.=	"for({$g}={$u}[{$d}[$nWlength]]-1;{$g}>=0;{$g}--)".
								"{$n}+={$e}[{$d}[$nWString]][{$d}[$nWfromCharCode]]({$u}[{$d}[$nWcharCodeAt]]({$g})-$nShift);";
				// restore js source
				$sData.=	"{$u}={$n}[{$d}[$nWsplit]](' ');".
							"for({$g}={$u}[{$d}[$nWlength]]-1;{$g}>=0;{$g}--)".
								"{$m}={$m}[{$d}[$nWreplace]]({$e}[{$d}[$nWRegExp]]({$g}%10+({$e}[{$d}[$nWString]][{$d}[$nWfromCharCode]](122-{$e}[{$d}[$nWMath]][{$d}[$nWfloor]]({$g}/10))),'g'),{$u}[{$g}]);";
			}

			// execute source
			$sData	.=		"{$e}[{$d}[$nWFunction]]('_','$',{$m})({$d},{$d}[" . array_search("prototype", $this->aStrings) . "])";

			$sData	.=	"})(".
							"\"" . str_replace("\'", "'", addslashes($output)) . "\"," .
							"\"" . addslashes($sKeyWords) ."\",".
							"''," .
							"0," .
							"this,".
							"'" . join(" ", $this->aStrings) . "'.split(' ')".
						");";

			$this->output	= $sData;
		}

		function obfuscate2() {
			$output	= $this->output;

			// Restore prototype to proper reference
//			$output	= str_replace("[$]", "[_[0]]", $output);

			$sData	=	"(function($,_,_\$){"
						. str_replace("window", "_\$", $output)
						. "})('prototype','" . join(" ", $this->aStrings) . "'.split(' '),window)";

			$this->output	= $sData;
		}

		function _normalizeArray($aTemp) {
			$aValuesTemp	= array();
			for ($nIndex = count($aTemp) - 1; $nIndex >= 0; $nIndex--) {
				if (array_key_exists($aTemp[$nIndex], $aValuesTemp))
					$aValuesTemp[$aTemp[$nIndex]]++;
				else
					$aValuesTemp[$aTemp[$nIndex]]	= 1;
			}
			arsort($aValuesTemp);
//			print_r($aValuesTemp);
			$aValues = array_keys($aValuesTemp);
			return $aValues;
		}

		var $reservedTokens	= array("as", "do", "if", "in", "is", "for"/*, "let"*/, "var");
		var $alphabet	= "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

		function createToken($nIndex) {
			$sToken	= $nIndex < 52
							? substr($this->alphabet, $nIndex, 1)
							: substr($this->alphabet, (int) ($nIndex / 52), 1) . substr($this->alphabet, $nIndex % 62, 1);
			$nPosition = array_search($sToken, $this->reservedTokens);

			return $nPosition ? "_" . chr(97 + $nPosition % 62) : $sToken;
		}
	}
?>