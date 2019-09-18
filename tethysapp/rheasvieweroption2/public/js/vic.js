/*****************************************************************************
 * FILE:    VIC MAIN JS
 * DATE:    6 JULY 2017
 * AUTHOR: Sarva Pulla
 * COPYRIGHT: (c) NASA SERVIR 2017
 * LICENSE: BSD 2-Clause
 *****************************************************************************/

/*****************************************************************************
 *                      LIBRARY WRAPPER
 *****************************************************************************/
var gwms, gmap,feat;
var eventt=[];
var LIBRARY_OBJECT = (function () {
	// Wrap the library in a package function
	"use strict"; // And enable strict mode for this library

	/************************************************************************
	 *                      MODULE LEVEL / GLOBAL VARIABLES
	 *************************************************************************/
	var current_layer,
		element,
		$interactionModal,
		layers,
		map,
		popup,
		$plotModal,
		public_interface, // Object returned by the module
		rest_url,
		selectedFeatures,
		variable_data,
		$vicplotModal,
		$vicplotModal1,
		$vicplotModal2,
		$vicplotModal3,
		wms_workspace,
		wms_url,
		wms_layer,
		wms_source,gid;


	/************************************************************************
	 *                    PRIVATE FUNCTION DECLARATIONS
	 *************************************************************************/
	var add_vic,
		clear_coords,
		get_bounds,
		get_bounds1,
		get_plot,
		get_styling,
		gen_color_bar,
		init_events,
		init_jquery_vars,
		init_dropdown,
		init_all,
		init_map;
	var styleCache = {};
	var high = [64, 196, 64, 0.81];
	var mid = [108, 152, 64, 0.81];
	var low = [152, 108, 64, 0.81];
	var poor = [196, 32, 32, 0.81];
	var default_style = new ol.style.Style({
		fill: new ol.style.Fill({
			color: [250, 250, 250, 1]
		}),
		stroke: new ol.style.Stroke({
			color: [220, 220, 220, 1],
			width: 4
		})
	});

	/************************************************************************
	 *                    PRIVATE FUNCTION IMPLEMENTATIONS
	 *************************************************************************/

	clear_coords = function () {
		$("#poly-lat-lon").val('');
		$("#point-lat-lon").val('');
	};

	init_jquery_vars = function () {
		$interactionModal = $("#interaction-modal");
		$plotModal = $("#plot-modal");
		$vicplotModal = $("#vic-plot-modal");
		$vicplotModal1 = $("#vic-plot-modal1");
		$vicplotModal2 = $("#vic-plot-modal2");
		$vicplotModal3 = $("#vic-plot-modal3");

		var $var_element = $("#variable");
		variable_data = $var_element.attr('data-variable-info');
		variable_data = JSON.parse(variable_data);
		wms_url = $var_element.attr('data-geoserver-url');
		rest_url = $var_element.attr('data-rest-url');
		// wms_url = JSON.parse(wms_url);
		wms_workspace = $var_element.attr('data-geoserver-workspace');
		// wms_workspace = JSON.parse(wms_workspace);
	};

	init_dropdown = function () {
		$(".db_table").select2();
		$(".schema_table").select2();
		$(".var_table").select2();
		$(".time_table").select2();
		$(".interaction").select2();
		$(".region_table_plot").select2();
		$(".date_table_plot").select2();
		$(".ens_table").select2();
		$("#ens_table").append(new Option("Median","avg")).trigger('change');
	};

	init_map = function () {
		var projection = ol.proj.get('EPSG:3857');
		var baseLayer = new ol.layer.Tile({
//			source: new ol.source.BingMaps({
//				key: '5TC0yID7CYaqv3nVQLKe~xWVt4aXWMJq2Ed72cO4xsA~ApdeyQwHyH_btMjQS1NJ7OHKY8BK-W-EMQMrIavoQUMYXeZIQOUURnKGBOC7UCt4',
//				imagerySet: 'AerialWithLabels' // Options 'Aerial', 'AerialWithLabels', 'Road'
//			})

            source: new ol.source.OSM()

		});

		var fullScreenControl = new ol.control.FullScreen();


		var view = new ol.View({
			center: ol.proj.transform([39.669571, -4.036878], 'EPSG:4326', 'EPSG:3857'),
			projection: projection,
			zoom: 4
		});
		wms_source = new ol.source.ImageWMS();

		wms_layer = new ol.layer.Image({
			source: wms_source
		});
		var vector_source = new ol.source.Vector({
			wrapX: false
		});
		var vector_layer = new ol.layer.Vector({
			name: 'my_vectorlayer',
			source: vector_source,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(255, 255, 255, 0.2)'
				}),
				stroke: new ol.style.Stroke({
					color: '#ffcc33',
					width: 2
				}),
				image: new ol.style.Circle({
					radius: 7,
					fill: new ol.style.Fill({
						color: '#ffcc33'
					})
				})
			})
		});
		gwms = wms_layer;
           vector_layer.setZIndex(9);
		layers = [baseLayer];
		// layers = [baseLayer,wms_layer,vector_layer,vectorLayer1];
		map = new ol.Map({
			target: document.getElementById("map"),
			layers: layers,
			view: view
		});
		map1 = new ol.Map({
			target: document.getElementById("map1"),
			layers: [baseLayer],
			view: view
		});
		gmap = map;
		vector_layer.setZIndex(Infinity);
		map.addLayer(vector_layer);


  var modify = new ol.interaction.Modify({ source: vector_source });
        map.addInteraction(modify);
        addControls();
        function addControls() {
            var element = document.createElement('div');
            element.className = 'ol-control-panel ol-unselectable ol-control';
            element.appendChild(createControl("Point", "glyphicon glyphicon-record"));
            element.appendChild(createControl("Polygon", "fas fa-draw-polygon"));
             element.appendChild(createControl("Recenter", "fas fa-compass"));
            /*A custom control which has container holding input elements etc*/
            var controlPanel = new ol.control.Control({
                element: element
            });
            map.addControl(controlPanel);
        }
         function createControl(which, icon){
            var drawElement = document.createElement('button');
            drawElement.id = "draw" + which;
            drawElement.innerHTML = "<span class='"+icon+"' aria-hidden='true'></span>";
            drawElement.title = which;
            drawElement.onclick = function () {
                try{
                 var selectedFeature = select_interaction.getFeatures().item(0);
                    //Remove it from your feature source
                vector_source.removeFeature(selectedFeature) ;
                 }
                 catch(e){

                 }
                    enableDrawInteraction(which);
           }
            return drawElement;
        }
        function enableDrawInteraction(which)
        {

          if (which == "Recenter") {
                console.log("Process as Recenter");
                map.getView().animate({
                 center: ol.proj.transform([39.669571, -4.036878], 'EPSG:4326', 'EPSG:3857'),
                 duration: 1000,
                 zoom:5
              });
            }else{
            try {
                map.removeInteraction(draw);
            }
            catch (e) { }
            vector_source.clear();
            draw = new ol.interaction.Draw({
                source: vector_source,
                type: which
            });

              //vector_source.removeFeatures(vector_source.features);
            map.addInteraction(draw);
            var snap = new ol.interaction.Snap({ source: vector_source });
            map.addInteraction(snap);
            draw.on('drawend', function (evt) {
//               try{
//               select_interaction.getOverlay().clear();
//                 var selectedFeatures = select_interaction.getFeatures();
//                 console.log(selectedFeatures.length);
//                 for(var i=0;i<selectedFeatures.length;i++){
//                                 vector_source.removeFeature(selectedFeatures[i].item(0));
//
//                 }
//                 }
//                 catch(e){
//                        console.log(e);
//                 }
                selectedFeatures.push(evt.feature);
                feat=evt.feature;
                processFeature(evt.feature, which);
                map.removeInteraction(draw);
            });
            }
        }
        function processFeature(feature, featureType) {
            if (featureType == "Point") {
                console.log("Process as point");
            } else if (featureType == "Polygon") {
                console.log("Process as Polygon");
            }

            var coords = feature.getGeometry().getCoordinates();
            var proj_coords = ol.proj.transform(coords, 'EPSG:3857','EPSG:4326');
                $("#point-lat-lon").val(proj_coords);
        }
		$('#vicslider').change(function (e) {
			map.getLayers().forEach(lyr => {
				if (lyr.get("id") == "viclayer") {
					lyr.setOpacity(e.target.value);
				}
			});
		});
		$('#dssatslider').change(function (e) {
			vectorLayer1.setOpacity(e.target.value);
		});
		//Code for adding interaction for drawing on the map
		var lastFeature, draw, featureType;

		//Clear the last feature before adding a new feature to the map
		var removeLastFeature = function () {
			if (lastFeature) vector_source.removeFeature(lastFeature);
		};

		//Add interaction to the map based on the selected interaction type
		var addInteraction = function (geomtype) {
			var typeSelect = document.getElementById('interaction-type');
			var value = typeSelect.value;
			$('#data').val('');
			if (value !== 'None') {
				if (draw)
					map.removeInteraction(draw);

				draw = new ol.interaction.Draw({
					source: vector_source,
					type: geomtype
				});


				map.addInteraction(draw);
			}
			if (featureType === 'Point' || featureType === 'Polygon') {

				draw.on('drawend', function (e) {
					lastFeature = e.feature;


				});

				draw.on('drawstart', function (e) {
					vector_source.clear();
				});

			}

		};

		vector_layer.getSource().on('addfeature', function (event) {
			//Extracting the point/polygon values from the drawn feature
			var feature_json = saveData();
			var parsed_feature = JSON.parse(feature_json);
			var feature_type = parsed_feature["features"][0]["geometry"]["type"];
			if (feature_type == 'Point') {

				$plotModal.find('.info').html('');
				var coords = parsed_feature["features"][0]["geometry"]["coordinates"];
				var proj_coords = ol.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');
				$("#point-lat-lon").val(proj_coords);
				$plotModal.find('.info').html('<b>You have selected a point at ' + proj_coords[1].toFixed(2) + ',' + proj_coords[0].toFixed(2) + '. Click on Show plot to view the Time series.</b>');
				$plotModal.modal('show');
			} else if (feature_type == 'Polygon') {
				console.log("from polygon");
				$plotModal.find('.info').html('');
				var coords = parsed_feature["features"][0]["geometry"]["coordinates"][0];
				proj_coords = [];
				coords.forEach(function (coord) {
					var transformed = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
					proj_coords.push('[' + transformed + ']');
				});

				var json_object = '{"type":"Polygon","coordinates":[[' + proj_coords + ']]}';
				$("#poly-lat-lon").val(json_object);
				$plotModal.find('.info').html('<b>You have selected the following polygon object ' + proj_coords + '. Click on Show plot to view the Time series.</b>');
				$plotModal.modal('show');
			}
			get_plot();
		});

		function saveData() {
			// get the format the user has chosen
			var data_type = 'GeoJSON',
				// define a format the data shall be converted to
				format = new ol.format[data_type](),
				// this will be the data in the chosen format
				data;
			try {
				// convert the data of the vector_layer into the chosen format
				data = format.writeFeatures(vector_layer.getSource().getFeatures());
			} catch (e) {
				// at time of creation there is an error in the GPX format (18.7.2014)
				$('#data').val(e.name + ": " + e.message);
				return;
			}
			// $('#data').val(JSON.stringify(data, null, 4));
			return data;

		}


		$('#interaction-type').change(function (e) {
			featureType = $(this).find('option:selected').val();
			if (featureType == 'None') {
				$('#data').val('');
				clear_coords();
				map.removeInteraction(draw);
				vector_layer.getSource().clear();
			} else if (featureType == 'Point') {
				clear_coords();
				addInteraction(featureType);
			} else if (featureType == 'Polygon') {
				clear_coords();
				addInteraction(featureType);
			}
			$interactionModal.modal('hide');
		}).change();

	};


	init_events = function () {


		map.on("singleclick", function (evt) {

			$(element).popover('destroy');


			if (map.getTargetElement().style.cursor == "pointer" && $("#interaction-type").find('option:selected').val() == "None") {
				var clickCoord = evt.coordinate;
				popup.setPosition(clickCoord);
				var view = map.getView();
				var viewResolution = view.getResolution();

				var wms_url = current_layer.getSource().getGetFeatureInfoUrl(evt.coordinate, viewResolution, view.getProjection(), {
					'INFO_FORMAT': 'application/json'
				}); //Get the wms url for the clicked point

				if (wms_url) {
					//Retrieving the details for clicked point via the url
					$.ajax({
						type: "GET",
						url: wms_url,
						dataType: 'json',
						success: function (result) {
							var value = parseFloat(result["features"][0]["properties"]["GRAY_INDEX"]);
							value = value.toFixed(2);
							$(element).popover({
								'placement': 'top',
								'html': true,
								//Dynamically Generating the popup content
								'content': 'Value: ' + value
							});

							$(element).popover('show');
							$(element).next().css('cursor', 'text');


						},
						error: function (XMLHttpRequest, textStatus, errorThrown) {
							console.log(Error);
						}
					});
				}
			}
		});

		map.on('pointermove', function (evt) {
			if (evt.dragging) {
				return;
			}
			var pixel = map.getEventPixel(evt.originalEvent);
			var hit = map.forEachLayerAtPixel(pixel, function (layer) {
				if (layer != layers[0] && layer != layers[2]) {
					current_layer = layer;
					return true;
				}
			});
			map.getTargetElement().style.cursor = hit ? 'pointer' : '';
		});

	};

	init_all = function () {
		init_jquery_vars();
		init_dropdown();
		init_map();
		init_events();
	};

	gen_color_bar = function (colors, scale,cv) {
		var cv = document.getElementById(cv),
			ctx = cv.getContext('2d');
		ctx.clearRect(0, 0, cv.width, cv.height);
		colors.forEach(function (color, i) {
			ctx.beginPath();
			ctx.fillStyle = color;
var my_gradient = ctx.createLinearGradient(0, 0, 150, 0);
my_gradient.addColorStop(0, "red");
my_gradient.addColorStop(0.5, "yellow");
my_gradient.addColorStop(1, "green");
ctx.fillStyle = my_gradient;
			ctx.fillRect(i * 25, 0, 45, 20);
			ctx.fillStyle = "black";
			ctx.fillText(scale[i].toFixed(), i * 30, 33);
		});

	};

	get_bounds = function (ws, store, url, callback) {
		// console.log(ws,store,url);
		var lastChar = url.substr(-1); // Selects the last character
		if (lastChar != '/') { // If the last character is not a slash
			url = url + '/'; // Append a slash to it.
		}
		// var bbox_url = url+'workspaces/'+ws+'/coveragestores/'+store+'/coverages/'+store+'.xml';
		var bbox;

		var xhr = ajax_update_database("bounds", {
			"url": url,
			"store": store,
			"workspace": ws,
			'type': 'raster'
		});

		xhr.done(function (data) {
			if ("success" in data) {
				callback(data.bounds);
			} else {

			}
		});

		return bbox;

	};

	function styleFunction(feature, resolution) {
		// get the incomeLevel from the feature properties
		var level = feature.getId().split(".")[1];
		if (yield_data != null) {
			// var index = yield_data.findIndex(function(x) { return x[0]==level });
			var index = -1;
			for (var i = 0; i < yield_data.length; ++i) {
				if (yield_data[i][0] == level) {
					index = i;
					break;
				}
			}

			if (index == "-1") {
				return [default_style];
			}
			// check the cache and create a new style for the income
			// level if its not been created before.
			if (index != "-1") {
				var avg_val = yield_data[index][1];

				if (avg_val > 2000) {
					styleCache[index] = new ol.style.Style({
						fill: new ol.style.Fill({
							color: high
						}),
						stroke: new ol.style.Stroke({
							color: '#030303',
							width: 3
						})
					});
				} else if (avg_val > 1500 && avg_val < 2000) {
					styleCache[index] = new ol.style.Style({
						fill: new ol.style.Fill({
							color: mid
						}),
						stroke: new ol.style.Stroke({
							color: '#030303',
							width: 3
						})
					});
				} else if (avg_val > 1000 && avg_val < 1500) {
					styleCache[index] = new ol.style.Style({
						fill: new ol.style.Fill({
							color: low
						}),
						stroke: new ol.style.Stroke({
							color: '#030303',
							width: 3
						})
					});
				} else if (avg_val < 1000) {
					styleCache[index] = new ol.style.Style({
						fill: new ol.style.Fill({
							color: poor
						}),
						stroke: new ol.style.Stroke({
							color: '#030303',
							width: 3
						})
					});
				}

			}
			return [styleCache[index]];
		} else {
			return [default_style];
		}

	};

	get_styling = function (variable,scale,cv) {
	console.log(variable);
           console.log(scale);
		//var index = variable_data.findIndex(function(x){return variable.includes(x["id"])});
		var index = find_var_index(variable, variable_data);
		var start = variable_data[index]["start"];
		var end = variable_data[index]["end"];

		var sld_color_string = '';
		if (scale[scale.length - 1] == 0) {
			//var colors = chroma.scale([start, start]).mode('lch').correctLightness().colors(5);
		var colors =	chroma.bezier(['yellow', 'red', 'black'])
    .scale()
    .colors(5);
			gen_color_bar(colors, scale,cv);
			var color_map_entry = '<ColorMapEntry color="' + colors[0] + '" quantity="' + scale[0] + '" label="label1" opacity="1"/>';
			sld_color_string += color_map_entry;
		} else {
			//var colors = chroma.scale([start, end]).mode('lch').correctLightness().colors(5);
				var colors =	chroma.bezier(['yellow', 'red', 'black'])
    .scale()
    .colors(5);
			gen_color_bar(colors, scale,cv);
			colors.forEach(function (color, i) {
				var color_map_entry = '<ColorMapEntry color="' + color + '" quantity="' + scale[i] + '" label="label' + i + '" opacity="1"/>';
				sld_color_string += color_map_entry;
			});
		}

		return sld_color_string
	};
	get_bounds1 = function (ws, store, url, callback) {
		// console.log(ws,store,url);
		var lastChar = url.substr(-1); // Selects the last character
		if (lastChar != '/') { // If the last character is not a slash
			url = url + '/'; // Append a slash to it.
		}
		// var bbox_url = url+'workspaces/'+ws+'/coveragestores/'+store+'/coverages/'+store+'.xml';
		var bbox;
		var xhr_dssat = ajax_update_database("bounds", {
			"url": url,
			"store": store,
			"workspace": ws,
			'type': 'vector'
		});

		xhr_dssat.done(function (data) {
			if ("success" in data) {
				callback(data.bounds);
			} else {
				console.log("not succes");
			}
		});

		return bbox;

	};
	var yield_data;
	var store;
    var centeravg,lonlat;
	function get_cal(bounds) {
		var layer_extent = bounds;
		var transformed_extent = ol.proj.transformExtent(layer_extent, 'EPSG:4326', 'EPSG:3857');
		map.getView().fit(transformed_extent, map.getSize());
		  var aa = layer_extent;
    centeravg = ol.extent.getCenter(aa);
var variable1 = $("#var_table1 option:selected").val();
        var variable2 = $("#var_table2 option:selected").val();
        generate_vic_graph("#vic_plotter_1",variable1,centeravg.toString(),"");
        generate_vic_graph("#vic_plotter_2",variable2,centeravg.toString(),"");
		map.updateSize();
	};
	var vectorLayer1 = new ol.layer.Vector({
		source: new ol.source.Vector(),
		style: styleFunction
	});
var select_interaction;
	function add_dssat(data,scale) {
		yield_data = data.yield;
		store = data.storename;
		console.log(data);
	var styling = get_styling("net_short", scale,'cv_dssat');
		var bbox = get_bounds1(wms_workspace, store, rest_url, get_cal);

		vectorLayer1.setSource(new ol.source.Vector({
			format: new ol.format.GeoJSON(),
			url: function (extent) {
				return wms_url + '?service=WFS&' +
					'version=1.1.0&request=GetFeature&typename=' + wms_workspace + ':' + store + '&' +
					'outputFormat=application/json&srsname=EPSG:3857&' +
					'bbox=' + extent.join(',') + ',EPSG:3857';
			},
			strategy: ol.loadingstrategy.bbox,
			wrapX: false,

		}));
		vectorLayer1.setZIndex(3);
		map1.addLayer(vectorLayer1);

		map1.crossOrigin = 'anonymous';
		 select_interaction = new ol.interaction.Select({
			layers: [vectorLayer1],
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: 'rgba(0, 0, 255, 0.7)',
					width: 6
				}),
				fill: new ol.style.Fill({
					color: 'rgba(0,0,0,0)'
				})
			}),
			wrapX: false
		});
		map1.addInteraction(select_interaction);


		select_interaction.on('select', function (e) {
			 gid = e.selected[0].getId().split(".")[1];
		generate_dssat_graph("#dssat_plotter_1",gid,$("#var_table3 option:selected").val());
		generate_dssat_graph("#dssat_plotter_2",gid,$("#var_table4 option:selected").val());
		});
		selectedFeatures = select_interaction.getFeatures();
		selectedFeatures.on('add', function (event) {
            try{
         
			$(".error").html('');
			var feature = event.target.item(0);
			var gid = feature.getId().split(".")[1];
			console.log(feature);
			var schema = $("#schema_table option:selected").val();
			var db = $("#db_table option:selected").val();
			$("#gid").val(gid);
			$("#schema").val(schema);

			var name_0 = feature.getProperties().name;
			// var name_1 = feature.getProperties().name_1;
			// var name_2 = feature.getProperties().name_2;

			// var heading = $("<div>").append( $("<h3>").text(name_0));
			// var content = $("<div>")
			//     .append(heading);
			// $(".feature-info").html('<h4 style="display: inline;">Current Feature: '+name_0+'→</h4>  <h5 style="display: inline;">'+name_1+'→</h5>  <h6 style="display: inline;">'+name_2+'</h6>');
		$(".feature-info").html('<h4 style="display: inline;">Current Feature: ' + name_0 + '</h6>');


            }
            catch(e){
            }
		});

		// when a feature is removed, clear the feature-info div
		selectedFeatures.on('remove', function (event) {
			$(".feature-info").html("");
			// hide_charts();
			$(".feature-info").html("<p>Please select a feature to View the relevant metadata.</p>");
		});
	}
	add_vic = function (data) {
		map.removeLayer(wms_layer);
		var layer_name = wms_workspace + ":" + data.storename;
		console.log(data);
		var styling = get_styling(data.variable,  data.scale,'cv_vic');
		var bbox = get_bounds(wms_workspace, data.storename, rest_url, get_cal);

		var sld_string = '<StyledLayerDescriptor version="1.0.0"><NamedLayer><Name>' + layer_name + '</Name><UserStyle><FeatureTypeStyle><Rule>\
        <RasterSymbolizer> \
        <ColorMap type="ramp"> \
        <ColorMapEntry color="#f00" quantity="-9999" label="label0" opacity="0"/>' +
			styling + '</ColorMap>\
        </RasterSymbolizer>\
        </Rule>\
        </FeatureTypeStyle>\
        </UserStyle>\
        </NamedLayer>\
        </StyledLayerDescriptor>';

		wms_source = new ol.source.ImageWMS({
			url: wms_url,
			params: {
				'LAYERS': layer_name,
				'SLD_BODY': sld_string
			},
			serverType: 'geoserver',
			crossOrigin: 'Anonymous'
		});
		wms_layer = new ol.layer.Image({
			source: wms_source,
			id: "viclayer",
			opacity: $("#vicslider").val(),
		});

		wms_layer.setZIndex(2);
		map.addLayer(wms_layer);
	};

	get_plot = function () {
		var db = $("#db_table option:selected").val();
		var region = $("#schema_table option:selected").val();
		var variable1 = $("#var_table1 option:selected").val();
		var variable2 = $("#var_table2 option:selected").val();
		var point = $("#point-lat-lon").val();
		var polygon = $("#poly-lat-lon").val();
		generate_vic_graph("#vic_plotter_1",variable1,point,polygon);
		generate_vic_graph("#vic_plotter_2",variable2,point,polygon);

	};

		function generate_dssat_graph(element,gid,variable){

			var county_name="";
			var db = $("#db_table option:selected").val();
			var schema = $("#schema_table option:selected").val();
			  ajax_update_database("get-ensemble",{"db":db,"gid":gid,"schema":schema}).done(function(data) {
                if("success" in data) {
                    var ensembles = data.ensembles;
                    ensembles.forEach(function(ensemble,i){
                        var new_option = new Option(ensemble,ensemble);
                        $("#ens_table").append(new_option);
                    });
                } else {
                    $(".error").append('<h3>Error Retrieving the ensemble data. Please select another feature.</h3>');

                }
            });
	        var ens = $("#ens_table option:selected").val();
			var xhr = ajax_update_database("get-ens-values", {
				"db": db,
				"gid": gid,
				"schema": schema,
				"ensemble": ens
			});
            ajax_update_database("get-county", {
				"db": db,
				"gid": gid,
				"schema": schema
			}).done(function (data) {
			    console.log(data["county"]);
				if ("success" in data) {
				    county_name = data["county"][0][0];
				}
				else{
				   county_name = "Unknown";
				}
				});
			xhr.done(function (data) {
			var input,title,titletext;
			console.log(element);
			if(variable=="GWAD"){
                input=data.gwad_series;
                title="GWAD : ";
                titletext="GWAD (m2/m2)";
			}
			else if(variable=="WSGD"){
                input=data.wsgd_series;
                title="WSGD : ";
                titletext="WSGD (m2/m2)";
			}
			else{
			input=data.wsgd_series;
                title="LAI : ";
                titletext="LAI (m2/m2)";
			}
				if ("success" in data) {
					$(element).highcharts({
						chart: {
							zoomType: 'x'
						},
						title: {
							text: title +county_name
						},
						plotOptions: {
							series: {
								marker: {
									enabled: false
								}
							}
						},
						xAxis: {
							type: 'datetime',
							labels: {
								format: '{value:%d %b}'
							},
							title: {
								text: 'Date'
							}
						},
						yAxis: {
							title: {
								text: titletext
							}

						},
						exporting: {
							enabled: true
						},
						series: [{
							data: input,
							name: titletext,
							type: 'line',
							lineWidth: 5,
							color: "green"
						}]
					});
					console.log("done11");
				} else {
					$(".error").append('<h3>Error Processing Request. Please be sure to select an area with data.</h3>');

				}
			});
		}
        function generate_vic_graph(element,variable,point,polygon){
        	var db = $("#db_table option:selected").val();
			var region = $("#schema_table option:selected").val();
        var xhr = ajax_update_database("get-vic-plot", {
			"db": db,
			"region": region,
			"variable": variable,
			"point": point,
			"polygon": polygon
		});
		xhr.done(function (data) {
			$vicplotModal.find('.info').html('');
			$vicplotModal.find('.warning').html('');
			$vicplotModal.find('.table').html('');
			if ("success" in data) {
				if (data.interaction == "point" || data.interaction == "polygon") {
					//var index = variable_data.findIndex(function(x){return variable.includes(x["id"])});
					var index = find_var_index(variable, variable_data);
					var display_name = variable_data[index]["display_name"];
					var units = variable_data[index]["units"];
					$(element).highcharts({
						chart: {
							type: 'area',
							zoomType: 'x'
						},
						title: {
							text: display_name + " for " + region
							// style: {
							//     fontSize: '13px',
							//     fontWeight: 'bold'
							// }
						},
						xAxis: {
							type: 'datetime',
							labels: {
								format: '{value:%d %b %Y}'
								// rotation: 90,
								// align: 'left'
							},
							title: {
								text: 'Date'
							}
						},
						yAxis: {
							title: {
								text: units
							}

						},
						exporting: {
							enabled: true
						},
						series: [{
							data: data.time_series,
							name: display_name
						}]
					});
					$vicplotModal.find('.table').append('<thead></thead><tr><th>Mean</th><th>Standard Deviation</th><th>Minimum</th><th>Maximum</th></tr></thead>');
					$vicplotModal.find('.table').append('<tr><td>' + data.mean + '</td><td>' + data.stddev + '</td><td>' + data.min + '</td><td>' + data.max + '</td></tr>');
					$(element).removeClass('hidden');
					$("#summary").removeClass('hidden');
				}
			} else {
				$vicplotModal.find('.warning').html('<b>' + data.error + '</b>');
				console.log(data.error);
			}
		});

        }


	/************************************************************************
	 *                        DEFINE PUBLIC INTERFACE
	 *************************************************************************/

	public_interface = {

	};

	/************************************************************************
	 *                  INITIALIZATION / CONSTRUCTOR
	 *************************************************************************/

	// Initialization: jQuery function that gets called when
	// the DOM tree finishes loading
	$(function () {
		init_all();

		$('#dssatslider').change(function (e) {
			//  alert("dssat moved");
		});
		$("#interaction").on('click', function () {
			$interactionModal.modal('show');
		});
		//   $("#db_table").val("rheassm").attr("selected","selected");
		$("#db_table").change(function () {
			var db = $("#db_table option:selected").val();
			$("#schema_table").html('');

			var xhr = ajax_update_database("schemas", {
				"db": db
			});
			xhr.done(function (data) {
				if ("success" in data) {
					var schemas = data.schemas;
					schemas.forEach(function (schema, i) {
						var new_option = new Option(schema, schema);
						if (i == 0) {
							$("#schema_table").append(new_option).trigger('change');
						} else {
							$("#schema_table").append(new_option);
						}
					   $("#schema_table").val("kenya_tethys").attr("selected","selected");
					});
					// variables.forEach(function(variable,i){
					//     var new_option = new Option(variable,variable);
					//     $("#variable_table_plot").append(new_option);
					// });

				} else {
					console.log("error");

				}
			});

		}).change();
		function fillVarTables(element,variables){
		variables.forEach(function (variable, i) {
						var index = find_var_index(variable, variable_data);
					var display_name = variable_data[index]["display_name"];
						var new_option = new Option(display_name, variable);
						if (i == 0) {
							$(element).append(new_option).trigger('change');
						} else {
							$(element).append(new_option);
						}


					});
		}

		$("#schema_table").change(function () {
		console.log("schema chnage");
			var db = $("#db_table option:selected").val();
			var region = $("#schema_table option:selected").val();
			if(region == undefined)
			region="kenya_tethys";
			console.log(region);
			$("#var_table1").html('');
			$("#var_table2").html('');
			ajax_update_database("variables", {"region": region,"db": db}).done(function (data) {
				if ("success" in data) {
				    console.log(data.variables);
					fillVarTables("#var_table1",data.variables);
					fillVarTables("#var_table2",data.variables);
                    $("#var_table1").val("rainf").attr("selected","selected");
                    $("#var_table2").val("evap").attr("selected","selected");

				} else {
					console.log("error");
				}
			});

		}).change();


		$("#var_table1").change(function () {
			var db = $("#db_table option:selected").val();
			var variable = $("#var_table1 option:selected").val();
			var region = $("#schema_table option:selected").val();

			var xhr = ajax_update_database("dates", {
				"variable": variable,
				"region": region,
				"db": db
			});
			xhr.done(function (data) {
				if ("success" in data) {
					var dates = data.dates;
					$("#time_table").html('');
					dates.forEach(function (date, i) {

						var new_option = new Option(date[0], date[1]);
						if (i == 0) {
							$("#time_table").append(new_option).trigger('change');
						} else {
							$("#time_table").append(new_option);
						}
					});

				} else {
					console.log("error");

				}
			});

		});
		$("#var_table2").change(function () {
			var db = $("#db_table option:selected").val();
			var variable = $("#var_table2 option:selected").val();
			var region = $("#schema_table option:selected").val();

			var xhr = ajax_update_database("dates", {
				"variable": variable,
				"region": region,
				"db": db
			});
			xhr.done(function (data) {
				if ("success" in data) {
					var dates = data.dates;
					$("#time_table").html('');
					dates.forEach(function (date, i) {

						var new_option = new Option(date[0], date[1]);
						if (i == 0) {
							$("#time_table").append(new_option);
						} else {
							$("#time_table").append(new_option);
						}
					});

				} else {
					console.log("error");

				}
			});

		});
		$("#var_table3").change(function () {

		generate_dssat_graph("#dssat_plotter_1",gid,$("#var_table3 option:selected").val());

		});
		$("#var_table4").change(function () {

generate_dssat_graph("#dssat_plotter_2",gid,$("#var_table3 option:selected").val());
		});

		$("#time_table").change(function () {
			var db = $("#db_table option:selected").val();
			var variable = $("#var_table1 option:selected").val();
			var region = $("#schema_table option:selected").val();
			var date = $("#time_table option:selected").val();
			$(".error").html('');

			var xhr = ajax_update_database("raster", {
				"db": db,
				"variable": variable,
				"region": region,
				"date": date
			});

			xhr.done(function (data) {
				if ("success" in data) {
					add_vic(data);



				} else {
					$(".error").html('<h3>Error Retrieving the layer</h3>');
				}
			});

			ajax_update_database("get-schema-yield", {
				"db": db,
				"schema": region
			}).done(function (data) {
				if ("success" in data) {
                    ajax_update_database("scale", {
                            "min": 104.17,
                            "max": 274.74,
                        }).done(function (data1) {
                            if ("success" in data1) {
                                console.log(data1);
                                add_dssat(data,data1.scale);
                            } else {
                                $(".error").html('<h3>Error Retrieving the layer</h3>');
                            }
                        });
				    generate_dssat_graph("#dssat_plotter_1",32,"GWAD");
				    generate_dssat_graph("#dssat_plotter_2",32,"WSGD");
				} else {
					$(".error").append('<h3>Error Processing Request. Please be sure to select an area/schema with data.</h3>');
				}
			});


		});


	});

	return public_interface;

}()); // End of package wrapper
// NOTE: that the call operator (open-closed parenthesis) is used to invoke the library wrapper
// function immediately after being parsed.
