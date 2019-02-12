/* 
Interfaces with als-daily-tree.html and calls generateTree.js
 */
console.log("als-daily-tree.js");

function makeCodeArray(codefile) {
    var codeArray = [];
    code = [];
    d3.text(codefile, function(data){
        codeArray = data.split('\n');
        cv = d3.select("#code-view");
        cv.selectAll("pre")
                .data(codeArray)
                .enter().append("pre")
                .attr("class", function (d, i) {
                    if (d.includes("char const* const als_explicit")) { //file sensitive
                        offset = i;
                    }
                    return "line " + i;
                })
                .text(function (d) {
                    if (!d) {
                        return "\n";
                    }
                    return d;
                })
                .style("font-family", "monospace")
                .style("margin", "2px 0px 0px 0px");
        
    });  
    
}

var today = new Date();
var dd = today.getDate()-1; //get yesterday
var mm = today.getMonth()+1;
var yyyy = today.getFullYear();

console.log("Get yesterday", mm, dd, yyyy);
if (dd === 0) {
    if ([9, 4, 6, 11].includes(mm)) {
        dd = 30;
    } 
    else if (mm === 3) {
        dd = 28;
    } else if (mm === 1) {
        dd = 31;
        yyyy = yyyy - 1;
    } 
    else {
        dd = 31;
    }
    mm = mm - 1;
}
// Hardcoded dates for testing purposes
//dd = 30;
//mm = 1;
//yyyy = 2019;

if (dd < 10) dd = '0' + dd;
if (mm < 10) mm = '0' + mm;

var datestring = yyyy + "-" + mm + "-" + dd + "-als";
console.log("today's datestring", datestring);
codefile = "data/als.physl";
codeData = makeCodeArray(codefile);

callEverything(datestring);





