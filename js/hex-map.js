/* ----- HEXAGON'S CODE -----*/
(function () {
    var max, scale,
        classes = 9,
        scheme = colorbrewer["BuGn"][classes],
        container = L.DomUtil.get('quake'),
        map = L.map(container).setView([49, 32], 6);



    var pointsLayer = L.layerGroup();
    var hex = L.layerGroup();



    // Async call for data. Source URL is loaded from container element's
    // 'data-source' attribute.
    d3.csv('data/upc_mp_geocoded.csv', function (error, coffee) {
        var zoomLevel = map.getZoom();
        console.log(zoomLevel);

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
        //
        // hex.addTo(map);




        L.circle([49.5, 24.5], 100000, {
            color: 'red',
            fill: false,
            weight: 1,
            className: 'annotate'
        }).addTo(map);


        var textNode = d3.select('path.annotate').node(),  // DOM node
            parentNode = textNode.parentNode,
            parentParentNode = parentNode.parentNode;


        var popup = L.popup({
            maxWidth : 560,
            closeButton: false,
            autoClose: false

        })
            .setLatLng([49.5, 22.5])
            .setContent('<p class="changeSizeTip">Галичина<br/> - єдиний<br/>регіон,<br/>де майже<br/>немає<br/>УПЦ МП</p>')
            .openOn(map);



        map.on('zoomend', function () {
            var zoomLevel = map.getZoom();
            console.log(zoomLevel);

            var poppUp = $('#quake > div.leaflet-map-pane > div.leaflet-objects-pane > div.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div');
            var hexagons = $('.hexagon')
            var bigCircle = $('.annotate');
            var tooltip = $('.changeSizeTip');
            var popupBackgroundColor = $('.custom-popup');
           
            switch (zoomLevel) {
                case 6:
                    hexagons.css('display', 'block', 'important');
                    map.removeLayer(pointsLayer);
                    tooltip.css('display', 'block', 'important');
                    tooltip.css('font-size', 13, 'important');
                    tooltip.css('line-height', '15px', 'important');
                    bigCircle.css('display', 'block', 'important');
                    break;
                case 7:
                    hexagons.css('display', 'none', 'important');
                    map.removeLayer(hex);
                    pointsLayer.addTo(map);
                    bigCircle.css('display', 'none', 'important');
                    tooltip.css('display', 'none', 'important');
                    tooltip.css('line-height', '25px', 'important');
                    popupBackgroundColor.css('background', 'white');
                    popupBackgroundColor.css('opacity', '0.8');
                    break;
                case 8:
                    // pointsLayer.addTo(map);
                    // tooltip.css('display', 'none', 'important');
                    break;

                default:
                    pointsLayer.addTo(map);
                    tooltip.css('font-size', 13, 'important');
                    tooltip.css('line-height', '15px', 'important');

            }
        });

        var osmUrl='https://api.mapbox.com/styles/v1/evgeshadrozdova/cjfaw65ou7as82rp9ebb43532/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXZnZXNoYWRyb3pkb3ZhIiwiYSI6ImNqMjZuaGpkYTAwMXAzMm5zdGVvZ2c0OHYifQ.s8MMs2wW15ZyUfDhTS_cdQ';
        var osmAttrib='Map data &copy; OpenStreetMap contributors';
        var osm = new L.TileLayer(osmUrl, {minZoom: 6, maxZoom: 7, attribution: osmAttrib});

        var miniMap = new L.Control.MiniMap(osm).addTo(map);

        
        



            for (i = 0; i < coffee.length; i++) {
                    coffee[i].Latitude = +coffee[i].Latitude;
                    coffee[i].Longitude = +coffee[i].Longitude;

                    var circle =  L.circleMarker([coffee[i].Latitude, coffee[i].Longitude], {
                        radius: 5,
                        color: '#8d8d8d',
                        weight: 0.5,
                        fillColor: 'rgb(153,216,201)',
                        fillOpacity: 0.8,
                        riseOnHover: true,
                        className: 'point'
                    });

                var customOptions =
                {
                    'className' : 'custom'
                    
                };

                     circle
                         // .bindPopup(coffee[i].NAME + "<br><br>" +  coffee[i].ADDRESS)
                         // .bindPopup(coffee[i].NAME)
                         .bindPopup(coffee[i].ADDRESS, customOptions)
                         // .openPopup()
                         .addTo(pointsLayer);
                }

        

map.on('click', function(e) {
        map.setView(e.latlng, 7);
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
            max = d3.max(hexagons.data(), function (d) { return d.length; });
            scale = d3.scale.quantize()
                .domain([0, 50])
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

