"use strict";

OpenLayers.Layer.Animation.TimedLayerClassWrapper = function(klass, options) {
    return OpenLayers.Class(klass, {
        setTime : function(t) {
            options.timeSetter.apply(this, [t]);
        }
    });
};


OpenLayers.Layer.Animation.TimedLayerClassWrapper.mergeParams = function(t) {
    // TODO Browser compatibility?
    this.mergeNewParams({"TIME" : t.toISOString()});
};
