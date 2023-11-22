module.exports = function init(site) {
  let yts = site.connectApp({ name: 'generator_yts' });
  let app = site.connectApp({ name: 'generator', title: 'Articles Generator', dir: __dirname, images: true });
  let sites = site.connectApp({ name: 'generator_sites', allowMemory: true });
  let youtubeChannelList = site.connectApp({ name: 'youtubeChannelList', allowMemory: true });
};
