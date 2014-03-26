"use strict";

(function() {
    OpenLayers.Layer.Animation.PreloadingTimedLayer = OpenLayers.Class(OpenLayers.Layer, OpenLayers.Layer.Animation.TimedLayer, OpenLayers.Layer.Animation.TimedLayer, {

        initialize : function(name, options) {
            OpenLayers.Layer.prototype.initialize.call(this, name, options);
            var _me = this;

            this._layerFactory = options.layerFactory;
            this._layers = {}; // indexed by ISO 8601 time string
            this._opacity = 1.0; // Not available through Layer, store locally

            this._preloadPolicy = options.preloadPolicy;
            this._retainPolicy = options.retainPolicy;

            this._currentLayer = undefined; // set through setTime
            this._time = undefined; // set through setTime
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

        setTime : function(t) {
            if (!OpenLayers.Layer.Animation.Utils.inRange(t, this._range)) {
                // Don't set time if outside range

                // TODO Use fader
                _.each(this._layers, function(layer) {layer.setOpacity(0);});
                return;
            }
            this._time = t;
            var layer = this.loadLayer(t);
            this._currentLayer = layer;
            console.log("Setting time", layer.name, t, this._range);

            // TODO Switch layers through fader
            _.each(this._layers, function(layer) {this.reconfigureLayer(layer);}, this);

            var preloadTimes = this._preloadPolicy.preloadAt(this, t);
            _.each(preloadTimes, function(preloadTime) {
                var preloadLayer = this.loadLayer(preloadTime);
            }, this);

        },

        getTime : function() {
            return this._time;
        },

        getRange : function() {
            return this._range;
        },


        setRange : function(range) {
            this.setTimeAndRange(this._time, range);
        },

        setTimeAndRange : function(time, range) {
            this._range = range;

            var loadedTimes = _.invoke(this._layers, 'getTime'); // TimedLayer.getTime
            var retainedTimes = this._retainPolicy.retain(range, loadedTimes);
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
        }
    });
})();
