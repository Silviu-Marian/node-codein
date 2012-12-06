var file_exists = function(f){ try{ require('fs').lstatSync(f); return true; }catch(e){ return false; }};
var is_file = function(f){ try{ return require('fs').lstatSync(f).isFile(); }catch(e){ return false; } }; 
var file_get_contents = function(f,mode){return (!file_exists(f))? '' : require('fs').readFileSync(f, mode); };
var get_constr = function(v){ return(v===null)?"[object Null]":Object.prototype.toString.call(v); }; 
// var fnprefix = (["FUNCTION"].concat(process.hrtime()).concat(process.hrtime())).join('.'); // ONLY WORKS IN LATER Vs
var fnprefix  = 'TYPE_FUNC_'+(new Date().getTime());
var stringify = require('./stringify.js'); 
var jsencr = function(o){ var e = []; return stringify(o, function(k,v){
	if(typeof(v)==='function') return fnprefix+v.toString();
	if(typeof(v)!=='object' || v===null)	return v;
	for(var i in e){ if(e[i]===v){ return "Circular"; }}; 
	e.push(v); return v;
}); };


var dbg = {
	
	// AVOIDS RUNNING TWICE
	isStarted: false,
	
	// SSE CONNECTIONS
	cons: [],
	
	// MIMES HANDLING
	mimes: {
		'html': 'text/html',
		'htm' : 'text/html',
		'txt' : 'text/plain',
		'js' : 'text/javascript',
		'ico' : 'image/vnd.microsoft.icon',
		'css' : 'text/css',
		'eot': 'application/vnd.bw-fontobject',
		'ttf': 'application/x-font-ttf',
		'woff':'font/opentype'
	},
	
	// SEND EVENT	
	queued: [],
	pendingBroadcast:0,
	broadcastLag: 500,
	broadcastSSE: function(t, a){
		clearTimeout(dbg.pendingBroadcast);
		
		var data = { t:t, a:a };
		dbg.queued.push(data);
		
		var sendFn = function(){
			if(!dbg.cons.length) return dbg.pendingBroadcast = setTimeout(function(){ sendFn(); },dbg.broadcastLag);
			
			var data = jsencr(dbg.queued);
			dbg.queued = []; 
			for(var i=0; i<dbg.cons.length; i++){
				dbg.cons[i].writeHead(200,{
					'Content-type':dbg.mimes['txt'],
					'Content-length' : data.length,
					'Cache-control':'no-cache'
				});
				
				dbg.cons[i].write(data); 
				dbg.cons[i].end("\r\n");
				dbg.cons[i] = null;
				dbg.cons.splice(i,1); 
				i--; 
			}
		};
		
		dbg.pendingBroadcast = setTimeout(function(){ sendFn(); },dbg.broadcastLag);
	},
	
	// ERROR HANDLERS
	serve500: function(s, err){try{
		console.warn(err);
		
		var ISE = 'Internal server error\r\n'+err+'\r\n';
		s.writeHead(404, {'Content-type':'text/plain', 'Content-length':ISE.length});
		s.end(ISE);
				
	}catch(e){ console.warn(e); }},
	
	serve404: function(s){try{
		var NF = 'Not found\r\n';
		s.writeHead(404, {'Content-type':'text/plain', 'Content-length':NF.length});
		s.end(NF);
		
	}catch(e){ dbg.serve500(s,e); }},
	
	// GET LOCAL FILENAME
	getlocalfn: function(path){
		var p = require('path').normalize(__dirname + "/" + path);
		return p;	
	},
	
	// STATIC RESOURCES	
	servestatic: function(q,s){ try{
		var path = require('url').parse(q.url).pathname;
		if(path.charAt(0)==='/') path = path.substr(1);
		path = path.replace(/[\.]+(\/|\\)/gmi, '');
		
		switch(path){
			case "": 
			case " ":
			case "index.html" :
			case "index.htm" :
				var fn = dbg.getlocalfn('./index.html');
				var c = file_get_contents(fn,'utf-8');
				
				s.writeHead(200, {'Content-type': dbg.mimes['html'], 'Content-length': c.length});
				s.end(c);
				break;
				
			case 'images/favicon.ico':
				var icon = file_get_contents(dbg.getlocalfn('./images/favicon.ico'));
				s.writeHead(200, {'Content-type': dbg.mimes['ico'], 'Content-length': icon.length});
				s.end(icon); 
				break;
			
			case 'sse': 
				q.socket.setTimeout(0);
				var thiscon = dbg.cons.push(s);
				break;
			
			default:
				var fn = dbg.getlocalfn('./'+path);
				if(!file_exists(fn)) return dbg.serve404(s);
				
				var c = file_get_contents(fn);
				var hdrs = {'Content-length': c.length};
				var ext = fn.split('.').pop(); 
				
				if(typeof(dbg.mimes[ext])==='string') hdrs['Content-type'] = dbg.mimes[ext];
				
				s.writeHead(200, hdrs);
				s.end(c); 
				break;
		}
		
	}catch(e){ dbg.serve500(s,e); }},
	
	// EXECUTE COMMANDS
	execute: function(q,s){
		var post = '';
		q.on('data', function(c){ post+=c; });
		q.on('end', function(){
			post = require('querystring').parse(post);
			if(typeof(post.command)==='string'){ 
				var r = {error:false};
				
				try{
					r.fnprefix = fnprefix;
					r.cnt = eval.apply(global, [post.command]);
					r.type = (typeof(r.cnt)==='object' && r.cnt!==null) ? 
						get_constr(r.cnt) : 
						typeof(r.cnt);
				}catch(e){ r.error=e.toString(); }
					
				s.end(jsencr(r));
			} else if(typeof(post.getsug)==='string'){
				
				try{ var r = jsencr(dbg.getsug(JSON.parse(post.getsug)));	}
				catch(e){ var r = "[]"; }
				
				s.writeHead(200, {'Content-type': dbg.mimes['txt'], 'Content-length': r.length});
				s.end(r);
			}else{
				return dbg.serve500(s,'Command was not found');	
			}
		});				
	},
	
	// STD. REQUEST HANDLER LOGIC
	handle: function(q,s){
		if(typeof(q.method)!=='string' || (q.method!=='GET' && q.method!=='POST'))
			return dbg.serve404(s);
		
		return  (q.method==='GET') ? dbg.servestatic(q,s) :  dbg.execute(q,s);
	},
	
	// GET SUGGESTIONS
	getsug: function(o){
		var r = [];
		if(typeof(o)!=='object' || !o.length || o.length!=2) return r;
		if(typeof(o[0])!=='string' || o[0]===''){
			/* if(typeof(module)=='object') for(var i in module){
				if(o[1]===''){ r.push(i); continue; };
				if(i.split(o[1])[0]==='') r.push(i);
			}; */
			
			for(var i in global){
				if(o[1]===''){ r.push(i); continue; };
				if(i.split(o[1])[0]==='') r.push(i);
			}; 				
		}else{try{
			var tgt = eval(o[0]); if(typeof(tgt)!=='object') return r;
			for(var i in tgt){
				if(o[1]===''){ r.push(i); continue; };
				if(i.split(o[1])[0]==='') r.push(i);
			}
		}catch(e){ return r; }}
		return r;
	},
	
	// WRAP CONSOLE.* API
	consolewrap: function(){
		console.__log = console.log;
		console.log = function(){ console.__log.apply(console, arguments); dbg.broadcastSSE('log', arguments);};
		
		console.__info = console.info;
		console.info = function(){ console.__info.apply(console, arguments); dbg.broadcastSSE('info', arguments);};
		
		console.__warn = console.warn;
		console.warn = function(){ console.__warn.apply(console, arguments); dbg.broadcastSSE('warn', arguments);};
		
		console.__error = console.error;
		console.error = function(){ console.__error.apply(console, arguments); dbg.broadcastSSE('error', arguments);};
		
		process.on('uncaughtException', function (e) {console.error.call(console, e + ""); });
		global.nodecodein = module;
	},
	
	// LOCAL DEBUGGER SERVER
	start: function(port, host, cb){
		
		cb = typeof(cb)==='function' ? cb : function(){};
		if(dbg.isStarted) return cb.call(null,false);
		
		var http = require('http');
		dbg.sv = http.createServer(dbg.handle);
		
		dbg.sv.listen(port||55281, host||null,function(){
			var add=dbg.sv.address();
			console.log('Debugger server started at: ' + add.address + ':' + add.port);
			cb.call(null,dbg);
		});
		
		dbg.sv.on('error', function(e){
			console.warn('Failed to start debugger server. Error: '+e);
		});
		
		dbg.consolewrap();
		process.on('exit', function(){ console.log('Closing debug server'); try{dbg.sv.close();}catch(e){}; });
	}
	
};

dbg.start();
