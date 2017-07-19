function getActiveTab(callback) {
    chrome.tabs.query(
        {active: true, windowType: "normal", currentWindow: true},
        function (tabs) {
            var activeTab = tabs.length > 0 ? tabs[0] : null;
            callback(activeTab);
        });
}

function getBlobUrl(data)
{
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    return URL.createObjectURL( new Blob([data], {type: 'application/octet-binary'}) );
}