#!/usr/bin/env python
from flask import Flask, render_template
import sys

# Create the application.
APP = Flask(__name__)


@APP.route('/')
def index(perfdata=None, treeformat=None, codedata=None):
    """   Displays the index page accessible at '/'    """
    script = sys.argv[0]
    for filename in sys.argv[1:]:
        if (".csv" in filename):
            perfdata = str(filename)
        if (".txt" in filename):
            treeformat = str(filename)
	if (".cpp" in filename):
 	    codedata = str(filename)
    return render_template('rectangles.html', perfdata=perfdata, treeformat=treeformat, codedata=codedata) 
#render_template('index.html')

@APP.route('/rects')
def rects(perfdata=None, treeformat=None):
    script = sys.argv[0]
    for filename in sys.argv[1:]:
        if (".csv" in filename):
            perfdata = str(filename)
        if (".txt" in filename):
            treeformat = str(filename)
    return render_template('rectangles.html', perfdata=perfdata, treeformat=treeformat)

@APP.route('/rt_tree')
def rt_tree(perfdata=None, treeformat=None):
    script = sys.argv[0]
    for filename in sys.argv[1:]:
        if (".csv" in filename):
            perfdata = str(filename)
	if (".txt" in filename):
	    treeformat = str(filename)
    return render_template('reingold_tilford.html', perfdata=perfdata, treeformat=treeformat)

@APP.route('/rt_tree2')
def rt_tree2(perfdata=None, treeformat=None, codedata=None):
    script = sys.argv[0]
    for filename in sys.argv[1:]:
        if (".csv" in filename):
            perfdata = str(filename)
        if (".txt" in filename):
            treeformat = str(filename)
	if (".cpp" in filename):
	    codedata = str(filename)
    return render_template('reingoldCV.html', perfdata=perfdata, treeformat=treeformat, codedata=codedata)

@APP.route('/codeview')
def codeview(perfdata=None, treeformat=None, physlfile=None):
    script = sys.argv[0]
    for filename in sys.argv[1:]:
        if (".csv" in filename):
            perfdata = str(filename)
        if (".txt" in filename):
            treeformat = str(filename)
	if (".physl" in filename):
	    physlfile = str(filename)
    return render_template('codeview.html', perfdata=perfdata, treeformat=treeformat, physlfile=physlfile)


@APP.route('/icicle')
def icicle(perfdata=None, treeformat=None):
    script = sys.argv[0]
    for filename in sys.argv[1:]:
        if (".csv" in filename):
            perfdata = str(filename)
        if (".txt" in filename):
            treeformat = str(filename)
    return render_template('icicle.html', perfdata=perfdata, treeformat=treeformat)

def main():
    script = sys.argv[0]
    for filename in sys.argv[1:]:
        if (".csv" in filename):
	    perfdata = filename
  	    print perfdata
        if(".txt" in filename):
  	    treeformat = filename
          

    return

if __name__ == '__main__':
    APP.debug=True
    APP.run('0.0.0.0', 8001)
