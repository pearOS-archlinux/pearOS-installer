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
				<li style="float: none; display: flex; justify-content: center; align-items: center; width: 100%;">
				<label class="label_for_disk" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
				<input type="radio" id="disk" name="disk" value="` + diskPath + `" style="position: absolute; opacity: 0;">
				<img class="disk_logo_progress" height=50px src="../../resources/disk.png" style="margin: 0 auto; display: block;"></img>
				<p id="label_disk" class="disk_title" style="margin-top: 10px; text-align: center;">` + diskPath + `</p>
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
						<li style="float: none; display: flex; justify-content: center; align-items: center; width: 100%;">
						<label class="label_for_disk" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
						<input type="radio" id="disk" name="disk" value="` + diskPath + `" style="position: absolute; opacity: 0;">
						<img class="disk_logo_progress" height=50px src="../../resources/disk.png" style="margin: 0 auto; display: block;"></img>
						<p id="label_disk" class="disk_title" style="margin-top: 10px; text-align: center;">` + diskNameTrimmed + `</p>
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
var progressHistory = []; // Istoric pentru medie mobilă
var lastUpdateTime = null;

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
                // Reset variabile pentru următoarea instalare
                startTime = null;
                lastProgress = 0;
                progressHistory = [];
                lastUpdateTime = null;
                
                var errorMessage = progressText.replace("INSTALLATION FAILED: ", "");
                var prog = '<p align="center" class="setup-text" style="color: #ff0000;">Installation Failed!</p>';
                prog += '<p align="center" class="setup-text" style="color: #ff6666;"><b>Error:</b> ' + errorMessage + '</p>';
                prog += '<p align="center" class="setup-text">Please check <b>/home/liveuser/Desktop/install.log</b> for details.<br>You may need to restart the installer or check your disk.</p>';
                document.getElementById("disk_list").innerHTML = prog;
            }
            // Verifică dacă instalarea s-a terminat (cu sau fără warnings)
            else if (progressText.startsWith("Installation finished")) {
            	// Reset variabile pentru următoarea instalare
            	startTime = null;
            	lastProgress = 0;
            	progressHistory = [];
            	lastUpdateTime = null;
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
                // Calculează timpul estimat rămas cu o metodă mai precisă
                var timeValue = "";
                
                if (startTime !== null && progressPercent > 0 && progressPercent < 100) {
                    var currentTime = Date.now();
                    var elapsedTime = (currentTime - startTime) / 1000; // în secunde
                    
                    // Adaugă progresul curent în istoric (păstrăm ultimele 10 măsurători)
                    if (lastProgress !== progressPercent) {
                        progressHistory.push({
                            progress: progressPercent,
                            time: currentTime
                        });
                        
                        // Păstrează doar ultimele 10 măsurători
                        if (progressHistory.length > 10) {
                            progressHistory.shift();
                        }
                        
                        lastProgress = progressPercent;
                        lastUpdateTime = currentTime;
                    }
                    
                    // Nu calculează timpul prea devreme (minim 10% progres SAU minim 30 secunde)
                    var minProgress = 10;
                    var minElapsedTime = 30;
                    
                    if (progressPercent >= minProgress || elapsedTime >= minElapsedTime) {
                        // Metodă 1: Folosește viteza medie recentă (ultimele 3-5 măsurători)
                        if (progressHistory.length >= 3) {
                            var recentHistory = progressHistory.slice(-5); // Ultimele 5 măsurători
                            var firstPoint = recentHistory[0];
                            var lastPoint = recentHistory[recentHistory.length - 1];
                            
                            var recentProgress = lastPoint.progress - firstPoint.progress;
                            var recentTime = (lastPoint.time - firstPoint.time) / 1000; // în secunde
                            
                            if (recentProgress > 0 && recentTime > 0) {
                                // Viteza medie recentă (% per secundă)
                                var recentSpeed = recentProgress / recentTime;
                                
                                // Timp estimat rămas bazat pe viteza recentă
                                var remainingProgress = 100 - progressPercent;
                                var estimatedRemainingTime = remainingProgress / recentSpeed;
                                
                                // Limitează estimarea la valori rezonabile (max 2 ore)
                                if (estimatedRemainingTime > 0 && estimatedRemainingTime < 7200) {
                                    timeValue = formatTimeRemaining(Math.ceil(estimatedRemainingTime));
                                }
                            }
                        }
                        
                        // Dacă nu avem destule date pentru metoda recentă, folosim metoda clasică
                        // dar doar dacă avem cel puțin 15% progres pentru a fi mai precis
                        if (!timeValue && progressPercent >= 15) {
                            var progressDecimal = progressPercent / 100;
                            
                            if (progressDecimal > 0 && elapsedTime > 0) {
                                var totalEstimatedTime = elapsedTime / progressDecimal;
                                var remainingTime = totalEstimatedTime - elapsedTime;
                                
                                // Limitează estimarea la valori rezonabile
                                if (remainingTime > 0 && remainingTime < 7200) {
                                    timeValue = formatTimeRemaining(Math.ceil(remainingTime));
                                }
                            }
                        }
                    }
                }
                
                // Verifică dacă elementele există deja pentru a actualiza doar valoarea
                var timeValueElement = document.getElementById("time-value");
                var progressElement = document.getElementById("file");
                
                if (timeValueElement && progressElement) {
                    // Actualizează doar valoarea timpului și progress bar-ul
                    progressElement.value = progressText;
                    progressElement.textContent = progressText + "%";
                    if (timeValue) {
                        timeValueElement.textContent = timeValue;
                    } else {
                        timeValueElement.textContent = "Calculating...";
                    }
                } else {
                    // Creează totul pentru prima dată
                    var prog = `
                	<br>
                	<div style="width: 100%; max-width: 350px; margin: 0 auto;">
                		<progress id="file" value="` + progressText + `" max="100" style="width: 100%; height: 18px;"> ` + progressText + `% </progress>
                	</div>
                	<div id="time-remaining-container" style="width: 100%; max-width: 350px; margin: 10px auto 0 auto; min-height: 30px; display: flex; align-items: center; justify-content: center;">
                		<p class="setup-text" style="font-size: 0.9em; color: #888; margin: 0; text-align: center;">
                			<span style="display: inline-block; min-width: 250px; text-align: center;">Estimated time remaining: <b id="time-value">` + (timeValue || "Calculating...") + `</b></span>
                		</p>
                	</div>
                	`
                    document.getElementById("disk_list").innerHTML = disk + prog;
                }
            }
            });
        }, 1000);
}

// Funcție pentru a închide aplicația (aceeași ca butonul "Go to Live Environment")
function closeWindow() {
    if (typeof require !== 'undefined') {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('system-action', 'live-environment');
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
