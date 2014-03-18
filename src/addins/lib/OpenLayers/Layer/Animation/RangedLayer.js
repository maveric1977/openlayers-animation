"use strict";

OpenLayers.Layer.TimedLayer = OpenLayers.Class({
    /**
     * Interface for layers that support limiting their visible time range.
     *
     * Undefined range endpoints mean that the range is not limited in that direction.
     *
     * @param {Date} time Time to set layer to.
     * @param {Date} start Start time of visible range. Inclusive. May be undefined.
     * @param {Date} end End time of visible range. Inclusive. May be undefined.
     */
    setTimeAndRange : function(time, start, end) {
        throw "This is an interface";
    }
});
