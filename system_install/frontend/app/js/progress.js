var startTime = null,
  lastProgress = 0,
  progressHistory = [],
  lastUpdateTime = null;

function formatTimeRemaining(seconds) {
  if (seconds < 0) return i18n.get('progress.calculating');
  if (seconds < 60) return seconds + " second" + (seconds !== 1 ? "s" : "");
  var minutes = Math.floor(seconds / 60);
  var rem = Math.floor(seconds % 60);
  if (rem === 0) return minutes + " minute" + (minutes !== 1 ? "s" : "");
  return minutes + " minute" + (minutes !== 1 ? "s" : "") + " " + rem + " second" + (rem !== 1 ? "s" : "");
}

function print_disk() {
  var fs = require("fs");
  var { exec } = require('child_process');
  var disk = "";

  fs.readFile("/tmp/disk-to-install", function(error, data) {
    if (error) throw error;
    var diskPath = data.toString().trim();

    exec('list_disk count', function(err, numberOfDisks) {
      var count = parseInt(numberOfDisks);
      var checkDisk = function(index) {
        if (index > count) {
          var dit = document.getElementById("disk-install-text");
          if (dit) dit.textContent = i18n.get('disk.installTextPrefix') + ' "' + diskPath + '":';
          disk = '<li style="float:none;display:flex;justify-content:center;align-items:center;width:100%;"><label class="label_for_disk" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;"><input type="radio" id="disk" name="disk" value="' + diskPath + '" style="position:absolute;opacity:0;"><img class="disk_logo_progress" height=50px src="../resources/disk.png" style="margin:0 auto;display:block;"></img><p id="label_disk" class="disk_title" style="margin-top:10px;text-align:center;">' + diskPath + '</p></label></li>';
          startProgressInterval(disk);
          return;
        }
        exec("list_disk " + index, function(err, currentDiskPath) {
          if (currentDiskPath.trim() === diskPath) {
            exec("list_disk name " + index, function(err, diskName) {
              var dn = diskName.trim();
              var dit = document.getElementById("disk-install-text");
              if (dit) dit.textContent = i18n.get('disk.installTextPrefix') + ' "' + dn + '":';
              disk = '<li style="float:none;display:flex;justify-content:center;align-items:center;width:100%;"><label class="label_for_disk" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;"><input type="radio" id="disk" name="disk" value="' + diskPath + '" style="position:absolute;opacity:0;"><img class="disk_logo_progress" height=50px src="../resources/disk.png" style="margin:0 auto;display:block;"></img><p id="label_disk" class="disk_title" style="margin-top:10px;text-align:center;">' + dn + '</p></label></li>';
              startProgressInterval(disk);
            });
          } else { checkDisk(index + 1); }
        });
      };
      checkDisk(1);
    });
  });
}

function startProgressInterval(disk) {
  setInterval(function() {
    var fs = require("fs");
    fs.readFile("/tmp/progress", function(error, data) {
      if (error) throw error;
      var progressText = data.toString();
      var progressPercent = 0;
      try { progressPercent = parseFloat(progressText); } catch(e) { progressPercent = 0; }
      if (startTime === null && progressPercent > 0) startTime = Date.now();

      if (progressText.startsWith("INSTALLATION FAILED")) {
        startTime = null; lastProgress = 0; progressHistory = []; lastUpdateTime = null;
        var errorMessage = progressText.replace("INSTALLATION FAILED: ", "");
        var p = '<p align="center" class="setup-text" style="color:#ff0000;">' + i18n.get('progress.installFailed') + '</p>';
        p += '<p align="center" class="setup-text" style="color:#ff6666;"><b>' + i18n.get('progress.error') + '</b> ' + errorMessage + '</p>';
        p += '<p align="center" class="setup-text">' + i18n.get('progress.checkLog') + '</p>';
        document.getElementById("disk_list").innerHTML = p;
      } else if (progressText.startsWith("Installation finished")) {
        startTime = null; lastProgress = 0; progressHistory = []; lastUpdateTime = null;
        var p = '';
        if (progressText.includes("warnings")) {
          var wc = (progressText.match(/(\d+) warnings/) || ['','0'])[1];
          p = '<p align="center" class="setup-text" style="color:#ffaa00;">' + i18n.get('progress.finishedWarnings').replace('{count}', wc) + '</p>';
          p += '<p align="center" class="setup-text">' + i18n.get('progress.warningsDetail') + '</p>';
        } else {
          p = '<p align="center" class="setup-text" style="color:#00ff00;">' + i18n.get('progress.finishedSuccess') + '</p>';
          p += '<p align="center" class="setup-text">' + i18n.get('progress.finishedReboot') + '</p>';
        }
        document.getElementById("disk_list").innerHTML = p;
      } else {
        var timeValue = "";
        if (startTime !== null && progressPercent > 0 && progressPercent < 100) {
          var currentTime = Date.now();
          var elapsedTime = (currentTime - startTime) / 1000;
          if (lastProgress !== progressPercent) {
            progressHistory.push({ progress: progressPercent, time: currentTime });
            if (progressHistory.length > 10) progressHistory.shift();
            lastProgress = progressPercent; lastUpdateTime = currentTime;
          }
          if (progressPercent >= 10 || elapsedTime >= 30) {
            if (progressHistory.length >= 3) {
              var rh = progressHistory.slice(-5);
              var rp = rh[rh.length-1].progress - rh[0].progress;
              var rt = (rh[rh.length-1].time - rh[0].time) / 1000;
              if (rp > 0 && rt > 0) {
                var remaining = (100 - progressPercent) / (rp / rt);
                if (remaining > 0 && remaining < 7200) timeValue = formatTimeRemaining(Math.ceil(remaining));
              }
            }
            if (!timeValue && progressPercent >= 15) {
              var pd = progressPercent / 100;
              if (pd > 0 && elapsedTime > 0) {
                var rem = (elapsedTime / pd) - elapsedTime;
                if (rem > 0 && rem < 7200) timeValue = formatTimeRemaining(Math.ceil(rem));
              }
            }
          }
        }
        var tve = document.getElementById("time-value");
        var pe = document.getElementById("file");
        if (tve && pe) {
          pe.value = progressText; pe.textContent = progressText + "%";
          tve.textContent = timeValue || i18n.get('progress.calculating');
        } else {
          var p = '<li class="progress-block" style="float:none;display:flex;flex-direction:column;justify-content:center;align-items:center;width:100%;"><div class="progress-bar-wrapper" style="width:100%;max-width:350px;margin:0 auto;"><progress id="file" value="' + progressText + '" max="100" style="width:100%;height:18px;">' + progressText + '%</progress></div><div id="time-remaining-container" class="progress-text-under" style="width:100%;max-width:350px;margin:10px auto 0 auto;min-height:30px;display:flex;align-items:center;justify-content:center;"><p class="setup-text" style="font-size:0.9em;color:#888;margin:0;text-align:center;"><span style="display:inline-block;min-width:250px;text-align:center;">' + i18n.get('progress.estimatedTime') + ' <b id="time-value">' + (timeValue || i18n.get('progress.calculating')) + '</b></span></p></div></li>';
          document.getElementById("disk_list").innerHTML = disk + p;
        }
      }
    });
  }, 1000);
}

function closeWindow() {
  if (typeof require !== 'undefined') {
    var { ipcRenderer } = require('electron');
    ipcRenderer.send('system-action', 'live-environment');
  }
}
