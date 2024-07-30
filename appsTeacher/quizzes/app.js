module.exports = function init(site) {
  let app = {
    name: "quizzes",
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
          res.render(
            app.name + "/index.html",
            {
              title: app.name,
              appName: req.word("Quizzes"),
              setting: site.getSiteSetting(req.host),
            },
            { parser: "html", compres: true }
          );
        }
      );
    }

    if (app.allowRouteAdd) {
      site.post({ name: `/api/${app.name}/add`, require: { permissions: ["login"] } }, (req, res) => {
        let response = {
          done: false,
        };

        let _data = req.data;

        _data.user = {
          id: req.session.user.id,
          firstName: req.session.user.firstName,
          email: req.session.user.email,
        };
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
            response.done = true;
            response.doc = doc;
          } else {
            response.error = err.mesage;
          }
          res.json(response);
        });
      });

      site.post(
        {
          name: `/api/${app.name}/startQuiz`,
          require: { permissions: ["student"] },
        },
        (req, res) => {
          let response = {
            done: false,
          };

          let where = req.data.where;
          site.getLecture({ id: req.data.lectureId }, (err, lecture) => {
            app.$collection.find(where, (err, doc) => {
              if (err) {
                response.error = err?.message || "Not Exists";
                res.json(response);
              } else if (doc) {
                if (doc.timesEnterQuiz >= lecture.timesEnterQuiz) {
                  response.error = "The number of times the quiz has been entered has been exceeded.";
                  res.json(response);
                  return;
                }
                let quiz = { ...doc };
                response.done = true;
                quiz.questionsList = quiz.questionsList || [];
                for (let i = 0; i < quiz.questionsList.length; i++) {
                  quiz.questionsList[i].answersList.forEach((_a) => {
                    _a.userAnswer = false;
                  });
                }
                doc.timesEnterQuiz += 1;

                app.$collection.update(doc, (err, result) => {
                  for (let i = 0; i < quiz.questionsList.length; i++) {
                    quiz.questionsList[i].answersList.forEach((_a) => {
                      delete _a.correct;
                    });
                  }
                  response.doc = quiz;
                  res.json(response);
                });
              } else if (!doc) {
                app.add(
                  {
                    host: site.getHostFilter(req.host),
                    teacherId: site.getTeacherSetting(req),
                    user: {
                      _id: req.session.user._id,
                      id: req.session.user.id,
                      firstName: req.session.user.firstName,
                      email: req.session.user.email,
                    },
                    lecture: { _id: lecture._id.toString(), id: lecture.id, name: lecture.name, educationalLevel: lecture.educationalLevel, schoolYear: lecture.schoolYear },
                    questionsList: lecture.questionsList,
                    correctAnswers: 0,
                    userDegree: 0,
                    date: new Date(),
                    timesEnterQuiz: 1,
                  },
                  (err, doc) => {
                    if (!err && doc) {
                      let _doc = { ...doc };
                      response.done = true;
                      _doc.questionsList = _doc.questionsList || [];
                      _doc.questionsList.forEach((_q) => {
                        _q.answersList = _q.answersList || [];
                        _q.answersList.forEach((_a) => {
                          delete _a.correct;
                        });
                      });
                      response.doc = _doc;
                    } else {
                      response.error = err.mesage;
                    }
                    res.json(response);
                  }
                );
              }
            });
          });
        }
      );
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
          name: `/api/${app.name}/finishQuiz`,
          require: { permissions: ["login"] },
        },
        (req, res) => {
          let response = {
            done: false,
          };

          let _data = req.data;
          app.view({ id: _data.id }, (err, doc) => {
            doc.correctAnswers = 0;
            doc.editDate = new Date();
            for (let i = 0; i < doc.questionsList.length; i++) {
              let question = _data.questionsList.find((_q) => _q.numbering == doc.questionsList[i].numbering);
              doc.questionsList[i].answersList.forEach((_a) => {
                let answer = question.answersList.find((_q) => _q.numbering == _a.numbering);
                _a.userAnswer = answer.userAnswer;
                if (_a.userAnswer && _a.correct) {
                  doc.correctAnswers += 1;
                }
              });
            }
            doc.userDegree = (doc.correctAnswers / doc.questionsList.length) * 100;
            doc.timesEnterQuiz = doc.timesEnterQuiz;
            app.update(doc, (err, result) => {
              if (!err) {
                response.done = true;
                let _doc = { ...result.doc };
                for (let i = 0; i < _doc.questionsList.length; i++) {
                  _doc.questionsList[i].answersList.forEach((_a) => {
                    delete _a.correct;
                  });
                }
                response.doc = _doc;
              } else {
                response.error = err.message;
              }
              res.json(response);
            });
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

      site.post({ name: `/api/${app.name}/viewByUserLecture`, require: { permissions: ["login"] } }, (req, res) => {
        let response = {
          done: false,
        };

        let where = req.data;
        app.$collection.find(where, (err, doc) => {
          if (!err && doc) {
            response.done = true;
            let _doc = { ...doc };
            _doc.questionsList = _doc.questionsList || [];
            _doc.questionsList.forEach((_q) => {
              _q.answersList = _q.answersList || [];
              _q.answersList.forEach((_a) => {
                delete _a.correct;
              });
            });
            _doc.userDegree = site.toNumber(_doc.userDegree);
            response.doc = _doc;
          } else {
            response.error = err?.message || "Not Exists";
          }
          res.json(response);
        });
      });
    }

    if (app.allowRouteAll) {
      site.post({ name: `/api/${app.name}/all`, require: { permissions: ["teacher"] } }, (req, res) => {
        let where = req.body.where || {};
        let search = req.body.search || "";
        let limit = req.body.limit || 50;
        let select = req.body.select || {
          id: 1,
          lecture: 1,
          user: 1,
          userDegree: 1,
        };
        if (where && where.fromDate && where.toDate) {
          let d1 = site.toDate(where.fromDate);
          let d2 = site.toDate(where.toDate);
          d2.setDate(d2.getDate() + 1);
          where.date = {
            $gte: d1,
            $lte: d2,
          };
          delete where.fromDate;
          delete where.toDate;
        }

        if (search) {
          where.$or = [];

          where.$or.push({
            number: search,
          });
        }
        if (where["user"]) {
          where["user.id"] = where["user"].id;
          delete where["user"];
        }
        if (where["lecture"]) {
          where["lecture.id"] = where["lecture"].id;
          delete where["lecture"];
        }
        if ((teacherId = site.getTeacherSetting(req))) {
          where["teacherId"] = teacherId;
        } else {
          where["host"] = site.getHostFilter(req.host);
        }

        app.all({ where: where, limit, select, sort: { id: -1 } }, (err, docs) => {
          res.json({ done: true, list: docs });
        });
      });
    }
  }

  site.getQuizzesToStudent = function (req, callBack) {
    callBack = callBack || function () {};

    let where = {};
    site.security.getUser({ _id: req.body.studentId }, (err, user) => {
      if (!err) {
        if (user) {
          where["user.id"] = user.id;
          app.$collection.findMany({ where }, (err, docs) => {
            callBack(err, docs);
          });
        } else {
          callBack(err, null);
          return;
        }
      } else {
        callBack(err, null);
        return;
      }
    });
  };

  app.init();
  site.addApp(app);
};
