"use strict";

(function() {
    function checkOptions(options) {
        if (!_.isFunction(options.layerFactory)) {
            throw "layerFactory must be a function";
        }
        var objectProps = ["preloadPolicy", "retainPolicy", "fader", "timeSelector"];
        _.each(objectProps, function(propName) {
            if (!_.isObject(options[propName])) {
                throw (propName +" must be an object");
            }
        });
    }

    OpenLayers.Layer.Animation.PreloadingTimedLayer = OpenLayers.Class(OpenLayers.Layer, OpenLayers.Layer.Animation.TimedLayer, OpenLayers.Layer.Animation.TimedLayer, {

        initialize : function(name, options) {
            checkOptions(options);
            OpenLayers.Layer.prototype.initialize.call(this, name, options);
            var _me = this;

            this._layerFactory = options.layerFactory;
            this._layers = {}; // indexed by ISO 8601 time string
            this._errors = {}; // latest errors of layers, indexed by ISO 8601 time string
            this._opacity = 1.0; // Not available through Layer, store locally

            this._preloadPolicy = options.preloadPolicy;
            this._retainPolicy = options.retainPolicy;
            this._fader = options.fader;
            this._timeSelector = options.timeSelector;
            this._legendInfoProvider = options.legendInfoProvider;

            this._currentLayer = undefined; // set through setTime
            this._requestedTime = undefined; // set through setTime
            this._shownTime = undefined; // set through setTime
            this._range = undefined; // set through setTimeAndRange, undefined element means unlimited in that direction

            this.events.register("added", this, this.addedToMap);
            this.events.register("removed", this, this.removedFromMap);
        },

        addedToMap : function(ev) {
            _.each(this._layers, function(layer) {ev.map.addLayer(layer);});
        },

        removedFromMap : function(ev) {
            _.each(this._layers, function(layer) {ev.map.removeLayer(layer);});
        },

        initLayer : function(layer) {
            if (this.map) {
                var me = this;
                
                layer.events.register("loadstart", this, function() {
                    var layerKey = layer.getTime().toISOString();
                    this._errors[layerKey] = undefined; // Reset error at load start
                    me.events.triggerEvent("frameloadstarted", {"layer":this, "events":[{"time":layer.getTime(), "layerName":layer.name}]});
                });

                layer.events.register("loadend", this, function() {
                    var layerKey = layer.getTime().toISOString();
                    me.events.triggerEvent("frameloadcomplete", {"layer":this, "events":[{"time":layer.getTime(), "layerName":layer.name, "error":this._errors[layerKey]}]});
                });

                layer.events.register("tileerror", this, function(e) {
                    var layerKey = layer.getTime().toISOString();
                    this._errors[layerKey] = e;
                });

                this.map.addLayer(layer);
            }
        },

        /**
         * Add layer to map if available, set event listeners, set visibility and Z index
         */
        reconfigureLayer : function(layer) {
            layer.setVisibility(this.getVisibility());
            layer.setZIndex(this.getZIndex());
            if (layer === this._currentLayer) {
                layer.setOpacity(this.getOpacity());
            } else {
                layer.setOpacity(0);
            }
        },

        loadLayer : function(t) {
            var k = t.toISOString();
            var layer = this._layers[k];
            if (layer === undefined) {
                console.log("Loading", t);
                layer = this._layerFactory(t);
                this.initLayer(layer);
                this.reconfigureLayer(layer);
                this._layers[k] = layer;
            }
            return layer;
        },

        setTime : function(requestedTime) {
            if (requestedTime === undefined) {
                throw "Cannot set time of layer " + this.name + " to undefined";
            }
            //console.log("Request setting of time to", requestedTime, "on", this.name, "range", this.getRange());
            var shownTime = this._timeSelector.selectTime(this, requestedTime);
            console.log(requestedTime, "resulted in", shownTime, this.name);
            if (shownTime === undefined) {
                // Don't set time if outside range

                // TODO Need to track whether fade is in progress? Should not start multiple faders concurrently.
                // TODO setVisibility(false) on old layer after? setVisibility(true) on new layer before?
                this._fader.fade(this, this._currentLayer, undefined, function() {});
                this._currentLayer = undefined;

                // TODO Should this event be generated?
                this._requestedTime = requestedTime;
                this._shownTime = undefined;
                this.events.triggerEvent("framechanged", {"layer":this, "events":[{"time":requestedTime}]});
                return;
            }
            this._requestedTime = requestedTime;
            this._shownTime = shownTime;
            var layer = this.loadLayer(shownTime);
            var previousLayer = this._currentLayer;
            this._currentLayer = layer;
            this.events.triggerEvent("framechanged", {"layer":this, "events":[{"time":requestedTime}]});

            // TODO Need to track whether fade is in progress? Should not start multiple faders concurrently.
            if (layer !== previousLayer) {
                this._fader.fade(this, previousLayer, layer, function() {});
            }

            var preloadTimes = this._preloadPolicy.preloadAt(this, shownTime);
            _.each(preloadTimes, function(preloadTime) {
                var preloadLayer = this.loadLayer(preloadTime);
            }, this);

        },

        getTime : function() {
            return this._requestedTime;
        },

        getRange : function() {
            if (this._range !== undefined) {
                return this._range;
            } else {
                throw "Range not set for layer " + this.name;
            }
        },


        setRange : function(range) {
            this.setTimeAndRange(this._requestedTime, range);
        },

        setTimeAndRange : function(time, range) {
            // time may be undefined here, as a result of setRange before time has been set
            if (range === undefined) {
                throw "Cannot set time of layer " + this.name + " to undefined";
            }

            console.log("Setting range of", this.name, "to", range);
            this._range = range;

            var loadedTimes = _.invoke(this._layers, 'getTime'); // TimedLayer.getTime
            var retainedTimes = this._retainPolicy.retain(this, loadedTimes);
            console.log("Loaded", loadedTimes);
            console.log("Retained", retainedTimes);
            // Date.getTime
            var removedTimestamps = _.difference(_.invoke(loadedTimes, 'getTime'), _.invoke(retainedTimes, 'getTime'));
            console.log("Removed", removedTimestamps);
            _.each(removedTimestamps, function(removedTimestamp) {
                var removed = new Date(removedTimestamp);
                console.log("Unloading", removed);
                var removedLayer = this._layers[removed.toISOString()];
                if (this.map !== undefined) {
                    this.map.removeLayer(removedLayer);
                }
                delete this._layers[removed.toISOString()];
            }, this);

            if (time !== undefined) {
                this.setTime(time);
            }
        },

        setVisibility : function(visibility) {
            OpenLayers.Layer.prototype.setVisibility.call(this, visibility);
            _.each(this._layers, this.reconfigureLayer, this);
        },

        setOpacity : function(opacity) {
            this._opacity = opacity;
            OpenLayers.Layer.prototype.setOpacity.call(this, opacity);
            _.each(this._layers, this.reconfigureLayer, this);
        },

        getOpacity : function() {
            return this._opacity;
        },

        setZIndex : function(zIndex) {
            OpenLayers.Layer.prototype.setZIndex.call(this, zIndex);
            _.each(this._layers, this.reconfigureLayer, this);
        },

        /**
         * Same as getLegendInfo in Animation.js
         * TODO Move documentation here
         */
        getLegendInfo : function() {
            var embeddedLayer = this._layerFactory(new Date());
            return this._legendInfoProvider.provideLegendInfo(embeddedLayer);
        }
    });
})();
