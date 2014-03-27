"use strict";

OpenLayers.Layer.Animation.Fader = OpenLayers.Class({
    /**
     * Interface for transitioning between two timesteps.
     *
     * @param {PreloadingTimedLayer} parentLayer The layer controlling the transition
     * @param {Layer} fadeOut The layer that should be faded out. May be undefined.
     * @param {Layer} fadeIn The layer that should be faded in. May be undefined.
     * @param {Function} cb Callback that must be called after fading is finished
     * @return {Array<Date>} Dates to preload.
     */
    fade : function(parentLayer, fadeOut, fadeIn, afterFade) {
        throw "This is an interface";
    }
});

OpenLayers.Layer.Animation.ImmediateFader = OpenLayers.Class(OpenLayers.Layer.Animation.Fader, {
    fade : function(parentLayer, fadeOut, fadeIn, afterFade) {
        if (fadeOut !== undefined) {
            fadeOut.setOpacity(0);
        }
        if (fadeIn !== undefined) {
            fadeIn.setOpacity(parentLayer.getOpacity());
        }
        afterFade();
    }
});

OpenLayers.Layer.Animation.TimedFader = OpenLayers.Class(OpenLayers.Layer.Animation.Fader, {
    initialize : function(duration, step) {
        this.duration = duration; // ms
        this.step = step; // step in ms
    },

    fade : function(parentLayer, fadeOut, fadeIn, afterFade) {
        var parentOpacity = parentLayer.getOpacity();
        
        var nSteps = Math.floor(this.duration / this.step);

        var opacityStep = parentOpacity/nSteps;

        var stepCounter = 0;
        var intervalId = setInterval(function() {
            if (stepCounter < nSteps) {
                stepCounter += 1;
                if (fadeOut !== undefined) {
                    fadeOut.setOpacity(parentOpacity - stepCounter*opacityStep);
                }
                if (fadeIn !== undefined) {
                    fadeIn.setOpacity(stepCounter*opacityStep);
                }
            } else {
                clearInterval(intervalId);
                if (fadeOut !== undefined) {
                    fadeOut.setOpacity(0);
                }
                if (fadeIn !== undefined) {
                    fadeIn.setOpacity(parentOpacity);
                }
                afterFade();
            }
        }, this.step);
    }
});
