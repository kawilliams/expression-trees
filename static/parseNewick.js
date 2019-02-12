// Copyright 2011 Jason Davies https://github.com/jasondavies/newick.js
console.log("parseNewick");
function parseNewick(a) {
    for (var e = [], r = {}, s = a.split(/\s*(;|\(|\)|,|:)\s*/), t = 0; t < s.length; t++) {
        var n = s[t];
        switch (n) {
            case"(":
                var c = {};
                r.branchset = [c], e.push(r), r = c;
                break;
            case",":
                var c = {};
                e[e.length - 1].branchset.push(c), r = c;
                break;
            case")":
                r = e.pop();
                break;
            case":":
                break;
            default:
                var h = s[t - 1];
                ")" == h || "(" == h || "," == h ? r.name = n : ":" == h && (r.length = parseFloat(n))
        }
    }
    return r;
}