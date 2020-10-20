app.controller("stores_dismantle", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.store_dismantle = {
    discountes: [],
    taxes: []
  };
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
    $scope.store_dismantle.items.splice($scope.store_dismantle.items.indexOf(itm), 1);

  };

  $scope.deleteitem = function (itm) {
    $scope.error = '';
    $scope.item.sizes.splice($scope.item.sizes.indexOf(itm), 1);

  };

  $scope.newStoreDismantle = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.item = {}
        $scope.store_dismantle = {
          image_url: '/images/store_dismantle.png',
          shift: $scope.shift,
          items: [],
          date: new Date(),
        };

        if ($scope.defaultSettings) {

          if ($scope.defaultSettings.inventory) {
            if ($scope.defaultSettings.inventory.store)
              $scope.store_dismantle.store = $scope.defaultSettings.inventory.store

          }
          if ($scope.defaultSettings.general_Settings && !$scope.defaultSettings.general_Settings.work_posting) {
            $scope.store_dismantle.posting = true
          }
        }
        site.showModal('#addStoreDismantleModal');
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

    const v = site.validated('#addStoreDismantleModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (new Date($scope.store_dismantle.date) > new Date()) {

      $scope.error = "##word.date_exceed##";
      return;

    };

    let notExistCount = $scope.store_dismantle.items.some(_iz => _iz.count < 1);

    if (notExistCount) {
      $scope.error = "##word.err_exist_count##";
      return;
    };


    if ($scope.store_dismantle.items.length > 0) {

      $scope.testPatches($scope.store_dismantle, callback => {

        if (callback.patchCount) {
          $scope.error = `##word.err_patch_count##   ( ${callback.patch_list.join('-')} )`;
          return;
        };

        $scope.financialYear($scope.store_dismantle.date, is_allowed_date => {
          if (!is_allowed_date) {
            $scope.error = '##word.should_open_period##';
          } else {

            $scope.busy = true;
            $http({
              method: "POST",
              url: "/api/stores_dismantle/add",
              data: $scope.store_dismantle
            }).then(
              function (response) {
                $scope.busy = false;
                if (response.data.done) {
                  site.hideModal('#addStoreDismantleModal');
                  $scope.loadAll({ date: new Date() });

                } else {
                  $scope.error = response.data.error;
                  if (response.data.error.like('*OverDraft Not*')) {
                    $scope.error = "##word.overdraft_not_active##"
                  }
                }

              },
              function (err) {
                $scope.error = err.message;
              }
            )
          }
        })
      })
    } else {
      $scope.error = "##word.must_enter_quantity##";
      return;
    }
  };

  $scope.remove = function (store_dismantle) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_dismantle);
        $scope.store_dismantle = {};
        site.showModal('#deleteStoreDismantleModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.view = function (store_dismantle, view) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_dismantle/view",
      data: {
        _id: store_dismantle._id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.store_dismantle = response.data.doc;
          if (view == 'view') $scope.store_dismantle.$view = true;
        } else $scope.error = response.data.error;
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.details = function (store_dismantle) {
    $scope.error = '';
    $scope.view(store_dismantle, 'view');
    $scope.store_dismantle = {};
    site.showModal('#viewStoreDismantleModal');
  };

  $scope.delete = function (store_dismantle) {
    $scope.error = '';
    $scope.getStockItems(store_dismantle.items, callback => {

      if (!callback) {

        $scope.financialYear(store_dismantle.date, is_allowed_date => {
          if (!is_allowed_date) {
            $scope.error = '##word.should_open_period##';
          } else {

            $scope.busy = true;
            $http({
              method: "POST",
              url: "/api/stores_dismantle/delete",
              data: store_dismantle
            }).then(
              function (response) {
                $scope.busy = false;
                if (response.data.done) {
                  site.hideModal('#deleteStoreDismantleModal');
                  $scope.loadAll({ date: new Date() });
                } else {
                  $scope.error = response.data.error;
                  if (response.data.error.like('*OverDraft Not*')) {
                    $scope.error = "##word.overdraft_not_active##"
                  }
                }

              },
              function (err) {
                console.log(err);
              }
            )
          }
        })
      } else {
        $scope.error = '##word.err_stock_item##';
      }
    })
  };

  $scope.addToItems = function () {
    $scope.error = '';
    let foundSize = false;
    if ($scope.item.sizes && $scope.item.sizes.length > 0)
      $scope.item.sizes.forEach(_size => {
        foundSize = $scope.store_dismantle.items.some(_itemSize => _itemSize.barcode === _size.barcode);
        if (_size.count > 0 && !foundSize) {
          $scope.store_dismantle.items.unshift({
            image_url: $scope.item.image_url,
            name: _size.name,
            item_group: _size.item_group,
            size: _size.size,
            size_en: _size.size_en,
            barcode: _size.barcode,
            size_units_list: _size.size_units_list,
            unit: _size.unit,
            work_patch: _size.work_patch,
            work_serial: _size.work_serial,
            item_complex: _size.item_complex,
            complex_items: _size.complex_items,
            average_cost: _size.average_cost,
            count: _size.count,
            store_count: _size.store_count,
            cost: _size.cost,
            price: _size.price,
            current_count: _size.current_count,
            ticket_code: _size.ticket_code,
          });
        }
      });

    $scope.item.sizes = [];
  };


  $scope.addToSizes = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    $scope.item.sizes.unshift({
      $new: true,
      vendor: $scope.store_dismantle.vendor,
      store: $scope.store_dismantle.store,
      count: 1,
      cost: 0,
      price: 0,
      size: '',
      current_count: 0,
      total: 0,
    });
  };

  $scope.getItemsName = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/stores_items/all",
        data: {
          search: $scope.item.search_item_name,
          where: {
            'sizes.item_complex': true
          }
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
                    let indxUnit = 0;
                    if (_size.size_units_list && _size.size_units_list.length > 0)
                      _size.size_units_list.forEach((_unit, i) => {

                        if (_unit.id === _item.main_unit.id) indxUnit = i;
                      });

                    if ((_size.barcode === $scope.item.search_item_name) || (_size.size_units_list[indxUnit].barcode === $scope.item.search_item_name)) {
                      _size.name = _item.name;
                      _size.item_group = _item.item_group;
                      _size.store = $scope.store_dismantle.store;
                      _size.unit = _size.size_units_list[indxUnit];
                      _size.count = 1;
                      _size.discount = _size.size_units_list[indxUnit].discount;
                      _size.average_cost = _size.size_units_list[indxUnit].average_cost;
                      _size.cost = _size.size_units_list[indxUnit].cost;
                      _size.price = _size.size_units_list[indxUnit].price;
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
                                if (_store.store.id == $scope.store_dismantle.store.id) {
                                  foundStore = true;
                                  indxStore = i;
                                  if (_store.hold) foundHold = true;
                                }
                              });
                              if (foundStore)
                                _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unit => {
                                  if (_unit.id == _item.main_unit.id)
                                    _size.store_count = _unit.current_count;
                                });
                            } else _size.store_count = 0;

                          } else _size.store_count = 0;
                        } else _size.store_count = 0;

                      } else _size.store_count = 0;

                      foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode === _size.barcode);

                      if (!foundSize && _size.item_complex && !foundHold) $scope.item.sizes.unshift(_size);
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

  $scope.itemsStoresDismantle = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    let foundSize = false;

    if ($scope.item.name && $scope.item.name.sizes && $scope.item.name.sizes.length > 0)
      $scope.item.name.sizes.forEach(_item => {
        let foundHold = false;
        _item.name = $scope.item.name.name;
        _item.item_group = $scope.item.name.item_group;
        _item.store = $scope.store_dismantle.store;
        let indxUnit = 0;
        if (_item.size_units_list && _item.size_units_list.length > 0) {

          indxUnit = _item.size_units_list.findIndex(_unit => _unit.id == $scope.item.name.main_unit.id);
          _item.unit = _item.size_units_list[indxUnit];
          _item.count = 1;
          _item.discount = _item.size_units_list[indxUnit].discount;
          _item.average_cost = _item.size_units_list[indxUnit].average_cost;
          _item.cost = _item.size_units_list[indxUnit].cost;
          _item.price = _item.size_units_list[indxUnit].price;
        }

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
                  if (_store.store.id == $scope.store_dismantle.store.id) {
                    foundStore = true;
                    indxStore = i;
                    if (_store.hold) foundHold = true;
                  }
                });
                if (foundStore)
                  _item.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unit => {
                    if (_unit.id == $scope.item.name.main_unit.id)
                      _item.store_count = _unit.current_count;
                  });
              } else _item.store_count = 0;

            } else _item.store_count = 0;
          } else _item.store_count = 0;

        } else _item.store_count = 0;
        foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode === _item.barcode);
        if (!foundSize && _item.item_complex && !foundHold)
          $scope.item.sizes.unshift(_item);
      });
  };

  $scope.getBarcode = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/stores_items/all",
        data: {
          where: {
            'sizes.item_complex': true,
            barcode: $scope.search_barcode
          }
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
                  let indxUnit = 0;
                  if (_size.size_units_list && _size.size_units_list.length > 0)
                    _size.size_units_list.forEach((_unit, i) => {
                      if (_unit.id == response.data.list[0].main_unit.id) indxUnit = i;
                    });

                  if ((_size.barcode === $scope.search_barcode) || _size.size_units_list[indxUnit].barcode === $scope.search_barcode) {
                    _size.name = response.data.list[0].name;
                    _size.item_group = response.data.list[0].item_group;
                    _size.store = $scope.store_dismantle.store;
                    _size.unit = _size.size_units_list[indxUnit];
                    _size.count = 1;
                    _size.discount = _size.size_units_list[indxUnit].discount;
                    _size.average_cost = _size.size_units_list[indxUnit].average_cost;
                    _size.cost = _size.size_units_list[indxUnit].cost;
                    _size.price = _size.size_units_list[indxUnit].price;

                    if (_size.branches_list && _size.branches_list.length > 0) {
                      let foundBranch = false
                      let indxBranch = 0
                      _size.branches_list.map((_branch, i) => {
                        if (_branch.code == '##session.branch.code##') {
                          foundBranch = true
                          indxBranch = i
                        }
                      });
                      if (foundBranch) {
                        if (_size.branches_list[indxBranch].code == '##session.branch.code##') {
                          if (_size.branches_list[indxBranch].stores_list && _size.branches_list[indxBranch].stores_list.length > 0) {
                            let foundStore = false
                            let indxStore = 0
                            _size.branches_list[indxBranch].stores_list.map((_store, i) => {
                              if (_store.store.id == $scope.store_dismantle.store.id) {
                                foundStore = true
                                indxStore = i
                                if (_store.hold) foundHold = true;
                              }
                            });
                            if (foundStore)
                              _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unit => {
                                if (_unit.id == response.data.list[0].main_unit.id)
                                  _size.store_count = _unit.current_count
                              });
                          } else _size.store_count = 0

                        } else _size.store_count = 0
                      } else _size.store_count = 0

                    } else _size.store_count = 0
                    foundSize = $scope.store_dismantle.items.some(_itemSize => _itemSize.barcode === _size.barcode);
                    if (!foundSize && _size.item_complex && !foundHold)
                      $scope.store_dismantle.items.unshift(_size);
                    else if (foundSize) {
                      $scope.store_dismantle.items.forEach(_item => {
                        if (_item.barcode === _size.barcode && !size.work_patch && !size.work_serial) {
                          _item.count = _item.count + 1;

                        }
                      });
                    }
                  }
                });
              if (foundSize) $scope.error = '##word.dublicate_item##';

              $scope.search_barcode = '';
            }
            $timeout(() => {
              document.querySelector('#search_barcode input').focus();
            }, 100);

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

  $scope.edit = function (store_dismantle) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_dismantle);
        $scope.store_dismantle = {};
        $scope.edit_price = false;
        site.showModal('#updateStoreDismantleModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.update = function () {
    $scope.error = '';

    if (new Date($scope.store_dismantle.date) > new Date()) {

      $scope.error = "##word.date_exceed##";
      return;

    };

    let notExistCount = $scope.store_dismantle.items.some(_iz => _iz.count < 1);

    if (notExistCount) {
      $scope.error = "##word.err_exist_count##";
      return;
    };

    $scope.testPatches($scope.store_dismantle, callback => {

      if (callback.patchCount) {
        $scope.error = `##word.err_patch_count##   ( ${callback.patch_list.join('-')} )`;
        return;
      };

      $scope.financialYear($scope.store_dismantle.date, is_allowed_date => {
        if (!is_allowed_date) {
          $scope.error = '##word.should_open_period##';
        } else {

          $scope.busy = true;
          $http({
            method: "POST",
            url: "/api/stores_dismantle/update",
            data: $scope.store_dismantle
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done) {
                $scope.loadAll({ date: new Date() });
                site.hideModal('#updateStoreDismantleModal');
              } else {
                $scope.error = '##word.error##';
              }
            },
            function (err) {
              console.log(err);
            }
          )
        }
      })
    })
  };

  $scope.posting = function (store_dismantle) {
    $scope.error = '';
    $scope.getStockItems(store_dismantle.items, callback => {

      $scope.testPatches(store_dismantle, callbackTest => {

        if (callbackTest.patchCount) {
          if (store_dismantle.posting) store_dismantle.posting = false;
          else store_dismantle.posting = true;
          $scope.error = `##word.err_patch_count##   ( ${callbackTest.patch_list.join('-')} )`;
          return;
        };

        let obj = {
          patchCount: false,
          patch_list: []
        };

        store_dismantle.items.forEach(_itm => {
          if (_itm.complex_items && _itm.complex_items.length > 0) {
            _itm.complex_items.forEach(_comp => {
              let count = 0;
              _comp.patches_count = _comp.count * _itm.count;

              if (_comp.patch_list && _comp.patch_list.length > 0) {
                _comp.patch_list.forEach(_pl => {
                  if (typeof _pl.count === 'number') {
                    count += _pl.count;
                  } else {
                    obj.patchCount = true;
                    obj.patch_list.push(_itm.barcode);
                  }
                });
              } else if (_comp.work_serial || _comp.work_patch) {
                obj.patchCount = true;
                obj.patch_list.push(_itm.barcode)
              }
              if (count != _comp.patches_count && (_comp.work_serial || _comp.work_patch)) {
                obj.patchCount = true;
                obj.patch_list.push(_itm.barcode)
              }
            });
          }
        });

        obj.patch_list = obj.patch_list.filter(function (item, pos) {
          return obj.patch_list.indexOf(item) === pos;
        });

        if (obj.patchCount) {
          if (store_dismantle.posting) store_dismantle.posting = false;
          else store_dismantle.posting = true;
          $scope.error = `##word.err_patch_count_comp##   ( ${obj.patch_list.join('-')} )`;
          return;
        };


        if (!callback) {

          $scope.financialYear(store_dismantle.date, is_allowed_date => {
            if (!is_allowed_date) {
              $scope.error = '##word.should_open_period##';
              if (store_dismantle.posting) store_dismantle.posting = false;
              else store_dismantle.posting = true;
            } else {

              $scope.busy = true;
              $http({
                method: "POST",
                url: "/api/stores_dismantle/posting",
                data: store_dismantle
              }).then(
                function (response) {
                  $scope.busy = false;
                  if (response.data.done) {
                  } else {
                    $scope.error = '##word.error##';
                    if (response.data.error.like('*OverDraft Not*')) {
                      $scope.error = "##word.overdraft_not_active##"
                      if (store_dismantle.posting) store_dismantle.posting = false;
                      else store_dismantle.posting = true;
                    }
                  }
                },
                function (err) {
                  console.log(err);
                }
              )
            }
          })

        } else {
          if (store_dismantle.posting) store_dismantle.posting = false;
          else store_dismantle.posting = true;
          $scope.error = '##word.err_stock_item##';
        }
      })
    })
  };

  $scope.getStockItems = function (items, callback) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_stock/item_stock",
      data: items
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          if (response.data.found) {
            callback(true)
          } else {
            callback(false)
          }
        } else {
          callback(false)
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
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
        if (response.data.done) $scope.categories = response.data.list;

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };




  $scope.searchAll = function () {
    $scope.error = '';
    $scope.loadAll($scope.search);
    $scope.search = {};

    site.hideModal('#StoresDismantleSearchModal');

  };

  $scope.loadAll = function (where) {
    $scope.error = '';
    $scope.list = [];
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_dismantle/all",
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

  $scope.viewPatchesList = function (itm) {
    $scope.error = '';
    $scope.item_patch = itm;

    site.showModal('#patchesListViewModal');

  };

  $scope.showComplexItems = function (itm) {
    $scope.error = '';
    if (itm.complex_items && itm.complex_items.length > 0) {
      itm.complex_items.forEach(_comp => {
        _comp.patches_count = _comp.count * itm.count
        _comp.$comp = true;
      });
    }
    $scope.complexView = itm;

    site.showModal('#complexViewModal');

  };

  $scope.patchesList = function (itm) {
    $scope.error = '';
    $scope.item_patch = itm;

    $http({
      method: "POST",
      url: "/api/stores_items/all",
      data: {
        where: {
          store_id: $scope.store_dismantle.store.id,
          unit_id: itm.unit.id,
          barcode: itm.barcode
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          if (response.data.patch_list.length > 0) {
            response.data.patch_list.forEach(_resPatch => {

              _resPatch.current_count = _resPatch.count
              _resPatch.count = 0

              if ($scope.item_patch.patch_list && $scope.item_patch.patch_list.length > 0)
                $scope.item_patch.patch_list.forEach(_itemPatch => {

                  if (_resPatch.patch == _itemPatch.patch) {
                    _resPatch.count = _itemPatch.count
                    _resPatch.current_count = _itemPatch.current_count
                    if (_itemPatch.select) _resPatch.select = _itemPatch.select
                  }

                });
            });
            $scope.item_patch.patch_list = response.data.patch_list;
            site.showModal('#patchesListModal');
          }

        }
      })


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
      count: itm.work_serial ? 1 : 0
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


  $scope.exitPatchModal = function (itm) {
    let bigger = false;
    let count = 0;

    itm.patch_list.forEach(_pl => {
      if (_pl.count > _pl.current_count) bigger = true;
      if (itm.work_serial) {
        if (_pl.select) _pl.count = 1
        else _pl.count = 0
      }

    });

    itm.patch_list.map(p => count += p.count);

    if ((itm.$comp && itm.patches_count != count) || (!itm.$comp && itm.count != count)) {
      $scope.error = '##word.err_patch_count##';
      return;
    } else if (bigger) {
      $scope.error = '##word.err_patch_current_count##';
      return;
    } else {

      itm.patch_list.forEach(_patch => {
        if (_patch.count === 1) {
          _patch.complex_items.forEach(patchComp => {
            itm.complex_items.forEach(itmComp => {
              if (patchComp.barcode === itmComp.barcode) {
                itmComp.patch_list = patchComp.patch_list
              }
            });
          });
        }
      })
    }

    site.hideModal('#patchesListModal');
    $scope.error = '';
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


  $scope.testPatches = function (store_dismantle, callback) {

    let obj = {
      patchCount: false,
      patch_list: []
    };

    store_dismantle.items.forEach(_item => {
      if (_item.size_units_list && _item.size_units_list.length > 0) {

        let count = 0;
        if (_item.patch_list && _item.patch_list.length > 0) {
          _item.patch_list.forEach(_pl => {
            if (typeof _pl.count === 'number') {

              count += _pl.count;

            } else {
              obj.patchCount = true;
              obj.patch_list.push(_item.barcode)
            }
          });
        } else if (_item.work_serial || _item.work_patch) {
          obj.patchCount = true;
          obj.patch_list.push(_item.barcode)
        }
        if (count != _item.count && (_item.work_serial || _item.work_patch)) {
          obj.patchCount = true;
          obj.patch_list.push(_item.barcode)
        }

      }
    });

    obj.patch_list = obj.patch_list.filter(function (item, pos) {
      return obj.patch_list.indexOf(item) === pos;
    });

    callback(obj)
  };

  $scope.financialYear = function (date, callback) {
    if (site.feature('erp')) {

      $scope.busy = true;
      $scope.error = '';
      $http({
        method: "POST",
        url: "/api/financial_years/is_allowed_date",
        data: {
          date: new Date(date)
        }
      }).then(
        function (response) {
          $scope.busy = false;
          is_allowed_date = response.data.doc;
          callback(is_allowed_date);
        }
      );
    } else callback(true);

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