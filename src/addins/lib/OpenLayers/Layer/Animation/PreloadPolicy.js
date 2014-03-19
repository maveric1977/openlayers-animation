"use strict";

OpenLayers.Layer.Animation.PreloadPolicy = OpenLayers.Class({
    /**
     * Interface for asking a preload-enabled layer to preload certain
     * time steps.
     *
     * @param {Date} t Time that the layer is set to.
     * @return {Array<Date>} Dates to preload.
     */
    preloadAt : function(t) {
        throw "This is an interface";
    }
});

OpenLayers.Layer.Animation.PreloadDisabled = OpenLayers.Class(OpenLayers.Layer.Animation.PreloadPolicy, {
    preloadAt : function(t) {
        return [];
    }
});

OpenLayers.Layer.Animation.PreloadNext = OpenLayers.Class(OpenLayers.Layer.Animation.PreloadPolicy, {
    initialize : function(step, range) {
        this.step = step;
        this.range = range;
    },

    preloadAt : function(t) {
        var next = new Date(t.getTime() + this.step);
        if (next > this.range[1]) {
            console.log(t, "first", this.range[0]);
            return [this.range[0]];
        } else {
            console.log(t, "next", next);
            return [next];
        }
    }
});

OpenLayers.Layer.Animation.PreloadAll = OpenLayers.Class(OpenLayers.Layer.Animation.PreloadPolicy, {
    initialize : function(step, range) {
        this.step = step;
        this.range = range;
    },

    preloadAt : function(t) {
        var times = [];
        var t_preload;
        for (t_preload = t.getTime(); t_preload <= this.range[1]; t_preload += this.step) {
            times.push(new Date(t_preload));
        }
        for (t_preload = this.range[0].getTime(); t_preload < t; t_preload += this.step) {
            times.push(new Date(t_preload));
        }

        return times;
    }
});
