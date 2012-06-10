(function() {
	log('install - setting default preferences');
	var defBranch = Services.prefs.getDefaultBranch(PREFS_ROOT),
		prefIterator;
		
	prefIterator = Iterator(JSON.parse(read('chrome://htmlruby/locale/preferences.json')));
	
	for (let [key, value] in prefIterator) {
		switch (typeof value) {
			case 'boolean':
				defBranch.setBoolPref(key, value);
				break;
			case 'number':
				defBranch.setIntPref(key, value);
				break;
			case 'string':
				defBranch.setCharPref(key, value);
				break;
		}
		log('setting [' + key + '] to "' + value + '"');
	}
}());