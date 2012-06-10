
const PREFS_ROOT = 'extensions.HTMLRuby.';
const DEBUG = false;
const Ci = Components.interfaces;
const Cu = Components.utils;
const Cc = Components.classes;

var shutdownQueue = [];

Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/AddonManager.jsm');
Cu.import("resource://gre/modules/PopupNotifications.jsm");

(function(global) {
	var addon, literal;
	function getXMLHttpRequest() {
		return Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
	}
	global.getURI = function(path) {
		if (path.indexOf('.property') > -1) {
			var locale = Services.prefs.getBranch('general.useragent.').getCharPref('locale'),
				newPath = path + '.' + locale;
			if (exists(newPath)) {
				path = newPath;
			} else {
				newPath = path + '.' + locale.substring(0, 2);
				if (exists(newPath)) {
					path = newPath;
				}
			}
			log('application locale is ' + locale + '; returning URI for "' + path + '"');
		}
		return addon.getResourceURI(path).spec;
	};
	global.exists = function(path) {
		return addon.hasResource(path);
	};
	global.include = function(path, scope) {
		if (typeof scope === 'undefined') {
			scope = global;
		}
		if (global.exists(path)) {
			log('include(' + path + ')');
			Services.scriptloader.loadSubScript(global.getURI(path), scope);
		} else {
			log('include() path [' + path + '] does not exist');
		}
	};
	global.read = function(path) {
		var request = getXMLHttpRequest();
		request.overrideMimeType('text/plain');
		request.open('GET', path, false);
		request.send(null);
		return request.responseText;
	};
	global.readAsync = function(path, callback) {
		var request = getXMLHttpRequest();
		req.overrideMimeType('text/plain');
		request.onreadystatechange = function() {
			if (request.readyState === 4) {
				callback(request.responseText);
			}
		};
		request.open('GET', path, true);
		request.send(null);
	};
	global.log = function(message) {
		if (DEBUG) {
			var d = new Date();
			Services.console.logStringMessage('HTML Ruby: ' + message + ' [' + String(d.getTime()).substr(-6, 6) + ']');
		}
	};
	global.setAddon = function(_addon) {
		addon = _addon;
	};
	global.getAddon = function() {
		return addon;
	};
	global.setString = function(path) {
		log('loading stringbundle [' + path + ']');
		literal = Services.strings.createBundle(getURI(path));
		shutdownQueue.push(function() {
			Services.strings.flushBundles();
		});
	};
	global.getString = function(name, args) {
		if (typeof args === 'undefined') {
			return literal.GetStringFromName(name);
		} else if (Array.isArray(args)) {
			return literal.formatStringFromName(name, args, args.length);
		} else {
			return literal.formatStringFromName(name, [args], 1);
		}
	};
}(this));

function install(data, reason) {
	log('install start');
	AddonManager.getAddonByID(data.id, function(addon) {
		setAddon(addon);
		include('scripts/bootstrap/install.js');
	});
	log('install end');
}

function startup(data, reason) {
	log('startup start');	
	AddonManager.getAddonByID(data.id, function(addon) {
		setAddon(addon);
		include('scripts/bootstrap/startup.js');
	});
	log('startup end');
}

function shutdown(data, reason) {
	log('shutdown start');
	shutdownQueue.forEach(function(unloader) {
		unloader();
	});
	shutdownQueue = [];
	log('shutdown end');
}

function uninstall(data, reason) {
	log('uninstall start');
	log('clearing preferences');
	var defBranch = Services.prefs.getDefaultBranch(PREFS_ROOT);
	defBranch.deleteBranch('');
	log('uninstall end');
}