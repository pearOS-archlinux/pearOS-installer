function open_gparted() {
  var { exec } = require('child_process');
  exec('gparted', function(err) {
    if (err) { alert(i18n.get('common.pageTitle') + ': GParted could not be opened.'); }
  });
}
function open_browser() {
  var { exec } = require('child_process');
  exec('pafari', function(err) {
    if (err) {
      exec('xdg-open http://www.google.com', function(err2) {
        if (err2) {
          exec('firefox', function(err3) {
            if (err3) alert(i18n.get('common.pageTitle') + ': Could not open browser.');
          });
        }
      });
    }
  });
}
function open_packup() {
  var { exec } = require('child_process');
  exec('packup &', function(err) {
    if (err) alert(i18n.get('common.pageTitle') + ': Packup not available.');
  });
}
function open_offline_installer() {
  var { spawn } = require('child_process');
  var child = spawn('sudo', ['/etc/calamares/launch.sh'], { detached: true, stdio: 'ignore', env: Object.assign({}, process.env) });
  child.unref();
}
