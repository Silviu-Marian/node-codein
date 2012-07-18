$(document).ready(function(){
	
	var c = $('#command');
	var sugpos = $('.sugpos');
	var sugb = window.SUGB = $('<div id="autosug" class="suggestions"><ul></ul></div>').appendTo('#wrap').hide();
		
	var getWorkingOn = function(str, pos){
		if(typeof(str)!=='string') return false;
		
		// get workable part
		var ss =  pos===str.length ? str : str.substr(0, pos);
		
		// is inside a string or regex
		var tests = [ss.match(/\"/g), ss.match(/\'/g), ss.match(/\//g)];
		for(var i in tests){
			if(null==tests[i] || !tests[i].length) continue;
			if(tests[i].length % 2 === 1) return false;
		}
		
		// get separation dots (could use regex here)
		var atp=0;
		for(var i=ss.length-1; i>=0; i--)
			if((/[^A-Za-z0-9_\$\.]/).test(ss[i])){ atp = i+1; break; };
		
		ss = trim(ss.substr(atp, ss.length-atp));
		if(ss==='') return false;
		return ss;
	};
	
	var getSearchObject = function(str){
		if(typeof(str)!=='string') return false;
		if(!trim(str).length) return false;
		if(str.charAt(0)==='.') return false;
		
		var ostr = str.split('.');
		var r = [];
		r[0] = '';
		r[1] = ostr.pop();
		r[0] = ostr.join('.');
		
		return r;		
	}
	
	var insertVal = window.commandInsertVal = function(v){
		var nv = c.val();
		var cat = c.caretAt();
		c.val( nv.substr(0,cat) + v + nv.substr(cat) );
		cat+=v.length;
		c.selectRange(cat,cat);
		return setTimeout(function(){ hideSug(); }, 60);
	};
	
	var hideSug = function(){ return sugb.hide(); };  
	var showSug = function(data,part){  
		if(typeof(data)!=='object' || !data.length) return;
		var h = ''; data.sort();
		
		var ul = sugb.find('> ul'); 
		
		ul.find('li').remove();
		
		for(var i =0; i<data.length; i++)(function(){
			var el = $("<li />");
			el.text(data[i]); // if(i==0) el.addClass('sel');
			el.attr('ins', data[i].replace(part,''));
			el.click(function(){ insertVal($(this).attr('ins')); });
			el.appendTo(ul);
		}(i))
		
		sugpos.text(c.val().substr(0, c.caretAt()));
		sugpos.html(sugpos.html() +"<div class='poslin'>&nbsp;</div>");
		
		var pos = sugpos.find('.poslin').offset();
		
		sugb.removeAttr('style');	
		sugb.css({ left:pos.left+'px'});
		if(sugb.outerHeight() > $('body').outerHeight() - pos.top) 
			sugb.css({ bottom:'0px' });
		else 
			sugb.css({ top:(pos.top-sugb.parent().offset().top) + 'px' });
		
		return sugb.show();
	}
	
	var cto = 0;
	var lastValid=0;
	var lastQ = '';
	
	c.on('keydown', function(event){
		try{ if(!sugb.is(":visible")) return; }catch(e){};
		if(event.keyCode==27 || event.keyCode==37 || event.keyCode==39) return hideSug();
		
		var ISUP = (event.keyCode===38);
		var ISDW = (event.keyCode===40);
		var ISENT= (event.keyCode==10 || event.keyCode==13);
		
		if(!ISUP && !ISDW && !ISENT) return;
		
		var lis = sugb.find('li');
		var curpos = lis.filter('.sel'); 
		if(ISENT){ 
			if(!curpos.length) return hideSug();
			curpos.trigger('click');
		}
		else if(ISDW){ 
			if(!curpos.length) lis.first().addClass('sel'); 
			else{
				var i = curpos.index(); 
				if(i+1 >= lis.length) i=-1; i++; 
				curpos.removeClass('sel'); 
				var p = $(lis.get(i)).addClass('sel').position();
				sugb.scrollTop(p.top);
			}
		}
		else if(ISUP) { 
			if(!curpos.length) lis.last().addClass('sel'); 
			else{
				var i = curpos.index();
				if(i-1 < 0) i=lis.length; i--;
				curpos.removeClass('sel');
				var p = $(lis.get(i)).addClass('sel').position();	
				sugb.scrollTop(p.top);
			}
		}
		
		event.preventDefault();
		event.stopPropagation();
		
		return false;	
	});
	
	c.on('keyup',function(event){clearTimeout(cto);cto=setTimeout(function(){
		var v = c.val(); 
		if(v===lastQ) return;
		
		hideSug();
		if(v==='' ) return lastQ = '';
		
		var part = getWorkingOn(v,c.caretAt()); if(false===part) return;
		var parts = getSearchObject(part); if(false===parts) return;
		var data = {getsug:JSON.stringify(parts)};
		lastValid++;
		var lastExp = lastValid;
		
		hideSug();
		
		$.ajax({url:'getsug', dataType:'html', data:data,type:'POST',complete:function(r){
			if(lastExp!==lastValid) return;
			if(r.status!==200)	{  return; }
			try{ var r = JSON.parse(r.responseText); }catch(e){ return; }
			try{ if(parts[1]===r[0]) return; }catch(e){};
			showSug(r,parts[1]);
			lastQ = v;
		}});
		
	}, 5);});
	
	$('#output_wrappr').click(function(){ hideSug(); });
	
});