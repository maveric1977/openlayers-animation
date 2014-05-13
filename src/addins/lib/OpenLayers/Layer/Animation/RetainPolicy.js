"use strict";

OpenLayers.Layer.Animation.RetainPolicy = OpenLayers.Class({
    /**
     * Interface for asking a preload-enabled layer to preload certain
     * time steps.
     *

     * @param {Array<Date>} times Currently loaded times of the layer
     * @return {Array<Date>} Times to retain loaded.
     */
    retain : function(times) {
        throw "This is an interface";
    },

    CLASS_NAME : "OpenLayers.Layer.Animation.RetainPolicy"
});

OpenLayers.Layer.Animation.RetainAll = OpenLayers.Class(OpenLayers.Layer.Animation.RetainPolicy, {
    initialize : function() {
    },

    retain : function(layer, times) {
        return times;
    },

    CLASS_NAME : "OpenLayers.Layer.Animation.RetainAll"
});

OpenLayers.Layer.Animation.RetainRange = OpenLayers.Class(OpenLayers.Layer.Animation.RetainPolicy, {
    initialize : function() {
    },
    retain : function(layer, times) {
        var range = layer.getRange();
        var start = range.startTime();
        var end = range.endTime();
        return _.filter(times, function(t) {return (start === undefined || t >= start) && (end === undefined || t <= end);});
    },

    CLASS_NAME : "OpenLayers.Layer.Animation.RetainRange"
});

