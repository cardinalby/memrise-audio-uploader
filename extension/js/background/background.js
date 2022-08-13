MESSAGES.LOAD_SOUND.subscribe((request, sender, sendResponse) => {
    googleTranslateTts(request.word, request.languageCode)
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
