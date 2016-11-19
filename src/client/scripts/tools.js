$(document).ready(function(){
	
	var swa = $('.show-write-area');
	var autoexp = $('.autoexpand');
	var dotstruct = $('.dotstruct');
	var preserve = $('.preserve');
	var t_sw = $('.t_dark_ui, .t_light_ui');
	
	var vw = $('#output_viewer');
		
	var actShowHideWriteArea = function(){
		var how = $.cookie(NS+'writearea');
		
		if(null==how || how.toString()!=='hidden'){
			swa.addClass('sel');
			$('#formwrap').show().removeClass('h'); doResizeWin();
			$('#command').focus();
			
		}else{
			swa.removeClass('sel');
			$('#formwrap').hide('fast', function(){ $(this).addClass('h'); doResizeWin(); });
		}
	};
	
	var actAutoExpand = function(){
		var how = $.cookie(NS+'autoexpand');
		if(null==how || how.toString()!=='yes'){ autoexp.removeClass('sel');  }
		else{ autoexp.addClass('sel');  }
	};
	
	var actDotStruct = function(){
		var how = $.cookie(NS+'dotstruct');
		if(null==how || how.toString()!=='no'){dotstruct.addClass('sel');$('body').removeClass('nodots'); }
		else{ dotstruct.removeClass('sel');$('body').addClass('nodots'); };
	}; 
	
	var actPreserve = function(){
		var how = $.cookie(NS+'preserve');
		if(null==how || how.toString()!=='yes'){preserve.removeClass('sel').text('w'); }
		else{ preserve.addClass('sel').text('x');};
	}
	
	var actTheme = function(){
		t_sw.removeClass('sel');
		var how = $.cookie(NS+'theme');	
		var cond = (null==how || how.toString()==='light');
		$('#dark_ui').prop('disabled',cond); 
		
		if(cond){ $('.t_light_ui').addClass('sel'); }
		else { $('.t_dark_ui').addClass('sel'); }
	};
	
	$('.new-window').click(function(){ 
		var newwin = window.open(window.location.href,'w'+(new Date().getTime()),
			"height=500,width=800,modal=yes,alwaysRaised=yes");
		
		newwin.addEventListener('load', function(){
			var dbl = $('#output_viewer > *').clone(true,true);
			var tgt = $(newwin.document.getElementById('output_viewer'));
			window.lastnewwindow = newwin;
			dbl.appendTo(tgt);
		}, false);
	});
		
	$('.clear-console').click(function(){ clearConsole(); focusLastMessage(); });
	$('.ui-resizable-n').on('dblclick', function(){ swa.click(); });
	$('.reload').click(function(){ return window.location.reload(); });
	
	swa.click(function(){
		$.cookie(NS+'writearea', $(this).is('.sel') ? 'hidden': 'visible', {expires:30});
		actShowHideWriteArea();
	}); actShowHideWriteArea();
		
	autoexp.click( function(){ 
		$.cookie(NS+'autoexpand', $(this).is('.sel') ? 'no': 'yes', {expires:30});
		actAutoExpand();
	}); actAutoExpand();
	
	dotstruct.click(function(){
		$.cookie(NS+'dotstruct', $(this).is('.sel') ? 'no': 'yes', {expires:30});
		actDotStruct();
	}); actDotStruct();
	
	preserve.click(function(){
		$.cookie(NS+'preserve', $(this).is('.sel') ? 'no': 'yes', {expires:30});
		actPreserve();
	}); actPreserve();
	
	$('.expand-all').click(function(){ 
		var acoll = vw.find('.arrow-collapsed');
		while(acoll.length){
			acoll.click();
			acoll = vw.find('.arrow-collapsed');
		};
	});
	$('.collapse-all').click(function(){ 
		vw.find('.arrow-expanded').click(); 
		vw.find('.expandable > .object').remove(); 
		focusLastMessage();
	});
	
	t_sw.click(function(){
		$.cookie(NS+'theme', $(this).is('.t_dark_ui') ? 'dark': 'light', {expires:30});
		actTheme();
	}); actTheme();
	
});
