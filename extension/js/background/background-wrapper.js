// #include_if CHROME_BUILD

// Service worker wrapper for Manifest V3
// Imports all the background scripts in the correct order
importScripts(
    '../compatibility.js',
    '../messages.js',
    'textToSpeech/googleTranslate.js',
    'background.js'
);
