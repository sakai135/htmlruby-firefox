
var Preferences = {
	rubyTextSize: '.55em',
	spaceRubyText: true,
	processInsertedContent: true,
	rubyLineHeight: '1em',
	adjustLineHeight: true,
	_branch: null,
	_SSService: null,
	_currentSheet: null,
	load: function() {
		var branch = this._branch;
		try {
			this.rubyTextSize = branch.getCharPref('rubyTextSize');
			this.spaceRubyText = branch.getBoolPref('spaceRubyText');
			this.processInsertedContent = branch.getBoolPref('processInsertedContent');
			this.rubyLineHeight = branch.getCharPref('rubyLineHeight');
			this.adjustLineHeight = branch.getBoolPref('adjustLineHeight');
		} catch(e) {
			branch.setCharPref('rubyTextSize', this.rubyTextSize);
			branch.setBoolPref('spaceRubyText', this.spaceRubyText);
			branch.setBoolPref('processInsertedContent', this.processInsertedContent);
			branch.setCharPref('rubyLineHeight', this.rubyLineHeight);
			branch.setBoolPref('adjustLineHeight', this.adjustLineHeight);
		}
		this.setUserPreferenceStyleSheet();
	},
	register: function() {
		var branch = Services.prefs.getBranch("extensions.HTMLRuby.");
		branch.QueryInterface(Ci.nsIPrefBranch2);
		branch.addObserver("", this, false);
		this._branch = branch;
		this._SSService = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
	},
	unregister: function() {
		var sss = this._SSService,
			currentSheet = this._currentSheet,
			branch = this._branch;
		if (currentSheet && sss.sheetRegistered(currentSheet, sss.USER_SHEET)) {
			sss.unregisterSheet(currentSheet, sss.USER_SHEET);
		}
		branch.removeObserver("", this);
		
		this._branch = undefined;
		this._SSService = undefined;
		this._currentSheet = undefined;
	},
	observe: function(subject, topic, data) {
		if (topic != "nsPref:changed") {
			return;
		}
		switch (data) {
			case 'rubyTextSize':
				this.rubyTextSize = this._branch.getCharPref('rubyTextSize');
				this.setUserPreferenceStyleSheet();
				break;
			case 'spaceRubyText':
				this.spaceRubyText = this._branch.getBoolPref('spaceRubyText');
				break;
			case 'processInsertedContent':
				this.processInsertedContent = this._branch.getBoolPref('processInsertedContent');
				break;
			case 'rubyLineHeight':
				this.rubyLineHeight = this._branch.getCharPref('rubyLineHeight');
				this.setUserPreferenceStyleSheet();
				break;
			case 'adjustLineHeight':
				this.adjustLineHeight = this._branch.getBoolPref('adjustLineHeight');
				this.setUserPreferenceStyleSheet();
				break;
		}
	},
	setUserPreferenceStyleSheet: function() {
		var sss = this._SSService,
			css = 'rtc,ruby>rt{font-size:' + this.rubyTextSize + '!important;-moz-transform:translateY(-' + this.rubyLineHeight + ')!important}';
		if (this.adjustLineHeight) {
			css += 'ruby{margin-top:' + this.rubyTextSize + '!important}';
		} else {
			css += 'ruby{margin-top:0px!important}';
		}
		var	uri = Services.io.newURI('data:text/css;charset=utf-8,' + encodeURIComponent(css), null, null),
			currentSheet = this._currentSheet;
		if (currentSheet && sss.sheetRegistered(currentSheet, sss.USER_SHEET)) {
			sss.unregisterSheet(currentSheet, sss.USER_SHEET);
		}
		if (!sss.sheetRegistered(uri, sss.USER_SHEET)) {
			sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
		}
		this._currentSheet = uri;
	},
	toString: function() {
		return 'version:' + '6.23.0' + '; rubyTextSize:' + this.rubyTextSize + '; spaceRubyText:' + this.spaceRubyText + '; processInsertedContent:' + this.processInsertedContent + '; rubyLineHeight:' + this.rubyLineHeight + '; adjustLineHeight:' + this.adjustLineHeight + ';';
	}
};
