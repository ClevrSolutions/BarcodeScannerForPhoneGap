/*global mxui, mx, dojo, cordova */
// !function(){"use strict";dojo.provide("BarcodeScannerForPhoneGap.widget.BarcodeScannerForPhoneGap"),dojo.declare("BarcodeScannerForPhoneGap.widget.BarcodeScannerForPhoneGap",mxui.widget._WidgetBase,{
define([
    "mxui/widget/_WidgetBase",
    "mxui/dom",
    "dojo/dom-class",
    "dojo/_base/declare",
    "dojo/html",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/dom-construct"
], function (_WidgetBase, mxuiDom, domClass, declare, dojoHtml, lang, on, domConstruct) {
    "use strict";

    return declare("BarcodeScannerForPhoneGap.widget.BarcodeScannerForPhoneGap", _WidgetBase, {
        // Coding guideline, internal variables start with '_'.
        // internal variables.
        _wxnode: null,
        _hasStarted: !1,
        _obj: null,
        _trigger: null,
        // Externally executed mendix function to create widget.
        startup: function () {
            if (!this._hasStarted) {
                this._hasStarted = !0,
                domClass.add(this.domNode, "wx-barcodescanner-container");
                // Create childnodes
                this._createChildnodes();
                // Setup events
                this._setupEvents();
            }
        },

        update: function (obj, callback) {
            "string" == typeof obj
                ? mx.data.get({
                    guid: obj,
                    callback: lang.hitch(this, function (obj) { this._loadData(obj) })
                })
                : null === obj
                    ? console.log("Whoops... the BarcodeScanner has no data!") : (
                        // Attach to data refresh.
                        mx.data.subscribe({
                            guid: obj.getGuid(),
                            callback: lang.hitch(this, this._refresh)
                        }),
                        // Load data
                        this._loadData(obj)
                    ),
                "undefined" != typeof callback && callback();
        },

        _loadData: function (obj) {
            this._obj = obj;
        },

        _refresh: function (obj) {
            "string" == typeof obj
                ? mx.data.get({
                    guid: obj,
                    callback: lang.hitch(this, function (obj) { this._loadData(obj) })
                })
                : null === obj
                    ? console.log("Whoops... the BarcodeScanner has no data!") : this._loadData(obj);
        },
        // Internal event setup.
        _setupEvents: function () {
            // Attach only one event to dropdown list.
            on(this._trigger, "click",
                lang.hitch(this, function (evt) {
                    // The barcode function has a success, failure and a reference to this.
                    "undefined" != typeof cordova
                        ? cordova.plugins.barcodeScanner.scan(
                            lang.hitch(this, this.barcodeSuccess),
                            lang.hitch(this, this.barcodeFailure)
                        )
                        : mx.ui.error("Unable to detect camera.");
                }))
        },

        barcodeSuccess: function (output) {
            0 == output.cancelled && output.text && output.text.length > 0 && (
                this._obj.set(this.attributeName, output.text),
                this._executeMicroflow()
            );
        },

        barcodeFailure: function (error) {
            var html = "Scanning failed: " + error;
            domConstruct.create("div", { innerHTML: html }, this._wxnode);
        },

        _executeMicroflow: function () {
            this.onchangemf && this._obj && mx.data.action({
                params: {
                    actionname: this.onchangemf,
                    applyto: "selection",
                    guids: [ this._obj.getGuid() ]
                },
                error: function () {},
            });
        },
        
        _createChildnodes: function () {
            // Placeholder container
            "button" == this.triggerType
                ? (this._trigger = mxuiDom.create("div", {}),
                    domClass.add(this._trigger,
                        "wx-mxwxbarcodescanner-button btn btn-primary"),
                    dojoHtml.set(this._trigger, this.buttonLabel || "Scan barcode."),
                    this.domNode.appendChild(this._trigger))
                : this._trigger = this.domNode,
                this.triggerClass && domClass.add(this._trigger, this.triggerClass);
        }
    });
});

require([ "BarcodeScannerForPhoneGap/widget/BarcodeScannerForPhoneGap" ]);
