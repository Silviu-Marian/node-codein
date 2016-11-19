window.sthis = {
	waitForDown:false,
	maxInputs : 50,
	at:null,
	busy:false,
	key: 'sthis_prevInputs',
	save: function(input){
		if(trim(input)==='') return;
		
		var e = $.jStorage.get(sthis.key, '[]');
		try{ e = JSON.parse(e);} catch(x){ e=[]; };
		
		if([].concat(e).pop() === input) return;
		
		e.push(input);
		
		if(e.length > sthis.maxInputs)
			e=e.slice(e.length-sthis.maxInputs, e.length);
		
		$.jStorage.set(sthis.key, JSON.stringify(e));
		sthis.at = null;
	},
	getPrev:function(){
		var e = $.jStorage.get(sthis.key, '[]');
		try{ e = JSON.parse(e);} catch(x){ e=[]; };
		if(!e.length) return '';
		
		var index = (sthis.at===null) ? e.length-1 : sthis.at-1;
			index = (index<0) ? 0 : index;
		
		var r = e[index];
		sthis.at = index; 
		
		return r;
	},
	getNext: function(){
		var e = $.jStorage.get(sthis.key, '[]');
		try{ e = JSON.parse(e);} catch(x){ e=[]; };
		if(!e.length) return '';
		
		var index = (sthis.at===null) ? e.length-1 : sthis.at+1;
			index = (index > e.length-1) ? e.length-1 : index;
		var r = e[index];
		sthis.at = index+1;
		
		return r;
	}
};

$(document).ready(function(){
	var c = $('#command');
	var ch = $('#commandhint');
	
	if(typeof($.cookie('nohint'))==='string')
		ch.text('');
		
	$.cookie('nohint', 'nohint',{expires:30});
	
	c.on('keyup',function(event){
		try{ if(SUGB.is(":visible")) return; }catch(e){};
		if(c.val()==='') ch.show(); else ch.hide();
		
		if(sthis.busy) return;
		if(event.keyCode!==38 && event.keyCode!==40){
			sthis.waitForUp= false;
			sthis.waitForDown = false;
			return ;
		}
		
		var ISUP = (event.keyCode===38);
		var ISDW = (event.keyCode===40);
		var len = c.val().length;
		var at = c.caretAt();
		var hassmth = len || trim(c.val()).length;
		
		if((ISUP && at!==0) || (ISDW && at!==len)){ 
			sthis.waitForUp = false;
			sthis.waitForDown = false; 
		return; }
		if(hassmth && ISDW && !sthis.waitForDown){ sthis.waitForDown=true; return; }
		if(hassmth && ISUP && !sthis.waitForUp){ sthis.waitForUp=true; return; }
		
		sthis.busy = true;
										
		if(ISUP){
			c.val(sthis.getPrev()); 
			c.selectRange(0,0);
			sthis.waitForUp=true;
			sthis.waitForDown=false;
		}else{
			var gn = sthis.getNext();
			c.val(gn);
			c.selectRange(gn.length, gn.length);
			sthis.waitForDown=true;
			sthis.waitForUp=false;
		};
		
		ch.hide();
		sthis.busy = false;
		
	});
	
})