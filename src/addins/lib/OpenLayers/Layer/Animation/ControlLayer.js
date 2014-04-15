"use strict";

(function() {
    OpenLayers.Layer.Animation.ControlLayer = OpenLayers.Class(OpenLayers.Layer, {

        initialize : function(name, options) {
            OpenLayers.Layer.prototype.initialize.call(this, name, options);

            this._layers = options.layers; // Layers to control
        },

        setVisibility : function(visibility) {
            OpenLayers.Layer.prototype.setVisibility.call(this, visibility);
            _.each(this._layers, function(layer) {
                layer.setVisibility(visibility);
            });
        }
    });
})();
