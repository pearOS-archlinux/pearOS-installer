function createNavbar() {
  if (document.getElementById('dynamic-navbar')) return;
  var navbar = document.createElement('div');
  navbar.id = 'dynamic-navbar';
  navbar.className = 'taskbar';
  navbar.innerHTML = '<div class="taskbar-button"><div id="logo-button"><img alt="" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAzMCA0NCI+CiAgPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI5LjcuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDIuMS4xIEJ1aWxkIDgpICAtLT4KICA8ZGVmcz4KICAgIDxzdHlsZT4KICAgICAgLnN0MCB7CiAgICAgICAgZmlsbDogI2ZmZjsKICAgICAgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgPHBhdGggY2xhc3M9InN0MCIgZD0iTTE1LjcyLDcuNTljMy41Ny0uNzIsNS44NS0zLjU3LDUuODYtNy4xLTMuMzYuMDMtNi44MiwzLjczLTUuODYsNy4xWk0yOC44OCwzMS45M2MtNi4wNiwwLTEwLjY0LTUuNDUtOS4xMS0xMS4zLjMyLTEuMjQsMS4wMS0yLjM3LDEuOC0zLjM4LjM4LS40OCwxLjEzLS45OCwxLjE3LTEuNjMuMTQtMi4zMy0xLjk5LTQuNTMtMy45MS01LjU1LTMuNjUtMS45NC05LjIzLS44OC0xMS4xMiwyLjk5LS44NCwxLjczLS4zMywzLjYxLS45OCw1LjM2LS45MywyLjUxLTIuODEsNC4xNS00LjEzLDYuNDEtMS44MiwzLjA5LTIuMjUsNy40NC0uNzMsMTAuNzIsNC4zOCw5LjQ2LDE5LjA4LDEwLjU1LDI1LjAyLDEuOTgsMS4xNC0xLjY1LDEuOTktMy41NywyLTUuNTloLS4wMVoiLz4KPC9zdmc+" /></div><div id="app-name-button"><b>pearOS Installer</b></div></div><div class="date-time"><div id="date">Oct 19</div><div id="time">9:41 AM</div></div>';
  document.body.insertBefore(navbar, document.body.firstChild);

  var logoMenu = document.createElement('div');
  logoMenu.id = 'logo-menu'; logoMenu.className = 'logo-menu';
  logoMenu.innerHTML = '<div class="logo-menu-item" onclick="handleShutdown()">' + i18n.get('navbar.shutdown') + '</div><div class="logo-menu-item" onclick="handleRestart()">' + i18n.get('navbar.restart') + '</div><div class="logo-menu-item" onclick="handleLiveEnvironment()">' + i18n.get('navbar.liveEnv') + '</div>';
  document.body.appendChild(logoMenu);

  var appMenu = document.createElement('div');
  appMenu.id = 'app-menu'; appMenu.className = 'logo-menu';
  appMenu.innerHTML = '<div class="logo-menu-item" onclick="handleAbout()">' + i18n.get('navbar.about') + '</div><div class="logo-menu-item" onclick="handleShowLog()">' + i18n.get('navbar.showLog') + '</div><div class="logo-menu-item" onclick="handleShowDisks()">' + i18n.get('navbar.showDisks') + '</div><div class="logo-menu-item" onclick="handleQuit()">' + i18n.get('navbar.quit') + '</div>';
  document.body.appendChild(appMenu);

  var aboutModal = document.createElement('div');
  aboutModal.id = 'about-modal'; aboutModal.className = 'modal';
  aboutModal.innerHTML = '<div class="modal-content"><h2>' + i18n.get('navbar.aboutTitle') + '</h2><p><strong>' + i18n.get('navbar.build') + '</strong> ' + i18n.get('navbar.buildValue') + '</p><p><strong>' + i18n.get('navbar.author') + '</strong> ' + i18n.get('navbar.authorValue') + '</p><p><strong>' + i18n.get('navbar.email') + '</strong> ' + i18n.get('navbar.emailValue') + '</p><button class="button" onclick="closeAboutModal()">' + i18n.get('common.close') + '</button></div>';
  document.body.appendChild(aboutModal);

  document.getElementById('logo-button').addEventListener('click', toggleLogoMenu);
  document.getElementById('app-name-button').addEventListener('click', toggleAppMenu);

  document.addEventListener('click', function(event) {
    var lm = document.getElementById('logo-menu'), am = document.getElementById('app-menu');
    var lb = document.getElementById('logo-button'), ab = document.getElementById('app-name-button');
    if (lm && !lm.contains(event.target) && !lb.contains(event.target)) lm.classList.remove('show');
    if (am && !am.contains(event.target) && !ab.contains(event.target)) am.classList.remove('show');
  });

  var am2 = document.getElementById('about-modal');
  am2.addEventListener('click', function(event) { if (event.target === am2) am2.classList.remove('show'); });

  updateDateTime();
  setInterval(updateDateTime, 1000);
}

function toggleLogoMenu(event) {
  event.stopPropagation();
  var lm = document.getElementById('logo-menu'), am = document.getElementById('app-menu');
  if (am) am.classList.remove('show');
  lm.classList.toggle('show');
}
function toggleAppMenu(event) {
  event.stopPropagation();
  var lm = document.getElementById('logo-menu'), am = document.getElementById('app-menu');
  if (lm) lm.classList.remove('show');
  am.classList.toggle('show');
}

function handleShutdown() { if (typeof require !== 'undefined') { require('electron').ipcRenderer.send('system-action', 'shutdown'); } }
function handleRestart() { if (typeof require !== 'undefined') { require('electron').ipcRenderer.send('system-action', 'restart'); } }
function handleLiveEnvironment() { if (typeof require !== 'undefined') { require('electron').ipcRenderer.send('system-action', 'live-environment'); } }
function handleAbout() { var m = document.getElementById('about-modal'), a = document.getElementById('app-menu'); if (a) a.classList.remove('show'); if (m) m.classList.add('show'); }
function closeAboutModal() { var m = document.getElementById('about-modal'); if (m) m.classList.remove('show'); }
function handleShowLog() { if (typeof require !== 'undefined') { require('electron').ipcRenderer.send('app-action', 'show-log'); } }
function handleShowDisks() { if (typeof require !== 'undefined') { require('electron').ipcRenderer.send('app-action', 'show-disks'); } }
function handleQuit() { if (typeof require !== 'undefined') { require('electron').ipcRenderer.send('app-action', 'quit'); } }

function updateDateTime() {
  var now = new Date();
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var ds = months[now.getMonth()] + ' ' + now.getDate();
  var h = now.getHours(), m = now.getMinutes().toString().padStart(2,'0');
  var ap = h >= 12 ? 'PM' : 'AM'; h = h % 12; h = h ? h : 12;
  var ts = h + ':' + m + ' ' + ap;
  var de = document.getElementById('date'), te = document.getElementById('time');
  if (de) de.textContent = ds;
  if (te) te.textContent = ts;
}
