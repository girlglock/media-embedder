const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, '..', 'cache.json');

function loadCache() {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        }
    } catch (e) {
        console.error('[cache load]', e.message);
    }
    return {};
}

function saveCache(cache) {
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    } catch (e) {
        console.error('[cache save]', e.message);
    }
}

function getViews(mediaId) {
    const cache = loadCache();
    return cache[mediaId]?.views || 0;
}

function incViews(mediaId) {
    const cache = loadCache();
    cache[mediaId] = { ...(cache[mediaId] || {}), views: (cache[mediaId]?.views || 0) + 1 };
    saveCache(cache);
}

module.exports = { getViews, incViews };