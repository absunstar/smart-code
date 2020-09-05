module.exports = function init(site) {
  const $tasks = site.connectCollection("tasks")



  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "tasks",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post({
    name: "/api/task_status/all",
    path: __dirname + "/site_files/json/task_status.json"
  })

  site.post({
    name: "/api/task_type/all",
    path: __dirname + "/site_files/json/task_type.json"
  })

  site.post("/api/tasks/add", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tasks_doc = req.body
    tasks_doc.$req = req
    tasks_doc.$res = res

    tasks_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    $tasks.add(tasks_doc, (err, doc) => {
      if (!err) {
        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/tasks/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tasks_doc = req.body

    tasks_doc.update_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (tasks_doc.id) {
      $tasks.edit({
        where: {
          id: tasks_doc.id
        },
        set: tasks_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/tasks/assign", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tasks_doc = req.body

    tasks_doc.assign_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (tasks_doc.id) {
      $tasks.edit({
        where: {
          id: tasks_doc.id
        },
        set: tasks_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true

          let exist = false
          tasks_doc.developers_tracking_list.forEach(dev => {

            if (dev.id == tasks_doc.developer.id) {
              exist = true
              dev.operations_list.push({
                status: {
                  id: 2,
                  name: "assigned",
                  ar: "موزعة",
                  en: "Assigned"
                },
                date: new Date()
              })
            }
          });

          if (!exist) {
            tasks_doc.developers_tracking_list.push({
              name: tasks_doc.developer,
              operations_list: [{
                status: {
                  id: 2,
                  name: "assigned",
                  ar: "موزعة",
                  en: "Assigned"
                },
                date: new Date()
              }]
            })
          }

          $tasks.update({
            where: {
              id: tasks_doc.id
            },
            set: tasks_doc
          }, (err) => {

          });


        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/tasks/accept_task", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tasks_doc = req.body

    tasks_doc.accept_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    tasks_doc.status = {
      id: 5,
      name: "pending",
      ar: "جاري التنفيذ",
      en: "Pending"
    }

    tasks_doc.percent = 25;
    tasks_doc.developer = {
      id: req.session.user.developer_id,
      logo: req.session.user.profile.images_url,
      name: req.session.user.profile.name

    }

    if (tasks_doc.id) {
      $tasks.edit({
        where: {
          id: tasks_doc.id
        },
        set: tasks_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/tasks/refuse_task", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tasks_doc = req.body

    tasks_doc.refuse_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    tasks_doc.status = {
      id: 3,
      name: "refused",
      ar: "مرفوضة",
      en: "Refused"
    }



    tasks_doc.percent = 0;
    tasks_doc.developer = {
      id: req.session.user.developer_id,
      logo: req.session.user.profile.images_url,
      name: req.session.user.profile.name
    }
    if (tasks_doc.id) {
      $tasks.edit({
        where: {
          id: tasks_doc.id
        },
        set: tasks_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true

          let exist = false
          tasks_doc.developers_tracking_list.forEach(dev => {
            if (dev.id == tasks_doc.developer.id) {
              exist = true
              dev.operations_list.push({
                status: {
                  id: 3,
                  name: "refused",
                  ar: "مرفوضة",
                  en: "Fefused"
                },
                date: new Date()
              })
            }
          });

          if (!exist) {
            tasks_doc.developers_tracking_list.push({
              name: tasks_doc.developer,
              operations_list: [{
                status: {
                  id: 3,
                  name: "refused",
                  ar: "مرفوضة",
                  en: "Fefused"
                },
                date: new Date()
              }]
            })
          }


          site.changePoints({
            id: tasks_doc.developer.id,
            p: tasks_doc.cancel_points,
            task: tasks_doc,
            status: {
              id: 3,
              name: "refused",
              ar: "مرفوضة",
              en: "Fefused"
            }
          });



          $tasks.update({
            where: {
              id: tasks_doc.id
            },
            set: tasks_doc
          }, (err) => {

          });
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/tasks/cancel_task", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tasks_doc = req.body

    tasks_doc.cancel_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })


    tasks_doc.percent = 0;
    tasks_doc.status = {
      id: 10,
      name: "canceled",
      ar: "ملغية",
      en: "canceled"
    }

    tasks_doc.developer = {
      id: req.session.user.developer_id,
      logo: req.session.user.profile.images_url,
      name: req.session.user.profile.name
    }
    if (tasks_doc.id) {
      $tasks.edit({
        where: {
          id: tasks_doc.id
        },
        set: tasks_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true

          let exist = false
          tasks_doc.developers_tracking_list.forEach(dev => {
            if (dev.id == tasks_doc.developer.id) {
              exist = true
              dev.operations_list.push({
                status: {
                  id: 10,
                  name: "canceled",
                  ar: "ملغية",
                  en: "Canceled"
                },
                date: new Date()
              })
            }
          });

          if (!exist) {
            tasks_doc.developers_tracking_list.push({

              name: tasks_doc.developer,
              operations_list: [{
                status: {
                  id: 10,
                  name: "canceled",
                  ar: "ملغية",
                  en: "Canceled"
                },
                date: new Date()
              }]
            })
          }

          $tasks.update({
            where: {
              id: tasks_doc.id
            },
            set: tasks_doc
          }, (err) => {

          });

        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/tasks/done_task", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tasks_doc = req.body

    tasks_doc.done_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })


    tasks_doc.percent = 50;
    tasks_doc.status = {
      id: 6,
      name: "pending_review",
      ar: "جاري المراجعة",
      en: "Pending Review"
    }

    tasks_doc.developer = {
      id: req.session.user.developer_id,
      logo: req.session.user.profile.images_url,
      name: req.session.user.profile.name
    }
    if (tasks_doc.id) {
      $tasks.edit({
        where: {
          id: tasks_doc.id
        },
        set: tasks_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true

          let exist = false
          tasks_doc.developers_tracking_list.forEach(dev => {
            if (dev.id == tasks_doc.developer.id) {
              exist = true
              dev.operations_list.push({
                status: {
                  id: 6,
                  name: "pending_review",
                  ar: "جاري المراجعة",
                  en: "Pending Review"
                },
                date: new Date()
              })
            }
          });

          if (!exist) {
            tasks_doc.developers_tracking_list.push({

              name: tasks_doc.developer,
              operations_list: [{
                status: {
                  id: 6,
                  name: "pending_review",
                  ar: "جاري المراجعة",
                  en: "Pending Review"
                },
                date: new Date()
              }]
            })
          }

          $tasks.update({
            where: {
              id: tasks_doc.id
            },
            set: tasks_doc
          }, (err) => {

          });

        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/tasks/review_task", (req, res) => {
    let response = {
      done: false
    }



    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tasks_doc = req.body

    tasks_doc.review_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    tasks_doc.status = {
      id: 7,
      name: "pending_test",
      ar: "جاري التجربة",
      en: "Pending Test"
    }

    tasks_doc.percent = 60;


    if (tasks_doc.id) {
      $tasks.edit({
        where: {
          id: tasks_doc.id
        },
        set: tasks_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true

          let exist = false
          tasks_doc.developers_tracking_list.forEach(dev => {
            if (dev.id == tasks_doc.developer.id) {
              exist = true
              dev.operations_list.push({
                status: {
                  id: 7,
                  name: "pending_test",
                  ar: "جاري التجربة",
                  en: "Pending Test"
                },
                date: new Date()
              })
            }
          });

          if (!exist) {
            tasks_doc.developers_tracking_list.push({

              name: tasks_doc.developer,
              operations_list: [{
                status: {
                  id: 7,
                  name: "pending_test",
                  ar: "جاري التجربة",
                  en: "Pending Test"
                },
                date: new Date()
              }]
            })
          }

          $tasks.update({
            where: {
              id: tasks_doc.id
            },
            set: tasks_doc
          }, (err) => {

          });
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/tasks/test_task", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tasks_doc = req.body

    tasks_doc.test_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    tasks_doc.status = {
      id: 8,
      name: "tested",
      ar: "تم تجربتها",
      en: "Tested"
    }

    tasks_doc.percent = 75;
    tasks_doc.developer = {
      id: req.session.user.developer_id,
      logo: req.session.user.profile.images_url,
      name: req.session.user.profile.name
    }
    if (tasks_doc.id) {
      $tasks.edit({
        where: {
          id: tasks_doc.id
        },
        set: tasks_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true

          let exist = false
          tasks_doc.developers_tracking_list.forEach(dev => {
            if (dev.id == tasks_doc.developer.id) {
              exist = true
              dev.operations_list.push({
                status: {
                  id: 8,
                  name: "tested",
                  ar: "تم تجربتها",
                  en: "Tested"
                },
                date: new Date()
              })
            }
          });

          if (!exist) {
            tasks_doc.developers_tracking_list.push({

              name: tasks_doc.developer,
              operations_list: [{
                status: {
                  id: 8,
                  name: "tested",
                  ar: "تم تجربتها",
                  en: "Tested"
                },
                date: new Date()
              }]
            })
          }

          $tasks.update({
            where: {
              id: tasks_doc.id
            },
            set: tasks_doc
          }, (err) => {

          });
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/tasks/complete_task", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tasks_doc = req.body

    tasks_doc.complete_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    tasks_doc.status = {
      id: 9,
      name: "completed",
      ar: "مكتملة",
      en: "Completed"
    }




    tasks_doc.percent = 100;
    tasks_doc.developer = {
      id: req.session.user.developer_id,
      logo: req.session.user.profile.images_url,
      name: req.session.user.profile.name
    }



    site.changePoints({
      id: tasks_doc.developer.id,
      p: tasks_doc.done_points,
      task: tasks_doc,
      status: {
        id: 9,
        name: "completed",
        ar: "مكتملة",
        en: "Completed"
      }
    });

    if (tasks_doc.id) {
      $tasks.edit({
        where: {
          id: tasks_doc.id
        },
        set: tasks_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/tasks/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}

    if (req.session.user && req.session.user.roles[0].name == 'developer') {
      where['developer.id'] = req.session.user.developer_id
    }

    $tasks.findOne({
      where: {
        id: req.body.id
      }
    }, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/tasks/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let id = req.body.id

    if (id) {
      $tasks.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/tasks/all", (req, res) => {
    let response = {
      done: false
    }


    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], "i");
    }

    if (req.session.user && req.session.user.roles[0].name == 'tasks_developer') {

      where['$or'] = [{ 'appointment_status.id': 1 }, { 'developers_list.name.id': req.session.user.developer_id }]

    }


    $tasks.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {},
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        response.list = docs
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })













  site.editTask = function (option, callback) {
    callback = callback || {}
    $tasks.edit({
      where: {
        id: option.doc.id
      },
      set: option.doc,
      $req: option.req,
      $res: option.res
    }, err => {


      callback(err, option.doc)
    })
  }



  site.post("/api/tasks/application_request", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tasks_doc = req.body


    let exit = false

    tasks_doc.developerList.forEach(el => {
      if (el.id == req.session.user.id) {
        exit = true
      }
    })

    if (!exit) {
      tasks_doc.developerList.push({
        id: req.session.user.id,
        logo: req.session.user.profile.images_url,
        name: req.session.user.profile.name
      })
    }


    site.editTask({ doc: tasks_doc, req: req, res: res }, (err, doc) => {
      if (!err) {
        response.done = true
        response.list = doc

      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/tasks/accept_to_task", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tasks_doc = req.body

    tasks_doc.data.developers_tracking_list[0].name = tasks_doc.user;
    tasks_doc.data.appointment_status = {
      id: 2,
      name: "done_appointment",
      en: "Done Appointment",
      ar: "تم التعين"
    }

    tasks_doc.data.status = {
      id: 5,
      name: "pending",
      ar: "جاري التنفيذ",
      en: "Pending"
    }


    site.editTask({ doc: tasks_doc.data, req: req, res: res }, (err, doc) => {
      if (!err) {
        response.done = true
        response.list = doc

      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })





}