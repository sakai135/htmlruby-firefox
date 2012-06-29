
var getNotification = function(param) {
	log('notification()');
	var that = {},
		
		// private variables
		onabort = param.onabort,
		document = param.document,
		window = document.defaultView,
		browser = window.opener,
		total,
		processedTotal,
		timeout,
		nBox,
		nProgress,
		
		// private functions
		startProgress = function(count) {
			log('notification.startProgress()');
			total = count;
			processedTotal = 0;
			
			if (typeof nBox === 'undefined') {
				nBox = Services.wm.getMostRecentWindow('navigator:browser').getNotificationBox(window);
			}
			if (nBox === null) {
				let openWindows = Services.wm.getEnumerator("navigator:browser");
				while (openWindows.hasMoreElements() && nBox === null) {
					nBox = openWindows.getNext().getNotificationBox(window);
				}
			}
			if (typeof nProgress === 'undefined' || nProgress === null || nProgress.parentNode === null) {
				window.clearTimeout(timeout);
				timeout = window.setTimeout(function() {
					if (processedTotal < total) {
						log('statusbar - processor taking long time');
						nProgress = nBox.appendNotification('', 'htmlruby-notification-progress', 'chrome://htmlruby/skin/icons/statusbar.png', 'PRIORITY_INFO_LOW', [
							{
								accessKey: 'A',
								callback: onabort,
								label: getString('notification.progress.abort'),
								popup: null
							}
						]);
						showProgress();
					}
				}, 3000);
			}
		},
		close = function() {
			log('notification.close()');
			if (typeof window !== 'undefined') {
				window.clearTimeout(timeout);
			}
			if (typeof nProgress !== 'undefined' && nProgress !== null && nProgress.parentNode !== null) {
				nProgress.close();
			}
		},
		showProgress = function() {
			log('notification.showProgress()');
			if (nProgress.parentNode !== null) {
				if (processedTotal === 0) {
					nProgress.label = getString('notification.prefix') + getString('notification.progress.parsing');
					timeout = window.setTimeout(showProgress, 100);
				} else if (processedTotal >= total) {
					nProgress.label = getString('notification.prefix')  + getString('notification.progress.complete');
					nProgress.removeChild(nProgress.getElementsByTagName('button')[0]);
					timeout = window.setTimeout(close, 5000);
				} else {
					nProgress.label = getString('notification.prefix') + getString('notification.progress.spacing', (processedTotal/total*100).toFixed());
					timeout = window.setTimeout(showProgress, 100);
				}
			}
		},
		updateProgress = function(processed) {
			log('notification.updateProgress()');
			processedTotal += processed;
		},
		onunload = function() {
			log('notification.onunload()');
			if (typeof window !== 'undefined') {
				window.removeEventListener('pagehide', onunload, false);
			}
		};
	
	// public
	that.start = startProgress;
	that.update = updateProgress;
	that.close = close;
	
	// constructor
	(function() {
		window.addEventListener('pagehide', onunload, false);
	}());
	
	return that;
};
