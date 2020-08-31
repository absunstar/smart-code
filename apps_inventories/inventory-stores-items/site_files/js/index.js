app.controller("stores_items", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.addSize = function () {

    $scope.error = '';

    if ($scope.defaultSettings && $scope.defaultSettings.inventory && !$scope.defaultSettings.inventory.auto_barcode_generation) {

      if (!$scope.item.barcode || $scope.item.barcode == null) {
        $scope.error = "##word.err_barcode##";
        return
      };

      let err_barcode1 = $scope.itemSizeList.some(_itemSize => _itemSize.barcode === $scope.item.barcode);
      let err_barcode2 = $scope.category_item.sizes.some(_itemSize => _itemSize.barcode === $scope.item.barcode);

      if (err_barcode1 || err_barcode2) {
        $scope.error = "##word.err_barcode_exist##";
        return;
      }
    }

    if (!$scope.category_item.sizes) {
      $scope.category_item.sizes = [];
    };

    if ($scope.item.work_patch && !$scope.item.validit) {
      $scope.error = "##word.must_expiry##";
      return
    };

    if (!$scope.item.size) {
      $scope.error = "##word.no_size_error##";
      return
    };

    if ($scope.item.discount && $scope.item.discount.value > $scope.item.discount.max) {
      $scope.error = "##word.err_discount_value##";
      return
    };

    $scope.item.start_count = 0;
    $scope.item.current_count = 0;
    $scope.item.total_sell_price = 0;
    $scope.item.total_sell_count = 0;
    $scope.item.total_buy_price = 0;
    $scope.item.total_buy_count = 0;

    if (!$scope.item.average_cost)
      $scope.item.average_cost = site.toNumber($scope.item.cost);

    /* error logic */

    $scope.item.size_units_list = [];
    $scope.category_item.units_list.forEach(_size_unit => {
      $scope.item.size_units_list.push({
        id: _size_unit.id,
        name: _size_unit.name,
        convert: _size_unit.convert,
        price: $scope.item.price,
        cost: $scope.item.cost,
        current_count: 0,
        start_count: 0,
        average_cost: $scope.item.average_cost,
        discount: $scope.item.discount
      });
    });
    $scope.category_item.sizes.unshift(Object.assign({}, $scope.item));
    $scope.complex_items = [];

    $scope.item = {
      cost: 0,
      price: 0,
      average_cost: 0,
      image_url: '/images/sizes_img.png',
      discount: {
        value: 0,
        max: 0,
        type: 'number'
      }
    };



  };

  $scope.deleteSize = function (itm) {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/item_transaction/get_size",
      data: itm
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.error = '##word.err_size##';
        } else $scope.category_item.sizes.splice($scope.category_item.sizes.indexOf(itm), 1)
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
    $http({
      method: "POST",
      url: "/api/stores_items/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          if (where) {

            $scope.hideObj = {
              barcode: where.barcode,
              size: where.size,
              size_en: where.size_en,
            };
            $scope.list.forEach(_item => {
              _item.sizes.forEach(_sizes => {
                if (_sizes && ((_sizes.size && _sizes.size.contains(where.size)) || (_sizes.size_en && _sizes.size_en.contains(where.size_en)) || (_sizes.barcode && _sizes.barcode.contains(where.barcode)))) {

                  _sizes.$hide = false
                } else {
                  _sizes.$hide = true

                }
              });
            });
          };
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.newCategoryItem = function () {

    $scope.error = '';
    $scope.category_code = '';
    $scope.item = {};
    $scope.items_size = {};
    $scope.category_item = {
      image_url: '/images/category_item.png',
      allow_sell: true,
      allow_buy: true,
      is_pos: true,
      sizes: [],
      units_list: [],
      with_discount: false
    };
    $scope._view = false;
    $scope.item = {
      cost: 0,
      price: 0,
      average_cost: 0,
      discount: {
        value: 0,
        max: 0,
        type: 'number'
      },
      image_url: '/images/sizes_img.png',
    };

    if ($scope.defaultSettings.inventory) {

      if ($scope.defaultSettings.inventory.item_group)
        $scope.category_item.item_group = $scope.defaultSettings.inventory.item_group;

      if ($scope.defaultSettings.inventory.unit) {
        $scope.category_item.main_unit = $scope.defaultSettings.inventory.unit;
        $scope.category_item.units_list = [{
          name: $scope.category_item.main_unit.name,
          id: $scope.category_item.main_unit.id,
          convert: 1
        }];
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

    if ($scope.category_item.sizes && $scope.category_item.sizes.length < 1) {
      $scope.error = '##word.should_add_items##';
      return;
    };

    if ($scope.category_item.sizes && $scope.category_item.sizes.length > 0) {

      let unitDiscount = false;
      let foundBarcodeUnit = false;
      let notBarcodeUnit = false;
      let existBarcodeUnit_list = [];

      $scope.category_item.sizes.forEach(_size => {
        let total_complex_av = 0;

        if (_size.item_complex && _size.complex_items && _size.complex_items.length > 0) {
          _size.complex_items.map(_complex => total_complex_av += (_complex.unit.average_cost * _complex.count));

          if (_size.value_add) {
            if (_size.value_add.type == 'percent')
              total_complex_av = total_complex_av + ((site.toNumber(_size.value_add.value) * total_complex_av) / 100);

            else total_complex_av = total_complex_av + site.toNumber(_size.value_add.value);
          }
        };

        _size.size_units_list.forEach(_unit => {

          if (_size.item_complex && _size.complex_items && _size.complex_items.length > 0) _unit.average_cost = total_complex_av;
          _unit.average_cost = site.toNumber(_unit.average_cost);
          if (_unit.barcode === (undefined || null)) notBarcodeUnit = true;
          if (_unit.discount && _unit.discount.value > _unit.discount.max) unitDiscount = true;

          let fonudExistBU = $scope.unitsBarcodesList.some(_unit1 => _unit1 === _unit.barcode);
          if (fonudExistBU) foundBarcodeUnit = true;
        });
      });

      if (unitDiscount) {
        $scope.error = '##word.err_barcode##';
        return;
      };


      if ($scope.defaultSettings && $scope.defaultSettings.inventory && (!$scope.defaultSettings.inventory.auto_unit_barcode_generation || $scope.defaultSettings.inventory.auto_unit_barcode_generation == null)) {

        if (notBarcodeUnit) {
          $scope.error = '##word.err_barcode_units##';
          return;
        };

        if (foundBarcodeUnit) {
          $scope.error = '##word.err_barcode_exist##';
          return;
        };
      };

      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/stores_items/add",
        data: $scope.category_item
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            site.hideModal('#addCategoryItemModal');
            $scope.loadAll();
            $scope.category_item = {};

          } else {
            $scope.error = response.data.error;
          }
        },
        function (err) {
          console.log(err);
        }
      )
    } else $scope.error = "##word.err_Item_must_correctly##"
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
        type: 'number'
      },
      image_url: '/images/sizes_img.png',
    };
    $scope.items_size = {};
    $scope.view(category_item);
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

    /*  if ($scope.category_item.sizes && $scope.category_item.sizes.length > 0) {
 
       let unitDiscount = false;
       let foundBarcodeUnit = false;
       let notBarcodeUnit = false;
 
       $scope.category_item.sizes.forEach(_size => {
 
         let total_complex_av = 0;
 
         if (_size.item_complex && _size.complex_items && _size.complex_items.length > 0) {
           _size.complex_items.map(_complex => total_complex_av += (_complex.unit.average_cost * _complex.count));
 
           if (_size.value_add) {
             if (_size.value_add.type == 'percent')
               total_complex_av = total_complex_av + ((site.toNumber(_size.value_add.value) * total_complex_av) / 100);
 
             else total_complex_av = total_complex_av + site.toNumber(_size.value_add.value);
           }
         };
 
         if (_size.barcode == (undefined || null)) notBarcodeUnit = true;
         _size.size_units_list.forEach(_unit => {
 
           if (_size.item_complex && _size.complex_items && _size.complex_items.length > 0) _unit.average_cost = total_complex_av;
           _unit.average_cost = site.toNumber(_unit.average_cost);
           if (_unit.barcode == (undefined || null)) notBarcodeUnit = true;
           if (_unit.discount && _unit.discount.value > _unit.discount.max) unitDiscount = true;
           let fonudExistBU = $scope.unitsBarcodesList.some(_unit1 => _unit1 == _unit.barcode);
           if (fonudExistBU) foundBarcodeUnit = true;
         });
       });
 
       if (unitDiscount) {
         $scope.error = '##word.err_barcode##';
         return;
       };
 
       if ($scope.defaultSettings && $scope.defaultSettings.inventory && (!$scope.defaultSettings.inventory.auto_unit_barcode_generation || $scope.defaultSettings.inventory.auto_unit_barcode_generation == null)) {
 
 
         if (notBarcodeUnit) {
           $scope.error = '##word.err_barcode_units##';
           return;
         };
 
         if (foundBarcodeUnit) {
           $scope.error = '##word.err_barcode_exist##';
           return;
         };
       };
     };
  */
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_items/update",
      data: $scope.category_item
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateCategoryItemModal');
        } else {
          $scope.error = '##word.error##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
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

  $scope.view = function (category_item) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_items/view",
      data: {
        _id: category_item._id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.category_item = response.data.doc;
          if ($scope.hideObj) {
            $scope.category_item.sizes.forEach(_sizes => {
              if (_sizes && ((_sizes.size && _sizes.size.contains($scope.hideObj.size)) || (_sizes.size_en && _sizes.size_en.contains($scope.hideObj.size_en)) || (_sizes.barcode && _sizes.barcode.contains($scope.hideObj.barcode)))) {

                _sizes.$hide = false;
              } else {
                _sizes.$hide = true;

              }
            });
          }
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
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
      method: "POST",
      url: "/api/stores_items/delete",
      data: {
        id: $scope.category_item.id,
        category_item: $scope.category_item
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteCategoryItemModal');
          $scope.loadAll();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Cant Delete Its Exist*')) {
            $scope.error = "##word.err_item##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.loadItems = function () {
    $scope.busy = true;
    $scope.itemsList = [];
    $http({
      method: "POST",
      url: "/api/stores_items/all"
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
    )
  };

  $scope.loadItemsGroups = function () {
    $scope.busy = true;
    $scope.itemsGroupList = [];
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
          $scope.itemsGroupList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadKitchens = function () {
    $scope.busy = true;
    $scope.itemsKitchenList = [];
    $http({
      method: "POST",
      url: "/api/kitchen/all",
      data: {
        select: {
          id: 1,
          name: 1,
          printer_path: 1
        }
      }
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
    )
  };

  $scope.loadUnits = function () {
    $scope.busy = true;
    $scope.unitsList = [];
    $http({
      method: "POST",
      url: "/api/units/all",
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
          $scope.unitsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadItemSizeList = function () {
    $scope.busy = true;
    $scope.itemSizeList = [];
    $http({
      method: "POST",
      url: "/api/stores_items/sizes_all",
      data: {}
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
    )
  };

  $scope.loadUnitsBarcodesList = function () {
    $scope.busy = true;
    $scope.unitsBarcodesList = [];
    $http({
      method: "POST",
      url: "/api/stores_items/barcode_unit",
      data: {}
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
    )
  };

  $scope.loadStores = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: {
        select: {
          id: 1,
          name: 1,
          type: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done)
          $scope.storesList = response.data.list;

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.handelItems = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_items/handel_items"
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

  $scope.handelZeft = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_items/handel_zeft"
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

  $scope.handelKitchen = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_items/handel_kitchen"
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

  $scope.handelItems2 = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_items/handel_items2"
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


  $scope.showComplexItems = function () {
    $scope.error = '';
    $scope.item.complex_items = $scope.item.complex_items || [];
    $scope.item.value_add = {
      value: 0,
      type: 'number'
    };
    $scope.selectedItem = {};
    $scope.items_size = {};
    site.showModal('#complexItemModal');
  };

  $scope.showComplexItemsView = function (item) {
    $scope.error = '';
    $scope.complexView = item;
    $scope.complexView.complex_items = $scope.complexView.complex_items || [];
    $scope.complexView.value_add = $scope.complexView.value_add || { value: 0, type: 'number' };
    $scope.selectedItem = {};
    $scope.items_size = {};
    site.showModal('#complexViewModal');
  };

  $scope.incertComplexItem = function (item) {
    $scope.error = '';
    item.complex_items = item.complex_items || [];

    foundSize = item.complex_items.some(_itemSize => _itemSize.barcode === $scope.items_size.barcode);

    if ($scope.items_size && $scope.items_size.size) {

      if (!foundSize) {
        item.complex_items.unshift({
          name: $scope.items_size.name,
          size: $scope.items_size.size,
          size_en: $scope.items_size.size_en,
          item_group: $scope.items_size.item_group,
          barcode: $scope.items_size.barcode,
          unit: $scope.items_size.unit,
          price: $scope.items_size.price,
          count: 0
        });
      } else $scope.error = "##word.dublicate_item##"

    } else $scope.error = "##word.Err_should_select_item##";

    $scope.items_size = {};
  };

  $scope.deleteItemComplex = function (complex_items, i) {
    complex_items.splice(complex_items.indexOf(i), 1);
  };

  $scope.complexItemsPushUpdate = function () {
    if ($scope.complexItemsUpdate && $scope.complexItemsUpdate && $scope.complexItemsUpdate.length > 0)
      $scope.complexItemsUpdate = $scope.complexItemsUpdate;
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
        method: "POST",
        url: "/api/stores_items/all",
        data: {
          search: $scope.search_item_name
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              response.data.list.forEach(_item => {
                _item.sizes.forEach(_size => {
                  _size.name = _item.name;
                  _size.item_group = _item.item_group;
                  _size.item_id = _item.id;
                  let indxUnit = 0;
                  _size.size_units_list.forEach((_unit, i) => {
                    if (_unit.id == _item.main_unit.id)
                      indxUnit = i;
                  });
                  _size.unit = _size.size_units_list[indxUnit];
                  _size.price = _size.size_units_list[indxUnit].price
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

    let found1 = $scope.category_item.units_list.some(_unit => _unit.id == u.id);

    if (!found1 && u.id) {

      $scope.category_item.units_list.push({
        name: u.name,
        id: u.id,
        convert: 1
      });
    }

    $scope.category_item.sizes.forEach(_size => {
      _size.size_units_list = _size.size_units_list || [];

      let found = _size.size_units_list.some(_unit => _unit.id == u.id);

      if (!found) {
        _size.size_units_list.push({
          name: u.name,
          id: u.id,
          current_count: 0,
          start_count: 0,
          cost: _size.cost,
          price: _size.price,
          average_cost: _size.average_cost,
          discount: _size.discount
        });
      }
    });

    $scope.unit = {};
  };



  $scope.deleteUnit = function (unit) {
    $scope.error = '';

    let found = false;
    $scope.category_item.sizes.forEach(_size => {
      let indxUnit = 0;
      let foundCount = false;
      _size.size_units_list.forEach((_unit, i) => {
        if (_unit.id == unit.id) {
          indxUnit = i;
          if (_unit.current_count != 0)
            foundCount = true;
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

      let found = category_item.units_list.some(_unit => _unit.id == category_item.main_unit.id);
      if (!found) category_item.units_list.unshift({
        name: category_item.main_unit.name,
        id: category_item.main_unit.id,
        convert: 1
      });

      category_item.sizes.forEach(_size => {
        _size.size_units_list = _size.size_units_list || [];

        let found = _size.size_units_list.some(_unit => _unit.id == category_item.main_unit.id);

        if (!found) _size.size_units_list.unshift({
          name: category_item.main_unit.name,
          id: category_item.main_unit.id,
          current_count: 0,
          start_count: 0,
          cost: _size.cost,
          price: _size.price,
          average_cost: _size.average_cost,
          discount: _size.discount
        });

      });
    }
  };


  $scope.viewUnits = function (size) {
    $scope.error = '';
    $scope.size = size;
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
          };
        };

        site.showModal('#addUnitsSwitchModal');
        let ev = { which: 13 };
        $scope.search_barcode = c.barcode;
        $scope.getBarcode(ev);
      } else $scope.error = '##word.open_shift_not_found##';
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
                      if ((_unit.barcode === $scope.search_barcode) && typeof _unit.barcode == 'string') {
                        foundUnit = true;
                      }
                      if (_unit.id == response.data.list[0].main_unit.id)
                        indxUnit = i;


                    });
                  if ((_size.barcode === $scope.search_barcode) || foundUnit) {
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
                              _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unit => {
                                if (_unit.id == response.data.list[0].main_unit.id)
                                  _size.store_count = _unit.current_count;
                              });
                          } else _size.store_count = 0;

                        } else _size.store_count = 0;
                      } else _size.store_count = 0;

                    } else _size.store_count = 0;

                    foundSize = $scope.units_switch.items.some(_itemSize => _itemSize.barcode === _size.barcode);
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
        if (_sW_i.unit && _sW_i.Units_trans && _sW_i.unit.id == _sW_i.Units_trans.id) {
          sameUnit = true;
        }
      });
    } else {
      $scope.error = "##word.should_add_items##";
      return;
    };

    if (sameUnit) {
      $scope.error = "##word.Units_trans_err##";
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


  $scope.getDefaultSetting = function () {

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
  $scope.getDefaultSetting();
  $scope.loadStores();
  $scope.loadItemsGroups();
  $scope.loadItemSizeList();
  $scope.loadUnits();
  $scope.loadAll();
  $scope.loadItems();
  $scope.loadUnitsBarcodesList();
  if (site.feature('restaurant'))
    $scope.loadKitchens();
});