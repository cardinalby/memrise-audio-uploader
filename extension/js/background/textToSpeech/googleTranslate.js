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
async function googleTranslateTts(word, languageCode)
{
    /**
     * @return {Promise<Blob>}
     */
    async function loadSoundFile() {
        const queryParams = new URLSearchParams({
            ie: 'UTF-8',
            q: word,
            tl: languageCode,
            total: 1,
            idx: 0,
            textlen: word.length,
            client: 'tw-ob',
            prev: 'input',
            ttsspeed: 1,
        }).toString();
        const response = await fetch(
            'https://translate.google.com/translate_tts?' + queryParams
        );
        if (!response.ok) {
            throw new Error(`Error ${response.status} requesting a ${word} sound. ` + await response.text());
        }
        return response.blob();
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

    return serializeBlob(await loadSoundFile());
}
