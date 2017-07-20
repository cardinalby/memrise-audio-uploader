document.addEventListener('mau-send-ajax', function (event) {
    //var request = jQuery.ajax(event.detail);
    console.log(event);
});

document.dispatchEvent(new CustomEvent(
    'mau-set-memrise-token',
    {
        detail: MEMRISE.csrftoken
    }));