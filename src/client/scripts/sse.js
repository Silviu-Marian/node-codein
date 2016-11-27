/* global $, doResizeWin, formatStaticValue, focusLastMessage, createTreeFromObj, sthis, NS, SUGB,
trim, clearConsole, showAResponse, showAnError
*/
/* eslint no-var: 0, prefer-template: 0, vars-on-top: 0, no-loop-func: 0, no-param-reassign: 0,
no-restricted-syntax: 0, prefer-arrow-callback:0, func-names: 0, object-shorthand: 0,
camelcase: 0, no-shadow: 0 */

$(document).ready(function () {
  setTimeout(function () {
    var constat = $('.constat');
    var conmsg = constat.find('.msg');
    var conic = constat.find('.eicon');
    var toReconnectOnFail = 2000;
    var toReconnectOnSSE = 60;
    var toLoggingInterval = 500;

    var showOnline = function (state) {
      if (state) {
        // constat.addClass('ok');
        conmsg.text('Connected');
        conic.text('~');
      } else {
        constat.removeClass('ok');
        conmsg.text('Disconnected');
        conic.text('W');
      }
    };

    var rq = {};
    var reconnect = function () {
      rq = $.ajax({
        url: '/listen?x=' + (new Date().getTime()),
        type: 'GET',
        dataType: 'text',
        timeout: 0,
        complete: function (r) {
          if (Number(r.status) !== 200) {
            showOnline(false);
            return setTimeout(function () { reconnect(); }, toReconnectOnFail);
          }

          var q;
          try {
            q = JSON.parse(r.responseText);
          } catch (e) {
            q = [];
          }

          for (var j = 0; j < q.length; j += 1) {
            (function (q) {
              if (typeof q.t !== 'string') return;
              switch (q.t) {
                case 'log':
                case 'info':
                  for (var i in q.a) { // eslint-disable-line
                    showAResponse({ cnt: q.a[i], type: typeof q.a[i] }, true);
                  }
                  break;
                case 'warn':
                case 'error':
                  showAnError(typeof q.a[0] !== 'undefined' ? q.a[0] : null, q.t);
                  break;
                default:
                  break;
              }
            }(q[j]));
          }

          setTimeout(function () { reconnect(); }, toReconnectOnSSE);
          return '';
        },
      });
    };

    setInterval(function () {
      return showOnline(rq.readyState && (
        rq.readyState === 1 ||
        rq.readyState !== 2 ||
        rq.readyState !== 3
      ));
    }, toLoggingInterval);

    reconnect();
  }, 1000);
});
