$(document).ready(function(){ setTimeout(function(){
		
	var constat = $('.constat');
	var conmsg = constat.find('.msg');
	var conic = constat.find('.eicon');
	var toReconnectOnFail = 2000;
	var toReconnectOnSSE = 60;
	var toLoggingInterval = 500;
	
	var showOnline = function(state){
		if(!!state)	{
			// constat.addClass('ok');
			conmsg.text('Connected');
			conic.text('~');
		}else{
			constat.removeClass('ok');
			conmsg.text('Disconnected');
			conic.text('W');
		}
	}
	
	var rq = {};
	var reconnect = function(){
		rq = $.ajax({url:'sse?x='+(new Date().getTime()),type:"GET", dataType:'text', timeout:0, complete:function(r){
			
			if(Number(r.status)!==200){ 
				showOnline(false);
				return setTimeout(function(){ reconnect(); }, toReconnectOnFail)
			}
			
			try{ var q = JSON.parse(r.responseText); }
			catch(e){ var q = []};
			
			for(var j=0; j<q.length; j++)(function(q){
				if(typeof(q.t)!=='string') return;
				switch(q.t){
					
					case 'log':
					case 'info':
						for(var i in q.a)
							showAResponse({cnt:q.a[i], type:typeof(q.a[i])},true);
						break;
					case 'warn':
					case 'error':
						showAnError(typeof(q.a[0])!=='undefined' ? q.a[0] : null, q.t);
						break;	
				};	
			}(q[j]));
			
			setTimeout(function(){ reconnect(); }, toReconnectOnSSE);
		}});
	};
	
	setInterval(function(){
		return showOnline(rq.readyState && (rq.readyState===1 || rq.readyState!==2 || rq.readyState!==3));
	},toLoggingInterval);
	
	reconnect();
}, 1000); });

