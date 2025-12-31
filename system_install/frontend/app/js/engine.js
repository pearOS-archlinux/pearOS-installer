function open_gparted() {
const { exec } = require('child_process');
exec('gparted', (err, stdout, stderr) => {
    if (err) {
        console.error('Error opening GParted:', err.message);
        alert('GParted could not be opened. Make sure it is installed.');
        return;
    }
    // GParted opened successfully
})
}

function open_browser() {
const { exec } = require('child_process');
// Try Pafari first, fallback to xdg-open or firefox
exec('pafari', (err) => {
    if (err) {
        // Pafari not found, try xdg-open
        exec('xdg-open http://www.google.com', (err2) => {
            if (err2) {
                // xdg-open failed, try firefox
                exec('firefox', (err3) => {
                    if (err3) {
                        console.error('Error opening browser:', err3.message);
                        alert('Could not open browser. Make sure a browser is installed.');
                    }
                });
            }
        });
    }
});
}

function open_packup() {
const { exec } = require('child_process');
// TODO: Implement packup restore functionality
// For now, just show a message or open packup application if available
exec('packup &', (err) => {
    if (err) {
        console.error('Packup not available:', err.message);
        alert('Packup restore functionality is not yet implemented or Packup is not installed.');
    }
})
}

function open_installer() {
 location.href = "page_install.html";
}

// Menu checkbox functionality
function initMenuCheckboxes() {
  var checkboxes = document.querySelectorAll('.menu_checkbox');
  
  // Update visual state for all checkboxes on init
  checkboxes.forEach(function(checkbox) {
    updateMenuCheckboxState(checkbox);
  });
  
  checkboxes.forEach(function(checkbox) {
    checkbox.addEventListener('change', function() {
      // If this checkbox is checked, uncheck all others
      if (this.checked) {
        checkboxes.forEach(function(cb) {
          if (cb !== this) {
            cb.checked = false;
            updateMenuCheckboxState(cb);
          }
        }.bind(this));
      }
      // Update visual state
      updateMenuCheckboxState(this);
    });
  });
}

function updateMenuCheckboxState(checkbox) {
  var label = checkbox.closest('.menu_checkbox_label');
  if (checkbox.checked) {
    label.classList.add('menu_checkbox_checked');
  } else {
    label.classList.remove('menu_checkbox_checked');
  }
}

function handleMenuAction(action) {
  // Uncheck all checkboxes first
  var allCheckboxes = document.querySelectorAll('.menu_checkbox');
  allCheckboxes.forEach(function(cb) {
    cb.checked = false;
    updateMenuCheckboxState(cb);
  });
  
  // Check the selected checkbox
  var checkbox = document.getElementById('menu_' + action);
  if (checkbox) {
    checkbox.checked = true;
    updateMenuCheckboxState(checkbox);
  }
  
  // Execute the action
  switch(action) {
    case 'packup':
      open_packup();
      break;
    case 'installer':
      open_installer();
      break;
    case 'browser':
      open_browser();
      break;
    case 'gparted':
      open_gparted();
      break;
  }
}

function handleMenuContinue() {
  var checkedCheckbox = document.querySelector('.menu_checkbox:checked');
  if (!checkedCheckbox) {
    alert('Please select an option');
    return;
  }
  
  // Execute action for the selected item
  var action = checkedCheckbox.value;
  switch(action) {
    case 'packup':
      open_packup();
      break;
    case 'installer':
      open_installer();
      break;
    case 'browser':
      open_browser();
      break;
    case 'gparted':
      open_gparted();
      break;
  }
}
///////////////////////////////////////////////////////////////////////////////////////////////////

function list_disk() {
//vars:
const { exec } = require('child_process');
count = 0;
i = 1 ;
f = 0;
var z=``;
var diskname = "";
var disksize ="";
var eventListenerAdded = false;

// Initialize Continue button as disabled
setTimeout(function() {
  updateContinueButtonState();
}, 100);

// Adaugă event listener o singură dată folosind event delegation
function addDiskSelectionListener() {
	if (eventListenerAdded) return;
	eventListenerAdded = true;
	
	// Folosește event delegation pe elementul părinte
	var diskList = document.getElementById("disk_list");
	if (diskList) {
		diskList.addEventListener('change', function(e) {
			if (e.target && e.target.type === 'radio' && e.target.name === 'disk' && e.target.checked) {
				var selectedDiskName = e.target.getAttribute('data-disk-name');
				var diskInstallText = document.getElementById("disk-install-text");
				if (diskInstallText && selectedDiskName) {
					diskInstallText.textContent = 'pearOS NiceC0re will be installed on the disk "' + selectedDiskName + '":';
				}
				updateContinueButtonState();
			}
		});
	}
}

exec('list_disk count', (err, numberofdisks) => {
var sCount = `${numberofdisks}`
count = parseInt(sCount);
console.log("Available disks are:" + count);

// If no disks found, add a fake NODISK entry
if (count === 0 || isNaN(count) || count < 1) {
	var fakeDisk = `
	<li>
	  <label class="label_for_disk">
	    <input type="radio" id="disk0" name="disk" value="/dev/null" data-disk-name="NODISK">
    		<img class="disk_logo" height=50px src="../../resources/disk.png"></img>
    		<p id="label_disk0" class="disk_title"><b>NODISK</b></p>
    		<p class="disk_title" style="font-size: 0.8em; color: #999;">/dev/null</p>
    		<p class="disk_title" style="font-size: 0.8em; color: #999;">00.00GB</p>
	  </label>
	</li>
	`;
	z += fakeDisk;
	document.getElementById("disk_list").innerHTML = z;
	addDiskSelectionListener();
	// Update button state after fake disk is added
	setTimeout(function() {
	  updateContinueButtonState();
	}, 100);
	return;
}

while (i < (count+1)) {
        console.log("THE VALUE IS " + i);
        const currentIndex = i;
        
		exec("list_disk " + currentIndex, (err, diskPath) => {
			exec("list_disk name " + currentIndex, (err, diskName) => {
				var diskPathTrimmed = diskPath.trim();
				var diskNameTrimmed = diskName.trim();
				var zi=`
				<li>
				  <label class="label_for_disk">
				    <input type="radio" id="disk${currentIndex}" name="disk" value="${diskPathTrimmed}" data-disk-name="${diskNameTrimmed}">
        	    		<img class="disk_logo" height=50px src="../../resources/disk.png"></img>
        	    		<p id="label_disk${currentIndex}" class="disk_title"><b>${diskNameTrimmed}</b></p>
        	    		<p class="disk_title" style="font-size: 0.8em; color: #999;">${diskPathTrimmed}</p>
				  </label>
				</li>
				`;
				z += zi;
				document.getElementById("disk_list").innerHTML = z;
				addDiskSelectionListener();
			});
        });
        i++;
	}
	// Update button state after all disks are loaded
	setTimeout(function() {
	  updateContinueButtonState();
	}, 500);
	})
}

// Verifică conexiunea la internet folosind ping
function checkInternetConnection(callback) {
  const { exec } = require('child_process');
  // Ping la Google DNS (8.8.8.8) cu timeout de 3 secunde
  exec('ping -c 1 -W 3 8.8.8.8 > /dev/null 2>&1', (error) => {
    if (error) {
      callback(false);
    } else {
      callback(true);
    }
  });
}

// Update Continue button state based on disk selection
function updateContinueButtonState() {
  // Find the Continue button - it has onclick="select_disk()"
  var allButtons = document.querySelectorAll('.install-button-agreement');
  var continueButton = null;
  for (var j = 0; j < allButtons.length; j++) {
    if (allButtons[j].getAttribute('onclick') && allButtons[j].getAttribute('onclick').includes('select_disk')) {
      continueButton = allButtons[j];
      break;
    }
  }
  
  if (!continueButton) return;
  
  var radios = document.getElementsByName('disk');
  var hasSelection = false;
  var selectedDisk = null;
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      hasSelection = true;
      selectedDisk = radios[i];
      break;
    }
  }
  
  // Disable button if no selection, or if NODISK is selected
  if (!hasSelection || (selectedDisk && (selectedDisk.value === '/dev/null' || selectedDisk.getAttribute('data-disk-name') === 'NODISK'))) {
    continueButton.disabled = true;
    continueButton.classList.add('disabled');
  } else {
    continueButton.disabled = false;
    continueButton.classList.remove('disabled');
  }
}

function select_disk() {
  // Check if NODISK is selected - prevent installation
  var radios = document.getElementsByName('disk');
  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      var selectedValue = radios[i].value;
      var selectedName = radios[i].getAttribute('data-disk-name');
      if (selectedValue === '/dev/null' || selectedName === 'NODISK') {
        alert('Cannot install on NODISK. Please select a valid disk.');
        return;
      }
      break;
    }
  }
  
  // Verifică conexiunea la internet înainte de a permite instalarea
  checkInternetConnection(function(hasInternet) {
    if (!hasInternet) {
      alert('You need an active internet connection to install pearOS NiceCC0re on your device. Please connect to the internet and try again.');
      window.location.href='';
      return;
    }
    
    // Dacă există conexiune, continuă cu instalarea
    var radios = document.getElementsByName('disk');
    for (var i = 0, length = radios.length; i < length; i++) {
      if (radios[i].checked) {
        const fs = require('fs');
        fs.writeFileSync('/tmp/disk-to-install', '' + radios[i].value);
        // starting the shell //
        const { exec } = require('child_process');
        exec("sudo setup " + radios[i].value + "&> /home/liveuser/Desktop/install.log", (err, stdout) => {
        })
        // ending the shell //
        window.location.href='page_install_progress.html';
        break;
      }
    }
  });
}

var p = document.getElementsByTagName("p");

function print_disk(ctrl){
    //var TextInsideLi = ctrl.getElementsByTagName('p')[0].innerHTML;
}
///////////////////////////////////////////////////////////////////////////////////////////////////
// Mark selected option when language is selected
function markSelectedLanguage() {
  var select = document.getElementById("ddlViewBy");
  if (select) {
    // Remove selected class from all options
    var options = select.getElementsByTagName('option');
    for (var i = 0; i < options.length; i++) {
      options[i].classList.remove('selected-option');
    }
    // Add selected class to current option
    if (select.selectedIndex >= 0) {
      options[select.selectedIndex].classList.add('selected-option');
    }
  }
}

// Initialize on page load
window.addEventListener('load', function() {
  var select = document.getElementById("ddlViewBy");
  if (select) {
    // Mark initial selection
    markSelectedLanguage();
    // Mark selection when changed
    select.addEventListener('change', markSelectedLanguage);
    // Mark selection when focus is lost
    select.addEventListener('blur', markSelectedLanguage);
  }
});

// Initialize language selection handler
function initLanguageSelection() {
  var selectElement = document.getElementById("ddlViewBy");
  if (selectElement) {
    selectElement.addEventListener('change', function() {
      // Remove selected attribute from all options
      for (var i = 0; i < this.options.length; i++) {
        this.options[i].removeAttribute('selected');
      }
      // Set selected attribute on the currently selected option
      if (this.selectedIndex >= 0) {
        this.options[this.selectedIndex].setAttribute('selected', 'selected');
      }
    });
  }
}

function select_language() {
  var e = document.getElementById("ddlViewBy");
  var strUser = e.options[e.selectedIndex].text;
  if (strUser == "English") {
    window.location.href='lg/en/page_examining.html';
  } else if (strUser == "Romanian") {
      window.location.href='lg/ro/page_examining.html';
    }
    else if (strUser == "Czech") {
      window.location.href='lg/cs/page_examining.html';
    }
}

// Agreement modal functions
function showAgreementModal() {
  var modal = document.getElementById('agreement-modal');
  if (modal) {
    modal.classList.add('show');
  }
}

function closeAgreementModal() {
  var modal = document.getElementById('agreement-modal');
  if (modal) {
    modal.classList.remove('show');
  }
}

function confirmAgreement() {
  closeAgreementModal();
  window.location.href='page_install_disk.html';
}
