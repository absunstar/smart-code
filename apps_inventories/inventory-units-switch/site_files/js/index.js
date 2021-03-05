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

  $scope.addDays = function (date, days) {
    let result = new Date(date);
    result.setTime(result.getTime() + (days * 24 * 60 * 60 * 1000));
    return result;
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
            $scope.units_switch.store = $scope.storesList.find(_store => { return _store.id === $scope.defaultSettings.inventory.store.id });


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




    if ($scope.units_switch.items.length > 0) {

      let obj = {
        patchCount: false,
        patch_list: []
      };

      let sameUnit = false;

      $scope.units_switch.items.forEach(_sW_i => {
        if (_sW_i.unit && _sW_i.units_trans && _sW_i.unit.id == _sW_i.units_trans.id) {
          sameUnit = true;
        }

        if (_sW_i.size_units_list && _sW_i.size_units_list.length > 0) {

          let count = 0;
          if (_sW_i.patch_list && _sW_i.patch_list.length > 0) {
            _sW_i.patch_list.forEach(_pl => {
              if (typeof _pl.count === 'number') {
                count += _pl.count;
              } else {
                obj.patchCount = true;
                obj.patch_list.push(_sW_i.barcode);
              }

            });
          } else if (_sW_i.work_serial || _sW_i.work_patch) {
            obj.patchCount = true;
            obj.patch_list.push(_sW_i.barcode)
          }
          if (count != _sW_i.count && (_sW_i.work_serial || _sW_i.work_patch)) {
            obj.patchCount = true;
            obj.patch_list.push(_sW_i.barcode)
          }

        }

      });
      obj.patch_list = obj.patch_list.filter(function (item, pos) {
        return obj.patch_list.indexOf(item) === pos;
      });

      if (obj.patchCount) {
        $scope.error = `##word.err_patch_count## ( ${obj.patch_list.join('-')} )`;
        return;
      };
      if (sameUnit) {
        $scope.error = "##word.units_trans_err##";
        return;
      };



      $scope.testPatches($scope.units_switch, callback => {

        if (callback.patchCount) {
          $scope.error = `##word.err_patch_count## ##word.patch_trans##   ( ${callback.patch_list.join('-')} )`;
          return;
        };

        if (callback.not_patch) {
          $scope.error = `##word.err_find_serial## ##word.patch_trans##   ( ${callback.patch_list.join('-')} )`;
          return;
        };

        if (callback.exist_serial) {
          $scope.error = `##word.serial_pre_existing##  ##word.patch_trans##  ( ${callback.patch_list.join('-')} )`;
          return;
        };

        if (callback.errDate) {
          $scope.error = '##word.err_patch_date##';
          return;
        }

        $scope.financialYear($scope.units_switch.date, is_allowed_date => {
          if (!is_allowed_date) {
            $scope.error = '##word.should_open_period##';
          } else {

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
                  $scope.loadAll({ date: new Date() });

                } else {

                  $scope.error = response.data.error;
                  if (response.data.error.like('*OverDraft Not*')) {
                    $scope.error = "##word.overdraft_not_active##"
                  } else if (response.data.error.like('*n`t Found Open Shi*')) {
                    $scope.error = "##word.open_shift_not_found##"
                  } else if (response.data.error.like('*n`t Open Perio*')) {
                    $scope.error = "##word.should_open_period##"
                  } else if (response.data.error.like('*Must Enter Code*')) {
                    $scope.error = "##word.must_enter_code##"
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

        $scope.financialYear(units_switch.date, is_allowed_date => {
          if (!is_allowed_date) {
            $scope.error = '##word.should_open_period##';
          } else {


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
                  } else if (response.data.error.like('*n`t Found Open Shi*')) {
                    $scope.error = "##word.open_shift_not_found##"
                  } else if (response.data.error.like('*n`t Open Perio*')) {
                    $scope.error = "##word.should_open_period##"
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
        foundSize = $scope.units_switch.items.some(_itemSize => _itemSize.barcode == _size.barcode);
        if (_size.count > 0 && !foundSize) {
          $scope.units_switch.items.unshift({
            image_url: $scope.item.image_url,
            name_ar: _size.name_ar,
            name_en: _size.name_en,
            item_group: _size.item_group,
            size_ar: _size.size_ar,
            size_en: _size.size_en,
            size_units_list: _size.size_units_list,
            unit: _size.unit,
            barcode: _size.barcode,
            work_patch: _size.work_patch,
            work_serial: _size.work_serial,
            complex_items: _size.complex_items,
            item_complex: _size.item_complex,
            average_cost: _size.average_cost,
            validit: _size.validit,
            count: _size.count,
            store_count: _size.store_count,
            cost: _size.cost,
            price: _size.price,
            current_count: _size.current_count
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
          where: { 'item_type.id': { $ne: 2 } },
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
                    let indxUnit = 0;

                    if (_size.size_units_list && _size.size_units_list.length > 0)
                      _size.size_units_list.forEach((_unit, i) => {

                        if (_unit.id == _item.main_unit.id)
                          indxUnit = i;
                      });

                    if ((_size.barcode == $scope.item.search_item_name) || (_size.size_units_list[indxUnit].barcode === $scope.item.search_item_name)) {
                      _size.name_ar = _item.name_ar;
                      _size.name_en = _item.name_en;
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
    if ($scope.item.itm && $scope.item.itm.sizes && $scope.item.itm.sizes.length > 0) {

      $scope.item.itm.sizes.forEach(_item => {
        let foundHold = false;

        _item.name_ar = $scope.item.itm.name_ar;
        _item.name_en = $scope.item.itm.name_en;
        _item.item_group = $scope.item.itm.item_group;
        _item.store = $scope.units_switch.store;
        let indxUnit = 0;
        if (_item.size_units_list && _item.size_units_list.length > 0) {
          indxUnit = _item.size_units_list.findIndex(_unit => _unit.id == $scope.item.itm.main_unit.id);
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
                    if (_unit.id == $scope.item.itm.main_unit.id) {
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
          where: { barcode: $scope.search_barcode, 'item_type.id': { $ne: 2 } }
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

                      if (_unit.id == response.data.list[0].main_unit.id)
                        indxUnit = i;

                    });
                  if ((_size.barcode == $scope.search_barcode) || _size.size_units_list[indxUnit].barcode === $scope.search_barcode) {
                    _size.name_ar = response.data.list[0].name_ar;
                    _size.name_en = response.data.list[0].name_en;
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

    if ($scope.units_switch.items.length > 0) {


      let notExistCount = $scope.units_switch.items.some(_iz => _iz.count < 1);

      if (notExistCount) {
        $scope.error = "##word.err_exist_count##";
        return;
      };

      let obj = {
        patchCount: false,
        patch_list: []
      };

      let sameUnit = false;

      $scope.units_switch.items.forEach(_sW_i => {
        if (_sW_i.unit && _sW_i.units_trans && _sW_i.unit.id == _sW_i.units_trans.id) {
          sameUnit = true;
        }

        if (_sW_i.size_units_list && _sW_i.size_units_list.length > 0) {

          let count = 0;

          if (_sW_i.patch_list && _sW_i.patch_list.length > 0) {
            _sW_i.patch_list.forEach(_pl => {
              if (typeof _pl.count === 'number') {
                count += _pl.count;
              } else {
                obj.patchCount = true;
                obj.patch_list.push(_sW_i.barcode);
              }

            });

          } else if (_sW_i.work_serial || _sW_i.work_patch) {
            obj.patchCount = true;
            obj.patch_list.push(_sW_i.barcode)
          }
          if (count != _sW_i.count && (_sW_i.work_serial || _sW_i.work_patch)) {
            obj.patchCount = true;
            obj.patch_list.push(_sW_i.barcode)
          }
        }
      });

      obj.patch_list = obj.patch_list.filter(function (item, pos) {
        return obj.patch_list.indexOf(item) === pos;
      });

      if (obj.patchCount) {
        $scope.error = `##word.err_patch_count## ( ${obj.patch_list.join('-')} )`;
        return;
      };

      if (sameUnit) {
        $scope.error = "##word.units_trans_err##";
        return;
      };

      $scope.testPatches($scope.units_switch, callback => {

        if (callback.patchCount) {
          $scope.error = `##word.err_patch_count## ##word.patch_trans##   ( ${callback.patch_list.join('-')} )`;
          return;
        };

        if (callback.not_patch) {
          $scope.error = `##word.err_find_serial## ##word.patch_trans##   ( ${callback.patch_list.join('-')} )`;
          return;
        };

        if (callback.exist_serial) {
          $scope.error = `##word.serial_pre_existing##  ##word.patch_trans##  ( ${callback.patch_list.join('-')} )`;
          return;
        };

        if (callback.errDate) {
          $scope.error = '##word.err_patch_date##';
          return;
        }
        $scope.financialYear($scope.units_switch.date, is_allowed_date => {
          if (!is_allowed_date) {
            $scope.error = '##word.should_open_period##';
          } else {


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
                  if (response.data.error.like('*n`t Found Open Shi*')) {
                    $scope.error = "##word.open_shift_not_found##"
                  } else if (response.data.error.like('*n`t Open Perio*')) {
                    $scope.error = "##word.should_open_period##"
                  }
                }
              },
              function (err) {
                console.log(err);
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

  $scope.posting = function (units_switch) {
    $scope.error = '';
    $scope.getStockItems(units_switch.items, callback => {

      let obj = {
        patchCount: false,
        patch_list: []
      };

      let sameUnit = false;

      units_switch.items.forEach(_sW_i => {
        if (_sW_i.unit && _sW_i.units_trans && _sW_i.unit.id == _sW_i.units_trans.id) {
          sameUnit = true;
        }

        if (_sW_i.size_units_list && _sW_i.size_units_list.length > 0) {

          let count = 0;

          if (_sW_i.patch_list && _sW_i.patch_list.length > 0) {
            _sW_i.patch_list.forEach(_pl => {
              if (typeof _pl.count === 'number') {
                count += _pl.count;
              } else {
                obj.patchCount = true;
                obj.patch_list.push(_sW_i.barcode);
              }

            });

          } else if (_sW_i.work_serial || _sW_i.work_patch) {
            obj.patchCount = true;
            obj.patch_list.push(_sW_i.barcode)
          }
          if (count != _sW_i.count && (_sW_i.work_serial || _sW_i.work_patch)) {
            obj.patchCount = true;
            obj.patch_list.push(_sW_i.barcode)
          }
        }
      });

      obj.patch_list = obj.patch_list.filter(function (item, pos) {
        return obj.patch_list.indexOf(item) === pos;
      });

      if (obj.patchCount) {
        $scope.error = `##word.err_patch_count## ( ${obj.patch_list.join('-')} )`;
        return;
      };

      if (sameUnit) {
        $scope.error = "##word.units_trans_err##";
        return;
      };

      $scope.testPatches(units_switch, callbackTest => {

        if (callbackTest.patchCount) {
          $scope.error = `##word.err_patch_count## ##word.patch_trans##   ( ${callbackTest.patch_list.join('-')} )`;
          return;
        };

        if (callbackTest.not_patch) {
          $scope.error = `##word.err_find_serial## ##word.patch_trans##   ( ${callbackTest.patch_list.join('-')} )`;
          return;
        };

        if (callbackTest.exist_serial) {
          $scope.error = `##word.serial_pre_existing##  ##word.patch_trans##  ( ${callbackTest.patch_list.join('-')} )`;
          return;
        };

        if (callbackTest.errDate) {
          $scope.error = '##word.err_patch_date##';
          return;
        }


        if (!callback) {


          $scope.financialYear(units_switch.date, is_allowed_date => {
            if (!is_allowed_date) {
              $scope.error = '##word.should_open_period##';
              if (units_switch.posting) units_switch.posting = false;
              else units_switch.posting = true;
            } else {


              $scope.busy = true;
              $http({
                method: "POST",
                url: "/api/units_switch/posting",
                data: units_switch
              }).then(
                function (response) {
                  $scope.busy = false;
                  if (response.data.done) {
                  } else {
                    $scope.error = '##word.error##';
                    if (response.data.error.like('*OverDraft Not*')) {
                      $scope.error = "##word.overdraft_not_active##"
                    } else if (response.data.error.like('*n`t Found Open Shi*')) {
                      $scope.error = "##word.open_shift_not_found##"
                    } else if (response.data.error.like('*n`t Open Perio*')) {
                      $scope.error = "##word.should_open_period##"
                    }
                    if (units_switch.posting) units_switch.posting = false;
                    else units_switch.posting = true;
                  }
                },
                function (err) {
                  console.log(err);
                }
              )
            }
          })
        } else {
          if (units_switch.posting)
            units_switch.posting = false;
          else units_switch.posting = true;
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
      data: { select: { id: 1, name_ar: 1, name_en: 1, type: 1, code: 1 } }
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
          name_ar: 1, name_en: 1,
          code: 1
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


  $scope.calc = function (obj) {
    $timeout(() => {
      $scope.error = '';
      if (obj.units_trans && obj.units_trans.id) {
        obj.count_trans = (obj.unit.convert * obj.count) / obj.units_trans.convert
      } else {
        obj.count = 1;
        obj.count_trans = 0;
        $scope.error = '##word.err_units_trans##';
      }
    }, 250);
  };

  $scope.calcTrance = function (obj) {
    $timeout(() => {
      $scope.error = '';
      if (obj.units_trans && obj.units_trans.id) {
        obj.count = (obj.units_trans.convert * obj.count_trans) / obj.unit.convert
      } else {
        obj.count = 1;
        obj.count_trans = 0;
        $scope.error = '##word.err_units_trans##'
      }
    }, 250);
  };



  $scope.viewPatchesList = function (itm, value) {
    $scope.error = '';
    $scope.item_patch = itm;

    if (value === 'patch') site.showModal('#patchesListViewModal');
    else if (value === 'patch_trans') site.showModal('#patchesTransListViewModal');

  };


  $scope.patchesListSwitch = function (itm) {
    $scope.error = '';
    if (itm.units_trans && itm.units_trans.id) {

      $scope.item_patch = itm;

      let mini_code = $scope.item_patch.barcode.slice(-3);
      let r_code = Math.floor((Math.random() * 1000) + 1);
      if (!$scope.item_patch.patch_trans_list) {

        if ($scope.item_patch.work_serial) {
          $scope.item_patch.patch_trans_list = [];
          for (let i = 0; i < $scope.item_patch.count_trans; i++) {
            let r_code2 = Math.floor((Math.random() * 1000) + 1);

            $scope.item_patch.patch_trans_list.push({
              patch: mini_code + r_code2 + ($scope.item_patch.patch_trans_list.length + i),
              count: 1
            })
          }

        } else {
          $scope.item_patch.patch_trans_list = [{
            patch: mini_code + r_code + (itm.validit || '00') + 1,
            production_date: new Date(),
            expiry_date: new Date($scope.addDays(new Date(), (itm.validit || 0))),
            validit: (itm.validit || 0),
            count: itm.count_trans
          }];
        }

      } else if ($scope.item_patch.patch_trans_list && $scope.item_patch.patch_trans_list.length == 1 && $scope.item_patch.work_patch) {
        $scope.item_patch.patch_trans_list[0].count = itm.count_trans

      } else {

        if ($scope.item_patch.work_serial) {
          let count = $scope.item_patch.count_trans - $scope.item_patch.patch_trans_list.length;
          let r_code2 = Math.floor((Math.random() * 1000) + 1);
          for (let i = 0; i < count; i++) {
            $scope.item_patch.patch_trans_list.unshift({
              patch: mini_code + r_code2 + i,
              count: 1
            })
          }

        }

      }

      site.showModal('#patchesListSwitchModal');
    } else {
      $scope.error = '##word.must_unit_trans##'
    }

  };

  $scope.patchesList = function (itm) {
    $scope.error = '';
    $scope.item_patch = itm;

    $http({
      method: "POST",
      url: "/api/stores_items/all",
      data: {
        where: {
          store_id: $scope.units_switch.store.id,
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

              _resPatch.current_count = _resPatch.count;
              _resPatch.count = 0;
              if ($scope.item_patch.patch_list && $scope.item_patch.patch_list.length > 0)
                $scope.item_patch.patch_list.forEach(_itemPatch => {

                  if (_resPatch.patch == _itemPatch.patch) {
                    _resPatch.count = _itemPatch.count;
                    _resPatch.current_count = _itemPatch.current_count;
                    if (_itemPatch.select) _resPatch.select = _itemPatch.select;
                  }

                });
            });
            $scope.item_patch.patch_list = response.data.patch_list;
            site.showModal('#patchesListModal');
          }

        }
      }
    )

  };

  $scope.selectAll = function (item_patch, value) {

    if (value === 'patch') {

      item_patch.patch_list.forEach(element => {
        if (item_patch.$select_all) {
          element.select = true
        } else if (!item_patch.$select_all) {
          element.select = false
        }
      });

    } else if (value === 'patch_trans') {

      item_patch.patch_trans_list.forEach(element => {
        if (item_patch.$select_all) {
          element.select = true
        } else if (!item_patch.$select_all) {
          element.select = false
        }

      });
    }
  };

  $scope.addNewPAtch = function (itm) {
    let mini_code = itm.barcode.slice(-3);
    let r_code = Math.floor((Math.random() * 1000) + 1);

    itm.patch_trans_list.unshift({
      patch: mini_code + r_code + (itm.patch_trans_list.length + 1) + (itm.validit || '00'),
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

    if (itm.count != count) {
      $scope.error = '##word.err_patch_count##';
      return;
    };

    if (bigger) {
      $scope.error = '##word.err_patch_current_count##';
      return;
    };

    site.hideModal('#patchesListModal');
    $scope.error = '';
  };

  $scope.exitPatchTransModal = function (itm) {
    $scope.error = '';

    let count = 0;
    let errDate = false;
    let err_find_serial = false;

    itm.patch_trans_list.forEach(_p => {
      count += _p.count;

      if (new Date(_p.expiry_date) < new Date(_p.production_date)) {
        errDate = true
      }
      if (!_p.patch) err_find_serial = true

    });

    if (err_find_serial) {
      $scope.error = '##word.err_find_serial##';
    } else if (errDate) {
      $scope.error = '##word.err_patch_date##';
    } else if (itm.count_trans === count) {
      site.hideModal('#patchesListSwitchModal');

    } else $scope.error = '##word.err_patch_count##';

  };

  $scope.testPatches = function (unitsSwitch, callback) {
    $scope.getSerialList(unitsSwitch.items, serial_list => {
      let obj = {
        patchCount: false,
        errDate: false,
        exist_serial: false,
        not_patch: false,
        patch_list: []
      };

      unitsSwitch.items.forEach(_item => {
        if (_item.size_units_list && _item.size_units_list.length > 0) {

          let count = 0;
          if (_item.patch_trans_list && _item.patch_trans_list.length > 0) {
            _item.patch_trans_list.forEach(_pl => {
              if (typeof _pl.count === 'number') {
                if (new Date(_pl.expiry_date) < new Date(_pl.production_date)) {
                  obj.errDate = true;
                }
                count += _pl.count;

              } else {
                obj.patchCount = true;
                obj.patch_list.push(_item.barcode);
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
          if (count != _item.count_trans && (_item.work_serial || _item.work_patch)) {
            obj.patchCount = true;
            obj.patch_list.push(_item.barcode)
          }

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
        select: { id: 1, name_ar: 1, name_en: 1, code: 1, from_date: 1, from_time: 1, to_date: 1, to_time: 1 }
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

  $scope.getNumberingAutoSwitch = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "units_Switch"
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCodeSwitch = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadStores();
  $scope.loadCategories();
  $scope.getNumberingAutoSwitch();
  $scope.getDefaultSettings();
  $scope.loadAll({ date: new Date() });
});