NodeJS Code Inspector
=====


Or simply *node-codein* is a very basic console for CommonJS environments.

<img src="https://github.com/Silviu-Marian/node-codein/raw/master/screenshot.png" alt="NodeJS Console Object Debug Inspector" />

Disclaimer
---
This project is obsolete tech with a bad approach. Please consider using other tools instead like [`node-inspector`](https://github.com/node-inspector/node-inspector) or Atom's excellent [`node-debugger`](https://atom.io/packages/node-debugger).
This project started in 2012 as a quick and dirty alternative to node-inspector, which back in the day had very little on V8's side to work with.


Usage
----
1. Install the package with `npm install -g node-codein`

2. Add `require('node-codein')` or `import 'node-codein';` in any javascript file that is ran

3. Run your project, most likely `npm start` or `node ./`

4. Open the console through a terminal command:
  - Windows: `chrome --app=http://1227.0.0.1:55281`

  - OS X: `open -a "Google Chrome" --args --app=http://1227.0.0.1:55281`

  - Linux: `google-chrome --app=http://1227.0.0.1:55281`


Features
--
- REPL interface (via global eval)
- Wrapped logging functions (log, info, warn, error)
- Wrapped unhandled exceptions
- Commands history
- Suggestions and autocomplete
- Efficient, incremental rendering for large objects
- Drag-to-scroll (click-drag to scroll/pan)
- Dark theme
- Resizable input area (double click to hide)
- Buffer clearing (also `clear;` or CTRL+L)
- Preserve input (send the same command multiple times


Limitations
--

- **More than one console open**

  This is a rare problem but because the clients use long polling and disconnect when the buffer is flushed, one client might get data while others didn't manage to connect back yet

- **Autocomplete spams the server **

  Debounce can be tweaked but a larger timeout might chop-off words when you hit enter

- ** Hidden autocomplete list after arrows or escape keys **

  This is intentional, because those 3 keys are meant to hide the list; to show suggestions again, simply type a letter and delete it


Changelog
---
- 1.0.6, 1.0.7
  - Repository upgrades
  - Preparations for v2

- 1.0.5
  - Added `CTRL+L` (clear)
  - Minor improvements and bugfixes

-	1.0.4
  - Added listeners to unbind the server on app crash (unhandledException, SIGTERM, SIGKILL)

- 1.0.3
  - Fixed incompatibility issues with express and locomotive; thanks to [Fräntz Miccoli](http://frantzmiccoli.com/)

- 1.0.2
  - Fixed a bug on prefixed function content strings (thanks Evangenieur)
  - Replaced iScroller with dragScrollable (less fancier but works on latest Chrome)

- 1.0.1
  - Removed the buggy, CPU-intensive jsTree
  - Updated UI colors
  - Modified small real-estate features
  - Added progressive rendering
  - Exposed the whole module on *global.nodecodein*

____

Feel free to open any issues
