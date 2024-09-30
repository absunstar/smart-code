module.exports = function init(site) {
  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'css',
    path: __dirname + '/site_files/css/',
  });

  site.get(
    {
      name: ['/login'],
    },
    (req, res) => {
      
      let setting = site.getSiteSetting(req.host) || {};
      // if (!setting.host) {
      //   res.redirect(site.getMainHost(req.host), 301);
      //   return;
      // }

      setting.description = setting.description || "";
      setting.keyWordsList = setting.keyWordsList || [];
      let data = {
        setting: setting,
        guid: "",
        filter: site.getHostFilter(req.host),
        site_logo: setting.logo?.url || "/images/logo.png",
        site_footer_logo: setting.footerLogo?.url || "/images/logo.png",
        page_image: setting.logo?.url || "/images/logo.png",
        powerdByLogo: setting.powerdByLogo?.url || "/images/logo.png",
        user_image : req.session?.user?.image?.url || "/images/logo.png",
        site_name: setting.siteName,
        page_lang: setting.id,
        page_type: "website",
        page_title:
          setting.siteName +
          " " +
          setting.titleSeparator +
          " " +
          setting.siteSlogan,
        page_description: setting.description.substr(0, 200),
        page_keywords: setting.keyWordsList.join(","),
      };
      if (req.hasFeature("host.com")) {
        data.site_logo = "//" + req.host + data.site_logo;
        data.site_footer_logo = "//" + req.host + data.site_footer_logo;
        data.page_image = "//" + req.host + data.page_image;
        data.user_image = "//" + req.host + data.user_image;
        data.powerdByLogo = "//" + req.host + data.powerdByLogo;
      }
      res.render(__dirname + '/site_files/html/index.html', data, { parser: 'html', compres: true });
    }
  );

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
            let date = site.getDate(user.forget_password.date);
            date.setMinutes(date.getMinutes() + 1);
            if (site.getDate() > date) {
              user.forget_password.code = user.id + Math.floor(Math.random() * 10000) + 90000;
              user.forget_password.date = site.getDate();
            } else {
              response.error = 'have to wait mobile 5 Minute';
              res.json(response);
              return;
            }
          } else {
            user.forget_password = {
              code: user.id + Math.floor(Math.random() * 10000) + 90000,
              date: site.getDate(),
            };
          }
          site.security.updateUser(user, (err, userDoc) => {
            if (where.mobile) {
              site.sendMobileTwilioMessage({
                to: userDoc.doc.countryCode + userDoc.doc.mobile,
                message: `code : ${userDoc.doc.forget_password.code}`,
              });
              response.type = 'mobile';
              response.doneSendMobile = true;
            } else if (where.email) {
              site.sendMailMessage({
                to: userDoc.doc.countryCode + userDoc.doc.mobile,
                subject: `Forget Password COde`,
                message: `code : ${userDoc.doc.forget_password.code}`,
              });
              response.type = 'email';
              response.doneSendEmail = true;
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
    });
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

  site.post('/api/forget_password/newPassword', (req, res) => {
    let response = {
      done: false,
    };

    if (req.body.$encript === '123') {
      req.body.mobile_or_email = site.from123(req.body.mobile_or_email);
      req.body.newPassword = site.from123(req.body.newPassword);
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
            user.password = req.body.newPassword;

            delete user.forget_password;
            site.security.updateUser(user, (err, userDoc) => {
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
};
