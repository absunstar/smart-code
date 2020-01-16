app.controller("stores_items", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.category_item = {
    image_url: '/images/category_item.png',
    allow_sell: true,
    allow_buy: true,
    is_pos: true,
    sizes: [],
    units_list: [],
    with_discount: false
  };

  $scope.search = {};


  $scope.addSize = function () {

    $scope.error = '';

    if ($scope.defaultSettings && $scope.defaultSettings.inventory && !$scope.defaultSettings.inventory.auto_barcode_generation) {

      let err_barcode1 = $scope.itemSizeList.some(_itemSize => _itemSize.barcode === $scope.item.barcode);
      let err_barcode2 = $scope.category_item.sizes.some(_itemSize => _itemSize.barcode === $scope.item.barcode);

      if (err_barcode1 || err_barcode2) {
        $scope.error = "##word.err_barcode_exist##";
        return;
      } else if (!$scope.item.barcode) {
        $scope.error = "##word.err_barcode##";
        return
      };
    }

    if (!$scope.category_item.sizes) {
      $scope.category_item.sizes = [];
    };

    if (!$scope.item.size) {
      $scope.error = "##word.no_size_error##";
      return
    };


    if ($scope.complex && $scope.complex.length > 0)
      $scope.complex = $scope.complex;
    else $scope.complex = [];

    if ($scope.complex_items && $scope.complex_items.length > 0) {

      $scope.complex_items.forEach(item => {
        item.barcode = $scope.item.barcode
      });
      $scope.com_item = { complex_items: $scope.complex_items };
      $scope.complex.push($scope.com_item);
    };

    $scope.item.start_count = 0;
    $scope.item.current_count = 0;
    $scope.item.total_purchase_price = 0;
    $scope.item.total_purchase_count = 0;

    if (!$scope.item.average_cost)
      $scope.item.average_cost = site.toNumber($scope.item.cost);

    $scope.category_item.sizes.unshift(Object.assign({}, $scope.item));
    $scope.complex_items = [];

    $scope.item = {
      image_url: '/images/sizes_img.png',
      discount: { value: 0, max: 0, type: 'number' }
    };

    if ($scope.defaultSettings.general_Settings) {
      if ($scope.defaultSettings.general_Settings.kitchen)
        $scope.item.kitchen = $scope.defaultSettings.general_Settings.kitchen
    }

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
      with_discount: false
    };

    $scope.item = {
      discount: { value: 0, max: 0, type: 'number' },
      image_url: '/images/sizes_img.png',
    };

    if ($scope.defaultSettings.general_Settings) {
      if ($scope.defaultSettings.general_Settings.kitchen)
        $scope.item.kitchen = $scope.defaultSettings.general_Settings.kitchen
    }

    if ($scope.defaultSettings.inventory) {

      if ($scope.defaultSettings.inventory.item_group)
        $scope.category_item.item_group = $scope.defaultSettings.inventory.item_group;


    }
    site.showModal('#addCategoryItemModal');
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
      $scope.category_item.date = new Date();


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
            $scope.error = '##word.error##';
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
    $scope.category_item = {};
    $scope.item = {
      discount: { value: 0, max: 0, type: 'number' },
      image_url: '/images/sizes_img.png',
    };
    $scope.items_size = {};
    $scope.view(category_item);

    site.showModal('#updateCategoryItemModal');
  };

  $scope.update = function () {
    $scope.error = '';
    const v = site.validated('#updateCategoryItemModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
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

  $scope.remove = function (category_item) {
    $scope.error = '';
    $scope.view(category_item);
    $scope.category_item = {};
    site.showModal('#deleteCategoryItemModal');
    $scope.error = "##word.warning_message##"
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
    $scope.category_item = {};
    site.showModal('#viewCategoryItemModal');
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
        if (response.data.done)
          $scope.storesList = response.data.list;

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadItemSize = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.itemSizeList = [];
    $http({
      method: "POST",
      url: "/api/stores_items/sizes_all"
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
    $scope.selectedItem = {};
    $scope.items_size = {};
    site.showModal('#complexItemModal');
  };

  $scope.showComplexItemsView = function (item) {
    $scope.error = '';
    $scope.complexView = item;
    $scope.complexView.complex_items = $scope.complexView.complex_items || [];
    $scope.selectedItem = {};
    $scope.items_size = {};
    site.showModal('#complexViewModal');
  };

  $scope.incertComplexItem = function () {
    $scope.error = '';
    $scope.item.complex_items = $scope.item.complex_items || [];

    if ($scope.items_size && $scope.items_size.size) {
      $scope.item.complex_items.unshift($scope.items_size);

    } else $scope.error = "##word.Err_should_select_item##";

    $scope.items_size = {};
  };
  $scope.incertComplexItemView = function (item) {
    $scope.error = '';
    item.complex_items = item.complex_items || [];

    if ($scope.items_size && $scope.items_size.size)
      item.complex_items.unshift($scope.items_size);
    else $scope.error = "##word.Err_should_select_item##";

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
        url: "/api/stores_items/name_all",
        data: {
          search: $scope.search_item_name
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              response.data.list.forEach(item => {
                item.sizes.forEach(size => {
                  size.name = item.name;
                  size.item_id = item.id;
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

  $scope.addUnitsList = function (category_item) {
    $scope.error = '';
    category_item.units_list = category_item.units_list || [];
    if ($scope.unit.name)
      category_item.units_list.push({ name: $scope.unit.name });
    $scope.unit = {};
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
  $scope.loadUnits();
  $scope.loadAll();
  $scope.loadItems();
  $scope.loadItemSize();
  $scope.loadKitchens();
});