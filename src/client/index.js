/* Styles */
import 'client/fonts/stylesheet.css';
import 'client/styles/style.scss';
import 'client/styles/style.light.scss';
import 'client/styles/style.dark.scss';

/* Scripts */
import 'client/libraries/jq';
import 'client/libraries/jquery-ui-1.8.21.custom.min';

import 'client/libraries/jq.cookie';
import 'client/libraries/jq.hotkeys';
import 'client/libraries/jq.tabby';
import 'client/libraries/jq.unsel';
import 'client/libraries/jq.storage';
import 'client/libraries/dragscrollable';

import 'client/scripts/localtree';
import 'client/scripts/history';
import 'client/scripts/sse';
import 'client/scripts/suggest';
import 'client/scripts/console';
import 'client/scripts/tools';

// @TODO react-helmet
document.getElementsByTagName('title')[0].innerHTML = 'nodejs&trade; console';
