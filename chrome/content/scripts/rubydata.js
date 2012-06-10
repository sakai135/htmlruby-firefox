
function RubyData(ruby) {
	this.ruby = ruby;
}
RubyData.prototype = {
	ruby: null,
	rts: null,
	rbs: null,
	rtWidths: null,
	rbWidths: null,		
	calculateWidths: function() {
		var ruby = this.ruby,
			rts = ruby.querySelector('rtc').querySelectorAll('rt'),
			rbs = ruby.querySelectorAll('rb'),
			rbCount = rbs.length,
			rtWidths = new Array(rbCount),
			rbWidths = new Array(rbCount),
			i = 0;
		for (; i<rbCount; i++) {
			var rt = rts[i];
			if (rt) {
				rtWidths[i] = rt.clientWidth;
				if (rt.hasAttribute('rbspan')) {
					i += rt.getAttribute('rbspan') - 1;
				}
			}
		}
		for (i=rbCount; i--; ) {
			rbWidths[i] = rbs[i].clientWidth;
		}
		this.rtWidths = rtWidths;
		this.rbWidths = rbWidths;
		this.rts = rts;
		this.rbs = rbs;
	}
};
