// background.js

$(function() {
	var version = '2.6';
	
	// setDefault: set option in localStorage if unset
	var setDefault = function(key, val) {
		if(localStorage.getItem(key) == null) {
			localStorage[key] = val;
		}
	}
	
	// Set up default settings
	setDefault('opt_savelinksviacontextmenu', 'true');
	setDefault('opt_icon', 'default');
	
	// reloadSettings: updates extension to comply with users' settings
	var reloadSettings = function() {
		// Load icon
		chrome.browserAction.setIcon({
			'path': 'icons/' + localStorage['opt_icon'] + '/icon19.png'
		});

		// Load context menu
		chrome.contextMenus.removeAll(function() {
			if(localStorage['opt_savelinksviacontextmenu'] == 'true') {
				chrome.contextMenus.create({
					'title': 'Save with ChromeToPaper', 
					'contexts': ['link'],
					'onclick': function(info, tab) {
						saveToInstapaper(info.linkUrl, handleStatus);
					}
				})
			}
		});
	}; reloadSettings();
	
	// Listen for extension messages
	chrome.extension.onMessage.addListener(function(data, from, callback) {
		switch(data.task) {
			case 'reloadSettings':
				reloadSettings();
				break;
			case 'savePage':
				chrome.tabs.query({
					'currentWindow': true,
					'active': true
				}, function(tab) {
					handleClick(tab[0]);
				});
				break;
			case 'openReadingList':
				chrome.tabs.create({
					'url': 'http://instapaper.com/'
				});
				break;
			case 'hotkeys':
				callback([
					{
						'task': 'savePage',
						'hotkey': localStorage['opt_hotkeysavetoinstapaper']
					}, {
						'task': 'openReadingList',
						'hotkey': localStorage['opt_hotkeyreadinglist']
					}
				]);
			  break;
		}
	});

	// Listen for updated tabs
	chrome.tabs.onUpdated.addListener(function(id, info, tab) {
		// Inject content script if page completed loading
		if(localStorage['opt_hotkeys'] == 'true' && info.status == 'complete') {
			chrome.tabs.executeScript(id, {
				'file': 'hotkeys.js'
			});
		}
	});

	// handleClick: Listener for browser action
	var handleClick = function(tab) {
		if(localStorage['version'] != version) { // Open welcome notice if ChromeToPaper is updated
			localStorage['version'] = version;
			badgeClear();
			chrome.tabs.create({
				'index': tab.index,
				'url':  'index.html'
			});
		} else if(tab.url == 'chrome://newtab/') { // Open Instapaper website if on new tab page
			chrome.tabs.update(tab.id, {
				'url': 'http://instapaper.com/'
			});
		} else { // Otherwise save page to Instapaper
			saveToInstapaper(tab.url, function(status) {
				if(status == 201) {
					// Close tab if option is set
					if(localStorage['opt_closetabonsave'] == 'true') {
						chrome.tabs.remove(tab.id);
					}

					// Open text view if option is set
					if(localStorage['opt_textviewonsave'] == 'true') {
						chrome.tabs.create({
							'index': tab.index,
							'url': 'http://www.instapaper.com/text?u=' + escape(tab.url)
						})
					}
				}
				handleStatus(status);
			}, tab.title);
		}
	};
	chrome.browserAction.onClicked.addListener(handleClick);
	
	// saveToInstapaper: calls function from apiRemote
	var saveToInstapaper = function(url, callback, title) {
		//Create indicator to show that the request is being resolved
		badgeSetTemp([0, 102, 153, 128], '...');
		
		sendAdd(url, title, callback);
	};
	
	// handleStatus: displays proper badge feedback
	var handleStatus = function(status) {
		if(status == 201) {
			badgeSet([0, 255, 0, 128], '+1');
		} else if (status == 403) { // Not authorized
			badgeSet([0, 102, 153, 128], 'auth')
			chrome.tabs.create({
				'url': 'index.html#account'
			})
		} else { //Unknown error
			badgeSet([255, 0, 0, 128], 'e' + status)
		}
	};
	
	var badgeClearTimer = 0;
	
	// badgeClear: clears the current badge
	var badgeClear = function() {
		clearInterval(badgeClearTimer);
		chrome.browserAction.setBadgeText({
			'text': ''
		});
	};
	
	// badgeSet: set a message on the badge
	var badgeSet = function(color, text) {
		clearInterval(badgeClearTimer);
		chrome.browserAction.setBadgeBackgroundColor({
			'color': color
		});
		chrome.browserAction.setBadgeText({
			'text': text
		})
	};
	
	// badgeSetTemp: set a temporary message on the badge
	var badgeSetTemp = function(color, text) {
		badgeSet(color, text);
		
		// Clear the message after 5s
		setInterval(badgeClear, 5000);
	};

	// If first time running extension, immediately open welcome page
	if(localStorage['firstrun'] != 'no') {
		localStorage['firstrun'] = 'no';
		localStorage['version'] = version;
		chrome.tabs.create({
			'url': 'index.html'
		});
	} else if(localStorage['version'] != version) {
		// Display 'msg' badge if updated welcome center
		badgeSet([0,102,153,128], 'msg');
	}
})