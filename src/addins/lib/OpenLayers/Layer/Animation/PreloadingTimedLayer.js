"use strict";

OpenLayers.Layer.Animation.PreloadingTimedLayer = OpenLayers.Class(OpenLayers.Layer, {

    initialize : function(name, options) {
        OpenLayers.Layer.prototype.initialize.call(this, name, options);
        var _me = this;

        this._layerFactory = options.layerFactory;
        this._layers = {}; // indexed by ISO 8601 time string
        this._opacity = 1.0; // Not available through Layer, store locally

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

    setTime : function(t) {
        if ((this._start !== undefined && t < this._start) || (this._end !== undefined && t > this._end)) {
            // Don't set time if outside range

            // TODO Keep track of current layer/time
            // TODO Use fader
            _.each(this._layers, function(layer) {layer.setOpacity(0);});
            return;
        }
        var k = t.toISOString();
        var layer = this._layers[k];
        if (layer === undefined) {
            layer = this._layerFactory(t);
            this.initLayer(layer);
            this.reconfigureLayer(layer);
            this._layers[k] = layer;
        }

        // TODO Switch layers through fader
        _.each(this._layers, function(layer) {layer.setOpacity(0);});
        layer.setOpacity(this.getOpacity());

        // TODO Ask preload policy if some timesteps should be preloaded
        // TODO Ask unload policy if some timesteps should be discarded
    },

    setTimeAndRange : function(time, start, end) {
        this._start = start;
        this._end = end;
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
