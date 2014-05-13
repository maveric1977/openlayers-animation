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
    },

    CLASS_NAME : "OpenLayers.Layer.Animation.PreloadPolicy"
});

OpenLayers.Layer.Animation.PreloadDisabled = OpenLayers.Class(OpenLayers.Layer.Animation.PreloadPolicy, {
    initialize : function() {
    },
    preloadAt : function(layer, t) {
        return [];
    },

    CLASS_NAME : "OpenLayers.Layer.Animation.PreloadDisabled"
});

OpenLayers.Layer.Animation.PreloadNext = OpenLayers.Class(OpenLayers.Layer.Animation.PreloadPolicy, {
    initialize : function() {
    },
    preloadAt : function(layer, t) {
        var range = layer.getRange();
        var next = range.nextAvailable(t);
        if (next <= t) {
            console.log(t, "first", range);
            var first = range.startTime();
            if (first !== undefined) {
                return [first];
            } else {
                // Impossile to guess what the next time might be.
                return [];
            }
        } else {
            console.log(t, "next", next);
            return [next];
        }
    },

    CLASS_NAME : "OpenLayers.Layer.Animation.PreloadNext"
});

OpenLayers.Layer.Animation.PreloadAll = OpenLayers.Class(OpenLayers.Layer.Animation.PreloadPolicy, {
    initialize : function() {
    },
    preloadAt : function(layer, t) {
        var range = layer.getRange();
        var first = range.startTime();
        var last = range.endTime();
        if (first !== undefined && last !== undefined) {
            // Mighjt return current time, even twice, but that shouldn't matter
            var times = range.timesForInterval(t, last).concat(range.timesForInterval(first, t));
            return _.uniq(times, false, function(x) {return x.getTime();});
        } else {
            // Can't preload all, one range endpoint undefined
            return [];
        }
    },

    CLASS_NAME : "OpenLayers.Layer.Animation.PreloadAll"
});
