class MauMessage {
    /**
     * @param {string} name
     */
    constructor(name) {
        /**
         * @type {string}
         */
        this.name = name;
    }

    /**
     * @param {object} [options]
     * @param {function} [response]
     */
    send(options, response) {
        const message = options === undefined
            ? {}
            : options;
        message.name = this.name;

        chrome.runtime.sendMessage(message, response);
    };

    /**
     * @param {function(object, object, function)} handler
     */
    subscribe(handler) {
        chrome.runtime.onMessage.addListener(
            (request, sender, sendResponse) => {
                if (request.name === this.name) {
                    return handler(request, sender, sendResponse);
                }
            });
    };
}

/**
 * @enum {MauMessage}
 */
MESSAGES = {
    LOAD_SOUND: new MauMessage('mau-load-sound')
};
