//options.js

var options={
  'opt_saveToInstapaper': {
    'name':'ChromeToPaper',
    'description':'Activating the keystroke for this action is equivalent to clicking the Browser Button.'
  },
  'opt_openInstapaperList': {
    'name':'Open Reading List',
    'description':'Opens http://www.instapaper.com/u in a new tab'
  }
}

var opts={
};

//fromCharCode: extended String.fromCharCode functionality
opts.fromCharCode=function(a) {
  switch(parseInt(a)) {
    case 16:
      return 'Shift';
      break;
    case 17:
      return 'Ctrl';
      break;
    case 18:
      return 'Alt';
      break;
    default:
    alert(a);
      return String.fromCharCode(a);
  }
}

//bind2text: Converts keystroke code to text
opts.bind2text=function(a) {
  if(isNaN(a)) {
    return a;
  }
  return ''.concat(
    (a.substr(0,1)=='1')?'Ctrl+':'',
    (a.substr(1,1)=='1')?'Shift+':'',
    (a.substr(2,1)=='1')?'Alt+':'',
    opts.fromCharCode(a.substr(3)));
}

//Hook: Establishes DOM and Event Listeners
opts.hook=function() {

  //Establishes DOM
  $.each(options,function(id) {
    $('#options_list').append($('<div />')
      .addClass('rcell rcell_click')
      .attr('id','rcell_'+id)
      .append($('<div />')
        .addClass('rcell_stat')
        .text(opts.bind2text(localStorage[id]))
        .css('color','#360')
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
    
    var blok=$('#rcell_'+id);
    var stat=$('#rcell_'+id+' .rcell_stat');

    //Keywatch: encodes keystroke
    var keywatch=function(e) {
      console.log(e.which);
      if(e.which==27) localStorage[id]='Not binded';
      else localStorage[id]=''.concat(e.ctrlKey+0,e.shiftKey+0,e.altKey+0,e.which);
      stat
        .text(opts.bind2text(localStorage[id]))
        .css('color','#360');
    }

    blok.click(function() {
      stat
        .text('Press the Keystroke (Esc to unbind)')
        .css('color','#F00');
      $(document).one('keyup',keywatch);
    })
  });

  
  $('#options_list .rcell').first().addClass('rcell_first');    
  $('#options_list .rcell').last().addClass('rcell_last');
}

$(opts.hook);