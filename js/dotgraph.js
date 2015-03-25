// Generated by CoffeeScript 1.4.0
/*
# Objects for dealing with the Graphviz dot/xdot format.
# After obtaining an ast using DotParser.parser(source),
# you may find the following useful:
#
# astToStr: Turn an ast back into a string
#
# new DotGraph(ast): Get a dotgraph object.  Calling .walk on this
#   object will walk the ast and populate the .notes, .edges, and .graphs
#   properties.
#
# new XDotGraph(ast): Subclass of DotGraph.  Calling .walk will populate
#   .nodes, .edges, and .graphs and will parse any of the known attributes
#   to javascript objects and convert their values to pixels if necessary.
*/

var DotGraph, XDotGraph, astToStr,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

astToStr = function(ast, indentLevel, indentChar) {
  var attrListToStr, attrs, escape, indentStr, n, ret, _ref;
  if (indentLevel == null) {
    indentLevel = 0;
  }
  if (indentChar == null) {
    indentChar = '\t';
  }
  escape = function(s) {
    if (!(s != null)) {
      return "\"\"";
    }
    if (/^[a-zA-Z0-9]+$/.test(s) && !/^(graph|digraph|subgraph|node|edge|strict)$/.test(s)) {
      return s;
    } else {
      return "\"" + (('' + s).replace('"', '\\"')) + "\"";
    }
  };
  attrListToStr = function(l) {
    var attrStrings, e, s, _i, _len, _ref;
    if (!l || l.length === 0) {
      return "";
    }
    attrStrings = [];
    for (_i = 0, _len = l.length; _i < _len; _i++) {
      e = l[_i];
      s = e.id + "=";
      if ((_ref = e.eq) != null ? _ref.html : void 0) {
        s += "<" + e.eq.value + ">";
      } else {
        s += escape(e.eq);
      }
      attrStrings.push(s);
    }
    return "[" + (attrStrings.join(", ")) + "]";
  };
  ret = '';
  indentStr = new Array(indentLevel + 1).join(indentChar);
  if (ast instanceof Array) {
    ret = ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = ast.length; _i < _len; _i++) {
        n = ast[_i];
        _results.push(astToStr(n, indentLevel));
      }
      return _results;
    })()).join('\n');
  }
  switch (ast.type) {
    case 'digraph':
    case 'graph':
    case 'subgraph':
      if (ast.strict) {
        ret += indentStr + " strict " + ast.type;
      } else {
        ret += indentStr + ast.type;
      }
      if (ast.id) {
        ret += " " + ast.id;
      }
      ret += " {";
      if (ast.children.length === 0) {
        ret += " }\n";
      } else {
        ret += "\n";
        ret += astToStr(ast.children, indentLevel + 1);
        ret += "\n" + indentStr + "}";
      }
      break;
    case 'attr_stmt':
      ret += indentStr + ast.target;
      attrs = attrListToStr(ast.attr_list);
      if (attrs) {
        ret += " " + attrs;
      }
      break;
    case 'node_stmt':
      ret += indentStr + escape(ast.node_id.id);
      if (ast.node_id.port) {
        ret += ":" + (escape(ast.node_id.port.id));
      }
      if ((_ref = ast.node_id.port) != null ? _ref.compass_pt : void 0) {
        ret += ":" + ast.node_id.port.compass_pt;
      }
      attrs = attrListToStr(ast.attr_list);
      if (attrs) {
        ret += " " + attrs;
      }
      break;
    case 'edge_stmt':
      ret += indentStr + ((function() {
        var _i, _len, _ref1, _results;
        _ref1 = ast.edge_list;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          n = _ref1[_i];
          _results.push(astToStr(n, 0));
        }
        return _results;
      })()).join(' -> ');
      attrs = attrListToStr(ast.attr_list);
      if (attrs) {
        ret += " " + attrs;
      }
      break;
    case 'node_id':
      ret += indentStr + escape(ast.id);
  }
  return ret;
};

/*
# Takes in an AST of the dot/xdot file format
# and produces a graph object where nodes/edges/subgraphs
# may be queried for attributes
*/


DotGraph = (function() {
  var DotSubgraph, attrListToObj, copy, doubleCopy, giveRandomKey, mergeLeftNoOverried, mergeLeftOverried;

  giveRandomKey = function() {
    return Math.random().toFixed(8).slice(2);
  };

  mergeLeftNoOverried = function(obj1, obj2) {
    var k, v;
    for (k in obj2) {
      v = obj2[k];
      if (!(obj1[k] != null)) {
        obj1[k] = v;
      }
    }
    return obj1;
  };

  mergeLeftOverried = function(obj1, obj2) {
    var k, v;
    for (k in obj2) {
      v = obj2[k];
      obj1[k] = v;
    }
    return obj1;
  };

  copy = function(obj) {
    var k, ret, v;
    ret = {};
    for (k in obj) {
      v = obj[k];
      ret[k] = v;
    }
    return ret;
  };

  doubleCopy = function(obj) {
    var k, ret, v;
    ret = {};
    for (k in obj) {
      v = obj[k];
      ret[k] = copy(v);
    }
    return ret;
  };

  attrListToObj = function(list) {
    var attr, ret, _i, _len;
    ret = {};
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      attr = list[_i];
      ret[attr.id] = attr.eq;
    }
    return ret;
  };

  /*
      # Light object to hold nodes and attributes of subgraphs.
      # This is really just a container and doesn't have any processing capabilities
  */


  DotSubgraph = (function() {

    function DotSubgraph(id, type, parent) {
      this.id = id;
      this.type = type != null ? type : 'subgraph';
      this.parent = parent != null ? parent : null;
      if (!this.id) {
        this.id = giveRandomKey();
        this.autogeneratedId = true;
      }
      this.nodes = {};
      this.attrs = {};
      this.graphs = {};
    }

    DotSubgraph.prototype.toString = function() {
      return this.id;
    };

    return DotSubgraph;

  })();

  /****************************************
  # Here is where the DotGraph methods start
  */


  function DotGraph(ast) {
    this.ast = ast;
    this.nodes = {};
    this.edges = {};
    this.graphs = {};
    this.rootGraph = new DotSubgraph();
  }

  DotGraph.prototype.walk = function(ast) {
    var getAllNodes, walk,
      _this = this;
    if (ast == null) {
      ast = this.ast;
    }
    walk = function(tree, state, currentParentGraph) {
      var attrs, edge, elm, h, heads, id, node, oldParentGraph, t, tails, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2;
      if (state == null) {
        state = {
          node: {},
          edge: {},
          graph: {}
        };
      }
      if (tree instanceof Array) {
        for (_i = 0, _len = tree.length; _i < _len; _i++) {
          elm = tree[_i];
          walk(elm, state, currentParentGraph);
        }
      }
      switch (tree.type) {
        case 'graph':
        case 'digraph':
        case 'subgraph':
          oldParentGraph = currentParentGraph;
          currentParentGraph = new DotSubgraph(tree.id || null, tree.type, currentParentGraph);
          if (_this.graphs[currentParentGraph] != null) {
            currentParentGraph = _this.graphs[currentParentGraph];
          }
          if (oldParentGraph) {
            oldParentGraph.graphs[currentParentGraph] = currentParentGraph;
          }
          _this.graphs[currentParentGraph] = currentParentGraph;
          if ((_ref = tree.type) === 'graph' || _ref === 'digraph') {
            _this.rootGraph = currentParentGraph;
            _this.rootGraph.strict = tree.strict;
          }
          state = doubleCopy(state);
          walk(tree.children, state, currentParentGraph);
          break;
        case 'node_stmt':
          id = tree.node_id.id;
          _this.nodes[id] = _this.nodes[id] || {
            attrs: {}
          };
          mergeLeftOverried(_this.nodes[id].attrs, attrListToObj(tree.attr_list));
          mergeLeftNoOverried(_this.nodes[id].attrs, state.node);
          currentParentGraph.nodes[id] = true;
          break;
        case 'attr_stmt':
          mergeLeftOverried(state[tree.target], attrListToObj(tree.attr_list));
          break;
        case 'edge_stmt':
          _ref1 = tree.edge_list;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            node = _ref1[_j];
            if (node.type === 'node_id' && !(_this.nodes[node.id] != null)) {
              walk({
                type: 'node_stmt',
                node_id: node,
                attr_list: []
              }, state, currentParentGraph);
            } else if (node.type === 'subgraph') {
              walk(node, state, currentParentGraph);
            }
          }
          heads = getAllNodes(tree.edge_list[0]);
          _ref2 = tree.edge_list.slice(1);
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            node = _ref2[_k];
            tails = getAllNodes(node);
            for (_l = 0, _len3 = heads.length; _l < _len3; _l++) {
              h = heads[_l];
              for (_m = 0, _len4 = tails.length; _m < _len4; _m++) {
                t = tails[_m];
                edge = [h, t];
                attrs = mergeLeftNoOverried(attrListToObj(tree.attr_list), state.edge);
                _this.edges[edge] = _this.edges[edge] || [];
                _this.edges[edge].push({
                  edge: edge,
                  attrs: attrs
                });
              }
            }
            heads = tails;
          }
      }
      currentParentGraph.attrs = state.graph;
    };
    getAllNodes = function(tree) {
      var n, ret, _i, _len;
      ret = [];
      if (tree instanceof Array) {
        for (_i = 0, _len = tree.length; _i < _len; _i++) {
          n = tree[_i];
          ret = ret.concat(getAllNodes(n));
        }
        return ret;
      }
      switch (tree.type) {
        case 'node_id':
          ret.push(tree.id);
          break;
        case 'node_stmt':
          ret.push(tree.node_id.id);
          break;
        case 'edge_stmt':
          ret = ret.concat(getAllNodes(tree.edge_list));
          break;
        case 'graph':
        case 'digraph':
        case 'subgraph':
          ret = ret.concat(getAllNodes(tree.children));
      }
      return ret;
    };
    walk(ast);
    this.id = this.rootGraph.id;
    this.type = this.rootGraph.type;
    this.strict = this.rootGraph.strict;
    return this;
  };

  DotGraph.prototype.generateAst = function() {
    var e, genAttrsAst, genEdgesAst, genNodeAst, genSubgraphAst, k, root, v, _i, _len, _ref, _ref1;
    genAttrsAst = function(attrs) {
      var k, ret, v;
      if (!attrs || !attrs instanceof Object) {
        return null;
      }
      ret = [];
      for (k in attrs) {
        v = attrs[k];
        ret.push({
          type: 'attr',
          id: k,
          eq: v
        });
      }
      return ret;
    };
    genEdgesAst = function(edge) {
      var attrList, ret;
      ret = {
        type: 'edge_stmt',
        edge_list: [
          {
            type: 'node_id',
            id: edge.edge[0]
          }, {
            type: 'node_id',
            id: edge.edge[1]
          }
        ]
      };
      attrList = genAttrsAst(edge.attrs);
      if (attrList) {
        ret.attr_list = attrList;
      }
      return ret;
    };
    genNodeAst = function(id, attrs, html) {
      var attrList, ret;
      ret = {
        type: 'node_stmt',
        node_id: {
          type: 'node_id',
          id: id
        }
      };
      attrList = genAttrsAst(attrs.attrs);
      if (attrList) {
        ret.attr_list = attrList;
      }
      return ret;
    };
    genSubgraphAst = function(graph) {
      var k, ret, v, _ref, _ref1, _ref2;
      ret = {
        type: graph.type,
        id: graph.autogeneratedId ? null : graph.id,
        children: []
      };
      _ref = graph.graphs;
      for (k in _ref) {
        v = _ref[k];
        ret.children.push(genSubgraphAst(v));
      }
      _ref1 = graph.nodes;
      for (k in _ref1) {
        v = _ref1[k];
        ret.children.push(genNodeAst(k, v));
      }
      _ref2 = graph.edges;
      for (k in _ref2) {
        v = _ref2[k];
        ret.children.push(genEdgesAst(v));
      }
      if (Object.keys(graph.attrs).length > 0) {
        ret.children.push({
          type: 'attr_stmt',
          target: 'graph',
          attr_list: genAttrsAst(graph.attrs)
        });
      }
      return ret;
    };
    root = genSubgraphAst(this.rootGraph);
    if (this.strict) {
      root.strict = this.strict;
    }
    root.children = root.children || [];
    _ref = this.nodes;
    for (k in _ref) {
      v = _ref[k];
      root.children.push(genNodeAst(k, v));
    }
    _ref1 = this.edges;
    for (k in _ref1) {
      v = _ref1[k];
      for (_i = 0, _len = v.length; _i < _len; _i++) {
        e = v[_i];
        root.children.push(genEdgesAst(e));
      }
    }
    return root;
  };

  return DotGraph;

})();

/*
# Extension of the DotGraph object that will parse node/edge/graph
# attributes like pos, width, height, etc. into the appropriate javascript types.
#
# All attributes are normalized to pixels for easier drawing.
*/


XDotGraph = (function(_super) {
  var Edge, toFloatList;

  __extends(XDotGraph, _super);

  function XDotGraph() {
    return XDotGraph.__super__.constructor.apply(this, arguments);
  }

  toFloatList = function(list) {
    var v;
    if (typeof list === 'string') {
      list = list.split(/[, ]/);
    }
    return (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        v = list[_i];
        _results.push(parseFloat(v));
      }
      return _results;
    })();
  };

  Edge = (function() {

    function Edge(val) {
      var controlPoints, i;
      val = toFloatList(val);
      controlPoints = [];
      i = 3;
      while (i + 6 < val.length) {
        controlPoints.push(val.slice(i, i + 6));
        i += 6;
      }
      this.type = 'edge';
      this.origin = val.slice(1, 3);
      this.controlPoints = controlPoints;
      this.arrow = val.slice(-4);
    }

    Edge.prototype.toString = function() {
      var i, l, points, _i, _len, _ref;
      points = [this.origin[0], this.origin[1]];
      _ref = this.controlPoints;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        l = _ref[_i];
        points = points.concat(l);
      }
      points = points.concat(this.arrow.slice(-2));
      return "e," + (((function() {
        var _j, _ref1, _results;
        _results = [];
        for (i = _j = 0, _ref1 = points.length; _j < _ref1; i = _j += 2) {
          _results.push(points[i] + ',' + points[i + 1]);
        }
        return _results;
      })()).join(' '));
    };

    return Edge;

  })();

  XDotGraph.prototype.dpi = 36;

  XDotGraph.prototype.walk = function() {
    var processAttrs,
      _this = this;
    XDotGraph.__super__.walk.call(this);
    processAttrs = function(graph) {
      var attr, e, edge, g, h, n, val, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      if (!(graph != null)) {
        return;
      }
      _ref = (graph != null ? graph.nodes : void 0) || {};
      for (h in _ref) {
        n = _ref[h];
        _ref1 = (n != null ? n.attrs : void 0) || {};
        for (attr in _ref1) {
          val = _ref1[attr];
          n.attrs[attr] = _this.parseAttr(attr, val);
        }
      }
      _ref2 = (graph != null ? graph.edges : void 0) || {};
      for (h in _ref2) {
        e = _ref2[h];
        for (_i = 0, _len = e.length; _i < _len; _i++) {
          edge = e[_i];
          _ref3 = (edge != null ? edge.attrs : void 0) || {};
          for (attr in _ref3) {
            val = _ref3[attr];
            edge.attrs[attr] = _this.parseAttr(attr, val);
          }
        }
      }
      _ref4 = (graph != null ? graph.attrs : void 0) || {};
      for (attr in _ref4) {
        val = _ref4[attr];
        graph.attrs[attr] = _this.parseAttr(attr, val);
      }
      _ref5 = (graph != null ? graph.graphs : void 0) || {};
      for (h in _ref5) {
        g = _ref5[h];
        processAttrs(g);
      }
    };
    return processAttrs(this);
  };

  XDotGraph.prototype.parseAttr = function(attr, val) {
    if (!val) {
      return null;
    }
    switch (attr) {
      case 'width':
      case 'height':
        return parseFloat(val) * this.dpi;
      case 'bb':
      case 'lp':
        return toFloatList(val);
      case 'pos':
        if (val.charAt(0) === 'e') {
          /*
                              val = toFloatList(val)
                              controlPoints = []
                              # arrow pos are of the form "'e',startx,starty, <triplets of bzCurve xy-coords>, arrowTargetx, arrowTargety"
                              i = 2
                              while i + 6 < val.length
                                  controlPoints.push val.slice(i,i+6)
                                  i += 6
                              return {type: 'edge', origin: val[1..2], controlPoints: controlPoints, arrow: val.slice(-4)}
          */

          return new Edge(val);
        } else {
          return toFloatList(val);
        }
    }
    return val;
  };

  return XDotGraph;

})(DotGraph);

module.exports = DotGraph
