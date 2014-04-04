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
        var range = layer.getRange();
        var start = range.startTime();
        var end = range.endTime();
        if (OpenLayers.Layer.Animation.Utils.inRange(t, [start, end])) {
            return layer.getRange().previousAvailable(t, false);
        } else {
            return undefined;
        }
    }
});

OpenLayers.Layer.Animation.ShowNextAvailable = OpenLayers.Class(OpenLayers.Layer.Animation.TimeSelector, {
    initialize : function() {
    },
    selectTime : function(layer, t) {
        var range = layer.getRange();
        var start = range.startTime();
        var end = range.endTime();
        if (OpenLayers.Layer.Animation.Utils.inRange(t, [start, end])) {
            return layer.getRange().nextAvailable(t, false);
        } else {
            return undefined;
        }
    }
});

OpenLayers.Layer.Animation.ShowOnlyAvailable = OpenLayers.Class(OpenLayers.Layer.Animation.TimeSelector, {
    initialize : function() {
    },
    selectTime : function(layer, t) {
        var previous = layer.getRange().previousAvailable(t);
        if (previous.getTime() === t.getTime()) {
            return t;
        } else {
            return undefined;
        }
    }
});
