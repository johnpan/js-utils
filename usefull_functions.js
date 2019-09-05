(function (window) {

	// native to replace jQuery selector function -----
	function $0 (what) {
        // function to minimize "document.querySelectorAll" length!
        let elements = document.querySelectorAll(what);
        if (elements.length == 1) return elements[0];
        return elements;
	}
	
	// jQuery functions -----------------------------------------------------------------------

	function apiCall(method, endpoint, data, successFn, failFn, extraHeaders, randomParamBool) {
		randomParamBool = randomParamBool ? randomParamBool : false;
		var rand = randomParamBool ? "?rand=" + Math.round(Math.random() * 10000) : "";

		return $.ajax({
			type : method,
			async : true,
			url : endpoint + rand,
			contentType : 'application/json',
			success : successFn,
			error : failFn,
			data : data,
			beforeSend : function (xhr) {
				if (extraHeaders) {
					for (header in extraHeaders) {
						xhr.setRequestHeader(header, extraHeaders[header]);
					}
				}
			}
		});
	}

	function mapColumn(table, which, fn) {
		if ('function' == typeof fn) {
			$("#" + table + " td:nth-child(" + which + ")").each(function () {
				$(this).text(fn($(this).text()));
			});
		} else {
			say('not a function');
			return 'not a function';
		}
	}

	function removeRowContainsText(tableId, txt) {
		var counter = 0;
		$("#" + tableId + " tr td:contains(" + txt + ")").each(function () {
			$(this).parent().remove();
			counter++;
		});
		return counter;
	}

	function removeRowNotContainsText(tableId, txt) {
		var counter = 0;
		$("#" + tableId + " tr:not(:contains(" + txt + "))").each(function () {
			$(this).remove();
			counter++;
		});
		return counter;
	}

	function replaceTDtext(tableId, oldTxt, newTxt) {
		var counter = 0;
		$("#" + tableId + " tr td:contains('" + oldTxt + "')").each(function () {
			$(this).text(newTxt);
			counter++;
		});
		return counter;
	}

	function scrollToCurrent($jqObj, offsetHeight) {
		var win = $(window);
		win.scrollTop($jqObj.offset().top - offsetHeight);
	}

	function hideTableColumn(tableId, colNo) {
		/**
		 * hides a column of a table
		 * @param  {stirng} tableId the table selectos
		 * @param  {Number} colNo   the number of the column
		 */
		// columnNumber is not zero based
		$("#" + tableId + " td:nth-child(" + colNo + "), #" + tableId + " th:nth-child(" + colNo + ")").hide();
	}

	function showTableColumn(tableId, colNo) {
		/**
		 * shows a hidden column of a table
		 * @param  {stirng} tableId the table selectos
		 * @param  {Number} colNo   the number of the column
		 */
		// columnNumber is not zero based
		$("#" + tableId + " td:nth-child(" + colNo + "), #" + tableId + " th:nth-child(" + colNo + ")").show();
	}

	if ($ && $.fn) {
		$.fn.textify = function () {
			/* extend jQuery to textify a link (<a> tag) */
			this.each(function () {
				$(this).replaceWith($(this).text());
			});
		}
	}

	// Array functions -----------------------------------------------------------------------

	Array.prototype.unique = function () {
		// returns uniqe items of an array
		var n = {},
		r = [];
		for (var i = 0; i < this.length; i++) {
			if (!n[this[i]]) {
				n[this[i]] = true;
				r.push(this[i]);
			}
		}
		return r;
	}

	Array.prototype.findObjects = function (prop, val) {
		// function returns an array with the found object(s) or an empty array
		// needs optimization. Add a parameter for exact much OR indexOf
		if (!this || !this[0])
			return [];
		if (!this[0][prop]) {
			console.log("no such property");
			return [];
		}
		return this.filter(function (pairItem) {
			if (pairItem[prop] == val)
				return true;
			if (pairItem[prop].indexOf(val) > -1)
				return true;
		});
	}

	Array.prototype.sortInteger = function (ascBool) {
		/* sorts an array by numeric values.
		 * @param  {boolean} ascBool ascending or descending sort
		 */
		if (typeof ascBool === 'undefined')
			ascBool = true;
		var factor = (ascBool) ? 1 : -1
		return this.sort(function (a, b) {
			return factor * (a - b)
		})
	}

	Array.prototype.chunk = function (chunkSize) {
		/* returns an array of arrays that contain the elements of the arr each having max length chunksize
		example var ar1 = [0,1,2,3,4];
		var ar2 = ar1.chunkArray(2);
		ar2 -> [[0,1],[2,3],[4]]
		 */
		var chunkedArray = [],
		i,
		len;
		for (i = 0, len = this.length; i < len; i += chunkSize) {
			chunkedArray.push(this.slice(i, i + chunkSize));
		}
		return chunkedArray;
	}

	Array.prototype.pushObjectIfUniqueProp = (obj, prop) => {
		/**
		 * pushes the object in the array if there is no other object with object.prop === val in the array
         * @param  {Object} obj     the object to be pushed into the array
		 * @param  {string} prop    the property of the object to search for uniqueness
		 * @return {Boolean}        returns true true if object was pushed in array, else false
		 */
		const found = this.some( i => {
			return i[prop] === obj[prop];
        });
		if (!found) this.push(obj);
		return !found;
	},

	Array.prototype.addUnique = function (value) {
		/**
		 * pushes value to the array if it is not already there
		 * @param {mixed} value the value to be pushed into the array
		 * @return {bool} returns true of the item was pushed into the array
		 */
		//
		if (this.indexOf(value) !== -1) {
			return false;
		}
		this.push(value);
		return true;
	}

	Array.prototype.filterByProp = function (prop) {
		/**
		 * filters the array of objects so that prop has unique values
		 * @param  {string} prop the property of the object to search for uniqueness
		 * @return {array} returns a new array
		 */
		var oldValues = [],
		retArray = [];
		this.forEach(function (itemObj) {
			if (oldValues.indexOf(itemObj[prop]) === -1) {
				oldValues.push(itemObj[prop]);
				retArray.push(itemObj);
			}
		});
		oldValues = null; // to garbage collection
		return retArray;
	}

	Array.prototype.getObjPropVals = function (prop) {
		// returns an array of all values of <prop> property in all objects of the array
		var retArr = [];
		len = this.length
			for (var i = 0; i < len; i++) {
				retArr.push(this[i][prop]);
			}
			return retArr;
	}

	Array.prototype.toRawArray = function (propNames) {
		/* creates an array of arrays of property values from an array of objects*/
		var props = propNames;
		if (arguments.length > 1 && !Array.isArray(propNames)) {
			// the call was not with one array, but one argument per element, so, build array to map
			props = new Array(arguments.length);
			for (var i = 0; i < props.length; ++i) {
				props[i] = arguments[i];
			}
		} else if (arguments.length == 0) {
			// get all props in array if wanted are not defined
			props = [];
			for (var key in this[0]) {
				props.push(key);
			}
		}
		return this.map(function (obj) {
			return props.map(function (prop) {
				return obj[prop];
			})
		});
	}

    function ruleOut(arr, filterObj, exactMatch) {
        /*
        returns array without the filtered rows. FilterObj has filter array for all unwanted values for each field
        example:
        var unwantedFieldsFilter: {	userName: ['Mary', 'Joe'],	job: ['actor'],	language: ['English', 'Italian', 'Spanish', 'Greek']	};
        var actors = [{userName:"Mary", job:"star", language:"Turkish"},{userName:"John", job:"actor", language:"Turkish"},{userName:"Takis", job:"star", language:"Greek"},{userName:"Joe", job:"star", language:"Turkish"},{userName:"Bill", job:"star", language:"Turkish"}	];
        var filteredActors = actors.ruleOut(unwantedFieldsFilter)
            */
        exactMatch = !!exactMatch;
        var validate = function validateFn(row) {
            //debugger;
            for (var field in filterObj) {
                var val = row[field];
                if (val) {
                    console.log("compare " + val + " with " + filterObj[field]);
                    // one of the unwanted properties exist in row item, check the value now
                    if (exactMatch && filterObj[field].indexOf(val) > -1)
                    {
                        // we should rule out this row
                        return false;					
                    } 
                    else if (!exactMatch) {
                        return filterObj[field].filter(function(filterValue){ 
                            return (val.indexOf(filterValue)>-1);
                        }).length == 0;					
                    }
                }
            }
            return true;
        };
        var returnedArray = arr.filter(validate);
        return returnedArray;
    }

    function removeDuplicates (collection, keyname) {
        // returns an array of objs with no duplicates in obj.keyname
        var output = [], keys = [];
        collection.map(function (item) {
            var key = item[keyname];
            if (keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });
        return output;
    }

	// String functions -----------------------------------------------------------------------
		
	String.prototype.replaceAll = function(searchStr, replaceStr) {
		var str = this;    
		// escape regexp special characters in search string
		searchStr = searchStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');    
		return str.replace(new RegExp(searchStr, 'gi'), replaceStr);
	};

	String.prototype.replaceSlashes = function (replacer) {
		var find = '/';
		var re = new RegExp(find, 'g');
		return this.replace(re, replacer);
	}

	String.prototype.capitalize = function () {
		/**
		 * Capitalizes the first letter of the string
		 * @return {string}
		 */
		return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
	}

	String.prototype.camelCase = function () {
		/* capitalizes each word
		 * @return {[type]} [description]
		 */
		return this.split(" ").map(function (strElement) {
			return strElement.charAt(0).toUpperCase() + strElement.slice(1).toLowerCase();
		}).join(" ");
	}

	String.prototype.attachFileName = function (filename) {
		/* function adds filename string to string if it's not already there. Checks for slash also.
		USE: somePath = somePath.attachFileName("imsmanifest.xml"); */
		var attached = "";
		if (this.indexOf(filename) < 0) {
			// if it does not contain the filename
			if (this.charAt(this.length - 1) != "/" && filename.charAt(0) != "/") {
				// if needs to add a slash
				attached += "/";
			}
			attached += filename;
		}
		return String(this + attached);
	}

	String.prototype.attachURLParams = function (paramsObj, overWriteBool) {
		/* function adds parameters from json paramsObj to url string
		will work even if param already exists in the string.
		Overwrites existing params by default
		USE: var params = {var1:"value1", var2:"value2"}
		someURL = "http://www.test.com";
		someURL = someURL.attachURLParams(params);
		returns: http://www.test.com?var1=value1&var2=value2*/
		if (overWriteBool !== false)
			overWriteBool = true;
		var ind = this.indexOf('?');
		var buildString = function buildStringFn(mainPart, paramsObject) {
			var attached = "?";
			for (var key in paramsObject) {
				attached += key + "=" + paramsObject[key] + "&";
			}
			// remove last "&" and return
			return String(mainPart + attached).slice(0, -1);
		}

		if (ind > -1) {
			var param_array = this.substring(ind + 1).split('&');
			var oldParamsObj = {},
			theLength = param_array.length;
			// keep all existing params in params object
			for (var i = 0; i < theLength; i++) {
				var x = param_array[i].toString().split('=');
				oldParamsObj[x[0]] = x[1];
			}
			// add new params to oldObj
			for (var key in paramsObj) {
				// skip if already there or not
				if (oldParamsObj[key] && !overWriteBool)
					continue;
				oldParamsObj[key] = paramsObj[key];
			}
			// build the string from scratch
			return buildString(this.slice(0, ind), oldParamsObj);
		} else {
			// no params in string, just add all mine
			return buildString(this, paramsObj);
		}
	}

	String.prototype.addCommas = function () {
		var value = this;
		value += '';
		var x = value.split('.'),
		x1 = x[0],
		x2 = x.length > 1 ? '.' + x[1] : '',
		rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	}

	String.prototype.countMatches = function (matchStr) {
		return this.split(matchStr).length - 1;
	}

	String.prototype.lastSegment = function (splitChar) {
		splitChar = splitChar || "/";
		var parts = this.split(splitChar);
		return parts.pop() || parts.pop();
    }

    function pathShorten (str, maxLength, removeFilename) {
        var splitter = str.indexOf('/')>-1 ? '/' : "\\",
            tokens = str.split(splitter), 
            removeFilename = !!removeFilename,
            maxLength = maxLength || 25,
            drive = str.indexOf(':')>-1 ? tokens[0] : "",  
            fileName = tokens[tokens.length - 1],
            len = removeFilename ? drive.length  : drive.length + fileName.length,	  
            remLen = maxLength - len - 5, // remove the current lenth and also space for 3 dots and 2 slashes
            path, lenA, lenB, pathA, pathB;	   
        //remove first and last elements from the array
        tokens.splice(0, 1);
        tokens.splice(tokens.length - 1, 1);
        //recreate our path
        path = tokens.join(splitter);
        //handle the case of an odd length
        lenA = Math.ceil(remLen / 2);
        lenB = Math.floor(remLen / 2);
        //rebuild the path from beginning and end
        pathA = path.substring(0, lenA);
        pathB = path.substring(path.length - lenB);
        path = drive + splitter + pathA + "..." + pathB + splitter ;
        path = path + (removeFilename ? "" : fileName);	
        //console.log(tokens, maxLength, drive, fileName, len, remLen, pathA, pathB);
        return path;
    }		
		
	// SharePoint functions -----------------------------------------------------------------------

	function checkHostListExistsOrCreate(listName, createFn, okFn, errFn) {
		/* createFn must return a promise
		example  function createFnForTeachersList() { return spyreqs.jsom.createHostList(listObj); }
		 */
		if (spyreqs) {
			spyreqs.jsom.checkHostList(listName).then(
				function (listExistsBool) {
				if (listExistsBool) {
					say("list already exists: " + listName);
					okFn();
				} else {
					$app_Message.text('Please wait while creating list... ');
					say("creating list: " + listName);
					createFn().then(okFn, errFn);
				}
			},
				function (error) {
				alert(Resources.getResource('checkHostList request failed. ') + error.args.get_message() + '\n' + error.args.get_stackTrace());
			});
		} else {
			errFn("spyreqs not found")
		}
	}

	// Other -----------------------------------------------------------------------

	function toBoolean(str) {
		if (typeof str === 'undefined' || str === null) {
			return false;
		} else if (typeof str === 'string') {			
			switch (str.toLowerCase()) {
			case 'false':
			case 'no':
			case '0':
			case "":
				return false;
			default:
				return true;
			}
		} else if (typeof str === 'number') {
			return str !== 0
		}
		else {return true;}
	}
		
		
	function getRandomColor(param) {
		let options = "0123456756789ABC89ABCDEF";
		switch (param) {
			case "light":
				options = "89ABCDEF";
				break;
			case "middle":
				options = "56789ABC";
				break;
			case "dark":
				options = "01234567";
				break;
		}
		let letters = options.split('');
		let lettersLength = letters.length;
		let color = '#';
		for (let i = 0; i < 6; i++) {
			color += letters[Math.round(Math.random() * (lettersLength - 1))];
		}
		return color;
	}

	function renderTemplate(template, obj) {
		/**
		 * given a template and a key-value object,it replaces the strings wrapped in {{}} with values from the obj
		 * @param {string} template the template to render
		 * @param {Object} obj the object to use its properties to replace strings in template
		 * @returns{string} the template rendered
		 */
		var keysToFind = [],
		rendered = template;
		var regex = new RegExp("{{(.*?)}}", "g");
		keysToFind = template.match(regex);
		keysToFind.forEach(function (key) {
			var k = key.replace("{{", "").replace("}}", "");
			var val = obj[k];
			if (val != null) {
				// != instead of !== because we want to avoid entering this block if undefined
				// "Yes/No" instead of "true/false"
				val = (val.toString().toLowerCase() === "false") ? "No" : val;
				val = (val.toString().toLowerCase() === "true") ? "Yes" : val;
			} else {
				val = "";
			}
			rendered = rendered.replace(key, val);
		});
		return rendered;
	}

	function renderString(template, ...replacers) {
		// convert all {{*}} to {{}}
		var regex = new RegExp("{{(.*?)}}", "g");
		keysToFind = template.match(regex);
		keysToFind.forEach(function (key) {
			template = template.replace(key, "{{}}");
		});

		replacers.map(function (item) {
			template = template.replace("{{}}", item);
		});
		return template;
	}
	
	function _renderString() {
		if (arguments.length > 0) {
			var template = arguments[0];
			for (var i = 1, len = arguments.length; i < len; i++) {
				template = template.replace("{{}}", arguments[i])
			}
		}
		return template;
	}

	function format(template, obj) {
		/* this is a new version of renderTemplate function, enriched with C# String.Format functionallity.
		it can render values from an object or an array or from the arguments as an array.
		The template must surround the placeholders with {{ and }}. */
		
		function getSafe(references) {
			/* returns null if empty string or null or undefined, else the value
			 * works good for undefined props of existing obj */
			var safeVals = [];
			if (arguments.length > 0) {
				var len = arguments.length;
				for (var i = 0; i < len; i++) {
					safeVals.push(getVal(arguments[i]));
				}
			}
			if (safeVals.length == 1)
				return safeVals[0];
			return safeVals;

			function getVal(val) {
				if (val === false || val === 0)
					return val;
				if (!val || /^\s*$/.test(val))
					return null;
				return val;
			}
		}
		
		function flattenObject(obj) {
			/* returns an array of the key values */
			var arr = [];
			for (var prop in obj) {
				arr.push(obj[prop]);
			}
			return arr;
		};

		var len = arguments.length,
		keysToFind = [],
		rendered = template,
		isArr = Array.isArray(obj),
		isObj = (typeof(obj) == "object") && !isArr,
		i = 0,
		paramsArr = [];
		if (len == 0)
			return null;
		if (len == 1)
			return template;
		if (len == 2 && isObj) {
			paramsArr = flattenObject(obj);
		} else if (len == 2 && isArr) {
			paramsArr = obj;
		} else {
			for (var f = 1; f < len; f++) {
				paramsArr.push(arguments[f]);
			}
		}
		var regex = new RegExp("{{(.*?)}}", "g");
		keysToFind = template.match(regex);
		if (keysToFind == null)
			return template; // no double bracket found
		keysToFind.forEach(function (key) {
			var k = key.replace("{{", "").replace("}}", ""),
			emptyBracket = (getSafe(k) == null),
			val = (isObj && !emptyBracket) ? obj[k] : paramsArr[i];
			if (getSafe(val) == null && !emptyBracket) {
				val = k; // keep the bracket value
			}
			rendered = rendered.replace(key, val);
			i++;
		});
		return rendered;
	}

	function say(...args) {
		args.forEach((el) => console.log(el))
		return "Done: Say";

		/* No good method version for say(object)
		function say(...args) {
		console.log.apply(console, args.join(",\n").split(","));
		// even better: console.log.apply(console, args.map(elem => elem + "\n"));
		return "Done: Say";
		}
		}*/
	}

	function urlParamsObj(source) {
		/* function returns an object with url parameters
		URL sample: www.test.com?var1=value1&var2=value2
		USE:	var params = URLparamsObj();
		alert(params.var2)  --> output: value2
		You can use it for a url-like string also: urlParamsObj("www.ok.uk?a=2&b=3")*/
		var urlStr = source ? source : window.location.search ? window.location.search : ""
			if (urlStr.indexOf("?") > -1) { // if there are params in URL
				var param_array = urlStr.substring(urlStr.indexOf("?") + 1).split('&'),
				theLength = param_array.length,
				params = {},
				i = 0,
				x;
				for (; i < theLength; i++) {
					x = param_array[i].toString().split('=');
					params[x[0]] = x[1];
				}
				return params;
			}
			return {};
	}

	function evalFromTo(str) {
		/* returns array with nums from a string template like
		"1,2,[4-14],15, 17-28, 30", with or without '[]' */
		var zipArr = [],
		arr = str.split(",");
		arr.map(function (item) {
			var newItem = item.trim();
			if (isNaN(Number(newItem))) {
				// not a number, check if equals'[min-max]'
				if (newItem.indexOf("-") > 0) {
					// get min & max numbers
					var boundariesArr = newItem.split("-");
					var min = boundariesArr[0];
					var max = boundariesArr[1];
					if (isNaN(Number(min))) {
						// not a number because string is '[min'
						min = min.substr(1);
						max = max.substr(0, max.length - 1);
					}
				}
				zipArr = zipArr.concat(populateIds(Number(min), Number(max)));
			} else {
				// number, just push it
				zipArr.push(Number(newItem));
			}
		});
		return zipArr;

		function populateIds(lowEnd, highEnd) {
			var list = [],
			i;
			for (i = lowEnd; i <= highEnd; i++) {
				list.push(i);
			}
			return list;
		}
	}

	function jsonAnalyze(obj) {
		var arr = [];
		analyzeJson(obj, null, arr);
		logBeautifiedDotNotation(arr);
		return arr;

		function analyzeJson(obj, parentStr, outArr) {
			var opt;
			if (!outArr) {
				return "no output array given"
			}
			for (var prop in obj) {
				if (Array.isArray(obj[prop]) && obj[prop] !== null) {
					//say(prop + ' is array');
					var arr = obj[prop];
					if ((Array.isArray(arr[0]) || typeof arr[0] == "object") && arr[0] != null) {
						//say('   ... of obj/arrays')
						opt = parentStr ? parentStr + '.' + prop : prop;
						analyzeJson(arr[0], opt + '[]', outArr);
					} else {
						//say('   ... of values')
						opt = parentStr ? parentStr + '.' + prop : prop;
						outArr.push(opt + '[]');
					}
				} else if (typeof obj[prop] == "object" && obj[prop] !== null) {
					//say(prop + ' is object');
					analyzeJson(obj[prop], prop, outArr);
				} else {
					if (obj.hasOwnProperty(prop) && typeof obj[prop] != 'function') {
						//say(prop + ' is a key');
						opt = parentStr ? parentStr + '.' + prop : prop;
						outArr.push(opt);
					}
				}
			}
		}

		function logBeautifiedDotNotation(arr) {
			arr.map(function (item) {
				var dotsAmount = item.split(".").length - 1;
				var dotsString = Array(dotsAmount + 1).join("    ");
				console.log(dotsString + item)
			});
		}
	}
	
	function trimChar (origString, charToTrim, leaveWhiteSpaceAfterReplace) {
		leaveWhiteSpaceAfterReplace = !!leaveWhiteSpaceAfterReplace;
		var escapeRegExp = function (strToEscape) {
			// Escape special characters for use in a regular expression
			return strToEscape.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		};

		charToTrim = escapeRegExp(charToTrim);
		var regEx = new RegExp("^[" + charToTrim + "]+|[" + charToTrim + "]+$", "g");
		return leaveWhiteSpaceAfterReplace ? origString.replace(regEx, "") : origString.replace(regEx, "").trim();
	};

	function cloneSimpleObject(origin) {
		return JSON.parse(JSON.stringify(origin));
	}

	function whenDefined(mustEval, mustEvalTrue) {
		var second = 1000,
		minute = 60 * second;
		var thisPromiseRequest = {
			requestedAt : Date.now(),
			library : mustEval,
			tests : [mustEval, mustEvalTrue],
			promiseInstance : null
		}

		function check(o, f) {
			if (f) {
				if (eval("window." + o) && 'function' == typeof eval("window." + f) && eval("window." + f + "();"))
					return true;
			} else {
				if (eval("window." + o))
					return true;
			}
			return false;
		}

		function checkDefinitions() {
			var lengthBeforeCheck = whenDefined_promises.length;
			// check resolve/reject
			var checkedPromisesArr = whenDefined_promises.filter(function (promiseContainer) {
					var obj = promiseContainer.tests[0];
					var fn = promiseContainer.tests[1];
					if (check(obj, fn)) {
						// console.log("resolving: " + obj)
						whenDefined_promises
						.findObjects("library", obj)[0]
						.promiseInstance
						.resolve(true);
					} else if (Date.now() - promiseContainer.requestedAt > window.whenDefined_timeOutLimit) {
						whenDefined_promises
						.findObjects("library", obj)[0]
						.promiseInstance
						.reject("timeout");
					} else {
						// allow pending request in array
						return true;
					}
					// return false to remove this promise from new array
					return false;
				});
			if (lengthBeforeCheck == whenDefined_promises.length) {
				// no changes to promises array while filtering
				whenDefined_promises = checkedPromisesArr;
			} else {
				// missed some promises while looping with map
				for (var i = lengthBeforeCheck; i < whenDefined_promises.length; i++) {
					checkedPromisesArr.push(whenDefined_promises[i]);
					// say("pushed missed: " + whenDefined_promises[i].library)
				}
				whenDefined_promises = checkedPromisesArr;
			}
			if (whenDefined_promises.length == 0) {
				// stop checking
				clearInterval(whenDefined_loadingTimeout);
				// force re-init next time
				whenDefined_promises = null;
			}
		}

		function init() {
			// say("initializing whenDefined");
			if (!Array.prototype.findObjects) {
				Array.prototype.findObjects = function (prop, val) {
					// function returns an array with the found object(s) or an empty array
					// needs optimization. Add a parameter for exact much OR indexOf
					if (!this || !this[0])
						return [];
					if (!this[0][prop]) {
						console.log("no such property");
						return [];
					}
					return this.filter(function (pairItem) {
						if (pairItem[prop] == val)
							return true;
						if (pairItem[prop].indexOf(val) > -1)
							return true;
					});
				}
			}
			window.whenDefined_promises = [];
			window.whenDefined_loadingTimeout = 0;
			window.whenDefined_timeOutLimit = 1 * minute + 30 * second;
			window.whenDefined_checkDefinitions = checkDefinitions;
			whenDefined_loadingTimeout = setInterval(whenDefined_checkDefinitions, 500);
		}
		// init array of promises if not there
		if (!window.whenDefined_promises)
			init();
		// look for stored promise request
		var promiseContainer = whenDefined_promises.findObjects("library", thisPromiseRequest.library)[0];
		if (promiseContainer) {
			// found promise so just return it
			return promiseContainer.promiseInstance.promise();
		} else {
			// push promise request and return promise()
			thisPromiseRequest.promiseInstance = new $.Deferred();
			// say("pushing:",thisPromiseRequest)
			whenDefined_promises.push(thisPromiseRequest);
			return thisPromiseRequest.promiseInstance.promise();
		}
	}

	function getSafe_old(references) {
		/* returns null if empty string or null or undefined, else the value
		 * works good for undefined props of existing obj */
		var safeVals = [];
		if (arguments.length > 0) {
			var len = arguments.length;
			for (var i = 0; i < len; i++) {
				safeVals.push(getVal(arguments[i]));
			}
		}
		if (safeVals.length == 1)
			return safeVals[0];
		return safeVals;

		function getVal(val) {
			if (val === false || val === 0)
				return val;
			if (!val || /^\s*$/.test(val))
				return null;
			return val;
		}
	}

	function getSafe(valuePath) {
		try { return eval(valuePath); } 
		catch (err) { return null; }
	}
	
	function randomString() {
		// random string to use as non-standarized id 
		return btoa(Math.random());
		// or: Math.random().toString(36).substr(2)
	}

	function rrandom() {
		// get a real random
		return crypto.getRandomValues(new Uint32Array(1))[0];
	}

	function getJQuery() {
		if (typeof jQuery !== "undefined") {
			console.log("jQuery exists: " + jQuery.fn.jquery);
			return;
		}
		var $script = document.createElement('script');
		$script.src = "//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js";
		document.getElementsByTagName('head')[0].appendChild($script);
		window._interval_get$ = setInterval(function checkLoaded() {
				console.log("wait...");
				if (window.$ && typeof window.$.extend === 'function') {
					console.log("$ ready");
					clearInterval(window._interval_get$);
				}
			}, 1000);
	}

	function performanceTest(testFunction, data, iterations) {
		/* counts execution time of a function */
		/* sample 
			function keepInRange0(val, min, max){	val = val < min ? min : val; val = val > max ? max : val;	return val;	}
			function keepInRange1(val, min, max){	val = Math.min(max, val); val = Math.max(min, val);	return val;	}
			var testData = [ 	[5,1,10],	[.1,1,10],	[.00000000000000000000000000000000000000000000000000000000000000001,1,10],			[100000000000000000000000000000000000000000000000000000000000000001,1,10] ];
			performanceTest(keepInRange0, testData, 1000000);
			performanceTest(keepInRange1, testData, 1000000);
		*/
		var sum = 0, dataIndex=0, dataLength = data.length;
		var start = performance.now();
		for (var i = 0; i < iterations; i++, dataIndex++) {
		testFunction(...data[dataIndex]);
		dataIndex = (dataIndex < dataLength-1) ? dataIndex : -1;
		}
		var time=performance.now() - start;
		return time;
	}
	
	function keepInRange(val, min, max){
		val = val < min ? min : val;
		val = val > max ? max : val;
		return val;	
	}
		
	function rotateElement(el, delay) {
		// return if el is not valid element
		var elem = document.getElementById(el);
		if (elem == null) {
			console.log('elem not found to rotate');
			return;
		}
		// initialize rotator. 
		if (typeof window.rotatorLoaded == 'undefined') {		
			window.rotatorLoaded = true;
			window.rotatorDegrees = 0;
			window.rotatorLooper = 0;
			window.transformProp = "WebkitTransform" //"transform";
			
			var browsersProperties = {
				"Chrome" : "WebkitTransform",
				"Firefox" : "MozTransform",
				"MSIE" : "msTransform",
				"Opera" : "OTransform"
			};
	 
			for (key in browsersProperties) {
				if (navigator.userAgent.match(key)) {
					window.transformProp = browsersProperties[key];
					break;
				}
			}		
		}
		
		rotatorDegrees++;
		if (rotatorDegrees > 359) {
			rotatorDegrees = 1;
		}
		if (delay == 0) {
			// delay to 0 means we need to stop spinning
			rotatorDegrees = 0;
			clearTimeout(rotatorLooper);
		} else {
			rotatorLooper = setTimeout('rotateElement(\'' + el + '\',' + delay + ')', delay);
		}
		elem.style[window.transformProp] = "rotate(" + rotatorDegrees + "deg)";
	}

	
	function fibonacci(n) {

		//console.log('called for ' + n);
		
		if (!this.stack) {
			this.stack = [];
			console.log ('stack created');
		}
		
		if (n < 3) return 1;
		
		if (stack[n]) {
			console.log(`stored: (${n}):` + stack[n])
			return stack[n];
		}
		
		let a = fibonacci(n-1) + fibonacci(n-2);
		stack[n] = a;
		
		//console.table(stack);
		return a;
	}

	// expose functions to window
	window.say = say;
	window.jp = {
		SP : {
			checkHostListExistsOrCreate
		},
		$ : {
			apiCall,
			removeRowNotContainsText,
			removeRowContainsText,
			replaceTDtext,
			scrollToCurrent,
			hideTableColumn,
			showTableColumn,
			mapColumn,
		},
		whenDefined,
		urlParamsObj,
		evalFromTo,
		jsonAnalyze,
		getRandomColor,
		format,
		cloneSimpleObject,
		getSafe,
		getJQuery,
		renderTemplate,
		renderString,
		rrandom,
		trimChar,
		toBoolean,
		keepInRange,
        ruleOut,
        removeDuplicates,
		pathShorten,
		
		isUndefined: function (objName) {
			try {
				return "undefined" == typeof objName
			} 
			catch (e) {
				return true;
			}
		},

		isPromise : function (obj) {
			return typeof obj.then == 'function';
		},

		isObject : function (obj) {
			return typeof(obj) == "object" && !Array.isArray(obj) && obj != null && obj != "" && !(obj instanceof String) ;
		},
		
		// sample: delayPromiser(3000)("data 1").then(console.log)
		delayPromiser : (delay) => {
			return (data) => {
				var p = new Promise ( (res, rej) => {
					setTimeout(function () {
						res("delayed ("+ (delay || 1000) +"): " + data);
					}, delay || 1000);			
				});				
				return p;
			}	
		},
		
		resolvePromise : (data) => { return Promise.resolve ("immediately: " + data)},
		
		// sample: adderTo100 = adderPlusBase(100) // adderTo100(1,2) // returns: 103
		adderPlusBase : (base) => (...args) => args.reduce((...nums) => nums[0] + nums[1], base),

		rnd : (digits=4) => {
			return (Math.random()+"").substr(-digits); // wrap with Number() ?
		},

		now : () => {
			const d = new Date();
			return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
		},

		replaceObjectInArray = (arr, obj, prop) => {
			// replace an object in array using prop as id
			let replaced = false;
			arr.forEach( (item, i, _arr) => { 
				if (item[prop] == obj[prop]) {
					_arr[i] = obj;
					replaced = true;
				}
			});
			return replaced;
		},
		
		isObjectEqual : (o1, o2, ignorePropsArr=[]) => {
			// Deep Clone objects
			let _obj1 = JSON.parse(JSON.stringify(o1)),
				_obj2 = JSON.parse(JSON.stringify(o2));
			// Remove props to ignore
			ignorePropsArr.map( p => { 
				eval('_obj1.'+p+' = _obj2.'+p+' = "IGNORED"');
			});
			// compare as strings
			let s1 = JSON.stringify(_obj1),
				s2 = JSON.stringify(_obj2);
			// return [s1==s2,s1,s2];
			return s1==s2;
		},


		
		
	};
}
	(window));
