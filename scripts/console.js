function is_numeric(mixed_var){return(typeof(mixed_var)==='number'||typeof(mixed_var)==='string')&&mixed_var!==''&&!isNaN(mixed_var);}

$(document).ready(function(){
	
	var nsr_min = 40;
	var nsr_max = 500;
		
	window.NS = 'dbg_';
	var c = $('#command');
	var vw = $('#output_viewer');
	var vwr = $('#output_wrappr');
	
	var dvwscr = {
		refresh:function(){}, destroy:function(){ return null; }, disable:function(){},
		scrollTo:function(x,y){ vwr.scrollTop(Math.abs(y)); vwr.scrollLeft(Math.abs(x)); }};
	var vwscr = dvwscr;
	var vwscrint = 0;
	
	var encd = function(v){ return $('<div />').text(v).html();};
	var decd = function(v){ return $('<div />').html(v).text();};
	
	window.clearConsole = function(){ c.val(''); return vw.html('');};
		
	var treefiy_obj = function(o, n, c){
		var r = { data:"<span class='fn' title='"+n+"'>"+n+"</span>",  state:!!c ? 'open' : 'closed', children:[] };
		for(var i in o){
			if(typeof(o[i])==='object' && o[i]!==null)
				o[i] = treefiy_obj(o[i], i);
			else{
				var val = encd(o[i]);
				// if(val.length>100) val = '<span>'+val.substr(0,100)+'... (length: '+val.length+')</span>';
				o[i] = "<span class='fn' title='"+i+"'>"+i+"</span><span class='undef'>"+val+'</span>';
			}; 			
			r.children.push(o[i]);
		};
		return r;
	};
	
	window.focusLastMessage = function(){
		vwscr.refresh();
		if(vwscr==dvwscr){
			vwscr.scrollTo(0,vw.height());
		}else{
			vwscr.stop();
			var tgth = (-1 * vw.height() + vwr.height() ); tgth = tgth>0 ? 0 : tgth;
			$(vw).attr('style', '-webkit-transform: translate3d(0px, '+(tgth)+'px, 0px) scale(1);');
		};
	};
	
	window.showAnError = function(err, type){ 
		if(typeof(type)!=='string') type='error';
		var resp = $('<div class="'+type+' output"> </div>').appendTo(vw);
		resp.html(' <span class="eicon">W</span> '+encd(err)); 
		
		focusLastMessage();
	};
	
	window.showAResponse = function(r){ 
		var resp = $('<div class="output"></div>').appendTo(vw);
		var tpo = typeof(r.cnt); 
		if(typeof(r.fnprefix)==='string') window.fnprefix = r.fnprefix; 
		if(r.cnt===null) tpo = 'null';
			
		switch(tpo){
			case 'object':
				createTreeFromObj({'[object Object]':r.cnt}, $('.autoexpand').is('.sel')).appendTo(resp);
				break;
			default:
				$(formatStaticValue(r.cnt,false)).appendTo(resp);
				break;
		}; 
		focusLastMessage();
	};
	
	var doRequestForm = function(){
		var v = c.val();
		
		sthis.save(v);
				
		if(trim(v,' ;').toLowerCase().replace(/\r|\n|\t|\s/gmi,'')==='clear'){return clearConsole(); };
		
		$.ajax({url:'./', type:'POST', dataType:'text', data:{'command':v}, complete:function(r){
			if(r.status!==200) return showAnError('Bad response from server ('+r.status+')');
			
			var insertOriginalCommand = function(){
				var readd = $('<div class="cli"></div>').appendTo(vw)
				readd.html(encd(v));
				// readd.click(function(){c.focus().val(v);});
			}
			
			var p = $.cookie(NS+'preserve');
			if(typeof(p)!=='string' || p!=='yes') c.val('');
			
			try{ var pa = JSON.parse(r.responseText); }catch(e){
				insertOriginalCommand ();
				showAnError('Failed to parse response ('+e+')')	;
			};
			
			if(typeof(pa.error)==='string') return showAnError(pa.error);
			insertOriginalCommand();
			showAResponse(pa);
			
			
		}});
	};
	
	// SEND ENTER KEY EVENTS
	c.focus().on('keydown',function(event){
		try{ if(SUGB.is(":visible")) return; }catch(e){};		
		if(trim(c.val())==='') return;
		if((event.keyCode !== 10 && event.keyCode !== 13) || event.shiftKey || event.altKey) return;
		event.preventDefault();
		setTimeout(function(){ doRequestForm(); },60);
		return false;
	}).tabby();
	
	// RESIZING CONTAINER AREA
	$('#formwrap').resizable({ handles:"n", minHeight:nsr_min, maxHeight:nsr_max }).resize(function(){
		// $(this).css({cursor:'row-resize'});
		$('#output_wrappr').height( $('#wrap').height()-$(this).height() );
		$.cookie(NS+'sizearea', $(this).height(), {expires: 30});
	}).on('resizestop', function(){
		// $(this).css({cursor:'n-resize'});
	});
	
	window.doResizeWin = function(){ 
		var nsr = $.cookie(NS+'sizearea');
		if(isNaN(nsr * 1) || nsr<nsr_min || nsr> nsr_max) return;
		
		if(!$('#formwrap').is(':visible')) nsr = 0;
		
		$('#formwrap').height(nsr);
		$('#output_wrappr').height( $('#wrap').height()-nsr );
		vwscr.refresh();
	};
	window.onresize = function(){ doResizeWin(); };
	doResizeWin();
	$('.tool').unsel(true);
	
	if(!$.browser.webkit)
		showAnError('WARNING: Unsupported browser, certain features might be unavailable.','warning')
	
	// ISCROLL
	var iscr = $('.iScroll');
	var actiscr = function(){
		var how = $.cookie(NS+'iscroll');
		if(null==how || how.toString()!=='yes'){ 
			iscr.removeClass('sel').text('Scrolling'); 
			vwscr.disable();
			vwscr = vwscr.destroy();
			vwscr = dvwscr;
			clearInterval(vwscrint);
			$('#output_wrappr').css({'overflow': 'auto'});
			vw.removeAttr('style');
		}else{ 
			$('#output_wrappr').scrollTop(0).scrollLeft(0);
			iscr.addClass('sel').text('Panning'); ; 
			vwscr=new iScroll('output_wrappr',{fadeScrollbar:1,hideScrollbar:1,wheelAction:'none'});
			vwscrint = setInterval(function(){ vwscr.refresh(); }, 2000);
		}
	};
	iscr.click(function(){
		$.cookie(NS+'iscroll', $(this).is('.sel') ? 'no': 'yes', {expires:30});	
		actiscr();
	}); actiscr();
	
	// setTimeout(function(){ window.showAResponse({fnprefix:'FUNCTION_A_A', tpo:'object', cnt:{ string:'Some string', fn:function(){}, fn1:'FUNCTION_A_A'+'function(){ blabla; }', numb:1234, inf:NaN, tru:true,fal:false } }); },500);
		
});