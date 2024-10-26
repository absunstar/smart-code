module.exports = function init(site) {
  let app = {
    name: "miniBooks",
    allowMemory: false,
    memoryList: [],
    allowCache: false,
    cacheList: [],
    allowRoute: true,
    allowRouteGet: true,
    allowRouteAdd: true,
    allowRouteUpdate: true,
    allowRouteDelete: true,
    allowRouteView: true,
    allowRouteAll: true,
  };
  site.miniBookList = site.miniBookList || [];
  app.$collection = site.connectCollection(app.name);

  app.init = function () {
    app.$collection.findMany({ sort: { id: -1 } }, (err, docs) => {
      if (!err) {
        docs.forEach((doc) => {
          site.miniBookList.push({
            _id: doc._id,
            id: doc.id,
            code: doc.code,
            name: doc.name,
            type: doc.type,
            educationalLevel: doc.educationalLevel,
            schoolYear: doc.schoolYear,
            subject: doc.subject,
            description: doc.description,
            date: doc.date,
            host: doc.host,
            teacherId: doc.teacherId,
            price: doc.price,
            image: doc.image,
            active: doc.active,
            placeType: doc.placeType,
          });
        });
      }
    });
  };
  app.add = function (_item, callback) {
    app.$collection.add(_item, (err, doc) => {
      if (callback) {
        callback(err, doc);
      }
      if (app.allowMemory && !err && doc) {
        app.memoryList.push(doc);
      }
    });
  };
  app.update = function (_item, callback) {
    app.$collection.edit(
      {
        where: {
          id: _item.id,
        },
        set: _item,
      },
      (err, result) => {
        if (callback) {
          callback(err, result);
        }
        if (app.allowMemory && !err && result) {
          let index = app.memoryList.findIndex((itm) => itm.id === result.doc.id);
          if (index !== -1) {
            app.memoryList[index] = result.doc;
          } else {
            app.memoryList.push(result.doc);
          }
        } else if (app.allowCache && !err && result) {
          let index = app.cacheList.findIndex((itm) => itm.id === result.doc.id);
          if (index !== -1) {
            app.cacheList[index] = result.doc;
          } else {
            app.cacheList.push(result.doc);
          }
        }
      }
    );
  };
  app.delete = function (_item, callback) {
    app.$collection.delete(
      {
        id: _item.id,
      },
      (err, result) => {
        if (callback) {
          callback(err, result);
        }
        if (app.allowMemory && !err && result.count === 1) {
          let index = app.memoryList.findIndex((a) => a.id === _item.id);
          if (index !== -1) {
            app.memoryList.splice(index, 1);
          }
        } else if (app.allowCache && !err && result.count === 1) {
          let index = app.cacheList.findIndex((a) => a.id === _item.id);
          if (index !== -1) {
            app.cacheList.splice(index, 1);
          }
        }
      }
    );
  };
  app.view = function (_item, callback) {
    if (callback) {
      if (app.allowMemory) {
        if ((item = app.memoryList.find((itm) => itm.id == _item.id))) {
          callback(null, item);
          return;
        }
      } else if (app.allowCache) {
        if ((item = app.cacheList.find((itm) => itm.id == _item.id))) {
          callback(null, item);
          return;
        }
      }
      let where = {};
      if (_item._id) {
        where._id = _item._id;
      } else {
        where.id = _item.id;
      }
      app.$collection.find(where, (err, doc) => {
        callback(err, doc);

        if (!err && doc) {
          if (app.allowMemory) {
            app.memoryList.push(doc);
          } else if (app.allowCache) {
            app.cacheList.push(doc);
          }
        }
      });
    }
  };
  app.all = function (_options, callback) {
    if (callback) {
      if (app.allowMemory) {
        callback(null, app.memoryList);
      } else {
        app.$collection.findMany(_options, callback);
      }
    }
  };

  if (app.allowRoute) {
    if (app.allowRouteGet) {
      site.get(
        {
          name: app.name,
        },
        (req, res) => {
          res.render(
            app.name + "/index.html",
            {
              title: app.name,
              appName: req.word("Mini Books"),
              setting: site.getSiteSetting(req.host),
            },
            { parser: "html css js", compres: true }
          );
        }
      );
      site.get(
        {
          name: "miniBookReceiveView",
        },
        (req, res) => {
          let notificationsCount = 0;
          if (req.session.user && req.session.user.notificationsList) {
            let notifications = req.session.user.notificationsList.filter((_n) => !_n.show);
            notificationsCount = notifications.length;
          }

          let setting = site.getSiteSetting(req.host);
          setting.description = setting.description || "";
          setting.keyWordsList = setting.keyWordsList || [];
          let data = {
            notificationsCount: notificationsCount,
            notificationsList: req.session?.user?.notificationsList?.slice(0, 7),
            setting: setting,
            guid: "",
            isTeacher: req.session.selectedTeacherId ? true : false,
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
          res.render(app.name + "/miniBookReceiveView.html", data, {
            parser: "html css js",
            compres: true,
          });
        }
      );
      site.get(
        {
          name: "miniBookView",
        },
        (req, res) => {
          let item = site.miniBookList.find((itm) => itm._id == req.query.id);
          let notificationsCount = 0;
          if (req.session.user && req.session.user.notificationsList) {
            let notifications = req.session.user.notificationsList.filter((_n) => !_n.show);
            notificationsCount = notifications.length;
          }

          let setting = site.getSiteSetting(req.host);
          setting.description = setting.description || "";
          setting.keyWordsList = setting.keyWordsList || [];
          let data = {
            notificationsCount: notificationsCount,
            notificationsList: req.session?.user?.notificationsList?.slice(0, 7),
            setting: setting,
            guid: "",
            isTeacher: req.session.selectedTeacherId ? true : false,
            filter: site.getHostFilter(req.host),
            site_logo: item?.image?.url || setting.logo?.url || "/images/logo.png",
            site_footer_logo: setting.footerLogo?.url || "/images/logo.png",
            page_image: item?.image?.url || setting.logo?.url || "/images/logo.png",
            powerdByLogo: setting.powerdByLogo?.url || "/images/logo.png",
            user_image: req.session?.user?.image?.url || "/images/logo.png",
            site_name: setting.siteName,
            page_lang: setting.id,
            page_type: "website",
            page_title: setting.siteName + " " + setting.titleSeparator + " " + (item?.name || setting.siteSlogan),
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
          res.render(app.name + "/miniBookView.html", data, {
            parser: "html css js",
            compres: true,
          });
        }
      );

      site.get(
        {
          name: "miniBooksView",
        },
        (req, res) => {
          let notificationsCount = 0;
          if (req.session.user && req.session.user.notificationsList) {
            let notifications = req.session.user.notificationsList.filter((_n) => !_n.show);
            notificationsCount = notifications.length;
          }

          let setting = site.getSiteSetting(req.host);
          setting.description = setting.description || "";
          setting.keyWordsList = setting.keyWordsList || [];
          let data = {
            notificationsCount: notificationsCount,
            notificationsList: req.session?.user?.notificationsList?.slice(0, 7),
            setting: setting,
            guid: "",
            isTeacher: req.session.selectedTeacherId ? true : false,
            filter: site.getHostFilter(req.host),
            site_logo: setting.logo?.url || "/images/logo.png",
            page_image: setting.logo?.url || "/images/logo.png",
            site_footer_logo: setting.footerLogo?.url || "/images/logo.png",
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
          res.render(app.name + "/miniBooksView.html", data, {
            parser: "html css js",
            compres: true,
          });
        }
      );
    }

    if (app.allowRouteAdd) {
      site.post({ name: `/api/${app.name}/add`, require: { permissions: ["teacher"] } }, (req, res) => {
        let response = {
          done: false,
        };

        let _data = req.data;

        _data.addUserInfo = req.getUserFinger();
        _data.date = site.getDate();
        _data.host = site.getHostFilter(req.host);
        if ((teacherId = site.getTeacherSetting(req))) {
          _data.teacherId = teacherId;
        } else {
          response.error = "There Is No Teacher";
          res.json(response);
          return;
        }

        app.add(_data, (err, doc) => {
          if (!err && doc) {
            let setting = site.getSiteSetting(req.host);
            if (setting.isShared) {
              doc.code = (req.session?.user?.prefix || req.session?.user?.id.toString()) + "L" + doc.id.toString();
            } else {
              doc.code = (setting.teacher.prefix || req.session?.user?.id.toString()) + "L" + doc.id.toString();
            }

            app.update(doc, (err, result) => {
              if (!err && result) {
                response.done = true;
                response.doc = result.doc;

                site.miniBookList.unshift({
                  _id: result.doc._id,
                  id: result.doc.id,
                  code: result.doc.code,
                  name: result.doc.name,
                  type: result.doc.type,
                  educationalLevel: result.doc.educationalLevel,
                  schoolYear: result.doc.schoolYear,
                  subject: result.doc.subject,
                  description: result.doc.description,
                  date: result.doc.date,
                  host: result.doc.host,
                  teacherId: result.doc.teacherId,
                  price: result.doc.price,
                  active: result.doc.active,
                  image: result.doc.image,
                  placeType: result.doc.placeType,
                });
                let msg = `${req.host}/miniBookView?id=${result.doc._id} \n \n تم إضافة مذكرة جديدة بعنوان \n ( ${result.doc.name} ) \n \n`;
                if (setting.isShared) {
                  msg = msg + `\n للأستاذ  :  ${req.session.user.firstName}  \n \n`;
                }
                if (result.doc?.educationalLevel?.name) {
                  let educationalLevel = setting.isFaculty ? "الفرقة الدراسية" : "المرحلة الدراسية";
                  msg = msg + `${educationalLevel}  :  ${result.doc?.educationalLevel?.name}  \n`;
                }
                if (result.doc?.schoolYear?.name) {
                  let schoolYear = setting.isFaculty ? "الشعبة الدراسية" : "العام الدراسي";
                  msg = msg + `${schoolYear}  :  ${result.doc?.schoolYear?.name}  \n`;
                }
                if (result.doc?.subject?.name) {
                  msg = msg + `المادة الدراسية :  ${result.doc?.subject?.name}  \n`;
                }

                site.sendMessageTelegram({ host: req.host, msg: msg });
              } else {
                response.error = err.mesage;
              }
              res.json(response);
            });
          } else {
            response.error = err.mesage;
            res.json(response);
          }
        });
      });
    }

    if (app.allowRouteUpdate) {
      site.post(
        {
          name: `/api/${app.name}/update`,
          require: { permissions: ["teacher"] },
        },
        (req, res) => {
          let response = {
            done: false,
          };

          let _data = req.data;
          _data.editUserInfo = req.getUserFinger();
          app.update(_data, (err, result) => {
            if (!err) {
              response.done = true;
              response.result = result;
              let index = site.miniBookList.findIndex((a) => a.id === result?.doc?.id);
              if (index !== -1) {
                site.miniBookList[index] = {
                  _id: result.doc._id,
                  id: result.doc.id,
                  code: result.doc.code,
                  name: result.doc.name,
                  type: result.doc.type,
                  educationalLevel: result.doc.educationalLevel,
                  schoolYear: result.doc.schoolYear,
                  subject: result.doc.subject,
                  description: result.doc.description,
                  date: result.doc.date,
                  host: result.doc.host,
                  teacherId: result.doc.teacherId,
                  price: result.doc.price,
                  active: result.doc.active,
                  image: result.doc.image,
                  placeType: result.doc.placeType,
                };
              }
            } else {
              response.error = err.message;
            }
            res.json(response);
          });
        }
      );
    }

    if (app.allowRouteDelete) {
      site.post(
        {
          name: `/api/${app.name}/delete`,
          require: { permissions: ["teacher"] },
        },
        (req, res) => {
          let response = {
            done: false,
          };
          let _data = req.data;

          app.delete(_data, (err, result) => {
            if (!err && result.count === 1) {
              response.done = true;
              response.result = result;
              let index = site.miniBookList.findIndex((a) => a.id === result?.doc?.id);
              if (index !== -1) {
                site.miniBookList.splice(index, 1);
              }
            } else {
              response.error = err?.message || "Deleted Not Exists";
            }
            res.json(response);
          });
        }
      );
    }

    if (app.allowRouteView) {
      site.post({ name: `/api/${app.name}/view`, require: { permissions: ["teacher"] } }, (req, res) => {
        let response = {
          done: false,
        };

        let _data = req.data;
        app.view(_data, (err, doc) => {
          if (!err && doc) {
            response.done = true;

            response.doc = doc;
          } else {
            response.error = err?.message || "Not Exists";
          }
          res.json(response);
        });
      });

      site.post({ name: `/api/${app.name}/viewToStudent`, public: true }, (req, res) => {
        let response = {
          done: false,
        };

        let _data = req.data;
        app.view(_data, (err, doc) => {
          if (!err && doc) {
            response.done = true;
            let _doc = { ...doc };
            if (doc.activateSubscription) {
              doc.subscriptionList = doc.subscriptionList || [];
              let subscriptionObj = null;
              for (let i = 0; i < doc.subscriptionList.length; i++) {
                if (req.session.user?.subscriptionList?.some((s) => s === doc.subscriptionList[i]?.subscription?.id)) {
                  subscriptionObj = doc.subscriptionList[i];
                }
              }
              if (subscriptionObj?.subscription?.id) {
                _doc.subscriptionName = subscriptionObj.subscription.name;
                _doc.price = subscriptionObj.price;
              }
            }

            if (req.session.user) {
              if (req.session.user.miniBooksList && req.session.user.miniBooksList.some((s) => s.miniBookId == _doc.id)) {
                _doc.$buy = true;
              } else {
                if (_doc.type && _doc.type.name == "private") {
                  delete _doc.fileList;
                }
                _doc.linkList.forEach((_link) => {
                  delete _link.url;
                });
              }
            } else {
              if (_doc.type && _doc.type.name == "private") {
                delete _doc.fileList;
              }
              _doc.linkList.forEach((_link) => {
                delete _link.url;
              });
            }
            _doc.$time = site.xtime(_doc.date, req.session.lang || "Ar");
            response.doc = _doc;
          } else {
            response.error = err?.message || "Not Exists";
          }
          res.json(response);
        });
      });
    }

    site.post(
      {
        name: `/api/${app.name}/changeReceiveType`,
        require: { permissions: ["login"] },
      },
      (req, res) => {
        let response = {
          done: false,
        };

        let _data = req.data;
        app.view({ id: _data.miniBookId }, (err, doc) => {
          doc.studentList = doc.studentList || [];
          let index = doc.studentList.findIndex((itm) => itm?.student?.id === _data.student.id);
          if (index !== -1) {
            doc.studentList[index].receiveUser = {
              id: req.session.user.id,
              firstName: req.session.user.firstName,
            };
            doc.studentList[index].receiveDate = site.getDate();
            doc.studentList[index].receiveType = _data.type;
          } else {
            let obj = {
              student: {
                id: _data.student.id,
                firstName: _data.student.firstName,
                barcode: _data.student.barcode,
                mobile: _data.student.mobile,
              },
            };
            obj.buyType = _data.buyType;
            obj.receiveType = _data.type;
            obj.receiveUser = {
              id: req.session.user.id,
              firstName: req.session.user.firstName,
            };
            obj.receiveDate = site.getDate();
            doc.studentList.push(obj);
          }
          app.update(doc, (err, result) => {
            if (!err) {
              response.done = true;
              response.result = result;
            } else {
              response.error = err.message;
            }
            res.json(response);
          });
        });
      }
    );

    site.post({ name: `/api/${app.name}/getReceiveToStudent`, public: true }, (req, res) => {
      let response = {
        done: false,
      };

      let where = req.body.where || {};
      let search = req.body.search || "";

      let setting = site.getSiteSetting(req.host);

      if (where["type"] != "teacher") {
        if ((teacherId = site.getTeacherSetting(req)) && !setting.isCenter && !setting.isShared) {
          where["teacherId"] = teacherId;
        } else {
          where["host"] = site.getHostFilter(req.host);
        }
      } else if (setting.isShared || setting.isCenter) {
        where["host"] = site.getHostFilter(req.host);
      }
      where["id"] = { $ne: 1 };
      if (search) {
        where.$or = [];
        where.$or.push({
          barcode: search,
        });
        where.$or.push({
          idNumber: site.get_RegExp(search, "i"),
        });
        where.$or.push({
          firstName: site.get_RegExp(search, "i"),
        });
        where.$or.push({
          phone: site.get_RegExp(search, "i"),
        });
        where.$or.push({
          mobile: site.get_RegExp(search, "i"),
        });
      }
      site.security.getUser(where, (err, user) => {
        if (!err) {
          if (user) {
            let whereMiniBook = {
              active: true,
              receiveLibrary: true,
            };
            app.all({ whereMiniBook, sort: { id: -1 } }, (err, docs) => {
              let obj = {
                student: {
                  id: user.id,
                  firstName: user.firstName,
                  barcode: user.barcode,
                  educationalLevel: user.educationalLevel,
                  schoolYear: user.schoolYear,
                  mobile: user.mobile,
                  parentMobile: user.parentMobile,
                },
                list: [],
              };
              if (docs?.length > 0) {
                for (let i = 0; i < docs.length; i++) {
                  let _miniBook = {
                    miniBook: {
                      id: docs[i].id,
                      name: docs[i].name,
                    },
                  };
                  if ((item = docs[i].studentList?.find((itm) => itm?.student?.id == user.id))) {
                    _miniBook.buyType = item.buyType;
                    _miniBook.receiveType = item.receiveType;
                    _miniBook.receiveDate = item.receiveDate;
                    _miniBook.receiveUser = item.receiveUser;
                  } else {
                    _miniBook.buyType = "notBuy";
                    user.subscriptionList = user.subscriptionList || [];
                    user.miniBooksList = user.miniBooksList || [];
                    if (user.miniBooksList.some((n) => n.miniBookId == docs[i].id)) {
                      _miniBook.buyType = "miniBookBuy";
                    }

                    if (docs[i].subscriptionList && docs[i].subscriptionList.length > 0) {
                      let foundSub = false;

                      for (let x of user.subscriptionList) {
                        if (docs[i].subscriptionList.some((s) => s?.subscription?.id == x)) {
                          foundSub = true;
                        }
                      }

                      if (foundSub) {
                        _miniBook.buyType = "subscriptionBuy";
                      }
                    }
                    _miniBook.receiveType = "notReceive";
                  }

                  obj.list.push(_miniBook);
                }
              }

              res.json({
                done: true,
                doc: obj,
              });
            });
          } else {
            response.error = "Not Exist";

            res.json(response);
          }
        } else {
          response.error = err.mesage || "Not Exist";

          res.json(response);
        }
      });
    });

    if (app.allowRouteAll) {
      site.post({ name: `/api/${app.name}/all`, require: { permissions: ["teacher"] } }, (req, res) => {
        let where = req.body.where || {};
        let search = req.body.search || "";
        let limit = req.body.limit || 100;
        let select = req.body.select || {
          id: 1,
          name: 1,
          image: 1,
          educationalLevel: 1,
          schoolYear: 1,
          placeType: 1,
          date: 1,
          code: 1,
          active: 1,
        };
        if (search) {
          where.$or = [];

          where.$or.push({
            id: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            code: search,
          });
          where.$or.push({
            name: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            description: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "educationalLevel.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "schoolYear.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "subject.name": site.get_RegExp(search, "i"),
          });
        }

        if (where["educationalLevel"]) {
          where["educationalLevel.id"] = where["educationalLevel"].id;
          delete where["educationalLevel"];
        }

        if (where["schoolYear"]) {
          where["schoolYear.id"] = where["schoolYear"].id;
          delete where["schoolYear"];
        }

        if (where["subject"]) {
          where["subject.id"] = where["subject"].id;
          delete where["subject"];
        }

        if ((teacherId = site.getTeacherSetting(req))) {
          where["teacherId"] = teacherId;
        } else {
          where["host"] = site.getHostFilter(req.host);
        }

        app.all({ where, select, limit, sort: { id: -1 } }, (err, docs) => {
          res.json({
            done: true,
            list: docs,
          });
        });
      });
      site.post({ name: `/api/${app.name}/allToStudent`, public: true }, (req, res) => {
        let where = req.body.where || {};
        let search = req.body.search || "";
        let limit = req.body.limit || 100;
        let select = {
          id: 1,
          name: 1,
          image: 1,
          price: 1,
          description: 1,
          date: 1,
          code: 1,
        };
        if (search) {
          where.$or = [];

          where.$or.push({
            id: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            code: search,
          });
          where.$or.push({
            name: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            description: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "educationalLevel.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "schoolYear.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "subject.name": site.get_RegExp(search, "i"),
          });
        }
        if (req.session?.user?.type == "student" && !where["subscriptionList.subscription.id"]) {
          if (!where.educationalLevel) {
            where.educationalLevel = req.session?.user?.educationalLevel;
          }
          if (!where.schoolYear) {
            where.schoolYear = req.session?.user?.schoolYear;
          }
          // if (req.session?.user?.subscriptionList) {
          //   where.$or = where.$or || [];
          //   where.$or.push({
          //     "subscriptionList.subscription.id": { $in: req.session?.user?.subscriptionList },
          //   });
          // }
        }
        if (where["educationalLevel"]) {
          where["educationalLevel.id"] = where["educationalLevel"].id;
          delete where["educationalLevel"];
        }

        if (where["schoolYear"]) {
          where.$or = where.$or || [];
          where.$or.push({
            "schoolYear.id": where["schoolYear"].id,
          });
          where.$or.push({
            "schoolYear.id": {$exists:false},
          });
          delete where["schoolYear"];
        }

        if (where["subject"]) {
          where["subject.id"] = where["subject"].id;
          delete where["subject"];
        }
        if (req.body.type == "toStudent") {
          if (req.session.user && req.session.user.type == "student") {
            // where["educationalLevel.id"] = req.session.user?.educationalLevel?.id;
            // where["schoolYear.id"] = req.session.user?.schoolYear?.id;

            where.$and = [
              {
                $or: [{ placeType: req.session.user.placeType }, { placeType: "both" }],
              },
              {
                $or: [
                  {
                    code: search,
                  },
                  {
                    name: site.get_RegExp(search, "i"),
                  },
                  {
                    description: site.get_RegExp(search, "i"),
                  },
                  {
                    "educationalLevel.name": site.get_RegExp(search, "i"),
                  },
                  {
                    "schoolYear.name": site.get_RegExp(search, "i"),
                  },
                  {
                    "subject.name": site.get_RegExp(search, "i"),
                  },
                ],
              },
            ];
          }
        }
        if ((teacherId = site.getTeacherSetting(req))) {
          where["teacherId"] = teacherId;
        } else {
          where["host"] = site.getHostFilter(req.host);
        }

        if (where["myMiniBooks"]) {
          where.$or = where.$or || [];
          if (req.session?.user?.type == "student" && req.session?.user?.miniBooksList) {
            let miniBookList = req.session?.user?.miniBooksList?.map((_item) => _item.miniBookId);
            where.$or.push({
              id: { $in: miniBookList },
            });
          }
          if (req.session?.user?.subscriptionList) {
            where.$or.push({
              "subscriptionList.subscription.id": { $in: req.session?.user?.subscriptionList },
            });
          }
          delete where["myMiniBooks"];
        }

        app.all({ where, select, limit, sort: { id: -1 } }, (err, docs) => {
          if (req.body.type) {
            for (let i = 0; i < docs.length; i++) {
              docs[i].$time = site.xtime(docs[i].date, req.session.lang || "ar");
            }
          }
          res.json({
            done: true,
            list: docs,
          });
        });
      });
    }
  }

  site.post({ name: `/api/${app.name}/buyCode`, require: { permissions: ["login"] } }, (req, res) => {
    let response = {
      done: false,
    };

    let _data = req.data;

    app.view({ id: _data.miniBookId }, (err, doc) => {
      if (!err && doc) {
        let price = doc.price;
        if (doc.activateSubscription) {
          doc.subscriptionList = doc.subscriptionList || [];
          let subscription = null;
          for (let i = 0; i < doc.subscriptionList.length; i++) {
            if (req.session.user?.subscriptionList?.some((s) => s === doc.subscriptionList[i]?.subscription?.id)) {
              subscription = doc.subscriptionList[i];
            }
          }
          if (subscription?.price == 0) {
            _data.purchase = {
              purchaseType: {
                nameAr: "مجاني",
                nameEn: "Free",
                name: "free",
              },
            };
          } else {
            price = subscription?.price;
          }
        } else {
          if (price == 0) {
            _data.purchase = {
              purchaseType: {
                nameAr: "مجاني",
                nameEn: "Free",
                name: "free",
              },
            };
          }
        }

        if (!_data.purchase || !_data.purchase.purchaseType || !_data.purchase.purchaseType.name) {
          response.error = req.word("Must Select Purchase Type");
          res.json(response);
          return;
        } else if (_data.purchase.purchaseType.name == "code" && !_data.purchase.code) {
          response.error = req.word("The code must be entered");
          res.json(response);
          return;
        } else if ((_data.purchase.purchaseType.name == "instaPay" || _data.purchase.purchaseType.name == "cashWallet") && !_data.purchase.numberTransferFrom) {
          response.error = req.word("The account number to be transferred from must be entered");
          res.json(response);
          return;
        }

        site.getPurchaseOrder({ "target.id": doc.id, type: "miniBook", "user.id": req.session?.user?.id }, (err1, order) => {
          if (order) {
            response.error = req.word("The miniBook has already been purchased");
            res.json(response);
            return;
          }

          site.validateCode(req, { code: _data?.purchase?.code, price: price }, (errCode, code) => {
            if (errCode && price > 0 && _data.purchase.purchaseType.name == "code") {
              response.error = req.word(errCode);
              res.json(response);
              return;
            } else {
              site.security.getUser(
                {
                  id: req.session.user.id,
                },
                (err, user) => {
                  if (!err && user) {
                    user.miniBooksList = user.miniBooksList || [];
                    if (!user.miniBooksList.some((l) => l.miniBookId == doc.id) && (_data.purchase.purchaseType.name == "code" || _data.purchase.purchaseType.name == "free")) {
                      user.miniBooksList.push({
                        miniBookId: doc.id,
                      });
                    }
                    site.addPurchaseOrder({
                      type: "miniBook",
                      target: { id: doc.id, name: doc.name },
                      price: price,
                      purchaseType: {
                        name: _data.purchase.purchaseType.name,
                        nameAr: _data.purchase.purchaseType.nameAr,
                        nameEn: _data.purchase.purchaseType.nameEn,
                      },
                      done: _data.purchase?.purchaseType?.name == "code" || _data.purchase?.purchaseType?.name == "free" ? true : false,
                      code: _data.purchase.code,
                      numberTransferFrom: _data.purchase.numberTransferFrom,
                      imageTransfer: _data.purchase.imageTransfer,
                      date: site.getDate(),
                      host: site.getHostFilter(req.host),
                      teacherId: site.getTeacherSetting(req) || doc.teacherId,
                      user: {
                        id: user.id,
                        firstName: user.firstName,
                      },
                    });
                    site.security.updateUser(user);
                  }
                  response.isOpen = _data.purchase.purchaseType?.name == "instaPay" || _data.purchase.purchaseType?.name == "cashWallet" ? false : true;

                  response.done = true;
                  // doc.$buy = true;
                  // doc.$time = site.xtime(doc.date, req.session.lang || "ar");
                  // response.doc = doc;
                  res.json(response);
                }
              );
            }
          });
        });
      } else {
        response.error = err?.message || "Not Exists";
        res.json(response);
      }
    });
  });

  site.getMiniBooksToStudent = function (req, callBack) {
    callBack = callBack || function () {};
    let select = {
      id: 1,
      name: 1,
      image: 1,
      price: 1,
      code: 1,
    };
    let where = {};
    site.security.getUser({ id: req.body.studentId }, (err, user) => {
      if (!err) {
        if (user) {
          let idList = [];
          user.miniBooksList = user.miniBooksList || [];
          user.miniBooksList.forEach((element) => {
            idList.push(element.miniBookId);
          });

          where["id"] = {
            $in: idList,
          };
          app.$collection.findMany({ where, select, sort: { id: -1 } }, (err, docs) => {
            callBack(err, docs);
          });
        } else {
          callBack(err, null);

          return;
        }
      } else {
        callBack(err, null);
      }
    });
  };

  site.getMiniBooks = function (req) {
    let setting = site.getSiteSetting(req.host);
    let host = site.getHostFilter(req.host);
    let teacherId = site.getTeacherSetting(req);
    let docs = [];

    for (let i = 0; i < site.miniBookList.length; i++) {
      let obj = { ...site.miniBookList[i] };
      obj.$time = site.xtime(obj.date, "Ar");
      if (obj.price == 0) {
        obj.$isFree = true;
      }
      if (obj.active && ((!teacherId && obj.host == host) || (teacherId && teacherId == obj.teacherId))) {
        if (req.session.user && req.session.user.type == "student") {
          if (
            obj.educationalLevel?.id == req.session.user?.educationalLevel?.id &&
            ((!obj.schoolYear && !obj?.schoolYear?.id) || req.session.user?.schoolYear?.id == obj?.schoolYear?.id) &&
            (obj.placeType == req.session.user.placeType || obj.placeType == "both")
          ) {
            docs.push(obj);
          }
        } else {
          docs.push(obj);
        }
      }
    }

    return docs.slice(0, setting.miniBooksLimit || 100);
    // }
  };

  site.getMiniBook = function (where, callBack) {
    callBack = callBack || function () {};
    app.view(where, (err, doc) => {
      callBack(err, doc);
    });
  };

  app.init();
  site.addApp(app);
};
