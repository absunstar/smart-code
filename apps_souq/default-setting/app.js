module.exports = function init(site) {
  const $default_setting = site.connectCollection('default_setting');
  site.defaultSettingDoc = {};
  $default_setting.findOne({}, (err, doc) => {
    if (!err && doc) {
      site.defaultSettingDoc = doc;
    }
  });
  site.get({
    name: 'default_setting',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: false,
  });

  site.get({
    name: '/images',
    path: __dirname + '/site_files/images',
  });

  site.post({
    name: '/api/publishing_system/all',
    path: __dirname + '/site_files/json/publishing_system.json',
  });

  site.post({
    name: '/api/user_design/all',
    path: __dirname + '/site_files/json/user_design.json',
  });

  site.post({
    name: '/api/duration_expiry/all',
    path: __dirname + '/site_files/json/duration_expiry.json',
  });

  site.post({
    name: '/api/closing_system/all',
    path: __dirname + '/site_files/json/closing_system.json',
  });

  site.post({
    name: '/api/ads_status/all',
    path: __dirname + '/site_files/json/ads_status.json',
  });

  // site.post({
  //   name: "/api/discount_method/all",
  //   path: __dirname + "/site_files/json/discount_method.json"
  // })

  site.post('/api/default_setting/get', (req, res) => {
    let response = {
      done: false,
    };

    // if (!req.session.user) {
    //   response.error = 'Please Login First'
    //   res.json(response)
    //   return
    // };

    let where = req.data.where || {};

    if ( Object.keys(site.defaultSettingDoc).length === 0) {
      response.done = true;
      response.doc = site.defaultSettingDoc;
      res.json(response);
    } else {
      let obj = {};
      $default_setting.add(obj, (err, doc) => {
        if (!err && doc) {
          response.done = true;
          response.doc = doc;
          site.defaultSettingDoc = response.doc;
          res.json(response);
        } else {
          response.error = err.message;
          res.json(response);
        }
      });
    }

   
  });

  site.getDefaultSetting = function (callback) {
    callback = callback || function () {};
    if (site.defaultSettingDoc) {
      callback(site.defaultSettingDoc);
      return site.defaultSettingDoc;
    }

    // let where = {};
    // $default_setting.findOne(
    //   {
    //     where: where,
    //   },
    //   (err, doc) => {
    //     if (!err && doc) {
    //       site.defaultSettingDoc = doc;
    //       callback(site.defaultSettingDoc);
    //     } else {
    //       callback(null);
    //     }
    //   }
    // );
  };

  //   site.getDefaultSetting = function (callback) {
  //    $default_setting.get({
  //    }, (err, doc) => {
  //      if (!err && doc) {
  //        return callback(err, doc)
  //      }
  //    })
  //  }

  site.post('/api/default_setting/save', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let data = req.data;

    $default_setting.update(data, (err, result) => {
      if (!err) {
        response.done = true;
        site.defaultSettingDoc = data;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });
};
