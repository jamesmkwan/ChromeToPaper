var iconsChooser={ };

iconsChooser.hook=function() {
  $.each(icons,function(id) {
    $('#icons_list').append($('<div />')
      .addClass('icell')
      .attr('id','icell_'+id)
      .append($('<div />')
        .addClass('icell_prev')
        .append($('<img />')
          .attr({
            'src':'icons/'+id+'/'+this.prev,
            'alt':this.name+' preview'
          })
        )
      )
      .append($('<div />')
        .addClass('icell_title')
        .css('margin-left','80px')
        .text(this.name)
      )
      .append($('<div />')
        .addClass('icell_desc')
        .css('margin-left','80px')
        .text(this.desc)
      )
      .click(function() {
        localStorage['opt_icon']=id;
        $('.icell_active').removeClass('icell_active');
        $('#icell_'+localStorage['opt_icon']).addClass('icell_active');

        chrome.extension.sendRequest({
          'task':'reloadIcon'
        });
      })
    );
  });

  $('#icons_list .icell').first().addClass('icell_first');
  $('#icons_list .icell').last().addClass('icell_last');

  $('#icell_'+localStorage['opt_icon']).addClass('icell_active');
}

$(iconsChooser.hook);