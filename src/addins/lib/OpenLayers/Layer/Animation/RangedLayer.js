"use strict";

/**
 * Interface for layers that support limiting their visible time range.
 */
OpenLayers.Layer.Animation.RangedLayer = OpenLayers.Class({
    /**
     * Set both visible and available range. If available range is
     * undefined, it is set to same as visibleRange.
     *
     * @param {timestep} visibleRange Visible times.
     * @param {timestep} availableRange Available times.
     */
    setRange : function(visibleRange, availableRange) {
        throw "This is an interface";
    },

    /**
     * Get current visible range.
     *
     * @return {timestep} Visible times.
     */
    getRange : function(range) {
        throw "This is an interface";
    },

    /**
     * Set range for which this layer should be displayed, and current
     * time. May reduce transition artifacts compared to sequential
     * setRange() and setTime() calls. If dataRange is undefined, it
     * is set to same as visibleRange.
     *
     * @param {Date} time Time to set layer to.
     * @param {timestep} range Renderable times.
     * @param {timestep} range Times for which data is available times.
     */
    setTimeAndRange : function(time, visibleRange, dataRange) {
        throw "This is an interface";
    },

    /**
     * Set range for which this layer has available data.
     *
     * @param {timestep} range Available times.
     */
    setDataRange : function(range) {
        throw "This is an interface";
    },

    /**
     * Get current range for which this layer has data available.
     *
     * @return {timestep} Available times.
     */
    getDataRange : function(range) {
        throw "This is an interface";
    },

    /**
     * Set range for which this layer should be displayed. Undefined
     * range endpoints mean that the range is not limited in that
     * direction.
     *
     * @param {timestep} range Renderable times.
     */
    setVisibleRange : function(range) {
        throw "This is an interface";
    },

    /**
     * Get current range for which this layer should be displayed.
     *
     * @return {timestep} Renderable times.
     */
    getVisibleRange : function(range) {
        throw "This is an interface";
    },

    CLASS_NAME : "OpenLayers.Layer.Animation.RangedLayer"
});
