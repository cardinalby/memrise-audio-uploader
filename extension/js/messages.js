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
     * @return {Promise<any>}
     */
    send(options, response) {
        const message = options === undefined
            ? {}
            : options;
        message.name = this.name;
        return new Promise(resolve => chrome.runtime.sendMessage(message, resolve));
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
