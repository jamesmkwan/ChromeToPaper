//options.js

var options={
  'au': {
    'name':'Account Credentials',
    'description':'Your credentials for instapaper.com are used to access the API',
    'behavior':'auth'
  },
  'opt_feedback': {
    'name':'Feedback Method',
    'description':'Choose your primary preference for feedback. Please note that not all feedback mechanisms are customizable.',
    'behavior':'radio',
    'opts': {
      'notif':'HTML5 Notifications',
      'badge':'Browser Button Badges'
    }
  },
  'opt_text': {
    'name':'Text View on Save',
    'description':'Automatically switch to text view when you save the page (excludes context menu)',
    'behavior':'toggle'
  },
  'opt_close': {
    'name':'Close Tab on Save',
    'description':'Automatically close tabs that you save to your reading list (excludes context menu)',
    'behavior':'toggle'
  },
  'opt_contextmenu': {
    'name':'Save links via Context Menu',
    'description':'Add an option to the context menu that allows you to save links (takes effect on restart)',
    'behavior':'toggle'
  },
  'opt_notiftimeout': {
    'name':'Notifications Self-Close Timeout',
    'description':'Set the time in seconds before the HTML5 notification popups automatically close. Setting this to zero will stop notifications from automatically closing.',
    'behavior':'slider',
    'opts': {
      'range_min':0,
      'range_max':10,
      'range_inc':1
    }
  }
}

var opts={
};

//Hook: Establishes DOM and Event Listeners
opts.hook=function() {
  //Establishes DOM
  $.each(options,function(id) {
    $('#options_list').append($('<div />')
      .addClass('rcell rcell_click')
      .attr('id','rcell_'+id)
      .append($('<div />')
        .addClass('rcell_stat')
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
    switch(this.behavior) {
      case 'auth':
        var rx=0;
        var stage=0;
        var expanded=0;
        var handleAuth=function(s) {
            if(s==200) {
              stat
                .text('Authorized')
                .css('color','#360');
              localStorage[id]=1;
              if(expanded) {
                expanded=0;
                $('#uiexpand').css('display','none');
                blok
                  .addClass('rcell_click')
                  .children('.uiauth')
                  .slideUp();
              }
            } else {
              localStorage[id]=0;
              if(s==403) {
                stat
                  .text('Incorrect Login')
                  .css('color','#F00');
              } else if(error[s]) {
                stat
                  .text(error[s])
                  .css('color','#F00');
              } else {
                stat
                  .text('Unexpected Error')
                  .css('color','#F00');
              }
            }
        };
        
        var updateAuth=function() {
          if(localStorage['un']!=0) {
            apiRemote.sendAuth(function(s) {
              rx=1;
              handleAuth(s);
            });
          } else {
            rx=1;
            stat
              .text('Not Authorized')
              .css('color','#F00');
          }
        };
        updateAuth();
        setTimeout(function() {
          if(!rx) {
            stat
              .text('Checking...')
              .css('color','#000');
          }
        },1000);
        
        
        blok
          .append($('<div />')
            .css({
              'display':'none',
              'margin-top':'25px'
            })
            .attr('id','uihello')
            .html('You are currently logged in as <span id="cuser">[unknown]</span>. If you want to use another account, please ')
            .append($('<a />')
              .attr('href','#')
              .css({
                'color':'#069',
                'text-decoration':'underline'
              })
              .text('logout')
              .click(function(e) {
                localStorage[id]=0;
                localStorage['un']=0;
                localStorage['pw']=0;
                
                expanded=0;
                $('#uihello').slideUp();
                $('#uiuser').select();
                updateAuth();
              })
            )
          )
          .append($('<div />')
            .css({
              'display':'none',
              'margin-top':'20px'
            })
            .addClass('uiauth')
            .append($('<form />')
              .append($('<table />')
                .attr({
                  'cellspacing':'0px',
                  'cellpadding':'5px'
                })
                .append($('<tr />')
                  .append($('<td />')
                    .css('width','50px')
                    .append($('<label />')
                      .addClass('uilabel')
                      .attr('for','uiuser')
                      .text('User:')
                    )
                  )
                  .append($('<td />')
                    .append($('<input />')
                      .addClass('uidata')
                      .attr({
                        'id':'uiuser',
                        'type':'text'
                      })
                    )
                  )
                )
              )
              .append($('<table />')
                .attr('id','uiexpand')
                .css('display','none')
                .attr({
                  'cellspacing':'0px',
                  'cellpadding':'5px'
                })
                .append($('<tr />')
                  .append($('<td />')
                    .css('width','50px')
                    .append($('<label />')
                      .addClass('uilabel')
                      .attr('for','uipass')
                      .text('Pass:')
                    )
                  )
                  .append($('<td />')
                    .append($('<input />')
                      .addClass('uidata')
                      .attr({
                        'id':'uipass',
                        'type':'password'
                      })
                    )
                  )
                )
              )
              .append($('<input />')
                .attr({
                  'type':'submit',
                  'value':'Login'
                })
              )
              .submit(function(e) {
                e.preventDefault();
                localStorage['un']=$('#uiuser').val();
                localStorage['pw']=$('#uipass').val();
                apiRemote.sendAuth(function(s) {
                  console.log(s);
                  if(s==403) {
                    if(stage) {
                      stat
                        .text('Verify your credentials and try again')
                        .css('color','#F00');
                      $('#uipass').select();
                    } else {
                      stage=1;
                      $('#uiexpand').slideDown();
                      $('#uipass').select();
                    }
                  } else {
                    handleAuth(s);
                  }
                })
              })
            )
          )
          .click(function() {
            if(eval(localStorage[id])) {
              if(!expanded) {
                expanded=1;
                $('#cuser').text(localStorage['un']);
                $('#uihello').slideDown();
              } else {
                expanded=0;
                $('#uihello').slideUp();
              }
            } else {
              if(!expanded) {
                expanded=1;
                blok
                  .removeClass('rcell_click')
                  .children('.uiauth')
                  .slideDown();
                if(stage) $('#uipass').select();
                else $('#uiuser').select();
              }
            }
          });
          
          if(location.hash.indexOf('auth')!=-1) {
            expanded=1;
            blok.children('.uiauth')
              .css('display','block')
              .prepend($('<div />')
                .html('The action you selected requires authorization. Please enter your credentials for instapaper.com<br /><br />')
                .css('color','#F00')
              );
            $('#uiuser').select();
          }
        break;
      case 'toggle':    
        var updateToggle=function() {
          if(eval(localStorage[id])) {
            stat
              .text('Enabled')
              .css('color','#360');
          } else {
            stat
              .text('Enable')
              .css('color','#999');
          }
        }
        
        updateToggle();
        blok.click(function() {
          localStorage[id]=!eval(localStorage[id]);
          updateToggle();
        });
        break;
      case 'radio':
        var updateRadio=function() {
          if(opt[localStorage[id]]) {
            stat
              .text(opt[localStorage[id]])
              .css('color','#069');
          }
        }
      
        var c=-1;
        var i=0;
        var dat=new Array();
        var opt=this.opts;
        $.each(this.opts,function(name) {
          if(localStorage[id]==name) {
            c=i;
          }
          dat[i]=name;
          i++;
        });
        
        updateRadio();
        blok.click(function() {
          c++;
          if(c>=dat.length) c=0;
          localStorage[id]=dat[c];
          updateRadio();
        });
        break;
      case 'slider':
        var updateSlider=function(ev,ui) {
          if(localStorage[id]>0) {
            stat
              .text(localStorage[id]+' seconds')
              .css('color','#360');
          } else {
            stat
              .text('Never')
              .css('color','#999');
          }
        }

        var handleSlider=function(ev,ui) {
          localStorage[id]=ui.value;
          updateSlider();
        }
      
        updateSlider();
        blok
          .css('cursor','pointer')
          .append($('<div />')
            .addClass('uislider')
            .css({
              'display':'none',
              'margin-top':'25px'
            })
            .append($('<div />')
              .css({
                'width':'500px',
                'margin':'auto'
              })
              .slider({
                'min':this.opts.range_min,
                'max':this.opts.range_max,
                'step':this.opts.range_inc,
                'value':localStorage[id],
                'slide':handleSlider,
                'change':handleSlider
              })
            )
          )
          .toggle(function() {
            blok.removeClass('rcell_click');
            blok.children('.uislider').slideDown();
          },function() {
            blok.addClass('rcell_click');
            blok.children('.uislider').slideUp();
          });
        break;
      default:
        $('#rcell_'+id+' .rcell_stat').text('');
    }
  });
  
  $('#options_list .rcell').first().addClass('rcell_first');    
  $('#options_list .rcell').last().addClass('rcell_last');
}

$(opts.hook);