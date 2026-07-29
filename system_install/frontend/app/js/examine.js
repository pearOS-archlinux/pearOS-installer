function examineRedirect() {
  setTimeout(function() {
    location.href = "menu.html?lng=" + getLng();
  }, 2000);
}
