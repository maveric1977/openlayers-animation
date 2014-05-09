"use strict";

OpenLayers.Layer.Animation.TimeSelector = OpenLayers.Class({
    /**
     * Interface for deciding which time point should be shown when given time point is selected.
     *
     * @param {RangedLayer} rangedLayer Layer to make the decision on.
     * @param {Date} t Time that is selected.
     * @return {Date | undefined} Time to show, or undefined if nothing should be shown.
     */
    selectTime : function(rangedLayer, t) {
        throw "This is an interface";
    }
});

OpenLayers.Layer.Animation.ShowPreviousAvailable = OpenLayers.Class(OpenLayers.Layer.Animation.TimeSelector, {
    initialize : function() {
    },
    selectTime : function(layer, t) {
        var dataRange = layer.getDataRange();
        var visRange = layer.getVisibleRange();
        var start = visRange.startTime();
        var end = visRange.endTime();
        if (OpenLayers.Layer.Animation.Utils.inRange(t, [start, end])) {
            return dataRange.previousAvailable(t, false);
        } else {
            return undefined;
        }
    }
});

OpenLayers.Layer.Animation.ShowNextAvailable = OpenLayers.Class(OpenLayers.Layer.Animation.TimeSelector, {
    initialize : function() {
    },
    selectTime : function(layer, t) {
        var dataRange = layer.getDataRange();
        var visRange = layer.getVisibleRange();
        var start = visRange.startTime();
        var end = visRange.endTime();
        if (OpenLayers.Layer.Animation.Utils.inRange(t, [start, end])) {
            return dataRange.nextAvailable(t, false);
        } else {
            return undefined;
        }
    }
});

OpenLayers.Layer.Animation.ShowOnlyAvailable = OpenLayers.Class(OpenLayers.Layer.Animation.TimeSelector, {
    initialize : function() {
    },
    selectTime : function(layer, t) {
        var dataRange = layer.getDataRange();
        var visRange = layer.getVisibleRange();
        var start = visRange.startTime();
        var end = visRange.endTime();
        if (OpenLayers.Layer.Animation.Utils.inRange(t, [start, end])) {
            var previous = layer.getDataRange().previousAvailable(t);
            if (previous.getTime() === t.getTime()) { // Check that previous available time is current
                return t;
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }
});
