(function () {
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];

    const promptId = currentScript.getAttribute('data-id');
    const theme = currentScript.getAttribute('data-theme') || 'light';

    if (!promptId) {
        console.error('AI Notes Embed: data-id attribute is missing');
        return;
    }

    const container = document.createElement('div');
    container.className = 'ainots-prompt-embed';
    currentScript.parentNode.insertBefore(container, currentScript);

    // Use Shadow DOM to prevent style leakage
    const shadow = container.attachShadow({ mode: 'open' });

    // Create iframe-like container inside shadow root to isolate styles
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.height = '0'; // Will be resized
    iframe.scrolling = 'no';

    shadow.appendChild(iframe);

    // Fetch the embed content
    const baseUrl = window.location.origin; // This assumes the script is on the same domain or we can use the script src
    const scriptSrc = currentScript.src;
    const url = new URL(scriptSrc);
    const domain = url.origin;

    const embedUrl = `${domain}/embed/prompt/${promptId}?theme=${theme}`;

    fetch(embedUrl)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load prompt');
            return response.text();
        })
        .then(html => {
            const doc = iframe.contentWindow.document;
            doc.open();
            doc.write(html);
            doc.close();

            // Auto-resize iframe based on content
            const resize = () => {
                const body = doc.body;
                const html = doc.documentElement;
                const height = Math.max(
                    body.scrollHeight,
                    body.offsetHeight,
                    html.clientHeight,
                    html.scrollHeight,
                    html.offsetHeight
                );
                iframe.style.height = height + 'px';
            };

            // Initial resize
            setTimeout(resize, 100);
            // Resize on load
            iframe.onload = resize;
            // Intersection observer to handle cases where it might be hidden initially
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    resize();
                }
            });
            observer.observe(container);
        })
        .catch(err => {
            console.error('AI Notes Embed Error:', err);
            container.innerHTML = `<div style="padding: 10px; border: 1px solid #fee2e2; border-radius: 8px; background: #fef2f2; color: #991b1b; font-size: 14px;">Failed to load prompt #${promptId}</div>`;
        });
})();
