# expression-trees
Generating d3 expression tree visualizations with Newick-formatted trees.

Reingold-Tilford tree:
![Image of rt_tree](codeview.png)

Icicle plot:
![Image of icicle](icicle.png)

# To use
You will need Flask installed in order to host the web pages for the visualizations. 

This Flask application follows the typical format with a Python file that establishes the browser and hosts the webpages, a `static` folder that holds the data about the trees, and the `templates` folder that holds the HTML files with the Javascript that display the data. 

To use, first save the Newick-formatted tree into a text file and the performance data into a csv. Be sure that the column headers ("count", "time", etc.) are the first line of the csv. Put the text file and csv file into the `static` folder. To run the program, enter `python tree.py static/myperformancedata.csv static/mynewicktree.txt` into the command line.

# Example

In `static` are the test files that I used. The performance data is stored in `20180625_perfdata_alsmovie.csv`. The tree structure is stored in `20180625_treeformat_alsmovie.txt`.

# Known issues
In this version of Indented Rectangles tree (), collapsing nodes via clicking does not work (likely linked to coloring issues).


