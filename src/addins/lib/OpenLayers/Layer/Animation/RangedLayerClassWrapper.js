"use strict";

(function() {
    function in_range(t, start, end) {
        return (start === undefined || t >= start) && (end === undefined || t <= end);
    }

    OpenLayers.Layer.Animation.RangedLayerClassWrapper = function(klass, options) {
        return OpenLayers.Class(klass, {
            setTime : function(t) {
                if (in_range(t, this._start, this._end)) {
                    options.timeSetter.apply(this, [t]);
                    options.inRange.apply(this);
                } else {
                    options.outOfRange.apply(this);
                }
            },
            setTimeAndRange : function(time, start, end) {
                this._start = start;
                this._end = end;
                this.setTime(time);
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
