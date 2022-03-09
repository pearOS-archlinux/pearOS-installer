function list_zones() {
//vars:
const { exec } = require('child_process');
count = 0;
i = 1 ;
var z=``;

exec('find /usr/share/zoneinfo/posix -type f -or -type l | sort | cut -c27- | wc -l', (err, zone_count) => {
var sZones = `${zone_count}`
zones_count = parseInt(sZones);
console.log("There are " + zones_count + " available time-zones");

while (i < (zones_count+1)) {
	exec("find /usr/share/zoneinfo/posix -type f -or -type l | sort | cut -c27- | sed -n "+ i  + "p", (err, stdout) => {
        	var zi=`<option>${stdout}</option>`;
		i++;
        	z += zi;
        	document.getElementById("time_zones_list").innerHTML =z;
        	})
        i++;
        }
	})
}
function select_language() {
  var e = document.getElementById("ddlViewBy");
  var strUser = e.options[e.selectedIndex].text;
  const fs = require('fs');
  if (strUser == "Chinese (Simplified)") {
      fs.writeFileSync('/tmp/locale', 'zh_CN.UTF-8');
    window.location.href='lg/zn_CN/page_keymap.html';
  } else if (strUser == "English (Australia)") {
      fs.writeFileSync('/tmp/locale', 'en_AU.UTF-8');
      window.location.href='lg/en_AU/page_examining.html';
    } else if (strUser == "English (Canada)") {
        fs.writeFileSync('/tmp/locale', 'en_CA.UTF-8');
      window.location.href='lg/en_CA/page_examining.html';
      } else if (strUser == "English (United States)") {
          fs.writeFileSync('/tmp/locale', 'en_USS.UTF-8');
        window.location.href='lg/en_US/page_keymap.html';
        } else if (strUser == "English (United Kingdom)") {
            fs.writeFileSync('/tmp/locale', 'en_GB.UTF-8');
            window.location.href='lg/en_GB/page_examining.html';
          } else if (strUser == "French (France)") {
              fs.writeFileSync('/tmp/locale', 'fr_FR.UTF-8');
              window.location.href='lg/fr_FR/page_examining.html';
            } else if (strUser == "German (Germany)") {
                fs.writeFileSync('/tmp/locale', 'de_DE.UTF-8');
                window.location.href='lg/de_DE/page_examining.html';
              } else if (strUser == "Italian (Italy)") {
                  fs.writeFileSync('/tmp/locale', 'it_IT.UTF-8');
                  window.location.href='lg/it_IT/page_examining.html';
                }  else if (strUser == "Japanese (Japan)") {
                    fs.writeFileSync('/tmp/locale', 'ja_JP.UTF-8');
                     window.location.href='lg/ja_JP/page_examining.html';
                  }  else if (strUser == "Portuguese (Brazil)") {
                      fs.writeFileSync('/tmp/locale', 'pt_BR.UTF-8');
                         window.location.href='lg/pt_BR/page_examining.html';
                    } else if (strUser == "Portuguese (Portugal)") {
                        fs.writeFileSync('/tmp/locale', 'pt_PT.UTF-8');
                           window.location.href='lg/pt_PT/page_examining.html';
                      } else if (strUser == "Russian (Russia)") {
                          fs.writeFileSync('/tmp/locale', 'ru_RU.UTF-8');
                             window.location.href='lg/ru_RU/page_examining.html';
                        } else if (strUser == "Romanian (Romania)") {
                            fs.writeFileSync('/tmp/locale', 'ro_RO.UTF-8');
                               window.location.href='lg/ro_RO/page_examining.html';
                          } else if (strUser == "Spanish (Mexico)") {
                              fs.writeFileSync('/tmp/locale', 'es_MX.UTF-8');
                                 window.location.href='lg/es_MX/page_examining.html';
                            } else if (strUser == "Spanish (Spain)") {
                                fs.writeFileSync('/tmp/locale', 'es_ES.UTF-8');
                                   window.location.href='lg/es_ES/page_examining.html';
                              } else if (strUser == "Swedish (Sweden)") {
                                  fs.writeFileSync('/tmp/locale', 'sv_SE.UTF-8');
                                     window.location.href='lg/sv_SE/page_examining.html';
                                }
}

function select_keymap() {
  var e = document.getElementById("keymapList");
  var strUser = e.options[e.selectedIndex].text;
  const fs = require('fs');
  if (strUser == "French") {
    fs.writeFileSync('/tmp/keymap', 'fr');
  } else if (strUser == "German") {
      fs.writeFileSync('/tmp/keymap', 'de');
    } else if (strUser == "Greek") {
      fs.writeFileSync('/tmp/keymap', 'gr');
      } else if (strUser == "Hungarian") {
        fs.writeFileSync('/tmp/keymap', 'hu');
        } else if (strUser == "Italian") {
            fs.writeFileSync('/tmp/keymap', 'it');
          } else if (strUser == "Polish") {
              fs.writeFileSync('/tmp/keymap', 'pl');
            } else if (strUser == "Russian") {
                fs.writeFileSync('/tmp/keymap', 'ru');
              } else if (strUser == "Spanish") {
                  fs.writeFileSync('/tmp/keymap', 'es');
                }  else if (strUser == "United States") {
                     fs.writeFileSync('/tmp/keymap', 'us');
                  }
  window.location.href='page_timezone.html';
}

function select_timezone() {
  var e = document.getElementById("time_zones_list");
  var strUser = e.options[e.selectedIndex].text;
  const fs = require('fs');
  fs.writeFileSync('/tmp/timezone', '' + strUser);
  window.location.href='page_user.html';
}

var password = document.getElementById("password")
  , confirm_password = document.getElementById("confirm_password");

function validatePassword(){
  if(password.value != confirm_password.value) {
    confirm_password.setCustomValidity("Passwords Don't Match");
  } else {
    confirm_password.setCustomValidity('');
  }
}


function save_user(){
	var fullName = document.getElementById("full_name").value;
	var userName = document.getElementById("account_name").value;
	var password = document.getElementById("password").value;
	var password_confirm = document.getElementById("password_confirm").value;
	const fs = require('fs');

    if(password != '') { check_match();}
    if(fullName == '') { alert("FullName cannot be empty"); } else { fs.writeFileSync('/tmp/fullname', `'` + fullName + `'`); };
    if(userName == '') { alert("username cannot be empty"); } else { fs.writeFileSync('/tmp/username', '' + userName); };
    if(userName == '') { alert("Password cannot be empty"); }
}

function check_match(){
  var fullName = document.getElementById("full_name").value;
  var userName = document.getElementById("account_name").value;
  var password = document.getElementById("password").value;
  var password_confirm = document.getElementById("password_confirm").value;

  if( password != password_confirm) {
    alert("Passwords are not matching!");
  } else {
      const fs = require('fs');
      if(fullName == '') { alert("FullName cannot be empty"); } else { fs.writeFileSync('/tmp/fullname', `'` + fullName + `'`); };
      if(userName == '') { alert("username cannot be empty"); } else { fs.writeFileSync('/tmp/username', '' + userName); };
      fs.writeFileSync('/tmp/password', '' + password);
      window.location.href='page_agreement.html';
  }
}
