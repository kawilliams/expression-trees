# expression-trees
Generating d3 expression tree visualizations with Newick-formatted trees.

Reingold-Tilford tree:
![Image of rt_tree](codeview.png)

Icicle plot:
![Image of icicle](icicle.png)

# To use
You will need [Flask](http://flask.pocoo.org/) installed in order to host the web pages for the visualizations. 

This Flask application follows the typical format with a Python file that establishes the browser and hosts the webpages, a `static` folder that holds the data about the trees (as well as `style.css`, `d3.v4.js`, and `d3-tip.js`), and the `templates` folder that holds the HTML files with the Javascript that display the data. 

To use, first save the Newick-formatted tree into a text file and the performance data into a csv. Be sure that the column headers ("count", "time", etc.) are the first line of the csv. Put the text file and csv file into the `static` folder. Also copy the algorithm `.cpp` file into the `static` folder. To run the program, enter `python tree.py static/myperformancedata.csv static/mynewicktree.txt static/myalg_csv_instrumented.cpp` into the command line. 

# ALS Example
In `static` are the test files that I used. The performance data is stored in `20180713_als_perfdata.csv`. The tree structure is stored in `20180713_als_tree.txt`. The algorithm file is `als_csv_instrumented.cpp`. The full command: `python tree.py static/20180713_als_tree.txt static/20180713_als_perfdata.csv static/als_csv_instrumented.cpp`. If things run properly, you should see 
```
* Running on http://0.0.0.0:8001/ (Press CTRL+C to quit)
* Restarting with stat
127.0.0.1 - - [29/Jun/2018 16:16:45] "GET /codeview HTTP/1.1" 200 -
127.0.0.1 - - [29/Jun/2018 16:16:45] "GET /codeview HTTP/1.1" 200 -
```
and see the tree by clicking `Reingold-Tilford tree` at the top of the page at http://0.0.0.0:8001/.

# Known issues



