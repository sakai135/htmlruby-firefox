const VERSION = '7.2.0-beta1';
const PREFS_ROOT = 'extensions.HTMLRuby.';
const DEBUG = false;
const Ci = Components.interfaces;
const Cu = Components.utils;
const Cc = Components.classes;

var shutdownQueue = [];

(function(global) {
	var literal;
	function getXMLHttpRequest() {
		return Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
	}
	global.include = function(path) {
		log('include(' + path + ')');
		Services.scriptloader.loadSubScript(path, global, 'utf-8');
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
		if (!DEBUG)
			return;
			
		var d = new Date();
		Services.console.logStringMessage('HTML Ruby: ' + message + ' [' + String(d.getTime()).substr(-6, 6) + ']');
	};
	global.setString = function(path) {
		log('loading stringbundle [' + path + ']');
		literal = Services.strings.createBundle(path);
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
	log('install end');
}

function startup(data, reason) {
	log('startup start');
	Cu.import('resource://gre/modules/Services.jsm');
	Cu.import('resource://gre/modules/PopupNotifications.jsm');
	include('chrome://htmlruby/content/bootstrap/startup.js');
	log('startup end');
}

function shutdown(data, reason) {
	log('shutdown start');
	shutdownQueue.forEach(function(unloader) {
		unloader();
	});
	shutdownQueue = [];
	Cu.unload('resource://gre/modules/Services.jsm');
	Cu.unload('resource://gre/modules/PopupNotifications.jsm');
	log('shutdown end');
}

function uninstall(data, reason) {
	log('uninstall start');
	log('clearing preferences');
	var defBranch = Services.prefs.getDefaultBranch(PREFS_ROOT);
	defBranch.deleteBranch('');
	log('uninstall end');
}