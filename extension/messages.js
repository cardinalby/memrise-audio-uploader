define([], function () {

    /**
     * @typedef {function} ChromeMessageResponseCallback
     */

    var MauMessage = function (/** string */ name) {
        this.name = name;
    };

    /**
     * @param {object} [options]
     * @param {ChromeMessageResponseCallback} [response]
     */
    MauMessage.prototype.send = function (options, response) {
        var message = options === undefined
            ? {}
            : options;
        message.name = this.name;

        chrome.runtime.sendMessage(message, response);
    };

    MauMessage.prototype.subscribe = function (/** function */ handler) {
        //noinspection JSCheckFunctionSignatures
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.name === this.name)
                handler(request, sender, sendResponse);
        });
    };


});
