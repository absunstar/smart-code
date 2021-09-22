module.exports = function init(site) {

  const $innovalz_store_setting = site.connectCollection('innovalz_store_setting');
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
  site.post('/api/innovalz_store_setting/add', (req, res) => {
    let response = {
      done: false,
    };
    let innovalzSetting = req.body;
    innovalzSetting.$req = req;
    innovalzSetting.$res = res;
    $innovalz_store_setting.add(innovalzSetting, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
 
  });

  site.get("/api/innovalz_store_setting", (req, res) => {
  
    let response = {}
    $innovalz_store_setting.findMany(
      {
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true;
          response.list = docs;
          response.count = count;
        } else {
          response.error = err.message;
        }
        res.json(response);
      },
    );


  })

 
}