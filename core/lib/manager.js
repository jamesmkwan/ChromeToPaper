//familyManager.js

var familyManager={
};

//Hook: Establishes DOM and Event Listeners
familyManager.hook=function() {
  //Adds Manager
  $.each(family,function(id) {
    $('#extension_list').append($('<div />')
      .addClass('rcell')
      .attr('id','rcell_'+id)
      .append($('<div />')
        .addClass('rcell_btn')
        .data({
          //0-Undetected         - Install
          //1-Installed/Running  - Installed
          //2-Installed/Disabled - Enable
          'stat':0,
          'id':id
        })
        .css('display','block')
        .click(familyManager.handleClick)
        .append($('<a />')
          .attr({
            'target':'_blank',
            'href':this.url
          })
          .text('Install')
        )
      )
      .append($('<div />')
        .addClass('rcell_title')
        .text(this.name)
      )
      .append($('<div />')
        .addClass('rcell_desc')
        .text(this.description)
      )
    );
  });
  
  $('#extension_list .rcell').first().addClass('rcell_first');    
  $('#extension_list .rcell').last().addClass('rcell_last');
  
  //Extension Hooks
  chrome.management.onUninstalled.addListener(function(extid) {
    familyManager.handleExtension(extid,0);
  });  
  chrome.management.onInstalled.addListener(function(ext) {
    familyManager.handleExtension(ext.id,1);
  });
  chrome.management.onEnabled.addListener(function(ext) {
    familyManager.handleExtension(ext.id,1);
  });
  chrome.management.onDisabled.addListener(function(ext) {
    familyManager.handleExtension(ext.id,2);
  });
  chrome.management.getAll(function(exts) {
    $.each(exts,function() {
      familyManager.handleExtension(this.id,this.enabled?1:2);
    });
  });
}

//handleExtension: updates button based on extension and status
familyManager.handleExtension=function(extid,stat) {
  if(family[extid]) {
    switch(stat) {
      case 0:
        $('#rcell_'+extid+' .rcell_btn')
          .data('stat',stat)
          .css('border','1px solid #CCC')
          .children('a')
          .attr({
            'target':'_blank',
            'href':family[extid].url
          })
          .text('Install');
          break;
      case 1:
        $('#rcell_'+extid+' .rcell_btn')
          .data('stat',stat)
          .css('border','0px solid #CCC')
          .children('a')
          .attr({
            'target':'_self',
            'href':'chrome-extension://'+extid+'/'+family[extid].options_page
          })
          .html('&#x2714; Installed');
          break;
      case 2:
        $('#rcell_'+extid+' .rcell_btn')
          .data('stat',stat)
          .css('border','1px solid #CCC')
          .children('a')
          .attr({
            'target':'_top',
            'href':'#'
          })
          .text('Enable');
    }
  }
}

//handleClick: reads data.stat and executes appropriate action
familyManager.handleClick=function(e) {
  if($(this).data('stat')==2) {
    e.preventDefault();
    chrome.management.setEnabled($(this).data('id'),true);
  }
}

$(familyManager.hook);