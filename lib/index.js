var {getOptions} = require('loader-utils');

const OPTIONS = {};
const CLASSNAMES = '__classy';
const DELIMITER = '-';
const ATTRIBUTE_NAME = 'class';
const EXTRA_ATTRIBUTE_NAME = 'classes';
const GLOBAL_PREFIX = '';
const PREFIX_ATTR = 'prefix';
const ADDED_PREFIX_ATTR = 'addedPrefix';
const TAG_REGEX = /<[a-z][\w]*\s+[^>]+>/gi;
const TAG_SPLIT_REGEX = /<[a-z][\w]*\s+[^>]+>/i;
const CONDITIONS_REGEX = /\$\(([^\)]+)\)/g;
const CONDITION_MARK = '_CONDITION_';
const CSS_GLOBAL_PREFIX_REGEX = /\.{3}([\w\-]+)/gi;
const CSS_LOCAL_PREFIX_REGEX = /\.{2}([\w\-]+)/gi;
const CSS_LOCAL_PREFIX_SPLIT_REGEX = /\.{2}[\w\-]+/i;
const CSS_GLOBAL_PREFIX_SPLIT_REGEX = /\.{3}[\w\-]+/i;
const CLASSY_MAP_MATCH_REGEX = /\$classyMap\(\s*(\w+)\s*\)\s*\{/g;
const CLASSY_MAP_SPLIT_REGEX = /\$classyMap\(\s*\w+\s*\)\s*\{/;
const CLASSY_MATCH_REGEX = /\$classy\(\s*["']([^"']+)["']\s*\)/g;
const CLASSY_SPLIT_REGEX = /\$classy\(\s*["'][^"']+["']\s*\)/;

let obfuscationIndex = {},
	obfuscationMap = {},
	obfuscation,
	conditionIndex,
	conditions,
	delimiter,
	attributeName,
	extraAttributeName,
	globalPrefix,
	hasPrefix,
	hasAddedPrefix,
	localPrfx,
	globalPrfx,
	varsUsed,
	parseMode = 'code',
	varsWereUsed,
	currentAttrName,
	prefixesParced,
	isExtraAttr,
	currentParser,
	currentSign,
	currentQuote,
	wasInited = {
		js: false,
		css: false
	};

const getParser = (_this) => {
	let options = getOptions(_this);
	if (typeof options.parser == 'string') {
		options.parser = options.parser.toLowerCase();
	}
	return options.parser == 'js' || options.parser == 'css' ? options.parser : 'js';
}

const init = (parser, _this) => {
	wasInited[parser] = true;
	let options = {
		...OPTIONS,
		...getOptions(_this)
	};
	let {
		attributeName:a = ATTRIBUTE_NAME,
		extraAttributeName: e = EXTRA_ATTRIBUTE_NAME,
		globalPrefix:g = GLOBAL_PREFIX,
		delimiter:d = DELIMITER,
		obfuscation: o = false
	} = options;

	attributeName = a;
	extraAttributeName = e;
	delimiter = d;
	globalPrefix = g;
	obfuscation = o;
}

const getParts = (source) => {	
	let parts = source.split(getRegex());
	if (!parts[1]) {
		return;
	}
	return parts;
}

const getRegex = (quote = currentQuote) => {
	return new RegExp('\\b' + currentAttrName + "\\s*" + currentSign + "\\s*" + quote, 'g');
}

const getPrefixesRegex = (attr) => {
	return new RegExp('\\bwith\\s+' + attr + '\\s+[\'"] *([a-z][a-z\\-0-9]*) *[\'"];*', 'i');
}

const getAttributeRegex = () => {
	return new RegExp('\\b' + currentAttrName + "\\s*" + currentSign + "\\s*[\"']");
}

const parsePrefixes = (source) => {
	if (!prefixesParced) {
		hasPrefix = false;
		hasAddedPrefix = false;
		globalPrfx = localPrfx = globalPrefix;

		let matches = source.match(getPrefixesRegex(PREFIX_ATTR));
		if (matches) {
			let lp = matches[1];
			if (lp) {
				localPrfx = lp;
				hasPrefix = true;
			}
		}

		matches = source.match(getPrefixesRegex(ADDED_PREFIX_ATTR));
		if (matches) {
			let ap = matches[1];
			if (ap) {
				localPrfx = localPrfx + delimiter + ap;
				hasAddedPrefix = true;
			}
		}
		prefixesParced = true;
	}
}

const removePrefixes = (source) => {
	if (hasPrefix) {
		source = source.replace(getPrefixesRegex(PREFIX_ATTR), '');
	}
	if (hasAddedPrefix) {
		source = source.replace(getPrefixesRegex(ADDED_PREFIX_ATTR), '');	
	}
	return source;
}

const clean = (cl, count = 1) => {
	return cl.substring(count);
}

const getWithPrefix = (cl, prefix) => {
	cl = clean(cl);
	if (cl == 'self') {
		return getWrappedWithQuotes(prefix);
	}
	return getWrappedWithQuotes(prefix, cl);
}

const getVariables = (cl) => {
	cl = clean(cl);
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
	cl = clean(cl);
	return getWrappedWithQuotes(prefix, '') + '+' + getVariables(cl);
}

const getWithCondition = (cl, cnd = null) => {
	cl = cl.replace(CONDITION_MARK, '').trim();
	cnd = cnd || getNextCondition();
	if (cl[0] == '?' && cnd) {
		let parts = clean(cl).split(':'),
			value = cnd + '?' + getPart(parts[0]) + ':';
		if (parts[1]) {
			value += getPart(parts[1]);
		} else {
			value += '""';
		}
		return value;
	}
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
		c2 = cl[1];
	switch (c) {
		case '.': {
			let p = localPrfx;
			if (c2 == '.') {
				p = globalPrfx;
				cl = clean(cl);
				c2 = cl[1];
			}
			if (c2 == '$') {
				return getVariablesWithPrefix(cl, p);
			}
			return getWithPrefix(cl, p);
		}

		case '$':
			return getVariables(cl);
	}
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

const parse = (source) => {
	return parseWithQuote(parseWithQuote(source, '"'), "'");
}
 
const parseClassNames = (value) => {
	if (value) {
		conditionIndex = -1;
		conditions = getAllMatches(value, CONDITIONS_REGEX, 1);
		
		if (conditions.length > 0) {
			value = value.replace(CONDITIONS_REGEX, '$' + CONDITION_MARK);
		}

		value = value.replace(/(\w)([\.\$])/gi, "$1 $2")
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
				if (!!cl) {
					classNames.push(getPart(cl));
				}
			}

			let className;
			if (varsUsed) {
				className = CLASSNAMES + '(' + classNames.join(',');
			} else {
				className = classNames.join(' ');
			}
			if (varsUsed) {
				className += ')';
			}
			return className;
		}
	}
	return '';
}

const parseWithQuote = (source, quote) => {
	currentQuote = quote;
	let parts = getParts(source);
	if (parts instanceof Array) {	
		for (let i = 1; i < parts.length; i++) {
			let q = quote;
			let p = parts[i],			
				ps = p.split(q),
				value = ps[0];

			let className = parseClassNames(value);
			if (className) {
				ps[0] = '';
				ps = clean(ps.join(q));
				let q2 = q;
				if (varsUsed) {
					if (parseMode == 'tag') {
						q = '{';
						q2 = '}';
					} else {
						q = '';
						q2 = '';
					}
				}
				parts[i] = getRealAttributeName() + currentSign + q + className + q2 + ps;
			}
		}
		return parts.join('');
	}
	return source;
}

const getRealAttributeName = () => {
	return !isExtraAttr || !extraAttributeName ? 'className' : extraAttributeName;
}

const withImportClassMerger = (source) => {
	return "import " + CLASSNAMES + " from 'classy-loader/classy';" + source;
}

const generateClassName = () => {
	let possible = 'abcdefghijklmnopqrstuvwxyz';
	let text = possible.charAt(Math.floor(Math.random() * possible.length));
	possible += '0123456789';	
	for (let i = 0; i < 6; i++) {
	  text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

const getObfuscatedClassName = (className) => {
	if (typeof obfuscationMap[className] == 'string') {
		return obfuscationMap[className];
	}
	let randomClassName;
	while (true) {
		randomClassName = generateClassName();
		if (!obfuscationIndex[randomClassName]) {
			break;
		}
	}
	obfuscationIndex[randomClassName] = true;
	obfuscationMap[className] = randomClassName;
	return randomClassName;
}

const parseWithAttribute = (name, source) => {
	currentAttrName = name;
	if (!(getAttributeRegex()).test(source)) {
		return source;
	}
	parsePrefixes(source);
	let matches = getAllMatches(source, TAG_REGEX);
	if (matches.length == 0) {
		parseMode = 'code';		
		source = parse(source);
	} else {
		let parts = source.split(TAG_SPLIT_REGEX);
		source = '';
		let index = 0;
		for (let part of parts) {
			parseMode = 'code';
			part = parse(part);
			source += part;
			if (typeof matches[index] == 'string') {
				parseMode = 'tag';
				source += parse(matches[index]);
			}
			index++;
		}
	}
	return source;
}

const parseJsSource = (source, _this) => {
	varsWereUsed = false;
	prefixesParced = false;
	isExtraAttr = false;
	currentSign = '=';

	if (!wasInited[currentParser]) {
		init(currentParser, _this);
	}
	source = parseWithAttribute(attributeName, source);
	
	if (!!extraAttributeName && typeof extraAttributeName == 'string') {
		isExtraAttr = true;
		source = parseWithAttribute(extraAttributeName, source);
		currentSign = ':';
		if (source.match(getRegex("'")) || source.match(getRegex('"'))) {
			source = parseWithAttribute(extraAttributeName, source);
		}
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

const parseClassyMaps = (source) => {
	parsePrefixes(source);
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

				let mapData = [];
				for (item of map) {
					let p = item.split(':');
					if (p[1]) {
						let p0 = p[0].trim(),
							p1 = p[1].trim(),
							p2 = p1[0];
							p3 = p1[p1.length - 1];
						if ((p2 == '"' || p2 == "'") && (p3 == '"' || p3 == "'")) {
							let cl = parseClassNames(p1.replace(/['"]/g, ''));
							let q = !varsUsed ? '"' : '';
							mapData.push(p0 + ':' + q + cl + q);
						}
					} else {
						throw new Error('Incorrect code in classyMap context');
					}
				}
				let mapContent = '{' + mapData.join(',') + '}[' + v + ']';
				ps[0] = '';
				part = mapContent + clean(ps.join('}'));
			}
			source += part;
			index++;
		}
	}
	return source;
}

const parseClassy = (source) => {
	parsePrefixes(source);
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
				if (varsUsed) {
					source += CLASSNAMES + '(' + cl + ')';	
				} else {
					source += '"' + cl + '"';	
				}				
			}
			index++;
		}
	}
	return source;
}





const getCssPrefixesRegex = (attr) => {
	return new RegExp('\\.with\\.' + attr + '\\.([a-z][a-z\\-0-9]*) *;*', 'i');
}

const parseCssPrefixes = (source) => {
	hasPrefix = false;
	hasAddedPrefix = false;
	globalPrfx = localPrfx = globalPrefix;

	let matches = source.match(getCssPrefixesRegex(PREFIX_ATTR));
	if (matches) {
		let lp = matches[1];
		if (lp) {
			localPrfx = lp;
			hasPrefix = true;
		}
	}

	matches = source.match(getCssPrefixesRegex(ADDED_PREFIX_ATTR));
	if (matches) {
		let ap = matches[1];
		if (ap) {
			localPrfx = localPrfx + delimiter + ap;
			hasAddedPrefix = true;
		}
	}
}

const getCssClassPrefix = (prefix, className) => {
	let d = delimiter;
	if (!prefix || !className) {
		d = '';
	}
	return prefix  + d;
}

const removeCssPrefixes = (source) => {
	if (hasPrefix) {
		source = source.replace(getCssPrefixesRegex(PREFIX_ATTR), '');
	}
	if (hasAddedPrefix) {
		source = source.replace(getCssPrefixesRegex(ADDED_PREFIX_ATTR), '');	
	}
	return source;
}

const parseCssClasses = (source, prefix, matchRegex, splitRegex) => {
	let matches = getAllMatches(source, matchRegex, 1);
	if (matches.length > 0) {
		let parts = source.split(splitRegex);
		source = '';
		let index = 0;
		for (let part of parts) {
			source += part;
			if (typeof matches[index] == 'string') {
				let m = matches[index] == 'self' ? '' : matches[index];
				let className = getCssClassPrefix(prefix, m) + m;
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

const parseCssSource = (source, _this) => {
	if (!wasInited[currentParser]) {
		init(currentParser, _this);
	}
	if (source.match(/\.{2,}[\w\-]+/i)) {
		parseCssPrefixes(source);
		source = parseCssClasses(source, globalPrfx, CSS_GLOBAL_PREFIX_REGEX, CSS_GLOBAL_PREFIX_SPLIT_REGEX);
		source = parseCssClasses(source, localPrfx, CSS_LOCAL_PREFIX_REGEX, CSS_LOCAL_PREFIX_SPLIT_REGEX);
	}
	return removeCssPrefixes(source);
}

function ClassyLoader(source) {
	currentParser = getParser(this);
	if (currentParser == 'js') {
		return parseJsSource(source, this);
	}
	if (currentParser == 'css') {
		return parseCssSource(source, this);
	}
	return source;
};

ClassyLoader.init = (opts) => {
	if (opts instanceof Object) {
		for (let k in opts) {
			OPTIONS[k] = opts[k];
		}
	}
}

module.exports = ClassyLoader;