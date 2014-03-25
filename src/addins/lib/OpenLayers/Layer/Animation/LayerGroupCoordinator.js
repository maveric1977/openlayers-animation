"use strict";

OpenLayers.Layer.Animation.LayerGroupCoordinator = OpenLayers.Class({

    initialize : function(layers, constraints, availableRanges) {
        this._layers = {}; // Mapping layer id -> layer
        _.each(layers, function(l) {this._layers[l.name] = l;}, this);
        this.update(constraints, availableRanges);
    },

    // TODO Privatize properly
    // Ranges are described elsewhere
    limitRange : function(rangeToLimit, limitRange) {
        console.log(rangeToLimit, limitRange);
        function pick(a, b, picker) {
            if (a === undefined) {
                return b;
            } else if (b === undefined) {
                return a;
            } else {
                return picker(a,b);
            }
        }
        function lesser(a,b) {
            return a < b ? a : b;
        }
        function greater(a,b) {
            return a > b ? a : b;
        }

        var begin = pick(rangeToLimit[0], limitRange[0], greater);
        var end = pick(rangeToLimit[1], limitRange[1], lesser);
        
        return [begin, end];
    },

        // Constraint object:
        // - globalRange - all availableRanges are limited to this
        // - rangeGroups {groupId : {range:range, layers:layers}}
        //   - availableRanges are limited by the first rangeGroup.range whose .layers contains their id
    update : function(constraints, availableRanges) {
        var constrainedRanges = {};
        _.each(availableRanges, function(range, layerName) {
            var globallyLimitedRange = this.limitRange(range, constraints.globalRange);
            var rangeGroupId = _.findKey(constraints.rangeGroups, function(rangeGroup) {
                return _.contains(rangeGroup.layers, layerName);
            });

            var result;
            if (rangeGroupId === undefined) {
                result = globallyLimitedRange;
            } else {
                result = this.limitRange(globallyLimitedRange, constraints.rangeGroups[rangeGroupId].range);
            }
            constrainedRanges[layerName] = result;
        }, this);

        _.each(this._layers, function(layer, layerName) {
            var limitedRange = constrainedRanges[layerName];
            if (limitedRange !== undefined) {
                // TODO Update ranges
                // TODO *need* access to time of layer, this is a huge hack that only works with PreloadingTimedLayers
                layer.setRange(limitedRange);
            } else {
                console.log("No limited range for layer", layerName);
                // TODO Warn somehow that no range was set for a layer?
            }
        });
    },


    /**
     * Set time for all layers
     */
    setTime : function(t) {
        _.invoke(this._layers, "setTime", t);
    }

});
