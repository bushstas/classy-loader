const {getOptions} = require('loader-utils');
const path = require('path');
const fileSystem = require("fs");
const cssConsts = require(path.resolve(__dirname, '..', 'cssconsts'));

const OPTIONS = {},
	  CLASSNAMES = '__classy',
	  DELIMITER = '-',
	  OBFUSCATED_LENGTH = 7,
	  MIN_OBFUSCATED_LENGTH = 3,
	  MAX_OBFUSCATED_LENGTH = 10,
	  ATTRIBUTE_NAME = 'class',
	  EXTRA_ATTRIBUTE_NAME = 'classes',
	  GLOBAL_PREFIX = '',
	  PREFIX_ATTR = 'prefix',
	  ADDED_PREFIX_ATTR = 'addedPrefix',
	  TAG_REGEX = /<[a-z][\w]*\s+[^>]+>/gi,
	  TAG_SPLIT_REGEX = /<[a-z][\w]*\s+[^>]+>/i,
	  CONDITIONS_REGEX = /\$\(([^\)]+)\)/g,
	  CONDITION_MARK = '_CONDITION_',
	  JS_AUTO_PREFIX_REGEX = /\bwith\s+auto\s+prefix\s*;*/gi,
	  JS_COMBINED_AUTO_PREFIX_REGEX = /\bwith\s+auto\s+(prefix|addedPrefix)\s*(["'])/i,
	  CSS_PREFIX_MATCH_REGEX = /\$*\.+[a-z_][\w\-]*/gi,
	  CSS_PREFIX_SPLIT_REGEX = /\$*\.+[a-z_][\w\-]*/i,
	  CSS_NO_PREFIX_REGEX = /\.with\.no\.prefix\s*;*/ig,
	  CSS_AUTO_PREFIX_REGEX = /\.with\.auto\.((added)*prefix)\./ig,
	  CSS_EXACT_AUTO_PREFIX_REGEX = /\.with\.auto\.prefix[;\s]/ig,
	  CLASSY_MAP_MATCH_REGEX = /\$classy\s*\(\s*([^,\)]+)\s*,\s*\{/g,
	  CLASSY_MAP_SPLIT_REGEX = /\$classy\s*\(\s*[^,\)]+\s*,\s*\{/,
	  CLASSY_ARR_MAP_MATCH_REGEX = /\$classy\s*\(\s*([^,]+\s*,\s*["'][^'"]*["'])\s*,\s*\[/g,
	  CLASSY_ARR_MAP_SPLIT_REGEX = /\$classy\s*\(\s*[^,]+\s*,\s*["'][^'"]*["']\s*,\s*\[/,
	  CLASSY_MATCH_REGEX = /\$classy\s*\(\s*["']([^"']+)["']\s*\)/g,
	  CLASSY_SPLIT_REGEX = /\$classy\s*\(\s*["'][^"']+["']\s*\)/,
	  CSS_URLS_REGEX = /url\([^\)]+\)/gi,
	  OBFUSCATED_URL_KEY = '_OBFUSCATED_URL_',
	  CSS_STRINGS1_REGEX = /'[^']*'/g,
	  OBFUSCATED_STRING1_KEY = '_OBFUSCATED_STRING1_',
	  CSS_STRINGS2_REGEX = /"[^"]*"/g,
	  OBFUSCATED_STRING2_KEY = '_OBFUSCATED_STRING2_',
	  CSS_STRINGS3_REGEX = /`[^`]*`/g,
	  OBFUSCATED_STRING3_KEY = '_OBFUSCATED_STRING3_',
	  CSS_SHORTCUTS_REGEX = /\bvar +\.([^\r\n\t;]+)\s*;*/gi,
	  CSS_SHORTCUTS_SPLIT_REGEX = /\bvar +\.[^\r\n\t;]+\s*;*/i,
	  IMAGE_SOURCE_REGEX = /\.with\.image\.source\s*["']([^"']+)["']\s*;*/gi,
	  IMAGE_SHORTCUTS_REGEX = /^(jpg|gif|png|jpeg|svg)\d*-/i;
	  CSS_FILE_EXTENSIONS = ['css', 'scss', 'sass', 'less'];

let loaderContext,
	obfuscationIndex = {},
	obfuscationMap = {},
	obfuscation,
	obfuscatedLength,
	obfuscatedContent,
	conditionIndex,
	conditions,
	delimiter,
	attributeName,
	extraAttributeName,
	globalPrefix,
	localPrfx,
	globalPrfx,
	varsUsed,
	parseMode = 'code',
	varsWereUsed,
	prefixesParced,
	currentParser,
	addCssPrefixAutomatically,
	autoPrefix,
	prefixAutoResolving,
	globalAutoPrefix,
	cachedJSPrefixes = {},
	resource,
	hasVarsToMerge,
	imageSources,
	conditionUsed,
	currentTagName,
	cssAutoImport,
	wasInited = false;

const getParser = () => {
	let options = getOptions(loaderContext);
	if (typeof options.parser == 'string') {
		options.parser = options.parser.toLowerCase();
	}
	return options.parser == 'js' || options.parser == 'css' ? options.parser : 'js';
}

const init = () => {
	wasInited = true;
	let {
		attributeName:a = ATTRIBUTE_NAME,
		extraAttributeName: e = EXTRA_ATTRIBUTE_NAME,
		globalPrefix:g = GLOBAL_PREFIX,
		delimiter:d = DELIMITER,
		obfuscatedLength: l = OBFUSCATED_LENGTH,
		obfuscation: o = false,
		autoPrefixMode: ap,
		prefixAutoResolving: pr,
		cssPrefixFromIndexJsFile: c,
		cssAutoImport: cai
	} = OPTIONS;

	if (typeof l != 'number') {
		l = OBFUSCATED_LENGTH;
	} else {
		l = Math.max(MIN_OBFUSCATED_LENGTH, l);
		l = Math.min(MAX_OBFUSCATED_LENGTH, l);
	}

	attributeName = a;
	extraAttributeName = e;
	delimiter = d;
	globalPrefix = g;
	obfuscation = o;
	obfuscatedLength = l;
	globalAutoPrefix = ap;
	prefixAutoResolving = pr;
	cssPrefixFromIndexJsFile = c;
	cssAutoImport = cai;
}

const getPrefixesRegex = (attr, glbl = '') => {
	if (glbl) {
		glbl = 'g';
	}
	return new RegExp('\\bwith\\s+' + attr + '\\s+[\'"]\\s*([a-z][a-z\\-0-9_ ]*)\\s*[\'"]\\s*;*', glbl + 'i');
}

const parsePrefixes = (source) => {
	if (!prefixesParced) {
		let prefixDefined = false;
		globalPrfx = localPrfx = globalPrefix;

		let matches = source.match(JS_COMBINED_AUTO_PREFIX_REGEX);
		if (matches) {
			autoPrefix = true;
			source = source.replace(JS_COMBINED_AUTO_PREFIX_REGEX, "with $1 $2");
		}

		matches = source.match(getPrefixesRegex(PREFIX_ATTR));
		if (matches) {
			let lp = matches[1];
			if (lp) {
				localPrfx = lp;
				if (prefixAutoResolving == 'content') {
					cachePrefix(lp);
				}
			}			
		}

		matches = source.match(getPrefixesRegex(ADDED_PREFIX_ATTR));
		if (matches) {
			let ap = matches[1];
			if (ap) {
				let d = delimiter;
				if (!localPrfx) {
					d = '';
				}
				if (prefixAutoResolving == 'content') {
					cacheAddedPrefix(ap);
				}
				localPrfx = localPrfx + d + ap;
				prefixDefined = true;
			}
		}
		if (localPrfx.match(/ /)) {
			localPrfx = localPrfx.replace(/\s{1,}/g, ' ').replace(/ /g, delimiter);
		}
		if (!!prefixAutoResolving && !prefixDefined) {
			tryToGetPrefix(source);
		}
		prefixesParced = true;
		autoPrefix = globalAutoPrefix || autoPrefix;
		let match = source.match(JS_AUTO_PREFIX_REGEX);
		if (match) {
			autoPrefix = true;
			source = source.replace(JS_AUTO_PREFIX_REGEX, '');
		}
	}
	return source;
}

const cachePrefix = (prefix) => {
	if (resource.path && resource.file == 'index') {
		cachedJSPrefixes[resource.path] = {prefix};
	}
}

const cacheAddedPrefix = (addedPrefix) => {
	if (resource.path && resource.file == 'index') {
		cachedJSPrefixes[resource.path] = {addedPrefix};
	}
}

const tryToGetPrefix = (source) => {
	switch (prefixAutoResolving) {
		case 'folder':
			tryToGetPrefixFromFolderName();
		break;

		case 'file':
			tryToGetPrefixFromFileName();
		break;

		default:
			if (currentParser != 'css') {
				tryToGetPrefixFromContent(source);
			} else {
				tryToGetCssPrefixFromJsContent(source);
			}
	}
}

const tryToGetPrefixFromFolderName = () => {
	if (typeof resource.folder == 'string') {
		definePrefix(resource.folder);
	}
}

const tryToGetPrefixFromFileName = (source) => {
	if (typeof resource.file == 'string') {
		let fileName = resource.file.replace(/\./g, '-');
		if (fileName != 'index') {
			definePrefix(fileName);
		}
	}
}

const tryToGetPrefixFromContent = (source) => {
	let className;
	let matches = source.match(/\bexport +default +(class|function) +([a-zA-Z_][\w]*)/);
	if (matches && matches.length > 0) {
		className = matches[2];
	} else {
		matches = source.match(/\bexport +default +connect *\([^\)]*\)\( *([a-zA-Z_][\w]*) *\)/);
		if (matches && matches.length > 0) {
			className = matches[1];
		} else {
			matches = source.match(/\bclass +([a-zA-Z_][\w]*)/);
			if (matches && matches.length > 0) {
				className = matches[1];
			} else {
				matches = source.match(/\bfunction *([a-zA-Z_][\w]*) *\(/);
				if (matches && matches.length > 0) {
					className = matches[1];
				}
			}
		}
	}
	if (!!className && className.match(/^[A-Z]/)) {
		definePrefix(className);
	}
}

const tryToGetCssPrefixFromJsContent = (source) => {
	if (
		cachedJSPrefixes[resource.path] instanceof Object &&
		cachedJSPrefixes[resource.path].addedPrefix
	) {
		let d = delimiter;
		if (!localPrfx) {
			d = '';
		}
		localPrfx = localPrfx + d + cachedJSPrefixes[resource.path].addedPrefix;
	}
}

const definePrefix = (name) => {
	let p = parseClassNameToPrefix(name);
	cacheAddedPrefix(p);
	localPrfx = makePrefix(p, localPrfx);
}

const makePrefix = (p, pr) => {
	let d = delimiter;
	if (!pr) {
		d = '';
	}
	return pr + d + p;
}

const parseClassNameToPrefix = (name) => {
	let p;
	if (name.match(/_/)) {
		if (delimiter == '-') {
			name = name.replace('_', '-');
		}
		p = name;
	} else if (name.match(/-/)) {
		if (delimiter == '_') {
			name = name.replace('-', '_');	
		}
		p = name;
	} else {
		p = name.split(/(?=[A-Z])/).join(delimiter).toLowerCase();
	}
	return p;
}

const removePrefixes = (source) => {
	source = source.replace(getPrefixesRegex(PREFIX_ATTR, true), '');
	source = source.replace(getPrefixesRegex(ADDED_PREFIX_ATTR, true), '');
	return source;
}

const clean = (cl, count = 1) => {
	return cl.substring(count);
}

const getWithPrefix = (cl, prefix) => {
	if (cl == 'self') {
		return getWrappedWithQuotes(prefix);
	}
	return getWrappedWithQuotes(prefix, cl);
}

const getVariables = (cl, withPrefix = false) => {
	cl = clean(cl);
	if (cl[0] == '$') {
		cl = clean(cl);
	} else if (!withPrefix) {
		hasVarsToMerge = true;
	}
	if (cl.indexOf(CONDITION_MARK) === 0) {
		return getWithCondition(cl);
	}
	if (cl.indexOf('?') > -1) {
		let parts = cl.split('?');
		return getWithCondition('?' + parts[1], parts[0]);
	}
	return cl;
}

const getVariablesWithPrefix = (cl, prefix) => {
	return getWrappedWithQuotes(prefix, '') + '+' + getVariables(cl, true);
}

const getWithCondition = (cl, cnd = null) => {
	cl = cl.replace(CONDITION_MARK, '').trim();
	cnd = cnd || getNextCondition();
	if (cl[0] == '?' && cnd) {
		conditionUsed = true;
		let parts = clean(cl).split(':'),
			value = cnd + '?' + getPart(parts[0]) + ':';
		if (parts[1]) {
			value += getPart(parts[1]);
		} else {
			value += '""';
		}
		return value;
	}
	return '';
}

const getNextCondition = () => {
	conditionIndex++;
	let c = conditions[conditionIndex];
	return typeof c == 'string' ? c : null;
}

const getWrappedWithQuotes = (cl, cl2 = null) => {
	let q = varsUsed ? '"' : '',
		d = !!cl ? delimiter : '';
	if (cl2 !== null) {
		cl = cl + d + cl2;	
	}	
	return q + (!obfuscation || cl2 === ''  ? cl : getObfuscatedClassName(cl)) + q;
}

const getPart = (cl) => {
	let c = cl[0],
		c2 = cl[1],
		c3 = cl[2];
	switch (c) {
		case '~': {
			cl = clean(cl);
			if (currentTagName) {				
				let p = makePrefix(parseClassNameToPrefix(currentTagName), globalPrfx);
				return getWithPrefix(cl, p);
			}
			return cl;
		}
		case '.': {
			let p = !autoPrefix ? localPrfx : globalPrfx;
			cl = clean(cl);
			if (c2 == '.') {
				cl = cl.replace(/^\.+/g, '');
				if (c3 == '$') {
					return getVariablesWithPrefix(cl, globalPrfx);
				}
				if (autoPrefix) {
					return getWrappedWithQuotes(cl);
				}
				p = globalPrfx;
			} else if (c2 == '$') {
				return getVariablesWithPrefix(cl, localPrfx);
			}
			return getWithPrefix(cl, p);
		}

		case '$':
			return getVariables(cl);
	}
	if (cl.indexOf('::') > -1) {
		return getWithGivenPrefix(cl);
	}
	if (autoPrefix) {
		return getWithPrefix(cl, localPrfx);
	}
	return getWrappedWithQuotes(cl);
}

const getWithGivenPrefix = (cl) => {
	let ps = cl.split('::');
	let d = delimiter;
	if (!globalPrefix) {
		d = '';
	}
	cl = globalPrefix + d + ps[0] + delimiter + ps[1];
	return getWrappedWithQuotes(cl);
}

const getAllMatches = (str, reg, idx = 0) => {
	let found, matches = [];
	while (found = reg.exec(str)) {
	    matches.push(found[idx]);
	    reg.lastIndex = found.index + found[0].length;
	}
	return matches;
}

const parseClassNames = (value) => {
	if (value) {
		hasVarsToMerge = false;
		conditionIndex = -1;
		conditions = getAllMatches(value, CONDITIONS_REGEX, 1);
		
		if (conditions.length > 0) {
			value = value.replace(CONDITIONS_REGEX, '$' + CONDITION_MARK);
		}

		value = value.replace(/(\w)([\.\$])/gi, "$1 $2")
				.replace(/\$\?(\.*)(\w+)/g, "$ $2?$1$2")
				.replace(/\$\s+/g, '$')
				.replace(/\s*\?\s*/g, '?')
				.replace(/\s*:\s*/g, ':')
				.replace(/\!\$/g, '$!');
		
		if (value) {
			if (varsUsed = conditions.length > 0 || (/\$/).test(value)) {
				varsWereUsed = true;
			}
			let classes = value.split(' ');
			let classNames = [];
			for (let cl of classes) {
				conditionUsed = false;
				if (!!cl) {
					cl = getPart(cl);
					if (conditionUsed) {
						cl = '(' + cl + ')';
					}
					classNames.push(cl);
				}
			}

			if (varsUsed) {
				classNames = classNames.join(',').replace(/","/g, " ").replace(/\+\s*([\w]+),"/g, "+$1+\" ");
				if (hasVarsToMerge) {
					return CLASSNAMES + '(' + classNames + ')';
				}
				return classNames.replace(/",([\w])/g, " \"+$1").replace(/([\w]),"/g, "$1+\" ");
			}
			
			return classNames.join(' ');
		}
	}
	return '';
}

const parse = (source) => {
	if (!getRegex().test(source)) {
		return source;
	}
	let parts = source.split(getRegex());
	if (parts.length > 1) {
		source = parts[0];
		let prevPart = source;
		let prevParts = [];
		for (let i = 1; i < parts.length; i++) {
			let prevPartTry = 2;
			let m = parts[i],
				part = parts[i + 2],
				an = m.split(/[=:]/)[0].trim(),
				sign = (/=/).test(m) ? '=' : ':',
				q = m[m.length - 1],
				ps = part.split(q),
				value = ps[0];

			ps[0] = '';
			if (sign != ':') {
				if (ps[1][0] == '}') {
					ps[1] = clean(ps[1]);
				}
			}
			ps = clean(ps.join(q));
			let q2 = q, hasTilda = /~/.test(value);

			currentTagName = null;
			if (hasTilda) {
				prevPart = preparePart(prevPart);
				prevParts.push([prevPart, true]);

				currentTagName = getComponentTagName(prevPart);
				while (typeof currentTagName == 'number' && typeof prevParts[prevParts.length - prevPartTry] != 'undefined') {
					let pp = prevParts[prevParts.length - prevPartTry];
					if (!pp[1]) {
						pp[0] = preparePart(pp[0]);
						pp[1] = true;
					}
					currentTagName = getComponentTagName(pp[0], false, currentTagName);
					prevPartTry++;
				}
				if (!currentTagName) {
					throw new Error('Classy loader parsing error: Loader can\'t parse a prefix "' + value + '". No component tag name found');
				}
				if (typeof currentTagName == 'string' && !/^[A-Z]/.test(currentTagName)) {
					throw new Error('Classy loader parsing error: Loader can\'t parse a prefix "' + value + '". Component name expected. DOM element tag name found "' + currentTagName + '"');
				}
			} else {
				prevParts.push([prevPart, false]);
			}

			let className = parseClassNames(value);			
			if (varsUsed) {
				q = '{';
				q2 = '}';
			}
			let a = an == attributeName ? 'className' : extraAttributeName;
			source += a + sign + q + className + q2 + ps;
			i += 2;
			prevPart = ps;
		}
	}
	return source;
}

const preparePart = (code) => {
	return code
			.replace(/\\['"`]/g, '')
			.replace(/'[^']+'/g, '')
			.replace(/"[^"]+"/g, '')
			.replace(/`[^`]+`/g, '')
			.replace(/\/>/g, '__TAG_CLOSE1__')
			.replace(/<\//g, '__TAG_CLOSE2__')
			.replace(/\/[^\/]+\//g, '')
			.replace(/__TAG_CLOSE1__/g, '/>')
			.replace(/__TAG_CLOSE2__/g, '</');
}

const isFileWithClass = (name) => {
	return (new RegExp(name)).test(loaderContext.resourcePath);
}

const getComponentTagName = (code, isAfter = false, inContext = 0) => {
	code = code
		.replace(/[\r\n\t]/g, ' ')
		.replace(/ {2,}/g, ' ');

	let prev, 
		prevWord, 
		parts = code.split(/\b/),
		start = !isAfter ? parts.length - 1 : 0,
		to = (i) => {
			if (!isAfter) return i >= 0; 
			return i < parts.length;
		},
		add = !isAfter ? -1 : 1;

	for (let i = start; to(i); i += add) {
		let part = parts[i];
		if (!/^\w/.test(part[0])) {
			let ps = part.split('');

			let start2 = !isAfter ? ps.length - 1 : 0,
				to2 = (j) => {
					if (!isAfter) return j >= 0; 
					return j < ps.length;
				};
			
			for (let j = start2; to2(j); j += add) {
				let p = ps[j];

				switch (p) {
					case ' ':
					case '=':
					case '-':
					case '"':
					case "'":
					break;
					
					case '}':
						if (!isAfter) {
							inContext++;
						} else if (inContext > 0) {
							inContext--;
						}
					break;

					case '{':
						if (!isAfter) {
							if (inContext > 0) {
								inContext--;
							}
						} else {
							inContext++;
						}
					break;

					case '<':
						if (!isAfter) {
							if (!inContext && !!prevWord) {
								return prevWord;
							}
						} else if (!inContext)  {
							return false;
						}
					break;

					case '>':
						if (isAfter) {
							if (!inContext) {
								return true;
							}
						} else if (!inContext) {
							return false;
						}
					break;

					case '/':
						if (!inContext && !isAfter) {
							return false;
						}
					break;

					default:
						if (inContext == 0) {
							return false;
						}
				}
				prev = p;
				prevWord = null;
			}			
		} else {
			prevWord = prev = part;
		}
	}
	if (inContext > 0) {
		return inContext;
	}
	return false;
}

const withImportClassMerger = (source) => {
	return "import " + CLASSNAMES + " from 'classy-loader/classy';" + source;
}

const generateClassName = () => {
	let len = obfuscatedLength - 1;
	let possible = 'abcdefghijklmnopqrstuvwxyz';
	let text = possible.charAt(Math.floor(Math.random() * possible.length));
	possible += '0123456789';	
	for (let i = 0; i < len; i++) {
	  text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

const getObfuscatedClassName = (className) => {
	if (typeof obfuscationMap[className] == 'string') {
		return obfuscationMap[className];
	}
	let randomClassName;
	let count = 0;
	let maxCount = 99999;
	while (true) {
		randomClassName = generateClassName();
		if (!obfuscationIndex[randomClassName]) {
			break;
		}
		count++;
		if (count >= maxCount) {
			throw new Error('Classy loader obfuscation error: maximum count of class names reached. Impossible to generate new unique names');
			break;
		}
	}
	obfuscationIndex[randomClassName] = true;
	obfuscationMap[className] = randomClassName;
	return randomClassName;
}

const getMinimalRegex = () => {
	let e = extraAttributeName,
		ie = !!e && typeof e == 'string';
	return '\\b(class|classes)\\s*[=:]';
}

const getRegex = () => {
	return new RegExp('(' + getMinimalRegex() + "\\s*\\{*\\s*[\"'])", 'g');
}

const parseJsSource = (source) => {
	varsWereUsed = false;
	prefixesParced = false;
	autoPrefix = false;

	source = parse(parsePrefixes(source));

	if (source.match(CLASSY_ARR_MAP_MATCH_REGEX)) {
		source =  parseClassyArrMaps(source);
	}
	if (source.match(CLASSY_MAP_MATCH_REGEX)) {
		source = parseClassyMaps(source);
	}
	if (source.match(CLASSY_MATCH_REGEX)) {
		source = parseClassy(source);
	}
	if (varsWereUsed) {
		source = withImportClassMerger(source);
	}
	return removePrefixes(source);
}

const  parseClassyArrMaps = (source) => {
	source = parsePrefixes(source);
	let matches = getAllMatches(source, CLASSY_ARR_MAP_MATCH_REGEX, 1);
	if (matches.length > 0) {
		let parts = source.split(CLASSY_ARR_MAP_SPLIT_REGEX);
		source = '';
		let index = 0, part;
		for (part of parts) {
			if (index > 0) {
				let v = matches[index - 1],
					vs = v.split(/\s*,\s*/),
					add = vs[1].replace(/['"]/g, ''),
					ps = part.split(']'),
					arr = ps[0].split(','),
					item, mapData = [];

				if (ps[1]) {
					ps[1] = ps[1].replace(/^\s*\)\s*;*/, '');
					for (item of arr) {
						let item2 = item.replace(/['"]/g, '');
						if (!item.match(/\-/)) {
							item = item2;
						}
						let cl = parseClassNames(add + item2.trim());
						let q = !varsUsed ? '"' : '';
						mapData.push(item.trim() + ':' + q + cl + q);
					}
					ps[0] = '';
					let mapContent = '{' + mapData.join(',') + '}[' + vs[0] + '] || ""';
					part = mapContent + clean(ps.join(']'));
				}
			}
			source += part;
			index++;
		}
	}
	return source;
}

const parseClassyMaps = (source) => {
	source = parsePrefixes(source);
	let matches = getAllMatches(source, CLASSY_MAP_MATCH_REGEX, 1);
	if (matches.length > 0) {
		let parts = source.split(CLASSY_MAP_SPLIT_REGEX);
		source = '';
		let index = 0, part;
		for (part of parts) {
			if (index > 0) {
				let v = matches[index - 1],
					ps = part.split('}'),
					map = ps[0].split(','),
					item;

				if (ps[1]) {
					ps[1] = ps[1].replace(/^\s*\)\s*;*/, '');
					let mapData = [];
					for (item of map) {
						item = item.trim();
						if (!item.replace(/\s/g, '')) {
							continue;
						}
						item = item.replace('::', '__||__');
						let p = item.split(':');
						if (p[1]) {
							let p0 = p[0].trim(),
								p1 = p[1].trim().replace('__||__', '::'),
								p2 = p1[0];
								p3 = p1[p1.length - 1];
							if ((p2 == '"' || p2 == "'") && (p3 == '"' || p3 == "'")) {
								let cl = parseClassNames(p1.replace(/['"]/g, ''));
								let q = !varsUsed ? '"' : '';
								mapData.push(p0 + ':' + q + cl + q);
							}
						} else {
							throw new Error('Classy loader js parsing error: Incorrect code in classyMap context');
						}
					}
					let mapContent = '{' + mapData.join(',') + '}[' + v + '] || ""';
					ps[0] = '';
					part = mapContent + clean(ps.join('}'));
				}
			}
			source += part;
			index++;
		}
	}
	return source;
}

const parseClassy = (source) => {
	source = parsePrefixes(source);
	let matches = getAllMatches(source, CLASSY_MATCH_REGEX, 1);
	if (matches.length > 0) {
		varsWereUsed = true;
		let parts = source.split(CLASSY_SPLIT_REGEX);
		source = '';
		let index = 0, part;
		for (part of parts) {
			source += part;
			if (typeof matches[index] == 'string') {
				let m = matches[index].replace(/['"]/g, '').trim();
				let cl = parseClassNames(m);
				if (!varsUsed) {
					source += '"' + cl + '"';
				} else {
					source += cl;
				}
			}
			index++;
		}
	}
	return source;
}


const getCssPrefixesRegex = (attr, glbl = '') => {
	if (glbl) {
		glbl = 'g';
	}
	return new RegExp('\\.with\\.' + attr + '\\.([a-z][a-z\\-0-9_]*) *;*', glbl + 'i');
}

const parseCssPrefixes = (source) => {
	globalPrfx = localPrfx = globalPrefix;
	let prefixDefined = false;

	let matches = source.match(getCssPrefixesRegex(PREFIX_ATTR));
	if (matches) {
		let lp = matches[1];
		if (lp) {
			localPrfx = lp;
		}
	}

	matches = source.match(getCssPrefixesRegex(ADDED_PREFIX_ATTR));
	if (matches) {
		let ap = matches[1];
		if (ap) {
			let d = delimiter;
			if (!localPrfx) {
				d = '';
			}
			localPrfx = localPrfx + d + ap;
			prefixDefined = true;
		}
	}
	autoPrefix = globalAutoPrefix;
	if (!!prefixAutoResolving && !prefixDefined) {
		tryToGetPrefix(source);
	}
	if (source.match(CSS_NO_PREFIX_REGEX)) {
		localPrfx = '';
		globalPrfx = '';
		autoPrefix = false;
		source = source.replace(CSS_NO_PREFIX_REGEX, '');
	}
	return source;
}

const getCssClassPrefix = (prefix, className) => {
	let d = delimiter;
	if (!prefix || !className) {
		d = '';
	}
	return prefix  + d;
}

const removeCssPrefixes = (source) => {
	source = source.replace(getCssPrefixesRegex(PREFIX_ATTR, true), '');
	source = source.replace(getCssPrefixesRegex(ADDED_PREFIX_ATTR, true), '');
	return source;
}

const parseCssClasses = (source) => {
	let matches = getAllMatches(source, CSS_PREFIX_MATCH_REGEX);
	if (matches.length > 0) {		
		let parts = source.split(CSS_PREFIX_SPLIT_REGEX);
		source = '';
		let index = 0;
		for (let part of parts) {
			source += part;
			if (typeof matches[index] == 'string') {
				let auto = addCssPrefixAutomatically;
				let className, prefix;
				let m = matches[index];
				if (m.indexOf('...') === 0 && auto) {
					m = clean(m, 2);
					auto = false;
				}
				if (m.indexOf('...') === 0) {
					m = clean(m, 3);
					if (m == 'self') {
						m = '';
					}
					className = getCssClassPrefix(globalPrfx, m) + m;
				} else if (m.indexOf('..') === 0) {
					m = clean(m, 2);
					if (m == 'self') {
						m = '';
					}
					prefix = auto ? globalPrfx : localPrfx;
					className = getCssClassPrefix(prefix, m) + m;
				} else {
					prefix = auto ? localPrfx : '';
					m = clean(m);
					if (auto && m == 'self' && !!localPrfx) {
						m = '';
					}			 		
					className = getCssClassPrefix(prefix, m) + m;
				}				
				if (obfuscation) {
					className = getObfuscatedClassName(className);
				}
				source += '.' + className;
			}
			index++;
		}
	}
	return source;
}

const parseCssSource = (source) => {
	obfuscatedContent = {};
	autoPrefix = false;
	imageSources = [];
	source = parseImageSources(source);
	let s = source.replace(CSS_EXACT_AUTO_PREFIX_REGEX, '');
	if (addCssPrefixAutomatically = source != s) {
		source = s;
	}
	if (source.match(CSS_AUTO_PREFIX_REGEX)) {
		addCssPrefixAutomatically = true;
		source = source.replace(CSS_AUTO_PREFIX_REGEX, ".with.$1.");
	}
	if (source.match(CSS_SHORTCUTS_REGEX)) {
		source = parseCssShortcuts(source);
	}
	source = parseCssPrefixes(source);
	source = removeCssPrefixes(source);
	addCssPrefixAutomatically = addCssPrefixAutomatically || autoPrefix;
	if (addCssPrefixAutomatically || source.match(/\.{2,}[\w\-]+/i)) {
		source = obfuscateUrlsAndStrings(source);
		source = parseCssClasses(source);		
		source = deobfuscate(source, OBFUSCATED_URL_KEY, 'urls');
		source = deobfuscateStrings(source);
	}
	return source;
}

const parseImageSources = (source) => {
	let matches = getAllMatches(source, IMAGE_SOURCE_REGEX, 1);
	if (matches) {
		source = source.replace(IMAGE_SOURCE_REGEX, '');
		imageSources = matches;
	}
	return source;
}

const parseCssShortcuts = (source) => {
	let matches = getAllMatches(source, CSS_SHORTCUTS_REGEX, 1);
	if (matches.length > 0) {
		let parts = source.split(CSS_SHORTCUTS_SPLIT_REGEX);
		source = '';
		let index = 0;		
		for (let part of parts) {
			source += part;
			if (typeof matches[index] == 'string') {
				let m = matches[index];
				let ps = m.split('.');
				for (let p of ps) {
					p = p.trim();
					let im = p.match(/\!/), v = '';
					if (im) {
						p =  p.replace(/\!/g, '');
					}
					if (p.match(IMAGE_SHORTCUTS_REGEX)) {
						let prts = p.split('-');
						if (prts[1]) {
							let ext = prts[0],
								srcIndex = ext.replace(/[^\d]/g, '') || 1;
							srcIndex--;
							if (!imageSources[srcIndex]) {
								throw new Error('Classy loader css parsing error: cant\'t find image source with index "' + srcIndex + '"');
							}
							ext = ext.replace(/\d+/g, ''),
							prts[0] = '';
							let fn = clean(prts.join('-'));
							v =  'background-image:url(' + imageSources[srcIndex].replace(/[\\\/]+$/, '').trim() + '/' + fn + '.' + ext + ');';
						}
					} else if (typeof cssConsts[p] == 'string') {
						v = cssConsts[p];
					} else {
						let key = p.match(/^[a-z]+/i);
						let value = p.replace(/^[a-z]+/i, '');
						if (typeof cssConsts[key] == 'function') {							
							v = cssConsts[key](value);
						} else if (typeof cssConsts['_' + key] == 'function') {
							v =  cssConsts['_' + key](value);
						}
					}
					if (!!v) {
						if (im) {
							let pp = v.split(';');
							let vv = [];
							for (let pi of pp) {
								if (!!pi) {
									vv.push(pi + ' !important');
								}
							}
							v = vv.join(';') + ';';
						}
						source += v + "\n";
					} else {
						throw new Error('ClassyLoader css parsing error: unknown css shortcut "' + p + '"');
					}
				}
			}
			index++;
		}
	}
	return source;
}

const obfuscateUrlsAndStrings = (source) => {
	let matches = obfuscatedContent.urls = getAllMatches(source, CSS_URLS_REGEX);
	if (matches.length > 0) {
		source = source.split(CSS_URLS_REGEX).join(OBFUSCATED_URL_KEY);
	}
	return obfuscatStrings(source);	
}

const obfuscatStrings = (source) => {
	let matches = obfuscatedContent.strings1 = getAllMatches(source, CSS_STRINGS1_REGEX);
	if (matches.length > 0) {
		source = source.split(CSS_STRINGS1_REGEX).join(OBFUSCATED_STRING1_KEY);
	}
	matches = obfuscatedContent.strings2 = getAllMatches(source, CSS_STRINGS2_REGEX);
	if (matches.length > 0) {
		source = source.split(CSS_STRINGS2_REGEX).join(OBFUSCATED_STRING2_KEY);
	}
	matches = obfuscatedContent.strings3 = getAllMatches(source, CSS_STRINGS3_REGEX);
	if (matches.length > 0) {
		source = source.split(CSS_STRINGS3_REGEX).join(OBFUSCATED_STRING3_KEY);
	}
	return source;
}

const deobfuscateStrings = (source) => {
	source = deobfuscate(source, OBFUSCATED_STRING1_KEY, 'strings1');
	source = deobfuscate(source, OBFUSCATED_STRING2_KEY, 'strings2');
	source = deobfuscate(source, OBFUSCATED_STRING3_KEY, 'strings3');
	return source;
}

const deobfuscate = (source, key, name) => {
	if (obfuscatedContent[name] instanceof Array) {
		let parts = source.split(key);
		source = '';
		let index = 0;
		for (let part of parts) {
			source += part;
			if (typeof obfuscatedContent[name][index] == 'string') {
				source += obfuscatedContent[name][index];
			}
			index++;
		}
	}
	return source;
}

const initResource = () => {
	let r = loaderContext.resourcePath,
		parts = r.split(/\\|\//),
		l = parts.length,
		folderName = parts[l - 2],
		fileName = parts[l - 1],
		ps = fileName.split('.'),
		ln = ps.length,
		ext = ps[ln - 1];

	parts[l - 1] = '';
	let p = parts.join('/');
	resource = {
		file: fileName.replace(/\.\w+$/, ''),
		ext: ext,
		folder: folderName,
		path: p
	};
}

const tryToAddCssImport = (source) => {
	if (resource instanceof Object) {
		let p = resource.path;
		if (typeof p != 'string') {
			return source;
		}
		p = p.replace(/[\/\\]$/, '');
		let cssFileNames = cssAutoImport === true ? 'index' : cssAutoImport;
		if (!(cssFileNames instanceof Array)) {
			cssFileNames = [cssFileNames]
		}
		for (let cssFileName of cssFileNames) {
			if (cssFileName === true) {
				cssFileName = 'index';
			}
			let pathToFile = p + '/' + cssFileName;			
			for (let ext of CSS_FILE_EXTENSIONS) {
				let fp = pathToFile + '.' + ext;
				let regex = new RegExp('\\bimport\\s+[\'"]\.[\\\\\\/]' + cssFileName + '\\.' + ext + '[\'"]');
				if (fileSystem.existsSync(fp) && !regex.test(source)) {
					source = "import './" + cssFileName + "." + ext + "';\n" + source;
	      		} 
			}
		}
	}
	return source;
}

function ClassyLoader(source) {
	loaderContext = this;
	if (loaderContext.resourcePath.match(/\bnode_modules\b/)) {
		return source;
	}
	currentParser = getParser();
	if (!wasInited) {
		init();
	}	
	initResource();	
	if (currentParser == 'js') {
		if (!!cssAutoImport) {
			source = tryToAddCssImport(source);
		}
		return parseJsSource(source);
	}
	if (currentParser == 'css') {
		return parseCssSource(source);
	}
	return source;
};

const con = (text) => {	
	console.log("\n\n========================");
	console.log(text);
	console.log("========================\n\n");
}

ClassyLoader.init = (opts) => {
	if (opts instanceof Object) {
		for (let k in opts) {
			OPTIONS[k] = opts[k];
		}
	}
}

module.exports = ClassyLoader;