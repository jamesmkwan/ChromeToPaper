//core.js

var core= {
  'log': {
  },
  'badge': {
    'timer':0
  },
  'msg':0,
  'ctx':false
};

//setDefaults: set default options if they are unset
core.setDefaults=function() {
  core.setDefault('opt_onclick','simple');
  core.setDefault('opt_feedback','badge');
  core.setDefault('opt_contextmenu','true');
  core.setDefault('opt_notiftimeout','5');
  core.setDefault('opt_icon','default');
}

//setDefault: set option if unset
core.setDefault=function(key,val) {
  if(localStorage.getItem(key)==null) {
    localStorage[key]=val;
    if(key=='opt_contextmenu') {
      core.reloadContextMenu();
    }
  }
}

//badge.clear: Clears the browser badge
core.badge.clear=function() {
  clearInterval(core.badge.timer);
  chrome.browserAction.setBadgeText({
    'text':''
  });
}

//badge.setPersistent: Sets a browser badge until cleared
core.badge.setPersistent=function(color,msg) {
  clearInterval(core.badge.timer);
  chrome.browserAction.setBadgeBackgroundColor({
    'color':color
  });
  chrome.browserAction.setBadgeText({
    'text':msg
  });
}

//badge.setDefault: Sets a browser badge that behaves based on user settings
core.badge.setDefault=function(color,msg) {
  clearInterval(core.badge.timer);
  chrome.browserAction.setBadgeBackgroundColor({
    'color':color
  });
  chrome.browserAction.setBadgeText({
    'text':msg
  });
  
  setInterval(core.badge.clear,5000)
  //To Implement: custom timer
  /*if(parseInt(localStorage['opt_notiftimeout'])>0) {
    setInterval(core.badge.clear,parseInt(localStorage['opt_notiftimeout']));
  }*/
}

//notif: Creates a notification
core.notif=function(img,msg) {
  var notif=webkitNotifications.createNotification(
    img,
    'ChromeToPaper',
    msg
  );
  if(parseInt(localStorage['opt_notiftimeout'])>0) {
    setTimeout(function() {
      notif.cancel();
    },parseInt(localStorage['opt_notiftimeout'])*1000);
  }
  notif.show();
}

//resp: Creates a response based on user setting
core.resp=function(type,msg) {
  if(localStorage['opt_feedback']=='notif') {
    var img=0;
    if(type=='error') img='error.png';
    else if(type=='auth') img='auth.png'
    else if(type=='success') img='success.png';
    core.notif(img,msg[0]);
  } else {
    var color=[0,102,153,128];
    if(type=='error') color=[255,0,0,200];
    else if(type=='auth') color=[0,102,153,128];
    else if(type='success') color=[0,255,0,128];
    core.badge.setDefault(color,msg[1]);
  }
}

//click: Handler for browser button click
core.click=function(t) {
  if(core.msg) {
    core.msg=0;
    localStorage['version']=core.version;
    chrome.tabs.create({
      'url':'welcome.html',
      selected:true
    });
    core.badge.clear();
  } else if(t.url=='chrome://newtab/') {
    core.badge.setDefault([0,255,0,128],'site');
    chrome.tabs.update(t.id,{
      'url':'http://instapaper.com/',
      selected:true
    });
  } if(localStorage['opt_onclick']=='popup') {
  } else {
    if(localStorage['opt_feedback']=='badge') {
      core.badge.setDefault([0,102,153,128],'...');
    }
    core.saveToInstapaper(t.url,t);
  }
}

//saveToInstapaper: Sends request
core.saveToInstapaper=function(url,t) {
  console.log(url);
  console.log(t);
  apiRemote.sendAdd(url,function(status) {
    core.handleStatus(status,t);
  });
}

//handleStatus: Outputs status
core.handleStatus=function(status,t) {
  if(status==201) {
    if(t!=null) {
      if(eval(localStorage['opt_close'])) {
        chrome.tabs.remove(t.id);
      }
      if(eval(localStorage['opt_text'])) {
        chrome.tabs.create({
          'index':t.index,
          'url':'http://www.instapaper.com/text?u='+escape(t.url)
        });
      }
    }
    
    core.resp('success',[
      'Success!',
      '+1'
    ]);
  } else if(status==403) {
    core.resp('auth',[
      code_error[status],
      'auth'
    ]);
    chrome.tabs.create({
      'url':'options.html#auth',
      'selected':true
    });
  } else if(code_error[status]) {
    core.resp('error',[
      code_error[status],
      status
    ]);
  } else {
    core.resp('error',[
      'Unspecified Error '+status,
      status
    ]);
  }
}

//hook: Adds listeners
core.hook=function() {
  chrome.browserAction.onClicked.addListener(core.click);
  chrome.extension.onRequest.addListener(function(data,from,callback) {
    switch(data.task) {
      case 'reloadContextMenu':
        core.reloadContextMenu(data.stat);
        break;
      case 'reloadIcon':
        core.reloadIcon();
        break;
      default:
        console.warn('Unknown task: '+data.task);
    }
  });
  chrome.extension.onRequestExternal.addListener(
    function(data,from,callback) {
      console.log(data);
      if(family[from.id]) {
        if(core.log[from.id]) {
          core.log[from.id]++;
        } else {
          core.log[from.id]=1;
        }

        switch(data.task) {
          case 'saveToInstapaper':
            core.saveToInstapaper(data.url);
            break;
          case 'openInstapaperList':
            core.openInstapaperList();
            break;
          default:
            console.warn('Unknown External Task: '+data.task);
        }
      } else {
        console.warn('Unrecognized Extension ID: '+from.id);
      }
    }
  );
  
  core.reloadContextMenu();
  core.reloadIcon();
}

core.reloadContextMenu=function(data) {
  if(core.ctx) {
    chrome.contextMenus.remove(core.ctx);
    console.log('Removing ctx '+core.ctx);
    core.ctx=false;
  }
  if(eval(localStorage['opt_contextmenu'])) {
    core.ctx=chrome.contextMenus.create({
      'title':'Save with ChromeToPaper',
      'contexts': [
        'link'
      ],
      'onclick':function(info,tab) {
        core.saveToInstapaper(info.linkUrl);
      }
    });
    console.log('Adding ctx'+core.ctx);
  }
}

core.reloadIcon=function() {
  chrome.browserAction.setIcon({
    'path':'icons/'+localStorage['opt_icon']+'/icon19.png'
  });
}

core.hook();