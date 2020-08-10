app.controller("transfer_branch", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.transfer_branch = {
    discountes: [],
    taxes: [],
    details: []
  };
  $scope.search = {};
  $scope.item = {
    sizes: []
  };

  $scope.deleteRow = function (itm) {
    $scope.error = '';
    $scope.transfer_branch.items.splice($scope.transfer_branch.items.indexOf(itm), 1);

  };

  $scope.deleteitem = function (itm) {
    $scope.error = '';
    $scope.item.sizes.splice($scope.item.sizes.indexOf(itm), 1);

  };
  $scope.newTransferBranch = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.item = {}
        $scope.transfer_branch = {
          image_url: '/images/transfer_branch.png',
          shift: $scope.shift,
          items: [],
          discountes: [],
          taxes: [],
          details: [],
          date: new Date(),
          supply_date: new Date(),
          branch_from: $scope.branchCode
        };

        if ($scope.defaultSettings.inventory) {
          if ($scope.defaultSettings.inventory.store)
            $scope.transfer_branch.store_from = $scope.defaultSettings.inventory.store
        } site.showModal('#addTransferBranchModal');
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
    const v = site.validated('#addTransferBranchModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (new Date($scope.transfer_branch.date) > new Date()) {

      $scope.error = "##word.date_exceed##";
      return;

    };

    if ($scope.transfer_branch.store_from && $scope.transfer_branch.store_to && $scope.transfer_branch.store_from.id === $scope.transfer_branch.store_to.id) {
      $scope.error = "##word.cant_transfer_to_same_store##";
      return;
    }

    let notExistCount = $scope.transfer_branch.items.some(_iz => _iz.count < 1);

    if (notExistCount) {
      $scope.error = "##word.err_exist_count##";
      return;
    };

    if ($scope.transfer_branch.items.length > 0) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/transfer_branch/add",
        data: $scope.transfer_branch
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            site.hideModal('#addTransferBranchModal');
            $scope.loadAll();

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

  $scope.remove = function (transfer_branch) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(transfer_branch);
        $scope.transfer_branch = {};
        site.showModal('#deleteTransferBranchModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.view = function (transfer_branch) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/transfer_branch/view",
      data: {
        _id: transfer_branch._id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.transfer_branch = response.data.doc;
        } else $scope.error = response.data.error;
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.details = function (transfer_branch) {
    $scope.error = '';
    $scope.view(transfer_branch);
    $scope.transfer_branch = {};
    site.showModal('#viewTransferBranchModal');
  };

  $scope.delete = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/transfer_branch/delete",
      data: {
        _id: $scope.transfer_branch._id,
        name: $scope.transfer_branch.name
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteTransferBranchModal');
          $scope.loadAll();
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
        foundSize = $scope.transfer_branch.items.some(_itemSize => _itemSize.barcode == _size.barcode);

        if (_size.count > 0 && !foundSize) {
          $scope.transfer_branch.items.push({
            image_url: $scope.item.image_url,
            name: _size.name,
            size: _size.size,
            item_group: _size.item_group,
            size_en: _size.size_en,
            size_units_list: _size.size_units_list,
            unit: _size.unit,
            barcode: _size.barcode,
            average_cost: _size.average_cost,
            count: _size.count,
            cost: _size.cost,
            price: _size.price,
            store_count: _size.store_count,
            total: _size.total,
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
    $scope.item.sizes.push({
      $new: true,
      customer: $scope.transfer_branch.customer,
      store_from: $scope.transfer_branch.store_from,
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
          search: $scope.item.search_item_name
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
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
                        if (_unit.id == _item.main_unit.id) indxUnit = i;
                      });
                    if ((_size.barcode == $scope.item.search_item_name) || (_size.size_en && _size.size_en.includes($scope.item.search_item_name)) || (_size.size && _size.size.includes($scope.item.search_item_name)) || foundUnit) {
                      _size.name = _item.name;
                      _size.item_group = _item.item_group;
                      _size.store_from = $scope.transfer_branch.store_from;
                      _size.unit = _size.size_units_list[indxUnit];
                      _size.count = 1;
                      _size.total = _size.count * _size.cost;
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
                                if (_store.store.id == $scope.transfer_branch.store_from.id) {
                                  foundStore = true;
                                  indxStore = i;
                                  if (_store.hold) foundHold = true;
                                }
                              });
                              if (foundStore) {

                                if (_size.branches_list[indxBranch].stores_list[indxStore].size_units_list && _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.length > 0)
                                  _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unit => {
                                    if (_unit.id == _item.main_unit.id)
                                      _size.store_count = _unit.current_count
                                  });
                              }
                            } else _size.store_count = 0;
                          } else _size.store_count = 0;
                        } else _size.store_count = 0;
                      } else _size.store_count = 0;
                      foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode == _size.barcode);

                      if (!foundSize && !foundHold) $scope.item.sizes.push(_size);
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

  $scope.itemsTransferBranch = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    let foundSize = false;

    if ($scope.item.name && $scope.item.name.sizes && $scope.item.name.sizes.length > 0)
      $scope.item.name.sizes.forEach(_item => {
        let foundHold = false;
        _item.name = $scope.item.name.name
        _item.item_group = $scope.item.name.item_group;
        _item.store_from = $scope.transfer_branch.store_from
        _item.count = 1;

        let indxUnit = _item.size_units_list.findIndex(_unit => _unit.id == $scope.item.name.main_unit.id);
        _item.unit = _item.size_units_list[indxUnit];

        if (_item.branches_list && _item.branches_list.length > 0) {
          let foundBranch = false
          let indxBranch = 0
          _item.branches_list.map((_branch, i) => {
            if (_branch.code == '##session.branch.code##') {
              foundBranch = true
              indxBranch = i
            }
          });
          if (foundBranch) {

            if (_item.branches_list[indxBranch].code == '##session.branch.code##') {
              if (_item.branches_list[indxBranch].stores_list && _item.branches_list[indxBranch].stores_list.length > 0) {

                let foundStore = false
                let indxStore = 0
                _item.branches_list[indxBranch].stores_list.map((_store, i) => {
                  if (_store.store.id == $scope.transfer_branch.store_from.id) {
                    foundStore = true
                    indxStore = i
                    if (_store.hold) foundHold = true;
                  }
                });
                if (foundStore)
                  _item.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unit => {
                    if (_unit.id == $scope.item.name.main_unit.id)
                      _item.store_count = _unit.current_count
                  });
              } else _item.store_count = 0

            } else _item.store_count = 0
          } else _item.store_count = 0

        } else _item.store_count = 0
        foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode == _item.barcode);
        if (!foundSize && !foundHold) $scope.item.sizes.push(_item);
      });
  };

  $scope.getBarcode = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/stores_items/all",
        data: {
          search: $scope.search_barcode
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
                    _size.store_from = $scope.transfer_branch.store_from;
                    _size.unit = _size.size_units_list[indxUnit];
                    _size.count = 1;
                    _size.total = _size.count * _size.cost;
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
                              if (_store.store.id == $scope.transfer_branch.store_from.id) {
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
                    foundSize = $scope.transfer_branch.items.some(_itemSize => _itemSize.barcode == _size.barcode);
                    if (!foundSize && !foundHold) $scope.transfer_branch.items.unshift(_size);
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

  $scope.edit = function (transfer_branch) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(transfer_branch);
        $scope.transfer_branch = {};
        site.showModal('#updateTransferBranchModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.update = function () {
    $scope.error = '';
    const v = site.validated('#updateTransferBranchModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    let notExistCount = $scope.transfer_branch.items.some(_iz => _iz.count < 1);

    if (notExistCount) {
      $scope.error = "##word.err_exist_count##";
      return;
    };

    if (new Date($scope.transfer_branch.date) > new Date()) {
      $scope.error = "##word.date_exceed##";
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/transfer_branch/update",
      data: $scope.transfer_branch
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateTransferBranchModal');
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

  $scope.confirmTransfer = function (transfer_branch) {
    $scope.error = '';
    $scope.getStockItems(transfer_branch.items, callback => {

      if (!callback) {

        transfer_branch.transfer = true;
        $scope.busy = true;
        $http({
          method: "POST",
          url: "/api/transfer_branch/confirm",
          data: transfer_branch
        }).then(
          function (response) {
            $scope.busy = false;
            if (response.data.done) {
              $scope.loadAll();
            } else {
              $scope.error = '##word.error##';
              if (response.data.error.like('*OverDraft Not*')) {
                transfer_branch.transfer = false;
                $scope.error = "##word.overdraft_not_active##";
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

  $scope.confirmAll = function (transfer_branch_all) {
    $scope.error = '';

    let _transfer_branch_all = transfer_branch_all.reverse();
    let stopLoop = false;

    for (let i = 0; i < _transfer_branch_all.length; i++) {
      let _transfer_branch = _transfer_branch_all[i];

      if (!_transfer_branch.transfer) {

        $scope.getStockItems(_transfer_branch.items, callback => {

          if (!callback && !stopLoop) {

            _transfer_branch.transfer = true;

            $http({
              method: "POST",
              url: "/api/transfer_branch/confirm",
              data: _transfer_branch
            }).then(
              function (response) {
                if (response.data.done) {

                } else {
                  $scope.error = '##word.error##';
                  if (response.data.error.like('*OverDraft Not*')) {
                    $scope.error = "##word.overdraft_not_active##"
                    _transfer_branch.transfer = false;
                  }
                }
              },
              function (err) {
                console.log(err);
              }
            )
          } else {
            stopLoop = true;
            $scope.error = '##word.err_stock_item##';
          }

        })
      };
    }
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

  $scope.loadBranches = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/branches/all"
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.branchesList = response.data.list;
          $scope.branchCode = response.data.branch;
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadStoresFrom = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: { select: { id: 1, name: 1, type: 1 } }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.storesFromList = response.data.list;
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadStoresTo = function (branchTo) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: {
        select: { id: 1, name: 1, type: 1 },
        branchTo: branchTo
      }

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.storesToList = response.data.list;
        }

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
    site.hideModal('#transferSearchModal');
    $scope.search = {};
  };

  $scope.loadAll = function (where) {
    $scope.error = '';
    $scope.list = {};
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/transfer_branch/all",
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

  /*   $scope.loadStores_Out();
   */

  $scope.getSafeBySetting = function () {
    $scope.error = '';
    if ($scope.defaultSettings.accounting) {
      if ($scope.defaultSettings.accounting.safe) {
        $scope.transfer_branch.safe = $scope.defaultSettings.accounting.safe
      }
    }
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

  $scope.handelTransfer = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/transfer_branch/handel_transfer_branch"
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.loadAll();
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };



  $scope.loadCategories();
  $scope.getDefaultSettings();
  $scope.loadBranches();
  $scope.loadStoresFrom();
  $scope.loadAll({ date: new Date() });
});