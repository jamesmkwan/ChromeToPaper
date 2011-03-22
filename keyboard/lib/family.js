//family.js

//Family Data
var family= {
  'bbmelbhnoccdkjiblgchdaofjdbombmh': {
    'name':'ChromeToPaper',
    'short':'Core',
    'description':'Features a Browser Button and Context Menu integration.',
    'url':'https://chrome.google.com/webstore/detail/bbmelbhnoccdkjiblgchdaofjdbombmh',
    'options_page':'options.html'
  },
  'lpjpjcgbkjefppoahpegfajifjdmcblb': {
    'name':'Chromapaper Reader',
    'short':'Reader',
    'description':'The perfect way to read your articles.',
    'url':'https://chrome.google.com/webstore/detail/lpjpjcgbkjefppoahpegfajifjdmcblb',
    'options_page':'options.html'
  },
  'anphalfoaaegidcbognealancgeanllm': {
    'name':'ChromeToPaper Keyboard Shortcuts',
    'short':'Shortcuts',
    'description':'Adds customizable keybord shortcuts for various tasks.',
    'url':'https://chrome.google.com/webstore/detail/anphalfoaaegidcbognealancgeanllm',
    'options_page':'options.html'
  }
};

var familyLinker={
};

//Hook: Establishes DOM and Event Listeners
familyLinker.hook=function() {
  $.each(family,function(id) {
    if(this.short!='hide') {
      $('#family_linker')
        .append($('<a />')
          .addClass('linker')
          .text(this.short)
          .attr({
            'id':'linker_'+id,
            'href':'chrome-extension://'+id+'/'+this.options_page
          })
        )
        .append($('<span />')
          .addClass('linker_divider')
          .html(' &bull; ')
        );
    }
  });
  $('#family_linker').append($('<a />')
    .attr('id','linker_manage')
    .text('Manager')
    .attr('href','lib/family.html')
  );
        
  
  //Extension Hooks
  //0: Display None
  //1: Display Block
  chrome.management.onUninstalled.addListener(function(extid) {
    familyLinker.handleExtension(extid,0);
  });  
  chrome.management.onInstalled.addListener(function(ext) {
    familyLinker.handleExtension(ext.id,1);
  });
  chrome.management.onEnabled.addListener(function(ext) {
    familyLinker.handleExtension(ext.id,1);
  });
  chrome.management.onDisabled.addListener(function(ext) {
    familyLinker.handleExtension(ext.id,0);
  });
  chrome.management.getAll(function(exts) {
    $.each(exts,function() {
      familyLinker.handleExtension(this.id,this.enabled);
    });
  });

  //Bold Link
  var rManager=/^chrome-extension:.+\/family.html$/;
  var rOptions=/^chrome-extension:\/\/([a-z]{32})\//;
  var rDonate =/^chrome-extension:.+\/donate.html$/;
  if(rManager.exec(location.href)) {
    $('#linker_manage').css({
      'font-weight':'bold',
      'color':'#000'
    });
  } else if(rDonate.exec(location.href)) {
    //Do nothing
  } else {
    var result=rOptions.exec(location.href);
    if(result[1]) {
      $('#linker_'+result[1]).css({
        'font-weight':'bold',
        'color':'#000'
      });
    }
  }
}

//handleExtension: updates button based on extension and status
familyLinker.handleExtension=function(extid,stat) {
  if(family[extid]) {
    $('#linker_'+extid)
      .css('display',stat?'inline':'none')
      .next('.linker_divider')
      .data('stat',stat);
    familyLinker.updateBullets();
  }
}

//updateBullets: hides/reveals bullet point spacers
familyLinker.updateBullets=function() {
  $('.linker_divider')
    .css('display','none')
    .each(function() {
      if($(this).data('stat')) {
        $(this).css('display','inline');
      }
    });
}

$(familyLinker.hook);