function load_profile_pictures() {
  const container = document.getElementById('profile-pictures-circle');
  if (!container) {
    console.log('Container profile-pictures-circle not found');
    return;
  }

  const fs = require('fs');
  const path = require('path');
  
  // Încearcă mai multe căi posibile pentru a găsi directorul profiles
  let profilesPath;
  
  try {
    // Metoda 1: __dirname (din app/js -> app/resources/profiles)
    profilesPath = path.join(__dirname, '..', 'resources', 'profiles');
    console.log('Trying path 1:', profilesPath);
    
    // Metoda 2: process.cwd() (directorul de lucru al aplicației)
    if (!fs.existsSync(profilesPath)) {
      profilesPath = path.join(process.cwd(), 'app', 'resources', 'profiles');
      console.log('Trying path 2:', profilesPath);
    }
    
    // Metoda 3: Din locația paginii HTML
    if (!fs.existsSync(profilesPath)) {
      try {
        const url = window.location.href;
        const urlPath = decodeURIComponent(url.replace(/^file:\/\//, ''));
        const urlParts = urlPath.split(path.sep).filter(p => p);
        const appIndex = urlParts.findIndex(part => part === 'app');
        if (appIndex !== -1) {
          const basePath = urlParts.slice(0, appIndex + 1).join(path.sep);
          profilesPath = path.join(basePath, 'resources', 'profiles');
          console.log('Trying path 3:', profilesPath);
        }
      } catch (e) {
        console.error('Error calculating path from URL:', e);
      }
    }
    
    console.log('Final path:', profilesPath);
    
    // Dacă directorul nu există, nu face nimic
    if (!fs.existsSync(profilesPath)) {
      console.log('Profile pictures directory not found at:', profilesPath);
      return;
    }
    
    const files = fs.readdirSync(profilesPath);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'];
    
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
    
    console.log('Found', imageFiles.length, 'image files');
    
    if (imageFiles.length === 0) {
      console.log('No image files found in profile pictures directory');
      return;
    }
    
    container.innerHTML = '';
    
    imageFiles.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'profile-picture-item';
      item.dataset.imagePath = path.join(profilesPath, file);
      item.dataset.imageName = file;
      
      const img = document.createElement('img');
      // Folosește calea relativă pentru a încărca imaginea
      // Din app/lg/ro_RO/page_user.html, calea către resources este ../../resources/
      img.src = `../../resources/profiles/${file}`;
      img.alt = file;
      img.onerror = function() {
        console.error('Error loading image:', img.src);
        this.style.display = 'none';
        item.innerHTML = '<span style="font-size: 12px; color: #999;">?</span>';
      };
      
      item.appendChild(img);
      
      item.addEventListener('click', function() {
        // Elimină selecția de la toate imaginile
        document.querySelectorAll('.profile-picture-item').forEach(el => {
          el.classList.remove('selected');
        });
        
        // Adaugă selecția la imaginea curentă
        this.classList.add('selected');
        
        // Salvează selecția
        const fs = require('fs');
        const { exec } = require('child_process');
        const imagePath = this.dataset.imagePath;
        fs.writeFileSync('/tmp/profile_picture', imagePath);
        
        // Execută comenzile sudo cp imediat
        const cmd1 = `sudo cp "${imagePath}" /usr/share/sddm/themes/pearOS/faces/.face.icon`;
        const cmd2 = `sudo cp "${imagePath}" /usr/share/sddm/themes/pearOS-dark/faces/.face.icon`;
        
        exec(cmd1, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error copying to pearOS theme: ${error.message}`);
          } else {
            console.log('Image copied to pearOS theme successfully');
          }
        });
        
        exec(cmd2, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error copying to pearOS-dark theme: ${error.message}`);
          } else {
            console.log('Image copied to pearOS-dark theme successfully');
          }
        });
        
        // Verifică dacă toate datele sunt completate
        checkFormValidity();
      });
      
      container.appendChild(item);
    });
  } catch (error) {
    console.error('Error loading profile pictures:', error);
  }
}

function check_passwords_match() {
  const password = document.getElementById("password");
  const password_confirm = document.getElementById("password_confirm");
  const passwordCheck = document.getElementById("password_check");
  
  if (password && password_confirm && passwordCheck) {
    const checkMatch = () => {
      const pass1 = password.value;
      const pass2 = password_confirm.value;
      
      if (pass1 === '' && pass2 === '') {
        passwordCheck.innerHTML = '';
        passwordCheck.className = 'password-check';
        return;
      }
      
      if (pass1 === pass2 && pass1 !== '') {
        passwordCheck.innerHTML = '<span class="password-check-icon">✓</span> Passwords match';
        passwordCheck.className = 'password-check match';
      } else if (pass2 !== '') {
        passwordCheck.innerHTML = '<span class="password-check-icon">✗</span> Passwords do not match';
        passwordCheck.className = 'password-check mismatch';
      } else {
        passwordCheck.innerHTML = '';
        passwordCheck.className = 'password-check';
      }
    };
    
    password.removeEventListener('input', checkMatch);
    password_confirm.removeEventListener('input', checkMatch);
    
    password.addEventListener('input', checkMatch);
    password_confirm.addEventListener('input', checkMatch);
  }
}

let profilePicturesLoaded = false;

// Funcție pentru a verifica dacă toate datele sunt completate
function checkFormValidity() {
  const fullName = document.getElementById('full_name');
  const accountName = document.getElementById('account_name');
  const hostname = document.getElementById('hostname');
  const password = document.getElementById('password');
  const passwordConfirm = document.getElementById('password_confirm');
  const continueBtn = document.getElementById('move-forward-btn');
  const selectedPicture = document.querySelector('.profile-picture-item.selected');
  
  if (!continueBtn) return;
  
  // Verifică dacă toate câmpurile sunt completate
  const allFieldsFilled = 
    fullName && fullName.value.trim() !== '' &&
    accountName && accountName.value.trim() !== '' &&
    hostname && hostname.value.trim() !== '' &&
    password && password.value !== '' &&
    passwordConfirm && passwordConfirm.value !== '' &&
    password.value === passwordConfirm.value &&
    selectedPicture !== null;
  
  // Activează/dezactivează butonul
  continueBtn.disabled = !allFieldsFilled;
  if (allFieldsFilled) {
    continueBtn.style.opacity = '1';
    continueBtn.style.cursor = 'pointer';
  } else {
    continueBtn.style.opacity = '0.5';
    continueBtn.style.cursor = 'not-allowed';
  }
}

function ensureProfilePicturesContainer() {
  // Verifică dacă containerul există deja
  let container = document.getElementById('profile-pictures-circle');
  
  if (!container) {
    // Creează containerul dacă nu există
    const createUser = document.getElementById('create_user');
    if (createUser) {
      const profileContainer = document.createElement('div');
      profileContainer.className = 'profile-picture-container';
      profileContainer.innerHTML = '<div id="profile-pictures-circle" class="profile-pictures-circle"></div>';
      
      // Inserează containerul înainte de formular (primul copil)
      const form = createUser.querySelector('form');
      if (form) {
        createUser.insertBefore(profileContainer, form);
      } else {
        // Dacă nu există formular, adaugă la început
        createUser.insertBefore(profileContainer, createUser.firstChild);
      }
      
      container = document.getElementById('profile-pictures-circle');
    }
  }
  
  return container;
}

function initProfilePictures() {
  if (profilePicturesLoaded) {
    return;
  }
  
  // Asigură-te că containerul există
  const container = ensureProfilePicturesContainer();
  
  if (container) {
    profilePicturesLoaded = true;
    load_profile_pictures();
  } else {
    // Dacă create_user nu există încă, așteaptă puțin
    setTimeout(function() {
      const container2 = ensureProfilePicturesContainer();
      if (container2 && !profilePicturesLoaded) {
        profilePicturesLoaded = true;
        load_profile_pictures();
      }
    }, 500);
  }
}

// Funcție pentru a verifica dacă toate datele sunt completate
function checkFormValidity() {
  const fullName = document.getElementById('full_name');
  const accountName = document.getElementById('account_name');
  const hostname = document.getElementById('hostname');
  const password = document.getElementById('password');
  const passwordConfirm = document.getElementById('password_confirm');
  const continueBtn = document.getElementById('move-forward-btn');
  const selectedPicture = document.querySelector('.profile-picture-item.selected');
  
  if (!continueBtn) return;
  
  // Verifică dacă toate câmpurile sunt completate
  const allFieldsFilled = 
    fullName && fullName.value.trim() !== '' &&
    accountName && accountName.value.trim() !== '' &&
    hostname && hostname.value.trim() !== '' &&
    password && password.value !== '' &&
    passwordConfirm && passwordConfirm.value !== '' &&
    password.value === passwordConfirm.value &&
    selectedPicture !== null;
  
  // Activează/dezactivează butonul
  continueBtn.disabled = !allFieldsFilled;
  if (allFieldsFilled) {
    continueBtn.style.opacity = '1';
    continueBtn.style.cursor = 'pointer';
  } else {
    continueBtn.style.opacity = '0.5';
    continueBtn.style.cursor = 'not-allowed';
  }
}

// Așteaptă ca totul să fie complet încărcat
window.addEventListener('load', function() {
  setTimeout(check_passwords_match, 100);
  setTimeout(initProfilePictures, 300);
  
  // Adaugă event listeners pentru toate câmpurile DOAR pe pagina de user
  setTimeout(function() {
    const createUser = document.getElementById('create_user');
    if (!createUser) return; // Nu suntem pe pagina de user
    
    const fullName = document.getElementById('full_name');
    const accountName = document.getElementById('account_name');
    const hostname = document.getElementById('hostname');
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('password_confirm');
    
    if (fullName) fullName.addEventListener('input', checkFormValidity);
    if (accountName) accountName.addEventListener('input', checkFormValidity);
    if (hostname) hostname.addEventListener('input', checkFormValidity);
    if (password) password.addEventListener('input', checkFormValidity);
    if (passwordConfirm) passwordConfirm.addEventListener('input', checkFormValidity);
    
    // Verifică inițial
    checkFormValidity();
  }, 500);
});

// De asemenea, încercă când DOM-ul este gata
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initProfilePictures, 200);
  });
} else {
  // DOM-ul este deja gata
  setTimeout(initProfilePictures, 300);
}

function list_zones() {
  const { exec } = require('child_process');
  const timezoneList = document.getElementById("time_zones_list");
  
  if (!timezoneList) {
    console.error("Timezone list element not found");
    return;
  }
  
  timezoneList.innerHTML = '';
  
  exec('find /usr/share/zoneinfo/posix -type f -or -type l | sort | cut -c27-', (err, stdout, stderr) => {
    if (err) {
      console.error("Error getting timezones:", err);
      timezoneList.innerHTML = '<option>Error loading timezones</option>';
      return;
    }
    
    const timezones = stdout.trim().split('\n').filter(tz => tz.length > 0);
    console.log("Found " + timezones.length + " timezones");
    
    timezones.forEach((timezone, index) => {
      const option = document.createElement('option');
      option.textContent = timezone;
      timezoneList.appendChild(option);
      
      if (index === 0) {
        timezoneList.disabled = false;
      }
    });
    
    console.log("Timezone list populated successfully");
  });
}
function select_language() {
  var e = document.getElementById("ddlViewBy");
  if (e.options[e.selectedIndex] === undefined) { alert('You must choose one Language from the list'); } else {
  var strUser = e.options[e.selectedIndex].text;
  const fs = require('fs');
  if (strUser == "Chinese (Simplified)") {
      fs.writeFileSync('/tmp/locale', 'zh_CN.UTF-8');
    window.location.href='lg/zn_CN/page_keymap.html';
  } else if (strUser == "English (Australia)") {
      fs.writeFileSync('/tmp/locale', 'en_AU.UTF-8');
      window.location.href='lg/en_AU/page_keymap.html';
    } else if (strUser == "English (Canada)") {
        fs.writeFileSync('/tmp/locale', 'en_CA.UTF-8');
      window.location.href='lg/en_CA/page_keymap.html';
      } else if (strUser == "English (United States)") {
          fs.writeFileSync('/tmp/locale', 'en_USS.UTF-8');
        window.location.href='lg/en_US/page_keymap.html';
        } else if (strUser == "English (United Kingdom)") {
            fs.writeFileSync('/tmp/locale', 'en_GB.UTF-8');
            window.location.href='lg/en_GB/page_keymap.html';
          } else if (strUser == "French (France)") {
              fs.writeFileSync('/tmp/locale', 'fr_FR.UTF-8');
              window.location.href='lg/fr_FR/page_keymap.html';
            } else if (strUser == "German (Germany)") {
                fs.writeFileSync('/tmp/locale', 'de_DE.UTF-8');
                window.location.href='lg/de_DE/page_keymap.html';
              } else if (strUser == "Italian (Italy)") {
                  fs.writeFileSync('/tmp/locale', 'it_IT.UTF-8');
                  window.location.href='lg/it_IT/page_keymap.html';
                }  else if (strUser == "Japanese (Japan)") {
                    fs.writeFileSync('/tmp/locale', 'ja_JP.UTF-8');
                     window.location.href='lg/ja_JP/page_keymap.html';
                  }  else if (strUser == "Portuguese (Brazil)") {
                      fs.writeFileSync('/tmp/locale', 'pt_BR.UTF-8');
                         window.location.href='lg/pt_BR/page_keymap.html';
                    } else if (strUser == "Portuguese (Portugal)") {
                        fs.writeFileSync('/tmp/locale', 'pt_PT.UTF-8');
                           window.location.href='lg/pt_PT/page_keymap.html';
                      } else if (strUser == "Russian (Russia)") {
                          fs.writeFileSync('/tmp/locale', 'ru_RU.UTF-8');
                             window.location.href='lg/ru_RU/page_keymap.html';
                        } else if (strUser == "Czech (Czech Republic)") {
                            fs.writeFileSync('/tmp/locale', 'cs_CZ.UTF-8');
                            window.location.href='lg/cs/page_keymap.html';
                          } else if (strUser == "Romanian (Romania)") {
                            fs.writeFileSync('/tmp/locale', 'ro_RO.UTF-8');
                              window.location.href='lg/ro_RO/page_keymap.html';
                          } else if (strUser == "Spanish (Mexico)") {
                              fs.writeFileSync('/tmp/locale', 'es_MX.UTF-8');
                                 window.location.href='lg/es_MX/page_keymap.html';
                            } else if (strUser == "Spanish (Spain)") {
                                fs.writeFileSync('/tmp/locale', 'es_ES.UTF-8');
                                   window.location.href='lg/es_ES/page_keymap.html';
                              } else if (strUser == "Swedish (Sweden)") {
                                  fs.writeFileSync('/tmp/locale', 'sv_SE.UTF-8');
                                     window.location.href='lg/sv_SE/page_keymap.html';
                                }
                                
                                 else if (strUser == '') {
                                    alert('You must select one language from the list');
                                }
  }
}

function select_keymap() {
  var e = document.getElementById("keymapList");
  
  if (e.options[e.selectedIndex] === undefined) {
    alert('You must choose one Keyboard Layout from the list');
    return;
  }
  
  var strUser = e.options[e.selectedIndex].text;
  const fs = require('fs');
  const { exec } = require('child_process');
  
  // Map display names to layout codes
  const layoutMap = {
    "French": "fr",
    "German": "de",
    "Greek": "gr",
    "Hungarian": "hu",
    "Italian": "it",
    "Polish": "pl",
    "Russian": "ru",
    "Spanish": "es",
    "US": "us",
    "United States": "us"
  };
  
  const layout = layoutMap[strUser];
  
  if (layout) {
    // Write to file for reference
    fs.writeFileSync('/tmp/keymap', layout);
    
    // Apply the layout temporarily using setxkbmap
    exec(`setxkbmap ${layout}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error applying keyboard layout: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        alert('Failed to apply keyboard layout. Check if setxkbmap is installed.');
        return;
      }
    
      console.log(`Keyboard layout applied successfully: ${layout}`);
      // Navigate regardless of success/failure
      window.location.href = 'page_timezone.html';
    });
  } else {
    alert('Unknown keyboard layout selected');
  }
}


function select_timezone() {
  var e = document.getElementById("time_zones_list");
   if (e.options[e.selectedIndex] === undefined) { alert('You must choose one Time Zone from the list'); } else {
       var strUser = e.options[e.selectedIndex].text;
       const fs = require('fs');
        fs.writeFileSync('/tmp/timezone', '' + strUser);
        window.location.href='page_user.html';
   }
}

function save_user(){
	fullName = document.getElementById("full_name").value;
	var userName = document.getElementById("account_name").value;
	var hostname = document.getElementById("hostname").value;
	var password = document.getElementById("password").value;
	var password_confirm = document.getElementById("password_confirm").value;
	const regex = /^[a-z_]([a-z0-9_-]{0,31}|[a-z0-9_-]{0,30}\$)$/g
	const checkgex = userName.match(regex);
	const fs = require('fs');

    if(fullName == '') { alert("FullName cannot be empty"); } else { fs.writeFileSync('/tmp/fullname', `'` + fullName + `'`); };
    if(userName == '') { alert("Username cannot be empty"); } else { console.log("Username not empty. Continuing!");};
    if(hostname == '') { alert("Hostname cannot be empty"); } else { console.log("Hostname not empty. Continuing!");};
    if(password == '') { alert("Password cannot be empty"); } else if(password != '') { check_match();}
    
    // Salvează imaginea de profil selectată dacă există
    const selectedPicture = document.querySelector('.profile-picture-item.selected');
    if (selectedPicture) {
      fs.writeFileSync('/tmp/profile_picture', selectedPicture.dataset.imagePath);
    }
}

function check_match(){
  fullName = document.getElementById("full_name").value;
  var userName = document.getElementById("account_name").value;
  var hostname = document.getElementById("hostname").value;
  var password = document.getElementById("password").value;
  var password_confirm = document.getElementById("password_confirm").value;
  const regex = /^[a-z_]([a-z0-9_-]{0,31}|[a-z0-9_-]{0,30}\$)$/g
  const checkgex = userName.match(regex);

  if( password != password_confirm) {
    alert("Passwords are not matching!");
  } else {
	checkchars();
    }
}

function checkchars() {
	var userName = document.getElementById("account_name").value;
	var hostname = document.getElementById("hostname").value;
	const regex = /^[a-z_]([a-z0-9_-]{0,31}|[a-z0-9_-]{0,30}\$)$/g
	const checkgex = userName.match(regex);

	var password = document.getElementById("password").value;

	if(checkgex == null) {
  	alert("The username you inputed contains illegal characters. The username needs to check the following:\n - start with a lowercase (i.e.: alex)\n - does not start with a number (i.e.: 8alex8)\n - does not start with a character (i.e. -_alex_-)");
	} else {
	const fs = require('fs');
      	if(fullName == '') { alert("FullName cannot be empty"); } else { fs.writeFileSync('/tmp/fullname', `'` + fullName + `'`); };
	if(userName == '' || checkgex == null) { alert("username cannot be empty"); } else { fs.writeFileSync('/tmp/username', '' + userName); };
	if(hostname == '') { hostname = 'pearOS-machine'; }
	fs.writeFileSync('/tmp/hostname', '' + hostname);
	fs.writeFileSync('/tmp/password', '' + password);
	window.location.href='page_agreement.html';
  }
}

function display_settings() {
  const fs = require('fs');
  
  try {
    const keymap = fs.readFileSync('/tmp/keymap', 'utf-8').trim();
    const locale = fs.readFileSync('/tmp/locale', 'utf-8').trim();
    const timezone = fs.readFileSync('/tmp/timezone', 'utf-8').trim();
    const fullname = fs.readFileSync('/tmp/fullname', 'utf-8').trim().replace(/^'|'$/g, '');
    const username = fs.readFileSync('/tmp/username', 'utf-8').trim();
    const hostname = fs.readFileSync('/tmp/hostname', 'utf-8').trim();
    
    console.log('');
    console.log('==========================================');
    console.log('  Selected Configuration Settings');
    console.log('==========================================');
    console.log('Keyboard Layout:     ' + keymap);
    console.log('Locale:              ' + locale);
    console.log('Timezone:            ' + timezone);
    console.log('Full Name:           ' + fullname);
    console.log('Username:            ' + username);
    console.log('Hostname:            ' + hostname);
    console.log('==========================================');
    console.log('');
  } catch (err) {
    console.error('Error reading settings:', err);
  }
}

function commit(){
  var fs = require('fs');

    fs.readFile('/tmp/fullname', 'utf-8', (err, fn_data) => { var fullname = fn_data; fs.readFile('/tmp/username', 'utf-8', (err, usr_data) => { var username = usr_data; fs.readFile('/tmp/password', 'utf-8', (err, passwd_data) => { var password = passwd_data; fs.readFile('/tmp/keymap', 'utf-8', (err, kmap_data) => { var keymap = kmap_data; fs.readFile('/tmp/locale', 'utf-8', (err, locale_data) => { var locale = locale_data; fs.readFile('/tmp/timezone', 'utf-8', (err, tzone_data) => { var timezone = tzone_data; fs.readFile('/tmp/hostname', 'utf-8', (err, hostname_data) => { var hostname = hostname_data; const { exec } = require('child_process'); const execSync = require("child_process").execSync;
        
        // Display selected settings from frontend before execution
        console.log('');
        console.log('==========================================');
        console.log('  Selected Configuration Settings');
        console.log('==========================================');
        console.log('Keyboard Layout:     ' + keymap);
        console.log('Locale:              ' + locale);
        console.log('Timezone:            ' + timezone);
        console.log('Full Name:           ' + fullname);
        console.log('Username:            ' + username);
        console.log('Hostname:            ' + hostname);
        console.log('==========================================');
        console.log('');
        console.log('Starting post-installation setup...');
        console.log('');

        try {
          execSync(`sudo post_setup '${keymap.replace(/'/g, "'\\''")}' '${locale.replace(/'/g, "'\\''")}' '${timezone.replace(/'/g, "'\\''")}' '${password.replace(/'/g, "'\\''")}' '${fullname.replace(/'/g, "'\\''")}' '${username.replace(/'/g, "'\\''")}' '${hostname.replace(/'/g, "'\\''")}' `, { maxBuffer: 10 * 1024 * 1024 });
          window.exit();
        } catch (e) {
          var errMsg = '';
          try {
            errMsg = fs.readFileSync('/tmp/post-install-error', 'utf8').trim();
          } catch (_) {}
          if (!errMsg) {
            errMsg = (e.message || String(e)).trim();
          }
          var tab = document.querySelector('.tab.active');
          if (tab) {
            var errDiv = document.createElement('div');
            errDiv.id = 'post-install-error';
            errDiv.style.cssText = 'color: #ff6666; margin: 20px; padding: 15px; background: rgba(0,0,0,0.4); border-radius: 8px; white-space: pre-wrap; text-align: left; max-width: 90%;';
            errDiv.innerHTML = '<strong>Post-install failed</strong>\n\n' + (errMsg || 'Unknown error.') + '\n\nCheck /home/default/Desktop/post-install.log for details.';
            tab.appendChild(errDiv);
          } else {
            alert('Post-install failed: ' + (errMsg || e.message));
          }
        }
    }) })})})});}); });
}
