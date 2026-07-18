var isTestMode = typeof process !== 'undefined' && process.env.POST_INSTALL_TEST === '1';
var fs = require('fs');
var path = require('path');
var USERNAME_RE = /^[a-z][a-z0-9-]*$/;
var MAX_USERNAME_LEN = 32;
var reservedUsernames = [];
try { reservedUsernames = fs.readFileSync(path.join(__dirname, '..', '..', 'reserved_usernames'), 'utf8').trim().split('\n'); } catch (e) {}

// ── Navigation ──────────────────────────────────────────────────────
var STEPS = ['keymap', 'timezone', 'user', 'agreement', 'finish'];

function getLng() {
  return new URLSearchParams(window.location.search).get('lng') || 'en_US';
}

function go(delta) {
  var current = document.body.dataset.step;
  if (!current) return;
  var idx = STEPS.indexOf(current);
  if (idx === -1) return;
  var next = idx + delta;
  if (next < 0 || next >= STEPS.length) return;

  if (delta === 1) {
    if (current === 'keymap' && !saveKeymap()) return;
    if (current === 'timezone' && !saveTimezone()) return;
    if (current === 'user' && !saveUser()) return;
  }

  window.location.href = STEPS[next] + '.html?lng=' + getLng();
}

// ── Language selection (called from index.html) ─────────────────────
function select_language() {
  var e = document.getElementById('ddlViewBy');
  var locale = e.value;
  if (!locale) { alert('You must select one language from the list'); return; }
  fs.writeFileSync('/tmp/locale', locale);
  var folder = locale.replace('.UTF-8', '');
  window.location.href = 'templates/keymap.html?lng=' + folder;
}

// ── Keymap ──────────────────────────────────────────────────────────
function saveKeymap() {
  var e = document.getElementById('keymapList');
  var layout = e.value;
  if (!layout) { alert('You must choose one Keyboard Layout from the list'); return false; }
  fs.writeFileSync('/tmp/keymap', layout);
  var exec = require('child_process').exec;
  exec('setxkbmap ' + layout, function (err) {
    if (err) console.error('Error applying keyboard layout:', err.message);
  });
  return true;
}

// ── Timezone ────────────────────────────────────────────────────────
function saveTimezone() {
  var e = document.getElementById('time_zones_list');
  if (e.options[e.selectedIndex] === undefined) {
    alert('You must choose one Time Zone from the list');
    return false;
  }
  fs.writeFileSync('/tmp/timezone', e.options[e.selectedIndex].text);
  return true;
}

function list_zones() {
  var exec = require('child_process').exec;
  var timezoneList = document.getElementById('time_zones_list');
  if (!timezoneList) return;
  timezoneList.innerHTML = '';
  exec('find /usr/share/zoneinfo/posix -type f -or -type l | sort | cut -c27-', function (err, stdout) {
    if (err) { timezoneList.innerHTML = '<option>Error loading timezones</option>'; return; }
    stdout.trim().split('\n').filter(function (t) { return t.length > 0; }).forEach(function (tz) {
      var opt = document.createElement('option');
      opt.textContent = tz;
      timezoneList.appendChild(opt);
    });
    timezoneList.disabled = false;
  });
}

// ── User validation ─────────────────────────────────────────────────
function validateUser() {
  var fullName = document.getElementById('full_name');
  var accountName = document.getElementById('account_name');
  var hostname = document.getElementById('hostname');
  var password = document.getElementById('password');
  var passwordConfirm = document.getElementById('password_confirm');

  if (!fullName || !fullName.value.trim()) { alert('Full name cannot be empty'); return false; }
  if (!accountName || !accountName.value.trim()) { alert('Username cannot be empty'); return false; }
  if (!USERNAME_RE.test(accountName.value)) {
    alert('The username must start with a lowercase letter and contain only lowercase letters, digits, and hyphens.');
    return false;
  }
  if (accountName.value.length > MAX_USERNAME_LEN) { alert('Username too long (max ' + MAX_USERNAME_LEN + ' chars)'); return false; }
  if (reservedUsernames.indexOf(accountName.value) !== -1) { alert('This username is reserved'); return false; }
  if (!password || !password.value) { alert('Password cannot be empty'); return false; }
  if (password.value !== passwordConfirm.value) { alert('Passwords do not match'); return false; }
  return true;
}

function saveUser() {
  if (!validateUser()) return false;
  var fullName = document.getElementById('full_name').value;
  var userName = document.getElementById('account_name').value;
  var hostname = document.getElementById('hostname').value || 'pearOS-machine';
  var password = document.getElementById('password').value;
  fs.writeFileSync('/tmp/fullname', "'" + fullName + "'");
  fs.writeFileSync('/tmp/username', userName);
  fs.writeFileSync('/tmp/hostname', hostname);
  fs.writeFileSync('/tmp/password', password);
  var selectedPicture = document.querySelector('.profile-picture-item.selected');
  if (selectedPicture) fs.writeFileSync('/tmp/profile_picture', selectedPicture.dataset.imagePath);
  return true;
}

// ── Password match indicator ────────────────────────────────────────
function check_passwords_match() {
  var password = document.getElementById('password');
  var password_confirm = document.getElementById('password_confirm');
  var passwordCheck = document.getElementById('password_check');
  if (!password || !password_confirm || !passwordCheck) return;
  var checkMatch = function () {
    var p1 = password.value, p2 = password_confirm.value;
    if (p1 === '' && p2 === '') { passwordCheck.innerHTML = ''; passwordCheck.className = 'password-check'; return; }
    if (p1 === p2 && p1 !== '') { passwordCheck.innerHTML = '<span class="password-check-icon">\u2713</span> Passwords match'; passwordCheck.className = 'password-check match'; }
    else if (p2 !== '') { passwordCheck.innerHTML = '<span class="password-check-icon">\u2717</span> Passwords do not match'; passwordCheck.className = 'password-check mismatch'; }
    else { passwordCheck.innerHTML = ''; passwordCheck.className = 'password-check'; }
  };
  password.removeEventListener('input', checkMatch);
  password_confirm.removeEventListener('input', checkMatch);
  password.addEventListener('input', checkMatch);
  password_confirm.addEventListener('input', checkMatch);
}

// ── Form validity (user page forward button) ────────────────────────
function checkFormValidity() {
  var fullName = document.getElementById('full_name');
  var accountName = document.getElementById('account_name');
  var hostname = document.getElementById('hostname');
  var password = document.getElementById('password');
  var passwordConfirm = document.getElementById('password_confirm');
  var continueBtn = document.getElementById('move-forward-btn');
  var selectedPicture = document.querySelector('.profile-picture-item.selected');
  if (!continueBtn) return;
  var ok = fullName && fullName.value.trim() !== '' &&
    accountName && accountName.value.trim() !== '' &&
    hostname && hostname.value.trim() !== '' &&
    password && password.value !== '' &&
    passwordConfirm && passwordConfirm.value !== '' &&
    password.value === passwordConfirm.value &&
    selectedPicture !== null;
  continueBtn.disabled = !ok;
  continueBtn.style.opacity = ok ? '1' : '0.5';
  continueBtn.style.cursor = ok ? 'pointer' : 'not-allowed';
}

// ── Profile pictures ────────────────────────────────────────────────
var profilePicturesLoaded = false;

function load_profile_pictures() {
  var container = document.getElementById('profile-pictures-circle');
  if (!container) return;
  var profilesPath = path.join(__dirname, '..', 'resources', 'profiles');
  if (!fs.existsSync(profilesPath)) return;
  var imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'];
  var imageFiles = fs.readdirSync(profilesPath).filter(function (f) {
    return imageExtensions.indexOf(path.extname(f).toLowerCase()) !== -1;
  });
  if (imageFiles.length === 0) return;
  container.innerHTML = '';
  imageFiles.forEach(function (file) {
    var item = document.createElement('div');
    item.className = 'profile-picture-item';
    item.dataset.imagePath = path.join(profilesPath, file);
    item.dataset.imageName = file;
    var img = document.createElement('img');
    img.src = '../resources/profiles/' + file;
    img.alt = file;
    img.onerror = function () { this.style.display = 'none'; item.innerHTML = '<span style="font-size:12px;color:#999;">?</span>'; };
    item.appendChild(img);
    item.addEventListener('click', function () {
      document.querySelectorAll('.profile-picture-item').forEach(function (el) { el.classList.remove('selected'); });
      this.classList.add('selected');
      fs.writeFileSync('/tmp/profile_picture', this.dataset.imagePath);
      if (!isTestMode) {
        var exec = require('child_process').exec;
        var src = this.dataset.imagePath;
        exec('sudo cp "' + src + '" /usr/share/sddm/themes/pearOS/faces/.face.icon');
        exec('sudo cp "' + src + '" /usr/share/sddm/themes/pearOS-dark/faces/.face.icon');
      }
      checkFormValidity();
    });
    container.appendChild(item);
  });
}

function ensureProfilePicturesContainer() {
  var container = document.getElementById('profile-pictures-circle');
  if (container) return container;
  var createUser = document.getElementById('create_user');
  if (!createUser) return null;
  var div = document.createElement('div');
  div.className = 'profile-picture-container';
  div.innerHTML = '<div id="profile-pictures-circle" class="profile-pictures-circle"></div>';
  var form = createUser.querySelector('form');
  if (form) createUser.insertBefore(div, form); else createUser.insertBefore(div, createUser.firstChild);
  return document.getElementById('profile-pictures-circle');
}

function initProfilePictures() {
  if (profilePicturesLoaded) return;
  var container = ensureProfilePicturesContainer();
  if (container) { profilePicturesLoaded = true; load_profile_pictures(); }
  else setTimeout(function () {
    var c2 = ensureProfilePicturesContainer();
    if (c2 && !profilePicturesLoaded) { profilePicturesLoaded = true; load_profile_pictures(); }
  }, 500);
}

// ── Commit (finish page) ────────────────────────────────────────────
function logSettings(cfg) {
  console.log('');
  console.log('==========================================');
  console.log('  Selected Configuration Settings');
  console.log('==========================================');
  console.log('Keyboard Layout:     ' + cfg.keymap);
  console.log('Locale:              ' + cfg.locale);
  console.log('Timezone:            ' + cfg.timezone);
  console.log('Full Name:           ' + cfg.fullname);
  console.log('Username:            ' + cfg.username);
  console.log('Hostname:            ' + cfg.hostname);
  console.log('==========================================');
  console.log('');
}

function commit() {
  var r = function (f) {
    try { return fs.readFileSync('/tmp/' + f, 'utf8').trim().replace(/^'|'$/g, ''); }
    catch (e) { return ''; }
  };
  var cfg = {
    keymap: r('keymap'), locale: r('locale'), timezone: r('timezone'),
    fullname: r('fullname'), username: r('username'),
    hostname: r('hostname') || 'pearOS-machine', password: r('password')
  };
  logSettings(cfg);
  console.log('Starting post-installation setup...');

  if (isTestMode) {
    console.log('Test mode: post_setup not running, system unchanged.');
    require('electron').ipcRenderer.send('close-me');
    return;
  }

  var ipcRenderer = require('electron').ipcRenderer;
  ipcRenderer.removeAllListeners('post-setup-output');
  ipcRenderer.removeAllListeners('post-setup-done');
  ipcRenderer.removeAllListeners('post-setup-error');

  ipcRenderer.on('post-setup-output', function (evt, line) {
    var logEl = document.getElementById('post-install-log');
    if (logEl) { logEl.textContent += line; logEl.scrollTop = logEl.scrollHeight; }
    var statusEl = document.getElementById('post-install-status');
    if (statusEl) {
      var trimmed = line.trim().replace(/^\+\s*/, '').replace(/^\++\s*/, '');
      if (trimmed && !trimmed.startsWith('#') && trimmed.length > 2) statusEl.textContent = trimmed.substring(0, 100);
    }
  });

  ipcRenderer.once('post-setup-done', function () { ipcRenderer.send('close-me'); });

  ipcRenderer.once('post-setup-error', function (evt, msg) {
    var errMsg = msg;
    try { errMsg = fs.readFileSync('/tmp/post-install-error', 'utf8').trim() || msg; } catch (_) {}
    var container = document.getElementById('post-install-progress') || document.body;
    var errDiv = document.createElement('div');
    errDiv.style.cssText = 'color:#ff6666;margin:20px;padding:15px;background:rgba(0,0,0,0.6);border-radius:8px;white-space:pre-wrap;text-align:left;max-width:90%;font-size:13px;';
    errDiv.innerHTML = '<strong>Post-install failed</strong>\n\n' + errMsg + '\n\nCheck /home/default/Desktop/post-install.log';
    container.appendChild(errDiv);
  });

  ipcRenderer.send('run-post-setup', [cfg.keymap, cfg.locale, cfg.timezone, cfg.password, cfg.fullname, cfg.username, cfg.hostname]);
}

// ── Init ────────────────────────────────────────────────────────────
window.addEventListener('load', function () {
  document.querySelectorAll('[data-nav]').forEach(function (btn) {
    btn.addEventListener('click', function () { go(parseInt(this.dataset.nav, 10)); });
  });

  setTimeout(check_passwords_match, 100);
  setTimeout(initProfilePictures, 300);

  var createUser = document.getElementById('create_user');
  if (createUser) {
    setTimeout(function () {
      ['full_name', 'account_name', 'hostname', 'password', 'password_confirm'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', checkFormValidity);
      });
      checkFormValidity();
    }, 500);
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () { setTimeout(initProfilePictures, 200); });
} else {
  setTimeout(initProfilePictures, 300);
}

// ── Test mode banner ────────────────────────────────────────────────
if (isTestMode && typeof document !== 'undefined') {
  (function showBanner() {
    if (document.getElementById('post-install-test-banner')) return;
    var b = document.createElement('div');
    b.id = 'post-install-test-banner';
    b.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff9800;color:#000;padding:6px;text-align:center;z-index:9999;font-size:12px;';
    b.textContent = 'Test mode — system unchanged.';
    if (document.body) document.body.appendChild(b);
  })();
}
