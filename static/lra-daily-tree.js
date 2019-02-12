/* 
Interfaces with lra-daily-tree.html and calls generateTree.js
 */
console.log("lra-daily-tree.js");

var today = new Date();
var dd = today.getDate()-1; //get yesterday
var mm = today.getMonth()+1;
var yyyy = today.getFullYear();

if (dd < 10) dd = '0' + dd;
if (mm < 10) mm = '0' + mm;

var datestring = yyyy + "-" + mm + "-" + dd + "-lra";
console.log("today's datestring", datestring);
codefile = "data/lra.physl";
callEverything(datestring);





