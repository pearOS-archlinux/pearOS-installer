function open_gparted() {
const { exec } = require('child_process');
exec('gparted', (err, stdout) => {
    console.log(`${stdout}`);
})
}

function open_browser() {
const { exec } = require('child_process');
exec('firefox', (err, stdout) => {
    console.log(`${stdout}`);
})
}

function open_packup() {
const { exec } = require('child_process');
exec('', (err, stdout) => {
    console.log(`${stdout}`);
})
}

function open_installer() {
 location.href = "page_install.html";
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
			}
		});
	}
}

exec('list_disk count', (err, numberofdisks) => {
var sCount = `${numberofdisks}`
count = parseInt(sCount);
console.log("Available disks are:" + count);

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

function select_disk() {
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
