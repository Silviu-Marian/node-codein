/* global jQuery */
((jq) => {
  const $ = jq;
  $.fn.extend({ propAttr: $.fn.prop || $.fn.attr });
  $.fn.unsel = function unsel(childrenParam) {
    let children = childrenParam;
    this.each(function eachThis() {
      if (typeof (children) === 'undefined' || !children) {
        children = false;
      }
      this.onselectstart = () => false;
      $(this).addClass('unsel');
      $(this).on('selectstart dragstart', (evt) => { evt.preventDefault(); return false; });
      this.unselectable = 'on';
      this.style.MozUserSelect = 'none';
      if (children) {
        $(this).find('*').unsel(true);
      }
    });
  };
})(jQuery);


((jq) => {
  const $ = jq;
  $.fn.selectRange = function selectRange(start, end) {
    return this.each(function eachThis() {
      if (this.setSelectionRange) {
        this.focus();
        this.setSelectionRange(start, end);
      } else if (this.createTextRange) {
        const range = this.createTextRange();
        range.collapse(true);
        range.moveEnd('character', end);
        range.moveStart('character', start);
        range.select();
      }
    });
  };
})(jQuery);


((jq) => {
  const $ = jq;
  $.fn.caretAt = function caretAt() {
    const el = $(this).get(0);
    let pos = 0;
    if ('selectionStart' in el) {
      pos = el.selectionStart;
    } else if ('selection' in document) {
      el.focus();
      const Sel = document.selection.createRange();
      const SelLength = document.selection.createRange().text.length;
      Sel.moveStart('character', -el.value.length);
      pos = Sel.text.length - SelLength;
    }
    return pos;
  };
})(jQuery);
