chrome.extension.sendMessage({
  'task': 'hotkeys'
}, function(resp) {
  document.addEventListener('keyup',function(e) {
    var hotkey=''.concat(e.ctrlKey + 0, e.shiftKey + 0, e.altKey + 0, e.which);
    for(i in resp) {
      if(resp[i]['hotkey'] == hotkey) {
        chrome.extension.sendMessage({
          'task': resp[i]['task']
        });
      }
    }
  });
});
