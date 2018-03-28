/* ----- HEXAGON'S CODE -----*/
(function () {

    var max, scale,
        osmAttrib = 'Map data &copy; OpenStreetMap contributors',
        classes = 9,
        scheme = colorbrewer["YlOrRd"][classes],
        container = L.DomUtil.get('mob-map'),
        mobmap = L.map(container, {
            zoomControl: false,
            attributionControl: osmAttrib,
            center: [49, 32],
            zoom: 5
        });

    L.control.zoom({
        position:'topright'
    }).addTo(mobmap);


    d3.csv('data/upc_mp_geocoded.csv', function (error, coffee) {
        var zoomLevel = mobmap.getZoom();
        console.log(zoomLevel);

        function reformat(array) {
            var data = [];
            array.map(function (d) {
                data.push({
                    properties: {
                        address: d.ADDRESS,
                        boss: d.BOSS
                    },
                    type: "Feature",
                    geometry: {
                        coordinates: [+d.Longitude, +d.Latitude],
                        type: "Point"
                    }
                });
            });
            return data;
        }

        var collection = {type: "FeatureCollection", features: reformat(coffee)};


        var hex = L.hexLayer(collection, {
            applyStyle: hex_style,
            minZoom: 5,
            maxZoom: 7,
            radius: 5
        });
        //
        mobmap.addLayer(hex);


        L.circle([49.5, 24.5], 100000, {
            color: '#59595C',
            fill: false,
            weight: 1,
            className: 'annotate'
        }).addTo(mobmap);


        var popup = L.popup({
            maxWidth: 560,
            closeButton: false,
            autoClose: false
        })
            .setLatLng([49.5, 22.5])
            .setContent('<p class="changeSizeTip">Галичина<br/> - єдиний<br/>регіон,<br/>де майже<br/>немає<br/>УПЦ МП</p>')
            .openOn(mobmap);


        mobmap.on('zoomend', function () {
            var zoomLevel = mobmap.getZoom();
            console.log(zoomLevel);
            
});



// add minimap



// add circles

        // var markers = L.markerClusterGroup({
        //     disableClusteringAtZoom: 8
        // });
        //
        // for (i = 0; i < coffee.length; i++) {
        //     coffee[i].Latitude = +coffee[i].Latitude;
        //     coffee[i].Longitude = +coffee[i].Longitude;
        //
        //     var customOptions = {'className': 'custom'};
        //
        //     var circle = L.circleMarker([coffee[i].Latitude, coffee[i].Longitude], {
        //         radius: 5,
        //         color: '#8d8d8d',
        //         weight: 0.5,
        //         fillColor: '#FAA61A',
        //         fillOpacity: 0.6,
        //         riseOnHover: true,
        //         className: 'point'
        //     })
        //     // .bindPopup(coffee[i].ADDRESS, customOptions);
        //     .bindPopup(coffee[i].NAME + "<br><br>" +  coffee[i].ADDRESS, customOptions);
        //     // .bindPopup(coffee[i].NAME)
        //     circle.addTo(markers);
        // }
        //
        // markers.on("clusterclick", function(a){
        //     if (a.layer._markers.length > 0) {
        //         console.log("layer at max zoom");
        //     } else {
        //         console.log("layer not at max zoom");
        //     }
        // });

        // markers.addTo(map);

        mobmap.on('click', function (e) {
            mobmap.setView(e.latlng, 5);
        });

       

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
            max = d3.max(hexagons.data(), function (d) {
                return d.length;
            });
            scale = d3.scale.quantize()
                .domain([0, 70])
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

