#!/usr/bin/env python
from flask import Flask, render_template
import sys

# Create the application.
APP = Flask(__name__)

@APP.route('/')
def index(perfdata=None, treeformat=None, codedata=None):
    """   Displays the index page accessible at '/'    """
    script = sys.argv[0]
    firstCsv = True
    firstTree = True
    files = []
    for filename in sys.argv[1:]:
        if (".csv" in filename):
            if firstCsv:
                perfdata1 = str(filename)
                files.append(perfdata1)
            else:
                perfdata2 = str(filename)
                files.append(perfdata2)
                firstCsv = False
        if ".txt" in filename:
            if firstTree:
                treeformat1 = str(filename)
                files.append(treeformat1)
            else:
                treeformat2 = str(filename)
                files.append(treeformat2)
            firstTree = False
    if (len(sys.argv[1]) == 3) or (len(sys.argv[1]) == 5):
        codefile = str(sys.argv[1](len(sys.argv[1])-1))
        files.append(codefile)

    #return render_template('rectangles.html', perfdata=perfdata, treeformat=treeformat, codedata=codedata) 
    return render_template('index.html', files=files)


@APP.route('/rt_tree')
def rt_tree(perfdata=None, treeformat=None):
    script = sys.argv[0]
    for filename in sys.argv[1:]:
        if (".csv" in filename):
            perfdata = str(filename)
        elif (".txt" in filename):
            treeformat = str(filename)
    return render_template('reingold_tilford.html', perfdata=perfdata, treeformat=treeformat)

@APP.route('/rt_tree2')
def rt_tree2(perfdata=None, treeformat=None, codedata=None):
    script = sys.argv[0]
    for filename in sys.argv[1:]:
        if (".csv" in filename):
            perfdata = str(filename)
        elif ".txt" in filename:
            treeformat = str(filename)
        else:
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

@APP.route('/compare')
def two_rt_trees(perfdata1=None, treeformat1=None, perfdata2=None, treeformat2=None, codefile=None):
    script = sys.argv[0]
    firstCsv = True
    firstTree = True
    for filename in sys.argv[1:]:
        if (".csv" in filename):
            if firstCsv:
                perfdata1 = str(filename)
            else:
                perfdata2 = str(filename)
            firstCsv = False
        elif (".txt" in filename):
            if firstTree:
                treeformat1 = str(filename)
            else:
                treeformat2 = str(filename)
            firstTree = False
        elif (".physl" or ".cpp" or ".txt" or ".c" in filename):
            codefile = str(filename)

    return render_template('duo.html', perfdata1=perfdata1, treeformat1=treeformat1, \
        perfdata2=perfdata2, treeformat2=treeformat2, codefile=codefile)


def main():
    # script = sys.argv[0]
    # for filename in sys.argv[1:]:
    #     if (".csv" in filename):
	   #  perfdata = filename
  	 #    print perfdata
    #     if(".txt" in filename):
  	 #    treeformat = filename
          

    return

if __name__ == '__main__':
    APP.debug=True
    APP.run('0.0.0.0', 8001)

# @APP.route('/rects')
# def rects(perfdata=None, treeformat=None):
#     script = sys.argv[0]
#     for filename in sys.argv[1:]:
#         if (".csv" in filename):
#             perfdata = str(filename)
#         if (".txt" in filename):
#             treeformat = str(filename)
#     return render_template('rectangles.html', perfdata=perfdata, treeformat=treeformat)



#    @APP.route('/icicle')
# def icicle(perfdata=None, treeformat=None):
#     script = sys.argv[0]
#     for filename in sys.argv[1:]:
#         if (".csv" in filename):
#             perfdata = str(filename)
#         if (".txt" in filename):
#             treeformat = str(filename)
#     return render_template('icicle.html', perfdata=perfdata, treeformat=treeformat)
