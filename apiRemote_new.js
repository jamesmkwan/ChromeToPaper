// apiRemote.js

/* This is a new implementation of my apiRemote.js
 * It uses the new Instapaper API which utilizes a
 * variation of XAuth for sending requests
 */

// Error Code/Message
var code_error = {
  400:'Server refused to process the request',
  401:'OAuth Error',
  403:'Please verify your credentials',
  404:'Could not connect to server',
  500:'Unknown server error'
};

// apiRemote: constructor
var apiRemote = { };

// Uses full Instapapr API at http://www.instapaper.com/api/full
apiRemote.url = 'https://www.instapaper.com/api/1/';
apiRemote.urlGetToken = apiRemote.url+'oauth/access_token';
apiRemote.urlGetFolders = apiRemote.url+'folders/list';
apiRemote.urlSendAuth = apiRemote.url+'account/verify_credentials';
apiRemote.urlSendAdd = apiRemote.url+'booksmarks/add';

/* The following keys are unique and designated for my extension.
   If you are a developer, please do not use the same keys as me.
   Rather, request your own API keys from the Instapaper website.
*/
apiRemote.oauth_key = 'zdEvMxorRXEoucdaPsBDpVsozLAus8zE80e6Dki1cXSYLY2PWQ';
apiRemote.oauth_secret = 'KX05kaIuQ3yFoj2cEmwsd65RIov0W07qPePwP2AA3Ht9bvMhfk&';

/* Here is a chart to explain how the functions are structured:
  +-------------+
  |Top Level    |
  |-------------|     +---------+      +---------+      +---------+
  | - getToken  |     |Mid Level|      |Lib Level|      |         |
  | - getFolders|---->|---------|----->|---------|----->| Handler |
  | - sendAuth  |     | - send  |      | - $.ajax|      |         |
  | - sendAdd   |     +---------+      +---------+      +---------+
  +-------------+         ^ |
                          | |
                          | v
       +---------+    +---------+
       |Lib Level|--->|Low Level|
       |---------|    |---------|
       | - b64_s…|<---| - sign  |
       | - escape|    |         |
       +---------+    +---------+
*/

apiRemote.getToken = function(cb) {
  // Reset authorization status
  localStorage['au'] = 0;

  var data = {
    'x_auth_mode': 'client_auth',
    'x_auth_username': localStorage['un'],
    'x_auth_password': localStorage['pw']
  };
  apiRemote.send(apiRemote.urlGetToken, data, function(resp) {
    if(apiRemote.successful(resp)) {
      if(resp['oauth_token'] && resp['oauth_token_secret']) {
        localStorage['oauth_token'] = resp['oauth_token'];
        localStorage['oauth_token_secret'] = resp['oauth_token_secret'];
        localStorage['au'] = 1;

        cb(true);
      }
    } else {
      cb(false);
    }

    // Clear user password as per Instapaper API Terms
    localStorage['pw'] = '';
  });
}

// send: sends request data to specified URL and returns response to callback function
apiRemote.send=function(url,data,cb) {
  $.extend(data,{
    'oauth_consumer_key': apiRemote.oauth_key,
    'oauth_signature_method': 'HMAC-SHA1',
    'oauth_timestamp': Math.round((new Date()).getTime()/1000)
  });
  data = apiRemote.sign(url,data);
  
  $.ajax({
    'type': 'post',
    'cache': 0,
    'data': data,
    'url': url,
    'complete': function(xml,text) {
      if(xml.status != 200) {
        console.log('Error ' + xml.status + ': ' + xml.status);
      }

      // Convert query string response into JSON
      var obj = {};
      var pairs = xml.responseText.split('&');
      for(i in pairs) {
        var temp = pairs[i].split('=');
        obj[temp[0]] = temp[1];
      }
      obj[status] = xml.status;

      // Return JSON response
      cb(obj);
    }
  });
}

// sign: takes OAuth parameters and appends signature
apiRemote.sign = function(url,data) {
  var str = 'POST&' + apiRemote.escape(url) + '&';
  data = apiRemote.sort(data)
  str += apiRemote.escape($.param(data));

  //console.log(str);
  //console.log(b64_hmac_sha1(apiRemote.oauth_secret,str));

  $.extend(data, {
    'oauth_signature': b64_hmac_sha1(apiRemote.oauth_secret,str)+'='
  });
  return data;
}

// escape: encodes characters to OAuth specifications
apiRemote.escape=function(x) {
  x = encodeURIComponent(x);
  x = x.replace(/\!/g, "%21");
  x = x.replace(/\*/g, "%2A");
  x = x.replace(/\'/g, "%27");
  x = x.replace(/\(/g, "%28");
  x = x.replace(/\)/g, "%29");
  return x;
}

// sort: sorts JSON object by name
apiRemote.sort = function(json) {
  var keys = new Array()
  for(k in json) {
    keys[keys.length] = k;
  }
  keys.sort();

  var obj = {};
  for(k in keys) {
    obj[keys[k]] = json[keys[k]]
  }

  return obj;
};

// successful: checks if request is successful
apiRemote.successful = function(resp) {
  return (resp[status] == 200);
}