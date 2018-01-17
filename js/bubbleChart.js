
var width = 960,
    height = 500,
    padding = 1.5, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 6;

var color = d3.scale.category20();

d3.csv("data/UPCMP_binds_uo.csv", function(error, data) {
    if (error) throw error;

    data.forEach(function (d) {
        d.KVED_freq= +d.KVED_freq;

    });

    var svg = d3.select("#bubbles").append("svg")
        .attr("width", width)
        .attr("height", height);

    var cs = [];
    data.forEach(function (d) {
        if(!cs.contains(d.KVED_section)) {
            cs.push(d.KVED_section);
        }
    });


    var n = data.length, // total number of nodes
        m = cs.length; // number of distinct clusters

//create clusters and nodes
    var clusters = new Array(m);
    var nodes = [];
    for (var i = 0; i < n; i++) {
        nodes.push(create_nodes(data, i));
    }


    var force = d3.layout.force()
        .nodes(nodes)
        .size([width, height])
        .gravity(.02)
        .charge(0)
        .on("tick", tick)
        .start();





    var node = svg.selectAll("circle")
        .data(nodes)
        .enter().append("g")
        // .call(force.drag)
        ;


    node.append("circle")
        .style("fill", function (d) {
            return color(d.cluster);
        })
        .attr("r", function(d){return d.radius})
        // .on("mouseover", tip.show )
        // .on("mouseout", tip.hide)
        ;






    function create_nodes(data,node_counter) {
        var i = cs.indexOf(data[node_counter].KVED_section),
            r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
            d = {
                cluster: i,
                radius: 7,
                text: data[node_counter].text,
                x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
                y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
            };
        if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
        return d;
    };



    function tick(e) {
        node.each(cluster(1 * e.alpha * e.alpha))
            // .each(collide(0.3))
            // .attr("transform", function (d) {
            //     var k = "translate(" + d.x + "," + d.y + ")";
            //     return k;
            // })

    }

// Move d to be adjacent to the cluster node.
    function cluster(alpha) {
        return function (d) {
            var cluster = clusters[d.cluster];
            if (cluster === d) return;
            var x = d.x - cluster.x,
                y = d.y - cluster.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius + cluster.radius;
            if (l != r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                cluster.x += x;
                cluster.y += y;
            }
        };
    }

// Resolves collisions between d and all other circles.
    function collide(alpha) {
        var quadtree = d3.geom.quadtree(nodes);
        return function (d) {
            var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function (quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
                    var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
                    if (l < r) {
                        l = (l - r) / l * alpha;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }



});

Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};



