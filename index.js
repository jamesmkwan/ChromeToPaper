$(function() {
  // Switch between stages
  var switchStage = function() {
    if(location.hash) {
      var hashname = location.hash.substr(1);
      $('#navbar span').removeClass('navbar_selected');
      $('#slide_' + hashname).addClass('navbar_selected');
      $('.stage').removeClass('stage_selected');
      $('#stage_' + hashname).addClass('stage_selected');
      if(hashname == 'account') {
        $('#username').focus();
      }
    }
  }; switchStage();
  $(window).bind('hashchange', switchStage);

  // Display cached status in faded out color
  $('#usergreeted').text(localStorage['un']);
  if(localStorage['au'] == 'true') {
    $('#userpanel').css('display', 'block');
    $('#userpanel, #userpanel *').css('color', '#AAA');
  } else {
    $('#loginpanel').css('display', 'block');
    $('#loginpanel *').css('color', '#AAA');
  }

  // updateAuwarn: show/hide auwarn
  var updateAuwarn = function() {
    if(localStorage['au'] == 'true') {
      $('#auwarn').css('display', 'none');
    } else {
      $('#auwarn').css('display', 'block');
    }
  }; updateAuwarn();

  // Update status once response is received
  sendAuth(function(status) {
    // Display appropriate panel
    if(status == 200) {
      $('#loginpanel').css('display', 'none');
      $('#userpanel').css('display', 'block');
      localStorage['au'] = 'true';
    } else {
      $('#loginpanel').css('display', 'block');
      $('#userpanel').css('display', 'none');
      localStorage['au'] = 'false';
    }

    updateAuwarn();

    // Fade in panel
    $('#userpanel, #userpanel span').animate({
      'color': '#000'
    });
    $('#userpanel a, #loginpanel a').animate({
      'color': '#00C'
    });
  });

  // reloadSettings: sends request to background page to reload settings
  var reloadSettings = function() {
    chrome.extension.sendMessage({
      'task': 'reloadSettings'
    });
  };

  // Account
  $('#logout').click(function() {
    localStorage['au'] = '';
    localStorage['un'] = '';
    localStorage['pw'] = '';

    $('#userpanel').css('display', 'none');
    updateAuwarn();
    $('#loginpanel').fadeIn();

    $('#username').focus();
  });
  $('#form_account').bind('submit', function(e) {
    e.preventDefault();
    $('#btn_login')
      .val('Logging in...')
      .attr('disabled', 1);

    var username = $('#username').val();
    var password = $('#password').val();

    sendAuth(function(status) {
      if(status == 200) {
        localStorage['au'] = 'true';
        localStorage['un'] = username;
        localStorage['pw'] = password;

        $('#usergreeted').text(username);

        $('#loginpanel').css('display', 'none');
        updateAuwarn();
        $('#userpanel').fadeIn();

        $('#loginmsg')
          .text('Success!')
          .css('color', '#060');
      } else if(status == 403) {
        $('#loginmsg')
          .text('Invalid Login')
          .css('color', '#F00');
      } else {
        $('#loginmsg')
          .text('Unexpected Error ' + status)
          .css('color', '#F00');
      }

      $('#btn_login')
        .val('Log in')
        .removeAttr('disabled');
      $('#username, #password').val('');
      $('#username').focus();
    }, username, password);
  });

  // Behavior
  var handleEnableOption = function(name, callback) {
    var updateStatus = function() {
      if(localStorage['opt_' + name] == 'true') {
        $('#option_' + name + ' .rcell_stat')
          .text('Enabled')
          .css('color', '#040');
      } else {
        $('#option_' + name + ' .rcell_stat')
          .text('Enable')
          .css('color', '#666');
      }
    }; updateStatus();

    $('#option_' + name).click(function() {
      if(localStorage['opt_' + name] == 'true') {
        localStorage['opt_' + name] = 'false';
      } else {
        localStorage['opt_' + name] = 'true';
      }
      updateStatus();
      callback();
    });
  };
  handleEnableOption('textviewonsave');
  handleEnableOption('closetabonsave');
  handleEnableOption('savelinksviacontextmenu', reloadSettings);
  handleEnableOption('openinstapaperfromcontextmenu', reloadSettings);
  handleEnableOption('doubleclicktoopeninstapaper');

  // Appearance
  $('#icon_' + localStorage['opt_icon']).addClass('rcell_selected');
  $('#iblock').on('click', '.rcell', function() {
    $('.rcell_selected').removeClass('rcell_selected');
    $(this).addClass('rcell_selected');
    localStorage['opt_icon'] = $(this).attr('id').substr(5);

    reloadSettings();
  });

  // Hotkeys
  var handleHotkeysPermissions = function() {
    var updateStatus = function() {
      if(localStorage['opt_hotkeys'] == 'true') {
        $('#option_hotkeys .rcell_stat')
          .text('Enabled')
          .css('color', '#040');
      } else {
        $('#option_hotkeys .rcell_stat')
          .text('Enable')
          .css('color', '#666');
      }
    }; updateStatus();

    $('#option_hotkeys').click(function() {
      if(localStorage['opt_hotkeys'] == 'true') {
        chrome.permissions.remove({
          'origins': ['*://*/*']
        }, function(success) {
          if(success) {
            localStorage['opt_hotkeys'] = 'false';
            updateStatus();
          }
        });
      } else {
        chrome.permissions.request({
          'origins': ['*://*/*']
        }, function(success) {
          if(success) {
            localStorage['opt_hotkeys'] = 'true';
            updateStatus();
          } else {
            alert('Request for additional permissions was denied');
          }
        });
      }
    });
  }; handleHotkeysPermissions();
  var handleHotkey = function(name) {
    /*
      localStorage['opt_hotkey'] = 'ABCDD';
        A = Control key
        B = Shift key
        C = Alt key
        DD = Keycode
     */
    var updateStatus = function() {
      if(isNaN(localStorage['opt_' + name]) || localStorage['opt_' + name].length < 4) {
        $('#option_' + name + ' .rcell_stat')
          .text('Unset')
          .css('color', '#666');
      } else {
        var keysequence = String.fromCharCode(localStorage['opt_' + name].substr(3));
        if(localStorage['opt_' + name].substr(0, 1) == '1') {
          keysequence = 'Ctrl + ' + keysequence;
        }
        if(localStorage['opt_' + name].substr(1, 1) == '1') {
          keysequence = 'Shift + ' + keysequence;
        }
        if(localStorage['opt_' + name].substr(2, 1) == '1') {
          keysequence = 'Alt + ' + keysequence;
        }
        keysequence = keysequence + ' (' + localStorage['opt_' + name].substr(3) + ')';

        $('#option_' + name + ' .rcell_stat')
          .text(keysequence)
          .css('color', '#333');
      }
    }; updateStatus();

    $('#option_' + name).click(function() {
      $('#option_' + name + ' .rcell_stat')
        .text('Press keystroke (Esc to unset)')
        .css('color', '#060');
      $('body').one('keyup', function(e) {
        if(e.which == 27) {
          localStorage['opt_' + name] = 'Unset';

        } else {
          localStorage['opt_' + name] = ''.concat(e.ctrlKey + 0, e.shiftKey + 0, e.altKey + 0, e.which);
        }
        updateStatus();
      });
    });
  }
  handleHotkey('hotkeysavetoinstapaper');
  handleHotkey('hotkeyreadinglist');

  // Misc
  $('#paypal_donate').click(function(e) {
    e.preventDefault();
    $('#paypal_donate_form').submit();
  });
});
