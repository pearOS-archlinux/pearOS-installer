function print_disk() {
var zi=`
<li>
<label class="label_for_disk">
<input type="radio" id="disk" name="disk" value="/dev/test">
<img class="disk_logo" height=50px src="../../resources/disk.png"></img>
<p id="label_disk" class="disk_title">/dev/test</p>
</label>
</li>
<br><progress id="file" value="32" max="100"> 32% </progress>
`;

document.getElementById("disk_list").innerHTML =zi;
var p = document.getElementsByTagName("p");
}
