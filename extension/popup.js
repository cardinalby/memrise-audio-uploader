//noinspection JSCheckFunctionSignatures
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    if (request.name == messages.GPX_CREATED)
        onGpxCreated(request.links);

    else if (request.name == messages.GPX_CREATION_FAILED)
        onGpxCreationFailed(request.message);
});

chrome.runtime.sendMessage({ name: messages.MAKE_GPX});

function onGpxCreated(links) {

    $('#loader').remove();
    var linksDiv = $('.links');
    
    for (var i = 0; i < links.length; i++) {
        (function () {
            var link = links[i];

            $("<a/>", {
                href: '#',
                html: link.name,
                title: link.fileName,
                click: function () {
                    chrome.downloads.download({
                        url: link.url,
                        filename: link.fileName,
                        conflictAction: 'uniquify'});
                }
            }).appendTo(linksDiv);

            $("<br>").appendTo(linksDiv);
        })();
    }
}

function onGpxCreationFailed(message) {
    var loader = document.getElementById("loader");
    document.removeChild(loader);

    document.writeln(message);
}
