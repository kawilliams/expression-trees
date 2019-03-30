/*compare.js*/
console.log("compare.js");

/*
 Interfaces with als-daily-tree.html and calls generateTree.js
 */

function showCompareHelp() {
    document.getElementById("help-compare").style.display = "block";
}
function hideCompareHelp() {
    document.getElementById("help-compare").style.display = "none";
}

function makeCodeArray(codefile) {
    var codeArray = [];
    code = [];
    d3.text(codefile, function (data) {
        codeArray = data.split('\n');
        cv = d3.select("#code-view");
        cv.selectAll("pre")
                .data(codeArray)
                .enter().append("pre")
                .attr("class", function (d, i) {
                    // if (d.includes("_explicit") && d.includes("define(")) { //file sensitive char const* const als_explicit
                    //     offset = i;
                    //     console.log("OFFSET", offset);
                    // }
                    return "line " + i;
                })
                .text(function (d, i) {
                    i = i+1;
                    if (!d && i<10) {
                        return " " + i + "| \n";
                    } else if (!d) {
                        return i + "| \n";
                    }
                    if (i < 10)
                        i = " " + i;
                    return i + "| " + d;
                })
                .style("font-family", "monospace")
                .style("margin", "2px 0px 0px 0px");

    });

}

function getYesterday() {
    var today = new Date();
    var dd = today.getDate() - 1; //get yesterday
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();

    if (dd === 0) {
        if ([9, 4, 6, 11].includes(mm)) {
            dd = 30;
        } else if (mm === 3) {
            dd = 28;
        } else if (mm === 1) {
            dd = 31;
            yyyy = yyyy - 1;
        } else {
            dd = 31;
        }
        mm = mm - 1;
    }
// Hardcoded dates for testing purposes
//    dd = 30;
//    mm = 1;
//    yyyy = 2019;

    if (dd < 10)
        dd = '0' + dd;
    if (mm < 10)
        mm = '0' + mm;

    var datestring = yyyy + "-" + mm + "-" + dd + "-als";

    return datestring;
}

function getCurrentTimeScheme() {

    var toggleswitch = document.getElementById("myCheck");
    var checkbox = document.getElementById("diffCheck");

    if (!toggleswitch.checked && checkbox.checked) {
        return "inclusiveDiffTime";
    } else if (!toggleswitch.checked && !checkbox.checked) {
        return "inclusiveTime";
    } else if (toggleswitch.checked && checkbox.checked) {
        return "exclusiveDiffTime";
    } else if (toggleswitch.checked && !checkbox.checked) {
        return "exclusiveTime";
    }
}

function showDiff() {
	console.log("showDiff");
    var checkbox = document.getElementById("diffCheck");
    var currentTime = getCurrentTimeScheme();
    var dAttribute = setCurrentColors(currentTime);

    svg.selectAll(".node").selectAll("path").transition()
            .style("stroke", function(d) {
                if (checkbox.checked && d._perfdata2 && d.executedDifferently) {
                    // If we're comparing runs, grey out lines that weren't executed differently
                    return '#e7298a'; // pink
                } else {
                    return 'black';
                }
            })
            .style("stroke-width", "4px")
            .style("fill", function (d) {
                var dAttribute = setCurrentColors(currentTime);
                //console.log("Recolor after toggle with ", dAttribute);
                if (d._perfdata) {
                    if (dAttribute === "inclusiveTime") {
                        // if (d._perfdata.inclusiveTime < 0)
                        //     return "magenta";
                        d.oldColor = currentColorTimeScale(d._perfdata.inclusiveTime);
                        return currentColorTimeScale(d._perfdata.inclusiveTime);
                    } else if (dAttribute === "exclusiveTime") {
                        // if (d._perfdata.exclusiveTime < 0)
                        //     return "magenta";
                        d.oldColor = currentColorTimeScale(d._perfdata.exclusiveTime);
                        return currentColorTimeScale(d._perfdata.exclusiveTime);
                    } else if (dAttribute === "inclusiveDiffTime") {
//                        if (d._perfdata.inclusiveDiffTime === 22)
//                            return "magenta";
                        d.oldColor = currentColorTimeScale(d._perfdata.inclusiveDiffTime);
                        return currentColorTimeScale(d._perfdata.inclusiveDiffTime);
                    } else if (dAttribute === "exclusiveDiffTime") {
//                        if (d._perfdata.exclusiveDiffTime === 22)
//                            return "magenta";
                        d.oldColor = currentColorTimeScale(d._perfdata.exclusiveDiffTime);
                        return currentColorTimeScale(d._perfdata.exclusiveDiffTime);
                    }
                }
                return "black";
            })
            .style("opacity", function(d){
                 if (dAttribute === "inclusiveDiffTime") {
                        if (d.infade) { console.log("fade"); return "0.5"; }
//                        if (d._perfdata.inclusiveDiffTime === 22) {
//                            console.log("reduce opacity, no diff time");
//                            return "0.5";
//                        }
                        return "1.0";

                    } else if (dAttribute === "exclusiveDiffTime") {
                        if (d.exfade) { return "0.5";}
//                        if (d._perfdata.exclusiveDiffTime === 22)
//                            return "0.5";
                        return "1";
                    }
                 return "1";
            });

    if (dAttribute === "inclusiveTime") {
        x.domain([0, greatestValIn]);
        xAxis.tickValues(domainValsIn);
        currentColorTimeScale = colorInTimeScale;
    } else if (dAttribute === "exclusiveTime") {
        x.domain([0, greatestValEx]);
        xAxis.tickValues(domainValsEx);
        currentColorTimeScale = colorExTimeScale;
    } else if (dAttribute === "inclusiveDiffTime") {
        x.domain([-greatestValInDiff, greatestValInDiff]);
        xAxis.tickValues(domainValsInDiff);
        currentColorTimeScale = colorInDiffTimeScale;
    } else if (dAttribute === "exclusiveDiffTime") {
        x.domain([-greatestValExDiff, greatestValExDiff]);
        xAxis.tickValues(domainValsExDiff);
        currentColorTimeScale = colorExDiffTimeScale;
    }
    d3.select(".x").transition().call(xAxis);

    var g = d3.select(".legend");
    g.select(".domain")
            .remove();

    g.selectAll("rect")
            .data(
            currentColorTimeScale.range().map(function (color) {
                var d = currentColorTimeScale.invertExtent(color);
                if (d[0] === null)
                    d[0] = x.domain()[0];
                if (d[1] === null)
                    d[1] = x.domain()[1];
                return d;
            }))
            .transition()
            .attr("x", function (d) {
                return x(d[0]);
            })
            .attr("width", function (d) {
                return x(d[1]) - x(d[0]);
            })
            .style("fill", function (d) {
                return currentColorTimeScale(d[0]);
                //return (timetype === "EXCLUSIVE") ? colorExTimeScale(d[0]) : colorInTimeScale(d[0]);
            });
    g.select(".legend-label")
            .attr("class", "legend-label")
            .transition()
            .text(function () {
                console.log("Legend timetype", dAttribute);
                if (currentTime === "inclusiveTime") {
                    return "Total inclusive time per primitive type (Run 1 shown)";
                } else if (currentTime === "exclusiveTime") {
                    return "Total exclusive time per primitive type (Run 1 shown)";
                } else if (currentTime === "inclusiveDiffTime") {
                    return "Inclusive time difference (run1 - run2). Purple: 1st run was slower."
                } else if (currentTime === "exclusiveDiffTime") {
                    return "Exclusive time difference (run1 - run2). Green: 1st run was slower."
                }

            });
    drawList(svg.selectAll('.node').data());
}

function retrieveData() {
    console.log("retrieveData katy");
    //var yesterday = getYesterday();
    csvfile1 = document.getElementById("perfdata1").innerHTML;
    textfile1 = document.getElementById("treeformat1").innerHTML;
    csvfile2 = document.getElementById("perfdata2").innerHTML;
    textfile2 = document.getElementById("treeformat2").innerHTML;

    codefile= document.getElementById("codefile").innerHTML;
    codeData = makeCodeArray(codefile);

//    codeArray = document.getElementById('main').innerHTML.split("\n");
//    document.getElementById('main').innerHTML = "";
/*

    // Determine if datadate1 is yesterday or a selected date
    datadate1 = document.querySelector("#selectedDate1").value + "-als";

    //datadate1 = "2019-01-30-als";

    if ((datadate1 === "-als") || (datadate1 === "")) {
        datadate1 = yesterday;
    }
    textfile1 = "data/" + datadate1 + "-tree.txt";
    csvfile1 = "data/" + datadate1 + "-performance.csv";

    // Determine if datadate2 is used (comparing)
    datadate2 = document.querySelector("#selectedDate2").value + "-als";


    //datadate2 = "2019-01-07-als";
    if ((datadate2 === "-als") || (datadate2 === "")){
        textfile2 = "";
        csvfile2 = "";
    } else {
        textfile2 = "data/" + datadate2 + "-tree.txt";
        csvfile2 = "data/" + datadate2 + "-performance.csv";
    }
    var legend = document.getElementById("legend");
    legend.empty();
    */

    console.log("Files1:", textfile1, csvfile1);
    console.log("Files2:", textfile2, csvfile2);
    callEverything(textfile1, csvfile1, textfile2, csvfile2);

}
