var urbaClic;


var urbaClicUtils = {};

urbaClicUtils.urlify = function (text) {
    if ('string' != typeof text) return text;
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
    })

};



urbaClicUtils.closestF = {
    distance: function (map, latlngA, latlngB) {
        return map.latLngToLayerPoint(latlngA).distanceTo(map.latLngToLayerPoint(latlngB));
    },

    closest: function (map, layer, latlng, vertices) {
        if (typeof layer.getLatLngs != 'function')
            layer = L.polyline(layer);

        var latlngs = layer.getLatLngs(),
            mindist = Infinity,
            result = null,
            i, n, distance;



        // Lookup vertices
        if (vertices) {
            for (i = 0, n = latlngs.length; i < n; i++) {
                var ll = latlngs[i];
                distance = urbaClicUtils.closestF.distance(map, latlng, ll);
                if (distance < mindist) {
                    mindist = distance;
                    result = ll;
                    result.distance = distance;
                }
            }
            return result;
        }

        if (layer instanceof L.Polygon) {
            latlngs.push(latlngs[0]);
        }




        // Keep the closest point of all segments
        for (i = 0, n = latlngs.length; i < n - 1; i++) {
            var latlngA = latlngs[i],
                latlngB = latlngs[i + 1];
            distance = urbaClicUtils.closestF.distanceSegment(map, latlng, latlngA, latlngB);

            if (distance <= mindist) {
                mindist = distance;
                result = urbaClicUtils.closestF.closestOnSegment(map, latlng, latlngA, latlngB);
                result.distance = distance;
            }
        }
        return result;
    },

    closestLayer: function (map, layers, latlng) {

        var mindist = Infinity,
            result = null,
            ll = null,
            distance = Infinity;

        for (var i = 0, n = layers.length; i < n; i++) {
            var layer = layers[i];
            // Single dimension, snap on points, else snap on closest
            if (typeof layer.getLatLng == 'function') {
                ll = layer.getLatLng();
                distance = urbaClicUtils.closestF.distance(map, latlng, ll);
            } else {
                if (typeof layer.getLayers == 'function') {
                    var mindist2 = Infinity;
                    var layers2 = layer.getLayers();
                    for (var i2 = 0, n2 = layers2.length; i2 < n2; i2++) {
                        var layer2 = layers2[i2];
                        ll = urbaClicUtils.closestF.closest(map, layer2, latlng);
                        if (ll && ll.distance < mindist2) {
                            distance = ll.distance;
                            mindist2 = distance;
                        }
                    }

                } else {
                    ll = urbaClicUtils.closestF.closest(map, layer, latlng);
                    if (ll) distance = ll.distance; // Can return null if layer has no points.
                }
            }

            if (distance < mindist) {
                mindist = distance;
                result = {
                    layer: layer,
                    latlng: ll,
                    distance: distance
                };
            }
        }
        return result;
    },

    distanceSegment: function (map, latlng, latlngA, latlngB) {

        var p = map.latLngToLayerPoint(latlng),
            p1 = map.latLngToLayerPoint(latlngA),
            p2 = map.latLngToLayerPoint(latlngB);

        //console.log(p.toString(), p1.toString(), p2.toString(), L.LineUtil.pointToSegmentDistance(p, p1, p2));
        return L.LineUtil.pointToSegmentDistance(p, p1, p2);
    },

    closestOnSegment: function (map, latlng, latlngA, latlngB) {
        var maxzoom = map.getMaxZoom();
        if (maxzoom === Infinity)
            maxzoom = map.getZoom();
        var p = map.project(latlng, maxzoom),
            p1 = map.project(latlngA, maxzoom),
            p2 = map.project(latlngB, maxzoom),
            closest = L.LineUtil.closestPointOnSegment(p, p1, p2);
        return map.unproject(closest, maxzoom);
    },

};

urbaClicUtils.baseLayers = {
    "OSM-Fr": {
        "title": "OSM-Fr",
        "url": "//tilecache.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
    },
    "Positron": {
        "title": "Positron",
        "url": "//cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
    },
    "Outdoors_OSM": {
        "title": "Outdoors (OSM)",
        "url": "//{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png"
    },
    "OSM_Roads": {
        "title": "OSM Roads",
        "url": "//korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}"
    },
    "Dark_Matter": {
        "title": "Dark Matter",
        "url": "//cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
    },
    "OpenStreetMap": {
        "title": "OpenStreetMap",
        "url": "//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    },
    "Toner": {
        "title": "Toner",
        "url": "//{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png"
    },
    "Landscape": {
        "title": "Landscape",
        "url": "//{s}.tile3.opencyclemap.org/landscape/{z}/{x}/{y}.png"
    },
    "Transport": {
        "title": "Transport",
        "url": "//{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png"
    },
    "MapQuest_Open": {
        "title": "MapQuest Open",
        "url": "//otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png"
    },
    "HOTOSM_style": {
        "title": "HOTOSM style",
        "url": "//tilecache.openstreetmap.fr/hot/{z}/{x}/{y}.png"
    },
    "OpenCycleMap": {
        "title": "OpenCycleMap",
        "url": "//{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png"
    },
    "Watercolor": {
        "title": "Watercolor",
        "url": "//{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png"
    },
    "hikebikemap": {
        "title": "hikebikemap",
        "url": "//toolserver.org/tiles/hikebike/{z}/{x}/{y}.png"
    },
    "OSM-monochrome": {
        "title": "OSM-monochrome",
        "url": "//www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png"
    },
    "Hydda": {
        "title": "Hydda",
        "url": "//{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png"
    },
    "OpenTopoMap": {
        "title": "OpenTopoMap",
        "url": "//{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
    },
    "OpenRiverboatMap": {
        "title": "OpenRiverboatMap",
        "url": "//tilecache.openstreetmap.fr/openriverboatmap/{z}/{x}/{y}.png"
    }
};


urbaClicUtils.IGNLayersTitles = {

};


urbaClicUtils.getModelLayer = function (m, ign_key) {
    var title = m;

    bl = urbaClicUtils.baseLayers[m];
    if (bl) return {
        title: bl.title,
        layer: new L.tileLayer(bl.url)
    };

    if (m.search(/^IGN:/) === 0) {
        m = m.replace(/^IGN:/, '');

        var matrixIds3857 = new Array(22);
        for (var i = 0; i < 22; i++) {
            matrixIds3857[i] = {
                identifier: "" + i,
                topLeftCorner: new L.LatLng(20037508, -20037508)
            };
        }

        var options = {
            layer: m,
            style: 'normal',
            tilematrixSet: "PM",
            matrixIds: matrixIds3857,
            format: 'image/jpeg',
            attribution: "&copy; <a href='http://www.ign.fr'>IGN</a>"
        };


        if (m == 'CADASTRALPARCELS.PARCELS') {
            options.format = 'image/png';
            options.style = 'bdparcellaire';
        }

        var layer = new L.TileLayer.WMTS('http://wxs.ign.fr/' + ign_key + '/geoportail/wmts', options);

        return {
            title: i18n.t(valuetitle),
            layer: layer
        };
    }

    console.log('baselayer model not found: ' + m);
    return false;
}

jQuery(document).ready(function ($) {

    var Templates = {};



    var sortDesc = false;


    Templates.autocomplete = [
        '{{#each features}}',
        '<li><a href="#" data-feature="{{jsonencode .}}" data-type="{{properties.type}}" tabindex="1000">',
        '   {{marks properties.label ../query}}',
        //'   {{properties.label}}',
        '   &nbsp;<i>{{_ properties.type}}</i>',
        '</a></li>',
        '{{/each}}',
    ];






    Templates.shareLink = [
        '<div class="uData-shareLink">',
        '<div class="linkDiv"><a href="#">intégrez cet outil de recherche sur votre site&nbsp;<i class="fa fa-share-alt"></i></a></div>',
        '<div class="hidden">',
        '   <h4>Vous pouvez intégrer cet outil de recherche de données sur votre site</h4>',
        '   <p>Pour ceci collez le code suivant dans le code HTML de votre page</p>',
        '   <pre>',
        '&lt;script&gt;window.jQuery || document.write("&lt;script src=\'//cdnjs.cloudflare.com/ajax/libs/jquery/2.2.0/jquery.min.js\'&gt;&lt;\\\/script&gt;")&lt;/script&gt;',
        '',
        '&lt;!-- chargement feuille de style font-awesome --&gt;',
        '&lt;link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css"&gt;',
        '',
        '&lt;script src="{{baseUrl}}udata.js"&gt;&lt;/script&gt;',
        '&lt;div class="uData-data"',
        '   data-q="{{q}}"',
        '   data-organizations="{{organizationList}}"',
        '   data-organization="{{organization}}"',
        '   data-page_size="{{page_size}}"',
        '&gt&lt;/div&gt',
        '   </pre>',
        "   <p>vous pouvez trouver plus d'info sur cet outil et son paramétrage à cette adresse: <a href='https://github.com/DepthFrance/udata-js' target='_blank'>https://github.com/DepthFrance/udata-js</a></p>",
        '</div>',
        '</div>',
    ];


    Templates.parcelleData = [

        '{{#ifCond adresse "!=" null}}',

        '<div class="position">',
        '<h4>position</h4>',

        '<table>',
        '<tr>',
        '<th class="position">coordonnées marqueur</th>',
        '<th class="adresse">Adresse estimée</th>',
        '</tr>',
        '<tr>',
        '<td class="position">{{latlng.lat}}, {{latlng.lng}}</td>',
        '{{#with adresse}}',
        '<td class="adresse">{{name}} {{postcode}} {{city}}</td>',
        '</tr>',
        '</table>',

        '</div>',
        '{{/with}}',
        '{{/ifCond}}',

        '{{#ifCond cadastre "!=" undefined}}',
        '{{#with cadastre}}',
        '<div class="cadastre">',
        '<h4>cadastre</h4>',

        '<table>',
        '<tr>',
        '<th class="parcelle_id">ID</th>',
        '<th class="code_dep">code_dep</th>',
        '<th class="code_com">code_com</th>',
        '<th class="nom_com">nom_com</th>',
        '<th class="code_arr">code_arr</th>',
        '<th class="com_abs">com_abs</th>',
        '<th class="feuille">feuille</th>',
        '<th class="section">section</th>',
        '<th class="numero">numero</th>',
        '<th class="surface_parcelle">surface parcelle</th>',
        '</tr>',
        '<tr>',
        '<td class="parcelle_id">{{../parcelle_id}}</td>',
        '<td class="code_dep">{{code_dep}}</td>',
        '<td class="code_com">{{code_com}}</td>',
        '<td class="nom_com">{{nom_com}}</td>',
        '<td class="code_arr">{{code_arr}}</td>',
        '<td class="com_abs">{{com_abs}}</td>',
        '<td class="feuille">{{feuille}}</td>',
        '<td class="section">{{section}}</td>',
        '<td class="numero">{{numero}}</td>',
        '<td class="surface_parcelle">{{round surface_parcelle}}m²</td>',
        '</tr>',
        '</table>',

        '</div>',
        '{{/with}}',
        '{{/ifCond}}',




        '{{#ifCond plu "!=" null}}',
        '{{#with plu}}',
        '<div class="plu">',
        '<h4>PLU</h4>',

        '<table>',
        '<tr>',
        '<th class="libelle">Libellé</th>',
        '<th class="txt">Texte</th>',
        '</tr>',
        '<tr>',
        '<td class="libelle">{{LIBELLE}}</td>',
        '<td class="txt">{{TXT}}</td>',
        '</tr>',
        '</table>',

        '</div>',
        '{{/with}}',
        '{{/ifCond}}',

        '{{#ifCond servitudes "!=" null}}',
        '<div class="servitudes">',
        '<h4>servitudes</h4>',

        '{{#ifCount servitudes "==" 0}}',
        '<ul>',
        '<li>aucune</li>',
        '</ul>',
        '{{else}}',

        '<p>La parcelle est concernée par {{count servitudes}} servitudes</p>',
        '<table>',
        '<tr>',
        '<th class="servitude_id">ID</th>',
        '<th class="name">nom</th>',
        '<th class="type">type</th>',
        '<th class="code_merimee">Code Mérimée</th>',
        '</tr>',
        '{{#each servitudes}}',
        '<tr>',
        '<td class="servitude_id"><div class="map" data-servitudeid="{{id}}"></div>{{id}}</td>',
        '<td class="name">{{nom}}</td>',
        '<td class="type">{{type}}</td>',
        '<td class="code_merimee">{{codeMerimee}}</td>',
        '</tr>',

        '{{/each}}',
        '</table>',
        '</ul>',

        '{{/ifCount}}',
        '</div>',
        '{{/ifCond}}'

    ];





    //var baseUrl = jQuery('script[src$="/urbaclic.js"]')[0].src.replace('/urbaclic.js', '/');
    var baseUrl = jQuery('script[src$="/main.js"]')[0].src.replace('/main.js', '/../dist/');

    var _urbaclic = {};


    urbaClic = function (obj, options) {
        var container = obj;

        var cadastre_min_zoom = 17;

        var map = null;

        var current_citycode = null;

        var layers = {
            ban: null,
            adresse: null,
            parcelle: null,
            // parcelles: null
        }

        var backgroundLayers = {};

        var urbaClic_options = {
            showMap: true,
            showData: true,
            sharelink: false,
            getadresse: true,
            getservitude: true,
            getPlu: true,
            sharelink: false,
            autocomplete_limit: 50,
            leaflet_map_options: {},
            ign_key: null,
            background_layers: ['OpenStreetMap', 'MapQuest_Open', 'OpenTopoMap']
        };

        var ban_query = null;
        var cadastre_query = null;
        var zoom_timeout = null;
        var focusOff_timeout = null;
        var loadParcelle_timeout = null;

        var current_parcelle = {
            loadings: []
        };

        urbaClic_options = jQuery.extend(urbaClic_options, options);

        //console.log(urbaClic_options);

        var autocomplete_params = {};
        for (var i in urbaClic_options) {
            if (i.search('autocomplete_') == 0) {
                var k = i.substring('autocomplete_'.length);
                autocomplete_params[k] = urbaClic_options[i];
            }
        }

        var input = container.find('#urbaclic-search');

        var ban_options = autocomplete_params;

        var default_template = function (feature) {
            var html = '';
            jQuery.each(feature.properties, function (k, v) {
                html += '<tr><th>' + k + '</th><td>' + urbaClicUtils.urlify(v) + '</td></tr>';
            });
            html = '<table class="table table-hover table-bordered">' + html + '</table>';
            return html;
        };

        var circle_pointToLayer = function (feature, latlng) {

            var geojsonMarkerOptions = {
                radius: 3
            };

            return L.circleMarker(latlng, geojsonMarkerOptions);
        };

        var updateLayerController = function () {
            var loadedLayers = [];
            for (var i in layers) {
                if (layers[i] != null) loadedLayers[i] = layers[i];
            }
            map.layerController.removeFrom(map);
            map.layerController = L.control.layers(backgroundLayers, loadedLayers).addTo(map);
        }

        _urbaclic.addBackground = function (title, layer, show) {
            backgroundLayers[title] = layer;
            if (show === true) layer.addTo(map);
            updateLayerController();

        }


        var autocomplete = function () {


            if (ban_query) ban_query.abort();
            input.prop('tabindex', 1000);
            var t = input.val();

            if (t.length > 1) {

                var ul = container.find('ul.urbaclic-autocomplete');
                if (!ul.length) {
                    ul = jQuery('<ul class="urbaclic-autocomplete"></ul>').insertAfter(input).hide();
                    ul.css('top', input.outerHeight() - 2);
                }

                var url = BAN_API + 'search/';
                var params = ban_options;
                params.q = t;

                ban_query = jQuery.getJSON(url, params, function (data) {
                    ban_query = null;
                    //TODO filter data with BBox
                    if (data.features.length) {
                        ul.html(Templates.autocomplete(data)).slideDown();


                        var tbindex = 1000;
                        container.find('ul.urbaclic-autocomplete a').each(function () {
                            tbindex++;
                            jQuery(this).prop('tabindex', tbindex);
                        });

                        if (data.features.length == 1) {
                            initMarker(container.find('ul.urbaclic-autocomplete a').first().data());
                        }



                    } else {
                        ul.html('').fadeOut();
                    }
                });
            } else {
                container.find('ul.urbaclic-autocomplete').html('').slideUp();
            }
        }

        var initMap = function () {

            /*
             * Copyright (c) 2008-2014 Institut National de l'Information Geographique et Forestiere (IGN) France.
             * Released under the BSD license.
             */
            /*---------------------------------------------------------
             *Nouvelle classe de Leaflet pour supporter les flux WMTS (basÃ©e sur L.TileLayer.WMS)
             *New Leaflet's class to support WMTS (based on L.TileLayer.WMS)
             */
            L.TileLayer.WMTS = L.TileLayer.extend({

                defaultWmtsParams: {
                    service: 'WMTS',
                    request: 'GetTile',
                    version: '1.0.0',
                    layer: '',
                    style: '',
                    tilematrixSet: '',
                    format: 'image/jpeg'
                },

                initialize: function (url, options) { // (String, Object)
                    this._url = url;
                    var wmtsParams = L.extend({}, this.defaultWmtsParams),
                        tileSize = options.tileSize || this.options.tileSize;
                    if (options.detectRetina && L.Browser.retina) {
                        wmtsParams.width = wmtsParams.height = tileSize * 2;
                    } else {
                        wmtsParams.width = wmtsParams.height = tileSize;
                    }
                    for (var i in options) {
                        // all keys that are not TileLayer options go to WMTS params
                        if (!this.options.hasOwnProperty(i) && i != "matrixIds") {
                            wmtsParams[i] = options[i];
                        }
                    }
                    this.wmtsParams = wmtsParams;
                    this.matrixIds = options.matrixIds;
                    L.setOptions(this, options);
                },

                onAdd: function (map) {
                    L.TileLayer.prototype.onAdd.call(this, map);
                },

                getTileUrl: function (tilePoint, zoom) { // (Point, Number) -> String
                    var map = this._map;
                    crs = map.options.crs;
                    tileSize = this.options.tileSize;
                    nwPoint = tilePoint.multiplyBy(tileSize);
                    //+/-1 pour Ãªtre dans la tuile
                    nwPoint.x += 1;
                    nwPoint.y -= 1;
                    sePoint = nwPoint.add(new L.Point(tileSize, tileSize));
                    nw = crs.project(map.unproject(nwPoint, zoom));
                    se = crs.project(map.unproject(sePoint, zoom));
                    tilewidth = se.x - nw.x;
                    zoom = map.getZoom();
                    ident = this.matrixIds[zoom].identifier;
                    X0 = this.matrixIds[zoom].topLeftCorner.lng;
                    Y0 = this.matrixIds[zoom].topLeftCorner.lat;
                    tilecol = Math.floor((nw.x - X0) / tilewidth);
                    tilerow = -Math.floor((nw.y - Y0) / tilewidth);
                    url = L.Util.template(this._url, {
                        s: this._getSubdomain(tilePoint)
                    });
                    return url + L.Util.getParamString(this.wmtsParams, url) + "&tilematrix=" + ident + "&tilerow=" + tilerow + "&tilecol=" + tilecol;
                },

                setParams: function (params, noRedraw) {
                    L.extend(this.wmtsParams, params);
                    if (!noRedraw) {
                        this.redraw();
                    }
                    return this;
                }
            });

            L.tileLayer.wtms = function (url, options) {
                return new L.TileLayer.WMTS(url, options);
            };
            /* Fin / End
             *---------------------------------------------------------*/


            if (urbaClic_options.showMap) {
                if (!jQuery('.urbaclic-map').length) jQuery('<div class="urbaclic-map"></div>').appendTo(container);

                map = L.map(jQuery('.urbaclic-map')[0], urbaClic_options.leaflet_map_options).setView([46.6795944656402, 2.197265625], 4);
                map.attributionControl.setPrefix('');
                map.layerController = L.control.layers([], []).addTo(map);

                var first = true;

                for (var i in urbaClic_options.background_layers) {
                    var bl = urbaClic_options.background_layers[i];

                    if (typeof bl == 'string') {
                        var l = urbaClicUtils.getModelLayer(bl, urbaClic_options.ign_key);

                        if (l) {

                            _urbaclic.addBackground(l.title, l.layer, i == 0);
                            if (first) {
                                l.layer.addTo(map);
                                first = false;
                            }
                        } else {
                            try {
                                bl = eval(bl);
                            } catch (err) {
                                console.log(err.message);
                            }
                        }
                    }

                }


                // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);


            }

        }

        var addBanLayer = function (data) {
            if (layers.ban) map.removeLayer(layers.ban);
            var layer = L.geoJson(data, {
                onEachFeature: function (feature, layer) {
                    var html = default_template(feature);
                    layer.bindPopup(html);
                },
                pointToLayer: circle_pointToLayer,
                style: {
                    'className': 'ban'
                }
            }).addTo(map);
            layers.ban = layer;
            updateLayerController();
            return layer;
        }


        var addAdressLayer = function (data) {
            if (layers.adresse) map.removeLayer(layers.adresse);


            var layer = L.marker([data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]], {
                style: {
                    'className': 'adresse'
                },
                draggable: true
            }).addTo(map);


            layers.adresse = layer;
            updateLayerController();
            return layer;
        };


        var initMarker = function (params) {

            if (null == map) initMap();

            input.val(params.feature.properties.label);

            current_citycode = params.feature.properties.citycode;

            if (layers.adresse) map.removeLayer(layers.adresse);
            var marker_pos = {
                latlng: L.latLng(params.feature.geometry.coordinates[1], params.feature.geometry.coordinates[0])
            };

            focusOff();
            if (zoom_timeout) clearTimeout(zoom_timeout);

            var adresse_json = {
                type: 'FeatureCollection',
                features: [params.feature]
            };

            layers.adresse = addAdressLayer(adresse_json);
            map.fitBounds(L.featureGroup([layers.adresse]).getBounds());

            loadParcelle();

            layers.adresse.on('dragend', function (e) {
                clearTimeout(loadParcelle_timeout);
                loadParcelle_timeout = setTimeout(loadParcelle, 10);
            });

        }


        var loadParcelle = function () {


            var feature = layers.adresse.toGeoJSON();
            var marker_pos = {
                latlng: layers.adresse.getLatLng()
            };


            if (cadastre_query) cadastre_query.abort();
            var url = Cadastre_API + 'cadastre/geometrie';
            var qparams = {
                geom: JSON.stringify(feature)
            };



            cadastre_query = jQuery.getJSON(url, qparams, function (data) {
                if (data.features.length) {
                    if (layers.parcelle) map.removeLayer(layers.parcelle);
                    var layer = L.geoJson(data, {
                        onEachFeature: function (feature, layer) {
                            var html = default_template(feature);
                            layer.bindPopup(html);
                        },
                        style: {
                            'className': 'parcelle'
                        }
                    }).addTo(map);
                    map.fitBounds(layer.getBounds());
                    layers.parcelle = layer;
                    var parcelle_obj = layers.parcelle.getLayers()[0];

                    showData(parcelle_obj.feature, parcelle_obj, marker_pos);
                } else {
                    console.info('aucune parcelle trouvée à ' + marker_pos.latlng.toString());
                    loadClosest(marker_pos.latlng, current_citycode);
                }

            });
        };

        var loadClosest = function (latlng, citycode) {

            console.info('recherche plus proche parcelle sur commune ' + citycode);

            if (cadastre_query) cadastre_query.abort();

            var delta = 0.0005; // en degres
            var bb = [
                [latlng.lat - delta, latlng.lng - delta],
                [latlng.lat + delta, latlng.lng + delta]
            ];

            var limit_geojson = L.rectangle(bb).toGeoJSON();


            var url = Cadastre_API + 'cadastre/geometrie';
            var rect = L.rectangle(map.getBounds());
            var qparams = {
                geom: JSON.stringify(limit_geojson)
            };

            cadastre_query = jQuery.getJSON(url, qparams, function (data) {


                //filtre ne garde que les parcelles de ma même commune que adresse
                /* data.features = jQuery.grep(data.features, function (f) {
                    var citycode2 = f.properties.code_dep + f.properties.code_com;
                    return (citycode == citycode2);
                });*/


                if (data.features.length) {
                    var layer = L.geoJson(data, {
                        onEachFeature: function (feature, layer) {
                            var html = default_template(feature);
                            layer.bindPopup(html);
                        },
                        style: {
                            'className': 'parcelle'
                        }
                    });


                    var closest = urbaClicUtils.closestF.closestLayer(map, layer.getLayers(), latlng);

                    var parcelle = closest.layer;
                    if (parcelle) {
                        if (layers.parcelle) map.removeLayer(layers.parcelle);
                        layers.parcelle = parcelle;
                        parcelle.addTo(map);
                        map.fitBounds(layers.parcelle.getBounds());
                        var marker_pos = {
                            latlng: closest.latlng
                        };
                        showData(parcelle.feature, parcelle, marker_pos);
                    }


                } else {
                    console.info('aucune parcelle trouvée');
                }
            });





        };

        var getServitudesDetail = function () {

            var exemple = '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[1.4412478,43.6082612],[1.4412321,43.608283],[1.4412157,43.6083198],[1.4412124,43.6083362],[1.4412129,43.6083494],[1.4412174,43.6083629],[1.4412262,43.6083779],[1.4412359,43.6083901],[1.4412502,43.6084037],[1.441268,43.6084169],[1.4412925,43.608431],[1.4413593,43.6084602],[1.4420934,43.6087783],[1.4421189,43.6087877],[1.4421488,43.6087948],[1.4421846,43.6088028],[1.4422125,43.6088065],[1.4422447,43.6088068],[1.4422806,43.6088074],[1.4423509,43.6088],[1.4423847,43.6087931],[1.4424154,43.6087853],[1.4424473,43.6087753],[1.4424598,43.6087687],[1.4424814,43.6087582],[1.4425016,43.608747],[1.4425282,43.6087283],[1.4425585,43.608706],[1.4425849,43.6086784],[1.4426028,43.6086577],[1.4426164,43.6086344],[1.4426286,43.60861],[1.4426393,43.6085774],[1.4426439,43.6085546],[1.4426422,43.6085276],[1.442637,43.6084934],[1.4426268,43.6084577],[1.4426137,43.608433],[1.4425875,43.6083981],[1.4425643,43.6083729],[1.4425318,43.6083446],[1.4424997,43.6083221],[1.4424767,43.60831],[1.4424701,43.6083065],[1.442414,43.6082802],[1.4424231,43.6082674],[1.4423022,43.6082102],[1.4422896,43.6082248],[1.4422332,43.6082],[1.4416873,43.6079607],[1.4416532,43.6079493],[1.4416239,43.6079428],[1.4415958,43.6079408],[1.4415692,43.6079431],[1.4415419,43.6079481],[1.4415214,43.6079563],[1.4414887,43.6079721],[1.4414636,43.6079894],[1.441466,43.6080011],[1.4414649,43.6080026],[1.4414508,43.6080209],[1.4414605,43.6080258],[1.4414147,43.6080792],[1.4414018,43.6080729],[1.4413164,43.6081766],[1.4413231,43.6081806],[1.4412769,43.6082392],[1.4412661,43.6082353],[1.4412478,43.6082612]]]]},"properties":{"test":"test"}}]}';

            container.find('.map[data-servitudeid]').each(function () {
                var map_container = jQuery(this);
                var servitude_id = map_container.data('servitudeid');
                var options = jQuery.extend(urbaClic_options.leaflet_map_options, {
                    zoomControl: false
                });

                var servitudes_map = L.map(map_container[0], options).setView([46.6795944656402, 2.197265625], 4);
                servitudes_map.attributionControl.setPrefix('');
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(servitudes_map);

                var data = JSON.parse(exemple);

                var layer = L.geoJson(data, {
                    onEachFeature: function (feature, layer) {
                        var html = default_template(feature);
                        layer.bindPopup(html);
                    },
                    style: {
                        'className': 'parcelle'
                    }
                });
                layer.addTo(servitudes_map);
                servitudes_map.fitBounds(layer.getBounds());


            });


        }

        var showData = function (feature, layer, evt) {

            map.fitBounds(layer.getBounds());
            var parcelleId = [
                feature.properties.code_dep,
                feature.properties.code_com
            ];

            if (feature.properties.code_arr != "000") {
                parcelleId.push(feature.properties.code_arr);
            } else {
                parcelleId.push(feature.properties.com_abs);
            }

            /* for (var i in layer._layers) {
                layer._layers[i]._container.setAttribute('class', 'active');
            }*/


            parcelleId.push(feature.properties.section);
            parcelleId.push(feature.properties.numero);

            parcelleId = parcelleId.join('');

            if (urbaClic_options.showData) {
                if (!jQuery('.urbaclic-data').length) jQuery('<div class="urbaclic-data"></div>').appendTo(container);
            }
            current_parcelle.data = {
                latlng: evt.latlng,
                parcelle_id: parcelleId,
                cadastre: feature.properties,
                adresse: null,
                servitudes: null
            };

            for (var i in current_parcelle.loadings) {
                current_parcelle.loadings[i].abort();
            }


            jQuery('.urbaclic-data').html(Templates.parcelleData(current_parcelle.data));

            //load adresse
            if (urbaClic_options.getadresse) {
                var url = BAN_API + 'reverse/';
                var params = {
                    lon: current_parcelle.data.latlng.lng,
                    lat: current_parcelle.data.latlng.lat
                };

                current_parcelle.loadings.ban_query = jQuery.getJSON(url, params, function (data) {
                    addBanLayer(data);
                    //if (layers.ban) map.removeLayer(layers.ban);
                    if (data.features[0] != undefined) {
                        current_parcelle.data.adresse = data.features[0].properties;
                        jQuery('.urbaclic-data').html(Templates.parcelleData(current_parcelle.data));
                    }
                });
            }

            //load_servitudes
            if (urbaClic_options.getservitude) {

                var geom = layer.toGeoJSON();
                geom = geom.geometry;
                var url = URBA_API + 'servitudes';

                var params = {
                    geom: geom
                };


                $.ajax({
                    url: url,
                    type: "POST",
                    data: JSON.stringify(params),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        current_parcelle.data.servitudes = data;
                        jQuery('.urbaclic-data').html(Templates.parcelleData(current_parcelle.data));
                        getServitudesDetail();
                    }
                });


            }

            //load_plu
            if (urbaClic_options.getPlu) {
                //****************************************************************************************

                /* var geom = layer.toGeoJSON();
                geom = geom.geometry;
                var url = URBA_API + 'servitudes';

                var params = {
                    geom: geom
                };


                $.ajax({
                    url: url,
                    type: "POST",
                    data: JSON.stringify(params),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        current_parcelle.data.servitudes = data;
                        jQuery('.urbaclic-data').html(Templates.parcelleData(current_parcelle.data));
                    }
                });*/

                var plu_data = {
                    'LIBELLE': 'Espace urbanisé',
                    'TXT': 'Description'

                };
                current_parcelle.data.plu = plu_data;
                jQuery('.urbaclic-data').html(Templates.parcelleData(current_parcelle.data));


                //****************************************************************************************

            }



        }


        var focusOff = function () {
            container.find('ul.urbaclic-autocomplete').slideUp();
        }

        input.keydown(function (e) {
            setTimeout(autocomplete, 10);
        })
            .focusin(function () {
                clearTimeout(focusOff_timeout);
                container.find('ul.urbaclic-autocomplete').slideDown();
            })
            .focusout(function () {
                clearTimeout(focusOff_timeout);
                focusOff_timeout = setTimeout(focusOff, 200);
            });

        container.on('click', 'ul.urbaclic-autocomplete [data-feature]', function (e) {
            e.preventDefault();
            initMarker(jQuery(this).data());
        }).on('mouseover', 'ul.urbaclic-autocomplete', function (e) {
            clearTimeout(focusOff_timeout);
        }).on('focusin', 'ul.urbaclic-autocomplete *', function (e) {
            clearTimeout(focusOff_timeout);
        }).on('focusout', 'ul.urbaclic-autocomplete *', function (e) {
            clearTimeout(focusOff_timeout);
            focusOff_timeout = setTimeout(focusOff, 200);
        })

        autocomplete();

        _urbaclic.map = map;
        _urbaclic.loadParcelle = loadParcelle;
        _urbaclic.initMarker = initMarker;
        return _urbaclic;
    };



    //*****************************************************





    var BAN_API = "https://api-adresse.data.gouv.fr/";
    var URBA_API = "https://urbanisme.api.gouv.fr/";
    var Cadastre_API = "https://apicarto.sgmap.fr/";





    var checklibs = function () {
        var dependences = {
            'Handlebars': 'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.2/handlebars.min.js',
            'i18n': 'https://cdnjs.cloudflare.com/ajax/libs/i18next/1.6.3/i18next-1.6.3.min.js',
            //'marked': 'https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.5/marked.min.js',
            'L': 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet.js',
        };

        var css = {
            'L': 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet.css',
            'css': baseUrl + 'urbaclic.css',
        };
        var ready = true;
        for (var i in css) {
            if (jQuery('link[href="' + css[i] + '"]').length == 0) {
                jQuery('<link type="text/css" href="' + css[i] + '" rel="stylesheet">').appendTo('head');
            }
        }

        for (var i in dependences) {
            if (typeof window[i] == 'undefined') {
                if (jQuery('script[src="' + dependences[i] + '"]').length == 0) {
                    jQuery('<script src="' + dependences[i] + '"></script>').appendTo('body');
                }
                ready = false;
            }
        }
        if (ready) {
            start();
        } else {
            setTimeout(checklibs, 100);
        }
    }




    var start = function () {

        var container = _urbaclic.container;

        /** i18n init  **/
        _urbaclic.lang = lang = 'fr';

        i18n.init({
            resGetPath: baseUrl + 'locales/urbaclic.' + lang + '.json',
            lng: lang,
            load: 'unspecific',
            interpolationPrefix: '{',
            interpolationSuffix: '}',
            fallbackLng: false,
            fallbackOnEmpty: true,
            fallbackOnNull: true,
            nsseparator: '::', // Allow to use real sentences as keys
            keyseparator: '$$', // Allow to use real sentences as keys
        }, function (err, t) { /* loading done */ });





        /** Handlebars init  **/

        Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

            switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '!=':
                return (v1 != v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
            }
        });

        Handlebars.registerHelper('ifCount', function (v1, operator, v2, options) {
            var v1 = v1.length;
            switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '!=':
                return (v1 != v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
            }
        });

        Handlebars.registerHelper('mark', function (text, key) {
            var match = text.match(new RegExp(key.trim(), "gi"));
            var uniqueMatch = [];
            jQuery.each(match, function (i, el) {
                if (jQuery.inArray(el, uniqueMatch) === -1) uniqueMatch.push(el);
            });

            for (var i in uniqueMatch) {
                text = text.replace(new RegExp(uniqueMatch[i], "g"), '[** ' + uniqueMatch[i] + ' **]')
            }

            text = text.replace(/\[\*\* /g, '<mark>').replace(/ \*\*\]/g, '</mark>');
            return new Handlebars.SafeString(text);
        });

        Handlebars.registerHelper('marks', function (text, key) {
            var keys = key.trim().split(' ');

            for (var i in keys) {
                key = keys[i];
                var match = text.match(new RegExp(key, "gi"));
                var uniqueMatch = [];
                if (match != null)
                    jQuery.each(match, function (i, el) {
                        if (jQuery.inArray(el, uniqueMatch) === -1) uniqueMatch.push(el);
                    });

                for (var i in uniqueMatch) {
                    text = text.replace(new RegExp(uniqueMatch[i], "g"), '[** ' + uniqueMatch[i] + ' **]')
                }


            }

            text = text.replace(/\[\*\* /g, '<mark>').replace(/ \*\*\]/g, '</mark>');
            return new Handlebars.SafeString(text);
        });



        Handlebars.registerHelper('paginate', function (n, total, page_size) {

            var res = '';
            var nPage = Math.ceil(total / page_size);
            if (nPage == 1) return '';
            for (var i = 1; i <= nPage; ++i) {
                res += '<li' + (i == n ? ' class="active"' : '') + ">";
                res += '<a href="#" data-page=' + i + '>' + i + '</a></li>';
            }
            return '<nav><ul class="pagination">' + res + '</ul></nav>';
        });

        Handlebars.registerHelper('taglist', function (tags) {
            var res = '';
            for (var i in tags) {
                res += "<span class='label label-primary' >" + tags[i] + '</span> ';
            }
            return res;
        });

        Handlebars.registerHelper('trimString', function (passedString) {
            if (passedString.length > 150) {
                var theString = passedString.substring(0, 150) + '...';
                return new Handlebars.SafeString(theString);
            } else {
                return passedString;
            }

        });


        Handlebars.registerHelper('uppercase', function (passedString) {
            return passedString.toUpperCase();
        });

        Handlebars.registerHelper('round', function (passedString) {
            return Math.round(parseFloat(passedString));
        });

        Handlebars.registerHelper('count', function (passedString) {
            return passedString.length;
        });


        Handlebars.registerHelper('truncate', function (str, len) {
            if (str && str.length > len && str.length > 0) {
                var new_str = str + " ";
                new_str = str.substr(0, len);
                new_str = str.substr(0, new_str.lastIndexOf(" "));
                new_str = (new_str.length > 0) ? new_str : str.substr(0, len);

                return new Handlebars.SafeString(new_str + '...');
            }
            return str;
        });

        Handlebars.registerHelper('default', function (value, defaultValue) {
            if (value != null) {
                return value
            } else {
                return defaultValue;
            }
        });

        Handlebars.registerHelper('dt', function (value, options) {
            return moment(value).format(options.hash['format'] || 'LLL');
        });

        Handlebars.registerHelper('placeholder', function (url, type) {
            return url ? url : baseUrl + 'img/placeholders/' + type + '.png';
        });

        Handlebars.registerHelper('_', function (value, options) {
            if (!value || typeof value !== 'string') {
                return '';
            }
            options.hash.defaultValue = '???';
            var res = i18n.t(value, options.hash);

            if (res == '???') {
                value = value.charAt(0).toLowerCase() + value.slice(1);
                res = i18n.t(value, options.hash);
                res = res.charAt(0).toUpperCase() + res.slice(1);
            }
            if (res == '???') {
                value = value.charAt(0).toUpperCase() + value.slice(1);
                res = i18n.t(value, options.hash);
                res = res.charAt(0).toLowerCase() + res.slice(1);
            }
            if (res == '???') {
                console.warn('i18n "' + value + '" NOT FOUND')
                return value;
            }

            return res;
        });


        Handlebars.registerHelper('md', function (value) {
            return new Handlebars.SafeString(marked(value));
        });



        Handlebars.registerHelper('mdshort', function (value, length) {
            if (!value) {
                return;
            }

            var EXCERPT_TOKEN = '<!--- --- -->',
                DEFAULT_LENGTH = 128;

            if (typeof length == 'undefined') {
                length = DEFAULT_LENGTH;
            }

            var text, ellipsis;
            if (value.indexOf('<!--- excerpt -->')) {
                value = value.split(EXCERPT_TOKEN, 1)[0];
            }
            ellipsis = value.length >= length ? '...' : '';
            text = marked(value.substring(0, length) + ellipsis);
            text = text.replace('<a ', '<span ').replace('</a>', '</span>');
            return new Handlebars.SafeString(text);
        });


        Handlebars.registerHelper('theme', function (value) {
            return new Handlebars.SafeString(baseUrl + '' + value);
        });


        Handlebars.registerHelper('fulllogo', function (value) {
            //   value = value.replace('-100.png', '.png'); // BAD IDEA can be .png or .jpg
            return new Handlebars.SafeString(value);
        });


        Handlebars.registerHelper('jsonencode', function (value) {

            return JSON.stringify(value, null, 4);
        });

        for (var tmpl in Templates) {
            var template_surcharge_id = 'udata_template_' + tmpl;
            console.info('load template: #' + template_surcharge_id);
            var t = jQuery('#' + template_surcharge_id).first();
            if (t.length) {
                Templates[tmpl] = t.html();
                console.info('loaded.');
            } else {
                console.info('not found, use default template.');
            }

            if (typeof Templates[tmpl] != 'string')
                Templates[tmpl] = Templates[tmpl].join("\n");
            Templates[tmpl] = Handlebars.compile(Templates[tmpl]);
        }

        /** init  **/

        container = jQuery('#urbaclic');
        if (container.length) {

            window.urbaClic_autoload = [];
            container.each(function () {
                var obj = jQuery(this);
                window.urbaClic_autoload.push(urbaClic(obj, obj.data()));
            });



        }





    };

    checklibs();


});