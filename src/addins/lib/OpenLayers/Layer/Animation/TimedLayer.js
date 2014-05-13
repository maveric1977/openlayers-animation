"use strict";

/**
 * Interface for layers that support setting time of the layer.
 */
OpenLayers.Layer.Animation.TimedLayer = OpenLayers.Class({
    /**
     * Set time shown by the layer. If the layer is incapable of
     * showing the exact time set, it may show the previous or next
     * time, depending on externally set policy.
     *
     * @param {Date} t Time to set layer to. Must not be undefined or null.
     */
    setTime : function(t) {
        throw "This is an interface";
    },

    /**
     * Get current time displayed by the layer.
     *
     * @param {Date} t Time the layer is set to.
     */
    getTime : function() {
        throw "This is an interface";
    },

    CLASS_NAME : "OpenLayers.Layer.Animation.TimedLayer"
});
