from IPython.core.display import HTML, display
import html

def send_data(fun):
    display(HTML("<input type='hidden' id='py-csv' value='%s' />" % html.escape(fun.__perfdata__[0])))
    display(HTML("<input type='hidden' id='py-tree' value='%s' />" % html.escape(fun.__perfdata__[1])))
    display(HTML("<input type='hidden' id='py-graph' value='%s' />" % html.escape(fun.__perfdata__[2])))
    display(HTML("<input type='hidden' id='py-src' value='%s' />" % html.escape(fun.__src__)))