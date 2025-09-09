const fs = require('fs');
const path = require('path');
const config = require('../config');
const { incViews, getViews } = require('./cacheService');

const templateCache = new Map();

function loadTemplate(templateName) {
    if (templateCache.has(templateName)) {
        return templateCache.get(templateName);
    }

    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);

    try {
        const template = fs.readFileSync(templatePath, 'utf8');
        templateCache.set(templateName, template);
        return template;
    } catch (error) {
        console.error(`[error] loading template ${templateName}:`, process.env.NODE_ENV === 'development' ? error : error.message);
        return null;
    }
}

function renderTemplate(templateName, variables = {}) {
    const template = loadTemplate(templateName);
    if (!template) {
        return null;
    }

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] !== undefined ? variables[key] : match;
    });
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatFileSize(bytes) {
    if (!bytes) return 'unknown';
    return (bytes / 1024 / 1024).toFixed(2);
}

function getDailyEmote() {
    const emotes = [
        ["otag", "https://cdn.7tv.app/emote/01GYT25QT8000DVPJKHH13026T/1x.avif"],
        ["waga", "https://cdn.7tv.app/emote/01JA78H1M8000E34SZ69AYAM77/1x.avif"],
        ["boink", "https://cdn.7tv.app/emote/01JN15PHS1S04M2RJCCG82928S/1x.avif"],
        ["gasp", "https://cdn.7tv.app/emote/01JA93SPZR000FH91HYAZ34S4E/1x.avif"],
        ["gulp", "https://cdn.7tv.app/emote/01GQF7KXJ8000ERT2YB38Q65VR/1x.avif"],
        ["awoo", "https://cdn.7tv.app/emote/01HSPH80X00005YGAS2SZWDJ88/1x.avif"],
        ["moo", "https://cdn.7tv.app/emote/01H3TQQ1A80002029XS0J4PNFA/1x.avif"],
        ["doid", "https://cdn.7tv.app/emote/01GTR28VJR000EFDRZ1W6FT41M/1x.avif"],
        ["wuh", "https://cdn.7tv.app/emote/01GV56F8QR0006FW5TVZVMFVWE/1x.avif"],
        ["buh", "https://cdn.7tv.app/emote/01GQFT1WF80002Q9KS8SKQMHHY/1x.avif"],
        ["tuh", "https://cdn.7tv.app/emote/01GN2TX9P0000B8P35DK3HTA35/1x.avif"],
    ];
    const dateKey = new Date().toISOString().split("T")[0];
    let hash = 0;
    for (let i = 0; i < dateKey.length; i++) hash = (hash << 5) - hash + dateKey.charCodeAt(i);
    return emotes[Math.abs(hash) % emotes.length];
}

const [dailyEmote, dailyEmoteUrl] = getDailyEmote();

function generateHTML(mediaData) {
    const {
        mediaId,
        mediaUrl,
        embedUrl,
        mediaExt,
        mediaType,
        mediaSize,
        isVideo,
        title,
        description
    } = mediaData;

    incViews(mediaId);

    const escapedTitle = escapeHtml(title);
    const escapedDescription = escapeHtml(description);
    const fileSize = formatFileSize(mediaSize);

    const mediaTag = isVideo && embedUrl === mediaUrl
        ? `<video class="main-media" data-type="video" controls autoplay name="media"><source src="${mediaUrl}" type="${mediaType}/${mediaExt}"></video>`
        : `<img class="main-media" data-type="image" src="${embedUrl !== mediaUrl ? embedUrl : mediaUrl}" alt="${escapedTitle}" loading="lazy">`;


    return renderTemplate('media-viewer', {
        title: escapedTitle,
        description: escapedDescription,
        mediaUrl,
        mediaThumbUrl: config.fileHost.thumbnailUrl(mediaId),
        mediaType,
        mediaExt,
        mediaTag,
        embedUrl,
        fileSize,
        domain: config.allowedHost,
        mediaId,
        views: getViews(mediaId),
        dailyEmote: dailyEmote,
        dailyEmoteUrl: dailyEmoteUrl
    });
}

module.exports = { generateHTML, renderTemplate, loadTemplate };