function shortenUrl() {
    const originalUrl = document.getElementById('originalUrl').value;
    if (!originalUrl) return alert('Please enter a URL');

    const shortCode = Math.random().toString(36).substring(2, 8);
    const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
    const shortUrl = `${baseUrl}${shortCode}`;

    document.getElementById('shortUrl').innerHTML = `Short URL: <a href="${originalUrl}" target="_blank">${shortUrl}</a>`;
}