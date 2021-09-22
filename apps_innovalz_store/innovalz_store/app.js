module.exports = function init(site) {

  const $innovalz_store = site.connectCollection('innovalz_store');
  const innovalz_store_sites = require('./site_files/json/innovalz_store')

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'innovalz_store',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post("/api/innovalz_store/getApps", (req, res) => {
    let response = {
      done: false
    }
    response.done = true
    response.list = innovalz_store_sites
    response.count = innovalz_store_sites.length
    res.json(response)
  })


}