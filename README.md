<h1>NodeJS Console Object Debug Inspector </h1>
<p>Or simply node-codein (longtail for SEO) is supposed to do what Webkit Inspector's Console does. Except this works exclusively with NodeJS.</p>
<h2>Screenshot</h2>

<img src="https://github.com/ketamynx/node-codein/raw/master/images/screenshot.png" alt="NodeJS Console Object Debug Inspector" /> 

<h2>License</h2>
<p>Released under MIT License (included); some components have their own licenses but I kept all the comments in their headers so if you're a really really boring person (lawyer, attorney, prosecutor, whatever) you can check the files under libraries/.</p>

<h2>Requirements</h2>
<p>Recommended: NodeJS v0.8.0+, Chrome 19.xx.xxxx.xx+ <br />
	Minimum: any OS that supports a browser that supports javascript (my Nokia N8 almost worked lol)</p>
<h2>Deployment instructions</h2>
<ol>
	<li>Install the package via <b>&quot;npm install node-codein&quot;<b>, then include it in your script with require(&quot;node-codein&quot;); alternatively</li>
	<li>Download the package, put it somewhere you can find it</li>
	<li>In your script add require(&quot;path/to/folder/node-codein&quot;)</li>
	<li>Run nodejs</li>
	<li>Start <b>%localappdata%/Google/Chrome/Application/chrome.exe --app=http://localhost:55281</b></li>
	
	<li>Make sure you only use Chrome. It might work on something else but going straight with Chrome will save you time.</li>
</ol>

<h2>Changelog</h2>
<ul>
	<li><b>v1.0.3</b><br /><ul>
		<li>fixed incompatibility issues with expressjs and locomotive; special thanks to <a href="http://frantzmiccoli.com/" target="_blank">Fräntz Miccoli</a></li>
	</ul></li>
	<li> <b>v1.0.2</b> <br /><ul>
		<li> fixed a bug on prefixed function content strings (thanks Evangenieur)</li>
		<li> replaced iScroller with dragScrollable (less fancier but works on latest Chrome)</li>
	</ul> </li>	
	<li> <b>v1.0.1</b> <br /><ul>
		<li> removed the buggy, CPU-clogging jsTree</li>
		<li> updated UI colors </li>
		<li> modified small real-estate features </li>
		<li> added progressive rendering </li>
		<li> exposed the whole module on <b>global.nodecodein</b> </li>
	</ul> </li>	
</ul>

<h2>Main features</h2>
<ul>
	<li>Displays objects in tree format, with expand/collapse controls</li>
	<li>Executes arbitrary code</li>
	<li>Wraps the common logging functions: console.log(), console.info(), console.warn() &amp; console.error()</li>
	<li>Wraps unhandled exceptions via process.on('uncaughtException', ...)</li>
	<li>Broadcasts messages to all connected clients</li>
	<li>Reconnects automatically</li>
</ul>
<h2>Visible and hidden features</h2>

<ul>
	<li><b>Top buttons:</b> <ul>
		<li>enable drag-to-scroll (click-drag to scroll/pan)
		<li>theme switcher (dark seems to attract the ladies lol :D)		
		<li>YAND.info (Node's API docs) 		
		<li>Node's twitter
		</ul>
	</li>
	<li><b>Middle thin bar: </b>
		<ul>
			<li>drag to resize</li>
			<li>double click to hide input area</li>
		</ul>
	</li>
	<li><b>Bottom row - left: </b>
		<ul>
			<li>hide/show input area</li>
			<li>clear all messages</li>
			<li> automatically expand objects (just first level)</li>
			<li> structure object levels + row highlighter</li>
			<li> input preservation (for spammers)</li>
		</ul>
	</li>
	<li><b>Bottom row - right: </b>
		<ul>
			<li>expand + collapse every single visible object</li>
			<li> reload (alias for F5)</li>
			<li> duplicate window (opens all the messages in it; uses $.clone() so some controls might be inherited from the parent window)</li>
		</ul>
	</li>
	<li><b>Not-so-obvious features:</b>
		<ul>
			<li>saves last 50 command in local storage, use arrow keys to navigate through previous commands</li>
			<li>typing suggestions and autocomplete</li>
			<li>shift+enter for new lines </li>
			<li>tab key indents</li>
		</ul>
	</li>
</ul>

<h2>Known limitations</h2>
<ul>
	<li>Console log sometimes doesn't pass data (rarely... very... rarely). I planned on using EventSource but didn't stick to it because one end doesn't buffer the response and there's no flush command like in PHP. So what it does instead is it keeps connections in a waiting state and when it gets something, it writes the response, closing those connections. Then clients will automatically reconnect but in that split-second if there is any pre-connected client (as in managed to connect before any others), that client will get the logs and those who connected the millisecond later, won't get anything. </li>
	<li>Autocomplete spams your server. Lag is in place and can be tweaked but it'll basically chop-off words when you hit enter.</li>
	<li>Autocomplete may not appear after using left / right arrow keys or escape. This is intentional, because those 3 keys are GTFO master keys, but if you want the list of suggestions back, type some gibberish and press backspace.</li>
	<li>The whole source code is haywired or almost haywired.</li>
	<li>There's no syntax highlighting on the input. It will generate lags.</li>
</ul>

<h2>FAQ</h2>
<ul><li><b>Where are the variables from my own module? / How do I debug my module?</b><br />
		This console normally doesn't see them, as it doesn't see scoped (private) variables. Take it as a javascript security feature. But you can always assign them to an object (like "module") and make that object global. (module.variable = ...; global.MyModule = module)
	</li>
	<li><b>What's wrong about the regular console?</b><br />
	Its overall buffer size, no syntax coloring, hard to use, no direct input, so forth. If you're familar to webkit's &quot;Inspect Element&quot; console tab, you'll see there are some differences.</li>
	<li><b>Then what's wrong with Eclipse's V8 Debugger?</b><br /> 
		A debugger is something totally different. Well not really but you still need to set breakpoints, stop executions, scope variables, etc. Plus you have to restart Node to put code in. I can make more excuses if necessary.	</li>
	<li><b>Why not just fix node-inspector?</b><br />
		I tried. I first tried to pass back stringified objects and decode them in the local console. The problem was that there was a hardcoded limit of 80 characters beyond which the string turned into &quot;str... (length: 2219)&quot;. I'm not sure where this came from but I believe it was built into v8 when it was compiled with Node. I also tried fixing scope:frame:handle problem but it seemed to pass back zeros no matter what. </li>
	<li><b>Can you help me do X / can you add X / can you fix X?</b><br />
		Open an issue here on GitHub, 3rd row, 4th button (or something like that), and let's have a look</li>
</ul>

<hr />
<p>Fork, pull, push, drag, chop, send, fax whatever you want you're free to do it.<br />
	Good luck buddy.
</p>
<p>- ketamynx </p>
