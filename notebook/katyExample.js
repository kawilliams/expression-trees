function woo(){console.log("HEYHO");}

(function(element) {
    
    function parseNewick(a){for(var e=[],r={},s=a.split(/\s*(;|\(|\)|,|:)\s*/),t=0;t<s.length;t++){var n=s[t];switch(n){case"(":var c={};r.branchset=[c],e.push(r),r=c;break;case",":var c={};e[e.length-1].branchset.push(c),r=c;break;case")":r=e.pop();break;case":":break;default:var h=s[t-1];")"==h||"("==h||","==h?r.name=n:":"==h&&(r.length=parseFloat(n))}}return r}
    
    //require(['d3', 'vue', 'd3tip'], function(d3, Vue, d3tip)
    require(['d3', 'vue'], function(d3, Vue) {
        
        // d3.tip
        // Copyright (c) 2013 Justin Palmer
        // ES6 / D3 v4 Adaption Copyright (c) 2016 Constantin Gavrilete
        // Removal of ES6 for D3 v4 Adaption Copyright (c) 2016 David Gotz
        d3.functor = function functor(v) {
          return typeof v === "function" ? v : function() {
            return v;
          };
        };
        d3.tip = function() {

          var direction = d3_tip_direction,
              offset    = d3_tip_offset,
              html      = d3_tip_html,
              node      = initNode(),
              svg       = null,
              point     = null,
              target    = null

          function tip(vis) {
            svg = getSVGNode(vis)
            point = svg.createSVGPoint()
            element.appendChild(node)
          }
            //document.body.appendChild(node)
          // Public - show the tooltip on the screen
          //
          // Returns a tip
          tip.show = function() {
            var args = Array.prototype.slice.call(arguments)
            if(args[args.length - 1] instanceof SVGElement) target = args.pop()

            var content = html.apply(this, args),
                poffset = offset.apply(this, args),
                dir     = direction.apply(this, args),
                nodel   = getNodeEl(),
                i       = directions.length,
                coords,
                scrollTop  = document.documentElement.scrollTop || document.body.scrollTop,
                scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft

            nodel.html(content)
              .style('position', 'absolute')
              .style('opacity', 1)
              .style('pointer-events', 'all')

            while(i--) nodel.classed(directions[i], false)
            coords = direction_callbacks[dir].apply(this)
            nodel.classed(dir, true)
              .style('top', (coords.top +  poffset[0]) + scrollTop + 'px')
              .style('left', (coords.left + poffset[1]) + scrollLeft + 'px')

            return tip
          }

          // Public - hide the tooltip
          //
          // Returns a tip
          tip.hide = function() {
            var nodel = getNodeEl()
            nodel
              .style('opacity', 0)
              .style('pointer-events', 'none')
            return tip
          }

          // Public: Proxy attr calls to the d3 tip container.  Sets or gets attribute value.
          //
          // n - name of the attribute
          // v - value of the attribute
          //
          // Returns tip or attribute value
          tip.attr = function(n, v) {
            if (arguments.length < 2 && typeof n === 'string') {
              return getNodeEl().attr(n)
            } else {
              var args =  Array.prototype.slice.call(arguments)
              d3.selection.prototype.attr.apply(getNodeEl(), args)
            }

            return tip
          }

          // Public: Proxy style calls to the d3 tip container.  Sets or gets a style value.
          //
          // n - name of the property
          // v - value of the property
          //
          // Returns tip or style property value
          tip.style = function(n, v) {
            // debugger;
            if (arguments.length < 2 && typeof n === 'string') {
              return getNodeEl().style(n)
            } else {
              var args = Array.prototype.slice.call(arguments);
              if (args.length === 1) {
                var styles = args[0];
                Object.keys(styles).forEach(function(key) {
                  return d3.selection.prototype.style.apply(getNodeEl(), [key, styles[key]]);
                });
              }
            }

            return tip
          }

          // Public: Set or get the direction of the tooltip
          //
          // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
          //     sw(southwest), ne(northeast) or se(southeast)
          //
          // Returns tip or direction
          tip.direction = function(v) {
            if (!arguments.length) return direction
            direction = v == null ? v : d3.functor(v)

            return tip
          }

          // Public: Sets or gets the offset of the tip
          //
          // v - Array of [x, y] offset
          //
          // Returns offset or
          tip.offset = function(v) {
            if (!arguments.length) return offset
            offset = v == null ? v : d3.functor(v)

            return tip
          }

          // Public: sets or gets the html value of the tooltip
          //
          // v - String value of the tip
          //
          // Returns html value or tip
          tip.html = function(v) {
            if (!arguments.length) return html
            html = v == null ? v : d3.functor(v)

            return tip
          }

          // Public: destroys the tooltip and removes it from the DOM
          //
          // Returns a tip
          tip.destroy = function() {
            if(node) {
              getNodeEl().remove();
              node = null;
            }
            return tip;
          }

          function d3_tip_direction() { return 'n' }
          function d3_tip_offset() { return [0, 0] }
          function d3_tip_html() { return ' ' }

          var direction_callbacks = {
            n:  direction_n,
            s:  direction_s,
            e:  direction_e,
            w:  direction_w,
            nw: direction_nw,
            ne: direction_ne,
            sw: direction_sw,
            se: direction_se
          };

          var directions = Object.keys(direction_callbacks);

          function direction_n() {
            var bbox = getScreenBBox()
            return {
              top:  bbox.n.y - node.offsetHeight,
              left: bbox.n.x - node.offsetWidth / 2
            }
          }

          function direction_s() {
            var bbox = getScreenBBox()
            return {
              top:  bbox.s.y,
              left: bbox.s.x - node.offsetWidth / 2
            }
          }

          function direction_e() {
            var bbox = getScreenBBox()
            return {
              top:  bbox.e.y - node.offsetHeight / 2,
              left: bbox.e.x
            }
          }

          function direction_w() {
            var bbox = getScreenBBox()
            return {
              top:  bbox.w.y - node.offsetHeight / 2,
              left: bbox.w.x - node.offsetWidth
            }
          }

          function direction_nw() {
            var bbox = getScreenBBox()
            return {
              top:  bbox.nw.y - node.offsetHeight,
              left: bbox.nw.x - node.offsetWidth
            }
          }

          function direction_ne() {
            var bbox = getScreenBBox()
            return {
              top:  bbox.ne.y - node.offsetHeight,
              left: bbox.ne.x
            }
          }

          function direction_sw() {
            var bbox = getScreenBBox()
            return {
              top:  bbox.sw.y,
              left: bbox.sw.x - node.offsetWidth
            }
          }

          function direction_se() {
            var bbox = getScreenBBox()
            return {
              top:  bbox.se.y,
              left: bbox.e.x
            }
          }

          function initNode() {
            var node = d3.select(document.createElement('div'))
            node
              .style('position', 'absolute')
              .style('top', 0)
              .style('opacity', 0)
              .style('pointer-events', 'none')
              .style('box-sizing', 'border-box')

            return node.node()
          }

          function getSVGNode(el) {
            el = el.node()
            if(el.tagName.toLowerCase() === 'svg')
              return el

            return el.ownerSVGElement
          }

          function getNodeEl() {
            if(node === null) {
              node = initNode();
              // re-add node to DOM
              document.body.appendChild(node);
            };
            return d3.select(node);
          }

          // Private - gets the screen coordinates of a shape
          //
          // Given a shape on the screen, will return an SVGPoint for the directions
          // n(north), s(south), e(east), w(west), ne(northeast), se(southeast), nw(northwest),
          // sw(southwest).
          //
          //    +-+-+
          //    |   |
          //    +   +
          //    |   |
          //    +-+-+
          //
          // Returns an Object {n, s, e, w, nw, sw, ne, se}
          function getScreenBBox() {
            var targetel   = target || d3.event.target;

            while ('undefined' === typeof targetel.getScreenCTM && 'undefined' === targetel.parentNode) {
                targetel = targetel.parentNode;
            }

            var bbox       = {},
                matrix     = targetel.getScreenCTM(),
                tbbox      = targetel.getBBox(),
                width      = tbbox.width,
                height     = tbbox.height,
                x          = tbbox.x,
                y          = tbbox.y

            point.x = x
            point.y = y
            bbox.nw = point.matrixTransform(matrix)
            point.x += width
            bbox.ne = point.matrixTransform(matrix)
            point.y += height
            bbox.se = point.matrixTransform(matrix)
            point.x -= width
            bbox.sw = point.matrixTransform(matrix)
            point.y -= height / 2
            bbox.w  = point.matrixTransform(matrix)
            point.x += width
            bbox.e = point.matrixTransform(matrix)
            point.x -= width / 2
            point.y -= height / 2
            bbox.n = point.matrixTransform(matrix)
            point.y += height
            bbox.s = point.matrixTransform(matrix)

            return bbox
          }

          return tip
        };
        
        //woo = function yarg(){ console.log("HEYHEY");}
        // Katy's functions
        woo = function callEverything() {

            // console.log("Input value: ", document.querySelector("#selectedDate").value);
            //datadate = document.querySelector("#selectedDate").value;
            //datadate = '2018-11-06';
            textfile = document.getElementById("py-tree").value; //"data/"+datadate + "-tree.txt";
            console.log('d3.csvParse=',typeof d3.csvParse);
            csvfile = d3.csvParse(document.getElementById("py-csv").value); //"data/"+datadate + "-performance.csv";
            //console.log(textfile, csvfile);
            if (treeExists) {
                var codeview = document.getElementById("code-view");
                var legend = document.getElementById("legend");
                var treevis = document.getElementById("tree-vis");
                codeview.empty();
                legend.empty();
                //treevis.empty();
            }
            //if (textfile && csvfile) {	
            console.log('csv:',typeof csvfile);
            analyze(false,textfile,csvfile);
            /*
            d3.queue()
                  .defer(d3.text,"data/treeformat.txt")//textfile)
                  .defer(d3.csv, "data/performance.csv")//csvfile)
                  .await(analyze);
                  */
                  $('#shapekey').css('visibility', 'visible');
                  $('#legend').css('visibility', 'visible');
                  //$('#code-view').css('visibility', 'visible');
                  $('#tree-vis').css('visibility', 'visible');
                  $('#collapsible').css('visibility', 'visible');
            //} else {
            //    alert("Data for " + datadate + " does not exist.");
            //}
        }
        function analyze(error, treeformat, perfdata) {
            //if (error) throw error;
            if (error) alert("Data for " + datadate + " does not exist.");
            treeExists = true;
            // Assigns parent, children, height, depth
            console.log("treeformat:",typeof treeformat);
            treeformat = parseNewick(treeformat);
            root = d3.hierarchy(treeformat, function(d){ return d.branchset;});
            fullRoot = d3.hierarchy(treeformat, function(d){ return d.branchset;});
            
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
            perfdata.map(function(d){
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
            greatestVal = colorTimeScale.invertExtent(colorsPur[colorsPur.length-1])[1];
            for (var i=0; i<colorsPur.length; i++){
                domainVals.push(colorTimeScale.invertExtent(colorsPur[i])[1]);
            }
            
            timetype = "INCLUSIVE";
              // ****************** Slider section **************************
        threshold =  0;

            update(root, fullRoot, perfdata, threshold, timetype, false);
            
            x = d3.scaleLinear()
                .domain([0, greatestVal])
                .range([0, 300]);
            xAxis = d3.axisBottom()
                .scale(x)
                .tickSize(13)
                .tickValues(domainVals)
                .tickFormat(function(d) { return prettyprintTime(d); }); // === 0.5 ? formatPercent(d) : formatNumber(100 * d); });
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
                  .data(colorExTimeScale.range().map(function(color) {
                    var d = colorExTimeScale.invertExtent(color);
                    if (d[0] == null) d[0] = x.domain()[0];
                    if (d[1] == null) d[1] = x.domain()[1];
                    return d;
                  }))
                  .enter().insert("rect", ".tick")
                    .attr("height", 8)
                    .attr("x", function(d) { return x(d[0]); })
                    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
                    .attr("fill", function(d) { return colorExTimeScale(d[0]); });
            }
            else {
                g.selectAll("rect")
                  .data(colorInTimeScale.range().map(function(color) {
                    var d = colorInTimeScale.invertExtent(color);
                    if (d[0] == null) d[0] = x.domain()[0];
                    if (d[1] == null) d[1] = x.domain()[1];
                    return d;
                  }))
                  .enter().insert("rect", ".tick")
                    .attr("height", 8)
                    .attr("x", function(d) { return x(d[0]); })
                    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
                    .attr("fill", function(d) { return colorInTimeScale(d[0]); });
            }
            g.append("text")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start")
                .attr("y", -6)
                .text("Average time per instance"); 
        }
        function flatten(d) {
           
            function recurse(d) {
                if (d.children) {
                    closeMe = 0;
                    for (var i=0; i<d.children.length; i++){
                        if (getLineNum(d.data.name) === getLineNum(d.children[i].data.name)){
                            closeMe += 1;
                        }
                    }
                    
                    if (closeMe === d.children.length){
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
            for (var i=nodeList.length-1; i>-1; i--){
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
                    for (var i=0; i<d.branchset.length; i++) {
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
            if(node.children){
                if (node.children.length > widestLevel) widestLevel = node.children.length;
                for(var i=0; i<node.children.length; i++) {
                    if (node.children[i].children){
                        count++;
                        countNodes(node.children[i]);
                    }
                    else {
                        count++;
                    }
                }
            }
        }
        function update(source, fullSource, perfdata, threshold, timetype, clicked) {
          
          // handle.attr("cx", slider_x(threshold));
          // sliderText.text(prettyprintTime(threshold))
          //         .attr("font-family", "sans-serif")
          //         .attr("font-size", "15px");
          // Assigns the x and y position for the nodes
          var tree = treemap(root);
          var fullTree = treemap(fullRoot);
          var fullTreeCoords = {};
          fullTree.descendants().forEach(function(d){
            fullTreeCoords[d.data.name] = [d.x, d.y];
          });
          
          tree.descendants().forEach(function modifyXY(d){
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
          var maxDepth=0; 
          nodes.forEach(function(d){
              if (d.depth > maxDepth){ 
                maxDepth = d.depth;
              } 
          });
          var depthY = svg.attr("width") / maxDepth;//katy
          var depthX = svg.attr("height") / widestLevel;
          //Prevent tree from spreading too much or too little
          var spreadFactor = 1;
          if (depthX < 35) spreadFactor = 1.8 + (1.0/depthX);
          if (depthX > 200) spreadFactor = 0.8;
          
          nodes.forEach(function(d){ 
              d.x = d.x * spreadFactor;
              d.y = d.depth * depthY;
          }); 
          // ****************** Nodes section ***************************
         i = 0;
          // Update the nodes...
          var node = svg.selectAll('g.node')
              .data(nodes, function(d) {
                
                  var nodename = d.data.name;
                  // Change time to time-per-instance //katy
                  if (prim_inst.indexOf(nodename) >= 0) {
                      //Necessary for tooltip
                    node_perfdata = perfdata[prim_inst.indexOf(nodename)]; 
                    node_perfdata.eval_direct = +node_perfdata.eval_direct; //how the node was run (async/sync/unk)
                    node_perfdata.avg_time = +(node_perfdata.time / node_perfdata.count); // * 1.e-9; //katy nanos are SMALL
                    if (+node_perfdata.count === 0) node_perfdata.avg_time = node_perfdata.time;
                    if (!node_perfdata.avg_time) node_perfdata.avg_time = 0;
                    
                    //Necessary for tree-vis
                    d._perfdata = perfdata[prim_inst.indexOf(nodename)];  
                    d._perfdata.save_display_name = d._perfdata.display_name;
                  }
                  return d.id || (d.id = ++i); 
                  });
         //Add exclusive time after all children nodes have been created
         node.data(nodes, function(d){
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
            greatestValEx = colorExTimeScale.invertExtent(colorsGr[colorsGr.length-1])[1];
            for (var i=0; i<colorsGr.length; i++){
                domainValsEx.push(colorExTimeScale.invertExtent(colorsGr[i])[1]);
            }
            
        colorInTimeScale = d3.scaleQuantize() //went with log scale
                        .domain(d3.extent(domainTimesIn)) //domainTimes 
                        .range(colorsPur);
            //gotta get the domain values for each color
            domainValsIn = [colorInTimeScale.invertExtent(colorsPur[0])[0]];
            greatestValIn = colorInTimeScale.invertExtent(colorsPur[colorsPur.length-1])[1];
            for (var i=0; i<colorsPur.length; i++){
                domainValsIn.push(colorInTimeScale.invertExtent(colorsPur[i])[1]);
            }
         
        /*node.each(function(d){
             if (d._perfdata) {
                 //Closing nodes below threshold
                 if ((d._perfdata.avg_time < threshold) && (d.children)) { //katy
                    
                      if (d.children) {
                        d._children = d.children;
                        d.children = null;
                        
                      } else {
                        d.children = d._children;
                        d._children = null;
                      }
                 }
                 
                 //Reopening nodes above threshold
        //         else if (//(d._perfdata.avg_time >= threshold) && 
        //                 (d.children === null) && 
        //                 (d._children)) { 
        //             d.children = d._children;
        //             d._children = null;
        //         }
             }
         });*/
              cv = d3.select("#code-view");
              cv.selectAll("pre")
                  .data(codeArray)
                  .enter().append("pre")
                  .attr("class", function(d,i){
                      if (d.includes("char const* const als_explicit")) { //file sensitive
                      offset = i;
                  }
                      return "line " + i;
                  })
                  .text(function(d){ 
                      if (!d) {
                          return "\n";
                      }
                      return d; 
                  })
                  .style("font-family", "monospace")
                  .style("margin", "2px 0px 0px 0px");
              var coll = document.getElementsByClassName("collapsible");
              var i;
              for (i=0; i<coll.length; i++) {
                  coll[i].addEventListener("click", function(){
                      this.classList.toggle("active");
                      var content = this.nextElementSibling;
                      if (content.style.display === "block") {
                          content.style.display = "none";
                      } 
                      else {
                          content.style.display = "block";
                      }
                  });
              }
                // Enter any new modes at the parent's previous position.
          var nodeEnter = node.enter().append('g')
              .attr('class', 'node')
              .attr('id', function(d) {
                d.isGroup = true; 
                return d.id;})
              .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })  
            .on('click', click)
            .on("mouseenter", function(d) {
                if (d.x < 120) { //magic number re tooltip size
                    tool_tip_south.show(d);
                } else {
                    tool_tip.show(d);
                }
                showNodeCode(d);
              })
            .on("mouseout", function(d) { 
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
                .attr("d", symbol.type(function(d) {
        //            closeLineChildren(d); //katy line close
                    if (d.bigParent) { 
                      return d3.symbolTriangle; 
                    }
                    return d3.symbolCircle;
            }))
                .attr('transform', "rotate(-90)")
                .attr("stroke-dasharray", function(d){ //stroke solid/dashed by direct or not
                  if (d._perfdata) {
                      if (d._perfdata.eval_direct === 1) {
                          return "3, 3"; 
                      } else if (d._perfdata.eval_direct === -1) {
                          return "3,1";
                      } else { return "0"; }
                  }
                  return "0";
                })
                .style("stroke", "black")
                .style("fill", function(d) { //katy
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
                    }
                    else if (timetype === "INCLUSIVE") {
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
                .on("mouseover", function(d) { 
                    //recolor previously-highlighted line
                    if (lineSelected) d3.select(lineSelected).style("background-color", "#eff3f8");
                    
                    // recolor any previously-highlighted nodes
                    d3.selectAll(".node").filter(function(d){  
                        if (d.id === prevNodeNum){
                            return true;
                        }
                    }).select("path").style("fill", function(d){ 
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
                        console.log("Curr name: ", currName);
                    }
                    svg.selectAll(".hl_line").remove();
                    
                    // Only draw lines & color nodes if currName is useful for linking
                    if (currName !== "") {
                        hl_edge_data = [];
                        startx = d.y;
                        starty = d.x;
                        hl_edge_data.push({x: startx, y: starty});
                        hl_nodes = d3.selectAll(".node").selectAll("path").filter(function(d){
                        var nodeName = "";
                        if (d._perfdata) {
                            nodeName = getImportantTypeName(d._perfdata);
                            if (nodeName === currName) {
                                edge_data = {x: d.y, y:d.x};
                                hl_edge_data.push(edge_data);
                                hl_edge_data.push({x: startx, y: starty});
                                return true;
                            } }
                        });
                        hl_nodes.style("fill", "yellow");
                        console.log("Number of ", currName, hl_edge_data.length);
              
                        // define the line
                        var hl_line = d3.line()
                            .x(function(d) { return d.x; })
                            .y(function(d) { return d.y; });
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
                .on("mouseout", function(d) { 
                    var currName = "";
                    if (d._perfdata) {
                        currName = getImportantTypeName(d._perfdata);
                    }
                    d3.selectAll(".node").selectAll("path").filter(function(d){
                        var nodeName = "";
                        if (d._perfdata) nodeName = getImportantTypeName(d._perfdata);
                        if (nodeName === currName) return true; 
                    }).style("fill", function(d){ return d.oldColor; });
                    d3.selectAll(".hl-edges").remove();
                    hideNodeCode(d);
                    
                });
        // Add labels for the nodes
          nodeEnter.append('text')
              .attr("dy", ".35em")
              .attr("x", function(d) {
                  return 13;
              })
              .attr("y", function(d){
                   return d.children || d._children ? -7 : 0;       
              })
              .attr("text-anchor", function(d) {
                  return "start";
              })
              .text(function(d) { 
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
            lines.on("mouseover", function(d){
                //recolor previously-highlighted line
                if (lineSelected) d3.select(lineSelected).style("background-color", "#eff3f8");
               
                // recolor any previously-highlighted nodes
                d3.selectAll(".node").filter(function(d){  
                    if ((getLineNum(d.data.name) === prevLineNum) ||
                            (d.id === prevNodeNum)){
                        //console.log("I'm from the previous line", prevLineNum);
                        return true;
                    }
                }).select("path").style("fill", function(d){ 
                   return d.oldColor;
                });
               
               d3.select(this).style("background-color", "yellow");
               lineSelected = this;
               currLineNum = parseInt(d3.select(this).attr("class").split(" ")[1]) - offset + 1;
               
               //console.log("My line:", currLineNum);
               
               
               //Find corresponding node
               d3.selectAll(".node").filter(function(d){  
                    if (getLineNum(d.data.name) === currLineNum){
                        //console.log("I'm a node on this line", currLineNum);
                        prevLineNum = currLineNum;
                        return true;
                    }
               }).select("path").style("fill", function(d){ 
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
                .on("click", function(){
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
            .attr("transform", function(d) { 
              if (d.moveMe) {
                d.freezeMe = true;
                console.log("moving");
                return "translate(" + d.y + "," + d.x + ")";
              }
              if (!d.y) d.y = 0;
              return "translate(" + d.y + "," + d.x + ")";
             });
          // Update the node attributes and style
          nodeUpdate.select('circle.node')
            .attr('r', 12)
            .style("fill", function(d) { //katy
                if (d._perfdata) { //color circle by time-per-instance
                    toggleswitch = d3.select("#myCheck");
                    if (toggleswitch.checked) {
                        return colorInTimeScale(d._perfdata.inclusiveTime); //avg_Time
                    } else {
                        return colorExTimeScale(d._perfdata.exclusiveTime);
                    }
                }
            })
            .attr('cursor', 'pointer');
            
          // Remove any exiting nodes
          var nodeExit = node.exit().transition()
              .duration(duration)
              .attr("transform", function(d) {
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
              .data(links, function(d) { return d.id; });
          // Enter any new links at the parent's previous position.
          var linkEnter = link.enter().insert('path', "g")
              .attr("class", "link")
              .attr('d', function(d){
                var o = {x: source.x0, y: source.y0};
                return diagonal(o, o);
              });
        // UPDATE
          var linkUpdate = linkEnter.merge(link);
          // Transition back to the parent element position
          linkUpdate.transition()
              .duration(duration)
              .attr('d', function(d){ return diagonal(d, d.parent); });
          // Remove any exiting links
          var linkExit = link.exit().transition()
              .duration(duration)
              .attr('d', function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal(o, o);
              })
              .remove();
          // Store the old positions for transition.
          nodes.forEach(function(d){
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
                      } else { return false; }
                      combinedName = d.data.name;
                  }
              }
          }
          
          function showNodeCode(d){
              linenum = getLineNum(d.data.name) - 1 + offset;
              d3.selectAll(".line").filter(function(){
                  if (parseInt(d3.select(this).attr("class").split(" ")[1]) === linenum) {
                      return true;
                    }
                  }).style("background", "yellow");
              
                  var elem = document.getElementById("code-view");
                  elem.scrollTop= linenum * 13;
                
          }
          function hideNodeCode(d) {
              linenum = getLineNum(d.data.name) - 1 + offset;
              d3.selectAll(".line").filter(function(){
                  if (parseInt(d3.select(this).attr("class").split(" ")[1]) === linenum) {
                      return true;
                    }
                  }).style("background", d3.select(this).oldColor);
              
                  var elem = document.getElementById("code-view");
                  elem.scrollTop= linenum * 13;
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
                        d.children.forEach(function(c) {
                            branch.push(c);
                            c.moveMe = true;
                            getWholeBranch(c);
                        });
                    }
                    if (d._children) {
                        d._children.forEach(function(c) {
                            branch.push(c);
                            getWholeBranch(c);
                        });
                    }
                }
                getWholeBranch(d);
                
                for (i=0; i<branch.length; i++) {
                    branch[i].moveMe = true;
                    if (branch[i].children) {
                        branch[i]._children = branch[i].children;
                        branch[i].children = null;
                    }
                    else {
                        branch[i].children = branch[i]._children;
                        branch[i]._children = null;
                    }
                }
            }
            d3.select(this).select("path")
                .attr("d", symbol.type(function(d){
                    if (d.open === 0) {
                        return d3.symbolCircle;
                    } else {
                        return d3.symbolTriangle;
                    }
                }))
                .attr('transform', "rotate(-90)")
                .attr("stroke-dasharray", function(d){ //stroke solid/dashed by direct or not
                  if (d._perfdata) {
                      if (d._perfdata.eval_direct === 1) {
                          return "3, 3"; 
                      } else if (d._perfdata.eval_direct === -1) {
                          return "3,1";
                      } else { return "0"; }
                  }
                  return "0";
                })
                .style("stroke", "black")
                .style("fill", function(d){ return d.oldColor; });
            update(d, fullRoot, perfdata, threshold, timetype, clicked=true);
          }
        } 
        function prettyprintTime(time) {
            //converting nanoseconds to nice-looking times
            timeInSeconds = time * 1e-9;
            var exp = -Math.floor( Math.log(timeInSeconds) / Math.log(10))+1;
            if (timeInSeconds > 1) { //second
                return (timeInSeconds).toFixed(2) + " s";
            }
            else if (exp === 1) {
                return (timeInSeconds).toFixed(2) + " s"; //millisecond
            }
            else if ((exp > 1) && (exp <= 4)) {
                return (timeInSeconds * 1000).toFixed(2) + " ms"; //millisecond
            } 
            else if ((exp > 4) && (exp <= 7)) {
                return (timeInSeconds * 1000000).toFixed(2)  + " us"; //microsecond
            }
            else if ((exp > 7) && (exp <= 10)){
                return (timeInSeconds * 1000000000).toFixed(2)  + " ns"; //nanosecond
            }
            else if ((exp > 10) && (exp <= 13)) {
                return (timeInSeconds * 1000000000000).toFixed(2)  + " ps"; //picosecond
            }
            return timeInSeconds + " s";
            
        }
        function toggleSwitchAction() {
            toggleswitch = document.getElementById("myCheck");
            (toggleswitch.checked === true) ? timetype = "EXCLUSIVE" : timetype = "INCLUSIVE";
         
            svg.selectAll(".node").selectAll("path").transition()
                    .style("fill", function(d){
                    if (d._perfdata) {
                        if (timetype === "EXCLUSIVE") {
                            //updateLegend(domainValsIn, greatestValIn, timetype);
                            if (d._perfdata.exclusiveTime < 0) {
                                //iconsole.log(d._perfdata.exclusiveTime);
                                return "magenta";
                            }
                            return colorExTimeScale(d._perfdata.exclusiveTime); //avg_Time
                        } else {
                            //updateLegend(domainValsEx, greatestValEx, timetype);
                            return colorInTimeScale(d._perfdata.inclusiveTime);
                        }
                    } else { return "black"; }
                });
                
            (timetype === "EXCLUSIVE") ? x.domain([0,greatestValEx]) : x.domain([0,greatestValIn]); 
            (timetype === "EXCLUSIVE") ? xAxis.tickValues(domainValsEx) : xAxis.tickValues(domainValsIn);
            d3.select(".x").transition().call(xAxis);
            
            var g = d3.select(".legend");
            g.select(".domain")
                .remove();
            
            (timetype === "EXCLUSIVE") ? currentColorTimeScale = colorExTimeScale : currentColorTimeScale = colorInTimeScale; 
            g.selectAll("rect")
                    .data(
                        currentColorTimeScale.range().map(function(color) {
                        var d = currentColorTimeScale.invertExtent(color);
                        if (d[0] === null) d[0] = x.domain()[0];
                        if (d[1] === null) d[1] = x.domain()[1];
                        return d;
                    }))
                    .transition()
                    .attr("x", function(d){ return x(d[0]); })
                    .attr("width", function(d){ return x(d[1]) - x(d[0]); })
                    .style("fill", function(d) {
                        return (timetype === "EXCLUSIVE") ? colorExTimeScale(d[0]) : colorInTimeScale(d[0]);
            });
            
        }
        function makeCodeArray() {
            codeArray = [];
            /*
            d3.text(physlfile, function(data){
                codeArray = data.split('\n');
            });  
            */
            codeText = document.getElementById("py-src").value;
            console.log(typeof codeText);
            console.log(codeText);
            codeArray = codeText.split('\n');
            
            return codeArray;
        }
        function getImportantTypeName(perfdata) {
            var importantName = "";
            if ((perfdata.display_name.includes("define-variable")) ||        
                  (perfdata.display_name.includes("variable"))  ||
                  (perfdata.display_name.includes("access-variable")) ||
        //            (perfdata.display_name.includes("access-argument")) ||
                  (perfdata.display_name.includes("access-function")) 
        //          (perfdata.display_name.includes("function"))  
                ) {
                  importantName =  perfdata.display_name.split("/")[1].split("(")[0];
              }
            return importantName;
        }
        function getLineNum(d) {
          var locationArray= d.split("$");//d.data.name.split("$");
          var linenum = parseInt(locationArray[locationArray.length - 2]);
          return linenum;
           
        }
        
        
        // START OF CODE
        console.log("HERE");
        var symbol = d3.symbol().size([100]);
        d3.selectAll(".node-shape-triangle").insert("g")
                .selectAll("path").data(["triangle"]).enter()
                .append("path")
                .attr("d", symbol.type(function(d) {
                    return d3.symbolTriangle;
                }))
                .attr("transform", "rotate(-90)")
                .attr("transform", "translate(10,9)")
                .style("stroke", "black")
                .style("fill", "white");
        d3.selectAll(".node-shape-circle").insert("g")
                .selectAll("path").data(["circle"]).enter()
                .append("path")
                .attr("d", symbol.type(function(d) {
                    return d3.symbolCircle;
                }))
                .attr("transform", "translate(10,6)")
                .style("stroke", "black")
                .style("fill", "white");
        d3.selectAll(".node-shape-cross").insert("g")
                .selectAll("path").data(["cross"]).enter()
                .append("path")
                .attr("d", symbol.type(function(d) {
                    return d3.symbolCross;
                }))
                .attr("transform", "translate(10,6)")
                .style("stroke", "black")
                .style("fill", "white");
            
        // Set the dimensions and margins of the diagram
        //width = window.innerWidth - margin.left - margin.right
        //height = window.innerHeight - margin.top - margin.bottom
        var margin = {top: 50, right: 90, bottom: 30, left: 30},
            codeviewDim = {width: 500, height: 500},
            width = element.offsetWidth - margin.left - margin.right,
            height = element.offsetWidth - margin.top - margin.bottom;
        /* http://bl.ocks.org/davegotz/bd54b56723c154d25eedde6504d30ad7 */
        tool_tip = d3.tip()
              .attr("class", "d3-tip")
              .offset([-255,-85])
              .html(function(d){ 
                 if (d.id === 1) {
                     return "<p>Function: " + d.data.name + "</p>";
                 }
                  if (d._perfdata.eval_direct === 0) { // 0 async
                      return "<p>Primitive instance: " + d._perfdata.display_name + "</p>"+
                            "<p>Count: " + d._perfdata.count + "</p>" +
                            "<p>Exclusive time: " + prettyprintTime(d._perfdata.exclusiveTime) + " </p>" +
                            "<p>Inclusive time (async): " + prettyprintTime(d._perfdata.inclusiveTime) + " </p>";
                  } else if (d._perfdata.eval_direct === 1) { // 1 direct
                      return "<p>Primitive instance: " + d._perfdata.display_name + "</p>" +
                            "<p>Count: " + d._perfdata.count + "</p>" +
                            "<p>Exclusive time: " + prettyprintTime(d._perfdata.exclusiveTime) + " </p>" +
                            "<p>Inclusive time (direct): " + prettyprintTime(d._perfdata.inclusiveTime) + " </p>";
                  } else if (d._perfdata.eval_direct === -1) { // -1 undecided
                      return "<p>Primitive instance: " + d._perfdata.display_name + "</p>" +
                            "<p>Count: " + d._perfdata.count + "</p>" +
                            "<p>Exclusive time: " + prettyprintTime(d._perfdata.exclusiveTime) + " </p>" +
                            "<p>Inclusive time (undecided): " + prettyprintTime(d._perfdata.inclusiveTime) + " </p>" +
                            "<p>Evaluation style (direct or async) determined at runtime.</p>"; 
                  } else {
                      return "<p>Primitive instance: " + d._perfdata.display_name + "</p>" +
                              "<p>Total time: " + prettyprintTime(d._perfdata.time) + " </p>";
                  }
                });
        tool_tip_south = d3.tip()
                .attr('class', 'd3-tip-s')
                .offset([-90,-250]) //maybe have a function here? -8
                .html(function(d){ 
                  if (d.id === 1) {
                      return "<p>Function: " + d.data.name + "</p>";
                  }
                  if (d._perfdata.eval_direct === 0) { // 0 async
                      return "<p>Primitive instance: " + d._perfdata.display_name + "</p>"+
                            "<p>Count: " + d._perfdata.count + "</p>" +
                            "<p>Exclusive time: " + prettyprintTime(d._perfdata.exclusiveTime) + " </p>" +
                            "<p>Inclusive time (async): " + prettyprintTime(d._perfdata.inclusiveTime) + " </p>";
                  } else if (d._perfdata.eval_direct === 1) { // 1 direct
                      return "<p>Primitive instance: " + d._perfdata.display_name + "</p>" +
                            "<p>Count: " + d._perfdata.count + "</p>" +
                            "<p>Exclusive time: " + prettyprintTime(d._perfdata.exclusiveTime) + " </p>" +
                            "<p>Inclusive time (direct): " + prettyprintTime(d._perfdata.inclusiveTime) + " </p>";
                  } else if (d._perfdata.eval_direct === -1) { // -1 undecided
                      return "<p>Primitive instance: " + d._perfdata.display_name + "</p>" +
                            "<p>Count: " + d._perfdata.count + "</p>" +
                            "<p>Exclusive time: " + prettyprintTime(d._perfdata.exclusiveTime) + " </p>" +
                            "<p>Inclusive time (undecided): " + prettyprintTime(d._perfdata.inclusiveTime) + " </p>" +
                            "<p>Evaluation style (direct or async) determined at runtime.</p>"; 
                  } else {
                      return "<p>Primitive instance: " + d._perfdata.display_name + "</p>" +
                              "<p>Total time: " + prettyprintTime(d._perfdata.time) + " </p>";
                  }
                });
        var svg = d3.select("#tree-vis").append("svg")
            .attr("id", "main-svg")
            .attr("width", (width + margin.right + margin.left) * 1.25 )
            .attr("height", (height + margin.top + margin.bottom) * 2)
          .append("g")
            .attr("width", width)// - margin.left - codeviewDim.width)
            .attr("height", height)// - margin.top)
            .attr("transform", "translate("
                  + margin.left + "," + margin.top + ")");
        var duration = 750,
            root,
            fullRoot;
            
        //svg.call(tool_tip);
        //svg.call(tool_tip_south);
        // declares a tree layout and assigns the size
        var treemap = d3.tree().size([(height-margin.bottom), width]);
        //Create a Vue for the code-view
        vmcode = new Vue({
                    el: '#code-view',
                    data: {
                        rawHtml: '<p style=\"font: \"Courier\";\">0 | Code View</p>',
                        windowWidth: codeviewDim.width,
                        message: ''
                    }
                });
        //codeData = makeCodeArray("als2.physl");
        codeArray = makeCodeArray();
        treeExists = false;
        HTMLElement.prototype.empty = function() {
            while (this.firstChild) {
                this.removeChild(this.firstChild);
            }
        }
        nodes2 = [];
        offset = 0; 
    })
})(element);
