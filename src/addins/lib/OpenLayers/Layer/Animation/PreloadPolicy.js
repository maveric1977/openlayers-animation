"use strict";

OpenLayers.Layer.Animation.PreloadPolicy = OpenLayers.Class({
    /**
     * Interface for asking a preload-enabled layer to preload certain
     * time steps.
     *
     * @param {RangedLayer} layer Layer to decide preload times for
     * @param {Date} t Time that the layer is set to.
     * @return {Array<Date>} Dates to preload.
     */
    preloadAt : function(rangedLayer, t) {
        throw "This is an interface";
    }
});

OpenLayers.Layer.Animation.PreloadDisabled = OpenLayers.Class(OpenLayers.Layer.Animation.PreloadPolicy, {
    preloadAt : function(layer, t) {
        return [];
    }
});

OpenLayers.Layer.Animation.PreloadNext = OpenLayers.Class(OpenLayers.Layer.Animation.PreloadPolicy, {
    initialize : function(step) {
        this.step = step;
    },

    preloadAt : function(layer, t) {
        var next = new Date(t.getTime() + this.step);
        if (next > layer.getRange()[1]) {
            console.log(t, "first", this.range[0]);
            return [layer.getRange()[0]];
        } else {
            console.log(t, "next", next);
            return [next];
        }
    }
});

OpenLayers.Layer.Animation.PreloadAll = OpenLayers.Class(OpenLayers.Layer.Animation.PreloadPolicy, {
    initialize : function(step) {
        this.step = step;
    },

    preloadAt : function(layer, t) {
        var times = [];
        var t_preload;
        var range = layer.getRange();
        for (t_preload = t.getTime(); t_preload <= range[1]; t_preload += this.step) {
            times.push(new Date(t_preload));
        }
        for (t_preload = range[0].getTime(); t_preload < t; t_preload += this.step) {
            times.push(new Date(t_preload));
        }

        return times;
    }
});
