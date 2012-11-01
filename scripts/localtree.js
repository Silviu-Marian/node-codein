var tabSpaces = '&nbsp;&nbsp;&nbsp;&nbsp;';

window.formatStaticValue = function(data, nobrk){
	var type = typeof(data);
	var encd = function(v){ return $('<div />').text(v).html();};
	var fnprefix = typeof(window.fnprefix)=='string' ? window.fnprefix : '{'+(new Date().getTime()) + '#!@';
		
	if(type==='object') return false;
	if(data===null) type='null';
	if(type==='string' && typeof fnprefix !== 'undefined' && data.indexOf(fnprefix+'function')===0 && data.lastIndexOf(fnprefix+'function')===0){
		type='function';
		data = data.replace(fnprefix,'');
	}
	
	switch(type){
		case 'null'	:
		case 'undefined':
			return '<span class="undef">'+type+'</span>';
		case 'boolean':
		case 'number':
			return '<span class="'+type+'">'+(typeof(data)!=='boolean'?data:(!!data?'true':'false'))+'</span>';
		case 'string':
		case 'function':
			var d = encd(data.toString()); 
			if(!!!nobrk) d = d.replace(/\r\n/gmi,"<br />").replace(/\n/gmi,"<br />").replace(/\t/gmi,tabSpaces);  
			
			var r = '<span class="str'+(!!nobrk?' nobrk':'')+'">' + (d)+'</span>'; 
			return (type=='string' ? '<span>&quot;</span>'+r+'<span>&quot;</span>' : r);
	};
};

window.createTreeFromObj = function(obj,autoexpand){ 
	if(typeof(obj)!=='object' || null==obj)
		return false;
		
	var ul = $('<ul class="object"></ul>');
	var keys = [];  for(var i in obj) keys.push(i); if(typeof(obj.length)=='undefined') keys.sort();
	
	for(var i=0; i<keys.length; i++)(function(d,k){
		
		if(typeof(d)!=='object' || d===null){
			$('<li class="nobrk header"><span class="fn">'+k+'</span> '+formatStaticValue(d,1) +' </li>').appendTo(ul);
		}else{
			var li = $('<li class="nobrk expandable"></li>').appendTo(ul);
			var hdr = $('<div class="header"></div>').appendTo(li);
			var arrow = $('<span class="arrow-right arrow-collapsed">&#9658;</span>').appendTo(hdr);
			var key = $('<span class="fn">' + k +'</span>').appendTo(hdr)
			
			var expand = function(){
				var tgt = li.find('>.object');
				if(tgt.length && tgt.is(':visible')){
					tgt.hide();
					arrow.removeClass('arrow-expanded').addClass('arrow-collapsed').html('&#9658;');
				}else{
					if(!tgt.length)	 tgt = createTreeFromObj(d).appendTo(li);
					tgt.show();
					arrow.removeClass('arrow-collapsed').addClass('arrow-expanded').html('&#9660;');
				};
				if(typeof(doResizeWin)=='function') doResizeWin();
			};
			
			arrow.click(function(){ if(!$('.dotstruct').is('.sel')) expand(); });
			hdr.click(function(){ if($('.dotstruct').is('.sel')) expand(); });
			if(!!autoexpand) expand();
		};
		
	}(obj[keys[i]], keys[i]));
	
	return ul;
}
