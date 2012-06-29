<h1>NodeJS Console Object Debug Inspector </h1>
<p>Or simply node-codein (longtail for SEO) is supposed to do what Webkit Inspector's Console does. Except this works exclusively with NodeJS.</p>
<h2>Screenshot</h2>

<img src="https://github.com/ketamynx/node-codein/raw/master/images/screenshot.png" alt="NodeJS Console Object Debug Inspector" /> 

<h2>License &amp; disclaimer</h2>
<p><b>License:</b> <a href="http://www.youtube.com/watch?v=8yR7LZxp-IU">http://www.youtube.com/watch?v=8yR7LZxp-IU</a><br />
	<b>Disclaimer:</b> Said tool is only intended for dicking around,  and is thus unsuitable for enterprise-level operations; this program should not be used for reliable remote instrumentation or monitoring, or as a replacement for NodeJS's console system. This program cannot guide missiles out of North Korea.</p>
<h2>Minimum requirements</h2>
<p>NodeJS v0.8.0+, Chrome 19.xx.xxxx.xx+, Win XP+</p>
<h2>Deployment instructions</h2>
<ol>
	<li>Install the package via <b>&quot;npm install node-codein&quot;<b>, then include it in your script with require(&quot;node-codein&quot;); alternatively</li>
	<li>Download the package, put it somewhere you can find it</li>
	<li>In your script add require(&quot;path/to/folder/node-codein&quot;)</li>
	<li>Run nodejs</li>
	<li>Start <b>%localappdata%/Google/Chrome/Application/chrome.exe --app=http://localhost:55281</b></li>
	
	<li>Make sure you only use Chrome. It might work on something else but going straight with Chrome will save you time.</li>
</ol>


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
		<li>enable iScroll (click-drag to scroll/pan)
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
			<li>double-click a property name in the message window to insert it</li>
			<li>shit+enter for new lines			</li>
			<li>tab key indents</li>
		</ul>
	</li>
</ul>

<h2>Known bugs</h2>
<p>Lots of them. Because I had to took a day off from work to build this, so there's was no time to organize nor bughunt.</p>

<ul>
	<li>Console  log may not pass through every now and again or so. I planned on using EventSource but it wasn't working (maybe buffering instead of flushing, I don't know, can't WireShark locally). So what it does is it keeps connections in a waiting state and when it gets something, it writes and closes those connections. Then clients are supposed to connect back. </li>
	<li>Autocomplete spams your server. Lag is in place and can be tweaked but it'll basically chop-off words when you hit enter.</li>
	<li>iScroll + expand all + ctrl+f to find properties will lock the whole browser; not sure why, don't care much, just disable iScroll if you're using this tecnhique to find properties.</li>
	<li>Autocomplete may not appear after using left / right arrow keys or escape. This is intentional, those 3 keys are GTFO master keys, but if you want the list of suggestions back, type some gibberish and press backspace.</li>
	<li>The whole source code is haywired.</li>
</ul>

<h2>FAQ</h2>
<ul><li><b>What's wrong about the regular console?</b><br />
	Its overall buffer size, no syntax coloring, hard to use, no direct input, so forth. If you're familar to webkit's &quot;Inspect Element&quot; console tab, you'll see the differences.</li>
	<li><b>Then what's wrong with Eclipse's V8 Debugger?</b><br /> 
		A debugger is something totally different. Well not really but you still need to set breakpoints, stop executions, scope variables, etc. Plus you have to restart Node to put code in. I can make more excuses if necessary.	</li>
	<li><b>Why not just fix node-inspector?</b><br />
		I tried. I first tried to pass back stringified objects and decode them in the local console. The problem was that there was a hardcoded limit of 80 characters beyond which the string turned into &quot;str... (length: 2219)&quot;. I'm not sure where this came from but I believe it was built into v8 when it was compiled with Node. I also tried fixing the 0:0:0 (context:scope:handle) but it seemed to pass back blank values no matter what. I didn't had time for that.</li>
	<li><b>Can you help me do X / can you add X / can you fix X?</b><br />
		I'll do everything that doesn't take more than 5 minutes to do. I'm really in a time crisis, but even if I wasn't, I'm highly capitalistic about all my work. </li>
</ul>

<hr />
<p>Fork, pull, push, drag, chop, send, fax whatever you want you're free to do it.<br />
	Good luck buddy.
</p>
<p>- ketamynx </p>
