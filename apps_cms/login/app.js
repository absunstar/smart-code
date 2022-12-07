module.exports = function init(site) {
  const $login = site.connectCollection("login")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.get({
    name: 'css',
    path: __dirname + '/site_files/css/'
  })


  site.get({
    name: "login",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.get({
    name: 'forget_password',
    path: __dirname + '/site_files/html/forget_password.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/forget_password/send_code', (req, res) => {
    let response = {
      done: false,
    };
    let mobile_or_email = req.body.mobile_or_email;

    let where = {};
    if (mobile_or_email.contains('@') || mobile_or_email.contains('.')) {
      where.email = mobile_or_email;
    } else {
      where.mobile = mobile_or_email;
    }

    site.security.getUser(where, (err, user) => {
      if (!err) {
        if (user) {

          if (user.forget_password) {
            let date = new Date(user.forget_password.date);
            date.setMinutes(date.getMinutes() + 1);
            if (new Date() > date) {
              user.forget_password.code = user.id + Math.floor(Math.random() * 10000) + 90000;
              user.forget_password.date = new Date();

            } else {
              response.error = 'have to wait mobile';
              res.json(response);
              return
            }

          } else {
            user.forget_password = {
              code: user.id + Math.floor(Math.random() * 10000) + 90000,
              date: new Date(),
            }
          }
          site.security.updateUser(user, (err, user_doc) => {

            if (where.mobile) {
              site.sendMobileMessage({
                to: user_doc.doc.country_code + user_doc.doc.mobile,
                message: `code : ${user_doc.doc.forget_password.code}`,
              });
              response.type = 'mobile'
              response.done_send_mobile = true;
            } else if (where.email) {
              site.sendMailMessage({
                to: user_doc.doc.country_code + user_doc.doc.mobile,
                subject: `Forget Password COde`,
                message: `code : ${user_doc.doc.forget_password.code}`,
              });
              response.type = 'email'
              response.done_send_email = true;
            }

            response.mobile_or_email = mobile_or_email;
            response.done = true;
            res.json(response);
          });

        } else {
          response.error = 'Wrong mail or mobile';

          res.json(response);
          return;
        }
      } else {
        response.error = err.message;
        res.json(response);
      }

    })

  });

  site.post('/api/forget_password/check_code', (req, res) => {
    let response = {
      done: false,
    };

    let mobile_or_email = req.body.mobile_or_email;
    let code = req.body.code;
    let where = {};

    if (mobile_or_email.contains('@') || mobile_or_email.contains('.')) {
      where.email = mobile_or_email;
    } else {
      where.mobile = mobile_or_email;
    }

    site.security.getUser(where, (err, user) => {
      if (!err) {
        if (user) {
          if (user.forget_password && user.forget_password.code == site.toNumber(code)) {
            response.done = true;
            response.mobile_or_email = mobile_or_email;
            res.json(response);

          } else {
            response.error = 'Incorrect code entered';
            res.json(response);
            return;
          }
        } else {
          response.error = 'Incorrect code entered';
          res.json(response);
          return;
        }
      } else {
        response.error = err.message;
        res.json(response);
      }

    });
  });

  site.post('/api/forget_password/new_password', (req, res) => {
    let response = {
      done: false,
    };


    if (req.body.$encript === '123') {
      req.body.mobile_or_email = site.from123(req.body.mobile_or_email);
      req.body.new_password = site.from123(req.body.new_password);
      req.body.code = site.from123(req.body.code);

    }
    let mobile_or_email = req.body.mobile_or_email;
    let code = req.body.code;
    let where = {};

    if (mobile_or_email.contains('@') || mobile_or_email.contains('.')) {
      where.email = mobile_or_email;
    } else {
      where.mobile = mobile_or_email;
    }

    site.security.getUser(where, (err, user) => {
      if (!err) {
        if (user) {
          if (user.forget_password && user.forget_password.code == site.toNumber(code)) {
            user.password = req.body.new_password

            delete user.forget_password;
            site.security.updateUser(user, (err, user_doc) => {
              if (!err) {
                response.done = true;
                res.json(response);
              } else {
                response.error = err.message;
                res.json(response);
                return;
              }
            });

          } else {
            response.error = 'Incorrect code entered';
            res.json(response);
            return;
          }
        } else {
          response.error = 'Incorrect code entered';
          res.json(response);
          return;
        }
      } else {
        response.error = err.message;
        res.json(response);
      }

    });
  });
}