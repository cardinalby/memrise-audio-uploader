var SOUND_OF_TEXT_BASE_URL = 'http://soundoftext.com';

/** @var {Messages} MESSAGES */

function GetLanguageCode(langName) {
    function loadMainPage() {
        return $.get(SOUND_OF_TEXT_BASE_URL);
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

    return loadMainPage()
        .then(getLanguageCode);
}

function GetSoundOfText(word, languageCode)
{
    function sendWord() {
        return $.post({
            url: SOUND_OF_TEXT_BASE_URL + '/sounds',
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
        return $.get(SOUND_OF_TEXT_BASE_URL + '/sounds/' + soundId);
    }

    function getSoundFileUrl(data) {
        var d = $.Deferred();
        var src = $(data).find('audio').find('source').attr('src');
        if (src)
            d.resolve(SOUND_OF_TEXT_BASE_URL + src);
        else
            d.reject("Can't extract audio src path");
        return d;
    }

    function loadSoundFile(url) {
        var result = $.Deferred();

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if (this.readyState === 4) {
                if (this.status === 200) {
                    result.resolve(this.response);
                }
                else {
                    result.reject();
                }
            }
        };

        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();

        return result;
    }

    function blobToBase64(blob) {
        var result = $.Deferred();
        var reader = new FileReader();
        reader.onload = function() {
            var dataUrl = reader.result;
            var base64 = dataUrl.split(',')[1];
            result.resolve(base64);
        };
        reader.readAsDataURL(blob);
        return result;
    }

    return sendWord()
        .then(getSoundId)
        .then(getSoundInfo)
        .then(getSoundFileUrl)
        .then(loadSoundFile)
        .then(blobToBase64);
}

MESSAGES.GET_LANG_CODE.subscribe(function(request, sender, sendResponse)
{
    var gettingLangCode = GetLanguageCode(request.languageName);
    gettingLangCode.done(function (code) {
        sendResponse({success: true, code: code});
    });
    gettingLangCode.fail(function (error) {
        sendResponse({success: false, error: error});
    });
    return true;
});

MESSAGES.LOAD_SOUND.subscribe(function(request, sender, sendResponse) {
    var gettingSound = GetSoundOfText(request.word, request.languageCode);
    gettingSound.done(function (file) {
        sendResponse({
            success: true,
            sound: file
        });
    });
    gettingSound.fail(function (error) {
        sendResponse({
            success: false,
            error: error
        });
    });
    return true;
});