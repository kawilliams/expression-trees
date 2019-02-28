/* generateTree.js*/
console.log("generateTree");

timetype = "INCLUSIVE";

function callEverything(textfile1, csvfile1, textfile2, csvfile2) {
    console.log("callEverything");
    var currentTime = getCurrentTimeScheme();
    // var currentTime = ""
    console.log("currentTime", currentTime);

    if (textfile1 && csvfile1 && textfile2 && csvfile2) {
        d3.queue()
                .defer(d3.text, textfile1)//"data/2018-09-25-tree.txt")
                .defer(d3.csv, csvfile1)//"data/2018-09-25-performance.csv")
                .defer(d3.text, textfile2)//"data/2018-09-25-tree.txt")
                .defer(d3.csv, csvfile2)//"data/2018-09-25-performance.csv")
                .await(analyze);

    } else if (textfile1 && csvfile1) {
        d3.queue()
                .defer(d3.text, textfile1)//"data/2018-09-25-tree.txt")
                .defer(d3.csv, csvfile1)//"data/2018-09-25-performance.csv")
                .await(analyze);
    } else {

        alert("Data for " + textfile1 + ", " + csvfile1 + ", " + textfile2 + " , " + csvfile2 + " does not exist.");
    }
    document.getElementById("shapekey").style.visibility = "visible";
    document.getElementById("legend").style.visibility = "visible";
    document.getElementById("code-view").style.visibility = "visible";
    document.getElementById("tree-vis").style.visibility = "visible";
    document.getElementById("collapsible").style.visibility = "visible";
}

function analyze(error, treeformat, perfdata, treeformat2, perfdata2) {
    console.log("analyze");

    //if (error) throw error;

    if (error)
        alert("Data for " + treeformat + ", " + perfdata + ", " + treeformat2 + " , " + perfdata2 + " does not exist.");

    // Assigns parent, children, height, depth
    treeformatOrig = treeformat.trim();
    treeformatOrig = treeformatOrig.replace(/(\r\n|\n|\r)/gm,"");
    treeformat = parseNewick(treeformatOrig);

    root = d3.hierarchy(treeformat, function (d) {
        return d.branchset;
    });

    fullRoot = d3.hierarchy(treeformat, function (d) {
        return d.branchset;
    });

    // Count maxmimum depth of tree and maximum width
    count = 1; //count the root
    widestLevel = 0;
    countNodes(root);
    count1 = count;

    if (treeformat2) {
        treeformat2Orig = treeformat2.trim();
        treeformat2Orig = treeformat2Orig.replace(/(\r\n|\n|\r)/gm,"");
        treeformat2 = parseNewick(treeformat2Orig);
        root2 = d3.hierarchy(treeformat2, function (d) {
            return d.branchset;
        });
        //Check that second tree has the same format
        count = 1;
        countNodes(root2);
        if (count1 !== count) {
            console.log("ERROR: TREES DO NOT HAVE THE SAME NUMBER OF NODES");
        }
        //console.log(treeformatOrig.length, treeformat2Orig.length);
        if (treeformat.length !== treeformat2.length) {
            console.log("ERROR: TREE FORMAT FILES ARE DIFFERENT LENGTHS");
        }
        for (var i = 0; i < treeformatOrig.length; i++) {
//            if (treeformatOrig[i] !== treeformat2Orig[i]) {
//                console.log("ERROR: CHARACTERS OF TREE FILES DO NOT MATCH", treeformatOrig[i], treeformat2Orig[i]);
//            }
        }
    }


    //if (count > 30) root.children.forEach(flatten); 
    root.x0 = height / 2;
    root.y0 = 0;

    // Collecting the performance times
    domainTimesIn = [],
            domainTimesEx = [],
            domainTimesInDiff = [],
            domainTimesExDiff = [];
    prim_inst = [];
    perfdata.map(function (d) {
        //        var avgTime = (+d.time)/(+d.count); //kttime
        //        if (avgTime > 0) {
        //            domainTimes.push(avgTime); //katy check times * 1.e-9);
        //        }

        //Only add time and primitive if they exist in the tree 
        // (perfdata gets all functions, not just lra)
        console.log(d);
        if (treeformatOrig.includes(d.primitive_instance)) { 
            domainTimesIn.push(+d.time); //kttime
            prim_inst.push(d.primitive_instance);
        }
    });


    colorsIn = ["#f2f0f7", "#cbc9e2", "#9e9ac8", "#756bb1", "#54278f"];  //purple
    colorsEx = ["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"]; //green
    colorsInDiff = ["#e66101", "#fdb863", "#f7f7f7", "#b2abd2", "#5e3c99"]; //diverging purple orange
    colorsExDiff = ["#d01c8b", "#f1b6da", "#f7f7f7", "#b8e186", "#4dac26"]; //diverging green pink

    currentColors = colorsIn;
    currentDomainTimes = domainTimesIn;
    currentColorTimeScale = d3.scaleQuantize() //went with log scale
            .domain([0, d3.extent(currentDomainTimes)[1]]) //domainTimes //kttime [0,10088524656]
            .range(currentColors);

    greatestVal = currentColorTimeScale.invertExtent(currentColors[currentColors.length - 1])[1];
    //gotta get the domain values for each color
    currentColorDomainVals = [currentColorTimeScale.invertExtent(currentColors[0])[0]];
    for (var i = 0; i < currentColors.length; i++) {
        currentColorDomainVals.push(currentColorTimeScale.invertExtent(currentColors[i])[1]);
    }



    //update(root, fullRoot, perfdata, perfdata2, false);
    //console.log("greatestVal", greatestVal);
    /*
     */
    var currentTime = getCurrentTimeScheme();
    console.log("currentTime", currentTime);
    update(root, fullRoot, perfdata, perfdata2, false);
}


nodes2 = [];
function flatten(d) {

    function recurse(d) {
        if (d.children) {
            closeMe = 0;
            for (var i = 0; i < d.children.length; i++) {
                if (getLineNum(d.data.name) === getLineNum(d.children[i].data.name)) {
                    closeMe += 1;
                }
            }

            if (closeMe === d.children.length) {
                nodes2.push(d);
                d.bigParent = true;
                d.open = 1;
            }
            d.children.forEach(recurse);
        }
    }
    recurse(d);
    closeThese(nodes2);
    return;
}

function closeThese(nodeList) {
    for (var i = nodeList.length - 1; i > -1; i--) {
        nodeList[i]._children = nodeList[i].children;
        nodeList[i].children = null;
    }
    return;
}

function shortenBranches(d) {
    // If children of parent are all on same line, 
    // then only parent is displayed (children = null);
    if (d.branchset) {
        closeMe = 0;
        for (var i = 0; i < d.branchset.length; i++) {
            if (getLineNum(d.name) === getLineNum(d.branchset[i].name)) {
                closeMe += 1;
            }
        }
        if (closeMe === d.branchset.length) {
            d.wholebranchset = d.branchset;
            d.branchset = null;
            d.children = null;
        }
    }
    return d.branchset;

}

// Count the number of nodes at each level
function countNodes(node) {
    if (node.children) {
        if (node.children.length > widestLevel)
            widestLevel = node.children.length;
        for (var i = 0; i < node.children.length; i++) {
            if (node.children[i].children) {
                count++;
                countNodes(node.children[i]);
            } else {
                count++;
            }
        }
    }
}

// function getCurrentTimeScheme(date1, date2, timetype) {
//     date1 = "2019-01-05-als";
//     date2 = "2019-01-30-als";
    
    
//     if (date1 && date2) {
//         // We have both so take the difference
//         if (timetype === "INCLUSIVE") {
//             return "inclusiveDiffTime";
//         } else {
//             return "exclusiveDiffTime";
//         }
//     } else {
//         if (timetype === "INCLUSIVE") {
//             return "inclusiveTime";
//         } else {
//             return "exclusiveTime";
//         }
//     }
// }

function setCurrentColors(currentTime) {
    //console.log("setCurrentColors() with ", currentTime);

    // We have both so take the difference
    if (currentTime === "inclusiveDiffTime") {
        //console.log("Diff INCLUSIVE time colors");
        currentColors = colorsInDiff;
        currentDomainTimes = domainTimesInDiff;
        currentColorTimeScale = d3.scaleQuantize() //went with log scale
                .domain([-greatestValInDiff, greatestValInDiff]) //domainTimes //kttime [0,10088524656]
                .range(colorsInDiff);
        //gotta get the domain values for each color
        currentColorDomainVals = [currentColorTimeScale.invertExtent(colorsInDiff[0])[0]];
        //greatestVal = currentColorTimeScale.invertExtent(colorsInDiff[colorsInDiff.length - 1])[1];
        return "inclusiveDiffTime";
    } else if (currentTime === "exclusiveDiffTime") {
        //console.log("Diff exclusive time colors");
        currentColors = colorsExDiff;
        currentDomainTimes = domainTimesExDiff;
        currentColorTimeScale = d3.scaleQuantize() //went with log scale
                .domain([-greatestValExDiff, greatestValExDiff]) //domainTimes //kttime [0,10088524656]
                .range(colorsExDiff);
        //gotta get the domain values for each color
        currentColorDomainVals = [currentColorTimeScale.invertExtent(colorsExDiff[0])[0]];
        //greatestVal = greatestValExDiff; //currentColorTimeScale.invertExtent(colorsExDiff[colorsExDiff.length - 1])[1];
        return "exclusiveDiffTime";
    } else if (currentTime === "inclusiveTime") {
        currentColors = colorsIn;
        currentDomainTimes = domainTimesIn;
        currentColorTimeScale = d3.scaleQuantize() //went with log scale
                .domain(d3.extent(domainTimesIn)) //domainTimes //kttime [0,10088524656]
                .range(colorsIn);
        //gotta get the domain values for each color
        currentColorDomainVals = [currentColorTimeScale.invertExtent(colorsIn[0])[0]];
        //greatestVal = currentColorTimeScale.invertExtent(colorsIn[colorsIn.length - 1])[1];
        return "inclusiveTime";
    } else {
        currentColors = colorsEx;
        currentDomainTimes = domainTimesEx;
        currentColorTimeScale = d3.scaleQuantize() //went with log scale
                .domain(d3.extent(domainTimesEx)) //domainTimes //kttime [0,10088524656]
                .range(colorsEx);
        //gotta get the domain values for each color
        currentColorDomainVals = [currentColorTimeScale.invertExtent(colorsEx[0])[0]];
        //greatestVal = currentColorTimeScale.invertExtent(colorsEx[colorsEx.length - 1])[1];
        return "exclusiveTime";
    }

}


offset = 0;
function update(source, fullRoot, perfdata, perfdata2, clicked) {
    console.log("update");

    // Assigns the x and y position for the nodes
    var tree = treemap(root);
    var fullTree = treemap(fullRoot);
    var fullTreeCoords = {};
    fullTree.descendants().forEach(function (d) {
        fullTreeCoords[d.data.name] = [d.x, d.y];
    });

    tree.descendants().forEach(function modifyXY(d) {
        var fullTreeKeys = Object.keys(fullTreeCoords);
        if (fullTreeKeys.includes(d.data.name)) {
            d.x = fullTreeCoords[d.data.name][0];
            d.y = fullTreeCoords[d.data.name][1];
            d.bigToolTip = true;
        } else {
            d.bigToolTip = false;
        }

    });

    // Compute the new tree layout.
    var nodes = tree.descendants(),
            links = tree.descendants().slice(1);
    var maxDepth = 0;
    nodes.forEach(function (d) {
        if (d.depth > maxDepth) {
            maxDepth = d.depth;
        }
    });

    var depthY = svg.attr("width") / maxDepth;
    var depthX = svg.attr("height") / widestLevel;
    
    //Prevent tree from spreading too much or too little
    var spreadFactor = 2 + (2 / depthX);
  

    nodes.forEach(function (d) {
        d.x = d.x * spreadFactor; //really y's, adjust to spread leaves
        //d.y = d.depth * depthY;
        d.y = d.y * 1; // depth, adjust to widen tree
    });

    // ****************** Nodes section ***************************
    i = 0;
    // Update the nodes...
    var node = svg.selectAll('g.node')
            .data(nodes, function (d) {

                var nodename = d.data.name;
                // Change time to time-per-instance //katy
                if (prim_inst.indexOf(nodename) >= 0) {
                    //Necessary for tooltip
                    node_perfdata = perfdata[prim_inst.indexOf(nodename)];
                    node_perfdata.eval_direct = +node_perfdata.eval_direct; //how the node was run (async/sync/unk)
                    node_perfdata.avg_time = +(node_perfdata.time / node_perfdata.count); // * 1.e-9; //katy nanos are SMALL
                    if (+node_perfdata.count === 0)
                        node_perfdata.avg_time = node_perfdata.time;
                    if (!node_perfdata.avg_time)
                        node_perfdata.avg_time = 0;

                    //Necessary for tree-vis
                    d._perfdata = perfdata[prim_inst.indexOf(nodename)];
                    d._perfdata.save_display_name = d._perfdata.display_name;

                    if (perfdata2) {
                        node_perfdata2 = perfdata2[prim_inst.indexOf(nodename)];
                        if (node_perfdata2) {
                            node_perfdata2.eval_direct = +node_perfdata2.eval_direct;
                            node_perfdata2.avg_time = +(node_perfdata2.time / node_perfdata2.count);
                            if (+node_perfdata2.count === 0)
                                node_perfdata2.avg_time = node_perfdata2.time;
                            if (!node_perfdata2.avg_time)
                                node_perfdata2.avg_time = 0;

                            d._perfdata2 = perfdata2[prim_inst.indexOf(nodename)];
                            d._perfdata2.save_display_name = d._perfdata2.display_name;

                        } else {
                            // node doesn't exist in the other data set
                           
                        }
                    }
                }
                return d.id || (d.id = ++i);
            });
    //Add exclusive time after all children nodes have been created
    node.data(nodes, function (d) {
        d.childrenTime = 0;
        d.childrenTime2 = 0;
        if (d.children) {
            for (child of d.children) {
                //d.childrenTime += +(child._perfdata.time); //sum children
                if (child._perfdata.time > d.childrenTime) {
                    d.childrenTime = child._perfdata.time;
                }
                if (child._perfdata2) {
                    if (child._perfdata2.time > d.childrenTime2) {
                        d.childrenTime2 = child._perfdata2.time;
                    }
                }
            }
        }
        if (d._perfdata) {
            d._perfdata.exclusiveTime = d._perfdata.time - d.childrenTime;
            d._perfdata.inclusiveTime = +d._perfdata.time;

            domainTimesEx.push(d._perfdata.exclusiveTime);
            domainTimesIn.push(d._perfdata.inclusiveTime);
        }
        if (d._perfdata2) {
            d._perfdata2.exclusiveTime = d._perfdata2.time - d.childrenTime2;
            d._perfdata2.inclusiveTime = +d._perfdata2.time;
        }

        if (d._perfdata && d._perfdata2) {

            if (d._perfdata.inclusiveTime && d._perfdata2.inclusiveTime) {
                d._perfdata.inclusiveDiffTime = d._perfdata.inclusiveTime - d._perfdata2.inclusiveTime;
                d.infade = false;
            } else {
                //d._perfdata.inclusiveDiffTime = 22; //Katy no diff time
                d.infade = true;
            }

            if (d._perfdata.exclusiveTime && d._perfdata2.exclusiveTime) {
                d._perfdata.exclusiveDiffTime = d._perfdata.exclusiveTime - d._perfdata2.exclusiveTime;
                d.exfade = false;
            } else {
                //d._perfdata.exclusiveDiffTime = 22;
                d.exfade = true;
            }
            
            if (d._perfdata.eval_direct !== d._perfdata2.eval_direct) {
                d.executedDifferently = true;
            } else {
                d.executedDifferently = false;
            }
            domainTimesInDiff.push(d._perfdata.inclusiveDiffTime);
            domainTimesExDiff.push(d._perfdata.exclusiveDiffTime);
        }
        else {
            // The node doesn't exist in both trees
        }
    });

    greatestValEx = d3.extent(domainTimesEx)[1];
    greatestValIn = d3.extent(domainTimesIn)[1];
    greatestValInDiff = Math.max(Math.abs(d3.extent(domainTimesInDiff)[0]), Math.abs(d3.extent(domainTimesInDiff)[1]));
    greatestValExDiff = Math.max(Math.abs(d3.extent(domainTimesExDiff)[0]), Math.abs(d3.extent(domainTimesExDiff)[1]));
    
    //console.log("in", greatestValIn, " ex", greatestValEx, " inDiff", greatestValInDiff, " exDiff", greatestValExDiff);


    colorExTimeScale = d3.scaleQuantize() //went with log scale
            .domain([0, d3.extent(domainTimesEx)[1]]) //domainTimes //kttime issue
            .range(colorsEx);
    //gotta get the domain values for each color
    domainValsEx = [colorExTimeScale.invertExtent(colorsEx[0])[0]];
    greatestValEx = colorExTimeScale.invertExtent(colorsEx[colorsEx.length - 1])[1];
    for (var i = 0; i < colorsEx.length; i++) {
        domainValsEx.push(colorExTimeScale.invertExtent(colorsEx[i])[1]);
    }

    colorInTimeScale = d3.scaleQuantize()
            .domain(d3.extent(domainTimesIn))
            .range(colorsIn);
    //gotta get the domain values for each color
    domainValsIn = [colorInTimeScale.invertExtent(colorsIn[0])[0]];
    greatestValIn = colorInTimeScale.invertExtent(colorsIn[colorsIn.length - 1])[1];
    for (var i = 0; i < colorsIn.length; i++) {
        domainValsIn.push(colorInTimeScale.invertExtent(colorsIn[i])[1]);
    }

    colorExDiffTimeScale = d3.scaleQuantize()
            .domain([-greatestValExDiff, greatestValExDiff])
            .range(colorsExDiff);
    //gotta get the domain values for each color
    domainValsExDiff = [colorExDiffTimeScale.invertExtent(colorsExDiff[0])[0]];
    greatestValExDiff = colorExDiffTimeScale.invertExtent(colorsExDiff[colorsExDiff.length - 1])[1];
    for (var i = 0; i < colorsExDiff.length; i++) {
        domainValsExDiff.push(colorExDiffTimeScale.invertExtent(colorsExDiff[i])[1]);
    }

    colorInDiffTimeScale = d3.scaleQuantize() //went with log scale
            .domain([-greatestValInDiff, greatestValInDiff]) //domainTimes 
            .range(colorsInDiff);
    //gotta get the domain values for each color
    domainValsInDiff = [-greatestValInDiff];
    for (var i = 0; i < colorsInDiff.length; i++) {
        domainValsInDiff.push(colorInDiffTimeScale.invertExtent(colorsInDiff[i])[1]);
    }
    

    // Enter any new modes at the parent's previous position.
    var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr('id', function (d) {
                d.isGroup = true;
                return d.id;
            })
            .attr("transform", function (d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click)
            .on("mouseenter", function (d) {
                if (d.x < 120) { //magic number re tooltip size
                    tool_tip_south.show(d);
                } else {
                    tool_tip.show(d);
                }
                showNodeCode(d);
            })
            .on("mouseout", function (d) {
                tool_tip.hide(d);
                tool_tip_south.hide(d);

                hideNodeCode(d);
            });



    // Determine what color scale to use
    var currentTime = getCurrentTimeScheme();
    dAttribute = setCurrentColors(currentTime);
    console.log("Color the paths with ", dAttribute);

    var symbol = d3.symbol().size([200]);
    prevNodeNum = -1;
    nodeEnter
            .append("path")
            .attr("class", "node plain-circle")
            .attr("d", symbol.type(function (d) {
                //            closeLineChildren(d); //katy line close
                if (d.bigParent) {
                    return d3.symbolTriangle;
                }
                return d3.symbolCircle;
            }))
            .attr('transform', "rotate(-90)")
            .attr("stroke-dasharray", function (d) { //stroke solid/dashed by direct or not
                if (d._perfdata) {
                    if (d._perfdata.eval_direct === 1) {
                        return "3, 3";
                    } else if (d._perfdata.eval_direct === -1) {
                        return "3,1";
                    } else {
                        return "0";
                    }
                }
                return "0";
            })
            .style("stroke", function(d) {
                if (d.executedDifferently) return "red";
                return "black";
            })
            .style("stroke-width", function(d){
                if (d.executedDifferently) return "2px";
                return "1px";    
            })
            .style("fill", function (d) { //katy
                if (d._perfdata) {
                    if (dAttribute === "inclusiveTime") {
                        if (d._perfdata.inclusiveTime < 0)
                            return "magenta";
                        d.oldColor = currentColorTimeScale(d._perfdata.inclusiveTime);
                        return currentColorTimeScale(d._perfdata.inclusiveTime);
                    } else if (dAttribute === "exclusiveTime") {
                        if (d._perfdata.exclusiveTime < 0)
                            return "magenta";
                        d.oldColor = currentColorTimeScale(d._perfdata.exclusiveTime);
                        return currentColorTimeScale(d._perfdata.exclusiveTime);
                    } else if (dAttribute === "inclusiveDiffTime") {
                        if (d.infade) { return "black";}
//                        if (d._perfdata.inclusiveDiffTime === 22)
//                            return "magenta";
                        
                        d.oldColor = currentColorTimeScale(d._perfdata.inclusiveDiffTime);
                        return currentColorTimeScale(d._perfdata.inclusiveDiffTime);

                    } else if (dAttribute === "exclusiveDiffTime") {
                        if (d.exfade) return "black";
//                        if (d._perfdata.exclusiveDiffTime === 22)
//                            return "magenta";
                        d.oldColor = currentColorTimeScale(d._perfdata.exclusiveDiffTime);
                        return currentColorTimeScale(d._perfdata.exclusiveDiffTime);
                    }
                } else {
                    return "black";
                }

            })
            .style("opacity", function(d){
                 if (dAttribute === "inclusiveDiffTime") {
                        if (d.infade) return "0.5";
//                        if (d._perfdata.inclusiveDiffTime === 22) {
//                            console.log("reduce opacity, no diff time");
//                            return "0.5";
//                        }
                        return "1.0";

                    } else if (dAttribute === "exclusiveDiffTime") {
                        if (d.exfade) return "0.5";
//                        if (d._perfdata.exclusiveDiffTime === 22)
//                            return "0.5";
                        return "1";
                    }     
                 return "1";
            })
            .on("mouseover", function (d) {
                //recolor previously-highlighted line
                if (lineSelected)
                    d3.select(lineSelected).style("background-color", "#eff3f8");
                // Determine what color scale to use
                var currentTime = getCurrentTimeScheme();
                var dAttribute = setCurrentColors(currentTime);
                //console.log("On mouseover, color with ", dAttribute);
                // recolor any previously-highlighted nodes
                d3.selectAll(".node")
//                        .filter(function (d) {
//                    if (d.id === prevNodeNum) {
//                        console.log("prevNodeNum", prevNodeNum);
//                        return false;
//                    }
//                })
                        .select("path").style("fill", function (d) {
                    if (d._perfdata) {
                        if (dAttribute === "inclusiveTime") {
                            if (d._perfdata.inclusiveTime < 0)
                                return "magenta";
                            d.oldColor = currentColorTimeScale(d._perfdata.inclusiveTime);
                            return currentColorTimeScale(d._perfdata.inclusiveTime);
                        } else if (dAttribute === "exclusiveTime") {
                            if (d._perfdata.exclusiveTime < 0) {
                                return "magenta";
                            }
                            d.oldColor = currentColorTimeScale(d._perfdata.exclusiveTime);
                            return currentColorTimeScale(d._perfdata.exclusiveTime);
                        } else if (dAttribute === "inclusiveDiffTime") {
//                            if (d._perfdata.inclusiveDiffTime === 22)
//                                return "magenta";
                            d.oldColor = currentColorTimeScale(d._perfdata.inclusiveDiffTime);
                            return currentColorTimeScale(d._perfdata.inclusiveDiffTime);
                        } else if (dAttribute === "exclusiveDiffTime") {
//                            if (d._perfdata.exclusiveDiffTime === 22)
//                                return "magenta";
                            d.oldColor = currentColorTimeScale(d._perfdata.exclusiveDiffTime);
                            return currentColorTimeScale(d._perfdata.exclusiveDiffTime);
                        }
                    }
                    return "black";
                });

                // Color the selected node yellow
                prevNodeNum = d.id;
                d.oldColor = d3.select(this).style("fill");
                d3.select(this).style("fill", "yellow");

                // Color related nodes of variables & functions (arguments too?)
                var currName = "";
                if (d._perfdata) {
                    currName = getImportantTypeName(d._perfdata);
                }
                svg.selectAll(".hl_line").remove();

                // Only draw lines & color nodes if currName is useful for linking
                if (currName !== "") {
                    hl_edge_data = [];
                    startx = d.y;
                    starty = d.x;
                    hl_edge_data.push({x: startx, y: starty});
                    hl_nodes = d3.selectAll(".node").selectAll("path").filter(function (d) {
                        var nodeName = "";
                        if (d._perfdata) {
                            nodeName = getImportantTypeName(d._perfdata);
                            if (nodeName === currName) {
                                edge_data = {x: d.y, y: d.x};
                                hl_edge_data.push(edge_data);
                                hl_edge_data.push({x: startx, y: starty});
                                return true;
                            }
                        }
                    });
                    hl_nodes.style("fill", function (d) {
                        d.oldColor = d3.select(this).style("fill");
                        return "yellow";
                    });

                    //console.log("Number of ", currName, hl_edge_data.length);

                    // define the line
                    var hl_line = d3.line()
                            .x(function (d) {
                                return d.x;
                            })
                            .y(function (d) {
                                return d.y;
                            });

                    // Add the valueline path.
                    svg.append("path")
                            .data([hl_edge_data])
                            .attr("class", "hl_line")
                            .style("stroke", "red")
                            .style("fill", "none")
                            .attr("d", hl_line);
                }


                showNodeCode(d); //show code view
            })
            .on("mouseout", function (d) {
                var currName = "";
                if (d._perfdata) {
                    currName = getImportantTypeName(d._perfdata);
                }
               var currentTime = getCurrentTimeScheme();
               var dAttribute = setCurrentColors(currentTime);
                //console.log("On mouseout, color with ", dAttribute);
                d3.selectAll(".node").selectAll("path")
//                        .filter(function (d) {
//                    var nodeName = "";
//                    if (d._perfdata)
//                        nodeName = getImportantTypeName(d._perfdata);
//
//                    if (nodeName === currName)
//                        return true;
//
//                })
                        .style("fill", function (d) {
                            if (d.id === prevNodeNum)
                                return "yellow";
                            if (d._perfdata) {
                                if (dAttribute === "inclusiveTime") {
                                    if (d._perfdata.inclusiveTime < 0)
                                        return "magenta";
                                    d.oldColor = currentColorTimeScale(d._perfdata.inclusiveTime);
                                    return currentColorTimeScale(d._perfdata.inclusiveTime);
                                } else if (dAttribute === "exclusiveTime") {
                                    if (d._perfdata.exclusiveTime < 0)
                                        return "magenta";
                                    d.oldColor = currentColorTimeScale(d._perfdata.exclusiveTime);
                                    return currentColorTimeScale(d._perfdata.exclusiveTime);
                                } else if (dAttribute === "inclusiveDiffTime") {
//                                    if (d._perfdata.inclusiveDiffTime === 22)
//                                        return "magenta";
                                    d.oldColor = currentColorTimeScale(d._perfdata.inclusiveDiffTime);
                                    return currentColorTimeScale(d._perfdata.inclusiveDiffTime);
                                } else if (dAttribute === "exclusiveDiffTime") {
//                                    if (d._perfdata.exclusiveDiffTime === 22)
//                                        return "magenta";
                                    d.oldColor = currentColorTimeScale(d._perfdata.exclusiveDiffTime);
                                    return currentColorTimeScale(d._perfdata.exclusiveDiffTime);
                                } else {
                                    return "black";
                                }
                            }
                            return "black";
                        });
                d3.selectAll(".hl-edges").remove();

                hideNodeCode(d);

            });

    // Add labels for the nodes
    nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", function (d) {
                return 13;
            })
            .attr("y", function (d) {
                return d.children || d._children ? -7 : 0;
            })
            .attr("text-anchor", function (d) {
                return "start";
            })
            .text(function (d) {
                if (!d.children) {
                    return d._perfdata.display_name;
                } else {
                    return "";
                }
            });
    lines = d3.selectAll(".line");
    lineSelected = "";
    prevLineNum = -1;
    lineNodeX = 0;
    lineNodeY = 0;
    lines.on("mouseover", function (d) {
        //recolor previously-highlighted line
        if (lineSelected)
            d3.select(lineSelected).style("background-color", "#eff3f8");

        // recolor any previously-highlighted nodes
        d3.selectAll(".node")
//            .filter(function (d) {
//            if ((getLineNum(d.data.name) === prevLineNum) ||
//                    (d.id === prevNodeNum)) {
//                //console.log("I'm from the previous line", prevLineNum);
//                return true;
//            }
//        })
                .select("path").style("fill", function (d) {
            //console.log("Recolor any previously highlighted nodes", d.oldColor);
            var currentTime = getCurrentTimeScheme();
            var dAttribute = setCurrentColors(currentTime);
            //console.log("On mouseover of a code line, color with ", dAttribute);
            if (d._perfdata) {
                if (dAttribute === "inclusiveTime") {
                    if (d._perfdata.inclusiveTime < 0)
                        return "magenta";
                    d.oldColor = currentColorTimeScale(d._perfdata.inclusiveTime);
                    return currentColorTimeScale(d._perfdata.inclusiveTime);
                } else if ((dAttribute === "exclusiveTime")) {
                    if (d._perfdata.exclusiveTime < 0)
                        return "magenta";
                    d.oldColor = currentColorTimeScale(d._perfdata.exclusiveTime);
                    return currentColorTimeScale(d._perfdata.exclusiveTime);
                } else if ((dAttribute === "inclusiveDiffTime")) {
//                    if (d._perfdata.inclusiveDiffTime === 22)
//                        return "magenta";
                    d.oldColor = currentColorTimeScale(d._perfdata.inclusiveDiffTime);
                    return currentColorTimeScale(d._perfdata.inclusiveDiffTime);
                } else if ((dAttribute === "exclusiveDiffTime")) {
//                    if (d._perfdata.exclusiveDiffTime === 22)
//                        return "magenta";
                    d.oldColor = currentColorTimeScale(d._perfdata.exclusiveDiffTime);
                    return currentColorTimeScale(d._perfdata.exclusiveDiffTime);
                }
            }
            return "black"; //d.oldColor;
        });

        d3.select(this).style("background-color", "yellow");
        lineSelected = this;
        currLineNum = parseInt(d3.select(this).attr("class").split(" ")[1]) - offset + 1;


        //Find corresponding node
        d3.selectAll(".node").filter(function (d) {
            if (getLineNum(d.data.name) === currLineNum) {
                prevLineNum = currLineNum;
                return true;
            }
        }).select("path").style("fill", function (d) {
            lineNodeX = d.x;
            lineNodeY = d.y;
            d.oldColor = d3.select(this).style("fill");
            nodeSelected = d3.select(this);
            nodeSelected.oldColor = nodeSelected.style("fill");
            prevNodeNum = d.id;
            return "yellow";
        });
    })
            .on("click", function () {
                //Scroll to node
                //            var elem = document.getElementById("main-svg");
                //            elem.scrollTop = lineNodeX;
                //            console.log("elem scrolltop", elem.scrollTop, lineNodeX);
                //Expand node if possible
            });

    //Remove existing legend
    d3.selectAll(".legend").remove();

    var currentTime = getCurrentTimeScheme();
    var dAttribute = setCurrentColors(currentTime);
    console.log("Color the legend with ", dAttribute);

    currentDomain = [0, 0];
    if (dAttribute === "inclusiveTime") {
        currentDomain = [0, greatestValIn];
        currentColorTimeScale = colorInTimeScale;
    } else if (dAttribute === "exclusiveTime") {
        console.log("USING THIS DOMAIN ex [0", greatestValEx);
        currentDomain = [0, greatestValEx];
        currentColorTimeScale = colorExTimeScale;
    } else if (dAttribute === "inclusiveDiffTime") {
        console.log("USING THIS DOMAIN inDiff [", -greatestValInDiff, greatestValInDiff, "]");
        currentDomain = [-greatestValInDiff, greatestValInDiff];
        currentColorTimeScale = colorInDiffTimeScale;
    } else if (dAttribute === "exclusiveDiffTime") {
        console.log("USING THIS DOMAIN exDiff [", -greatestValExDiff, greatestValExDiff, "]");
        currentDomain = [-greatestValExDiff, greatestValExDiff];
        currentColorTimeScale = colorExDiffTimeScale;
    }

    console.log("Current Domain: ", currentDomain, "current colors", currentColors, "\n\t",
        currentColorTimeScale.invertExtent("#d01c8b"));
    currentColorDomainVals = [currentColorTimeScale.invertExtent(currentColors[0])[0]];
    for (var i = 0; i < currentColors.length; i++) {
        currentColorDomainVals.push(currentColorTimeScale.invertExtent(currentColors[i])[1]);
    }
    console.log("Current color domain vals", currentColorDomainVals);
    x = d3.scaleLinear()
            .domain(currentDomain)
            .range([0, 300]);

    xAxis = d3.axisBottom()
            .scale(x)
            .tickSize(13)
            .tickValues(currentColorDomainVals)
            .tickFormat(function (d) {
                return prettyprintTime(d);
            }); // === 0.5 ? formatPercent(d) : formatNumber(100 * d); });


    var legendDim = {width: 525, height: 43};
    var g = d3.select("#legend").append("svg")
            .attr("class", "legend")
            .attr("width", legendDim.width)
            .attr("height", legendDim.height)
            .append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(200,18)")
            .call(xAxis);

    g.select(".domain")
            .remove();


//    dAttribute = setCurrentColors(date1, date2, timetype);

    g.selectAll("rect")
            .data(currentColorTimeScale.range().map(function (color) {
                var d = currentColorTimeScale.invertExtent(color);
                if (d[0] == null)
                    d[0] = x.domain()[0];
                if (d[1] == null)
                    d[1] = x.domain()[1];
                return d;
            }))
            .enter().insert("rect", ".tick")
            .attr("height", 8)
            .attr("x", function (d) {
                return x(d[0]);
            })
            .attr("width", function (d) {
                return x(d[1]) - x(d[0]);
            })
            .attr("fill", function (d) {
                var dAttribute = setCurrentColors(currentTime);
                console.log("Color legend rectangles with ", dAttribute);
                return currentColorTimeScale(d[0]);
            });
    g.append("text")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .attr("y", -6)
            .text(function (dAttribute) {
                if (currentTime === "inclusiveTime") {
                    return "Average inclusive time per instance.";
                } else if (currentTime === "exclusiveTime") {
                    return "Average exclusive time per instance.";
                } else if (currentTime === "inclusiveDiffTime") {
                    return "Inclusive time difference per instance. Purple: 2nd date slower."
                } else if (currentTime === "exclusiveDiffTime") {
                    return "Exclusive time difference per instance. Green: 2nd date slower."
                }
                
            });

    // UPDATE
    var nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
            .duration(duration)
            .attr("transform", function (d) {
                if (d.moveMe) {
                    d.freezeMe = true;
                    return "translate(" + d.y + "," + d.x + ")";
                }
                if (!d.y)
                    d.y = 0;
                return "translate(" + d.y + "," + d.x + ")";
            });

    // Update the node attributes and style
    nodeUpdate.select('circle.node')
            .attr('r', 12)
            .style("fill", function (d) { //katy
//                if (d._perfdata) { //color circle by time-per-instance
//                    toggleswitch = d3.select("#myCheck");
//                    if (toggleswitch.checked) {
//                        d.oldColor = colorInTimeScale(d._perfdata.inclusiveTime);
//                        return colorInTimeScale(d._perfdata.inclusiveTime); //avg_Time
//                    } else {
//                        d.oldColor = colorExTimeScale(d._perfdata.exclusiveTime)
//                        return colorExTimeScale(d._perfdata.exclusiveTime);
//                    }
//                }
                if (d._perfdata) {
                    if (dAttribute === "inclusiveTime") {
                        if (d._perfdata.inclusiveTime < 0)
                            return "magenta";
                        d.oldColor = currentColorTimeScale(d._perfdata.inclusiveTime);
                        return currentColorTimeScale(d._perfdata.inclusiveTime);
                    } else if (dAttribute === "exclusiveTime") {
                        if (d._perfdata.exclusiveTime < 0)
                            return "magenta";
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
            .attr('cursor', 'pointer');


    // Remove any exiting nodes
    var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle')
            .attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select('text')
            .style('fill-opacity', 1e-6);



    // ****************** links section ***************************

    // Update the links...
    var link = svg.selectAll('path.link')
            .data(links, function (d) {
                return d.id;
            });

    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', function (d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal(o, o);
            })
             .attr("opacity", function(d){
                if (dAttribute === "inclusiveDiffTime") {
//                        if (d.infade) return "0.5";
//                        if (d._perfdata.inclusiveDiffTime === 22)
//                            return "0.5";
                        return "1.0";

                    } else if (dAttribute === "exclusiveDiffTime") {
//                        if (d.exfade) return "0.5";
//                        if (d._perfdata.exclusiveDiffTime === 22)
//                            return "0.5";
                        return "1";
                    }     
                 return "1";        
            });
    // UPDATE
    var linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
            .duration(duration)
            .attr('d', function (d) {
                return diagonal(d, d.parent);
            });

    // Remove any exiting links
    var linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', function (d) {
                var o = {x: source.x, y: source.y};
                return diagonal(o, o);
            })
            .remove();

    // Store the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });

    //  addSlider(domainVals, greatestVal); //katy working-ish
    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {

        path = `M ${s.y} ${s.x}
                    C ${(s.y + d.y) / 2} ${s.x}
                      ${(s.y + d.y) / 2} ${d.x}
                      ${d.y} ${d.x}`;

        return path;
    }

    function closeLineChildren(d) {
        var myLineNum = getLineNum(d.data.name);
        if (d.children) {
            var combinedName = d.data.name;
            for (k in d.children) {
                combinedName += d.children[k].data.name;
                var childNum = getLineNum(d.children[k].data.name);
                if (childNum === myLineNum) {
                    d.linenode = true;
                    if (d.parent.linenode) {
                        d.x = d.parent.x;
                        d.y = d.parent.y;
                        //                      d.linenode = false;
                    }
                    if ((d.parent.linenode) && (!d.children[k].children)) {
                        //                      d.x = d.parent.x;
                        //                      d.y = d.parent.y;
                        d.leafnode = true;
                        //                      d.linenode = false;

                        return false;
                    }
                    return true;
                } else {
                    return false;
                }
                combinedName = d.data.name;
            }
        }
    }

    function showNodeCode(d) {
        offset = 20;
        linenum = getLineNum(d.data.name) + offset;
        d3.selectAll(".line").filter(function () {
            if (parseInt(d3.select(this).attr("class").split(" ")[1]) === linenum) {
                return true;
            }
        }).style("background", "yellow");

        var elem = document.getElementById("code-view");
        elem.scrollTop = linenum * 13;

    }

    function hideNodeCode(d) {
        offset = 20;
        linenum = getLineNum(d.data.name) + offset;
        d3.selectAll(".line").filter(function () {
            if (parseInt(d3.select(this).attr("class").split(" ")[1]) === linenum) {
                return true;
            }
        }).style("background", d3.select(this).oldColor);

        var elem = document.getElementById("code-view");
        elem.scrollTop = linenum * 13;
    }



    // Toggle children on click.
    function click(d) { //so children aren't behaving
        if (d.open === 1) {
            d.open = 0;
        } else {
            d.open = 1;
        }
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        if (d.bigParent) {
            //console.log("closing a big parent");
            branch = [];
            function getWholeBranch(d) {
                if (d.children) {
                    d.children.forEach(function (c) {
                        branch.push(c);
                        c.moveMe = true;
                        c.oldColor = d3.select(this).style("fill");
                        getWholeBranch(c);
                    });
                }
                if (d._children) {
                    d._children.forEach(function (c) {
                        branch.push(c);
                        c.oldColor = d3.select(this).style("fill");
                        getWholeBranch(c);
                    });
                }
            }
            getWholeBranch(d);

            for (i = 0; i < branch.length; i++) {
                branch[i].moveMe = true;
                if (branch[i].children) {
                    branch[i]._children = branch[i].children;
                    branch[i].children = null;

                } else {
                    branch[i].children = branch[i]._children;
                    branch[i]._children = null;
                }
            }
        }
        d3.select(this).select("path")
                .attr("d", symbol.type(function (d) {
                    if (d.open === 0) {
                        return d3.symbolCircle;
                    } else {
                        return d3.symbolTriangle;
                    }
                }))
                .attr('transform', "rotate(-90)")
                .attr("stroke-dasharray", function (d) { //stroke solid/dashed by direct or not
                    if (d._perfdata) {
                        if (d._perfdata.eval_direct === 1) {
                            return "3, 3";
                        } else if (d._perfdata.eval_direct === -1) {
                            return "3,1";
                        } else {
                            return "0";
                        }
                    }
                    return "0";
                })
                .style("stroke", "black")
                .style("fill", function (d) {
                    if (d.id === prevNodeNum)
                        return "yellow";
                    return d.oldColor;
                });

        update(d, fullRoot, perfdata, perfdata2, clicked = true);
    }
}


function prettyprintTime(time) {
    //converting nanoseconds to nice-looking times
    negative = false;
    if (time < 0) {
        negative = true;
        time = -time;
    }
    timeInSeconds = time * 1e-9;
    var exp = -Math.floor(Math.log(timeInSeconds) / Math.log(10)) + 1;

    if (timeInSeconds > 1) { //second
        return (negative) ? (-timeInSeconds).toFixed(2) + " s" : (timeInSeconds).toFixed(2) + " s";
    } else if (exp === 1) {
        return (negative) ? (-timeInSeconds).toFixed(2) + " s" : (timeInSeconds).toFixed(2) + " s"; //millisecond
    } else if ((exp > 1) && (exp <= 4)) {
        return (negative) ? (-timeInSeconds * 1000).toFixed(2) + " ms" : (timeInSeconds * 1000).toFixed(2) + " ms"; //millisecond
    } else if ((exp > 4) && (exp <= 7)) {
        return (negative) ? (-timeInSeconds * 1000000).toFixed(2) + " us" : (timeInSeconds * 1000000).toFixed(2) + " us"; //microsecond
    } else if ((exp > 7) && (exp <= 10)) {
        return (negative) ? (-timeInSeconds * 1000000000).toFixed(2) + " ns" : (timeInSeconds * 1000000000).toFixed(2) + " ns"; //nanosecond
    } else if ((exp > 10) && (exp <= 13)) {
        return (negative) ? (-timeInSeconds * 1000000000000).toFixed(2) + " ps" : (timeInSeconds * 1000000000000).toFixed(2) + " ps"; //picosecond
    }

    return (negative) ? -timeInSeconds.toFixed(2) + " s" : timeInSeconds.toFixed(2) + " s";

}

function closeCodeView() {
    var collapsibleButton = document.getElementById("collapsible");
    if (collapsibleButton.innerHTML === "Hide Code View") {
        document.getElementById('code-view').style.visibility = 'hidden';
        collapsibleButton.style.width = '140px';
        collapsibleButton.innerHTML = "Show Code View";
    } else {
        document.getElementById('code-view').style.visibility = 'visible';
        collapsibleButton.style.width = '628px';
        collapsibleButton.innerHTML = "Hide Code View";
    }
}

function toggleSwitchAction() {
    console.log("toggleSwitchAction");
    toggleswitch = document.getElementById("myCheck");
    (toggleswitch.checked === true) ? timetype = "EXCLUSIVE" : timetype = "INCLUSIVE";


    var currentTime = getCurrentTimeScheme();
    var dAttribute = setCurrentColors(currentTime);
    console.log("Click toggleswitch and color with ", dAttribute);

    svg.selectAll(".node").selectAll("path").transition()
            .style("fill", function (d) {
                var dAttribute = setCurrentColors(currentTime);
                //console.log("Recolor after toggle with ", dAttribute);
                if (d._perfdata) {
                    if (dAttribute === "inclusiveTime") {
                        if (d._perfdata.inclusiveTime < 0)
                            return "magenta";
                        d.oldColor = currentColorTimeScale(d._perfdata.inclusiveTime);
                        return currentColorTimeScale(d._perfdata.inclusiveTime);
                    } else if (dAttribute === "exclusiveTime") {
                        if (d._perfdata.exclusiveTime < 0)
                            return "magenta";
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
//                else {
//                    return "black";
//                }
            });

//    (timetype === "EXCLUSIVE") ? x.domain([0, greatestValEx]) : x.domain([0, greatestValIn]);
//    (timetype === "EXCLUSIVE") ? xAxis.tickValues(domainValsEx) : xAxis.tickValues(domainValsIn);
//    var date1 = document.getElementById("selectedDate1").value;
//    var date2 = document.getElementById("selectedDate2").value;
//    currentTime = getCurrentTimeScheme(date1, date2, timetype);
//    dAttribute = setCurrentColors(currentTime);
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

    //(timetype === "EXCLUSIVE") ? currentColorTimeScale = colorExTimeScale : currentColorTimeScale = colorInTimeScale;
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


}

//function makeCodeArray(codefile) {
//    var codeArray = [];
//    code = [];
//    d3.text(codefile, function(data){
//        codeArray = data.split('\n');
//        cv = d3.select("#code-view");
//        cv.selectAll("pre")
//                .data(codeArray)
//                .enter().append("pre")
//                .attr("class", function (d, i) {
//                    if (d.includes("char const* const als_explicit")) { //file sensitive
//                        offset = i;
//                    }
//                    return "line " + i;
//                })
//                .text(function (d) {
//                    if (!d) {
//                        return "\n";
//                    }
//                    return d;
//                })
//                .style("font-family", "monospace")
//                .style("margin", "2px 0px 0px 0px");
//        
//    });  
//    
//}
function getImportantTypeName(perfdata) {
    var importantName = "";

    if ((perfdata.display_name.includes("define-variable")) ||
            (perfdata.display_name.includes("variable")) ||
            (perfdata.display_name.includes("access-variable")) ||
            //            (perfdata.display_name.includes("access-argument")) ||
                    (perfdata.display_name.includes("access-function"))
                    //          (perfdata.display_name.includes("function"))  
                    ) {
        importantName = perfdata.display_name.split("/")[1].split("(")[0];
    }
    return importantName;
}


function getLineNum(d) {
    var locationArray = d.split("$");//d.data.name.split("$");
    var linenum = parseInt(locationArray[locationArray.length - 2]);
    return linenum;
}


