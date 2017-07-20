function getActiveTab(callback) {
    chrome.tabs.query(
        { active: true, windowType: "normal", currentWindow: true },
        function (tabs) {
            var activeTab = tabs.length > 0 ? tabs[0] : null;
            callback(activeTab);
        });
}