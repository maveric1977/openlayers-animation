"use strict";

OpenLayers.Layer.Animation.RetainPolicy = OpenLayers.Class({
    /**
     * Interface for asking a preload-enabled layer to preload certain
     * time steps.
     *
     * @param {Array<Date>} range Current range of the layer
     * @param {Array<Date>} times Currently loaded times of the layer
     * @return {Array<Date>} Times to retain loaded.
     */
    retain : function(range, times) {
        throw "This is an interface";
    }
});

OpenLayers.Layer.Animation.RetainAll = OpenLayers.Class(OpenLayers.Layer.Animation.RetainPolicy, {
    initialize : function() {
    },

    retain : function(range, times) {
        return times;
    }
});

OpenLayers.Layer.Animation.RetainRange = OpenLayers.Class(OpenLayers.Layer.Animation.RetainPolicy, {
    initialize : function() {
    },
    retain : function(range, times) {
        return _.filter(times, function(t) {return (range[0] === undefined || t >= range[0]) && (range[1] === undefined || t <= range[1]);});
    }
});

