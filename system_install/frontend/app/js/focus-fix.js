(function() {
  var tags = ['option'];
  var app = document.querySelector('.app');
  if (!app) return;
  app.addEventListener('mousedown', function(e) {
    if (tags.indexOf(e.target.tagName.toLowerCase()) !== -1) return;
    e.preventDefault();
  });
})();
