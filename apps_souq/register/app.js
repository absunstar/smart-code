module.exports = function init(site) {
  const $mailer = site.connectCollection('mailer');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'register',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.get({
    name: 'mailer',
    path: __dirname + '/site_files/html/mailer.html',
    parser: 'html',
    compress: true,
  });

  site.get({
    name: 'css',
    path: __dirname + '/site_files/css/',
  });

  site.on('[mailer][delete]', function (id) {
    $mailer.delete(
      {
        id: id,
      },
      (err, result) => {}
    );
  });

  site.post('/api/mailer/add', (req, res) => {
    let response = {
      done: false,
    };

    let mailer_doc = req.body;
    mailer_doc.$req = req;
    mailer_doc.$res = res;
    if (mailer_doc.type == 'mobile' && mailer_doc.country) {
      if (mailer_doc.country.code == 'ksa') {
        let ksa_keys = '050053054055056057058059';
        let ksa_key = mailer_doc.mobile.slice(0, 3);

        if (mailer_doc.mobile.length != 12 || !ksa_keys.contains(ksa_key)) {
          if (req.session.lang == 'ar') {
            response.error = `يرجى إدخال رقم صحيح في دولة ${mailer_doc.country.name_ar}`;
          } else {
            response.error = `Please enter a valid number in the State of ${mailer_doc.country.name_ar}`;
          }
          res.json(response);
          return;
        }
      }
    }
    $mailer.findOne(
      {
        where: {
          $or: [
            {
              $and: [{ type: 'email', email: mailer_doc.email }],
            },
            {
              $and: [{ type: 'mobile', mobile: mailer_doc.mobile }],
            },
          ],
        },
      },
      (err, doc) => {
        if (!err && doc) {
          doc.code = doc.id + Math.floor(Math.random() * 10000) + 90000;

          $mailer.edit(
            {
              where: {
                id: doc.id,
              },
              set: doc,
              $req: req,
              $res: res,
            },
            (err, result) => {
              if (!err) {
                response.done = true;
                response.doc = result.doc;
                delete response.doc.code;

                if (result.doc.type == 'email') {
                  site.sendEmail({
                    from: 'absunstar@gmail.com',
                    to: result.doc.email,
                    subject: 'Smart Code .. Forget Password',
                    message: `Your Code : ${result.doc.code}`,
                  });
                }
              } else {
                response.error = err.message;
              }
              res.json(response);
            }
          );
        } else {
          site.security.getUser({ email: mailer_doc.email, mobile: mailer_doc.mobile }, (err, user_doc, count) => {
            if (!err) {
              if (user_doc) {
                if (mailer_doc.type == 'email') {
                  response.error = 'Email Exists';
                } else if (mailer_doc.type == 'mobile') {
                  response.error = 'Mobile Exists';
                }
                res.json(response);
                return;
              } else {
                mailer_doc.code = Math.floor(Math.random() * 10000) + 90000;
                $mailer.add(mailer_doc, (err, result) => {
                  if (!err) {
                    response.done = true;
                    response.doc = result;
                    delete response.doc.code;

                    if (mailer_doc.type == 'email') {
                      site.sendEmail({
                        from: 'absunstar@gmail.com',
                        to: result.email,
                        subject: 'Smart Code .. Forget Password',
                        message: `Your Code : ${result.code}`,
                      });
                    }
                  } else {
                    response.error = err.message;
                  }
                  res.json(response);
                });
              }
            }
          });
        }
      }
    );
  });

  site.post('/api/mailer/resend', (req, res) => {
    let response = {
      done: false,
    };

    let id = req.body.id;

    $mailer.findOne(
      {
        where: {
          id: id,
        },
      },
      (err, doc) => {
        if (!err && doc) {
          doc.code = doc.id + Math.floor(Math.random() * 10000) + 90000;

          $mailer.edit(
            {
              where: {
                id: doc.id,
              },
              set: doc,
              $req: req,
              $res: res,
            },
            (err, result) => {
              if (!err) {
                response.done = true;
                response.doc = result.doc;
                delete response.doc.code;
                if (result.doc.type == 'email') {
                  site.sendEmail({
                    from: 'absunstar@gmail.com',
                    to: result.doc.email,
                    subject: 'Smart Code .. Forget Password',
                    message: `Your Code : ${result.doc.code}`,
                  });
                }
              } else {
                response.error = err.message;
              }
              res.json(response);
            }
          );
        }
      }
    );
  });

  site.post('/api/mailer/check_code', (req, res) => {
    let response = {
      done: false,
    };

    let id = req.body.id;
    let code = req.body.code;
    $mailer.findOne(
      {
        where: {
          id: id,
          code: site.toNumber(code),
        },
      },
      (err, doc) => {
        if (!err) {
          if (doc) {
            response.done = true;
            response.doc = doc;
            delete response.doc.code;
          } else {
            response.error = 'Incorrect code entered';
            return;
          }
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/register', (req, res) => {
    let response = {};

    if (req.body.$encript) {
      if (req.body.$encript === '64') {
        req.body.email = site.fromBase64(req.body.email);
        req.body.password = site.fromBase64(req.body.password);
      } else if (req.body.$encript === '123') {
        req.body.email = site.from123(req.body.email);
        req.body.password = site.from123(req.body.password);
      }
    }

    let user = {
      email: req.body.email,
      password: req.body.password,
      mobile: req.body.mobile,
      feedback_list: [],
      followers_list: [],
      follow_category_list: [],
      ip: req.ip,
      permissions: ['user'],
      active: true,
      profile: {
        files: [],
        name: req.body.first_name,
        last_name: req.body.last_name,
        image_url: req.body.image_url,
        other_addresses_list: [],
      },
      $req: req,
      $res: res,
    };

    if (site.defaultSettingDoc && site.defaultSettingDoc.stores_settings) {
      if (site.defaultSettingDoc.stores_settings.maximum_stores) {
        user.maximum_stores = site.defaultSettingDoc.stores_settings.maximum_stores;
      } else {
        user.maximum_stores = 2;
      }
    }

    site.security.register(user, function (err, doc) {
      if (!err) {
        let store_name = req.session.lang == 'ar' ? 'متجر' : 'Store';
        response.user = doc;
        response.done = true;
        let store = {
          image_url: '/images/stores.png',
          feedback_list: [],
          store_rating: 0,
          number_views: 0,
          number_likes: 0,
          number_comments: 0,
          number_favorites: 0,
          number_reports: 0,
          priority_level: 0,
          active: true,
          user: {
            id: doc.id,
            mobile: doc.mobile,
            profile: doc.profile,
            email: doc.email,
          },
          store_status: {
            id: 1,
            en: 'Active',
            ar: 'نشط',
          },
          name: store_name + doc.profile.name,
        };

        store.$add = true;
        site.store_list.push(store);

        site.call('[mailer][delete]', req.body.mailer_id);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/mailer/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};
 

    $mailer.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: req.body.limit,
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
      }
    );
  });
};
