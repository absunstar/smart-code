app.controller("stores_assemble", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.store_assemble = {
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
    $scope.store_assemble.items.splice($scope.store_assemble.items.indexOf(itm), 1);

  };

  $scope.deleteitem = function (itm) {
    $scope.error = '';
    $scope.item.sizes.splice($scope.item.sizes.indexOf(itm), 1);

  };

  $scope.newStoreAssemble = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.item = {}
        $scope.store_assemble = {
          image_url: '/images/store_assemble.png',
          shift: $scope.shift,
          items: [],
          date: new Date(),
        };
        if ($scope.defaultSettings) {

          if ($scope.defaultSettings.inventory) {
            if ($scope.defaultSettings.inventory.store)
              $scope.store_assemble.store = $scope.defaultSettings.inventory.store

          }
          if ($scope.defaultSettings.general_Settings && !$scope.defaultSettings.general_Settings.work_posting) {
            $scope.store_assemble.posting = true
          }
        }
        site.showModal('#addStoreAssembleModal');
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

    const v = site.validated('#addStoreAssembleModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (new Date($scope.store_assemble.date) > new Date()) {

      $scope.error = "##word.date_exceed##";
      return;

    };

    let notExistCount = $scope.store_assemble.items.some(_iz => _iz.count < 1);

    if (notExistCount) {
      $scope.error = "##word.err_exist_count##";
      return;
    };


    if ($scope.store_assemble.items.length > 0) {

      $scope.testPatches($scope.store_assemble, callback => {

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



        let obj = {
          patchCount: false,
          patch_list: []
        };

        $scope.store_assemble.items.forEach(_itm => {
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
          $scope.error = `##word.err_patch_count_comp##   ( ${obj.patch_list.join('-')} )`;
          return;
        };

        $scope.financialYear($scope.store_assemble.date, is_allowed_date => {
          if (!is_allowed_date) {
            $scope.error = '##word.should_open_period##';
          } else {

            $scope.busy = true;
            $http({
              method: "POST",
              url: "/api/stores_assemble/add",
              data: $scope.store_assemble
            }).then(
              function (response) {
                $scope.busy = false;
                if (response.data.done) {
                  site.hideModal('#addStoreAssembleModal');
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

  $scope.remove = function (store_assemble) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_assemble);
        $scope.store_assemble = {};
        site.showModal('#deleteStoreAssembleModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.view = function (store_assemble, view) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_assemble/view",
      data: {
        _id: store_assemble._id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.store_assemble = response.data.doc;
          if (view == 'view') $scope.store_assemble.$view = true;
        } else $scope.error = response.data.error;
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.details = function (store_assemble) {
    $scope.error = '';
    $scope.view(store_assemble, 'view');
    $scope.store_assemble = {};
    site.showModal('#viewStoreAssembleModal');
  };

  $scope.delete = function (store_assemble) {
    $scope.error = '';
    $scope.getStockItems(store_assemble.items, callback => {

      if (!callback) {


        $scope.financialYear(store_assemble.date, is_allowed_date => {
          if (!is_allowed_date) {
            $scope.error = '##word.should_open_period##';
          } else {

            $scope.busy = true;
            $http({
              method: "POST",
              url: "/api/stores_assemble/delete",
              data: store_assemble
            }).then(
              function (response) {
                $scope.busy = false;
                if (response.data.done) {
                  site.hideModal('#deleteStoreAssembleModal');
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
        foundSize = $scope.store_assemble.items.some(_itemSize => _itemSize.barcode === _size.barcode);
        if (_size.count > 0 && !foundSize) {
          $scope.store_assemble.items.unshift({
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
            work_patch: _size.work_patch,
            work_serial: _size.work_serial,
            item_complex: _size.item_complex,
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
      vendor: $scope.store_assemble.vendor,
      store: $scope.store_assemble.store,
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

                        if (_unit.id == _item.main_unit.id)
                          indxUnit = i;
                      });

                    if ((_size.barcode === $scope.item.search_item_name) || (_size.size_units_list[indxUnit].barcode === $scope.item.search_item_name)) {
                      _size.name = _item.name;
                      _size.item_group = _item.item_group;
                      _size.store = $scope.store_assemble.store;
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
                                if (_store.store.id == $scope.store_assemble.store.id) {
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

  $scope.itemsStoresAssemble = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    let foundSize = false;
    if ($scope.item.name && $scope.item.name.sizes && $scope.item.name.sizes.length > 0) {

      $scope.item.name.sizes.forEach(_item => {
        let foundHold = false;

        _item.name = $scope.item.name.name;
        _item.item_group = $scope.item.name.item_group;
        _item.store = $scope.store_assemble.store;
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
                  if (_store.store.id == $scope.store_assemble.store.id) {
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
        if (!foundSize && _item.item_complex && !foundHold)
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

                      if (_unit.id == response.data.list[0].main_unit.id)
                        indxUnit = i;

                    });
                  if ((_size.barcode == $scope.search_barcode) || _size.size_units_list[indxUnit].barcode === $scope.search_barcode) {
                    _size.name = response.data.list[0].name;
                    _size.item_group = response.data.list[0].item_group;
                    _size.store = $scope.store_assemble.store;
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
                              if (_store.store.id == $scope.store_assemble.store.id) {
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

                    foundSize = $scope.store_assemble.items.some(_itemSize => _itemSize.barcode == _size.barcode);
                    if (!foundSize && _size.item_complex && !foundHold)
                      $scope.store_assemble.items.unshift(_size);
                    else if (foundSize) {
                      $scope.store_assemble.items.forEach(_item => {
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

  $scope.edit = function (store_assemble) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_assemble);
        $scope.store_assemble = {};
        $scope.edit_price = false;
        site.showModal('#updateStoreAssembleModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.update = function () {
    $scope.error = '';

    if (new Date($scope.store_assemble.date) > new Date()) {

      $scope.error = "##word.date_exceed##";
      return;

    };

    let notExistCount = $scope.store_assemble.items.some(_iz => _iz.count < 1);

    if (notExistCount) {
      $scope.error = "##word.err_exist_count##";
      return;
    };

    $scope.testPatches($scope.store_assemble, callback => {

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


      let obj = {
        patchCount: false,
        patch_list: []
      };

      $scope.store_assemble.items.forEach(_itm => {
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
        $scope.error = `##word.err_patch_count_comp##   ( ${obj.patch_list.join('-')} )`;
        return;
      };

      $scope.financialYear($scope.store_assemble.date, is_allowed_date => {
        if (!is_allowed_date) {
          $scope.error = '##word.should_open_period##';
        } else {


          $scope.busy = true;
          $http({
            method: "POST",
            url: "/api/stores_assemble/update",
            data: $scope.store_assemble
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done) {
                $scope.loadAll({ date: new Date() });
                site.hideModal('#updateStoreAssembleModal');
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

  $scope.posting = function (store_assemble) {
    $scope.error = '';
    $scope.getStockItems(store_assemble.items, callback => {
      $scope.testPatches(store_assemble, callbackTest => {

        if (callbackTest.patchCount) {
          if (store_assemble.posting) store_assemble.posting = false;
          else store_assemble.posting = true;
          $scope.error = `##word.err_patch_count##   ( ${callbackTest.patch_list.join('-')} )`;
          return;
        };

        if (callbackTest.not_patch) {
          if (store_assemble.posting) store_assemble.posting = false;
          else store_assemble.posting = true;
          $scope.error = `##word.err_find_serial##   ( ${callbackTest.patch_list.join('-')} )`;
          return;
        };

        if (callbackTest.exist_serial && store_assemble.posting) {
          if (store_assemble.posting) store_assemble.posting = false;
          else store_assemble.posting = true;
          $scope.error = `##word.serial_pre_existing##   ( ${callbackTest.patch_list.join('-')} )`;
          return;
        };

        if (callbackTest.errDate) {
          if (store_assemble.posting) store_assemble.posting = false;
          else store_assemble.posting = true;
          $scope.error = '##word.err_patch_date##';
          return;
        };


        let obj = {
          patchCount: false,
          patch_list: []
        };

        store_assemble.items.forEach(_itm => {
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
          if (store_assemble.posting) store_assemble.posting = false;
          else store_assemble.posting = true;
          $scope.error = `##word.err_patch_count_comp##   ( ${obj.patch_list.join('-')} )`;
          return;
        };


        if (!callback) {

          $scope.financialYear(store_assemble.date, is_allowed_date => {
            if (!is_allowed_date) {
              $scope.error = '##word.should_open_period##';
              
              if (store_assemble.posting) store_assemble.posting = false;
              else store_assemble.posting = true;
              
            } else {


              $scope.busy = true;
              $http({
                method: "POST",
                url: "/api/stores_assemble/posting",
                data: store_assemble
              }).then(
                function (response) {
                  $scope.busy = false;
                  if (response.data.done) {
                  } else {
                    $scope.error = '##word.error##';
                    if (response.data.error.like('*OverDraft Not*')) {
                      $scope.error = "##word.overdraft_not_active##"
                      if (store_assemble.posting) store_assemble.posting = false;
                      else store_assemble.posting = true;
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
          if (store_assemble.posting) store_assemble.posting = false;
          else store_assemble.posting = true;
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

    site.hideModal('#StoresAssembleSearchModal');

  };

  $scope.loadAll = function (where) {
    $scope.error = '';
    $scope.list = [];
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_assemble/all",
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
      });
    }
    $scope.complexView = itm;

    site.showModal('#complexViewModal');

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

  $scope.patchesComplexList = function (itm) {
    $scope.error = '';
    $scope.item_patch = itm;

    $http({
      method: "POST",
      url: "/api/stores_items/all",
      data: {
        where: {
          store_id: $scope.store_assemble.store.id,
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
              if ($scope.item_patch.patch_list && $scope.item_patch.patch_list.length > 0) {

                $scope.item_patch.patch_list.forEach(_itemPatch => {

                  if (_resPatch.patch === _itemPatch.patch) {
                    _resPatch.count = _itemPatch.count
                    _resPatch.current_count = _itemPatch.current_count
                    if (_itemPatch.select) _resPatch.select = _itemPatch.select
                  }

                });
              }
            });
            $scope.item_patch.patch_list = response.data.patch_list;
            site.showModal('#patchesComplexListModal');
          }

        }
      })


  };

  $scope.patchesList = function (itm) {
    $scope.error = '';

    $scope.item_patch = itm;

    let mini_code = $scope.item_patch.barcode.slice(-3);
    let r_code = Math.floor((Math.random() * 1000) + 1);
    if (!$scope.item_patch.patch_list) {

      if ($scope.item_patch.work_serial) {
        $scope.item_patch.patch_list = [];
        for (let i = 0; i < $scope.item_patch.count; i++) {
          let r_code2 = Math.floor((Math.random() * 1000) + 1);

          $scope.item_patch.patch_list.push({
            patch: mini_code + r_code2 + ($scope.item_patch.patch_list.length + i),
            count: 1
          })
        }

      } else {
        $scope.item_patch.patch_list = [{
          patch: mini_code + r_code + (itm.validit || '00') + 1,
          production_date: new Date(),
          expiry_date: new Date($scope.addDays(new Date(), (itm.validit || 0))),
          count: itm.count,
          validit: (itm.validit || 0)
        }];
      }


    } else if ($scope.item_patch.patch_list && $scope.item_patch.patch_list.length == 1 && $scope.item_patch.work_patch) {
      $scope.item_patch.patch_list[0].count = itm.count

    } else {

      if ($scope.item_patch.work_serial) {
        let count = $scope.item_patch.count - $scope.item_patch.patch_list.length;
        let r_code2 = Math.floor((Math.random() * 1000) + 1);
        for (let i = 0; i < count; i++) {
          $scope.item_patch.patch_list.unshift({
            patch: mini_code + r_code2 + i,
            count: 1
          })
        }

      }

    }
    site.showModal('#patchesListModal');
  };

  $scope.testPatches = function (storeAssemble, callback) {
    $scope.getSerialList(storeAssemble.items, serial_list => {
      let obj = {
        patchCount: false,
        errDate: false,
        exist_serial: false,
        not_patch: false,
        patch_list: []
      };

      if (storeAssemble.items && storeAssemble.items.length > 0)
        storeAssemble.items.forEach(_item => {
          if (_item.size_units_list && _item.size_units_list.length > 0) {

            let count = 0;
            if (_item.patch_list && _item.patch_list.length > 0) {
              _item.patch_list.forEach(_pl => {
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

  $scope.exitPatchComplexModal = function (itm) {
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

    if (itm.patches_count != count) {
      $scope.error = '##word.err_patch_count##';
      return;
    };

    if (bigger) {
      $scope.error = '##word.err_patch_current_count##';
      return;
    };

    site.hideModal('#patchesComplexListModal');
    $scope.error = '';
  };


  $scope.exitPatchModal = function (itm) {
    $scope.error = '';

    let count = 0;
    let errDate = false;
    let err_find_serial = false;

    itm.patch_list.forEach(_p => {
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
    } else if (itm.count === count) {
      site.hideModal('#patchesListModal');

    } else $scope.error = '##word.err_patch_count##';

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


  $scope.selectAll = function (item_patch) {
    item_patch.patch_list.forEach(element => {
      if (item_patch.$select_all) {
        element.select = true
      } else if (!item_patch.$select_all) {
        element.select = false
      }
    });
  };

  $scope.financialYear = function (date, callback) {

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