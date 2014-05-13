"use strict";

(function() {

    // Ranges are described elsewhere
    function limitTimestep(timestepToLimit, limitRange) {
        return timestep.restricted(limitRange[0], limitRange[1], timestepToLimit);
    }


    OpenLayers.Layer.Animation.LayerGroupCoordinator = OpenLayers.Class({

        /**
         * @param {Array<Layer>} layers Array of layers that the coordinator should coordinate. Must noe be undefined or null.
         * @param {Constraints} constraints Constraints object that defines visibility constraints between layers.
         * @param {Object} availableRanges Mapping of layer name -> timestep, defines availability of data in the ranges.
         */
        initialize : function(layers, constraints, availableRanges) {
            this._layers = {}; // Mapping layer id -> layer
            this._constraints = undefined; // Set in update()
            this._time = undefined; // Set in setTime()
            _.each(layers, function(l) {this._layers[l.id] = l;}, this);
            this.update(constraints, availableRanges);
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
        // - timelines {timelineName : [layers]}
        //   - visibility can be controlled per-timeline
        //   - layers contains layer ids
        update : function(constraints, availableRanges) {
            this._constraints = constraints;

            _.each(this._layers, function(layer, layerId) {
                // TODO Should get actual timestep value from somewhere
                var globallyLimitedTimestep = timestep.restricted(constraints.globalRange[0], constraints.globalRange[1], 300000);
                var rangeGroupId = _.findKey(constraints.rangeGroups, function(rangeGroup) {
                    return _.contains(rangeGroup.layers, layer.name);
                });

                var limitedRange;
                if (rangeGroupId === undefined) {
                    limitedRange = globallyLimitedTimestep;
                } else {
                    limitedRange = limitTimestep(globallyLimitedTimestep, constraints.rangeGroups[rangeGroupId].range);
                }

                var availableRange = availableRanges[layerId];
                if (limitedRange !== undefined && availableRange !== undefined) {
                    layer.setRange(limitedRange, availableRange);
                } else {
                    throw "Undefined range for layer " + layer.name + ", available: " + availableRange;
                }
            });
        },


        /**
         * Set time for all layers.
         */
        setTime : function(t) {
            this._time = t;
            _.invoke(this._layers, "setTime", t);
        },

        
        /**
         * Get timeline names
         */
        getTimelines : function() {
            return _.keys(this._constraints.timelines);
        },


        CLASS_NAME : "OpenLayers.Layer.Animation.LayerGroupCoordinator"
    });
})();
