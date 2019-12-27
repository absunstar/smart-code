module.exports = function init(site) {
  const $stores_items = site.connectCollection("stores_items")

  $stores_items.busy1 = false
  site.on('[stores_in][stores_items][add_balance]', obj => {
    if ($stores_items.busy1) {
      setTimeout(() => {
        site.call('[stores_in][stores_items][add_balance]', Object.assign({}, obj))
      }, 200);
      return
    };
    $stores_items.busy1 = true
    $stores_items.findOne({
      name: obj.name,
      'company.id': obj.company.id,
      'branch.code': obj.branch.code
    }, (err, doc) => {
      if (!err && doc) {
        let exist = true
        doc.sizes.forEach(_size => {
          if (_size.barcode == obj.barcode) {
            if (obj.status_store_in.id == 3) _size.start_count = site.toNumber(_size.start_count) + site.toNumber(obj.count)
            _size.current_count = site.toNumber(_size.current_count) + site.toNumber(obj.count)
            _size.cost = site.toNumber(obj.cost)
            _size.price = site.toNumber(obj.price)
            exist = false
          };
        });

        if (exist) {
          obj.current_count = site.toNumber(obj.count)
          doc.sizes.push(obj)
        };

        doc.sizes.forEach(_size => {
          if (_size.barcode == obj.barcode) {

            let totalCost = obj.cost * site.toNumber(obj.count);
            _size.total_purchase_price = (_size.total_purchase_price || 0) + totalCost
            _size.total_purchase_count = (_size.total_purchase_count || 0) + site.toNumber(obj.count)
            _size.average_cost = site.toNumber(_size.total_purchase_price) / site.toNumber(_size.total_purchase_count)
            if (_size.stores_list && _size.stores_list.length > 0) {
              _size.stores_list.forEach(_store => {
                if (_store.store.id == obj.store.id) {
                  if (obj.status_store_in == 3) _store.start_count = site.toNumber(_store.start_count || 0) + site.toNumber(obj.count)
                  _store.current_count = site.toNumber(_store.current_count || 0) + site.toNumber(obj.count)
                  _store.cost = site.toNumber(obj.cost)
                  _store.price = site.toNumber(obj.price)
                  _store.total_purchase_price = (_store.total_purchase_price || 0) + totalCost
                  _store.total_purchase_count = (_store.total_purchase_count || 0) + site.toNumber(obj.count)
                  _store.average_cost = site.toNumber(_store.total_purchase_price) / site.toNumber(_store.total_purchase_count)
                }
              });

              let foundStore = _size.stores_list.some(_store => _store.store.id == obj.store.id)
              if (!foundStore)
                _size.stores_list.push({
                  store: obj.store,
                  start_count: obj.status_store_in == 3 ? site.toNumber(obj.count) : 0,
                  current_count: site.toNumber(obj.count),
                  cost: site.toNumber(obj.cost),
                  price: site.toNumber(obj.price),
                  total_purchase_price: totalCost,
                  total_purchase_count: site.toNumber(obj.count),
                  average_cost: site.toNumber(totalCost) / site.toNumber(obj.count)
                })
            } else {
              _size.stores_list = _size.stores_list || [];
              _size.stores_list.push({
                store: obj.store,
                start_count: obj.status_store_in == 3 ? site.toNumber(obj.count) : 0,
                current_count: site.toNumber(obj.count),
                cost: site.toNumber(obj.cost),
                price: site.toNumber(obj.price),
                total_purchase_price: totalCost,
                total_purchase_count: site.toNumber(obj.count),
                average_cost: site.toNumber(totalCost) / site.toNumber(obj.count)
              })
            }
          }
          if (_size.item_complex) {
            _size.complex_items.forEach(_complex_item => {
              _complex_item.count = _complex_item.count * obj.count
              site.call('[store_out][stores_items][-]', Object.assign({}, _complex_item))
            })
          }
        });
        $stores_items.update(doc, () => {
          $stores_items.busy1 = false
        });
      } else {
        let item = {
          name: obj.name,
          company: obj.company,
          sizes: [obj]
        };

        $stores_items.add(item, () => {
          $stores_items.busy1 = false

        });
      };
    });
  });

  $stores_items.busy23 = false
  site.on('[store_out][stores_items][-]', obj => {
    if ($stores_items.busy23) {
      setTimeout(() => {
        site.call('[store_out][stores_items][-]', Object.assign({}, obj))
      }, 200);
      return
    }
    $stores_items.busy23 = true
    $stores_items.find({
      'sizes.barcode': obj.barcode,
    }, (err, doc) => {
      if (!err && doc) {
        doc.sizes.forEach(_size => {
          if (_size.barcode == obj.barcode) {
            let totalCost = obj.price * site.toNumber(obj.count);
            _size.current_count = site.toNumber(_size.current_count) - site.toNumber(obj.count)
            _size.total_sell_price = (_size.total_sell_price || 0) + totalCost
            _size.total_sell_count = (_size.total_sell_count || 0) + site.toNumber(obj.count)
            _size.stores_list.forEach(_store => {
              if (_store.store.id == obj.store.id) {
                _store.current_count = site.toNumber(_store.current_count || 0) - site.toNumber(obj.count)
                _store.cost = site.toNumber(obj.cost)
                _store.price = site.toNumber(obj.price)
              }
            });
            if (_size.item_complex) {
              _size.complex_items.forEach(s2 => {
                s2.count = s2.count * obj.count
                site.call('[store_out][stores_items][-]', Object.assign({}, s2))
              })
            }
          }
        });
        $stores_items.update(doc)
        $stores_items.busy23 = false
      }
    })
  })


  balance_list = []
  site.on('[transfer_branch][stores_items][add_balance]', obj => {
    balance_list.push(Object.assign({}, obj))
  })

  function balance_handle(obj) {
    // console.log(site.toDateXF(new Date()) +  '   balance_handle ( ' + balance_list.length + ' ) ')
    if (obj == null) {
      if (balance_list.length > 0) {
        obj = balance_list[0]
        balance_handle(obj)
        balance_list.splice(0, 1)
      } else {
        setTimeout(() => {
          balance_handle(null)
        }, 1000);
      }
      return
    }

    let totalCost = obj.cost * site.toNumber(obj.count);

    let obj_branch = {
      name_ar: obj.branch.name_ar,
      code: obj.branch.code,
      start_count: obj._status == 3 ? site.toNumber(obj.count) : 0,
      current_count: site.toNumber(obj.count),
      total_buy_price: totalCost,
      total_buy_count: site.toNumber(obj.count),
      average_cost: site.toNumber(totalCost) / site.toNumber(obj.count),
      stores_list: [{
        store: obj.store,
        start_count: obj._status == 3 ? site.toNumber(obj.count) : 0,
        current_count: site.toNumber(obj.count),
        cost: site.toNumber(obj.cost),
        price: site.toNumber(obj.price),
        total_buy_price: totalCost,
        total_buy_count: site.toNumber(obj.count),
        average_cost: site.toNumber(totalCost) / site.toNumber(obj.count)
      }]
    }

    let obj_store = {
      store: obj.store,
      start_count: obj._status == 3 ? site.toNumber(obj.count) : 0,
      current_count: site.toNumber(obj.count),
      cost: site.toNumber(obj.cost),
      price: site.toNumber(obj.price),
      total_buy_price: totalCost,
      total_buy_count: site.toNumber(obj.count),
      average_cost: site.toNumber(totalCost) / site.toNumber(obj.count)
    }

    $stores_items.findOne({
      name: obj.name,
      'company.id': obj.company.id,
    }, (err, doc) => {


      if (!err && doc) {


        let exist = true

        doc.sizes.forEach(_size => {


          if (_size.barcode == obj.barcode) {
            if (obj._status == 3) {
              if (obj.type == 'sum')
                _size.start_count = site.toNumber(_size.start_count) + site.toNumber(obj.count)
              else if (obj.type == 'minus')
                _size.start_count = site.toNumber(_size.start_count) - site.toNumber(obj.count)
            }

            if (obj.type == 'sum')
              _size.current_count = site.toNumber(_size.current_count) + site.toNumber(obj.count)

            else if (obj.type == 'minus')
              _size.current_count = site.toNumber(_size.current_count) - site.toNumber(obj.count)
            _size.cost = site.toNumber(obj.cost)
            _size.price = site.toNumber(obj.price)
            exist = false
          };

        });

        if (exist) {
          if (obj._status == 3) obj.start_count = site.toNumber(obj.count)
          obj.current_count = site.toNumber(obj.count)
          doc.sizes.push(obj)
        };

        doc.sizes.forEach(_size => {
          if (_size.barcode == obj.barcode) {

            let totalPrice = obj.price * site.toNumber(obj.count);

            if (obj.type == 'sum') {
              _size.total_buy_price = (_size.total_buy_price || 0) + totalCost
              _size.total_buy_count = (_size.total_buy_count || 0) + site.toNumber(obj.count)

            } else if (obj.type == 'minus') {
              _size.total_sell_price = (_size.total_sell_price || 0) + totalPrice
              _size.total_sell_count = (_size.total_sell_count || 0) + site.toNumber(obj.count)
            }

            if (obj._status == 1)
              _size.average_cost = site.toNumber(_size.total_buy_price) / site.toNumber(_size.total_buy_count)


            if (_size.branches_list && _size.branches_list.length > 0) {

              let foundBranch = false
              let indxBranch = 0
              _size.branches_list.map((b, i) => {
                if (b.code == obj.branch.code) {
                  foundBranch = true
                  indxBranch = i
                }
              });
              let _branch = _size.branches_list[indxBranch]


              let foundStore = false
              let indxStore = 0
              _branch.stores_list.map((s, i) => {
                if (s.store.id == obj.store.id) {
                  foundStore = true
                  indxStore = i
                }
              });
              _branch._store = _branch.stores_list[indxStore]


              if (foundBranch) {

                if (obj._status == 3) {
                  if (obj.type == 'sum')
                    _branch.start_count = (_branch.start_count || 0) + site.toNumber(obj.count)
                  else if (obj.type == 'minus')
                    _branch.start_count = (_branch.start_count || 0) - site.toNumber(obj.count)
                }

                if (obj.type == 'sum') {
                  _branch.current_count = _branch.current_count + site.toNumber(obj.count)
                  _branch.total_buy_price = (_branch.total_buy_price || 0) + totalCost
                  _branch.total_buy_count = (_branch.total_buy_count || 0) + site.toNumber(obj.count)
                }

                if (obj.type == 'minus') {
                  _branch.current_count = _branch.current_count - site.toNumber(obj.count)
                  _branch.total_sell_price = (_branch.total_sell_price || 0) + totalPrice
                  _branch.total_sell_count = (_branch.total_sell_count || 0) + site.toNumber(obj.count)
                }

                if (obj._status == 1) _branch.average_cost = site.toNumber(_branch.total_buy_price) / site.toNumber(_branch.total_buy_count)

                if (_branch.stores_list && _branch.stores_list.length > 0) {

                  if (foundStore) {

                    if (obj._status == 3) {
                      if (obj.type == 'sum')
                        _branch._store.start_count = site.toNumber(_branch._store.start_count || 0) + site.toNumber(obj.count)
                      if (obj.type == 'minus')
                        _branch._store.start_count = site.toNumber(_branch._store.start_count || 0) - site.toNumber(obj.count)
                    }

                    if (obj.type == 'sum') {
                      _branch._store.current_count = site.toNumber(_branch._store.current_count || 0) + site.toNumber(obj.count)
                      _branch._store.total_buy_price = (_branch._store.total_buy_price || 0) + totalCost
                      _branch._store.total_buy_count = (_branch._store.total_buy_count || 0) + site.toNumber(obj.count)
                    }

                    if (obj.type == 'minus') {
                      _branch._store.current_count = site.toNumber(_branch._store.current_count || 0) - site.toNumber(obj.count)
                      _branch._store.total_sell_price = (_branch._store.total_sell_price || 0) + totalCost
                      _branch._store.total_sell_count = (_branch._store.total_sell_count || 0) + site.toNumber(obj.count)
                    }

                    _branch._store.cost = site.toNumber(obj.cost)
                    _branch._store.price = site.toNumber(obj.price)

                    if (obj._status == 1) _branch._store.average_cost = site.toNumber(_branch._store.total_buy_price) / site.toNumber(_branch._store.total_buy_count)

                  } else _branch.stores_list.push(obj_store)


                } else _branch.stores_list = [obj_store]

                _size.branches_list[indxBranch] = _branch

              } else _size.branches_list.push(obj_branch)


            } else _size.branches_list = [obj_branch]
          }

          if (_size.item_complex) {
            _size.complex_items.forEach(_complex_item => {
              _complex_item.count = _complex_item.count * obj.count
              site.call('[store_out][stores_items][-]', Object.assign({}, _complex_item))
            })
          }
        });

        $stores_items.update(doc, () => {
          balance_handle(null)
        });

      } else {

        delete obj._status
        let item = {
          name: obj.name,
          company: obj.company,
          branch: obj.branch,
          sizes: [obj_branch]
        };

        $stores_items.add(item, () => {
          balance_handle(null)
        });
      };
    })
  }

  balance_handle(null)

  $stores_items.busy22 = false
  site.on('[stores_out][stores_items][+]', obj => {
    if ($stores_items.busy22) {
      setTimeout(() => {
        site.call('[stores_out][stores_items][+]', Object.assign({}, obj))
      }, 200);
      return
    }
    $stores_items.busy22 = true
    $stores_items.find({
      name: obj.name,
      'company.id': obj.company.id,
      'branch.code': obj.branch.code
    }, (err, doc) => {
      if (!err && doc) {
        let exist = false
        doc.sizes.forEach(s => {
          if (s && s.barcode == obj.barcode) {
            s.current_count = site.toNumber(s.current_count) - site.toNumber(obj.count)
            exist = true
          }
        })
        $stores_items.update(doc)
        $stores_items.busy22 = false
      }
    })
  })

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
      'company.id': obj.company.id,
      'branch.code': obj.branch.code
    }, (err, doc) => {
      if (!err && doc) {
        let exist = false
        doc.sizes.forEach(s => {
          if (s.size == obj.size && s.barcode == obj.barcode) {
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
      'company.id': obj.company.id,
      'branch.code': obj.branch.code
    }, (err, doc) => {
      if (!err && doc) {
        let exist = false
        doc.sizes.forEach(s => {
          if (s.size == obj.size && s.barcode == obj.barcode) {
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
      'company.id': obj.company.id,
      'branch.code': obj.branch.code
    }, (err, doc) => {
      if (!err && doc) {

        doc.sizes.forEach(s => {
          if (s.size == obj.size && s.barcode == obj.barcode && doc.name == obj.name) {

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
      name: obj.name,
      'company.id': obj.company.id,
      'branch.code': obj.branch.code
    }, (err, doc) => {

      if (!err && doc) {
        let exist = false
        doc.sizes.forEach(s => {

          if (s.size == obj.item.size && s.barcode == obj.barcode) {
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
      name: obj.name,
      'company.id': obj.company.id,
      'branch.code': obj.branch.code
    }, (err, doc) => {
      if (!err && doc) {
        let exist = false
        doc.sizes.forEach(s => {
          if (s.size == obj.item.size && s.barcode == obj.barcode) {
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
        doc.sizes.forEach(s => {
          if (s.size == obj.item.size && s.barcode == obj.barcode) {
            s.current_count = site.toNumber(s.current_count) - site.toNumber(obj.item.count)
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
          if (s && s.size == obj.item.size && s.barcode == obj.barcode) {
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
          if (s.size == obj.item.size && s.barcode == obj.barcode) {
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

    stores_items_doc.company = site.get_company(req)
    stores_items_doc.branch = site.get_branch(req)

    stores_items_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    $stores_items.add(stores_items_doc, (err, doc) => {
      if (!err) {
        /* let stores_items_doc = doc
            stores_items_doc.sizes.forEach(itm => {
             itm.name = stores_items_doc.name
             itm.cost = site.toNumber(itm.cost)
             itm.total = site.toNumber(itm.total)
             itm.price = site.toNumber(itm.price)
             itm.count = site.toNumber(itm.current_count)
             itm.current_count = site.toNumber(itm.current_count)
             itm.barcode = itm.barcode
             itm.date = stores_items_doc.date
             itm.company = site.get_company(req)
             itm.branch = site.get_branch(req)
             itm.transaction_type = 'in'
             itm.current_status = 'newitem'
             site.call('please track item', itm)
             site.call('[stores_items][store_in]', itm)
           }) */
        response.done = true
      } else response.error = err.message

      res.json(response)
    })
  })

  site.post("/api/stores_items/update", (req, res) => {
    let response = {};
    response.done = false

    if (req.session.user === undefined) res.json(response)

    let stores_items_doc = req.body;

    stores_items_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    });

    stores_items_doc.sizes.forEach(itm => {
      itm.cost = site.toNumber(itm.cost)
      itm.price = site.toNumber(itm.price)
    });


    if (stores_items_doc._id) {
      $stores_items.edit({
        where: {
          _id: stores_items_doc._id
        },
        set: stores_items_doc,
        $req: req,
        $req: req,
        $res: res
      }, (err, item_doc) => {
        if (!err) {
          response.done = true
          let obj = { sizes_list: [] }
          let exist = false

          obj.company = item_doc.doc.company

          item_doc.doc.sizes.forEach(size => {

            let found = item_doc.old_doc.sizes.some(old_size => size.size == old_size.size)

            if (!found) {
              obj.sizes_list.push({ size: size.size, barcode: size.barcode })
              exist = true
            }
          });

          if (exist) site.call('[stores_items][item_name][change]', obj)
        }
        else response.error = err.message
        res.json(response)
      });
    } else res.json(response);
  });

  site.post("/api/stores_items/delete", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let id = req.body.id

    let barcodes = req.body.category_item.sizes.map(_size => _size.barcode)

    let data = { name: 'stores_item', barcodes, company_id: req.body.category_item.company.id }

    site.getItemToDelete(data, callback => {

      if (callback == true) {
        response.error = 'Cant Delete Its Exist In Other Transaction'
        res.json(response)

      } else {
        if (id) {
          $stores_items.delete({
            id: id,
            $req: req,
            $res: res
          }, (err, result) => {
            if (!err) {

              /*       let stores_items_doc = result.doc
                     stores_items_doc.sizes.forEach(itm => {
                       itm.name = stores_items_doc.name
                       itm.cost = site.toNumber(itm.cost)
                       itm.price = site.toNumber(itm.price)
                       itm.count = site.toNumber(itm.current_count)
                       itm.barcode = itm.barcode
                       itm.date = stores_items_doc.date
                       itm.transaction_type = 'out'
                       itm.company = site.get_company(req)
                       itm.branch = site.get_branch(req)
                       site.call('please out item', itm)
                       site.call('[stores_items][store_out]', itm)
       
                     }) */
              response.done = true
            }
            res.json(response)
          })
        } else {
          res.json(response)
        }
      }
    })
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

    where['company.id'] = site.get_company(req).id

    if (where && where['name']) {
      where['name'] = new RegExp(where['name'], 'i')
    }

    if (where && where['size']) {
      where['sizes.size'] = new RegExp(where['size'], 'i')
      delete where['size']
    }

    if (where && where['barcode']) {
      where['sizes.barcode'] = new RegExp(where['barcode'], 'i')
      delete where['barcode']
    }

    if (where['item_group']) {
      where['item_group.id'] = where['item_group'].id;
      delete where['item_group']
    }

    if (where && where.price) {
      where['sizes.price'] = parseFloat(where.price)
      delete where.price
    }

    if (where && where.cost) {
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

  site.post("/api/stores_items/sizes_all", (req, res) => {
    let response = {
      done: false
    }
    let where = req.body.where || {}

    where['company.id'] = site.get_company(req).id

    $stores_items.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        let arr = [];
        if (docs && docs.length > 0) {
          docs.forEach(item => {
            if (item.sizes && item.sizes.length > 0)
              item.sizes.forEach(size => {
                size.itm_id = item.id
                size.stores_item_name = item.name
                arr.unshift(size)
              })
          })
        }
        response.count = count
        response.list = arr
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/stores_items/name_all", (req, res) => {
    let response = {
      done: false
    }
    let where = req.body.where || {}
    let search = req.body.search

    if (search) {
      where.$or = []
      where.$or.push({
        'name': new RegExp(search, "i")
      })
      where.$or.push({
        'sizes.barcode': new RegExp(search, "i")
      })
    }
    where['company.id'] = site.get_company(req).id

    $stores_items.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        response.count = count
        response.list = docs
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.getKitchenToDelete = function (data, callback) {

    let where = {};

    if (data.name == 'kitchen') where['sizes.kitchen.id'] = data.id

    $stores_items.findOne({
      where: where,
    }, (err, docs, count) => {

      if (!err) {
        if (docs) callback(true)
        else callback(false)
      }
    })
  }

}