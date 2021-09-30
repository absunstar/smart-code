module.exports = function init(site) {

  const $contactUs = site.connectCollection('contactUs');

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
  site.post('/api/contactUs/add', (req, res) => {
    let response = {
      done: false,
    };
    let contactUsDoc = req.body;
    contactUsDoc.$req = req;
    contactUsDoc.$res = res;
    $contactUs.add(contactUsDoc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });



 
}