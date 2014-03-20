"use strict";

OpenLayers.Layer.Animation.PreloadingTimedLayer = OpenLayers.Class(OpenLayers.Layer, {

    initialize : function(name, options) {
        OpenLayers.Layer.prototype.initialize.call(this, name, options);
        var _me = this;

        this._layerFactory = options.layerFactory;
        this._layers = {}; // indexed by ISO 8601 time string
        this._opacity = 1.0; // Not available through Layer, store locally

        this._preloadPolicy = options.preloadPolicy;
        this._retainPolicy = options.retainPolicy;

        this._start = undefined; // set through setTimeAndRange, undefined means unlimited
        this._end = undefined; // set through setTimeAndRange, undefined means unlimited

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
        layer.setOpacity(this.getOpacity());
        // TODO Take into account that only "current" layer, if any, should be visible
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
        if ((this._start !== undefined && t < this._start) || (this._end !== undefined && t > this._end)) {
            // TODO Move in-range check to some utility? Import timestep.js from wmap?
            // Don't set time if outside range

            // TODO Keep track of current layer/time
            // TODO Use fader
            _.each(this._layers, function(layer) {layer.setOpacity(0);});
            return;
        }
        var layer = this.loadLayer(t);

        // TODO Switch layers through fader
        _.each(this._layers, function(layer) {layer.setOpacity(0);});
        layer.setOpacity(this.getOpacity());

        var preloadTimes = this._preloadPolicy.preloadAt(t);
        _.each(preloadTimes, function(preloadTime) {
            var preloadLayer = this.loadLayer(preloadTime);
        }, this);

    },

    setTimeAndRange : function(time, start, end) {
        this._start = start;
        this._end = end;

        // TODO Get time through an API
        var loadedTimes = _.map(this._layers, function(v, k) {return new Date(v.params.TIME);});
        var retainedTimes = this._retainPolicy.retain([start, end], loadedTimes);
        console.log("Loaded", loadedTimes);
        console.log("Retained", retainedTimes);
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

        this.setTime(time);
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
