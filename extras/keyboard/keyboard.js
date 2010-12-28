chrome.extension.sendRequest({
  'task':'shortcut'
},function(x) {
  document.addEventListener('keyup',function(e) {
    var s=''.concat(e.ctrlKey+0,e.shiftKey+0,e.altKey+0,e.which);
    var d=x.d;
    for(j in d) {
      if(s==d[j]) {
        for(var i=0;i<x.id.length;i++) {
          chrome.extension.sendRequest(x.id[i],{
            'task':j
          });
        }
      }
    }
  });
});