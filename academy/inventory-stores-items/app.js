module.exports = function init(site) {
  const $stores_items = site.connectCollection("stores_items")
 

  $stores_items.busy4 = false

  site.on('[eng_item_debt][stores_items][+]', obj => {

    if ($stores_items.busy4) {
      setTimeout(() => {
        site.call('[eng_item_debt][stores_items][+]', Object.assign({}, obj))
      }, 200);
      return
    }
    $stores_items.busy4 = true
    $stores_items.find({
      name: obj.name,
    }, (err, doc) => {
      if (!err && doc) {
        let exist = false
        doc.sizes.forEach(s => {
          if (s.size == obj.size && s.vendor.id == obj.vendor.id && s.store.id == obj.store.id) {
            s.current_count = site.toNumber(s.current_count) + site.toNumber(obj.count)
            exist = true
          }
        })

        if (!exist) {
          obj.current_count = 1

          doc.sizes.push(obj)
        }
        $stores_items.update(doc, () => {
          $stores_items.busy4 = false
        })

      }

    })
  })

  site.on('[eng_item_list][stores_items][-]', obj => {


    $stores_items.find({
      name: obj.name,
    }, (err, doc) => {
      if (!err && doc) {
        let exist = false
        doc.sizes.forEach(s => {
          if (s.size == obj.size && s.store.id == obj.store.id && s.vendor.id == obj.vendor.id) {
            s.current_count = site.toNumber(s.current_count) + 1
            exist = true

          }
        })
        $stores_items.update(doc)

      }

    })
  })

  $stores_items.busy3 = false

  site.on('[eng_item_list][stores_items][+]', obj => {
    if ($stores_items.busy3) {
      setTimeout(() => {
        site.call('[eng_item_list][stores_items][+]', Object.assign({}, obj))
      }, 200);
      return
    }
    $stores_items.busy3 = true
    $stores_items.find({
      name: obj.name,
    }, (err, doc) => {
      if (!err && doc) {

        doc.sizes.forEach(s => {
          if (s.size == obj.size && s.vendor.id == obj.vendor.id && s.store.id == obj.store.id && doc.name == obj.name) {

            s.current_count = site.toNumber(s.current_count) - 1
            $stores_items.update(doc, (err) => {
              if (!err) {
                $stores_items.busy3 = false
              }
            })


          }
        })
      }

    })

  })

  $stores_items.busy2 = false
  site.on('[stores_in][stores_items][+]', obj => {

    if ($stores_items.busy2) {
      setTimeout(() => {
        site.call('[stores_in][stores_items][+]', Object.assign({}, obj))
      }, 200);
      return
    }

    $stores_items.busy2 = true
    $stores_items.find({
      name: obj.name
    }, (err, doc) => {

      if (!err && doc) {
        let exist = false
        doc.sizes.forEach(s => {

          if (s.size == obj.item.size && s.vendor.id == obj.vendor.id && s.store.id == obj.store.id) {
            s.current_count = site.toNumber(s.current_count) + site.toNumber(obj.item.count)
            exist = true
          }
        })

        if (!exist) {
          delete obj.item.current_count
          obj.item.current_count = obj.item.count
          doc.sizes.push(obj.item)
        }

        $stores_items.update(doc, () => {
          $stores_items.busy2 = false
        })

      } else {
        obj.sizes = []
        delete obj.item.current_count
        obj.item.current_count = obj.item.count
        obj.sizes.push(obj.item)
        delete obj.item
        $stores_items.add(obj, (err, doc) => {
          $stores_items.busy2 = false
        })
      }

    })
  })

  $stores_items.busy5 = false
  site.on('[stores_transfer][stores_items]', obj => {

    if ($stores_items.busy5) {
      setTimeout(() => {
        site.call('[stores_transfer][stores_items]', Object.assign({}, obj))
      }, 200);
      return
    }

    $stores_items.busy5 = true
    $stores_items.find({
      name: obj.name
    }, (err, doc) => {

      if (!err && doc) {
        let exist = false
        doc.sizes.forEach(s => {

          if (s.size == obj.item.size && s.vendor.id == obj.vendor.id && s.store.id == obj.store.id) {
            s.current_count = site.toNumber(s.current_count) + site.toNumber(obj.item.count)

            exist = true
          }
        })

        if (!exist) {
          delete obj.item.current_count
          obj.item.current_count = obj.item.count
          doc.sizes.push(obj.item)
        }


        $stores_items.update(doc, () => {
          $stores_items.busy5 = false
        })



      } else {
        obj.sizes = []
        delete obj.item.current_count
        obj.item.current_count = obj.item.count
        obj.sizes.push(obj.item)
        delete obj.item
        $stores_items.add(obj, (err, doc) => {
          $stores_items.busy5 = false
        })
      }

    })
  })

  site.on('[stores_in][stores_items][-]', obj => {


    $stores_items.find({
      name: obj.item.name
    }, (err, doc) => {
      if (!err && doc) {
        let exist = false
        doc.sizes.forEach(s => {
          if (s.size == obj.item.size && s.vendor.id == obj.vendor.id && s.store.id == obj.store.id) {
            s.current_count = site.toNumber(s.current_count) - site.toNumber(obj.item.count)
            exist = true

          }

        })

        $stores_items.update(doc)

      }

    })
  })
  site.on('[stores_out][stores_items][+]', obj => {

    $stores_items.find({
      name: obj.name,
    }, (err, doc) => {
      if (!err && doc) {
        let exist = false
        doc.sizes.forEach(s => {
          if (s && s.size == obj.item.size && s.vendor.id == obj.vendor.id && s.store.id == obj.store.id) {
            s.current_count = site.toNumber(s.current_count) - site.toNumber(obj.item.count)
            exist = true

          }
        })
        $stores_items.update(doc)

      }

    })
  })

  site.on('[stores_transfer][stores_items][+]', obj => {
    if ($stores_items.busy5) {
      setTimeout(() => {
        site.call('[stores_transfer][stores_items][+]', Object.assign({}, obj))
      }, 200);
      return
    }
    $stores_items.busy5 = true
    $stores_items.find({
      name: obj.name,
    }, (err, doc) => {
      if (!err && doc) {
        let exist = false
        doc.sizes.forEach(s => {
          if (s && s.size == obj.item.size && s.vendor.id == obj.vendor.id && s.store.id == obj.store.id) {
            s.current_count = site.toNumber(s.current_count) - site.toNumber(obj.item.count)
            exist = true
          }
        })

        if (exist == true) {
          $stores_items.update(doc, (err, docs) => {
            if (!err) {
              $stores_items.busy5 = false
            }
          })
        }


      }

    })
  })

  site.on('[stores_out][stores_items][-]', obj => {


    $stores_items.find({
      name: obj.item.name
    }, (err, doc) => {
      if (!err && doc) {
        let exist = false
        doc.sizes.forEach(s => {
          if (s.size == obj.item.size && s.vendor.id == obj.vendor.id && s.store.id == obj.store.id) {
            s.current_count = site.toNumber(s.current_count) + site.toNumber(obj.item.count)
            exist = true

          }

        })

        $stores_items.update(doc)

      }

    })
  })
  site.get({
    name: "stores_items",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })
  site.post("/api/stores_items/add", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      res.json(response)
      return
    }

    let stores_items_doc = req.body
    stores_items_doc.$req = req
    stores_items_doc.$res = res

    stores_items_doc.academy = site.get_company(req)
    stores_items_doc.branch = site.get_branch(req)

    stores_items_doc._created = site.security.getUserFinger({
      $req: req,
      $res: res
    })


    if (stores_items_doc.sizes) {


    }
    $stores_items.add(stores_items_doc, (err, doc) => {
      if (!err) {
        let stores_items_doc = doc
        stores_items_doc.sizes.forEach(itm => {
          itm.name = stores_items_doc.name
          itm.cost = site.toNumber(itm.cost)
          itm.total = site.toNumber(itm.total)

          itm.price = site.toNumber(itm.price)
          itm.count = site.toNumber(itm.current_count)
          itm.current_count = site.toNumber(itm.current_count)
          itm.store = itm.store
          itm.vendor = itm.vendor
          itm.date = stores_items_doc.date
          itm.transaction_type = 'in'
          itm.current_status = 'newitem'
          site.call('please track item', itm)
          site.call('[stores_items][store_in]', itm)
        })
        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })
  site.post("/api/stores_items/update", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
    }
    let stores_items_doc = req.body

    stores_items_doc._updated = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    stores_items_doc.sizes.forEach(itm => {
      itm.cost = site.toNumber(itm.cost)
      itm.price = site.toNumber(itm.price)
      itm.current_count = site.toNumber(itm.current_count)
    })

    if (stores_items_doc._id) {
      $stores_items.edit({
        where: {
          _id: stores_items_doc._id
        },
        set: stores_items_doc,
        $req: req,
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
  site.post("/api/stores_items/delete", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let _id = req.body._id
    if (_id) {


      $stores_items.delete({
        _id: $stores_items.ObjectID(_id),
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {

          let stores_items_doc = result.doc
          stores_items_doc.sizes.forEach(itm => {
            itm.name = stores_items_doc.name
            itm.cost = site.toNumber(itm.cost)
            itm.price = site.toNumber(itm.price)
            itm.count = site.toNumber(itm.current_count)
            itm.store = itm.store
            itm.vendor = itm.vendor
            itm.date = stores_items_doc.date
            itm.transaction_type = 'out'
            site.call('please out item', itm)
            site.call('[stores_items][store_out]', itm)

          })
          response.done = true
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/stores_items/view", (req, res) => {
    let response = {}
    response.done = false
    $stores_items.findOne({
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
  site.post("/api/stores_items/all", (req, res) => {

    let response = {}
    let where = req.body.where || {}
    let data = {};


    where['academy.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code


    if (where && where['name']) {
      where['name'] = new RegExp(where['name'], 'i')
    }
    if (where && where['sizes.size']) {
      where['sizes.size'] = new RegExp(where['sizes.size'], 'i')
    }



    if (where && where.price) {
      data.price = where.price
      where['sizes.price'] = parseFloat(where.price)

      delete where.price
    }

    if (where && where.cost) {
      data.cost = where.cost
      where['sizes.cost'] = parseFloat(where.cost)

      delete where.cost
    }

    if (where && where.current_countLt && where.current_countGt) {
      data.current_countLt = site.toNumber(where.current_countLt)
      data.current_countGt = site.toNumber(where.current_countGt)
      where['sizes.current_count'] = {
        $lte: where.current_countLt,
        $gte: where.current_countGt
      }

      delete where.current_countLt
      delete where.current_countGt
    }


    if (where && where.current_countGt && !where.current_countLt) {
      data.current_countGt = site.toNumber(where.current_countGt)
      where['sizes.current_count'] = {
        $gte: where.current_countGt
      }

      delete where.current_countGt
    }

    if (where && where.current_count) {
      data.current_count = site.toNumber(where.current_count)
      where['sizes.current_count'] = where.current_count

      delete where.current_count
    }

    if (where && where.current_countLt && !where.current_countGt) {
      data.current_countLt = site.toNumber(where.current_countLt)
      where['sizes.current_count'] = {
        $lte: where.current_countLt
      }

      delete where.current_countLt
    }


    if (where && where.store) {
      data.store = where.store
      where['sizes.store.id'] = where.store.id

      delete where.store
    }
    if (where && where.vendor) {
      data.vendor = where.vendor
      where['sizes.vendor.id'] = where.vendor.id

      delete where.vendor
    }



    // if (where && where.store) {
    //   st =where.store
    //   console.log('sizes')
    //   where['sizes'] = {
    //     $all: [ {  "$elemMatch" : {
    //       'store.id': st.id }
    //     }]
    //   }
    //   delete where.store
    // }




    response.done = false
    $stores_items.findMany({
      select: req.body.select,
      limit: req.body.limit,
      where: where,
      sort: {
        id: -1
      }

    }, (err, docs, count) => {
      if (!err) {
        response.done = true

        if (data.vendor && data.vendor.id) {
          docs.forEach(doc => {
            doc.sizes.forEach((co, i) => {
              if (co.vendor.id !== data.vendor.id) {

                doc.sizes.splice(i, 1)
              }
            })
            doc.sizes.forEach((co, i) => {
              if (co.vendor.id !== data.vendor.id) {

                doc.sizes.splice(i, 1)
              }
            })
          })
        }


        if (data.store && data.store.id) {
          docs.forEach((doc, index) => {
            docs.forEach(doc => {
              doc.sizes.forEach((st, i) => {
                if (st.store.id !== data.store.id) {

                  doc.sizes.splice(i, 1)
                }
              })
              doc.sizes.forEach((st, i) => {
                if (st.store.id !== data.store.id) {

                  doc.sizes.splice(i, 1)
                }
              })
            })

            if (doc.sizes.length === 0) {
              docs.splice(index, 1)
            }
          })

        }


        if (data.size) {
          docs.forEach(doc => {
            doc.sizes.forEach((s, i) => {
              if (s.size !== data.size) {
                doc.sizes.splice(i, 1)
              }
            })
            doc.sizes.forEach((s, i) => {
              if (s.size !== data.size) {
                doc.sizes.splice(i, 1)
              }
            })
          })
        }

        if (data.price) {
          docs.forEach(doc => {
            doc.sizes.forEach((p, i) => {
              if (p.price !== data.price) {
                doc.sizes.splice(i, 1)
              }
            })
            doc.sizes.forEach((p, i) => {
              if (p.price !== data.price) {
                doc.sizes.splice(i, 1)
              }
            })
          })
        }

        if (data.cost) {
          docs.forEach(doc => {
            doc.sizes.forEach((c, i) => {
              if (c.cost !== data.cost) {
                doc.sizes.splice(i, 1)
              }
            })
            doc.sizes.forEach((c, i) => {
              if (c.cost !== data.cost) {
                doc.sizes.splice(i, 1)
              }
            })
          })
        }

        if (data.current_count) {
          docs.forEach(doc => {
            doc.sizes.forEach((c, i) => {
              if (c.current_count < data.current_count) {
                doc.sizes.splice(i, 1)
              }
            })
            doc.sizes.forEach((c, i) => {
              if (c.current_count !== data.current_count) {
                doc.sizes.splice(i, 1)
              }
            })
          })
        }

        if (data.current_countGt && !data.current_countLt) {
          docs.forEach(doc => {
            doc.sizes.forEach((c, i) => {
              if (c.current_count < data.current_countGt) {
                doc.sizes.splice(i, 1)
              }
            })
            doc.sizes.forEach((c, i) => {
              if (c.current_count < data.current_countGt) {
                doc.sizes.splice(i, 1)
              }
            })
          })
        }

        if (data.current_countLt && !data.current_countGt) {
          docs.forEach(doc => {
            doc.sizes.forEach((c, i) => {
              if (c.current_count > data.current_countLt) {
                doc.sizes.splice(i, 1)
              }
            })
            doc.sizes.forEach((c, i) => {
              if (c.current_count > data.current_countLt) {
                doc.sizes.splice(i, 1)
              }
            })
          })
        }

        if (data.current_countLt && data.current_countGt) {
          docs.forEach((doc, index) => {
            doc.sizes.forEach((c, i) => {
              if (c.current_count > data.current_countLt || c.current_count < data.current_countGt) {
                doc.sizes.splice(i, 1)
              }
            })
            doc.sizes.forEach((c, i) => {
              if (c.current_count > data.current_countLt || c.current_count < data.current_countGt) {
                doc.sizes.splice(i, 1)
              }
            })

            if (doc.sizes.length === 0) {
              docs.splice(index, 1)
            }


          })
        }


        response.list = docs
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}