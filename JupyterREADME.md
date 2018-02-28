**Instructions and Help**

Currently, I do not have a nice, neat command for the user to enter to generate the vis (something like `visualizeOutput(performance_data.csv, treeformat.csv)` would be nice). In order to modify the files, use CMD+F to find `filename` and physically change the names to your file (and path, if needed).

This package `py_d3` has a lot of quirks so lots of patience is required when executing this notebook. The Javascript console in the browser interacts with d3/Javascript in Jupyter so feel free to use `console.log` for printing to the console. A word of caution: having the console open will do strange things to the Jupyter notebook, such as mess with the mouse interactivity or ruin scrolling. Use the console to read print statements and debug, then close it before you make any further edits in Jupyter.

**Running**
To run the notebook with the d3 library loadedd, each cell must be executed one by one. If you get the error "d3 is not loaded yet", but you've already run the first cell `%load_ext py_d3`, run that cell again. This is a known "quirk".

Errors
1. If you see

`The py_d3 extension is already loaded. To reload it, use:
  %reload_ext py_d3`

ignore it. That's what I've done so far.

2. If you see

`Javascript error adding output!
Reference error: d3 not defined`

accept it. I've had this error thrown when using d3 with other programs. Things usually work just fine, after this initial complaint.

3. If you have completely screwed up the browser window (e.g. things have changed sizes, fonts are different, etc.), check your CSS. For example, I had a block that modified the divs in my d3. However, the style *applies to the whole page* so the divs in the Jupyter toolbar were being modified along with my d3 divs. Make sure you use names/classes specific to your d3 script only.

4. You may get various errors stating that some function x is not found (in my code d3.tree and d3.linkHorizontal() were called out at various stages). This is due to a known bug in the runtime version of d3. The default version of d3 that runs if you don't specify a version (e.g. %%d3 only) is 3.15.11. In my code, I am using some v4 features so my code has %%d3 4.2.2 as the top line. The problem is that there is a chance that when you run the cell, the notebook will use any of the d3 versions that you have previously declared (so in my case, it switches between 4.2.2 and 3.15.11 - hence why d3.tree breaks since it is d3.layout.tree in v3). Your best bet is to use the same version of d3 across all instances.
