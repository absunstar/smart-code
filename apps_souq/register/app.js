module.exports = function init(site) {
  const $mailer = site.connectCollection('mailer');

  site.mobile_list = [];
  site.email_list = [];

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
      (err, result) => { }
    );
  });

  site.post('/api/mailer/add', (req, res) => {
    let response = {
      done: false,
    };

    let mailer_doc = req.body;
    mailer_doc.$req = req;
    mailer_doc.$res = res;

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

                if (result.doc.type == 'mobile') {
                  let mailer_mobile = site.mobile_list.find((_m) => _m.mobile == result.doc.mobile);
                  if (mailer_mobile) {
                    let mailer_date = new Date(mailer_mobile.date);
                    mailer_date.setMinutes(mailer_date.getMinutes() + 1);
                    if (new Date() > mailer_date) {
                      mailer_mobile.date = new Date();
                      site.sendMobileMessage({
                        to: result.doc.country.country_code + result.doc.mobile,
                        message: `code : ${result.doc.code}`,
                      });
                    } else {
                      response.error = 'have to wait mobile';
                      res.json(response);
                      return
                    }
                  } else {
                    site.mobile_list.push({
                      mobile: result.doc.mobile,
                      date: new Date(),
                    })
                    site.sendMobileMessage({
                      to: result.doc.country.country_code + result.doc.mobile,
                      message: `code : ${result.doc.code}`,
                    });
                  }
                } else if (result.doc.type == 'email') {
                  site.sendMailMessage({
                    to: result.doc.email,
                    subject: 'Smart Code .. Forget Password',
                    message: `code : ${result.doc.code}`,
                  });
                }
                response.done = true;
                response.doc = result.doc;
                delete response.doc.code;

              } else {
                response.error = err.message;
              }
              res.json(response);
            }
          );
        } else {

          let where = {};
          if (mailer_doc.type == 'email') {
            where.email = mailer_doc.email
          } else if (mailer_doc.type == 'mobile') {
            where.mobile = mailer_doc.mobile
          }
          site.security.getUser(where, (err, user_doc) => {
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
                    if (result.type == 'mobile') {
                      site.mobile_list.push({
                        mobile: result.mobile,
                        date: new Date(),
                      })
                      site.sendMobileMessage({
                        to: result.country.country_code + result.mobile,
                        message: `code : ${result.code}`,
                      });
                    } else if (result.type == 'email') {
                      site.mobile_list.push({
                        mobile: result.mobile,
                        date: new Date(),
                      })
                      site.sendMailMessage({
                        to: result.email,
                        subject: 'Smart Code .. Forget Password',
                        message: `code : ${result.code}`,
                      });
                    }
                    delete response.code;


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

  site.post('/api/register/validate_mobile', (req, res) => {
    let response = {
      done: false,
    };
    let body = req.body;

    let regex = /^\d*(\.\d+)?$/;

    if (body.country && body.country.length_mobile && body.mobile.match(regex)) {
      if (body.mobile.toString().length == body.country.length_mobile) {
        response.done = true;
      } else {
        response.error = 'Please enter a valid mobile number';
      }
    } else {
      response.error = 'Please enter a valid mobile number';
    }
    res.json(response);

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

                if (result.doc.type == 'email') {
                  site.sendEmail({
                    from: 'absunstar@gmail.com',
                    to: result.doc.email,
                    subject: 'Smart Code .. Forget Password',
                    message: `code : ${result.doc.code}`,
                  });
                } else if (result.doc.type == 'mobile') {
                  let mailer_mobile = site.mobile_list.find((_m) => _m.mobile == result.doc.mobile);
                  if (mailer_mobile) {
                    let mailer_date = new Date(mailer_mobile.date);
                    mailer_date.setMinutes(mailer_date.getMinutes() + 1);
                    if (new Date() > mailer_date) {
                      mailer_mobile.date = new Date();
                      site.sendMobileMessage({
                        to: result.doc.country.country_code + result.doc.mobile,
                        message: `code : ${result.doc.code}`,
                      });
                    } else {
                      response.error = 'have to wait mobile';
                      res.json(response);
                      return
                    }
                  } else {
                    site.mobile_list.push({
                      mobile: result.mobile,
                      date: new Date(),
                    })
                    site.sendMobileMessage({
                      to: result.doc.country.country_code + result.doc.mobile,
                      message: `code : ${result.doc.code}`,
                    });
                  }

                }
                response.done = true;
                response.doc = result.doc;
                delete response.doc.code;
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
