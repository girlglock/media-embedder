const express = require('express');
const axios = require('axios');
const { generateHTML } = require('./services/templateService');
const { incViews } = require('./services/cacheService');
const app = express();
const https = require('https');
const http = require('http');

const config = require('./config');

app.use((req, res, next) => {
  const host = req.get('Host');
  if (host !== config.allowedHost) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
});

function sanitizeInput(input) {
  return input.replace(/[^a-zA-Z0-9\.\-_]/g, '');
}

function extractMediaId(url) {
  const sanitized = sanitizeInput(url);

  const patterns = [
    /([a-zA-Z0-9\-_]+\.[a-zA-Z0-9]+)$/,
    /([a-zA-Z0-9\-_]+)$/
  ];

  for (const pattern of patterns) {
    const match = sanitized.match(pattern);
    if (match) {
      return match[1].split('?')[0];
    }
  }
  return null;
}

async function getMediaInfo(mediaId) {
  const url = `${config.fileHost.baseUrl}/${mediaId}`;
  const thumbnailUrl = config.fileHost.thumbnailUrl(mediaId);
  let extension = mediaId.includes('.') ? mediaId.split('.').pop().toLowerCase() : null;

  try {
    const head = await axios.head(url);
    const contentType = head.headers['content-type'];
    const contentLength = parseInt(head.headers['content-length']) || 0;

    if (!extension && contentType) {
      extension = contentType.split('/').pop();
    }

    const isVideo = config.videoTypes.includes(extension);
    const isImage = config.imageTypes.includes(extension);
    if (!isVideo && !isImage) return null;

    return {
      link: url,
      size: contentLength,
      type: isVideo ? 'video' : "image",
      extension: extension,
      thumbnail: thumbnailUrl,
      isVideo
    };
  } catch {
    return null;
  }
}

function isDiscordUserAgent(userAgent) {
  const botAgents = config.botUserAgents || [
    'Discordbot', 'Twitterbot', 'facebookexternalhit', 'LinkedInBot'
  ];
  return userAgent && botAgents.some(agent => userAgent.includes(agent));
}

app.get('/:mediaId', async (req, res) => {
  const mediaId = sanitizeInput(req.params.mediaId);
  const userAgent = req.get('User-Agent');

  if (!mediaId) {
    return res.status(400).send('media id is wequiwed');
  }

  const cleanId = extractMediaId(mediaId);
  if (!cleanId) {
    return res.status(400).send('invalid ID fowmat');
  }

  try {
    const mediaInfo = await getMediaInfo(cleanId);

    //check for ?t=1 to embed thumbnail instead of full video
    const embedThumb = req.query.t === '1';

    if (!mediaInfo) {
      return res.status(404).send('media not found ow unsuppowted file type');
    }

    const isBot = isDiscordUserAgent(userAgent);

    if (isBot && !mediaInfo.isVideo) {
      const fileUrl = new URL(mediaInfo.link);
      const client = fileUrl.protocol === 'https:' ? https : http;

      res.setHeader('Content-Type', `image/${mediaInfo.type}`);
      res.setHeader('Content-Length', mediaInfo.size);

      client.get(fileUrl, (fileStream) => {
        fileStream.pipe(res);
        incViews(mediaId);
      }).on('error', (err) => {
        console.error('Error streaming media:', err);
        res.status(500).send('failed to load media');
      });

      return;
    }

    const html = generateHTML({
      mediaId: cleanId,
      mediaUrl: mediaInfo.link,
      embedUrl: embedThumb ? mediaInfo.thumbnail : mediaInfo.link,
      mediaExt: embedThumb ? 'webp' : mediaInfo.extension,
      mediaType: embedThumb ? 'image' : mediaInfo.type,
      mediaSize: mediaInfo.size,
      isVideo: mediaInfo.isVideo,
      title: cleanId,
      description: config.siteDescription || '<a href="https://girlglock.com" target="_blank" rel="noopener noreferrer">girlglock.com</a>'
    });

    res.set({
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'noindex',
      'X-Content-Type-Options': 'nosniff'
    });

    res.send(html);

  } catch (error) {
    console.error('[getMediaInfo crash]', error);
    res.status(500).send('intewnal sewvew ewwow :c');
  }
});

app.get('/', (req, res) => {
  res.json({
    status: 'okak otag',
    service: config.serviceName || 'girlglock embed service :3c',
    usage: `https://${config.allowedHost}/{media-id}.{file-type}`,
    supported: config.allowedFileTypes.join(', ')
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: 'something went wwong :c' });
});

app.listen(config.PORT, () => {
  console.log(`media-embedder on ${config.PORT}`);
});