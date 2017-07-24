define([], function () {
    /**
     * @typedef {function} ChromeMessageResponseCallback
     */

    var MauMessage = function (/** string */ name) {
        this.name = name;
    };

    /**
     * @memberOf MauMessage
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

    /**
     * @memberOf MauMessage
     * @param {function(object, object, function)} handler
     */
    MauMessage.prototype.subscribe = function (handler) {
        //noinspection JSCheckFunctionSignatures
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.name === this.name)
                return handler(request, sender, sendResponse);
        });
    };

    /**
     * @typedef {object} Messages
     * @property {MauMessage} GET_LANG_CODE
     * @property {MauMessage} LOAD_SOUND
     */
    return {
        GET_LANG_CODE: new MauMessage('mau-get-lang-code'),
        LOAD_SOUND: new MauMessage('mau-load-sound')
    };
});
