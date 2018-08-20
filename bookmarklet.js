(function () {
  var player = document.querySelector('iframe.player');
  var storyUrl = player.src.replace(/\/story(.*?)$/, '');
  var storyId = storyUrl.substring(storyUrl.lastIndexOf('/') + 1);
  copyToClipboard(storyId);
  window.alert('Story id copied to clipboard: ' + storyId);

  function copyToClipboard(str) {
    var el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    var sel = document.getSelection();
    var selected = sel.rangeCount > 0 && sel.getRangeAt(0);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    if (selected) {
      sel = document.getSelection();
      sel.removeAllRanges();
      sel.addRange(selected);
    }
  }
}());
