//query: converts query string to JSON object
(function($) {
  $.fn.query=function(q) {
    var obj={};
    var pairs=q.split('&');
    for(i in pairs) {
      var temp=pairs[i].split('=');
      obj[temp[0]]=temp[1];
    }
    return obj;
  }
})(jQuery);