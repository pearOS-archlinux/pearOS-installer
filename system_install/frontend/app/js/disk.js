function list_disk() {
  var { exec } = require('child_process');
  var count = 0, i = 1;
  var z = '';
  var eventListenerAdded = false;

  setTimeout(function() { updateContinueButtonState(); }, 100);

  function addDiskSelectionListener() {
    if (eventListenerAdded) return;
    eventListenerAdded = true;
    var diskList = document.getElementById("disk_list");
    if (diskList) {
      diskList.addEventListener('change', function(e) {
        if (e.target && e.target.type === 'radio' && e.target.name === 'disk' && e.target.checked) {
          var selectedDiskName = e.target.getAttribute('data-disk-name');
          var diskInstallText = document.getElementById("disk-install-text");
          if (diskInstallText && selectedDiskName) {
            diskInstallText.textContent = i18n.get('disk.installTextPrefix') + ' "' + selectedDiskName + '":';
          }
          updateContinueButtonState();
        }
      });
    }
  }

  exec('list_disk count', function(err, numberofdisks) {
    count = parseInt(numberofdisks);
    if (count === 0 || isNaN(count) || count < 1) {
      var fakeDisk = '<li><label class="label_for_disk"><input type="radio" id="disk0" name="disk" value="/dev/null" data-disk-name="NODISK"><img class="disk_logo" height=50px src="../resources/disk.png"></img><p id="label_disk0" class="disk_title"><b>NODISK</b></p><p class="disk_title" style="font-size:0.8em;color:#999;">/dev/null</p><p class="disk_title" style="font-size:0.8em;color:#999;">00.00GB</p></label></li>';
      z += fakeDisk;
      document.getElementById("disk_list").innerHTML = z;
      addDiskSelectionListener();
      setTimeout(function() { updateContinueButtonState(); }, 100);
      return;
    }
    while (i < (count + 1)) {
      var currentIndex = i;
      exec("list_disk " + currentIndex, function(err, diskPath) {
        exec("list_disk name " + currentIndex, function(err, diskName) {
          var dp = diskPath.trim(), dn = diskName.trim();
          z += '<li><label class="label_for_disk"><input type="radio" id="disk' + currentIndex + '" name="disk" value="' + dp + '" data-disk-name="' + dn + '"><img class="disk_logo" height=50px src="../resources/disk.png"></img><p id="label_disk' + currentIndex + '" class="disk_title"><b>' + dn + '</b></p><p class="disk_title" style="font-size:0.8em;color:#999;">' + dp + '</p></label></li>';
          document.getElementById("disk_list").innerHTML = z;
          addDiskSelectionListener();
        });
      });
      i++;
    }
    setTimeout(function() { updateContinueButtonState(); }, 500);
  });
}

function checkInternetConnection(callback) {
  var { exec } = require('child_process');
  exec('ping -c 1 -W 3 8.8.8.8 > /dev/null 2>&1', function(error) { callback(!error); });
}

function updateContinueButtonState() {
  var radios = document.getElementsByName('disk');
  var hasSelection = false, selectedDisk = null;
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) { hasSelection = true; selectedDisk = radios[i]; break; }
  }
  var allButtons = document.querySelectorAll('.install-button-agreement');
  for (var j = 0; j < allButtons.length; j++) {
    var btn = allButtons[j];
    if (btn.getAttribute('data-nav') === '1') {
      if (!hasSelection || (selectedDisk && (selectedDisk.value === '/dev/null' || selectedDisk.getAttribute('data-disk-name') === 'NODISK'))) {
        btn.disabled = true; btn.classList.add('disabled');
      } else {
        btn.disabled = false; btn.classList.remove('disabled');
      }
      break;
    }
  }
}

// ---- Disk: save (gate for go) ----
function save_disk() {
  var radios = document.getElementsByName('disk');
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      var sv = radios[i].value, sn = radios[i].getAttribute('data-disk-name');
      if (sv === '/dev/null' || sn === 'NODISK') { alert(i18n.get('disk.cannotInstallNODISK')); return false; }
      var fs = require('fs');
      fs.writeFileSync('/tmp/disk-to-install', '' + radios[i].value);
      return true;
    }
  }
  return false;
}

// ---- Erase modal ----
function showEraseModal() { var m = document.getElementById('erase-modal'); if (m) m.classList.add('show'); }
function closeEraseModal() { var m = document.getElementById('erase-modal'); if (m) m.classList.remove('show'); }
function confirmErase() { closeEraseModal(); if (save_disk()) go(1); }
