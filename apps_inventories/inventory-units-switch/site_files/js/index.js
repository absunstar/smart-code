app.controller("units_switch", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.units_switch = {
    discountes: [],
    taxes: []
  };

  $scope.search = {};
  $scope.item = {
    sizes: []
  };

  $scope.deleteRow = function (itm) {
    $scope.error = '';
    $scope.units_switch.items.splice($scope.units_switch.items.indexOf(itm), 1);

  };

  $scope.deleteitem = function (itm) {
    $scope.error = '';
    $scope.item.sizes.splice($scope.item.sizes.indexOf(itm), 1);

  };

  $scope.newUnitsSwitch = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.item = {};
        $scope.units_switch = {
          image_url: '/images/units_switch.png',
          shift: $scope.shift,
          items: [],
          date: new Date(),
        };
        if ($scope.defaultSettings) {

          if ($scope.defaultSettings.inventory) {
            if ($scope.defaultSettings.inventory.store)
              $scope.units_switch.store = $scope.defaultSettings.inventory.store

          }
          if ($scope.defaultSettings.general_Settings && !$scope.defaultSettings.general_Settings.work_posting) {
            $scope.units_switch.posting = true
          }
        }
        site.showModal('#addUnitsSwitchModal');
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

  $scope.addSwitch = function () {
    $scope.error = '';

    const v = site.validated('#addUnitsSwitchModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (new Date($scope.units_switch.date) > new Date()) {

      $scope.error = "##word.date_exceed##";
      return;

    };

    let notExistCount = $scope.units_switch.items.some(_iz => _iz.count < 1);

    if (notExistCount) {
      $scope.error = "##word.err_exist_count##";
      return;
    };

    let sameUnit = false;

    if ($scope.units_switch.items && $scope.units_switch.items.length > 0) {
      $scope.units_switch.items.forEach(_sW_i => {
        if (_sW_i.unit && _sW_i.units_trans && _sW_i.unit.id == _sW_i.units_trans.id) {
          sameUnit = true;
        }
      });
    } else {
      $scope.error = "##word.should_add_items##";
      return;
    };

    if (sameUnit) {
      $scope.error = "##word.units_trans_err##";
      return;
    };



    if ($scope.units_switch.items.length > 0) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/units_switch/add",
        data: $scope.units_switch
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            site.hideModal('#addUnitsSwitchModal');
            $scope.loadAll();

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
    } else {
      $scope.error = "##word.must_enter_quantity##";
      return;
    }
  };

  $scope.remove = function (units_switch) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(units_switch);
        $scope.units_switch = {};
        site.showModal('#deleteUnitsSwitchModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.view = function (units_switch) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/units_switch/view",
      data: {
        _id: units_switch._id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.units_switch = response.data.doc;
        } else $scope.error = response.data.error;
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.details = function (units_switch) {
    $scope.error = '';
    $scope.view(units_switch);
    $scope.units_switch = {};
    site.showModal('#viewUnitsSwitchModal');
  };

  $scope.delete = function (units_switch) {
    $scope.error = '';
    $scope.getStockItems(units_switch.items, callback => {

      if (!callback) {

        $scope.busy = true;
        $http({
          method: "POST",
          url: "/api/units_switch/delete",
          data: units_switch
        }).then(
          function (response) {
            $scope.busy = false;
            if (response.data.done) {
              site.hideModal('#deleteUnitsSwitchModal');
              $scope.loadAll();
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
        foundSize = $scope.units_switch.items.some(_itemSize => _itemSize.barcode == _size.barcode);
        if (_size.count > 0 && !foundSize) {
          $scope.units_switch.items.unshift({
            image_url: $scope.item.image_url,
            name: _size.name,
            item_group: _size.item_group,
            size: _size.size,
            size_en: _size.size_en,
            size_units_list: _size.size_units_list,
            unit: _size.unit,
            barcode: _size.barcode,
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
      vendor: $scope.units_switch.vendor,
      store: $scope.units_switch.store,
      count: 1,
      cost: 0,
      price: 0,
      size: '',
      current_count: 0,
    });
  };

  $scope.getItemsName = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/stores_items/all",
        data: {
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
                    let indxUnit = 0;

                    if (_size.size_units_list && _size.size_units_list.length > 0)
                      _size.size_units_list.forEach((_unit, i) => {
                        if ((_unit.barcode == $scope.item.search_item_name) && typeof _unit.barcode == 'string') {
                          foundUnit = true;
                        }
                        if (_unit.id == _item.main_unit.id)
                          indxUnit = i;
                      });

                    if ((_size.barcode == $scope.item.search_item_name) || foundUnit) {
                      _size.name = _item.name;
                      _size.item_group = _item.item_group;
                      _size.store = $scope.units_switch.store;
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
                                if (_store.store.id == $scope.units_switch.store.id) {
                                  indxStore = i;
                                  foundStore = true;

                                  if (_store.hold) {
                                    foundHold = true;
                                  }
                                }
                              });
                              if (foundStore) {

                                _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unit => {
                                  if (_unit.id == _item.main_unit.id)
                                    _size.store_count = _unit.current_count;
                                });
                              }
                            } else _size.store_count = 0;

                          } else _size.store_count = 0;
                        } else _size.store_count = 0;

                      } else _size.store_count = 0;

                      foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode == _size.barcode);

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

  $scope.itemsStoresAssemble = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    let foundSize = false;
    if ($scope.item.name && $scope.item.name.sizes && $scope.item.name.sizes.length > 0) {

      $scope.item.name.sizes.forEach(_item => {
        let foundHold = false;

        _item.name = $scope.item.name.name;
        _item.item_group = $scope.item.name.item_group;
        _item.store = $scope.units_switch.store;
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
          let foundBranch = false
          let indxBranch = 0
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
                  if (_store.store.id == $scope.units_switch.store.id) {
                    foundStore = true;
                    indxStore = i;
                    if (_store.hold) foundHold = true;

                  }
                });
                if (foundStore)
                  _item.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unit => {
                    if (_unit.id == $scope.item.name.main_unit.id) {
                      _item.store_count = _unit.current_count;

                    }
                  });
              } else _item.store_count = 0;

            } else _item.store_count = 0;
          } else _item.store_count = 0;

        } else _item.store_count = 0;
        foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode == _item.barcode);
        if (!foundSize && !foundHold)
          $scope.item.sizes.unshift(_item);
      });
    };
  };

  $scope.getBarcode = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/stores_items/all",
        data: {
          where: { barcode: $scope.search_barcode }
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
                  let indxUnit = 0;

                  if (_size.size_units_list && _size.size_units_list.length > 0)
                    _size.size_units_list.forEach((_unit, i) => {
                      if ((_unit.barcode == $scope.search_barcode) && typeof _unit.barcode == 'string') {
                        foundUnit = true;
                      }
                      if (_unit.id == response.data.list[0].main_unit.id)
                        indxUnit = i;


                    });
                  if ((_size.barcode == $scope.search_barcode) || foundUnit) {
                    _size.name = response.data.list[0].name;
                    _size.item_group = response.data.list[0].item_group;
                    _size.store = $scope.units_switch.store;
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
                              if (_store.store.id == $scope.units_switch.store.id) {
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

                    foundSize = $scope.units_switch.items.some(_itemSize => _itemSize.barcode == _size.barcode);
                    if (!foundSize && !foundHold)
                      $scope.units_switch.items.unshift(_size);
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

  $scope.edit = function (units_switch) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(units_switch);
        $scope.units_switch = {};
        $scope.edit_price = false;
        site.showModal('#updateUnitsSwitchModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.update = function () {
    $scope.error = '';

    if (new Date($scope.units_switch.date) > new Date()) {

      $scope.error = "##word.date_exceed##";
      return;

    };

    let notExistCount = $scope.units_switch.items.some(_iz => _iz.count < 1);

    if (notExistCount) {
      $scope.error = "##word.err_exist_count##";
      return;
    };


    let sameUnit = false;

    if ($scope.units_switch.items && $scope.units_switch.items.length > 0) {

      $scope.units_switch.items.forEach(_sW_i => {
        if (_sW_i.unit && _sW_i.units_trans && _sW_i.unit.id == _sW_i.units_trans.id) {
          sameUnit = true;
        }
      });
    } else {
      $scope.error = "##word.should_add_items##";
      return;
    };

    if (sameUnit) {
      $scope.error = "##word.units_trans_err##";
      return;
    };



    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/units_switch/update",
      data: $scope.units_switch
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateUnitsSwitchModal');
          $scope.loadAll();
        } else {
          $scope.error = '##word.error##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.posting = function (units_switch) {
    $scope.error = '';
    $scope.getStockItems(units_switch.items, callback => {

      if (!callback) {
        $scope.busy = true;
        $http({
          method: "POST",
          url: "/api/units_switch/posting",
          data: units_switch
        }).then(
          function (response) {
            $scope.busy = false;
            if (response.data.done) {
              $scope.loadAll();
            } else {
              $scope.error = '##word.error##';
              if (response.data.error.like('*OverDraft Not*')) {
                $scope.error = "##word.overdraft_not_active##"
              }
            }
          },
          function (err) {
            console.log(err);
          }
        )
      } else {
        if (units_switch.posting)
          units_switch.posting = false;
        else units_switch.posting = true;
        $scope.error = '##word.err_stock_item##';
      }
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

    site.hideModal('#StoresAssembleSearchModal');

  };

  $scope.loadAll = function (where) {
    $scope.error = '';
    $scope.list = [];
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/units_switch/all",
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