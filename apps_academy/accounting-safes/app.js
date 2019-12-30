module.exports = function init(site) {

  const $safes = site.connectCollection("safes")

  site.on('[book_course][safes][+]', function (obj) {

    $safes.find({
      id: obj.safe.id
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance || 0
        doc.balance = site.toNumber(doc.balance) + site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result) {
            $safes.find({
              id: result.doc.id

            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'دفعة كورس لطالب'
              obj.transition_type = 'in';
              site.call('[safes][safes_payments][+]', obj)
            })
          }
        })
      }
    })
  })

  site.on('[book_hall][safes][+]', function (obj) {

    $safes.find({
      id: obj.safe.id
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance || 0
        doc.balance = site.toNumber(doc.balance) + site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'دفعة حجز قاعة'
              obj.transition_type = 'in';
              site.call('[safes][safes_payments][+]', obj)
            })
          }
        })
      }
    })
  })

  site.on('[account_course][safes][-]', function (obj) {

    $safes.find({
      id: obj.safe.id
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance || 0
        doc.balance = site.toNumber(doc.balance) - site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'دفعة حساب مدرب'
              obj.transition_type = 'out';
              site.call('[safes][safes_payments][-]', obj)
            })
          }
        })
      }
    })
  })

  site.on('[hosting][safes][+]', function (obj) {

    $safes.find({
      id: obj.safe.id
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance || 0
        doc.balance = site.toNumber(doc.balance) + site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'دفعة إستضافة'
              obj.transition_type = 'in';
              site.call('[safes][safes_payments][+]', obj)
            })
          }
        })
      }
    })
  })

  site.on('[stores_in][safes][-]', function (obj) {

    $safes.find({
      id: obj.safe.id
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance || 0
        doc.balance = site.toNumber(doc.balance) - site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'أذن توريد'
              obj.transition_type = 'out';
              site.call('[safes][safes_payments][-]', obj)
            })
          }
        })
      }
    })
  })

  site.on('[stores_in][safes][+]', function (obj) {

    $safes.find({
      id: obj.safe.id
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance || 0
        doc.balance = site.toNumber(doc.balance) + site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'أذن توريد'
              obj.transition_type = 'in';
              site.call('[safes][safes_payments][+]', obj)
            })
          }
        })
      }

    })

  })

  site.on('[stores_out][safes][+]', function (obj) {

    $safes.find({
      id: obj.safe.id,
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance || 0
        doc.balance = site.toNumber(doc.balance) + site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'أذن صرف'
              obj.transition_type = 'in';
              site.call('[safes][safes_payments][+]', obj)
            })
          }
        })
      }

    })

  })


  site.on('[stores_out][safes][-]', function (obj) {

    $safes.find({
      id: obj.safe.id,
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance
        doc.balance = site.toNumber(doc.balance) - site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'أذن صرف'
              obj.transition_type = 'out';
              site.call('[safes][safes_payments][-]', obj)
            })
          }
        })
      }

    })

  })


  site.on('[amount in][safes][+]', function (obj) {

    $safes.find({
      id: obj.safe.id,
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance
        doc.balance = site.toNumber(doc.balance) + site.toNumber(obj.value)
        doc.description = obj.description
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'وارد'
              obj.transition_type = 'in';

              site.call('[safes][safes_payments][+]', obj)

            })
          }
        })
      }
    })
  })


  site.on('[amount in][safes][-]', function (obj) {

    $safes.find({
      id: obj.safe.id,
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance
        doc.description = obj.description
        doc.balance = site.toNumber(doc.balance) - site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.balance = doc.balance
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.operation = 'وارد'
              obj.transition_type = 'out';
              site.call('[safes][safes_payments][-]', obj)

            })
          }
        })
      }

    })

  })

  site.on('[amount out][safes][+]', function (obj) {

    $safes.find({
      id: obj.safe.id,
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance
        doc.description = obj.description
        doc.balance = site.toNumber(doc.balance) + site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'منصرف'
              obj.transition_type = 'in';
              site.call('[safes][safes_payments][-]', obj)

            })
          }
        })
      }

    })

  })


  site.on('[amount out][safes][-]', function (obj) {

    $safes.find({
      id: obj.safe.id,
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance
        doc.description = obj.description
        doc.balance = site.toNumber(doc.balance) - site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'منصرف'
              obj.transition_type = 'out';
              site.call('[safes][safes_payments][+]', obj)

            })
          }
        })
      }

    })

  })

  site.on('[employee_discount][safes][+]', function (obj) {

    $safes.find({
      id: obj.safe.id,
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance
        doc.description = obj.description
        doc.balance = site.toNumber(doc.balance) + site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'employee_discont'
              obj.transition_type = 'in';
              site.call('[safes][safes_payments][+]', obj)

            })
          }
        })
      }

    })

  })

  site.on('[employee_discount][safes][-]', function (obj) {

    $safes.find({
      id: obj.safe.id,
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance
        doc.description = obj.description
        doc.balance = site.toNumber(doc.balance) - site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'employee_discont'
              obj.transition_type = 'out';
              site.call('[safes][safes_payments][-]', obj)

            })
          }
        })
      }

    })

  })


  site.on('[employee_offer][safes][-]', function (obj) {

    $safes.find({
      id: obj.safe.id,
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance
        doc.description = obj.description
        doc.balance = site.toNumber(doc.balance) + site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'employee_offer'
              obj.transition_type = 'in';
              site.call('[safes][safes_payments][+]', obj)

            })
          }
        })
      }

    })

  })

  site.on('[employee_offer][safes][+]', function (obj) {

    $safes.find({
      id: obj.safe.id,
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance
        doc.description = obj.description
        doc.balance = site.toNumber(doc.balance) - site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'employee_offer'
              obj.transition_type = 'out';
              site.call('[safes][safes_payments][-]', obj)

            })
          }
        })
      }

    })

  })

  site.on('[employees_advances][safes][+]', function (obj) {

    $safes.find({
      id: obj.safe.id,
    }, (err, doc) => {
      if (!err && doc) {

        doc.pre_balance = doc.balance
        doc.description = obj.description
        doc.balance = site.toNumber(doc.balance) - site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'سلفة موظف'
              obj.transition_type = 'out';

              site.call('[safes][safes_payments][-]', obj)

            })
          }
        })
      }

    })

  })

  site.on('[employees_advances][safes][-]', function (obj) {

    $safes.find({
      id: obj.safe.id,
    }, (err, doc) => {
      if (!err && doc) {

        doc.pre_balance = doc.balance
        doc.description = obj.description
        doc.balance = site.toNumber(doc.balance) + site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'سلفة موظف'
              obj.transition_type = 'in';
              site.call('[safes][safes_payments][+]', obj)

            })
          }
        })
      }
    })
  })

  site.on('[eng_debt][safes][+]', function (obj) {

    $safes.find({
      id: obj.safe.id,
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance
        doc.description = obj.description
        doc.balance = site.toNumber(doc.balance) + site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'مديونية فني'
              obj.transition_type = 'in';
              site.call('[safes][safes_payments][+]', obj)

            })
          }
        })
      }

    })

  })

  site.on('[employees_advances_fin][safes][+]', function (obj) {

    $safes.find({
      id: obj.safe.id,
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance
        doc.description = obj.description
        doc.balance = site.toNumber(doc.balance) + site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'سداد سلفة لموظف'
              obj.transition_type = 'in';
              site.call('[safes][safes_payments][+]', obj)

            })
          }
        })
      }

    })

  })

  site.on('[employee_report][safes]', function (obj) {

    $safes.find({
      id: obj.safe.id,
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance
        doc.description = obj.description
        doc.balance = site.toNumber(doc.balance) - site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'مرتب موظف'
              obj.transition_type = 'out';
              site.call('[safes][safes_payments][-]', obj)

            })
          }
        })
      }

    })

  })

  site.on('[engineers_report][safes]', function (obj) {

    $safes.find({
      id: obj.safe.id,
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance
        doc.description = obj.description
        doc.balance = site.toNumber(doc.balance) - site.toNumber(obj.value)
        $safes.update(doc, (err, result) => {
          if (!err && result.ok) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.academy = doc.academy
              obj.branch = doc.branch
              obj.balance = doc.balance
              obj.operation = 'مرتب فني'
              obj.transition_type = 'out';

              site.call('[safes][safes_payments][-]', obj)

            })
          }
        })
      }

    })

  })

  $safes.deleteDuplicate({
    name: 1,
    'academy.id': 1
  }, (err, result) => {
    $safes.createUnique({
      name: 1,
      'academy.id': 1

    }, (err, result) => {

    })
  })

  site.get({
    name: "safes",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.post("/api/safes/add", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    let safes_doc = req.body
    safes_doc.$req = req
    safes_doc.$res = res
    safes_doc.balance = site.toNumber(safes_doc.balance)
    safes_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    safes_doc.academy = site.get_company(req)
    safes_doc.branch = site.get_branch(req)

    $safes.add(safes_doc, (err, doc) => {
      if (!err) {

        let obj = {
          safe: doc,
          operation: 'خزينة جديدة',
          transition_type: 'in',
          pre_balance: 0,
          value: doc.balance,
          date: new Date(),
          sourceName: doc.employee.name,
          description: doc.description
        }
        site.call('[safes][safes_payments][+]', obj)
        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/safes/update", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    let safes_doc = req.body

    safes_doc.employee = site.fromJson(safes_doc.employee)
    if (safes_doc._id) {
      $safes.edit({
        where: {
          _id: safes_doc._id
        },
        set: safes_doc,
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
      res.json(response)
    }
  })

  site.post("/api/safes/delete", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let _id = req.body._id
    if (_id) {
      $safes.delete({
        _id: $safes.ObjectID(_id),
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/safes/view", (req, res) => {
    let response = {}
    response.done = false
    $safes.findOne({
      where: {
        _id: site.mongodb.ObjectID(req.body._id)
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

  site.post("/api/safes/all", (req, res) => {
    let response = {}
    response.done = false
    let where = req.body.where || {}


    if (where['name']) {
      where['name'] = new RegExp(where['name'], 'i')
    }
    if (where['description']) {
      where['description'] = new RegExp(where['description'], 'i')
    }

    where['academy.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $safes.findMany({
      select: req.body.select || {},
      sort: {
        id: -1
      },
      limit: req.body.limit,

      where: where
    }, (err, docs) => {
      if (!err) {
        response.done = true
        response.list = docs
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })








}