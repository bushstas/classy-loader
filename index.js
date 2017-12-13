var {getOptions} = require('loader-utils');

const CLASSNAMES = '_cn_';
const ATTR = 'xClassName';
const PREFIX_ATTR = 'prefix';
const ADDED_PREFIX_ATTR = 'addedPrefix';

let conditionIndex, conditions;

const getParts = (source, attrName, quote) => {
	let r = new RegExp('\\b' + attrName + "\\s*=\\s*" + quote, 'g');
	let parts = source.split(r);
	if (!parts[1]) {
		return;
	}
	return parts;
}

const getRegex = (attr) => {
	return new RegExp('\\bwith\\s+' + attr + '\\s+[\'"] *([a-z][a-z\\-0-9]*) *[\'"];*', 'i');
}

const getPrefixes = (globalPrefix, prefixAttributeName, addedPrefixAttributeName, source, delimiter) => {
	let hasPrefix = false, hasAddedPrefix = false, matches, globalPrfx = globalPrefix, localPrfx = globalPrefix;
	matches = source.match(getRegex(PREFIX_ATTR));
	if (matches) {
		let lp = matches[1];
		if (lp) {
			localPrfx = lp;
			hasPrefix = true;
		}
	}

	matches = source.match(getRegex(ADDED_PREFIX_ATTR));
	if (matches) {
		let ap = matches[1];
		if (ap) {
			localPrfx = localPrfx + delimiter + ap;
			hasAddedPrefix = true;
		}
	}

	return {
		hasPrefix,
		hasAddedPrefix,
		localPrfx,
		globalPrfx,
		delimiter
	};
}

const removePrefixes = (source, prefixes) => {
	let {hasPrefix, hasAddedPrefix} = prefixes;
	if (hasPrefix) {
		source = source.replace(getRegex(PREFIX_ATTR), '');
	}
	if (hasAddedPrefix) {
		source = source.replace(getRegex(ADDED_PREFIX_ATTR), '');	
	}
	return source;
}

const getPart = (cl, prefixes, quote) => {
	let {
		localPrfx,
		globalPrfx,
		delimiter
	} = prefixes;

	let c = cl[0];	
	if (c == '.')
	{
		cl = cl.substring(1);
		if (cl == 'self') {
			return quote + localPrfx + quote;
		}
		return quote + localPrfx + delimiter + cl + quote;
	} 
	else if (c == '#')
	{
		cl = cl.substring(1);
		if (cl == 'self') {
			return quote + globalPrfx + quote;
		}
		return quote + globalPrfx + delimiter + cl + quote;
	}
	else if (c == '$')
	{		
		cl = cl.substring(1);
		if (cl[0] == '_' && cl.indexOf('_CONDITION_') == 0) {
			cl = cl.replace(/^_CONDITION_/, '').trim();
			if (cl[0] == '?') {									
				conditionIndex++;
				if (typeof conditions[conditionIndex] == 'string') {
					cl = cl.substring(1);
					let clp = cl.split(':'),
						condition = conditions[conditionIndex],
						value = condition + '?' + getPart(clp[0], prefixes, quote) + ':';
					if (clp[1]) {
						value += getPart(clp[1], prefixes, quote);
					} else {
						value += null;
					}
					return value;
				}
			}
		}
		return cl;
	}
	
	return quote + cl + quote;
}

const parse = (source, attrName, prefixes, quote) => {
	let parts = getParts(source, attrName, quote);
	if (parts instanceof Array) {
		let varsUsed = false,
			varsWereUsed = false;
		
		for (let i = 1; i < parts.length; i++) {
			let q = quote;
			let p = parts[i],			
				ps = p.split(q),
				value = ps[0];

			if (typeof value == 'string') {
				conditions = [];
				conditionIndex = -1;
				
				let found, reg = /\$\(([^\)]+)\)/g;
				while (found = reg.exec(value)) {
				    conditions.push(found[1]);
				    reg.lastIndex = found.index + found[0].length;
				}
				if (conditions.length > 0) {
					value = value.replace(reg, '$_CONDITION_');
				}




				value = value.replace(/[^\w\-\.\$\?: \(\)=\!><]/gi, '')
							 .replace(/(\w)([\.\$])/gi, "$1 $2")
							 .replace(/\.{2,}/g, '#')
							 .replace(/\s*\?\s*/g, '?')
							 .replace(/\s*:\s*/g, ':')
							 .replace(/\s{2,}/g, ' ');

				


				if (value) {
					varsUsed = conditions.length > 0 || (/\$/).test(value);
					if (varsUsed) {
						varsWereUsed = true;
					}
					let quoteSign = varsUsed ? '"' : '';
					let classes = value.split(' ');
					let classNames = [];
					for (let cl of classes) {
						classNames.push(getPart(cl, prefixes, quoteSign));						
					}

					ps[0] = '';
					ps = ps.join(q).substring(1);

					let className;
					if (varsUsed) {
						className = CLASSNAMES + '(' + classNames.join(',');
					} else {
						className = classNames.join(' ');
					}			

					let q2 = q;
					if (varsUsed) {
						className += ')';
						q = '{';
						q2 = '}';
					}
					parts[i] = 'className=' + q + className + q2 + ps;
				}
			}
		}
		source = parts.join('');
		if (varsWereUsed) {
			source = withClassNamesImport(source);
		}
	}
	return source;
}

const withClassNamesImport = (source) => {
	return "import " + CLASSNAMES + " from 'classnames';" + source;
}

module.exports = function(source) {
	let {
		attributeName = ATTR,
		prefixAttributeName = PREFIX_ATTR,
		addedPrefixAttributeName = ADDED_PREFIX_ATTR,
		globalPrefix = '',
		delimiter = '-'
	} = options = getOptions(this) || {};

	
	let prefixes = getPrefixes(
		globalPrefix,
		prefixAttributeName, 
		addedPrefixAttributeName,		
		source,
		delimiter
	);	
	
	source = parse(source, attributeName, prefixes, '"');
	source = parse(source, attributeName, prefixes, "'");	

	return removePrefixes(source, prefixes);
};