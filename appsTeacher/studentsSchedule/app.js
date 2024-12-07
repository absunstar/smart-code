module.exports = function init(site) {
  let app = {
    name: "studentsSchedule",
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

  app.$collection = site.connectCollection(app.name);

  app.init = function () {
    if (app.allowMemory) {
      app.$collection.findMany({}, (err, docs) => {
        if (!err) {
          if (docs.length == 0) {
            app.cacheList.forEach((_item, i) => {
              app.$collection.add(_item, (err, doc) => {
                if (!err && doc) {
                  app.memoryList.push(doc);
                }
              });
            });
          } else {
            docs.forEach((doc) => {
              app.memoryList.push(doc);
            });
          }
        }
      });
    }
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
        if ((item = app.memoryList.find((itm) => itm.id == _item.id || itm.studentId == _item.studentId))) {
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
          name: "studentsSchedule",
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
          res.render(app.name + "/index.html", data, {
            parser: "html",
            compres: true,
          });
        }
      );
    }

    if (app.allowRouteUpdate) {
      site.post(
        {
          name: `/api/${app.name}/add`,
          require: { permissions: ["login"] },
        },
        (req, res) => {
          let response = {
            done: false,
          };

          let _data = req.data;
          if (_data.dayList && _data.dayList.length > 0) {
            let duplicateList = _data.dayList.filter((item, index, self) => index !== self.findIndex((t) => t.day.code === item.day.code));

            if (duplicateList && duplicateList.length > 0) {
              response.error = req.word("There is a duplicate day");
              res.json(response);
              return;
            }
          } else {
            response.error = req.word("Must Add Days");
            res.json(response);
            return;
          }
          if (_data.startDate > _data.endDate) {
            response.error = req.word("The date is incorrect");
            res.json(response);
            return;
          }
          app.$collection.find({ studentId: _data.studentId }, (err, doc) => {
            if (!err) {
              let status = site.studentsScheduleTypeList.find((itm) => itm.name == "inProgress");

              let start = site.getDate(_data.startDate);
              let end = site.getDate(_data.endDate);
              /* end.setHours(0, 0, 0, 0); */
              dayList = [];
              let index = _data.dayList.findIndex((itm) => itm.day.code === start.getDay());
              if (index !== -1) {
                dayList.push({
                  date: site.getDate(start),
                  day: _data.dayList[index].day,
                  teacherName: _data.teacherName,
                  subjectName: _data.subjectName,
                  time: _data.dayList[index].time,
                  status: status,
                  code: _data.dayList[index].day.code.toString() + Math.random().toString(16).slice(6),
                });
              }
              while (site.getDate(start) <= site.getDate(end)) {
                start.setTime(start.getTime() + 1 * 24 * 60 * 60 * 1000);
                let index = _data.dayList.findIndex((itm) => itm.day.code === start.getDay());
                if (index !== -1 && site.getDate(start) <= site.getDate(end)) {
                  dayList.push({
                    date: site.getDate(start),
                    day: _data.dayList[index].day,
                    teacherName: _data.teacherName,
                    subjectName: _data.subjectName,
                    time: _data.dayList[index].time,
                    status: status,
                    code: _data.dayList[index].day.code.toString() + Math.random().toString(16).slice(6),
                  });
                }
                if (site.getDate(start) == site.getDate(end)) {
                  break;
                }
              }

              if (doc) {
                dayList = dayList.concat(doc.dayList);
                doc.dayList = dayList;
                app.update(doc, (err, result) => {
                  if (!err && result) {
                    response.done = true;
                    response.doc = result.doc;
                  } else {
                    response.error = err.mesage;
                  }
                  res.json(response);
                });
              } else {
                let obj = {
                  host: site.getHostFilter(req.host),
                  studentId: _data.studentId,
                  dayList: dayList,
                };
                app.add(obj, (err, doc) => {
                  if (!err && doc) {
                    response.done = true;
                    response.doc = doc;
                  } else {
                    response.error = err.mesage;
                  }
                  res.json(response);
                });
              }
            } else {
              response.error = err?.message || "Not Exists";
              res.json(response);
            }
          });
        }
      );

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

          app.update(_data, (err, result) => {
            if (!err) {
              response.done = true;
              response.result = result;
            } else {
              response.error = err.message;
            }
            res.json(response);
          });
        }
      );

      site.post(
        {
          name: `/api/${app.name}/updateDay`,
          require: { permissions: ["login"] },
        },
        (req, res) => {
          let response = {
            done: false,
          };

          let studentId = req.data.studentId;
          let item = req.data.item;
          let type = req.data.type;
          app.$collection.find({ studentId }, (err, doc) => {
            if (doc) {
              let index = doc.dayList.findIndex((itm) => itm.code === item.code);
              if (type == "change") {
                if (index !== -1) {
                  doc.dayList[index] = item;
                }
              } else if (type == "delete") {
                if (index !== -1) {
                  doc.dayList.splice(index, 1);
                }
              }
              app.update(doc, (err, result) => {
                if (!err) {
                  response.done = true;
                  // response.result = result;
                } else {
                  response.error = err.message;
                }
                res.json(response);
              });
            } else {
              response.error = err?.message || "NotFound";
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

          app.delete(_data, (err, result) => {
            if (!err && result.count === 1) {
              response.done = true;
              response.result = result;
            } else {
              response.error = err?.message || "Deleted Not Exists";
            }
            res.json(response);
          });
        }
      );
    }

    if (app.allowRouteView) {
      site.post({ name: `/api/${app.name}/view`, require: { permissions: ["login"] } }, (req, res) => {
        let response = {
          done: false,
        };

        let studentId = req.data.studentId;
        let where = req.data.where || {};
        let today = site.getDate();
        let tomorrow = site.getDate();
        tomorrow.setDate(tomorrow.getDate() + 1);

        app.$collection.find({ studentId }, (err, doc) => {
          if (!err) {
            if (doc) {
              let dayList = [];
              doc.dayList = doc.dayList.filter((m) => !where.names || (where.names && (m.teacherName.contains(where.names) || m.subjectName.contains(where.names))));
              for (let i = 0; i < doc.dayList.length; i++) {
                if (
                  ((!where.today ||
                    (where.today &&
                      site.getDate(doc.dayList[i].date).getDate() == today.getDate() &&
                      site.getDate(doc.dayList[i].date).getDate() == today.getDate() &&
                      site.getDate(doc.dayList[i].date).getFullYear() == today.getFullYear())) &&
                    !where.tomorrow) ||
                  (where.tomorrow &&
                    site.getDate(doc.dayList[i].date).getDate() == tomorrow.getDate() &&
                    site.getDate(doc.dayList[i].date).getDate() == tomorrow.getDate() &&
                    site.getDate(doc.dayList[i].date).getFullYear() == tomorrow.getFullYear())
                ) {
                  dayList.push(doc.dayList[i]);
                }
              }

              doc.dayList = dayList;
            }

            response.done = true;
            response.doc = doc || {};
          } else {
            response.error = err?.message || "Not Exists";
          }
          res.json(response);
        });
      });
    }

    if (app.allowRouteAll) {
      site.post({ name: `/api/${app.name}/all`, public: true }, (req, res) => {
        let where = req.body.where || {};
        let select = req.body.select || { id: 1, name: 1, image: 1, active: 1 };
        let list = [];
        let teacherId = site.getTeacherSetting(req);
        let host = site.getHostFilter(req.host);
        let setting = site.getSiteSetting(req.host);

        app.memoryList.forEach((doc) => {
          let obj = { ...doc };
          if ((!where.active || doc.active) && ((doc.teacherId === teacherId && !setting.isShared) || (doc.host == host))) {
            list.push(obj);
          }

          for (const p in obj) {
            if (!Object.hasOwnProperty.call(select, p)) {
              delete obj[p];
            }
          }
        });
        res.json({
          done: true,
          list: list,
        });
      });
    }
  }

  app.init();
  site.addApp(app);
};
