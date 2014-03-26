"use strict";

OpenLayers.Layer.Animation.LayerGroupCoordinator = OpenLayers.Class({

    initialize : function(layers, constraints, availableRanges) {
        this._layers = {}; // Mapping layer id -> layer
        this._constraints = undefined; // Set in update()
        this._time = undefined; // Set in setTime()
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

    /**
     * Get currently visible range groups.
     *
     * @return {Array<String>} Names of currently visible range
     * groups. If time is not set or current time is not in any range
     * group, an empty array is returned.
     */
    getCurrentRangeGroups : function() {
        var result = [];
        if (this._time !== undefined) {
            _.each(this._constraints.rangeGroups, function(group, groupId) {
                if (OpenLayers.Layer.Animation.Utils.inRange(this._time, group.range)) {
                    result.push(groupId);
                }
            }, this);
        }
        return result;
    },

        // Constraint object:
        // - globalRange - all availableRanges are limited to this
        // - rangeGroups {groupName : {range:range, layers:layers}}
        //   - availableRanges are limited by the first rangeGroup.range whose .layers contains their id
    update : function(constraints, availableRanges) {
        this._constraints = constraints;
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
     * Set time for all layers.
     */
    setTime : function(t) {
        this._time = t;
        _.invoke(this._layers, "setTime", t);
    }

});
