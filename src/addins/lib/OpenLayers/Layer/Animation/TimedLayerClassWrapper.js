"use strict";

OpenLayers.Layer.Animation.TimedLayerClassWrapper = function(klass, options) {
    return OpenLayers.Class(klass, {
        initialize : function() {
            klass.prototype.initialize.apply(this, arguments);
            this._time = undefined;
        },

        setTime : function(t) {
            this._time = t;
            options.timeSetter.apply(this, [t]);
        },

        getTime : function() {
            return this._time;
        }
    });
};


OpenLayers.Layer.Animation.TimedLayerClassWrapper.mergeParams = function(t) {
    // TODO Browser compatibility of toISOString()?
    this.mergeNewParams({"TIME" : t.toISOString()});
};
