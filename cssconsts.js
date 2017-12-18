const g = (...params) => {
	let str = '';
	for (let i = 0; i < params.length; i++) {
		str += params[i] + ':' + params[i + 1] + ';';
		i++;
	}
	return str;
}

const a = (value) => {
	if (value == '0') return 0;
	if (typeof value == 'number') {
		return value + 'px';
	}
	return value.match(/p$/) ? value.replace(/p$/, '') + '%' : value + 'px';
}

const b = (value, param) => {
	let p = value.split('-');
	let v = [];
	for (let i of p) {
		v.push(a(i));
	}
	return g(param, v.join(' '));
}

const c = (value) => {
	return '#' + value.replace(/^-/, '');
}

const h = (value) => {
	value = value.replace(/^-/, '');
	switch (value) {
		case 'grabbing':
			return g('cursor', 'grabbing', 'cursor', '-moz-grabbing', 'cursor', '-webkit-grabbing');
		case 'grab':
			return g('cursor', 'grab', 'cursor', '-moz-grab', 'cursor', '-webkit-grab');
	}
	return g('cursor', value);
}

const s = (value, param) => {
	let p = value.replace(/^-/, '').split('-');
	let v = [];
	if (p[2]) {
		v.push(a(p[2]));
	} else {
		v.push(0);
	}
	if (p[3]) {
		v.push(a(p[3]));
	} else {
		v.push(0);
	}
	if (p[1]) {
		v.push(a(p[1]));
	} else {
		v.push(0);
	}
	if (p[0]) {
		v.push('#' + p[0]);
	}
	return g(param, v.join(' '));
}

const d = (value, param) => {
	let p = value.split('-');
	let v = [];
	if (p[2]) {
		v.push(a(p[2]));
	} else {
		v.push(a(1));
	}
	if (p[3]) {
		v.push(p[3]);
	} else {
		v.push('solid');
	}
	if (p[1]) {
		v.push('#' + p[1]);
	}
	return g(param, v.join(' '));
}

const f = (value) => {
	let v = [];
	let p = value.replace(/^-/, '').split('-');
	for (let i of p) {
		v.push(i);
	}
	return g('font-family', '"' + v.join(' ') + '"');
}

const r = (value) => {	
	return g('transform', 'rotate(' + value + 'deg)');
}

const e = (value) => {
	let v = [];
	let p = value.replace(/^-/, '').split('-');
	for (let i = 0; i < p.length; i++) {
		let a = p[i];
		if (typeof map[a] == 'string' && p[i + 1]) {
			let o = ~~p[i + 1];
			v.push(map[a] + ' ' + o / 10 + 's');
		}
		i++;
	}
	return g('transition', v.join(', '));
}

const n = (value) => {
	let p = value.replace(/^-/, '').split('-'),
		p1 = p[0] || '0',
		p2 = p[1] || '0';

	return g('background-position', m(p1) + ' ' + m(p2));
}

const m = (value) => {
	value = value.trim();
	switch (value) {
		case 'c':
			return 'center';
		case 'l':
			return 'left';
		case 'r':
			return 'right';
		case 't':
			return 'top';
		case 'b':
			return 'bottom';
	}
	if (value.match(/^-*[\d]+p*$/)) {
		return a(value);
	}
	return '0';
}

const data = {
	lt: g('text-align', 'left'),
	col: g('table-collapse', 'collapse'),
	lfix: g('table-layout', 'fixed'),
	lt: g('text-align', 'left'),
	rt: g('text-align', 'right'),
	cen: g('text-align', 'center'),
	just: g('text-align', 'justify'),
	
	vtop: g('vertical-align', 'top'),
	vmid: g('vertical-align', 'middle'),
	vbot: g('vertical-align', 'bottom'),
	cur: g('cursor', 'default'),
	cnt: g('content', '""'),
	nor: g('resize', 'none'),
	shad: g('box-shadow', 'none'),
	tshad: g('text-shadow', 'none'),	
	
	un: g('text-decoration', 'underline'),
	pntr: g('cursor', 'pointer'),
	fl: g('float', 'left'),
	fr: g('float', 'right'),
	clr: g('clear', 'both'),
	auto: g('margin', 'auto'),
	bold: g('font-weight', 'bold'),
	it: g('font-style', 'italic'),
	
	norep: g('background-repeat', 'no-repeat'),	
	repx: g('background-repeat', 'repeat-x'),	
	repy: g('background-repeat', 'repeat-y'),	
	cvr: g('background-size', 'cover'),	
	
	fix: g('position', 'fixed'),
	abs: g('position', 'absolute'),
	rel: g('position', 'relative'),
	
	flex: g('display', 'flex'),
	bl: g('display', 'block'),
	inb: g('display', 'inline-block'),
	
	flcen: g('align-items', 'center', 'justify-content', 'center'),
	box: g('box-sizing', 'border-box'),

	ova: g('overflow', 'auto'),
	ovh: g('overflow', 'hidden'),	
	ovs: g('overflow', 'scroll'),	

	boc: value => g('border-color', c(value)),
	bc: value => g('background-color', c(value)),
	c: value => g('color', c(value)),

	bsp: g('border-spacing', 0),
	_br: value => b(value, 'border-radius'),

	z: value => g('z-index', value),
	_wh: value => g('width', a(value), 'height', a(value)),	

	wh: g('width', '100%', 'height', '100%'),
	w: g('width', '100%'),
	h: g('height', '100%'),
	l: g('left', 0),
	r: g('right', 0),
	t: g('top', 0),
	b: g('bottom', 0),
	o: g('opacity', 0),
	_w: value => g('width', a(value)),
	_h: value => g('height', a(value)),
	_l: value => g('left', a(value)),
	_r: value => g('right', a(value)),
	_t: value => g('top', a(value)),
	_b: value => g('bottom', a(value)),
	_o: value => g('opacity', '0.' + value),
	rubb: g('left', 0, 'right', 0, 'top', 0, 'bottom', 0),
	
	_bsp: value => g('border-spacing', a(value)),

	p: g('padding', 0),
	pl: g('padding-left', 0),
	pr: g('padding-right', 0),
	pt: g('padding-top', 0),
	pb: g('padding-bottom', 0),
	_p: value => b(value, 'padding'),
	_pl: value => g('padding-left', a(value)),
	_pr: value => g('padding-right', a(value)),
	_pt: value => g('padding-top', a(value)),
	_pb: value => g('padding-bottom', a(value)),

	m: g('margin', 0),
	ml: g('margin-left', 0),
	mr: g('margin-right', 0),
	mt: g('margin-top', 0),
	mb: g('margin-bottom', 0),
	_m: value => b(value, 'margin'),
	_ml: value => g('margin-left', a(value)),
	_mr: value => g('margin-right', a(value)),
	_mt: value => g('margin-top', a(value)),
	_mb: value => g('margin-bottom', a(value)),

	mnw: g('min-width', 0),
	mnh: g('min-height', 0),
	mxw: g('max-width', 'none'),
	mxh: g('max-height', 'none'),
	_mnw: value => g('min-width', a(value)),
	_mxw: value => g('max-width', a(value)),
	_mnh: value => g('min-height', a(value)),
	_mxh: value => g('max-height', a(value)),

	ol: g('outline', 0),
	bo: g('border', 0),
	bol: g('border-left', 0),
	bor: g('border-right', 0),
	bot: g('border-top', 0),
	bob: g('border-bottom', 0),
	br: g('border-radius', 0),
	_ol: value => d(value, 'outline'),
	_bo: value => d(value, 'border'),
	_bot: value => d(value, 'border-top'),
	_bob: value => d(value, 'border-bottom'),
	_bol: value => d(value, 'border-left'),
	_bor: value => d(value, 'border-right'),
	
	lh: g('line-height', 0),
	fs: g('font-size', 0),
	ls: g('letter-spacing', 0),
	_lh: value => g('line-height', a(value)),
	_fs: value => g('font-size', a(value)),
	_ls: value => g('letter-spacing', a(value)),

	_cur: h,

	_shad: value => s(value, 'box-shadow'),
	_tshad: value => s(value, 'text-shadow'),
	
	ff: f,
	tra: e,
	rot: r,
	ell: g('text-overflow', 'ellipsis', 'overflow', 'hidden', 'white-space', 'nowrap'),
	nowr: g('white-space', 'nowrap'),
	hid: g('visibility', 'hidden'),

	bpcen: g('background-position', '50% 50%'),
	bp: n
}

const map = {
	br: 'border-radius',
	cur: 'cursor',
	fl: 'float',
	clr: 'clear',
	m: 'margin',
	ml: 'margin-left',
	mr: 'margin-right',
	mt: 'margin-top',
	mb: 'margin-bottom',
	p: 'padding',
	pl: 'padding-left',
	pr: 'padding-right',
	pt: 'padding-top',
	pb: 'padding-bottom',
	w: 'width',
	h: 'height',
	l: 'left',
	r: 'right',
	t: 'top',
	b: 'bottom',
	mnw: 'min-width',
	mnh: 'min-height',
	mxw: 'max-width',
	mxh: 'max-height',
	pos: 'position',
	dis: 'display',
	o: 'opacity',
	fw: 'font-weight',
	ff: 'font-family',
	lh: 'line-height',
	fs: 'font-size', 
	fst: 'font-style',
	c: 'color',
	bc: 'background-color',
	boc: 'border-color',
	bo: 'border',
	bot: 'border-top',
	bob: 'border-bottom',
	bol: 'border-left',
	bor: 'border-right',
	shad: 'box-shadow',
	tshad: 'text-shadow',
	ov: 'overflow',
	td: 'text-decoration',
	ta: 'text-align'

}

module.exports = data;