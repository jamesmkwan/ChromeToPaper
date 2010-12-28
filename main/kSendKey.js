(function() {
  if(document.getElementById('form_key_send_now')) {
    chrome.extension.sendRequest({
      'task':'kSendKey',
      'ksk':document.getElementById('form_key_send_now').value
    });
  }
})();