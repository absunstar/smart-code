module.exports = function (SOCIALBROWSER, window, document) {
    SOCIALBROWSER.onLoad(() => {
        alert('Youtube Info Activated');
        let channelLogoSelector = 'yt-decorated-avatar-view-model img[src]';
        function sendData() {
            let title = document.title;
            SOCIALBROWSER.share({ type: 'generator-youtube-video-info', title: title, url: document.location.href, image: { url: document.querySelector(channelLogoSelector).src } });
            SOCIALBROWSER.currentWindow.close();
        }
        setInterval(() => {
            if (document.querySelector(channelLogoSelector)) {
                sendData();
            }
        }, 1000 * 3);
    });
};
