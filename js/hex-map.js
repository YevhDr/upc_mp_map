










/* ----- HEXAGON'S CODE -----*/
(function () {
    var max, scale,
        classes = 9,
        scheme = colorbrewer["BuGn"][classes],
        container = L.DomUtil.get('quake'),
        map = L.map(container).setView([49, 32], 6);

    // L.tileLayer('https://api.mapbox.com/styles/v1/evgeshadrozdova/cjcb287ab1cyf2smtu3om56w8/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXZnZXNoYWRyb3pkb3ZhIiwiYSI6ImNqMjZuaGpkYTAwMXAzMm5zdGVvZ2c0OHYifQ.s8MMs2wW15ZyUfDhTS_cdQ', {
    //     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(map);





    // Async call for data. Source URL is loaded from container element's
    // 'data-source' attribute.
    d3.csv('data/upc_mp_geocoded.csv', function (error, coffee) {

        function reformat (array) {
            var data = [];
            array.map(function (d){
                data.push({
                    properties: {
                        address: d.ADDRESS,
                        boss: d.BOSS
                    },
                    type: "Feature",
                    geometry: {
                        coordinates:[+d.Longitude,+d.Latitude],
                        type:"Point"
                    }
                });
            });
            return data;
        }

        var collection = { type: "FeatureCollection", features: reformat(coffee) };



        L.hexLayer(collection, {
            applyStyle: hex_style
        }).addTo(map);
    });

    /**
     * Hexbin style callback.
     *
     * Determines a quantize scale (http://bl.ocks.org/4060606) based on the
     * map's initial data density (which is based on the initial zoom level)
     * and applies a colorbrewer (http://colorbrewer2.org/) colour scheme
     * accordingly.
     */
    function hex_style(hexagons) {
        // Maintain a density scale relative to initial zoom level.
        if (!(max && scale)) {
            max = d3.max(hexagons.data(), function (d) { return d.length; });
            scale = d3.scale.quantize()
                .domain([0, 40])
                .range(d3.range(classes));
        }

        hexagons
            // .attr("stroke", scheme[classes - 1])
            .attr("stroke", "none")
            .attr("stroke-width", 2)
            .attr("fill", function (d) {
                return scheme[scale(d.length)];
            });
    }
}());

