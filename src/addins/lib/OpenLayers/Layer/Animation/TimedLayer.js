"use strict";

OpenLayers.Layer.TimedLayer = OpenLayers.Class({
    /**
     * Interface for layers that support setting time of the layer.
     *
     * @param {Date} t Time to set layer to.
     */
    setTime : function(t) {
        throw "This is an interface";
    }
});
