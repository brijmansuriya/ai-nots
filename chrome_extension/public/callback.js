// This script runs on the callback.html page
(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        // Store the token securely
        chrome.storage.local.set({ api_token: token }, () => {
            console.log('Token stored successfully');
            // Notify other parts of the extension
            chrome.runtime.sendMessage({ type: 'AUTH_SUCCESS' }, () => {
                if (chrome.runtime.lastError) {
                    // Ignore errors if no listener
                }
            });

            // Close the tab after a small delay
            setTimeout(() => {
                window.close();
            }, 1000);
        });
    } else {
        console.error('No token found in callback URL');
        document.body.innerHTML = '<div class="container"><h1>Authentication Failed</h1><p>No token was found. Please try again.</p></div>';
    }
})();
