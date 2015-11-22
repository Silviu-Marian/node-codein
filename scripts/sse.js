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
				if(typeof(q[0])!=='string') return;
				switch(q[0]){
					
					case 'log':
					case 'info':
						for(var i in q[1])
							showAResponse({cnt:q[1][i], type:typeof(q[1][i])},true);
						break;
					case 'warn':
					case 'error':
						showAnError(typeof(q[1][0])!=='undefined' ? q[1][0] : null, q[0]);
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

