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

        this.memriseCourse = new MemriseCourse();
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
        const rows = $.grep(
            await this.memriseCourse.initialize(),
            (row) => {
                return !row.hasSound;
            });

        if (rows.length === 0) {
            onProgress(0, 0);
            return;
        }

        if (languageCode === undefined) {
            languageCode = this.findLanguageByName(this.memriseCourse.wordsLanguage);
        }
        onStarted(rows.length);
        return this.autoUploadImpl(rows, languageCode, onProgress);
    }

    findLanguageByName(languageName) {
        const foundLangs = SotLanguageMap.findByName(languageName);
        if (foundLangs.length === 1) {
            return foundLangs[0].code;
        }

        if (foundLangs.length === 0) {
            let regexResult = /^(.*?)\s\(.*?\)/.exec(languageName);
            if (regexResult !== null) {
                const shortLanguageName = regexResult[1];
                return this.findLanguageByName(shortLanguageName);
            }
            throw new Error('Unknown course language: ' + this.memriseCourse.wordsLanguage);
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
        /** @var {Map<number, Promise<void>>} uploads */
        let uploads = new Map();
        let doneCount = 0;
        rows.forEach(row => row.audioCellShowPendingMsg());

        for (let rowIndex = 0; (rowIndex < rows.length) && !this.stopping; ++rowIndex) {
            while (uploads.size >= this.maxConcurrentUploads) {
                await Promise.any(uploads.values());
            }
            const rowProcessingPromise = this.uploadForRow(rows[rowIndex], langCode)
                .finally(() => {
                    ++doneCount;
                    uploads.delete(rowIndex);
                    onProgress(doneCount, rows.length);
                })
                .catch(console.log);
            uploads.set(rowIndex, rowProcessingPromise);
        }
        await Promise.all(uploads.values());
        rows.forEach(row => row.audioCellClearMessage());
    }

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

    async uploadForRow(row, languageCode) {
        row.audioCellShowRequestingMsg();
        const response = await MESSAGES.LOAD_SOUND.send({
            word: row.word,
            languageCode: languageCode
        });

        if (!response || !response.success) {
            row.audioCellShowErrorMsg('download');
            throw new Error(response ? response.error : 'Unknown error');
        }

        if (row.hasSound) {
            row.audioCellClearMessage();
            return;
        }

        const sound = UploadManager.base64ToBlob(response.sound);
        row.audioCellShowUploadingMsg();
        try {
            const uploadingResponse = await this.memriseCourse.uploadSound(row, sound);
            row.replaceAudioCell(uploadingResponse.rendered);
        }
        catch (error) {
            row.audioCellClearMessage();
            row.audioCellShowErrorMsg('upload');
            throw error;
        }
    };
}

uploadManager = new UploadManager(4);
