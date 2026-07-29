var isAltPressed = false;

function initMenuCheckboxes() {
  var checkboxes = document.querySelectorAll('.menu_checkbox');
  checkboxes.forEach(function(cb) { updateMenuCheckboxState(cb); });
  checkboxes.forEach(function(cb) {
    cb.addEventListener('change', function() {
      if (this.checked) {
        checkboxes.forEach(function(other) {
          if (other !== this) { other.checked = false; updateMenuCheckboxState(other); }
        }.bind(this));
      }
      updateMenuCheckboxState(this);
      updateInstallerAltUI();
    });
  });
  updateInstallerAltUI();
}

function updateMenuCheckboxState(checkbox) {
  var label = checkbox.closest('.menu_checkbox_label');
  if (checkbox.checked) label.classList.add('menu_checkbox_checked');
  else label.classList.remove('menu_checkbox_checked');
}

function updateInstallerAltUI() {
  var titleEl = document.getElementById('menu_installer_title');
  var descEl = document.getElementById('menu_installer_desc');
  var installerCheckbox = document.getElementById('menu_installer');
  var hintEl = document.querySelector('.alt-hint');

  if (!titleEl || !descEl || !installerCheckbox || !installerCheckbox.checked) {
    if (titleEl) {
      var defTitleKey = titleEl.getAttribute('data-default-title') || 'menu.install';
      titleEl.innerHTML = '<b>' + i18n.get(defTitleKey) + '</b>';
    }
    if (descEl) {
      var defDescKey = descEl.getAttribute('data-default-desc') || 'menu.installDesc';
      descEl.textContent = i18n.get(defDescKey);
    }
    if (hintEl) hintEl.style.visibility = 'hidden';
    return;
  }

  var defaultTitleKey = titleEl.getAttribute('data-default-title') || 'menu.install';
  var altTitleKey = titleEl.getAttribute('data-alt-title') || defaultTitleKey;
  var defaultDescKey = descEl.getAttribute('data-default-desc') || 'menu.installDesc';
  var altDescKey = descEl.getAttribute('data-alt-desc') || defaultDescKey;

  if (hintEl) hintEl.style.visibility = 'visible';

  if (isAltPressed) {
    titleEl.innerHTML = '<b>' + i18n.get(altTitleKey) + '</b>';
    descEl.textContent = i18n.get(altDescKey);
  } else {
    titleEl.innerHTML = '<b>' + i18n.get(defaultTitleKey) + '</b>';
    descEl.textContent = i18n.get(defaultDescKey);
  }
}

(function initAltForMenu() {
  if (typeof window === 'undefined') return;
  if (window.__pearosAltInit) return;
  window.__pearosAltInit = true;
  window.addEventListener('keydown', function(e) {
    if (e.altKey && !isAltPressed) { isAltPressed = true; updateInstallerAltUI(); }
  });
  window.addEventListener('keyup', function(e) {
    if (!e.altKey && isAltPressed) { isAltPressed = false; updateInstallerAltUI(); }
  });
  window.addEventListener('blur', function() {
    if (isAltPressed) { isAltPressed = false; updateInstallerAltUI(); }
  });
})();

function handleMenuAction(action) {
  var allCheckboxes = document.querySelectorAll('.menu_checkbox');
  allCheckboxes.forEach(function(cb) { cb.checked = false; updateMenuCheckboxState(cb); });
  var checkbox = document.getElementById('menu_' + action);
  if (checkbox) { checkbox.checked = true; updateMenuCheckboxState(checkbox); }
  switch(action) {
    case 'packup': open_packup(); break;
    case 'installer':
      if (isAltPressed) { open_offline_installer(); }
      else { showInstallChoiceModal(); }
      break;
    case 'browser': open_browser(); break;
    case 'gparted': open_gparted(); break;
  }
}

// ---- Menu: save (gate for go) ----
function save_menu() {
  var checkedCheckbox = document.querySelector('.menu_checkbox:checked');
  if (!checkedCheckbox) { alert(i18n.get('menu.selectOption')); return false; }
  var action = checkedCheckbox.value;
  if (action === 'installer' && !isAltPressed) {
    showInstallChoiceModal();
    return false;
  }
  handleMenuAction(action);
  return true;
}

// ---- Modal: install choice ----
function showInstallChoiceModal() {
  var modal = document.getElementById('install-choice-modal');
  if (modal) modal.classList.add('show');
}
function closeInstallChoiceModal() {
  var modal = document.getElementById('install-choice-modal');
  if (modal) modal.classList.remove('show');
}
function chooseInstallType(type) {
  closeInstallChoiceModal();
  if (type === 'offline') {
    var menuList = document.querySelector('.ul_menu');
    if (menuList) { menuList.style.opacity = '0.3'; menuList.style.pointerEvents = 'none'; }
    var contBtn = document.getElementById('menu-continue-btn');
    if (contBtn) contBtn.disabled = true;
    open_offline_installer();
  } else {
    window.location.href = 'install.html?lng=' + getLng();
  }
}
