/* ----- HEXAGON'S CODE -----*/
(function () {

    var max, scale,
        osmAttrib = 'Map data &copy; OpenStreetMap contributors',
        classes = 9,
        scheme = colorbrewer["YlOrRd"][classes],
        container = L.DomUtil.get('desktop-map'),
        map = L.map(container, {
            zoomControl: false,
            attributionControl: osmAttrib,
            center: [49, 32],
            zoom: 6
        });

    L.control.zoom({
        position:'topright'
    }).addTo(map);


    d3.csv('data/upc_mp_geocoded.csv', function (error, upc) {
        var zoomLevel = map.getZoom();
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

        var collection = {type: "FeatureCollection", features: reformat(upc)};

//init hexagons
        var hex = L.hexLayer(collection, {
            applyStyle: hex_style,
            minZoom: 6,
            maxZoom: 8,
            radius: 9
        });
        //
        map.addLayer(hex);

//add big marker for Halychyna
        L.circle([49.5, 24.5], 100000, {
            color: '#59595C',
            fill: false,
            weight: 1,
            className: 'annotate'
        }).addTo(map);

//add big marker for Halychyna
        var popup = L.popup({
            maxWidth: 560,
            closeButton: false,
            autoClose: false
        })
            .setLatLng([49.5, 22.5])
            .setContent('<p class="changeSizeTip">Галичина<br/> - єдиний<br/>регіон,<br/>де майже<br/>немає<br/>УПЦ МП</p>')
            .openOn(map);

//on zoom
        map.on('zoomend', function () {
            var zoomLevel = map.getZoom(); //get current zoom
            console.log(zoomLevel);

            var poppUp = $('#desktop-map > div.leaflet-map-pane > div.leaflet-objects-pane > div.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div');
            var hexagons = $('path.hexagon');
            var bigCircle = $('#desktop-map > div.leaflet-map-pane > div.leaflet-objects-pane > div.leaflet-overlay-pane > svg.leaflet-zoom-animated > g:nth-child(1) > path');
            var tooltip = $('#desktop-map > div.leaflet-map-pane > div.leaflet-objects-pane > div.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > p');
            var popupBackgroundColor = $('.custom-popup');
            var description = $('p.description');

            switch (zoomLevel) {
                case 6: //what to display when zoom is 6
                    hexagons.css('display', 'block', 'important');
                    map.removeLayer(markers);
                    tooltip.css('display', 'block');
                    tooltip.css('font-size', 13, 'important');
                    tooltip.css('line-height', '15px', 'important');
                    bigCircle.css('display', 'block', 'important');
                    description.html('клікніть на карту, аби збільшити масштаб і побачити деталі');
                    break;
                case 7:
                    hexagons.css('display', 'block', 'important');
                    map.addLayer(markers);
                    bigCircle.css('display', 'none', 'important');
                    tooltip.css('display', 'none');
                    popupBackgroundColor.css('background', 'white');
                    popupBackgroundColor.css('opacity', '0.8');
                    description.html('громади УПЦ МП сгруповані за місцем розташування, збільшість карту ще трошки');
                    break;
                case 8:
                    hexagons.css('display', 'none', 'important');
                    bigCircle.css('display', 'none', 'important');
                    tooltip.css('display', 'none');
                    popupBackgroundColor.css('background', 'white');
                    popupBackgroundColor.css('opacity', '0.8');
                    description.html('одна точка позначає одну громаду, аби подивитись назву і адресу громади, натисність на позначку');
                    break;


                default:
                    tooltip.css('font-size', 13, 'important');
                    tooltip.css('line-height', '15px', 'important');
            }
        });



// add minimap
        var osmUrl = 'https://api.mapbox.com/styles/v1/evgeshadrozdova/cjfaw65ou7as82rp9ebb43532/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXZnZXNoYWRyb3pkb3ZhIiwiYSI6ImNqMjZuaGpkYTAwMXAzMm5zdGVvZ2c0OHYifQ.s8MMs2wW15ZyUfDhTS_cdQ';
        var osmAttrib = 'Map data &copy; OpenStreetMap contributors';
        var osm = new L.TileLayer(osmUrl, {minZoom: 6, maxZoom: 8, attribution: osmAttrib});
        var miniMap = new L.Control.MiniMap(osm).addTo(map);


// add circles
        var markers = L.markerClusterGroup({
            disableClusteringAtZoom: 8
        });

        for (i = 0; i < upc.length; i++) {
            upc[i].Latitude = +upc[i].Latitude;
            upc[i].Longitude = +upc[i].Longitude;

            var customOptions = {'className': 'custom'};

            var circle = L.circleMarker([upc[i].Latitude, upc[i].Longitude], {
                radius: 5,
                color: '#8d8d8d',
                weight: 0.5,
                fillColor: '#FAA61A',
                fillOpacity: 0.6,
                riseOnHover: true,
                className: 'point'
            })
            // .bindPopup(upc[i].ADDRESS, customOptions);
            .bindPopup(upc[i].NAME + "<br><br>" +  upc[i].ADDRESS, customOptions);
            // .bindPopup(upc[i].NAME)
            circle.addTo(markers);
        }

        map.on('click', function (e) {
        map.setView(e.latlng, 7);
        });

        if (map.scrollWheelZoom) {
            map.scrollWheelZoom.disable();
        }

        $('.leaflet-control-attribution').hide(); //remove 'copy'

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

