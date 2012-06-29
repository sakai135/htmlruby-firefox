
var isInitialized = false;
function initialize() {
	log('startup - initialize() start');

	setString('chrome://htmlruby/locale/strings.property');
	
	log('loading rubydata');
	include('chrome://htmlruby/content/scripts/rubydata.js');
	
	log('loading notification');
	include('chrome://htmlruby/content/scripts/notification.js');
	
	isInitialized = true;

	log('startup - initialize() end');
}

log('loading processor');
include('chrome://htmlruby/content/scripts/processor.js');

(function() {
	function attach(window) {
		var appcontent;
		function load2(e) {
			var doc = e.originalTarget;
			if (typeof doc.body !== 'undefined') {
				log('DOMContentLoaded fired');
				getProcessor({ document: doc });
			}
		}
		if (window.document.documentElement.getAttribute('windowtype') === 'navigator:browser') {
			appcontent = window.document.getElementById('appcontent');
			if (typeof appcontent !== 'undefined' && appcontent !== null) {
				log('startup - attaching DOMContentLoaded to each window\'s appcontent');
				appcontent.addEventListener('DOMContentLoaded', load2, false);
				shutdownQueue.push(function() {
					log('shutdown - removing DOMContentLoaded from appcontent');
					appcontent.removeEventListener('DOMContentLoaded', load2, false);
				});
			}
		}
	}
	var observer = {
			observe: function(subject, topic, data) {
				function load() {
					attach(subject);
					subject.removeEventListener('load', load, false);
				}
				subject.QueryInterface(Ci.nsIDOMWindow);
				if (topic === 'domwindowopened') {
					subject.addEventListener('load', load, false);
				}
			}
		},
		openWindows = Services.wm.getEnumerator("navigator:browser");
	
	while (openWindows.hasMoreElements()) {
		let openWindow = openWindows.getNext(),
			load = function() {
				attach(openWindow);
				openWindow.removeEventListener('load', load, false);
			};
		if (openWindow.document.readyState === 'complete') {
			attach(openWindow);
		} else {
			openWindow.addEventListener('load', load, false);
		}
	}
	
	log('startup - loading ww observer');
	Services.ww.registerNotification(observer);
	shutdownQueue.push(function() {
		log('unloading ww observer');
		Services.ww.unregisterNotification(observer);
	});
	
	var timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
	timer.initWithCallback({
		notify: function(t) {
			if (!isInitialized) {
				log('delayed initialize');
				initialize();
			}
		}
	}, 10000, Ci.nsITimer.TYPE_ONE_SHOT);
	shutdownQueue.push(function() {
		if (typeof timer !== 'undefined') {
			timer.cancel();
		}
	});
	
	log('loading stylesheets');
	var sss = Components.classes['@mozilla.org/content/style-sheet-service;1'].getService(Components.interfaces.nsIStyleSheetService),
		uri = Services.io.newURI('chrome://htmlruby/skin/styles/htmlruby.css', null, null);
	if (!sss.sheetRegistered(uri, sss.USER_SHEET)) {
		sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
	}
	shutdownQueue.push(function() {
		log('unloading stylesheets');
		sss.unregisterSheet(uri, sss.USER_SHEET);
	});
	
	log('loading preferences');
	include('chrome://htmlruby/content/scripts/preferences.js');
	Preferences.register();
	Preferences.load();
	shutdownQueue.push(function() {
		log('unloading preferences');
		Preferences.unregister();
	});
}());
