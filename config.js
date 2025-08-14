module.exports = {
  allowedHost: 'localhost:3000',
  PORT: 3000,

  fileHost: {
    name: 'femboy.beauty',
    baseUrl: 'https://femboy.beauty',
    buildUrl: id => `https://femboy.beauty/${id}`,
    extractionPatterns: [
      'femboy\\.beauty\\/([a-zA-Z0-9\\-_]+(?:\\.[a-zA-Z0-9]+)?)'
    ]
  },

  videoTypes: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
  imageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],

  botUserAgents: [
    'Discordbot',
    'Twitterbot',
    'facebookexternalhit',
    'LinkedInBot'
  ],

  siteName: 'GIRLGLOCK',
  siteUrl: 'https://i.girlglock.com',
  siteDescription: 'i.girlglock.com',
  serviceName: 'girlglock embed service :3c',
};