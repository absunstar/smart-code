module.exports = function init(site) {
  let app = {
    name: "manageUsers",
    allowMemory: false,
    memoryList: [],
    newList: [],
    activeList: [],
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
  site.teacherList = [];
  site.studentList = [];
  site.parentList = [];

  app.$collection = site.connectCollection("users_info");

  app.init = function () {
    app.$collection.findMany({ sort: { id: -1 } }, (err, docs) => {
      if (!err) {
        docs.forEach((doc) => {
          if (doc.type == "teacher") {
            let obj = {
              _id: doc._id,
              id: doc.id,
              image: doc.image,
              firstName: doc.firstName,
              lastName: doc.lastName,
              username: doc.username,
              bio: doc.bio,
              title: doc.title,
              host: doc.host,
              levelList: doc.levelList,
              purchaseTypeList: doc.purchaseTypeList,
              youtubeAccouunt: doc.youtubeAccouunt,
              instagramAccouunt: doc.instagramAccouunt,
              twitterAccouunt: doc.twitterAccouunt,
              facebookAccount: doc.facebookAccount,
              linkedinAccouunt: doc.linkedinAccouunt,
              active: doc.active,
              priorityAppearance: doc.priorityAppearance || 0,
            };
            site.teacherList.push({ ...obj });
          } else if (doc.type == "student") {
            let obj = {
              _id: doc._id,
              id: doc.id,
              image: doc.image,
              parent: doc.parent,
              firstName: doc.firstName,
              lastName: doc.lastName,
              host: doc.host,
              active: doc.active,
            };
            site.studentList.push({ ...obj });
          } else if (doc.type == "parent") {
            let obj = {
              _id: doc._id,
              id: doc.id,
              image: doc.image,
              firstName: doc.firstName,
              lastName: doc.lastName,
              host: doc.host,
              active: doc.active,
            };
            site.parentList.push({ ...obj });
          }
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

      app.$collection.find({ id: _item.id }, (err, doc) => {
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
          let appName = req.word("Manage Users");
          if (req.query) {
            if (req.query.type == "student") {
              appName = req.word("Manage Students");
            } else if (req.query.type == "teacher") {
              appName = req.word("Manage Teachers");
            } else if (req.query.type == "parent") {
              appName = req.word("Manage Parents");
            }
          }

          res.render(
            app.name + "/index.html",
            {
              title: app.name,
              appName: appName,
              setting: site.getSiteSetting(req.host),
            },
            { parser: "html", compres: true }
          );
        }
      );
      site.get(
        {
          name: "teachersView",
        },
        (req, res) => {
          let setting = site.getSiteSetting(req.host);
          setting.description = setting.description || "";
          setting.keyWordsList = setting.keyWordsList || [];
          let data = {
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
          res.render(app.name + "/teachersView.html", data, {
            parser: "html",
            compres: true,
          });
        }
      );
    }

    if (app.allowRouteAdd) {
      site.post({ name: `/api/${app.name}/add`, require: { permissions: ["login"] } }, (req, res) => {
        let response = {
          done: false,
        };

        let setting = site.getSiteSetting(req.host);
        let _data = req.data;
        if (_data.type == "teacher") {
          _data.roles = [{ name: "teacher" }];
          _data.permissions = [{ name: "teacher" }];
        } else if (_data.type == "student") {
          _data.roles = [{ name: "student" }];
          _data.permissions = [{ name: "student" }];
        }

        _data.host = site.getHostFilter(req.host);
        let date = site.getDate();
        let d = date.getDate().toString();
        let h = date.getHours().toString();
        let m = date.getMinutes().toString();
        app.add(_data, (err, doc) => {
          if (!err && doc) {
            if (!setting.isShared && !setting.isCenter) {
              site.addNewHost({ domain: doc.username, filter: doc.username });
            }
            if (_data.$studentGroupsList && _data.$studentGroupsList.length > 0) {
              site.addStudentToGroups(doc, _data.$studentGroupsList);
            }
            let obj = {
              _id: doc._id,
              id: doc.id,
              image: doc.image,
              bio: doc.bio,
              title: doc.title,
              parent: doc.parent,
              firstName: doc.firstName,
              lastName: doc.lastName,
              username: doc.username,
              host: doc.host,
              levelList: doc.levelList,
              purchaseTypeList: doc.purchaseTypeList,
              youtubeAccouunt: doc.youtubeAccouunt,
              instagramAccouunt: doc.instagramAccouunt,
              twitterAccouunt: doc.twitterAccouunt,
              facebookAccount: doc.facebookAccount,
              linkedinAccouunt: doc.linkedinAccouunt,
              active: doc.active,
              priorityAppearance: doc.priorityAppearance,
            };
            if (doc.type == "student") {
              site.studentList.push(obj);
            } else if (doc.type == "teacher") {
              site.teacherList.push(obj);
            } else if (doc.type == "parent") {
              site.parentList.push(obj);
            }
            if (doc.type == "student" && setting.isCenter && setting.autoStudentBarcode) {
              doc.barcode = doc.id.toString() + "00" + d + h + m;
              app.update(doc, (err1, result) => {
                if (!err1 && doc) {
                  response.done = true;
                  response.doc = result.doc;
                } else {
                  response.error = err1.mesage;
                }
                res.json(response);
              });
            } else {
              response.done = true;
              response.doc = doc;
              res.json(response);
            }
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
          require: { permissions: ["login"] },
        },
        (req, res) => {
          let response = {
            done: false,
          };

          let _data = req.data;
          _data.editUserInfo = req.getUserFinger();

          site.security.updateUser(_data, (err, result) => {
            if (!err) {
              response.done = true;
              response.result = result;
              if (result.doc) {
                let listName = "studentList";
                if (result.doc.type == "teacher") {
                  listName = "teacherList";
                } else if (result.doc.type == "parent") {
                  listName = "parentList";
                }
                let index = site[listName].findIndex((a) => a.id === result?.doc?.id);
                if (index !== -1) {
                  site[listName][index] = {
                    _id: result.doc._id,
                    id: result.doc.id,
                    image: result.doc.image,
                    firstName: result.doc.firstName,
                    lastName: result.doc.lastName,
                    username: result.doc.username,
                    bio: result.doc.bio,
                    title: result.doc.title,
                    parent: result.doc.parent,
                    host: result.doc.host,
                    levelList: result.doc.levelList,
                    purchaseTypeList: result.doc.purchaseTypeList,
                    youtubeAccouunt: result.doc.youtubeAccouunt,
                    instagramAccouunt: result.doc.instagramAccouunt,
                    twitterAccouunt: result.doc.twitterAccouunt,
                    facebookAccount: result.doc.facebookAccount,
                    linkedinAccouunt: result.doc.linkedinAccouunt,
                    active: result.doc.active,
                    priorityAppearance: result.doc.priorityAppearance || 0,
                  };
                }
              }
            } else {
              response.error = err.message;
            }
            res.json(response);
          });
        }
      );

      site.post(
        {
          name: `/api/${app.name}/updateStudentNotifications`,
          require: { permissions: ["login"] },
        },
        (req, res) => {
          let response = {
            done: false,
          };

          let _data = req.data;
          site.security.getUser({ id: req.session.user.id }, (err, user) => {
            if (!err) {
              if (user) {
                user.notificationsList = user.notificationsList || [];

                if (_data.type == "deleteAll") {
                  user.notificationsList = [];
                } else if (_data.type == "deleteOne") {
                  user.notificationsList = user.notificationsList.filter((_n) => _n.id != _data.id);
                } else if (_data.type == "showAll") {
                  for (let i = 0; i < user.notificationsList.length; i++) {
                    user.notificationsList[i].show = true;
                  }
                }
                site.security.updateUser(user, (err1, result) => {
                  if (!err1) {
                    response.done = true;
                    result.doc.notificationsList = result.doc.notificationsList || [];
                    for (let i = 0; i < result.doc.notificationsList.length; i++) {
                      result.doc.notificationsList[i].$time = site.xtime(result.doc.notificationsList[i].date, req.session.lang);
                    }
                    response.result = result.doc;
                  } else {
                    response.error = err1.message;
                  }
                  res.json(response);
                });
              } else {
                res.json(response);
              }
            } else {
              res.json(response);
            }
          });
        }
      );
    }

    if (app.allowRouteDelete) {
      site.post(
        {
          name: `/api/${app.name}/delete`,
          require: { permissions: ["login"] },
        },
        (req, res) => {
          let response = {
            done: false,
          };
          let _data = req.data;
          site.security.deleteUser({ id: _data.id, $req: req, $res: res }, (err, result) => {
            if (!err && result.count === 1) {
              response.done = true;
              response.result = result;
              let listName = "studentList";
              if (result.doc.type == "teacher") {
                listName = "teacherList";
              } else if (result.doc.type == "parent") {
                listName = "parentList";
              }
              let index = site[listName].findIndex((a) => a.id === result.doc.id);
              if (index !== -1) {
                site[listName].splice(index, 1);
              }
              res.json(response);
            } else {
              response.error = err?.message || "Deleted Not Exists";
              res.json(response);
            }
          });
        }
      );
    }

    if (app.allowRouteView) {
      site.post({ name: `/api/${app.name}/view`, public: true }, (req, res) => {
        let response = {
          done: false,
        };

        let _data = req.data;
        app.view({ id: _data.id }, (err, doc) => {
          if (!err && doc) {
            response.done = true;
            response.doc = doc;
          } else {
            response.error = err?.message || "Not Exists";
          }
          res.json(response);
        });
      });
    }

    if (app.allowRouteAll) {
      site.post({ name: `/api/${app.name}/all`, public: true }, (req, res) => {
        let setting = site.getSiteSetting(req.host);
        let where = req.body.where || {};
        let search = req.body.search || "";
        let limit = req.body.limit || 100;
        let select = req.body.select || {
          id: 1,
          image: 1,
          userId: 1,
          type: 1,
          active: 1,
          username: 1,
          firstName: 1,
          email: 1,
          barcode: 1,
        };
        if (search) {
          where.$or = [];

          where.$or.push({
            id: site.get_RegExp(search, "i"),
          });

          where.$or.push({
            firstName: site.get_RegExp(search, "i"),
          });

          where.$or.push({
            lastName: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            barcode: search,
          });
          where.$or.push({
            idNumber: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "educationalLevel.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "schoolYear.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "school.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "subject.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "center.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "gender.nameAr": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "gender.nameEn": site.get_RegExp(search, "i"),
          });

          where.$or.push({
            phone: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            mobile: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            whatsapp: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            socialEmail: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            bio: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            title: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            address: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "gov.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "city.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "area.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "levelList.educationalLevel.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "levelList.schoolYear.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "levelList.subject.name": site.get_RegExp(search, "i"),
          });
        }
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
        console.log(where);
        
        app.$collection.findMany({ where, select, limit, sort: { id: -1 } }, (err, users, count) => {
          res.json({
            done: true,
            count: count,
            list: users,
          });
        });
      });
    }
    site.post({ name: `/api/${app.name}/toDifferentGroup`, require: { permissions: ["login"] } }, (req, res) => {
      let response = {
        done: false,
      };

      let where = req.body.where || {};

      app.$collection.find(where, (err, doc) => {
        if (!err && doc) {
          response.done = true;

          site.getGroup(
            { "studentList.student.id": doc.id, "subject.id": req.body.subjectId, "educationalLevel.id": doc.educationalLevel.id, "schoolYear.id": doc.schoolYear.id },
            (errCode, group) => {
              if (group && group.id) {
                let studentGroup = group.studentList.find((itm) => itm.student.id == doc.id);
                response.doc = {
                  student: {
                    id: doc.id,
                    firstName: doc.firstName,
                    barcode: doc.barcode,
                    mobile: doc.mobile,
                    parentMobile: doc.parentMobile,
                  },
                  discount: studentGroup.discount,
                  discountValue: studentGroup.discountValue,
                  requiredPayment: studentGroup.requiredPayment,
                  exempt: studentGroup.exempt,
                  group: {
                    id: group.id,
                    name: group.name,
                  },
                };
              } else {
                response.error = "There is no matching group for the student data";
              }
              res.json(response);
            }
          );
        } else {
          response.error = err?.message || "Not Exists";
          res.json(response);
        }
      });
    });

    site.post({ name: `/api/${app.name}/purchaseTypeTeacher`, require: { permissions: ["login"] } }, (req, res) => {
      let response = {
        done: false,
      };

      let teacher = site.teacherList.find((t) => t.id == req.data);

      if (teacher) {
        response.done = true;
        response.list = teacher.purchaseTypeList;
      } else {
        response.error = "Not Exists";
      }

      res.json(response);
    });
  }

  site.addNotificationToStudents = function (doc, req) {
    let where = {};
    if (doc.type.name == "parent") {
      where["type"] = "parent";
    } else {
      where["type"] = "student";

      if (doc.type.name == "online") {
        where["placeType"] = "online";
      } else if (doc.type.name == "offline") {
        where["placeType"] = "offline";
        if (doc.center.id) {
          where["center.id"] = doc.center.id;
        }
      } else if (doc.type.name == "specificStudents") {
        let studentsIds = doc.studentsList.map((_s) => _s.id);
        where["id"] = { $in: studentsIds };
      }

      if (doc.educationalLevel.id) {
        where["educationalLevel.id"] = doc.educationalLevel.id;
      }
      if (doc.schoolYear.id) {
        where["schoolYear.id"] = doc.schoolYear.id;
      }
    }

    if ((teacherId = site.getTeacherSetting(req))) {
      where["teacherId"] = teacherId;
    } else {
      where["host"] = site.getHostFilter(req.host);
    }

    site.security.getUsers(where, (err, docs) => {
      if (!err && docs) {
        for (let i = 0; i < docs.length; i++) {
          docs[i].notificationsList = docs[i].notificationsList || [];
          docs[i].notificationsList.unshift({ id: doc.id, show: false, date: doc.date, image: doc.image, title: doc.title, content: doc.content });
          site.security.updateUser(docs[i]);
        }
      }
    });
  };

  site.getTeachers = function (data) {
    let host = site.getHostFilter(data.host);
    let docs = [];
    for (let i = 0; i < site.teacherList.length; i++) {
      let obj = { ...site.teacherList[i] };
      if (obj.host == host && obj.active == true) {
        docs.push(obj);
      }
    }
    docs.sort((a, b) => {
      return a.priorityAppearance - b.priorityAppearance;
    });

    return docs.slice(0, data.limit || 10000);
  };

  site.getStudents = function (data) {
    let host = site.getHostFilter(data.host);
    let docs = [];
    for (let i = 0; i < site.studentList.length; i++) {
      let obj = { ...site.studentList[i] };
      if (obj.host == host && obj.active == true && (!data.parentId || (obj.parent && data.parentId == obj.parent.id))) {
        docs.push(obj);
      }
    }

    return docs.slice(0, data.limit || 10000);
  };

  app.init();
  site.addApp(app);
};
