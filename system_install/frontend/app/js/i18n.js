var i18n = (function () {
  var strings = {};
  var lng = new URLSearchParams(window.location.search).get('lng') || 'en_US';

  function resolve(key) {
    return key.split('.').reduce(function (o, k) { return o && o[k]; }, strings);
  }

  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var val = resolve(el.getAttribute('data-i18n'));
      if (val !== undefined) el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      var pairs = el.getAttribute('data-i18n-attr').split(';');
      pairs.forEach(function (pair) {
        var parts = pair.split(':');
        if (parts.length === 2) {
          var attr = parts[0].trim();
          var val = resolve(parts[1].trim());
          if (val !== undefined) el.setAttribute(attr, val);
        }
      });
    });
  }

  function load(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../i18n/' + lng + '.json');
    xhr.onload = function () {
      if (xhr.status === 200) strings = JSON.parse(xhr.responseText);
      apply();
      if (callback) callback();
    };
    xhr.send();
  }

  return { load: load, get: resolve, lng: lng };
})();
