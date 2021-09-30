module.exports = function init(site) {

  const $medicalSetting = site.connectCollection('medicalSetting');

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
  site.post('/api/medicalSetting/add', (req, res) => {
    let response = {
      done: false,
    };
    let medicalSettingDoc = req.body;
    medicalSettingDoc.$req = req;
    medicalSettingDoc.$res = res;
    $medicalSetting.add(medicalSettingDoc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });


  

  site.get("/api/medicalSetting", (req, res) => {
  
    let response = {}
    $medicalSetting.findMany(
      {
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true;
          response.doc = docs[0];
          response.count = count;
        } else {
          response.done = false;
          response.doc = {};
          response.count = 0;
        }
        res.json(response);
      },
    );


  })

 
}