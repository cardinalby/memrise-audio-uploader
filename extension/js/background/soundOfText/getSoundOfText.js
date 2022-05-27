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
    async function delay(msec) {
        return new Promise(resolve => {
            setTimeout(resolve, Math.max(0, msec));
        });
    }

    async function postText() {
        const response = await fetch(SOUND_OF_TEXT_API_URL + '/sounds',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: {
                    text: word,
                    voice: languageCode
                },
                engine: 'Google'
            })
        });
        if (response.ok) {
            return response.json();
        }
        throw new Error(`Error ${response.status} posting a word to ${SOUND_OF_TEXT_API_URL}. ` + await response.text());
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
    async function getSoundFileUrl(soundId) {
        const response = await fetch(SOUND_OF_TEXT_API_URL + '/sounds/' + soundId);
        if (!response.ok) {
            throw new Error(`Error ${response.status} requesting a ${soundId} sound status. ` + await response.text());
        }
        const data = await response.json();
        switch (data.status) {
            case 'Done':
                return Promise.resolve(data.location);
            case 'Error':
                return Promise.reject(new Error(data.message));
            case 'Pending':
                await delay(1000);
                return getSoundFileUrl(soundId)
            default:
                return Promise.reject(new Error('Unknown status: ' + data.status));
        }
    }

    /**
     * @param {string} url
     * @return {Promise<Blob>}
     */
    async function loadSoundFile(url) {

        const response = await fetch(url);
        if (response.ok) {
            return response.blob();
        }
        throw new Error(`Error ${response.status} downloading sound from ${url}.`);
    }

    /**
     * @param {Blob} blob
     * @return {Promise<Base64File>}
     */
    function serializeBlob(blob) {
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
        .then(serializeBlob);
}