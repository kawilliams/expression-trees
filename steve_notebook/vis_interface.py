from __future__ import print_function
from IPython.core.magic import (Magics, magics_class, line_magic,
                                cell_magic, line_cell_magic)
from IPython.display import (HTML, Javascript, Markdown, display, clear_output)

'''
   File: Interface.py
   Purpose: Test interface between 
'''
@magics_class
class Interface(Magics):

    # Note to self: Custom magic classes MUST call parent's constructor
    def __init__(self, shell):
        display(Javascript("require.config({ \
                                            baseUrl: './', \
                                            paths: { d3: 'https://d3js.org/d3.v4.min',\
                                                     vue: 'https://cdn.jsdelivr.net/npm/vue/dist/vue',\
                                                     jquery: 'https://code.jquery.com/jquery-2.1.1.min',\
                                                     d3tip: 'd3-tip',} });"))
        super(Interface, self).__init__(shell)
        # Clean up namespace function
        display(HTML("<script>function cleanUp() { argList =[]; element = null; cell_idx = -1}</script>"))
                
    inputType = {"js": "text/javascript",
                 "csv": "text/csv",
                 "html": "text/html",
                 "css": "text/css"}
    codeMap = {}
    
    @line_magic
    def loadVisualization(self, line):
        # Get command line args for loading the vis
        args = line.split(" ")
        name = args[0]
        javascriptFile = open(args[1]).read()
        #self.codeMap[name] = javascriptFile
        # Source input files
        # Set up the object to map inout files to what javascript expects
        argList = '<script> var argList = []; var elementTop = null; var cell_idx = -1;</script>'
        display(HTML(argList))
        #noScroll = """IPython.OutputArea.prototype._should_scroll = function(lines) {return false;}"""
        #display(Javascript(noScroll))
        for i in range(1, len(args), 1):
            if("." in args[i]):
                try:
                    display(HTML("<script src=" + args[i] + " type=" + self.inputType[args[i].split(".")[1]] +"></script>"))
                except:
                    print("Unknown file format")
                if(args[i].split(".")[1] == "html" or args[i].split(".")[1] == "css"):
                    fileVal = open(args[i]).read()
                    if(args[i].split(".")[1] == "html"):
                        display(HTML(fileVal))
                    elif(args[i].split(".")[1] == "css"):
                        display(Javascript(fileVal))
            display(Javascript('argList.push("' + str(args[i]) + '")'))
            
        # Get curent cell id
        self.codeMap[name] = javascriptFile
        preRun = """
        // Grab current context
        elementTop = element.get(0);"""
        display(Javascript(preRun))
        self.runViz(name, javascriptFile)
   
    def runViz(self, name, javascriptFile):
        header = """
                  <div id=\""""+name+"""\"></div>
                  <script>
                  elementTop.appendChild(document.getElementById('"""+str(name)+"""'));
                  element = document.getElementById('"""+str(name)+"""');"""
        footer = """</script>"""
        display(HTML(header + javascriptFile + footer))
    
    @line_magic
    def fetchData(self, line):
        args = line[1:-1].split()
        location = args[0][:-1]
        dest = args[1][:-1]
        source = args[2]
        hook = """
                var holder = """+str(source)+""";
                console.log(holder);
                IPython.notebook.kernel.execute('"""+str(dest)+""" = ' + holder);
               """
        display(Javascript(hook))
            
# Function to make module loading possible
def load_ipython_extension(ipython):
    ipython.register_magics(Interface)
