var BASE_URL = 'http://soundoftext.com/';

function GetLanguageCode(langName) {
    function loadMainPage() {
        return $.get(BASE_URL);
    }

    function getLanguageCode(page) {
        var d = $.Deferred();
        var code = $(page)
            .find('select[name="lang"]')
            .find('option:contains("' + langName + '")')
            .val();

        if (code)
            d.resolve(code);
        else
            d.reject('Unknown language: ' + langName);

        return d;
    }

    return loadMainPage().then(getLanguageCode);
}

function GetSoundOfText(word, languageCode)
{
    function sendWord() {
        return $.post({
            url: BASE_URL + 'sounds',
            data: {
                text: word,
                lang: languageCode
            }
        });
    }

    function getSoundId(data) {
        var d = $.Deferred();
        if (data.success && data.id)
            d.resolve(data.id);
        else
            d.reject('Soundoftext.com error');
        return d;
    }

    function getSoundInfo(soundId) {
        return $.get(BASE_URL + 'sounds/' + soundId);
    }

    function getSoundFileUrl(data) {
        var d = $.Deferred();
        var src = $(data).find('audio').find('source').attr('src');
        if (src)
            d.resolve(BASE_URL + src);
        else
            d.reject("Can't extract audio src path");
        return d;
    }

    function loadSoundFile(url) {
        return $.get(url);
    }

    return sendWord()
        .then(getSoundId)
        .then(getSoundInfo)
        .then(getSoundFileUrl)
        .then(loadSoundFile);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    switch (request.name)
    {
        case 'mau-get-lang-code':
            var gettingLangCode = GetLanguageCode(request.languageName);
            gettingLangCode.done(function (code) {
                sendResponse({success: true, code: code});
            });
            gettingLangCode.fail(function (error) {
                sendResponse({success: false, error: error});
            });
            return true;

        case 'mau-load-sound':
            var gettingSound = GetSoundOfText(request.word, request.languageCode);
            gettingSound.done(function (file, result, xhr) {
                sendResponse({
                    success: true,
                    sound: file,
                    contentType: xhr.getResponseHeader('Content-Type')
                });
            });
            gettingSound.fail(function (error) {
                sendResponse({success: false, error: error});
            });
            return true;
    }
});
