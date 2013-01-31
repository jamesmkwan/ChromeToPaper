// apiRemote.js

// sendAuth: API authenticate, returns status code
function sendAuth(callback, username, password) {
    if(typeof username == 'undefined' || typeof password == 'undefined') {
        var username = localStorage['un'];
        var password = localStorage['pw'];
    }

  $.ajax({
    'method': 'post',
    'cache': 0,
    'url': 'https://www.instapaper.com/api/authenticate',
    'data': {
      'username': username,
      'password': password,
      'random': (new Date()).getTime()
    },
    'complete': function(xml, text) {
      callback(xml.status);
    }
  });
}

// sendAdd: API add URL, returns status code
function sendAdd(url, title, callback) {
  var data = {
    'username': localStorage['un'],
    'password': localStorage['pw'],
    'random': (new Date()).getTime(),
    'url': url
  };

  if(title) {
    $.extend(data, {
      'title': title
    });
  }

  $.ajax({
    'method': 'post',
    'cache': 0,
    'url': 'https://www.instapaper.com/api/add',
    'data': data,
    'complete': function(xml, text) {
      callback(xml.status);
    }
  });
}
