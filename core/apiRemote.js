//apiRemote.js

//Error Code/Message
var code_error= {
  400:'Server refused to process the request',
  403:'Please verify your credentials',
  404:'Could not connect to server',
  500:'Unknown server error'
};

//apiRemote: constructor
var apiRemote={
  'urlauth':'https://www.instapaper.com/api/authenticate',
  'urladd':'https://www.instapaper.com/api/add'
};

//sendAuth: API authenticate, returns status code
apiRemote.sendAuth=function(callback) {
  $.ajax({
    'method':'post',
    'cache':0,
    'url':apiRemote.urlauth,
    data: {
      'username':localStorage['un'],
      'password':localStorage['pw'],
      'random':(new Date()).getTime()
    },
    complete:function(xml,text) {
      callback(xml.status);
    }
  });
}

//sendAdd: API add URL, returns status code
apiRemote.sendAdd=function(url,callback) {
  $.ajax({
    'method':'post',
    'cache':0,
    'url':apiRemote.urladd,
    data: {
      'username':localStorage['un'],
      'password':localStorage['pw'],
      'random':(new Date()).getTime(),
      'url':url
    },
    complete:function(xml,text) {
      callback(xml.status);
    }
  });
}