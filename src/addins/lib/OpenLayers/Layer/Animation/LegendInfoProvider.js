"use strict";

OpenLayers.Layer.Animation.LegendInfoProvider = OpenLayers.Class({
    /**
     * Interface for asking a layer to provider legend information to be shown alongside it.
     *
     * @param {Layer} layer Layer to provide legend info for
     * @return {Array<LegendInfo>} Information about legends that should be shown for this layer
     */
    provideLegendInfo : function(preloadingLayer) {
        throw "This is an interface";
    },

    CLASS_NAME : "OpenLayers.Layer.Animation.LegendInfoProvider"
});

OpenLayers.Layer.Animation.DisabledLegendInfoProvider = OpenLayers.Class(OpenLayers.Layer.Animation.LegendInfoProvider, {
    initialize : function() {
    },
    provideLegendInfo : function(rangedLayer) {
        return [];
    },

    CLASS_NAME : "OpenLayers.Layer.Animation.DisabledLegendInfoProvider"
});

OpenLayers.Layer.Animation.FixedLegendInfoProvider = OpenLayers.Class(OpenLayers.Layer.Animation.LegendInfoProvider, {
    initialize : function(legendInfo) {
        this.legendInfo = legendInfo;
    },
    provideLegendInfo : function(rangedLayer) {
        return [this.legendInfo];
    },

    CLASS_NAME : "OpenLayers.Layer.Animation.FixedLegendInfoProvider"
});

OpenLayers.Layer.Animation.WMSWMTSLegendInfoProvider = OpenLayers.Class(OpenLayers.Layer.Animation.LegendInfoProvider, {
    initialize : function() {
    },
    provideLegendInfo : function(wmsLayer) {
        var info = [];
        var layerParams = wmsLayer.params;
        var layerIdString = layerParams.LAYERS || layerParams.LAYER; // LAYERS for WMS, LAYER for WMTS
        var layerIds = layerIdString.split(",");

        var _url = wmsLayer.url;
        if (typeof _url !== "string") {
            _url = _url[0]; // There might in theory be multiple URLs
        }

        var params = OpenLayers.Util.getParameters(_url);
        params.REQUEST = "GetLegendGraphic";
        if (params.FORMAT === undefined) {
            params.FORMAT = "image/png";
        }

        var urlParts = OpenLayers.Util.createUrlObject(_url);
        _.each(layerIds, function(layerId) {
            params.LAYER = layerId;
            var url = urlParts.protocol + "//" + urlParts.host + ":" + urlParts.port + urlParts.pathname + "?" + OpenLayers.Util.getParameterString(params);
            info.push({
                // Name may be empty depending if it was originally given for layer.
                name : wmsLayer.name,
                url : url,
                hasLegend : true
            });
            
        });

        return info;
    },

    CLASS_NAME : "OpenLayers.Layer.Animation.WMSWMTSLegendInfoProvider"
});
