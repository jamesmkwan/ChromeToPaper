var instapaper_id='oeldmfnjmankppagkkmfkmhmbldeamjd';

chrome.extension.sendRequest({
  'task':'shortcut'
},function(x) {
  document.addEventListener('keyup',function(e) {
    if(''.concat(e.ctrlKey+0,e.shiftKey+0,e.altKey+0,e.which)==x) {
      chrome.extension.sendRequest(instapaper_id,{
        'task':'saveToInstapaper'
      });
    }
  });
});