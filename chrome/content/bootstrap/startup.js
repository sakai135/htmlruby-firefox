(function() {
	log('loading processor');
	include('chrome://htmlruby/content/scripts/processor.js');

	setString('chrome://htmlruby/locale/strings.property');
	
	log('loading rubydata');
	include('chrome://htmlruby/content/scripts/rubydata.js');
	shutdownQueue.push(function() {
		RubyData = null;
	});
	
	log('loading notification');
	include('chrome://htmlruby/content/scripts/notification.js');
	shutdownQueue.push(function() {
		getNotification = null;
	});
	
	(function() {
		var sss, uri;
		log('loading stylesheets');
		sss = Components.classes['@mozilla.org/content/style-sheet-service;1'].getService(Components.interfaces.nsIStyleSheetService);
		uri = Services.io.newURI('chrome://htmlruby/skin/styles/htmlruby.css', null, null);
		if (!sss.sheetRegistered(uri, sss.USER_SHEET)) {
			sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
		}
		shutdownQueue.push(function() {
			log('unloading stylesheets');
			sss.unregisterSheet(uri, sss.USER_SHEET);
		});
	}());
	
	log('loading preferences');
	include('chrome://htmlruby/content/scripts/preferences.js');
	Preferences.register();
	Preferences.load();
	shutdownQueue.push(function() {
		log('unloading preferences');
		Preferences.unregister();
		Preferences = null;
	});
	
	function attach(window) {
		function load2(e) {
			var doc = e.originalTarget;
			if (typeof doc.body !== 'undefined' && (doc.location.protocol === 'http:' || doc.location.protocol === 'https:' || doc.location.protocol === 'file:')) {
				log('DOMContentLoaded fired');
				getProcessor({ document: doc });
			}
		}
		if (window.document.documentElement.getAttribute('windowtype') === 'navigator:browser') {
			let appcontent = window.document.getElementById('appcontent');
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

	(function() {
		var openWindows = Services.wm.getEnumerator("navigator:browser"), openWindow, load;
		while (openWindows.hasMoreElements()) {
			openWindow = openWindows.getNext();
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
	}());
	(function() {
		log('startup - loading ww observer');
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
		};
		Services.ww.registerNotification(observer);
		shutdownQueue.push(function() {
			log('unloading ww observer');
			Services.ww.unregisterNotification(observer);
		});
	}());
}());