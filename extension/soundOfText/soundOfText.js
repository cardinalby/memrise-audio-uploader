const SOUND_OF_TEXT_API_URL = 'https://api.soundoftext.com';

/**
 * @name Base64File
 * @type {object}
 * @property {string} base64
 * @property {string} contentType
 */

/**
 * @param {string} word
 * @param {string} languageCode
 * @return Promise<object>
 */
function getSoundOfText(word, languageCode)
{
    /**
     * @param {number} msec
     * @returns Promise
     */
    function delay(msec) {
        return new Promise(resolve => {
            setTimeout(resolve, Math.max(0, msec));
        });
    }

    function postText() {
        return $.ajax({
            url: SOUND_OF_TEXT_API_URL + '/sounds',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                data: {
                    text: word,
                    voice: languageCode
                },
                engine: 'Google'
            })
        });
    }

    /**
     * @param {object} data
     * @return {Promise<string>}
     */
    function getSoundId(data) {
        return new Promise((resolve, reject) => {
            if (data.success && data.id) {
                resolve(data.id);
            } else {
                reject(new Error(data.message));
            }
        });
    }

    /**
     * @param {string} soundId
     * @return {Promise<string>}
     */
    function getSoundFileUrl(soundId) {
        return $.get(SOUND_OF_TEXT_API_URL + '/sounds/' + soundId)
            .then(data => {
                switch (data.status) {
                    case 'Done':
                        return Promise.resolve(data.location);
                    case 'Error':
                        return Promise.reject(new Error(data.message));
                    case 'Pending':
                        return delay(1000).then(() => getSoundFileUrl(soundId));
                    default:
                        return Promise.reject(new Error('Unknown status: ' + data.status));
                }
            });
    }

    /**
     * @param {string} url
     * @return {Promise<Blob>}
     */
    function loadSoundFile(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        resolve(this.response);
                    } else {
                        reject(new Error('Sound file download error: ' + this.status));
                    }
                }
            };

            xhr.open('GET', url);
            xhr.responseType = 'blob';
            xhr.send();
        });
    }

    /**
     * @param {Blob} blob
     * @return {Promise<Base64File>}
     */
    function seriazlizeBlob(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function() {
                const dataUrl = reader.result;
                const base64 = dataUrl.split(',')[1];
                resolve({base64: base64, contentType: blob.type});
            };
            reader.onerror = () => reject(new Error('Blob serialization error'));
            reader.readAsDataURL(blob);
        });
    }

    return postText()
        .then(getSoundId)
        .then(getSoundFileUrl)
        .then(loadSoundFile)
        .then(seriazlizeBlob);
}

MESSAGES.LOAD_SOUND.subscribe((request, sender, sendResponse) => {
    getSoundOfText(request.word, request.languageCode)
        .then(/** Base64File */ base64file => {
            sendResponse({
                success: true,
                sound: base64file
            });
        })
        .catch(/** Error */ error => {
            sendResponse({
                success: false,
                error: error.message
            });
        });
    return true;
});