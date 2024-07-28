module.exports = function init(site) {
  const $mailer = site.connectCollection("mailer");

  site.get({
    name: "images",
    path: __dirname + "/site_files/images/",
  });

  site.get(
    {
      name: "register",
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
        setting: setting,
        filter: site.getHostFilter(req.host),
        site_logo: setting.logo?.url || "/images/logo.png",
        site_footer_logo: setting.footerLogo?.url || "/images/logo.png",
        page_image: setting.logo?.url || "/images/logo.png",
        powerdByLogo: setting.powerdByLogo?.url || "/images/logo.png",
        user_image: req.session?.user?.image?.url || "/images/logo.png",
        site_name: setting.siteName,
        page_lang: setting.id,
        page_type: "website",
        page_title: setting.siteName + " " + setting.titleSeparator + " " + setting.siteSlogan,
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
      res.render("register/index.html", data, {
        parser: "html css js",
        compress: true,
      });
    }
  );

  site.get(
    {
      name: "mailer",
    },
    (req, res) => {
      res.render("register/mailer.html", data, {
        parser: "html css js",
        compress: true,
      });
    }
  );

  site.get({
    name: "css",
    path: __dirname + "/site_files/css/",
  });

  site.on("[mailer][delete]", function (id) {
    $mailer.delete(
      {
        id: id,
      },
      (err, result) => {}
    );
  });

  site.ipList = [];

  site.post("/api/mailer/add", (req, res) => {
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

    let mailer_doc = req.body;
    // mailer_doc.$req = req;
    // mailer_doc.$res = res;

    $mailer.findOne(
      {
        where: {
          $or: [
            {
              $and: [{ type: "email", email: mailer_doc.email }],
            },
            {
              $and: [{ type: "mobile", mobile: mailer_doc.mobile }],
            },
          ],
        },
      },
      (err, doc) => {
        if (!err && doc) {
          if (mailer_doc.mobile) {
            let date = new Date(doc.date);
            date.setMinutes(date.getMinutes() + 5);
            if (new Date() > date) {
              doc.code = doc.id + Math.floor(Math.random() * 10000) + 90000;
              doc.date = new Date();
            } else {
              response.error = "have to wait mobile 5 Minute";
              res.json(response);
              return;
            }
          } else if (mailer_doc.email) {
            let date = new Date(doc.date);
            date.setMinutes(date.getMinutes() + 1);
            if (new Date() > date) {
              doc.code = doc.id + Math.floor(Math.random() * 10000) + 90000;
              doc.date = new Date();
            } else {
              response.error = "have to wait email";
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
                if (result.doc.type == "mobile") {
                  if (site.setting.enable_sending_messages_mobile) {
                    site.sendMobileTwilioMessage({
                      to: result.doc.country.country_code + result.doc.mobile,
                      message: `code : ${result.doc.code}`,
                    });
                  } else if (site.setting.enable_sending_messages_mobile_taqnyat) {
                    site.sendMobileTaqnyatMessage({
                      to: result.doc.country.country_code + result.doc.mobile,
                      message: `code : ${result.doc.code}`,
                    });
                  }
                  response.done_send_mobile = true;
                } else if (result.doc.type == "email" && site.setting.enable_sending_messages_email) {
                  site.sendMailMessage({
                    to: result.doc.email,
                    subject: `Rejester Code`,
                    message: `code : ${result.doc.code}`,
                  });
                  response.done_send_email = true;
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
          if (mailer_doc.type == "email") {
            where.email = mailer_doc.email;
          } else if (mailer_doc.type == "mobile") {
            where.mobile = mailer_doc.mobile;
          }
          site.security.getUser(where, (err, user_doc) => {
            if (!err) {
              if (user_doc) {
                if (mailer_doc.type == "email") {
                  response.error = "Email Exists";
                } else if (mailer_doc.type == "mobile") {
                  response.error = "Mobile Exists";
                }
                res.json(response);
                return;
              } else {
                mailer_doc.code = Math.floor(Math.random() * 10000) + 90000;
                mailer_doc.date = new Date();
                $mailer.add(mailer_doc, (err, result) => {
                  if (!err) {
                    response.done = true;
                    response.doc = result;
                    if (result.type == "mobile") {
                      if (site.setting.enable_sending_messages_mobile) {
                        site.sendMobileTwilioMessage({
                          to: result.country.country_code + result.mobile,
                          message: `code : ${result.code}`,
                        });
                      } else if (site.setting.enable_sending_messages_mobile_taqnyat) {
                        site.sendMobileTaqnyatMessage({
                          to: result.country.country_code + result.mobile,
                          message: `code : ${result.code}`,
                        });
                      }
                      response.done_send_mobile = true;
                    } else if (result.type == "email" && site.setting.enable_sending_messages_email) {
                      site.sendMailMessage({
                        to: result.email,
                        subject: `Rejester Code`,
                        message: `code : ${result.code}`,
                      });
                      response.done_send_email = true;
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

  site.post("/api/register/validate_mobile", (req, res) => {
    let response = {
      done: false,
    };
    let body = req.body;

    let regex = /^\d*(\.\d+)?$/;

    if (body.country && body.country.length_mobile && body.mobile.match(regex)) {
      if (body.mobile.toString().length == body.country.length_mobile) {
        response.done = true;
      } else {
        response.error = `Please enter a valid mobile number length ${body.country.length_mobile}`;
      }
    } else {
      response.error = `Please enter a valid mobile number length ${body.country.length_mobile}`;
    }
    res.json(response);
  });

  site.post("/api/mailer/check_code", (req, res) => {
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
            response.error = "Incorrect code entered";
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

  site.post("/api/register", (req, res) => {
    let response = { done: false };
    let setting = site.getSiteSetting(req.host);
    if (req.body.user.$encript) {
      if (req.body.user.$encript === "64") {
        req.body.user.email = site.fromBase64(req.body.user.email);
        req.body.user.password = site.fromBase64(req.body.user.password);
      } else if (req.body.user.$encript === "123") {
        req.body.user.email = site.from123(req.body.user.email);
        req.body.user.password = site.from123(req.body.user.password);
      }
    }

    if (req.body.user.type == "student") {
      if (!req.body.user.parentMobile) {
        response.error = "Must Enter Parent Mobile No.";
        res.json(response);
        return;
      }

      if (!req.body.user.educationalLevel || !req.body.user.educationalLevel.id) {
        response.error = "Must Enter Educational Level";
        res.json(response);
        return;
      }

      if (!req.body.user.schoolYear || !req.body.user.schoolYear.id) {
        response.error = "Must Enter School Year";
        res.json(response);
        return;
      }
    }

    if (req.body.user.placeType == "offline") {
      if (!req.body.user.center || !req.body.user.center.id) {
        response.error = "Must Enter Center";
        res.json(response);
        return;
      }
    } else if (req.body.user.placeType == "online") {
      if (!req.body.user.nationalIdImage) {
        response.error = "Must Enter NationalIdImage";
        res.json(response);
        return;
      } else if (!req.body.user.nationalId) {
        response.error = "Must Enter National ID";
        res.json(response);
        return;
      } else if (!req.body.user.latitude || !req.body.user.longitude) {
        response.error = "Must Select Location Information";
        res.json(response);
        return;
      }
    }

    // let regex = /^\d*(\.\d+)?$/;

    // if (req.body.length_mobile && req.body.mobile.match(regex)) {
    //   if (req.body.mobile.toString().length == req.body.length_mobile) {
    //     response.done = true;
    //   } else {
    //     response.error = `Please enter a valid mobile number length ${req.body.length_mobile}`;
    //     res.json(response);
    //     return;
    //   }
    // } else {
    //   response.error = `Please enter a valid mobile number length ${req.body.length_mobile}`;
    //   res.json(response);
    //   return;
    // }

    let user = {
      email: req.body.user.email,
      password: req.body.user.password,
      mobile: req.body.user.mobile,
      firstName: req.body.user.firstName,
      lastName: req.body.user.lastName,
      userName: req.body.user.userName,
      parentMobile: req.body.user.parentMobile,
      image: req.body.user.image,
      country: req.body.user.country,
      gov: req.body.user.gov,
      gov: req.body.user.gov,
      city: req.body.user.city,
      area: req.body.user.area,
      latitude: req.body.user.latitude,
      longitude: req.body.user.longitude,
      schoolYear: req.body.user.schoolYear,
      gender: req.body.user.gender,
      bitrhOfDate: req.body.user.bitrhOfDate,
      educationalLevel: req.body.user.educationalLevel,
      nationalIdImage: req.body.user.nationalIdImage,
      nationalId: req.body.user.nationalId,
      placeType: req.body.user.placeType,
      address: req.body.user.address,
      ip: req.ip,
      viewsList: [],
      booksList: [],
      notificationsList: [],
      roles: [{ name: req.body.user.type }],
      type: req.body.user.type,
      createdDate: new Date(),
      host: site.getHostFilter(req.host),
      teacherId: setting.isShared ? null : site.getTeacherSetting(req),
      $req: req,
      $res: res,
    };
    if (req.body.user.placeType == "online") {
      user.active = false;
      site.security.addUser(user, function (err, doc) {
        if (!err) {
          console.log(doc);
          response.user = doc;
          response.done = true;
        } else {
          response.error = err.message;
        }
        res.json(response);
      });
    } else {
      user.active = true;
      user.center = {
        id: req.body.user.id,
        name: req.body.user.name,
      };
      site.security.register(user, function (err, doc) {
        if (!err) {
          response.user = doc;
          response.done = true;
        } else {
          response.error = err.message;
        }
        res.json(response);
      });
    }
  });

  site.post("/api/mailer/all", (req, res) => {
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
