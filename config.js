module.exports = {
  allowedHost: 'localhost:3000',
  PORT: 3000,

  fileHost: {
    name: 'femboy.beauty',
    baseUrl: 'https://femboy.beauty',
    buildUrl: id => `https://femboy.beauty/${id}`,
    thumbnailUrl: id => `https://femboy.beauty/t/${id}`,
    extractionPatterns: [
      'femboy\\.beauty\\/([a-zA-Z0-9\\-_]+(?:\\.[a-zA-Z0-9]+)?)'
    ]
  },

  videoTypes: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
  imageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  thumbVidType: 'webp',

  botUserAgents: [
    'Discordbot',
    'Twitterbot',
    'facebookexternalhit',
    'LinkedInBot'
  ],

  siteName: 'GIRLGLOCK',
  siteUrl: 'https://girlglock.com',
  siteDescription: 'girlglock.com',
  serviceName: 'girlglock embed service :3c',

  themeColor: '#1bb76e',
  backgroundImage: 'https://files.catbox.moe/likszt.png',
  cssFramework: 'https://cdn.jsdelivr.net/gh/ekmas/cs16.css@main/css/cs16.min.css'

};
