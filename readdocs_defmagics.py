from __future__ import print_function
from IPython.core.magic import (Magics, magics_class, line_magic,
                                cell_magic, line_cell_magic)
from IPython.display import (HTML, Javascript, Markdown, display)

# The class MUST call this class decorator at creation time
@magics_class
class MyMagics(Magics):

    def __dir__(self):
        return ['max_id']

    @line_magic
    def lmagic(self, line): 
        "my line magic"
        #print(dir(self))
        self.max_id = 22
        #print("Full access to the main IPython object:", self.shell)
        #print("Variables in the user namespace:", list(self.shell.user_ns.keys()))
        print(self.max_id)
        
        ip = get_ipython()
        ip.push({"katy":22, "potato":"french fry"}) # "name" here but name in ntbk
        load_js = '''
        <style>

        #vis-svg div {
          font: 10px sans-serif;
          background-color: steelblue;
          text-align: right;
          padding: 3px;
          margin: 1px;
          color: white;
        }
        </style>
        <svg id="vis-svg" width="720" height="420">
        </svg>
        <script src="d3.v4.min.js"></script>
        <script>
        data = [1, 2, 3, 4, 5];

        var x = d3.scale.linear()
        .domain([0, d3.max(data)])
        .range([0,420]);

        var colors = ["red", "yellow", "orange", "green", "blue", "purple", "pink"];

        d3.select("#vis-svg").selectAll("rect")
        .data(data)
        .enter().append("rect")
        .attr("width", 30)
        .attr("height", function(d) { return d*50;})
        .attr("x", function(d){ 
            return (d * 30); 
        })
        .attr("y", function(d){ return 0; })
        .style("fill", function(i){
            return colors[i];
        });
        </script>
        '''
        _load = HTML(load_js)
        display(_load)
        return line

    @cell_magic
    def cmagic(self, line, cell):
        "my cell magic"
        return line, cell

    @line_cell_magic
    def lcmagic(self, line, cell=None):
        "Magic that works both as %lcmagic and as %%lcmagic"
        if cell is None:
            print("Called as line magic")
            return line
        else:
            print("Called as cell magic")
            return line, cell
def load_ipython_extension(ipython):
    """
    Any module file that define a function named `load_ipython_extension`
    can be loaded via `%load_ext module.path` or be configured to be
    autoloaded by IPython at startup time.
    """
    # You can register the class itself without instantiating it.  IPython will
    # call the default constructor on it.
    ipython.register_magics(MyMagics)