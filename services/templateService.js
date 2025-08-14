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

function generateHTML(mediaData) {
    const {
        mediaId,
        mediaUrl,
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

    const mediaTag = isVideo
        ? `<video class="main-media" data-type="video" controls autoplay name="media"><source src="${mediaUrl}" type="video/${mediaType}"></video>`
        : `<img class="main-media" data-type="image" src="${mediaUrl}" alt="${escapedTitle}" loading="lazy">`;


    return renderTemplate('media-viewer', {
        title: escapedTitle,
        description: escapedDescription,
        mediaUrl,
        mediaType,
        mediaTag,
        fileSize,
        domain: config.allowedHost,
        mediaId,
        views: getViews(mediaId)
    });
}

module.exports = { generateHTML, renderTemplate, loadTemplate };