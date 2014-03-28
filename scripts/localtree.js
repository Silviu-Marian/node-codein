var tabSpaces = '&nbsp;&nbsp;&nbsp;&nbsp;';

window.formatStaticValue = function(data, nobrk){
	var type = typeof(data);
	var encd = function(v){ return $('<div />').text(v).html();};
	var fnprefix = typeof(window.fnprefix)=='string' ? window.fnprefix : '{'+(new Date().getTime()) + '#!@';
		
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
		default:
			return '<span class="undef">unknown '+type+'</span>';
	};
};

function appendAttrib(k, d, container, autoexpand) {
	if(typeof(d)!=='object' || d===null){
		$('<div class="header"><span class="fn">'+k+'</span>'+formatStaticValue(d,false) +' </div>').appendTo(container);
	}else if(d.type == "function"){
		$('<div class="header"><span class="fn">'+k+'</span><span class="str">'+encodeHTML(d.str)+'</span></div>').appendTo(container);		
	}else{
		var li = $('<div class="expandable"></div>').appendTo(container);
		var hdr = $('<div class="header"></div>').appendTo(li);
		var arrow = $('<span class="arrow-right arrow-collapsed">&#9658;</span>').appendTo(hdr);
		var key = $('<span class="fn">' + k +'</span>').appendTo(hdr);
		var desc = $('<span class="str">' + encodeHTML(d.str) + '</span>').appendTo(hdr);
		
		var expand = function(){
			var tgt = li.find('>.object');
			if(tgt.length && tgt.is(':visible')){
				tgt.hide();
				arrow.removeClass('arrow-expanded').addClass('arrow-collapsed').html('&#9658;');
			}else{
				if(!tgt.length)	tgt = createTreeFromObj(d).appendTo(li);
				tgt.show();
				arrow.removeClass('arrow-collapsed').addClass('arrow-expanded').html('&#9660;');
			};
			if(typeof(doResizeWin)=='function') doResizeWin();
		};
		
		arrow.click(function(){ if(!$('.dotstruct').is('.sel')) expand(); });
		hdr.click(function(){ if($('.dotstruct').is('.sel')) expand(); });
		if(!!autoexpand) expand();
	};	
}


window.createTreeFromDynObj = function(obj,autoexpand){ 
	if(typeof(obj)!=='object' || null==obj)
		return false;
	
	if(obj.type == "function")
		return '<span class="str">'+encodeHTML(obj.str)+'</span>';
	
	var ul = $('<ul class="object"></ul>');
		
	function appendAttribGeneric(k, attr) {
		var li = $('<li class="nobrk"></li>').appendTo(ul);
		
		if(!attr[0]) {
			var hdr = $('<div class="header"></div>').appendTo(li);
			var key = $('<span class="fn">' + k +'</span>').appendTo(hdr)
			var getCmd = $('<span class="tool">&lt;get&gt;</span>').appendTo(hdr);
			
			function showError(msg) {
				var resp = $('<div class="error"></div>').appendTo(hdr);
				resp.html(' <span class="eicon">W</span> ' + encodeHTML(msg));
			}
			
			function getAttrib() {
				if(!getCmd.is(':visible')) return; // already requested
				getCmd.hide();
				
				$.ajax({url:'./', type:'POST', dataType:'text', data:{dynget:obj.objid, key:k}, complete:function(r){
					if(r.status!==200) {
						showError("Bad server response " + r.status);
						return;
					}
					
					try{ var pa = JSON.parse(r.responseText); }catch(e){
						showError('Failed to parse response ('+e+')');
						return;
					};
					
					if(pa.error) {
						showError(pa.error);
						return;
					}
					
					hdr.hide();
					appendAttrib(k, pa.cnt, li, true);
				}});
			};
			getCmd.click(getAttrib);
			hdr.click(getAttrib);
			return;
		}
		
		var d = attr[1];
		appendAttrib(k, d, li, autoexpand);
	}
	
	for(var i=0; i<obj.keys.length; i++)
		appendAttribGeneric(obj.keys[i], obj.attribs[i]);
	
	return ul;
}


window.createTreeFromRawObj = function(obj, autoexpand) {
	var ul = $('<ul class="object"></ul>');
	for(var key in obj) {
		var li = $('<li class="nobrk"></li>').appendTo(ul);
		appendAttrib(key, obj[key], li, autoexpand);
	}
	return ul;
}

window.createTreeFromArray = window.createTreeFromRawObj;

window.createTreeFromObj = function(obj, autoexpand) {
	if(Array.isArray(obj)) return window.createTreeFromArray(obj, autoexpand);
	return createTreeFromDynObj(obj, autoexpand);
}
