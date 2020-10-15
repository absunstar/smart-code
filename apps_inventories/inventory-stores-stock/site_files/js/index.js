app.controller("stores_stock", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.store_stock = {};
  $scope.search = {};
  $scope.item = {
    sizes: []
  };


  $scope.addDays = function (date, days) {
    var result = new Date(date);
    result.setTime(result.getTime() + (days * 24 * 60 * 60 * 1000));
    return result;
  }


  $scope.deleteRow = function (itm) {
    $scope.error = '';
    $scope.store_stock.items.splice($scope.store_stock.items.indexOf(itm), 1);
  };

  $scope.deleteitem = function (itm) {
    $scope.error = '';
    $scope.item.sizes.splice($scope.item.sizes.indexOf(itm), 1);

  };

  $scope.newStoreStock = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.item = {}
        $scope.store_stock = {
          image_url: '/images/store_stock.png',
          shift: $scope.shift,
          items: [],
          date: new Date(),
        };

        if ($scope.defaultSettings.inventory) {
          if ($scope.defaultSettings.inventory.store)
            $scope.store_stock.store = $scope.defaultSettings.inventory.store
        }
        site.showModal('#addStoreStockModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.getDefaultSettings = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/default_setting/get",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;

        };
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

  };

  $scope.add = function () {
    $scope.error = '';

    const v = site.validated('#addStoreStockModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (new Date($scope.store_stock.date) > new Date()) {

      $scope.error = "##word.date_exceed##";
      return;

    }

    if ($scope.store_stock.items.length > 0) {
      $scope.store_stock.status = 1;
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/stores_stock/add",
        data: $scope.store_stock
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            site.hideModal('#addStoreStockModal');

            $scope.loadAll({ date: new Date() });

          } else $scope.error = response.data.error;

        },
        function (err) {
          $scope.error = err.message;
        }
      )
    } else {
      $scope.error = "##word.must_enter_quantity##";
      return;
    }
  };

  $scope.remove = function (store_stock) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_stock);
        $scope.store_stock = {};
        site.showModal('#deleteStoreStockModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.view = function (store_stock) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_stock/view",
      data: {
        _id: store_stock._id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.store_stock = response.data.doc;
        } else $scope.error = response.data.error;
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.details = function (store_stock) {
    $scope.error = '';
    $scope.view(store_stock);
    $scope.store_stock = {};
    site.showModal('#viewStoreStockModal');
  };

  $scope.delete = function (store_stock) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_stock/delete",
      data: store_stock
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteStoreStockModal');
          $scope.loadAll({ date: new Date() });
        } else $scope.error = response.data.error;

      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.addToItems = function () {
    $scope.error = '';
    let foundSize = false;

    if ($scope.item.sizes && $scope.item.sizes.length > 0)
      $scope.item.sizes.forEach(_size => {
        foundSize = $scope.store_stock.items.some(_itemSize => _itemSize.barcode === _size.barcode);
        if (!foundSize) {
          $scope.store_stock.items.unshift({
            image_url: $scope.item.image_url,
            name: _size.name,
            size: _size.size,
            item_group: _size.item_group,
            work_patch: _size.work_patch,
            work_serial: _size.work_serial,
            validit: (_size.validit || 0),
            size_en: _size.size_en,
            size_units_list: _size.size_units_list,
            item_complex: _size.item_complex,
            complex_items: _size.complex_items,
            barcode: _size.barcode,
            ticket_code: _size.ticket_code,
          });
        }
      });

    $scope.item.sizes = [];
  };

  $scope.getItemsName = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/stores_items/all",
        data: {
          where: { service_item: { $ne: true } },

          search: $scope.item.search_item_name
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0 && $scope.item.search_item_name) {
              let foundSize = false;
              $scope.item.sizes = $scope.item.sizes || [];
              response.data.list.forEach(_item => {

                if (_item.sizes && _item.sizes.length > 0)
                  _item.sizes.forEach(_size => {
                    let foundHold = false;
                    let foundUnit = false;

                    if (_size.size_units_list && _size.size_units_list.length > 0)
                      _size.size_units_list.forEach(_unit => {
                        _unit.validit = _item.validit;

                        if ((_unit.barcode === $scope.item.search_item_name) && typeof _unit.barcode == 'string') {
                          foundUnit = true;
                        }

                        if (_size.branches_list && _size.branches_list.length > 0) {
                          let foundBranch = false;
                          let indxBranch = 0;
                          _size.branches_list.map((_branch, i) => {
                            if (_branch.code == '##session.branch.code##') {
                              foundBranch = true;
                              indxBranch = i;
                            }
                          });

                          if (foundBranch) {
                            if (_size.branches_list[indxBranch].code == '##session.branch.code##') {
                              if (_size.branches_list[indxBranch].stores_list && _size.branches_list[indxBranch].stores_list.length > 0) {
                                let foundStore = false;
                                let indxStore = 0;
                                _size.branches_list[indxBranch].stores_list.map((_store, i) => {
                                  if (_store.store.id == $scope.store_stock.store.id) {
                                    foundStore = true;
                                    indxStore = i;
                                    if (_store.hold) foundHold = true;
                                  }
                                });
                                _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unitStore => {

                                  if (foundStore && _unitStore.id == _unit.id) {

                                    _unit.store_count = _unitStore.current_count || 0;
                                  }
                                });
                              }
                            }
                          }
                        }
                      });
                    if ((_size.barcode === $scope.item.search_item_name) || foundUnit) {
                      _size.name = _item.name;
                      _size.item_group = _item.item_group;

                      foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode === _size.barcode);
                      if (!foundSize && !foundHold) $scope.item.sizes.unshift(_size);
                    };
                  });
              });

              if (!foundSize)
                $scope.itemsNameList = response.data.list;
              else if (foundSize) $scope.error = '##word.dublicate_item##';

            };
          } else {
            $scope.error = response.data.error;
            $scope.item = { sizes: [] };
          };
        },
        function (err) {
          console.log(err);
        }
      );
    }
  };

  $scope.itemsStoresStock = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    let foundSize = false;
    if ($scope.item.name && $scope.item.name.sizes && $scope.item.name.sizes.length > 0)
      $scope.item.name.sizes.forEach(_item => {
        let foundHold = false;
        _item.name = $scope.item.name.name
        _item.item_group = $scope.item.name.item_group;

        if (_item.size_units_list && _item.size_units_list.length > 0)
          _item.size_units_list.forEach(_unit => {
            _unit.validit = _item.validit;

            if (_item.branches_list && _item.branches_list.length > 0) {
              let foundBranch = false;
              let indxBranch = 0;
              _item.branches_list.map((_branch, i) => {
                if (_branch.code == '##session.branch.code##') {
                  foundBranch = true;
                  indxBranch = i;
                }
              });
              if (foundBranch) {

                if (_item.branches_list[indxBranch].code == '##session.branch.code##') {
                  if (_item.branches_list[indxBranch].stores_list && _item.branches_list[indxBranch].stores_list.length > 0) {

                    let foundStore = false;
                    let indxStore = 0;
                    _item.branches_list[indxBranch].stores_list.map((_store, i) => {
                      if (_store.store.id == $scope.store_stock.store.id) {
                        foundStore = true;
                        indxStore = i;
                        if (_store.hold) foundHold = true;
                      }
                    });
                    _item.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unitStore => {

                      if (foundStore && _unitStore.id == _unit.id) {

                        _unit.store_count = _unitStore.current_count || 0;

                      }
                    });
                  }
                }
              }
            }
          });

        foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode === _item.barcode);
        if (!foundSize && !foundHold) $scope.item.sizes.unshift(_item);
      });
  };


  $scope.stockItemsGroup = function (item_group) {
    $scope.error = '';
    $scope.store_stock.items = [];

    where = { item_group: item_group, service_item: { $ne: true } }
    $http({
      method: "POST",
      url: "/api/stores_items/all",
      data: { where: where }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (response.data.list.length > 0) {
            let foundSize = false;
            response.data.list.forEach(_list => {

              if (_list.sizes && _list.sizes.length > 0)
                _list.sizes.forEach(_size => {
                  let foundHold = false;

                  if (_size.size_units_list && _size.size_units_list.length > 0)
                    _size.size_units_list.forEach(_unit => {
                      _unit.validit = _size.validit;

                      if (_size.branches_list && _size.branches_list.length > 0) {
                        let foundBranch = false;
                        let indxBranch = 0;
                        _size.branches_list.map((_branch, i) => {
                          if (_branch.code == '##session.branch.code##') {
                            foundBranch = true;
                            indxBranch = i;
                          }
                        });
                        if (foundBranch) {

                          if (_size.branches_list[indxBranch].code == '##session.branch.code##') {
                            if (_size.branches_list[indxBranch].stores_list && _size.branches_list[indxBranch].stores_list.length > 0) {

                              let foundStore = false;
                              let indxStore = 0;
                              _size.branches_list[indxBranch].stores_list.map((_store, i) => {
                                if (_store.store.id == $scope.store_stock.store.id) {
                                  foundStore = true;
                                  indxStore = i;
                                  if (_store.hold) foundHold = true;
                                }
                              });
                              _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unitStore => {

                                if (foundStore && _unitStore.id == _unit.id) {

                                  _unit.store_count = _unitStore.current_count || 0

                                }
                              });
                            }
                          }
                        }
                      }
                    });

                  _size.name = _list.name;
                  _size.item_group = _list.item_group;
                  foundSize = $scope.store_stock.items.some(_itemSize => _itemSize.barcode === _size.barcode);
                  if (!foundSize && !foundHold) $scope.store_stock.items.unshift(_size);

                });
            });

            if (foundSize) $scope.error = '##word.dublicate_item##';
          }

        } else {
          $scope.error = response.data.error;
        };
      },
      function (err) {
        console.log(err);
      }
    );
  }


  $scope.stockGeneral = function () {
    $scope.error = '';
    $scope.store_stock.items = [];
    $http({
      method: "POST",
      url: "/api/stores_items/all",
      data: {
        where: { service_item: { $ne: true } },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (response.data.list.length > 0) {
            let foundSize = false;
            response.data.list.forEach(_list => {

              if (_list.sizes && _list.sizes.length > 0)
                _list.sizes.forEach(_size => {
                  let foundHold = false;

                  if (_size.size_units_list && _size.size_units_list.length > 0)
                    _size.size_units_list.forEach(_unit => {
                      _unit.validit = _size.validit;

                      if (_size.branches_list && _size.branches_list.length > 0) {
                        let foundBranch = false;
                        let indxBranch = 0;
                        _size.branches_list.map((_branch, i) => {
                          if (_branch.code == '##session.branch.code##') {
                            foundBranch = true;
                            indxBranch = i;
                          }
                        });
                        if (foundBranch) {

                          if (_size.branches_list[indxBranch].code == '##session.branch.code##') {
                            if (_size.branches_list[indxBranch].stores_list && _size.branches_list[indxBranch].stores_list.length > 0) {

                              let foundStore = false;
                              let indxStore = 0;
                              _size.branches_list[indxBranch].stores_list.map((_store, i) => {
                                if (_store.store.id == $scope.store_stock.store.id) {
                                  foundStore = true;
                                  indxStore = i;
                                  if (_store.hold) foundHold = true;
                                }
                              });
                              _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unitStore => {

                                if (foundStore && _unitStore.id == _unit.id) {

                                  _unit.store_count = _unitStore.current_count || 0

                                }
                              });
                            }
                          }
                        }
                      }
                    });

                  _size.name = _list.name;
                  _size.item_group = _list.item_group;
                  foundSize = $scope.store_stock.items.some(_itemSize => _itemSize.barcode === _size.barcode);
                  if (!foundSize && !foundHold) $scope.store_stock.items.unshift(_size);

                });
            });

            if (foundSize) $scope.error = '##word.dublicate_item##';
          }

        } else {
          $scope.error = response.data.error;
        };
      },
      function (err) {
        console.log(err);
      }
    );
  }
  

  $scope.getBarcode = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/stores_items/all",
        data: {
          where: { barcode: $scope.search_barcode, service_item: { $ne: true } }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              let foundSize = false;

              if (response.data.list[0].sizes && response.data.list[0].sizes.length > 0)
                response.data.list[0].sizes.forEach(_size => {
                  let foundHold = false;
                  let foundUnit = false;

                  if (_size.size_units_list && _size.size_units_list.length > 0)
                    _size.size_units_list.forEach(_unit => {
                      _unit.validit = _size.validit;

                      if ((_unit.barcode === $scope.search_barcode) && typeof _unit.barcode == 'string') {
                        foundUnit = true;
                      }

                      if (_size.branches_list && _size.branches_list.length > 0) {
                        let foundBranch = false;
                        let indxBranch = 0;
                        _size.branches_list.map((_branch, i) => {
                          if (_branch.code == '##session.branch.code##') {
                            foundBranch = true;
                            indxBranch = i;
                          }
                        });
                        if (foundBranch) {

                          if (_size.branches_list[indxBranch].code == '##session.branch.code##') {
                            if (_size.branches_list[indxBranch].stores_list && _size.branches_list[indxBranch].stores_list.length > 0) {

                              let foundStore = false;
                              let indxStore = 0;
                              _size.branches_list[indxBranch].stores_list.map((_store, i) => {
                                if (_store.store.id == $scope.store_stock.store.id) {
                                  foundStore = true;
                                  indxStore = i;
                                  if (_store.hold) foundHold = true;
                                }
                              });
                              _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unitStore => {

                                if (foundStore && _unitStore.id == _unit.id) {

                                  _unit.store_count = _unitStore.current_count || 0;

                                }
                              });
                            }
                          }
                        }
                      }
                    });

                  if ((_size.barcode === $scope.search_barcode) || foundUnit) {

                    _size.name = response.data.list[0].name;
                    _size.item_group = response.data.list[0].item_group;

                    foundSize = $scope.store_stock.items.some(_itemSize => _itemSize.barcode === _size.barcode);

                    if (!foundSize && !foundHold) $scope.store_stock.items.unshift(_size);
                  }

                });
              if (foundSize) $scope.error = '##word.dublicate_item##';

              $scope.search_barcode = '';
            }
            $timeout(() => {
              document.querySelector('#search_barcode input').focus();
            }, 200);

          } else {
            $scope.error = response.data.error;
          };
        },
        function (err) {
          console.log(err);
        }
      );
    }
  };

  $scope.settlement = function (store_stock) {
    $scope.store_stock = store_stock;
    site.showModal('#settlementItemsModal');
  };

  $scope.edit = function (store_stock) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_stock);
        $scope.store_stock = {};
        $scope.edit_price = false;
        site.showModal('#updateStoreStockModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.update = function (store_stock, hold) {
    $scope.error = '';
    $scope.busy = true;

    if (new Date(store_stock.date) > new Date()) {

      $scope.error = "##word.date_exceed##";
      return;

    };

    if (store_stock.items && store_stock.items.length > 0) {

      $scope.testPatches(store_stock, callback => {
        if (hold !== 'hold') {

          if (callback.patchCount) {
            $scope.error = `##word.err_patch_count##   ( ${callback.patch_list.join('-')} )`;
            return;
          }


          if (callback.not_patch) {
            $scope.error = `##word.err_find_serial##   ( ${callback.patch_list.join('-')} )`;
            return;
          };

          if (callback.exist_serial) {
            $scope.error = `##word.serial_pre_existing##   ( ${callback.patch_list.join('-')} )`;
            return;
          };

          if (callback.errDate) {
            $scope.error = '##word.err_patch_date##';
            return;
          }
        }

        $http({
          method: "POST",
          url: "/api/stores_stock/update",
          data: store_stock
        }).then(
          function (response) {
            $scope.busy = false;
            if (response.data.done) {

              if (store_stock.status == 1) site.hideModal('#updateStoreStockModal');
              else site.hideModal('#settlementItemsModal');

              $scope.loadAll({ date: new Date() });
            } else {
              $scope.error = '##word.error##';
            }
          },
          function (err) {
            console.log(err);
          }
        )
      })
    } else {
      $scope.error = "##word.must_enter_quantity##";
      return;
    }
  };

  $scope.testPatches = function (store_stock, callback) {
    $scope.getSerialList(store_stock.items, serial_list => {

      let obj = {
        patchCount: false,
        errDate: false,
        exist_serial: false,
        not_patch: false,
        patch_list: []
      };

      store_stock.items.forEach(_item => {
        if (_item.size_units_list && _item.size_units_list.length > 0) {

          _item.size_units_list.forEach(_sizeUnit => {
            let count = 0;
            if (_sizeUnit.patch_list && _sizeUnit.patch_list.length > 0) {
              _sizeUnit.patch_list.forEach(_pl => {
                if (typeof _pl.count === 'number') {
                  if (new Date(_pl.expiry_date) < new Date(_pl.production_date)) {
                    obj.errDate = true
                  }
                  count += _pl.count;

                  if (_pl.count > _pl.current_count && !_pl.new) {
                    obj.patchCount = true;
                    obj.patch_list.push(_item.barcode)
                  }

                } else {
                  obj.patchCount = true;
                  obj.patch_list.push(_item.barcode)
                }

                if (serial_list && serial_list.length > 0) {

                  serial_list.forEach(_s => {
                    if (_s === _pl.patch && _item.work_serial) {
                      obj.exist_serial = true;
                      obj.patch_list.push(_pl.patch);
                    }
                  });

                }

                if (!_pl.patch) {
                  obj.not_patch = true;
                  obj.patch_list.push(_item.barcode);
                }
              });
            } else if (_item.work_serial || _item.work_patch) {
              obj.patchCount = true;
              obj.patch_list.push(_item.barcode)
            }
            if (count != _sizeUnit.stock_count && (_item.work_serial || _item.work_patch)) {
              obj.patchCount = true;
              obj.patch_list.push(_item.barcode)
            }
          });

        }
      });


      obj.patch_list = obj.patch_list.filter(function (item, pos) {
        return obj.patch_list.indexOf(item) === pos;
      });


      callback(obj)
    });
  };

  $scope.getSerialList = function (items, callback) {
    $scope.error = '';
    $scope.busy = true;

    let barcodes = [];
    if (items && items.length > 0)
      barcodes = items.map(_item => _item.barcode)

    let where = { serial: true, barcodes: barcodes };

    $http({
      method: "POST",
      url: "/api/stores_items/barcode_unit",
      data: {
        where: where

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.serial_list) {
          $scope.serial_list = response.data.serial_list;
          callback(response.data.serial_list);
        } else {
          callback(null);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
        callback(null);
      }
    )
  };

  $scope.approve = function (store_stock) {
    $scope.error = '';

    $scope.testPatches(store_stock, callback => {

      if (callback.patchCount) {
        $scope.error = `##word.err_patch_count##   ( ${callback.patch_list.join('-')} )`;
        return;
      };

      if (callback.not_patch) {
        $scope.error = `##word.err_find_serial##   ( ${callback.patch_list.join('-')} )`;
        return;
      };

      if (callback.exist_serial) {
        $scope.error = `##word.serial_pre_existing##   ( ${callback.patch_list.join('-')} )`;
        return;
      };


      if (callback.errDate) {
        $scope.error = '##word.err_patch_date##';
        return;
      }

      $scope.busy = true;

      $http({
        method: "POST",
        url: "/api/stores_stock/approve",
        data: store_stock
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) $scope.loadAll({ date: new Date() });
          else $scope.error = '##word.error##';
        },
        function (err) {
          console.log(err);
        }
      )
    })

  };


  $scope.loadStores = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: { select: { id: 1, name: 1, type: 1 } }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.storesList = response.data.list;

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };



  $scope.loadCategories = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.categories = [];
    $http({
      method: "POST",
      url: "/api/items_group/all",
      data: {
        select: {
          id: 1,
          name: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          $scope.categories = response.data.list;
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.calcAverage = function (stock) {
    setTimeout(() => {

      stock.total_difference_cost = 0;
      stock.items.forEach(_itm => {
        _itm.size_units_list.forEach(_itmUnit => {
          let remain = (_itmUnit.stock_count) - _itmUnit.store_count;
          _itmUnit.difference_cost = remain * _itmUnit.average_cost;
          stock.total_difference_cost += _itmUnit.difference_cost

        });
      });

    }, 150);
  };


  $scope.searchAll = function () {
    $scope.error = '';
    $scope.loadAll($scope.search);
    $scope.search = {};
    site.hideModal('#StoresStockSearchModal');

  };

  $scope.loadAll = function (where) {
    $scope.error = '';
    $scope.list = [];
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_stock/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.exitPatchModal = function (itm) {

    $scope.error = '';

    let bigger = false;
    let count = 0;
    let errDate = false;

    itm.patch_list.forEach(_pl => {
      if (new Date(_pl.expiry_date) < new Date(_pl.production_date)) {
        errDate = true
      }
      if (_pl.count > _pl.current_count && !_pl.new) bigger = true;
      if (itm.work_serial) {
        if (_pl.select) _pl.count = 1
        else _pl.count = 0
      }
    });

    itm.patch_list.map(p => count += p.count);

    if (itm.stock_count != count) {
      $scope.error = '##word.err_patch_count##';
      return;
    };

    if (errDate) {
      $scope.error = '##word.err_patch_date##';
      return;
    }

    if (bigger) {
      $scope.error = '##word.err_patch_current_count##';
      return;
    };

    site.hideModal('#patchesListModal');
  };

  $scope.patchesList = function (itm, size) {
    $scope.error = '';
    itm.work_serial = size.work_serial;
    itm.work_patch = size.work_patch;
    itm.validit = size.validit;
    $scope.patch_count = 0;
    
    $http({
      method: "POST",
      url: "/api/stores_items/all",
      data: {
        where: {
          store_id: $scope.store_stock.store.id,
          unit_id: itm.id,
          barcode: size.barcode
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.patch_list.length > 0) {
          let patch_list = response.data.patch_list;

          patch_list.forEach(_resPatch => {
            _resPatch.current_count = _resPatch.count;
            _resPatch.count = 0;
            $scope.patch_count += _resPatch.current_count;
            if (itm.patch_list && itm.patch_list.length > 0) {
              itm.patch_list.forEach(_itemPatch => {

                if (_resPatch.patch === _itemPatch.patch) {
                  _resPatch.count = _itemPatch.count;
                  _resPatch.current_count = _itemPatch.current_count;

                  if (_itemPatch.select) _resPatch.select = _itemPatch.select;

                }
              });
            }
          });
          if (itm.patch_list && itm.patch_list.length > 0) {

            itm.patch_list.forEach(_itemP => {
              let found = patch_list.some(s => s.patch === _itemP.patch);
              if (!found) patch_list.unshift(_itemP);
            })
          }


          itm.patch_list = patch_list

          $scope.item_patch = itm;


          site.showModal('#patchesListModal');

        }
      })
  };

  $scope.changeDate = function (i, str) {
    $timeout(() => {
      $scope.error = '';

      if (str == 'exp') {

        let diffTime = Math.abs(new Date(i.expiry_date) - new Date(i.production_date));
        i.validit = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      } else if (str == 'pro') {

        i.expiry_date = new Date($scope.addDays(i.production_date, (i.validit || 0)))
      }
    }, 250);
  };

  $scope.viewPatchesList = function (itm) {
    $scope.error = '';
    $scope.item_patch = itm;
    site.showModal('#patchesListViewModal');

  };

  $scope.selectAll = function (item_patch) {
    item_patch.patch_list.forEach(element => {
      if (item_patch.$select_all) {
        element.select = true
      } else if (!item_patch.$select_all) {
        element.select = false
      }
    });
  };

  $scope.addNewPAtch = function (itm) {
    let mini_code = itm.barcode.slice(-3);
    let r_code = Math.floor((Math.random() * 1000) + 1);
    itm.patch_list.unshift({
      patch: mini_code + r_code + (itm.patch_list.length + 1) + (itm.validit || '00'),
      production_date: new Date(),
      expiry_date: new Date($scope.addDays(new Date(), (itm.validit || 0))),
      validit: (itm.validit || 0),
      current_count: 0,
      count: 0,
      new: true
    })
  };

  $scope.get_open_shift = function (callback) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: { active: true },
        select: { id: 1, name: 1, code: 1, from_date: 1, from_time: 1, to_date: 1, to_time: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.shift = response.data.doc;
          callback(response.data.doc);
        } else {
          callback(null);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
        callback(null);
      }
    )
  };

  $scope.loadStores();
  $scope.loadCategories();
  $scope.getDefaultSettings();
  $scope.loadAll({ date: new Date() });
});