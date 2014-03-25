"use strict";

(function() {
    OpenLayers.Layer.Animation.RangedLayerClassWrapper = function(klass, options) {
        return OpenLayers.Class(klass, {
            initialize : function() {
                klass.prototype.initialize.apply(this, arguments);
                this._time = undefined;
                this._range = undefined;
            },

            setTime : function(t) {
                this._time = t;
                if (OpenLayers.Layer.Animation.Utils.inRange(t, this._range)) {
                    options.timeSetter.apply(this, [t]);
                    options.inRange.apply(this);
                } else {
                    options.outOfRange.apply(this);
                }
            },
            setTimeAndRange : function(time, range) {
                this._range = range;
                this.setTime(time);
            },
            setRange : function(range) {
                this._range = range;
                if (this._time) {
                    // Reset time to handle in/out-of-rangeness
                    this.setTime(this._time);
                }
            }
        });
    };


    OpenLayers.Layer.Animation.RangedLayerClassWrapper.makeVisible = function() {
        this.setVisibility(true);
    };

    OpenLayers.Layer.Animation.RangedLayerClassWrapper.makeInvisible = function() {
        this.setVisibility(false);
    };

})();
