// For edge
if (typeof(chrome) === 'undefined') {
    // noinspection JSUnresolvedVariable
    chrome = browser;
}

/**
 * @return {XMLHttpRequest}
 */
function createXMLHttpRequest() {
    return typeof XPCNativeWrapper === 'function'
        // for Firefox, to provide page referer
        ? XPCNativeWrapper(new window.wrappedJSObject.XMLHttpRequest())
        // for chrome
        : new XMLHttpRequest();
}
