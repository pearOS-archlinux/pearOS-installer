/* 
* Copyright Alexandru Balan under The Pear Project
* This file is released under the Pear Public Liense 
* v2 and later
*
* This script shows the progress of installation
* and it is meant to be used as part of the
* pearOS system install application
* 
* By using this installer, you are aware of
* the fact that it will ERASE the selected
* disk and will replace the OS you have
* currently running, with pearOS, as there
* is no Dual-Boot support yet.
*
* There is a workaround if you want dual
* boot. You can install pearOS and then
* an os of your choice.
*
* Do not blame on me for that, it is the
* "hackintosh" way, I work to fix that
* soon.
*
* I hope that you will enjoy the pearOS
* experience :)
*
* Now, let's get to the code: 	*/

function print_disk() {
const fs = require("fs");
const { exec } = require('child_process');
var disk="";
var prog="";

fs.readFile("/tmp" + "/disk-to-install", (error, data) => {
    if(error) {
        throw error;
    }
	var diskPath = data.toString().trim();
	
	// Găsește index-ul diskului și obține numele formal
	exec('list_disk count', (err, numberOfDisks) => {
		var count = parseInt(numberOfDisks);
		var found = false;
		var diskIndex = 0;
		
		// Iterează prin toate diskurile pentru a găsi index-ul
		var checkDisk = function(index) {
			if (index > count) {
				// Dacă nu găsim diskul, folosește device path-ul
				// Actualizează textul din pagină cu device path-ul
				var diskInstallText = document.getElementById("disk-install-text");
				if (diskInstallText) {
					diskInstallText.textContent = 'pearOS NiceC0re will be installed on the disk "' + diskPath + '":';
				}
				
				var disk = `
				<li>
				<label class="label_for_disk">
				<input type="radio" id="disk" name="disk" value="` + diskPath + `">
				<img class="disk_logo_progress" height=50px src="../../resources/disk.png"></img>
				<p id="label_disk" class="disk_title">` + diskPath + `</p>
				</label>
				</li>
				`;
				startProgressInterval(disk);
				return;
			}
			
			exec("list_disk " + index, (err, currentDiskPath) => {
				if (currentDiskPath.trim() === diskPath) {
					// Găsit! Obține numele formal
					exec("list_disk name " + index, (err, diskName) => {
						var diskNameTrimmed = diskName.trim();
						// Actualizează textul din pagină cu numele diskului
						var diskInstallText = document.getElementById("disk-install-text");
						if (diskInstallText) {
							diskInstallText.textContent = 'pearOS NiceC0re will be installed on the disk "' + diskNameTrimmed + '":';
						}
						
						var disk = `
						<li>
						<label class="label_for_disk">
						<input type="radio" id="disk" name="disk" value="` + diskPath + `">
						<img class="disk_logo_progress" height=50px src="../../resources/disk.png"></img>
						<p id="label_disk" class="disk_title">` + diskNameTrimmed + `</p>
						</label>
						</li>
						`;
						startProgressInterval(disk);
					});
				} else {
					// Continuă căutarea
					checkDisk(index + 1);
				}
			});
		};
		
		checkDisk(1);
	});
	});
}

// Variabile globale pentru calcularea timpului estimat
var startTime = null;
var lastProgress = 0;

function formatTimeRemaining(seconds) {
	if (seconds < 0) return "Calculating...";
	if (seconds < 60) {
		return seconds + " second" + (seconds !== 1 ? "s" : "");
	}
	var minutes = Math.floor(seconds / 60);
	var remainingSeconds = Math.floor(seconds % 60);
	if (remainingSeconds === 0) {
		return minutes + " minute" + (minutes !== 1 ? "s" : "");
	}
	return minutes + " minute" + (minutes !== 1 ? "s" : "") + " " + remainingSeconds + " second" + (remainingSeconds !== 1 ? "s" : "");
}

function startProgressInterval(disk) {
	setInterval(function() {
		const fs = require("fs");
                fs.readFile("/tmp" + "/progress", (error, data) => {
	            if(error) {
		    throw error;
            	}

            var progressText = data.toString();
            var progressPercent = 0;
            
            // Extrage procentajul de progres
            try {
            	progressPercent = parseFloat(progressText);
            } catch(e) {
            	progressPercent = 0;
            }
            
            // Inițializează timpul de start la primul progress > 0
            if (startTime === null && progressPercent > 0) {
            	startTime = Date.now();
            }
            
            // Verifică dacă instalarea a eșuat complet
            if (progressText.startsWith("INSTALLATION FAILED")) {
                var errorMessage = progressText.replace("INSTALLATION FAILED: ", "");
                var prog = '<p align="center" class="setup-text" style="color: #ff0000;">Installation Failed!</p>';
                prog += '<p align="center" class="setup-text" style="color: #ff6666;"><b>Error:</b> ' + errorMessage + '</p>';
                prog += '<p align="center" class="setup-text">Please check <b>/home/liveuser/Desktop/install.log</b> for details.<br>You may need to restart the installer or check your disk.</p>';
                document.getElementById("disk_list").innerHTML = prog;
            }
            // Verifică dacă instalarea s-a terminat (cu sau fără warnings)
            else if (progressText.startsWith("Installation finished")) {
            	startTime = null; // Reset pentru următoarea instalare
                var prog = '';
                
                // Verifică dacă sunt warnings
                if (progressText.includes("warnings")) {
                    // Extrage numărul de warnings
                    var warningMatch = progressText.match(/(\d+) warnings/);
                    var warningCount = warningMatch ? warningMatch[1] : '0';
                    
                    prog = '<p align="center" class="setup-text" style="color: #ffaa00;">Installation finished with ' + warningCount + ' warnings.</p>';
                    prog += '<p align="center" class="setup-text">Some packages failed to install. You can close this window (ALT+F4) and reboot,<br>or check the logs: <b>/home/liveuser/Desktop/install.log</b> and <b>/tmp/failed_packages.log</b></p>';
                } else {
                    prog = '<p align="center" class="setup-text" style="color: #00ff00;">Installation finished successfully!</p>';
                    prog += '<p align="center" class="setup-text">You can close this window (can use ALT+F4) and reboot<br>your new pearintosh, or check the log located on the desktop.</p>';
                }
                
                document.getElementById("disk_list").innerHTML = prog;
            } else {
                // Calculează timpul estimat rămas
                var timeRemainingText = "";
                if (startTime !== null && progressPercent > 0 && progressPercent < 100) {
                	var elapsedTime = (Date.now() - startTime) / 1000; // în secunde
                	var progressDecimal = progressPercent / 100;
                	
                	if (progressDecimal > 0 && elapsedTime > 0) {
                		var totalEstimatedTime = elapsedTime / progressDecimal;
                		var remainingTime = totalEstimatedTime - elapsedTime;
                		timeRemainingText = '<p align="center" class="setup-text" style="font-size: 0.9em; color: #888; margin-top: 10px;">Estimated time remaining: <b>' + formatTimeRemaining(Math.ceil(remainingTime)) + '</b></p>';
                	}
                }
                
                // Afișează progress bar cu timpul estimat rămas
                var prog = `
                	<br><progress id="file" value="` + progressText + `" max="100"> ` + progressText + `% </progress>
                	` + timeRemainingText + `
                	`
		document.getElementById("disk_list").innerHTML = disk + prog;
            }
            });
        }, 1000);
}

// Funcție pentru a închide fereastra
function closeWindow() {
    const { remote } = require('electron');
    if (remote) {
        var window = remote.getCurrentWindow();
        window.close();
    }
}

// Funcție pentru a adăuga event listener la butonul de close
function setupCloseButton() {
    var closeBtn = document.getElementById("close-btn");
    if (closeBtn) {
        // Elimină event listener-ii vechi dacă există
        var newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        
        newCloseBtn.addEventListener("click", function (e) {
            e.preventDefault();
            closeWindow();
        });
    }
}

// Adaugă event listener pentru butonul de close când DOM-ul este gata
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCloseButton);
} else {
    // DOM-ul este deja încărcat
    setupCloseButton();
}

// De asemenea, adaugă funcția la window pentru a putea fi apelată din onclick (pentru compatibilitate)
window.exit = function() {
    closeWindow();
};
