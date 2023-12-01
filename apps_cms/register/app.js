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

  site.ipList = [];

  site.post('/api/mailer/add', (req, res) => {
    let response = {
      done: false,
    };

    // if(site.ipList.find(info => info.ip == req.ip)){
    //   response.error = 'Can NOt Reqister More One From Same IP'
    //   res.json(response)
    //   return
    // }

    site.ipList.push({
      ip: req.ip,
      time: new Date().getTime(),
    });

    let mailerDoc = req.body;
    mailerDoc.$req = req;
    mailerDoc.$res = res;

    $mailer.findOne(
      {
        where: {
          $or: [
            {
              $and: [{ type: 'email', email: mailerDoc.email }],
            },
            {
              $and: [{ type: 'mobile', mobile: mailerDoc.mobile }],
            },
          ],
        },
      },
      (err, doc) => {
        if (!err && doc) {
          if (mailerDoc.mobile) {
            let date = new Date(doc.date);
            date.setMinutes(date.getMinutes() + 1);
            if (new Date() > date) {
              doc.code = doc.id + Math.floor(Math.random() * 10000) + 90000;
              doc.date = new Date();
            } else {
              response.error = 'have to wait mobile 5 Minute';
              res.json(response);
              return;
            }
          } else if (mailerDoc.email) {
            let date = new Date(doc.date);
            date.setMinutes(date.getMinutes() + 1);
            if (new Date() > date) {
              doc.code = doc.id + Math.floor(Math.random() * 10000) + 90000;
              doc.date = new Date();
            } else {
              response.error = 'have to wait email';
              res.json(response);
              return;
            }
          }
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
                let setting = site.getSiteSetting(req.host);
                if (result.doc.type == 'mobile' && setting.enableSendingMessagesMobile) {
                  site.sendMobileTwilioMessage({
                    to: result.doc.country.countryCode + result.doc.mobile,
                    message: `code : ${result.doc.code}`,
                  });
                  response.doneSendMobile = true;
                } else if (result.doc.type == 'email' && setting.enableSendingMessagesEmail) {
                  site.sendMailMessage({
                    to: result.doc.email,
                    subject: `Rejester Code`,
                    message: `code : ${result.doc.code}`,
                  });
                  response.doneSendEmail = true;
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
          if (mailerDoc.type == 'email') {
            where.email = mailerDoc.email;
          } else if (mailerDoc.type == 'mobile') {
            where.mobile = mailerDoc.mobile;
          }
          site.security.getUser(where, (err, userDoc) => {
            if (!err) {
              if (userDoc) {
                if (mailerDoc.type == 'email') {
                  response.error = 'Email Exists';
                } else if (mailerDoc.type == 'mobile') {
                  response.error = 'Mobile Exists';
                }
                res.json(response);
                return;
              } else {
                mailerDoc.code = Math.floor(Math.random() * 10000) + 90000;
                mailerDoc.date = new Date();
                $mailer.add(mailerDoc, (err, result) => {
                  if (!err) {
                    let setting = site.getSiteSetting(req.host);
                    response.done = true;
                    response.doc = result;
                    if (result.type == 'mobile' && setting.enableSendingMessagesMobile) {
                      site.sendMobileTwilioMessage({
                        to: result.country.countryCode + result.mobile,
                        message: `code : ${result.code}`,
                      });
                      response.doneSendMobile = true;
                    } else if (result.type == 'email' && setting.enableSendingMessagesEmail) {
                      site.sendMailMessage({
                        to: result.email,
                        subject: `Rejester Code`,
                        message: `code : ${result.code}`,
                      });
                      response.doneSendEmail = true;
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

  site.post('/api/register/validateMobile', (req, res) => {
    let response = {
      done: false,
    };
    let body = req.body;

    let regex = /^\d*(\.\d+)?$/;

    if (body.country && body.country.lengthMobile && body.mobile.match(regex)) {
      if (body.mobile.toString().length == body.country.lengthMobile) {
        response.done = true;
      } else {
        response.error = `Please enter a valid mobile number length ${body.country.lengthMobile}`;
      }
    } else {
      response.error = `Please enter a valid mobile number length ${body.country.lengthMobile}`;
    }
    res.json(response);
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
            res.json(response);
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
    let response = { done: false };

    if (req.body.$encript) {
      if (req.body.$encript === '64') {
        req.body.email = site.fromBase64(req.body.email);
        req.body.password = site.fromBase64(req.body.password);
      } else if (req.body.$encript === '123') {
        req.body.email = site.from123(req.body.email);
        req.body.password = site.from123(req.body.password);
      }
    }

    let regex = /^\d*(\.\d+)?$/;

    if (req.body.lengthMobile && req.body.mobile.match(regex)) {
      if (req.body.mobile.toString().length == req.body.lengthMobile) {
        response.done = true;
      } else {
        response.error = `Please enter a valid mobile number length ${req.body.lengthMobile}`;

        res.json(response);
        return;
      }
    } else {
      response.error = `Please enter a valid mobile number length ${req.body.lengthMobile || 0}`;
      res.json(response);
      return;
    }

    let user = {
      email: req.body.email,
      password: req.body.password,
      mobile: req.body.mobile,
      followersList: [],
      followCategoryList: [],
      ip: req.ip,
      countryCode: req.body.countryCode,
      permissions: ['user'],
      active: true,
      created_date: new Date(),
      profile: {
        files: [],
        name: req.body.firstName,
        lastName: req.body.lastName,
        image: req.body.image,
        otherAddressesList: [],
      },
      $req: req,
      $res: res,
    };

    site.security.register(user, function (err, doc) {
      if (!err) {
        response.user = doc;
        response.done = true;

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
