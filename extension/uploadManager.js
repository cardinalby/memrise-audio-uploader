class UploadManagerLanguageNotSpecifiedError extends Error {
    constructor(languages) {
        super();
        /**
         * @type SotLanguage[]
         */
        this.languages = languages;
    }
}

/**
 * @param {int} maxConcurrentUploads
 * @class
 */
class UploadManager {
    /**
     * @param {number} maxConcurrentUploads
     */
    constructor(maxConcurrentUploads) {
        /**
         * @type {number}
         */
        this.maxConcurrentUploads = maxConcurrentUploads;
        /**
         * @type {boolean}
         */
        this.stopping = false;
    };

    /**
     * @param {string} languageCode
     * @param {function} onStarted
     * @param {function(number, number)} onProgress
     * @return Promise<void>
     */
    async startAutoUpload(
        languageCode,
        onStarted,
        onProgress,
    ) {
        this.stopping = false;
        const rows = $.grep(memriseCourse.initialize(), function (row) {
            return !row.hasSound;
        });

        if (rows.length === 0) {
            onProgress(0, 0);
            return;
        }

        if (languageCode !== undefined) {
            return this.autoUploadImpl(rows, languageCode, onProgress);
        }

        const foundLangs = SotLanguageMap.findByName(memriseCourse.wordsLanguage);
        if (foundLangs.length === 1) {
            return this.autoUploadImpl(rows, foundLangs[0].code, onProgress);
        }

        if (foundLangs.length === 0) {
            throw new Error('Unknown course language: ' + memriseCourse.wordsLanguage);
        }

        throw new UploadManagerLanguageNotSpecifiedError(foundLangs);
    }

    /**
     * @param {MemriseCourseWordRow[]} rows
     * @param {string} langCode
     * @param {function(number, number)} onProgress
     * @return Promise<void>
     */
    async autoUploadImpl(
        rows,
        langCode,
        onProgress
    ) {
        let uploadsCount = 0;
        let doneCount = 0;
        let rowIndex = 0;

        return new Promise(resolve =>
        {
            const startNewUploads = () => {
                while (uploadsCount < this.maxConcurrentUploads &&
                       rowIndex < rows.length &&
                       !this.stopping)
                {
                    ++uploadsCount;

                    this.uploadForRow(rows[rowIndex], langCode)
                        .finally(() => {
                            ++doneCount;
                            --uploadsCount;

                            onProgress(doneCount, rows.length);

                            startNewUploads();
                        })
                        .catch(console.log);

                    ++rowIndex;
                }

                if (rowIndex === rows.length || this.stopping && uploadsCount === 0) {
                    resolve();
                }
            };

            startNewUploads();
        });
    };

    stopUploading() {
        this.stopping = true;
    };

    static base64ToBlob(obj) {
        const binary = atob(obj.base64);
        const len = binary.length;
        const buffer = new ArrayBuffer(len);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }
        return new Blob([view], {type: obj.contentType});
    };

    uploadForRow(row, languageCode) {
        return new Promise((resolve, reject) =>
        {
            MESSAGES.LOAD_SOUND.send({
                    word: row.word,
                    languageCode: languageCode
                },
                async response => {
                    if (!response || !response.success) {
                        row.audioCellAddErrorMsg();
                        reject();
                        return;
                    }

                    if (row.hasSound) {
                        return;
                    }

                    const sound = UploadManager.base64ToBlob(response.sound);
                    const removeUploadingMsg = row.audioCellAddUploadingMsg();
                    try {
                        const uploadingResponse = await memriseCourse.uploadSound(row, sound);
                        row.replaceAudioCell(uploadingResponse.rendered);
                        resolve();
                    }
                    catch (error) {
                        removeUploadingMsg();
                        row.audioCellAddErrorMsg();
                        reject();
                    }
                });
        });
    };
}

uploadManager = new UploadManager(3);
