"use strict";

OpenLayers.Layer.Animation.PreloadingTimedLayer = OpenLayers.Class(OpenLayers.Layer, {

    initialize : function(name, options) {
        OpenLayers.Layer.prototype.initialize.call(this, name, options);
        var _me = this;

        this._layerFactory = options.layerFactory;
        this._layers = {}; // indexed by ISO 8601 time string
        this._opacity = 1.0; // Not available through Layer, store locally
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
    },

    /**
     * Interface for layers that support setting time of the layer.
     */
    setTime : function(t) {

        // TODO Switch layers througg fader
        _.each(this._layers, function(layer) {layer.setVisibility(false);});

        var k = t.toISOString();
        var layer = this._layers[k];
        if (layer === undefined) {
            layer = this._layerFactory(t);
            this.initLayer(layer);
            this.reconfigureLayer(layer);
            this._layers[k] = layer;
        }
        // TODO Switch layers through fader
        layer.setVisibility(this.getVisibility());

        // TODO CB on when this layer is added to / removed from a map - must propagate

        // TODO Ask preload policy if some timesteps should be preloaded
        // TODO Ask unload policy if some timesteps should be discarded
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
