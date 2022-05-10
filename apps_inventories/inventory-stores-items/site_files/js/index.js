app.controller('stores_items', function ($scope, $http, $timeout, $interval) {
  $scope._search = {};
  $scope.hideAdd = false;

  $scope.addSize = function () {
    $scope.error = '';

    if ($scope.defaultSettings && $scope.defaultSettings.inventory && !$scope.defaultSettings.inventory.auto_barcode_generation) {
      if (!$scope.item.barcode || $scope.item.barcode == null) {
        $scope.error = '##word.err_barcode##';
        return;
      }

      let err_barcode1 = $scope.itemSizeList.some((_itemSize) => _itemSize.barcode === $scope.item.barcode);
      let err_barcode2 = $scope.category_item.sizes.some((_itemSize) => _itemSize.barcode === $scope.item.barcode);

      if (err_barcode1 || err_barcode2) {
        $scope.error = '##word.err_barcode_exist##';
        return;
      }
    }

    if (!$scope.category_item.sizes) {
      $scope.category_item.sizes = [];
    }

    if ($scope.item.work_patch && !$scope.item.validit) {
      $scope.error = '##word.must_expiry##';
      return;
    }

    if (!$scope.item.size_ar) {
      $scope.error = '##word.no_size_error##';
      return;
    }

    if ($scope.item.discount && $scope.item.discount.value > $scope.item.discount.max) {
      $scope.error = '##word.err_discount_value##';
      return;
    }

    $scope.item.start_count = 0;
    $scope.item.current_count = 0;
    $scope.item.total_sell_price = 0;
    $scope.item.total_sell_count = 0;
    $scope.item.total_buy_cost = 0;
    $scope.item.total_buy_count = 0;

    if (!$scope.item.average_cost) $scope.item.average_cost = site.toNumber($scope.item.cost);

    /* error logic */

    $scope.item.size_units_list = [];
    $scope.category_item.units_list.forEach((_size_unit) => {
      $scope.item.size_units_list.push({
        id: _size_unit.id,
        name_ar: _size_unit.name_ar,
        name_en: _size_unit.name_en,
        convert: _size_unit.convert,
        price: $scope.item.price * _size_unit.convert,
        cost: $scope.item.cost * _size_unit.convert,
        current_count: 0,
        start_count: 0,
        average_cost: $scope.item.average_cost * _size_unit.convert,
        discount: Object.assign({}, $scope.item.discount),
      });
    });
    $scope.category_item.sizes.unshift(Object.assign({}, $scope.item));
    $scope.complex_items = [];

    $scope.item = {
      cost: 0,
      price: 0,
      average_cost: 0,
      image_url: '/images/item_sizes.png',
      discount: {
        value: 0,
        max: 0,
        type: 'number',
      },
    };

    $scope.loadItemSizeList();
    $scope.error = '##word.add_done##';

    $timeout(() => {
      $scope.error = '';
    }, 1500);
  };

  $scope.deleteSize = function (itm) {
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/item_transaction/get_size',
      data: itm,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.error = '##word.err_size##';
        } else $scope.category_item.sizes.splice($scope.category_item.sizes.indexOf(itm), 1);
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadAll = function (where) {
    $scope.busy = true;
    $scope.list = [];

    if (!where || !Object.keys(where).length) {
      where = { limit: 500 };
    }

    $http({
      method: 'POST',
      url: '/api/stores_items/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          if (where && (where.barcode || where.size_ar || where.size_en)) {
            $scope.hideObj = {
              barcode: where.barcode,
              size_ar: where.size_ar,
              size_en: where.size_en,
            };
            $scope.list.forEach((_item) => {
              _item.sizes.forEach((_sizes) => {
                if (
                  _sizes &&
                  ((_sizes.size_ar && _sizes.size_ar.contains($scope.hideObj.size_ar)) ||
                    (_sizes.size_en && _sizes.size_en.contains($scope.hideObj.size_en)) ||
                    (_sizes.barcode && _sizes.barcode === $scope.hideObj.barcode))
                ) {
                  _sizes.$hide = false;
                } else {
                  _sizes.$hide = true;
                }
              });
            });
          }
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.newCategoryItem = function () {
    $scope.error = '';
    $scope.category_code = '';
    $scope.item = {};
    $scope.items_size = {};
    $scope.category_item = {
      image_url: '/images/stores_item.png',
      allow_sell: true,
      allow_buy: true,
      is_pos: true,
      sizes: [],
      units_list: [],
      with_discount: false,
    };
    $scope._view = false;
    $scope.item = {
      cost: 0,
      price: 0,
      average_cost: 0,
      discount: {
        value: 0,
        max: 0,
        type: 'number',
      },
      image_url: '/images/item_sizes.png',
    };

    if ($scope.defaultSettings.inventory) {
      if ($scope.defaultSettings.inventory.item_group)
        $scope.category_item.item_group = $scope.itemsGroupList.find((_iG) => {
          return _iG.id === $scope.defaultSettings.inventory.item_group.id;
        });

      if ($scope.defaultSettings.inventory.item_type) $scope.category_item.item_type = $scope.defaultSettings.inventory.item_type;

      if ($scope.defaultSettings.inventory.unit) {
        $scope.category_item.main_unit = $scope.unitsList.find((_unit) => {
          return _unit.id === $scope.defaultSettings.inventory.unit.id;
        });
        if ($scope.category_item.main_unit) {
          $scope.category_item.units_list = [
            {
              id: $scope.category_item.main_unit.id,
              name_ar: $scope.category_item.main_unit.name_ar,
              name_en: $scope.category_item.main_unit.name_en,
              convert: 1,
              start_count: 0,
              cost: 0,
              price: 0,
              average_cost: 0,
              discount: {
                value: 0,
                max: 0,
                type: 'number',
              },
            },
          ];
        }
      }
    }
    site.showModal('#addCategoryItemModal');
    document.querySelector('#addCategoryItemModal .tab-link').click();
  };

  $scope.add = function () {
    $scope.error = '';
    const v = site.validated('#addCategoryItemModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (($scope.category_item.sizes && $scope.category_item.sizes.length > 0) || !$scope.category_item.add_sizes) {
      $scope.busy = true;
      $scope.hideAdd = true;
      $http({
        method: 'POST',
        url: '/api/stores_items/add',
        data: { category_item: $scope.category_item, item: $scope.item },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            site.hideModal('#addCategoryItemModal');
            $scope.hideAdd = false;
            $scope.loadAll();
            $scope.category_item = {};
            $scope.loadItemSizeList();
          } else {
            $scope.error = response.data.error;
            if (response.data.error.like('*Should Add*')) {
              $scope.error = '##word.should_add_items##';
            } else if (response.data.error.like('*Must Enter*')) {
              $scope.error = '##word.err_barcode##';
            } else if (response.data.error.like('*Barcode Exist*')) {
              $scope.error = '##word.err_barcode_exist##';
            } else if (response.data.error.like('*DiscountUG*')) {
              let err = response.data.error.slice(10);
              $scope.error = '##word.unit_discount_err##' + err;
            } else if (response.data.error.like('*EnterBU*')) {
              let err = response.data.error.slice(7);
              $scope.error = '##word.err_barcode_units##' + err;
            } else if (response.data.error.like('*ExistBu*')) {
              let err = response.data.error.slice(7);
              $scope.error = '##word.err_barcode_exist##' + err;
            }
            $scope.hideAdd = true;
          }
        },
        function (err) {
          console.log(err);
        }
      );
    } else $scope.error = '##word.err_Item_must_correctly##';
  };

  $scope.edit = function (category_item) {
    $scope.error = '';
    $scope._view = false;
    $scope.category_item = {};
    $scope.item = {
      cost: 0,
      price: 0,
      average_cost: 0,
      discount: {
        value: 0,
        max: 0,
        type: 'number',
      },
      image_url: '/images/item_sizes.png',
    };
    $scope.items_size = {};
    $scope.view(category_item, 'edit');
    if ($scope.defaultSettings.general_Settings) {
    }
    site.showModal('#updateCategoryItemModal');
    document.querySelector('#updateCategoryItemModal .tab-link').click();
  };

  $scope.update = function () {
    $scope.error = '';
    const v = site.validated('#updateCategoryItemModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if (($scope.category_item.sizes && $scope.category_item.sizes.length > 0) || !$scope.category_item.add_sizes) {
      $scope.busy = true;
      $http({
        method: 'POST',
        url: '/api/stores_items/update',
        data: { category_item: $scope.category_item, item: $scope.item },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            site.hideModal('#updateCategoryItemModal');
          } else {
            $scope.error = response.data.error;
            if (response.data.error.like('*Should Add*')) {
              $scope.error = '##word.should_add_items##';
            } else if (response.data.error.like('*Must Enter*')) {
              $scope.error = '##word.err_barcode##';
            } else if (response.data.error.like('*Barcode Exist*')) {
              $scope.error = '##word.err_barcode_exist##';
            } else if (response.data.error.like('*DiscountUG*')) {
              let err = response.data.error.slice(10);
              $scope.error = '##word.unit_discount_err##' + err;
            } else if (response.data.error.like('*EnterBU*')) {
              let err = response.data.error.slice(7);
              $scope.error = '##word.err_barcode_units##' + err;
            } else if (response.data.error.like('*ExistBu*')) {
              let err = response.data.error.slice(7);
              $scope.error = '##word.err_barcode_exist##' + err;
            }
          }
        },
        function (err) {
          console.log(err);
        }
      );
    } else $scope.error = '##word.err_Item_must_correctly##';
  };

  $scope.remove = function (category_item) {
    $scope.error = '';
    $scope.view(category_item);
    $scope._view = true;
    $scope.category_item = {};
    site.showModal('#deleteCategoryItemModal');
    document.querySelector('#deleteCategoryItemModal .tab-link').click();

    /*     $scope.error = "##word.warning_message##"
     */
  };

  $scope.view = function (category_item, value) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_items/view',
      data: {
        _id: category_item._id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.category_item = response.data.doc;

          if (value === 'edit') {
            $scope.category_item.$edit = true;
            $scope.category_item.units_list.map((_u) => (_u.$edit = true));
          }

          $scope.category_item.sizes.forEach((_sizes) => {
            if (_sizes.opening_palnce_list) {
              _sizes.opening_palnce_list = [];
            };
            if ($scope.hideObj) {
              if (
                _sizes &&
                ((_sizes.size_ar && _sizes.size_ar.contains($scope.hideObj.size_ar)) ||
                  (_sizes.size_en && _sizes.size_en.contains($scope.hideObj.size_en)) ||
                  (_sizes.barcode && _sizes.barcode === $scope.hideObj.barcode))
              ) {
                _sizes.$hide = false;
              } else {
                _sizes.$hide = true;
              }
            }
            });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.details = function (category_item) {
    $scope.error = '';
    $scope.view(category_item);
    $scope._view = true;
    $scope.category_item = {};
    site.showModal('#viewCategoryItemModal');
    document.querySelector('#viewCategoryItemModal .tab-link').click();
  };

  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_items/delete',
      data: {
        id: $scope.category_item.id,
        category_item: $scope.category_item,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteCategoryItemModal');
          $scope.loadAll();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Cant Delete Its Exist*')) {
            $scope.error = '##word.err_item##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.loadItems = function () {
    $scope.busy = true;
    $scope.itemsList = [];
    $http({
      method: 'POST',
      url: '/api/stores_items/all',
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.itemsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadItemsGroups = function () {
    $scope.busy = true;
    $scope.itemsGroupList = [];
    $http({
      method: 'POST',
      url: '/api/items_group/all',
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.itemsGroupList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadKitchens = function () {
    $scope.busy = true;
    $scope.itemsKitchenList = [];
    $http({
      method: 'POST',
      url: '/api/kitchen/all',
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.itemsKitchenList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.addOpeningBalance = function (size, type) {
    $scope.size_balance = size;
    let obj = { count: 1 };
    obj.unit = $scope.category_item.units_list[0];
    obj.store = $scope.storesList.find((_store) => {
      return _store.id === $scope.defaultSettings.inventory.store.id;
    });
    obj.branch = $scope.branchCode;

    obj.vendor = $scope.defaultSettings.general_Settings.vendor;
    if (type === 'add') {
      if ($scope.size_balance.opening_palnce_list && $scope.size_balance.opening_palnce_list.length > 0) {
        $scope.size_balance.opening_palnce_list.push(obj);
      } else {
        $scope.size_balance.opening_palnce_list = [obj];
      }
    } else if (type === 'show') {
      site.showModal('#addOpeningBalanceModal');
    }
  };

  $scope.KitchenSet = function (size) {
    $scope.size_balance = size;

    $scope.size_balance.kitchen_branch_list = [];
    $scope.branch_list.forEach((_b) => {
      $scope.size_balance.kitchen_branch_list.push({
        name_ar: _b.branch.name_ar,
        name_en: _b.branch.name_en,
        code: _b.branch.code,
      });
    });

    site.showModal('#kitchenSetModal');
  };

  $scope.loadUnits = function () {
    $scope.busy = true;
    $scope.unitsList = [];
    $http({
      method: 'POST',
      url: '/api/units/all',
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.unitsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadActiveSubstances = function () {
    $scope.busy = true;
    $scope.activeSubstancesList = [];
    $http({
      method: 'POST',
      url: '/api/active_substances/all',
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.activeSubstancesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadItemsType = function () {
    $scope.busy = true;
    $scope.itemsTypesList = [];
    $http({
      method: 'POST',
      url: '/api/items_types/all',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.itemsTypesList = response.data;
        if (site.feature('restaurant')) $scope.itemsTypesList = $scope.itemsTypesList.filter((i) => i.id != 3);
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadItemSizeList = function () {
    $scope.busy = true;
    $scope.itemSizeList = [];
    $http({
      method: 'POST',
      url: '/api/stores_items/sizes_all',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.itemSizeList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadUnitsBarcodesList = function () {
    $scope.busy = true;
    $scope.unitsBarcodesList = [];
    $http({
      method: 'POST',
      url: '/api/stores_items/barcode_unit',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.unitsBarcodesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadStores = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores/all',
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          type: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.storesList = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.handelItems = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_items/handel_items',
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
    );
  };

  $scope.handelZeft = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_items/handel_zeft',
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
    );
  };

  $scope.handelKitchen = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_items/handel_kitchen',
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
    );
  };

  $scope.handelItems2 = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_items/handel_items2',
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
    );
  };

  $scope.showComplexItems = function () {
    $scope.error = '';
    $scope.item.complex_items = $scope.item.complex_items || [];
    $scope.item.value_add = {
      value: 0,
      type: 'number',
    };
    $scope.selectedItem = {};
    $scope.items_size = {};
    site.showModal('#complexItemModal');
  };

  $scope.showComplexItemsView = function (item) {
    $scope.error = '';
    $scope.complexView = item;
    $scope.complexView.complex_items = $scope.complexView.complex_items || [];
    $scope.complexView.value_add = $scope.complexView.value_add || {
      value: 0,
      type: 'number',
    };
    $scope.selectedItem = {};
    $scope.items_size = {};
    site.showModal('#complexViewModal');
  };

  $scope.incertComplexItem = function (item) {
    $scope.error = '';
    item.complex_items = item.complex_items || [];

    foundSize = item.complex_items.some((_itemSize) => _itemSize.barcode === $scope.items_size.barcode);

    if ($scope.items_size && $scope.items_size.size_ar) {
      if (!foundSize) {
        item.complex_items.unshift({
          name_ar: $scope.items_size.name_ar,
          name_en: $scope.items_size.name_en,
          size_ar: $scope.items_size.size_ar,
          size_en: $scope.items_size.size_en,
          item_group: $scope.items_size.item_group,
          barcode: $scope.items_size.barcode,
          unit: $scope.items_size.unit,
          price: $scope.items_size.price,
          work_patch: $scope.items_size.work_patch,
          work_serial: $scope.items_size.work_serial,
          size_units_list: $scope.items_size.size_units_list,
          count: 1,
        });
      } else $scope.error = '##word.dublicate_item##';
    } else $scope.error = '##word.Err_should_select_item##';

    $scope.items_size = {};
  };

  $scope.deleteItemComplex = function (complex_items, i) {
    $scope.error = '';
    complex_items.splice(complex_items.indexOf(i), 1);
  };

  $scope.complexItemsPushUpdate = function () {
    $scope.error = '';
    if ($scope.complexItemsUpdate && $scope.complexItemsUpdate && $scope.complexItemsUpdate.length > 0) $scope.complexItemsUpdate = $scope.complexItemsUpdate;
    else $scope.complexItemsUpdate = [];

    $scope.complexItemsUpdate.push($scope.complexItemsList);

    site.hideModal('#complexViewModal');
  };

  $scope.searchAll = function () {
    $scope.error = '';
    $scope.loadAll($scope.search);
    site.hideModal('#CategoryItemSearchModal');
    $scope.search = {};
  };

  $scope.getItemsName = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: 'POST',
        url: '/api/stores_items/all',
        data: {
          search: $scope.search_item_name,
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              response.data.list.forEach((_item) => {
                _item.sizes.forEach((_size) => {
                  _size.name_ar = _item.name_ar;
                  _size.name_en = _item.name_en;
                  _size.item_group = _item.item_group;
                  _size.item_id = _item.id;
                  let indxUnit = 0;
                  _size.size_units_list.forEach((_unit, i) => {
                    if (_unit.id == _item.main_unit.id) indxUnit = i;
                  });
                  _size.unit = _size.size_units_list[indxUnit];
                  _size.price = _size.size_units_list[indxUnit].price;
                });
              });

              $scope.itemsNameList = response.data.list;
            }
          }
        },
        function (err) {
          console.log(err);
        }
      );
    }
  };

  $scope.addUnitsList = function (_u) {
    $scope.error = '';

    let u = Object.assign({}, _u);

    $scope.category_item.units_list = $scope.category_item.units_list || [];

    let found1 = $scope.category_item.units_list.some((_unit) => _unit.id == u.id);

    if (!found1 && u.id) {
      let objUnit = {
        name_ar: u.name_ar,
        name_en: u.name_en,
        id: u.id,
        convert: 1,
      };

      if (!$scope.category_item.add_sizes) {
        objUnit.start_count = 0;
        objUnit.cost = 0;
        objUnit.price = 0;
        objUnit.average_cost = 0;
        objUnit.discount = {
          value: 0,
          max: 0,
          type: 'number',
        };
      }

      $scope.category_item.units_list.push(objUnit);
    }

    $scope.category_item.sizes.forEach((_size) => {
      _size.size_units_list = _size.size_units_list || [];

      let found = _size.size_units_list.some((_unit) => _unit.id == u.id);

      if (!found) {
        _size.size_units_list.push({
          name_ar: u.name_ar,
          name_en: u.name_en,
          id: u.id,
          current_count: 0,
          start_count: 0,
          cost: _size.cost,
          price: _size.price,
          average_cost: _size.average_cost,
          discount: Object.assign({}, _size.discount),
        });
      }
    });

    $scope.unit = {};
  };

  $scope.deleteUnit = function (unit) {
    $scope.error = '';

    let found = false;
    $scope.category_item.sizes.forEach((_size) => {
      let indxUnit = 0;
      let foundCount = false;
      _size.size_units_list.forEach((_unit, i) => {
        if (_unit.id == unit.id) {
          indxUnit = i;
          if (_unit.current_count != 0) foundCount = true;
        }
      });

      if (foundCount) {
        $scope.error = '##word.err_delete_unit##';
        found = true;
      } else _size.size_units_list.splice(indxUnit, 1);
    });

    if (!found) $scope.category_item.units_list.splice($scope.category_item.units_list.indexOf(unit), 1);
  };

  $scope.addMainUnit = function (category_item) {
    $scope.error = '';
    category_item.units_list = category_item.units_list || [];
    if (category_item.main_unit) {
      let found = category_item.units_list.some((_unit) => _unit.id == category_item.main_unit.id);
      if (!found) {
        let objUnit = {
          name_ar: category_item.main_unit.name_ar,
          name_en: category_item.main_unit.name_en,
          id: category_item.main_unit.id,
          convert: 1,
        };

        if (!$scope.category_item.add_sizes) {
          objUnit.start_count = 0;
          objUnit.cost = 0;
          objUnit.price = 0;
          objUnit.average_cost = 0;
          objUnit.discount = {
            value: 0,
            max: 0,
            type: 'number',
          };
        }

        category_item.units_list.unshift(objUnit);
      }

      category_item.sizes.forEach((_size) => {
        _size.size_units_list = _size.size_units_list || [];

        let found = _size.size_units_list.some((_unit) => _unit.id == category_item.main_unit.id);

        if (!found)
          _size.size_units_list.unshift({
            name_ar: category_item.main_unit.name_ar,
            name_en: category_item.main_unit.name_en,
            id: category_item.main_unit.id,
            current_count: 0,
            start_count: 0,
            cost: _size.cost,
            price: _size.price,
            average_cost: _size.average_cost,
            discount: Object.assign({}, _size.discount),
          });
      });
    }
  };

  $scope.viewUnits = function (_size) {
    $scope.error = '';
    $scope.size = _size;
    site.showModal('#unitsModal');
  };

  $scope.viewBranchUnits = function (branchUnitBalance) {
    $scope.error = '';
    $scope.branchUnitBalance = branchUnitBalance;
    site.showModal('#branchUnitsModal');
  };

  $scope.viewStoreUnits = function (storeUnitBalance) {
    $scope.error = '';
    $scope.storeUnitBalance = storeUnitBalance;
    site.showModal('#storeUnitsModal');
  };

  $scope.viewPatchesList = function (itm) {
    $scope.error = '';
    $scope.item_patch = itm;
    site.showModal('#patchesListViewModal');
  };

  $scope.storesBalances = function (storesBalance) {
    $scope.error = '';
    $scope.storesBalance = storesBalance;
    site.showModal('#storesBalancesModal');
  };

  $scope.branchesBalances = function (branchesBalance) {
    $scope.error = '';
    $scope.branchesBalance = branchesBalance;
    site.showModal('#branchesBalancesModal');
  };

  $scope.newUnitsSwitch = function (c) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      $scope.hideSelectItems = true;
      if (shift) {
        $scope.error = '';
        $scope.item = {};
        $scope.units_switch = {
          image_url: '/images/units_switch.png',
          shift: $scope.shift,
          items: [],
          date: new Date(),
        };

        $scope.units_switch.store = $scope.storeUnitBalance.store;
        if ($scope.defaultSettings) {
          if ($scope.defaultSettings.general_Settings && !$scope.defaultSettings.general_Settings.work_posting) {
            $scope.units_switch.posting = true;
          }
        }

        $http({
          method: 'POST',
          url: '/api/stores_items/all',
          data: {
            where: { barcode: c.barcode },
          },
        }).then(
          function (response) {
            $scope.busy = false;

            if (response.data.done) {
              if (response.data.list.length > 0) {
                let foundSize = false;
                if (response.data.list[0].sizes && response.data.list[0].sizes.length > 0)
                  response.data.list[0].sizes.forEach((_size) => {
                    let foundHold = false;
                    let foundUnit = false;
                    let indxUnit = 0;

                    if (_size.size_units_list && _size.size_units_list.length > 0)
                      _size.size_units_list.forEach((_unit, i) => {
                        if (_unit.barcode === c.barcode && typeof _unit.barcode == 'string') {
                          foundUnit = true;
                        }
                        if (_unit.id == response.data.list[0].main_unit.id) indxUnit = i;
                      });
                    if (_size.barcode === c.barcode || foundUnit) {
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
                                  foundStore = true;
                                  indxStore = i;
                                  if (_store.hold) foundHold = true;
                                }
                              });
                              if (foundStore)
                                _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach((_unit) => {
                                  if (_unit.id == response.data.list[0].main_unit.id) _size.store_count = _unit.current_count;
                                });
                            } else _size.store_count = 0;
                          } else _size.store_count = 0;
                        } else _size.store_count = 0;
                      } else _size.store_count = 0;

                      foundSize = $scope.units_switch.items.some((_itemSize) => _itemSize.barcode === _size.barcode);
                      if (!foundSize && !foundHold) $scope.units_switch.items.unshift(_size);
                    }
                  });
                if (foundSize) $scope.error = '##word.dublicate_item##';
              }
            } else {
              $scope.error = response.data.error;
            }
          },
          function (err) {
            console.log(err);
          }
        );

        site.showModal('#addUnitsSwitchModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addSwitch = function () {
    $scope.error = '';

    const v = site.validated('#addUnitsSwitchModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (new Date($scope.units_switch.date) > new Date()) {
      $scope.error = '##word.date_exceed##';
      return;
    }

    let notExistCount = $scope.units_switch.items.some((_iz) => _iz.count < 1);

    if (notExistCount) {
      $scope.error = '##word.err_exist_count##';
      return;
    }

    if ($scope.units_switch.items.length > 0) {
      let obj = {
        patchCount: false,
        patch_list: [],
      };

      let sameUnit = false;

      $scope.units_switch.items.forEach((_sW_i) => {
        if (_sW_i.unit && _sW_i.units_trans && _sW_i.unit.id == _sW_i.units_trans.id) {
          sameUnit = true;
        }

        if (_sW_i.size_units_list && _sW_i.size_units_list.length > 0) {
          let count = 0;
          if (_sW_i.patch_list && _sW_i.patch_list.length > 0) {
            _sW_i.patch_list.forEach((_pl) => {
              if (typeof _pl.count === 'number') {
                count += _pl.count;
              } else {
                obj.patchCount = true;
                obj.patch_list.push(_sW_i.barcode);
              }
            });
          } else if (_sW_i.work_serial || _sW_i.work_patch) {
            obj.patchCount = true;
            obj.patch_list.push(_sW_i.barcode);
          }
          if (count != _sW_i.count && (_sW_i.work_serial || _sW_i.work_patch)) {
            obj.patchCount = true;
            obj.patch_list.push(_sW_i.barcode);
          }
        }
      });
      obj.patch_list = obj.patch_list.filter(function (item, pos) {
        return obj.patch_list.indexOf(item) === pos;
      });

      if (obj.patchCount) {
        $scope.error = `##word.err_patch_count## ( ${obj.patch_list.join('-')} )`;
        return;
      }
      if (sameUnit) {
        $scope.error = '##word.units_trans_err##';
        return;
      }

      $scope.testPatches($scope.units_switch, (callback) => {
        if (callback.patchCount) {
          $scope.error = `##word.err_patch_count## ##word.patch_trans##   ( ${callback.patch_list.join('-')} )`;
          return;
        }

        if (callback.not_patch) {
          $scope.error = `##word.err_find_serial## ##word.patch_trans##   ( ${callback.patch_list.join('-')} )`;
          return;
        }

        if (callback.exist_serial) {
          $scope.error = `##word.serial_pre_existing##  ##word.patch_trans##  ( ${callback.patch_list.join('-')} )`;
          return;
        }

        if (callback.errDate) {
          $scope.error = '##word.err_patch_date##';
          return;
        }
        $scope.busy = true;
        $http({
          method: 'POST',
          url: '/api/units_switch/add',
          data: $scope.units_switch,
        }).then(
          function (response) {
            $scope.busy = false;
            if (response.data.done) {
              site.hideModal('#addUnitsSwitchModal');
              $scope.loadAll();
            } else {
              $scope.error = response.data.error;
              if (response.data.error.like('*OverDraft Not*')) {
                $scope.error = '##word.overdraft_not_active##';
              } else if (response.data.error.like('*Must Enter Code*')) {
                $scope.error = '##word.must_enter_code##';
              }
            }
          },
          function (err) {
            $scope.error = err.message;
          }
        );
      });
    } else {
      $scope.error = '##word.must_enter_quantity##';
      return;
    }
  };

  $scope.patchesListSwitch = function (itm) {
    $scope.error = '';
    if (itm.units_trans && itm.units_trans.id) {
      $scope.item_patch = itm;

      let mini_code = $scope.item_patch.barcode.slice(-3);
      let r_code = Math.floor(Math.random() * 1000 + 1);
      if (!$scope.item_patch.patch_trans_list) {
        if ($scope.item_patch.work_serial) {
          $scope.item_patch.patch_trans_list = [];
          for (let i = 0; i < $scope.item_patch.count_trans; i++) {
            let r_code2 = Math.floor(Math.random() * 1000 + 1);

            $scope.item_patch.patch_trans_list.push({
              patch: mini_code + r_code2 + ($scope.item_patch.patch_trans_list.length + i),
              count: 1,
            });
          }
        } else {
          $scope.item_patch.patch_trans_list = [
            {
              patch: mini_code + r_code + (itm.validit || '00') + 1,
              production_date: new Date(),
              expiry_date: new Date($scope.addDays(new Date(), itm.validit || 0)),
              validit: itm.validit || 0,
              count: itm.count_trans,
            },
          ];
        }
      } else if ($scope.item_patch.patch_trans_list && $scope.item_patch.patch_trans_list.length == 1 && $scope.item_patch.work_patch) {
        $scope.item_patch.patch_trans_list[0].count = itm.count_trans;
      } else {
        if ($scope.item_patch.work_serial) {
          let count = $scope.item_patch.count_trans - $scope.item_patch.patch_trans_list.length;
          let r_code2 = Math.floor(Math.random() * 1000 + 1);
          for (let i = 0; i < count; i++) {
            $scope.item_patch.patch_trans_list.unshift({
              patch: mini_code + r_code2 + i,
              count: 1,
            });
          }
        }
      }

      site.showModal('#patchesListSwitchModal');
    } else {
      $scope.error = '##word.must_unit_trans##';
    }
  };

  $scope.patchesList = function (itm) {
    $scope.error = '';
    $scope.item_patch = itm;
    if ($scope.units_switch && $scope.units_switch.store && $scope.units_switch.store.id) {
      $http({
        method: 'POST',
        url: '/api/stores_items/all',
        data: {
          where: {
            store_id: $scope.units_switch.store.id,
            unit_id: itm.unit.id,
            barcode: itm.barcode,
          },
        },
      }).then(function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (response.data.patch_list.length > 0) {
            response.data.patch_list.forEach((_resPatch) => {
              _resPatch.current_count = _resPatch.count;
              _resPatch.count = 0;
              if ($scope.item_patch.patch_list && $scope.item_patch.patch_list.length > 0)
                $scope.item_patch.patch_list.forEach((_itemPatch) => {
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
      });
    }
  };

  $scope.selectAll = function (item_patch, value) {
    $scope.error = '';
    if (value === 'patch') {
      item_patch.patch_list.forEach((element) => {
        if (item_patch.$select_all) {
          element.select = true;
        } else if (!item_patch.$select_all) {
          element.select = false;
        }
      });
    } else if (value === 'patch_trans') {
      item_patch.patch_trans_list.forEach((element) => {
        if (item_patch.$select_all) {
          element.select = true;
        } else if (!item_patch.$select_all) {
          element.select = false;
        }
      });
    }
  };

  $scope.addNewPAtch = function (itm) {
    $scope.error = '';
    let mini_code = itm.barcode.slice(-3);
    let r_code = Math.floor(Math.random() * 1000 + 1);

    itm.patch_trans_list.unshift({
      patch: mini_code + r_code + (itm.patch_trans_list.length + 1) + (itm.validit || '00'),
      production_date: new Date(),
      expiry_date: new Date($scope.addDays(new Date(), itm.validit || 0)),
      validit: itm.validit || 0,
      count: itm.work_serial ? 1 : 0,
    });
  };

  $scope.changeDate = function (i, str) {
    $timeout(() => {
      $scope.error = '';

      if (str == 'exp') {
        let diffTime = Math.abs(new Date(i.expiry_date) - new Date(i.production_date));
        i.validit = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else if (str == 'pro') {
        i.expiry_date = new Date($scope.addDays(i.production_date, i.validit || 0));
      }
    }, 250);
  };

  $scope.exitPatchModal = function (itm) {
    $scope.error = '';
    let bigger = false;
    let count = 0;

    itm.patch_list.forEach((_pl) => {
      if (_pl.count > _pl.current_count) bigger = true;
      if (itm.work_serial) {
        if (_pl.select) _pl.count = 1;
        else _pl.count = 0;
      }
    });

    itm.patch_list.map((p) => (count += p.count));

    if (itm.count != count) {
      $scope.error = '##word.err_patch_count##';
      return;
    }

    if (bigger) {
      $scope.error = '##word.err_patch_current_count##';
      return;
    }

    site.hideModal('#patchesListModal');
    $scope.error = '';
  };

  $scope.exitPatchTransModal = function (itm) {
    $scope.error = '';

    let count = 0;
    let errDate = false;
    let err_find_serial = false;

    itm.patch_trans_list.forEach((_p) => {
      count += _p.count;

      if (new Date(_p.expiry_date) < new Date(_p.production_date)) {
        errDate = true;
      }
      if (!_p.patch) err_find_serial = true;
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
    $scope.error = '';
    $scope.getSerialList(unitsSwitch.items, (serial_list) => {
      let obj = {
        patchCount: false,
        errDate: false,
        exist_serial: false,
        not_patch: false,
        patch_list: [],
      };

      unitsSwitch.items.forEach((_item) => {
        if (_item.size_units_list && _item.size_units_list.length > 0) {
          let count = 0;
          if (_item.patch_trans_list && _item.patch_trans_list.length > 0) {
            _item.patch_trans_list.forEach((_pl) => {
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
                serial_list.forEach((_s) => {
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
            obj.patch_list.push(_item.barcode);
          }
          if (count != _item.count_trans && (_item.work_serial || _item.work_patch)) {
            obj.patchCount = true;
            obj.patch_list.push(_item.barcode);
          }
        }
      });

      obj.patch_list = obj.patch_list.filter(function (item, pos) {
        return obj.patch_list.indexOf(item) === pos;
      });

      callback(obj);
    });
  };

  $scope.loadBranches = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/branches/all',
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
    );
  };

  $scope.getSerialList = function (items, callback) {
    $scope.error = '';
    $scope.busy = true;
    let barcodes = [];
    if (items && items.length > 0) barcodes = items.map((_item) => _item.barcode);

    let where = { serial: true, barcodes: barcodes };

    $http({
      method: 'POST',
      url: '/api/stores_items/barcode_unit',
      data: {
        where: where,
      },
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
    );
  };
  $scope.loadUserBranches = function () {
    $scope.company_list = [];

    $http({
      method: 'POST',
      url: '/api/user/branches/all',
      data: {
        where: { email: '##user.email##' },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.branch_list = response.data.list;
        }
      },
      function (err) {
        $scope.error = err;
      }
    );
  };

  $scope.addDays = function (date, days) {
    $scope.error = '';
    let result = new Date(date);
    result.setTime(result.getTime() + days * 24 * 60 * 60 * 1000);
    return result;
  };

  $scope.showAddSizes = function () {
    $scope.error = '';
    $scope.item = $scope.item || {};
    $scope.item.image_url = '/images/item_sizes.png';
    site.showModal('#addSizesModal');
  };

  $scope.calc = function (obj) {
    $timeout(() => {
      $scope.error = '';
      if (obj.units_trans && obj.units_trans.id) {
        obj.count_trans = (obj.unit.convert * obj.count) / obj.units_trans.convert;
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
        obj.count = (obj.units_trans.convert * obj.count_trans) / obj.unit.convert;
      } else {
        obj.count = 1;
        obj.count_trans = 0;
        $scope.error = '##word.err_units_trans##';
      }
    }, 250);
  };

  $scope.get_open_shift = function (callback) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/shifts/get_open_shift',
      data: {
        where: { active: true },
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
          from_date: 1,
          from_time: 1,
          to_date: 1,
          to_time: 1,
        },
      },
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
    );
  };

  $scope.loadVendors = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: 'POST',
        url: '/api/vendors/all',
        data: {
          search: $scope.search_vendor,
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.vendorsList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    }
  };

  $scope.getDefaultSetting = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/default_setting/get',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/numbering/get_automatic',
      data: {
        screen: 'category_items',
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCode = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getNumberingAutoSwitch = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/numbering/get_automatic',
      data: {
        screen: 'units_Switch',
      },
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
    );
  };

  $scope.handelCompany = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_items/handel_company',
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.importItemsFile = function () {
    document.querySelector('#btn_import').style.display = 'none';
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_items/import',
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getDbMesage = function () {
    $http({
      url: '/api/db/message',
      method: 'get',
    }).then(
      function (res) {
        if (res.data.done) {
          if ($scope.dbMessage != res.data.message) {
            $scope.dbMessage = res.data.message;
          } else {
            $scope.dbMessage = '';
          }
        }
      },
      function (error) {
        $scope.dbMessage = error;
      }
    );
  };

  $scope.getDefaultSetting();
  $scope.loadStores();
  $scope.loadItemsGroups();
  $scope.loadBranches();
  $scope.getNumberingAuto();
  $scope.getNumberingAutoSwitch();
  $scope.loadUnits();
  $scope.loadAll();
  /*$scope.loadItems();*/
  $scope.loadUserBranches();
  $scope.loadItemsType();
  $scope.loadActiveSubstances();

  $timeout(() => {
    $scope.loadItemSizeList();
  }, 1000 * 10);
  /* $scope.loadUnitsBarcodesList();*/
  if (site.feature('restaurant')) $scope.loadKitchens();
});
