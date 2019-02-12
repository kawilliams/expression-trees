/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
console.log("Generate tree for daily-tree.html");

function callEverything(datadate) {
    codeArray = document.getElementById('main').innerHTML.split("\n");
    document.getElementById('main').innerHTML = "";
    if (!datadate) {
        datadate = document.querySelector("#selectedDate1").value + "-als";
    }
    textfile = "data/" + datadate + "-tree.txt";
    csvfile = "data/" + datadate + "-performance.csv";

    if (treeExists) {
        var codeview = document.getElementById("code-view");
        var legend = document.getElementById("legend");
        //var treevis = document.getElementById("tree-vis");
        codeview.empty();
        legend.empty();
        //treevis.empty();
    }
    
    //        if (window.File && window.FileReader && window.FileList && window.Blob) {
    //            
    //            codeArray = makeCodeArray(codefile); 
    //        } else {
    //            alert("The File APIs are not fully supported in this browser. Firefox, Chrome, and Safari are all known to support File API.");
    //        }
    if (textfile && csvfile) {
        d3.queue()
                .defer(d3.text, textfile)//"data/2018-09-25-tree.txt")
                .defer(d3.csv, csvfile)//"data/2018-09-25-performance.csv")
                .await(analyze);
        document.getElementById("shapekey").style.visibility = "visible";
        document.getElementById("legend").style.visibility = "visible";
        document.getElementById("code-view").style.visibility = "visible";
        document.getElementById("tree-vis").style.visibility = "visible";
        document.getElementById("collapsible").style.visibility = "visible";
    } else {
        alert("Data for " + datadate + " does not exist.");
    }
}

function analyze(error, treeformat, perfdata) {
    //if (error) throw error;
    if (error)
        alert("Data for " + datadate + " does not exist.");
    //    if (window.File && window.FileReader && window.FileList && window.Blob) {
    //            console.log("cdefile: ", codefile);            
    //            codeArray = makeCodeArray(codefile); 
    //        } else {
    //            alert("The File APIs are not fully supported in this browser. Firefox, Chrome, and Safari are all known to support File API.");
    //    }
    //    console.log("My code array", codeArray);
    treeExists = true;

    // Assigns parent, children, height, depth
    treeformat = parseNewick(treeformat);
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

    //if (count > 30) root.children.forEach(flatten); 
    root.x0 = height / 2;
    root.y0 = 0;

    // Collecting the performance times
    domainTimes = [],
            domainTimesEx = [],
            domainTimesIn = [];
    prim_inst = [];
    perfdata.map(function (d) {
        //        var avgTime = (+d.time)/(+d.count); //kttime
        //        if (avgTime > 0) {
        //            domainTimes.push(avgTime); //katy check times * 1.e-9);
        //        }
        domainTimes.push(+d.time); //kttime
        domainTimesIn.push(+d.time); //kttime
        prim_inst.push(d.primitive_instance);
    });


    colorsGr = ["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"]; //green
    colorsPur = ["#f2f0f7", "#cbc9e2", "#9e9ac8", "#756bb1", "#54278f"];  //blue
    colorTimeScale = d3.scaleQuantize() //went with log scale
            .domain(d3.extent(domainTimesIn)) //domainTimes //kttime [0,10088524656]
            .range(colorsPur);
    //gotta get the domain values for each color
    domainVals = [colorTimeScale.invertExtent(colorsPur[0])[0]];
    greatestVal = colorTimeScale.invertExtent(colorsPur[colorsPur.length - 1])[1];
    for (var i = 0; i < colorsPur.length; i++) {
        domainVals.push(colorTimeScale.invertExtent(colorsPur[i])[1]);
    }

    timetype = "INCLUSIVE";
    // ****************** Slider section **************************
    threshold = 0;
  
    update(root, fullRoot, perfdata, threshold, timetype, false);

    x = d3.scaleLinear()
            .domain([0, greatestVal])
            .range([0, 300]);

    xAxis = d3.axisBottom()
            .scale(x)
            .tickSize(13)
            .tickValues(domainVals)
            .tickFormat(function (d) {
                return prettyprintTime(d);
            }); // === 0.5 ? formatPercent(d) : formatNumber(100 * d); });
    console.log(x.domain(), xAxis.tickValues());
    var legendDim = {width: 600, height: 45};
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
    if (timetype === "EXCLUSIVE") {
        g.selectAll("rect")
                .data(colorExTimeScale.range().map(function (color) {
                    var d = colorExTimeScale.invertExtent(color);
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
                    return colorExTimeScale(d[0]);
                });
    } else {
        g.selectAll("rect")
                .data(colorInTimeScale.range().map(function (color) {
                    var d = colorInTimeScale.invertExtent(color);
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
                    return colorInTimeScale(d[0]);
                });
    }
    g.append("text")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .attr("y", -6)
            .text("Average time per instance");

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

offset = 0;

function update(source, fullSource, perfdata, threshold, timetype, clicked) {

    // handle.attr("cx", slider_x(threshold));
    // sliderText.text(prettyprintTime(threshold))
    //         .attr("font-family", "sans-serif")
    //         .attr("font-size", "15px");
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

    var depthY = svg.attr("width") / maxDepth;//katy
    var depthX = svg.attr("height") / widestLevel;
    //Prevent tree from spreading too much or too little
    var spreadFactor = 1;
    if (depthX < 35)
        spreadFactor = 1.8 + (1.0 / depthX);
    if (depthX > 200)
        spreadFactor = 0.8;

    nodes.forEach(function (d) {
        d.x = d.x * spreadFactor;
        d.y = d.depth * depthY;
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
                }
                return d.id || (d.id = ++i);
            });
    //Add exclusive time after all children nodes have been created
    node.data(nodes, function (d) {
        d.childrenTime = 0;
        if (d.children) {
            for (child of d.children) {
                //d.childrenTime += +(child._perfdata.time); //sum children
                if (child._perfdata.time > d.childrenTime) {
                    d.childrenTime = child._perfdata.time;
                }
            }
        }
        if (d._perfdata) {
            d._perfdata.exclusiveTime = d._perfdata.time - d.childrenTime;
            d._perfdata.inclusiveTime = +d._perfdata.time;
            //Katy
            domainTimesEx.push(d._perfdata.exclusiveTime);
            domainTimesIn.push(d._perfdata.inclusiveTime);
        }
    });

    greatestValEx = d3.extent(domainTimesEx)[1];
    greatestValIn = d3.extent(domainTimesIn)[1];

    colorExTimeScale = d3.scaleQuantize() //went with log scale
            .domain([0, d3.extent(domainTimesEx)[1]]) //domainTimes //kttime issue
            .range(colorsGr);
    //gotta get the domain values for each color
    domainValsEx = [colorExTimeScale.invertExtent(colorsGr[0])[0]];
    greatestValEx = colorExTimeScale.invertExtent(colorsGr[colorsGr.length - 1])[1];
    for (var i = 0; i < colorsGr.length; i++) {
        domainValsEx.push(colorExTimeScale.invertExtent(colorsGr[i])[1]);
    }

    colorInTimeScale = d3.scaleQuantize() //went with log scale
            .domain(d3.extent(domainTimesIn)) //domainTimes 
            .range(colorsPur);
    //gotta get the domain values for each color
    domainValsIn = [colorInTimeScale.invertExtent(colorsPur[0])[0]];
    greatestValIn = colorInTimeScale.invertExtent(colorsPur[colorsPur.length - 1])[1];
    for (var i = 0; i < colorsPur.length; i++) {
        domainValsIn.push(colorInTimeScale.invertExtent(colorsPur[i])[1]);
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
                //recolor path
                hideNodeCode(d);
            });


    // Add Circle for the nodes
    //  nodeEnter.append('circle')
    //      .attr('class', 'node')
    //      .attr('r', 10)
    //      .style("stroke", function(d){ //stroke color by direct or not
    //          if (d._perfdata) {
    //              return (d._perfdata.avg_direct_time > 0) ? "red" : "purple"; 
    //          }
    //      });

    // Add Triangle for nodes when collapsed and have children
    //katy

    //hard coded the correct time katy
    //orig
    //"/phylanx/call-function$2$lra/2$33$5","call-function/lra(33, 5)",1,377929,-1
    // new
    //"/phylanx/call-function$2$lra/2$33$5","call-function/lra(33, 5)",1,377929000,-1
    var symbol = d3.symbol().size([150]);
    aNodeIsHighlighted = false;
    oldNode = "";
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
            .style("stroke", "black")
            .style("fill", function (d) { //katy
                d.highlighted = false;
                if (d._perfdata) { //color circle by time-per-instance
                    if (timetype === "EXCLUSIVE") {
                        if (d._perfdata.exclusiveTime >= 0) {
                            d.oldColor = colorExTimeScale(d._perfdata.exclusiveTime);
                            return colorExTimeScale(d._perfdata.exclusiveTime)
                        } else if (d._perfdata.exclusiveTime < 0) {
                            //console.log("HERE - negative exclusive Time");
                            return "magenta";
                        }
                        return "magenta";
                    } else if (timetype === "INCLUSIVE") {
                        if (d._perfdata.inclusiveTime >= 0) {
                            d.oldColor = colorInTimeScale(d._perfdata.inclusiveTime);
                            return colorInTimeScale(d._perfdata.inclusiveTime);
                        } else if (d._perfdata.inclusiveTime < 0) {
                            return "magenta";
                        }
                        return "magenta";
                    }
                }
                return "black";
            })
            .on("mouseover", function (d) {
                //recolor previously-highlighted line
                if (lineSelected)
                    d3.select(lineSelected).style("background-color", "#eff3f8");

                // recolor any previously-highlighted nodes
                d3.selectAll(".node").filter(function (d) {
                    if (d.id === prevNodeNum) {
                        return true;
                    }
                }).select("path").style("fill", function (d) {
                    return d.oldColor;
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
                    hl_nodes.style("fill", function(d){
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
                d3.selectAll(".node").selectAll("path").filter(function (d) {
                    var nodeName = "";
                    if (d._perfdata)
                        nodeName = getImportantTypeName(d._perfdata);

                    if (nodeName === currName)
                        return true;

                }).style("fill", function (d) {
                    return d.oldColor;
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
        d3.selectAll(".node").filter(function (d) {
            if ((getLineNum(d.data.name) === prevLineNum) ||
                    (d.id === prevNodeNum)) {
                //console.log("I'm from the previous line", prevLineNum);
                return true;
            }
        }).select("path").style("fill", function (d) {
            console.log("Recolor any previously highlighted nodes", d.oldColor);
            return d.oldColor;
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
            //console.log(d);
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
                if (d._perfdata) { //color circle by time-per-instance
                    toggleswitch = d3.select("#myCheck");
                    if (toggleswitch.checked) {
                        d.oldColor = colorInTimeScale(d._perfdata.inclusiveTime);
                        return colorInTimeScale(d._perfdata.inclusiveTime); //avg_Time
                    } else {
                        d.oldColor = colorExTimeScale(d._perfdata.exclusiveTime)
                        return colorExTimeScale(d._perfdata.exclusiveTime);
                    }
                }
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
                        //console.log(combinedName);
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
        linenum = getLineNum(d.data.name) - 1 + offset;
        d3.selectAll(".line").filter(function () {
            if (parseInt(d3.select(this).attr("class").split(" ")[1]) === linenum) {
                return true;
            }
        }).style("background", "yellow");

        var elem = document.getElementById("code-view");
        elem.scrollTop = linenum * 13;

    }

    function hideNodeCode(d) {
        linenum = getLineNum(d.data.name) - 1 + offset;
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
            //console.log("it's open");
            d.open = 0;
        } else {
            //console.log("CLOSED");
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
                    return d.oldColor;
                });
        

        update(d, fullRoot, perfdata, threshold, timetype, clicked = true);
    }
}


function prettyprintTime(time) {
    //converting nanoseconds to nice-looking times
    timeInSeconds = time * 1e-9;
    var exp = -Math.floor(Math.log(timeInSeconds) / Math.log(10)) + 1;

    if (timeInSeconds > 1) { //second
        return (timeInSeconds).toFixed(2) + " s";
    } else if (exp === 1) {
        return (timeInSeconds).toFixed(2) + " s"; //millisecond
    } else if ((exp > 1) && (exp <= 4)) {
        return (timeInSeconds * 1000).toFixed(2) + " ms"; //millisecond
    } else if ((exp > 4) && (exp <= 7)) {
        return (timeInSeconds * 1000000).toFixed(2) + " us"; //microsecond
    } else if ((exp > 7) && (exp <= 10)) {
        return (timeInSeconds * 1000000000).toFixed(2) + " ns"; //nanosecond
    } else if ((exp > 10) && (exp <= 13)) {
        return (timeInSeconds * 1000000000000).toFixed(2) + " ps"; //picosecond
    }
    return timeInSeconds + " s";

}

function closeCodeView() {
                var collapsibleButton = document.getElementById("collapsible");
                if (collapsibleButton.innerHTML === "Hide Code View") {
                    document.getElementById('code-view').style.visibility = 'hidden';
                    collapsibleButton.innerHTML = "Show Code View";
                } else {
                    document.getElementById('code-view').style.visibility = 'visible';
                    collapsibleButton.innerHTML = "Hide Code View";
                }
            }
            
function toggleSwitchAction() {
    toggleswitch = document.getElementById("myCheck");
    (toggleswitch.checked === true) ? timetype = "EXCLUSIVE" : timetype = "INCLUSIVE";


    svg.selectAll(".node").selectAll("path").transition()
            .style("fill", function (d) {
                if (d._perfdata) {
                    if (timetype === "EXCLUSIVE") {
                        if (d._perfdata.exclusiveTime < 0) {
                            return "magenta";
                        }
                        d.oldColor = colorExTimeScale(d._perfdata.exclusiveTime);
                        return colorExTimeScale(d._perfdata.exclusiveTime); //avg_Time
                    } else {
                        d.oldColor = colorInTimeScale(d._perfdata.inclusiveTime);
                        return colorInTimeScale(d._perfdata.inclusiveTime);
                    }
                } else {
                    return "black";
                }
            });

    (timetype === "EXCLUSIVE") ? x.domain([0, greatestValEx]) : x.domain([0, greatestValIn]);
    (timetype === "EXCLUSIVE") ? xAxis.tickValues(domainValsEx) : xAxis.tickValues(domainValsIn);
    d3.select(".x").transition().call(xAxis);

    var g = d3.select(".legend");
    g.select(".domain")
            .remove();

    (timetype === "EXCLUSIVE") ? currentColorTimeScale = colorExTimeScale : currentColorTimeScale = colorInTimeScale;
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
                return (timetype === "EXCLUSIVE") ? colorExTimeScale(d[0]) : colorInTimeScale(d[0]);
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


