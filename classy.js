var a = (...cls) => {
	var cs = [], c;
	for (var i = 0; i < cls.length; i++) {
		c = cls[i];
		if (c instanceof Array) {
			c = a(c);
		}
		if (!!c && typeof c == 'string') {
			cs.push(c);
		}
	}
	if (cs.length > 0) {
		return cs.join(' ');
	}
}

export default a;