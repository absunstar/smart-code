app.controller("stores_items", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.category_item = {};
  $scope.search = {};


  $scope.addSize = function () {

    $scope.error = '';

    if (!$scope.category_item.sizes) {
      $scope.category_item.sizes = [];
    };

    if (!$scope.item.size) {
      $scope.error = "##word.no_size_error##";
      return
    };
    if (!$scope.item.barcode) {
      $scope.error = "##word.err_barcode##";
      return
    };

    let err_barcode = false;
    $scope.itemSizeList.forEach(itemSize => {
      if(itemSize.barcode === $scope.item.barcode){
        err_barcode = true;
      };
    });

    if(err_barcode){
      $scope.error = "##word.err_barcode_exist##";
      return;
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
    $scope.category_item.sizes.unshift(Object.assign({}, $scope.item));
    $scope.complex_items = [];
    $scope.item = {
      image_url: '/images/sizes_img.png'
    };
  };

  $scope.deleteSize = function (itm) {
    $scope.category_item.sizes.splice($scope.category_item.sizes.indexOf(itm), 1)
  };

  $scope.loadAll = function (where, limit) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/stores_items/all",
      data: {
        where: where,
        limit: limit || 10000000
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

      with_discount: false
    };
    $scope.item = {
      image_url: '/images/sizes_img.png'
    };
    site.showModal('#addCategoryItemModal');
  };

  $scope.add = function () {

    $scope.error = '';
    const v = site.validated();
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
    } else {
      $scope.error = " يجب ادخال الكمية و الصنف بشكل صحيح"
    }

  };

  $scope.addComplexItems = function () {

    $scope.error = '';
    const v = site.validated();
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.complex.forEach(element => {

      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/complex_items/add",
        data: element
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
    });
  };

  $scope.updateComplexItems = function () {

    $scope.error = '';
    const v = site.validated();
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.complexItemsUpdate.forEach(element => {

      let url = "";

      if (element.id) url = "/api/complex_items/update";
      else url = "/api/complex_items/add";

      $scope.busy = true;
      $http({
        method: "POST",
        url: url,
        data: element
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
    });
  };

  $scope.loadComplexItems = function (iem) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/complex_items/sizes_all",
      data: {
        where: {
          'complex_items.barcode': iem.barcode
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.complexItemsList = response.data.list || {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.edit = function (category_item) {
    $scope.error = '';
    $scope.category_item = {};
    $scope.item = {};
    $scope.items_size = {};
    $scope.view(category_item);
   
    $scope.item = {
      image_url: '/images/sizes_img.png'
    };
    site.showModal('#updateCategoryItemModal');
  };

  $scope.update = function () {
    $scope.error = '';
    const v = site.validated();
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
        _id: $scope.category_item._id,
        name: $scope.category_item.name
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteCategoryItemModal');
          $scope.loadAll();
        } else {
          $scope.error = response.data.error;
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
      data: {}
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

  $scope.loadItemSize = function () {
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

  $scope.showComplexItems = function () {
    $scope.error = "";
    site.showModal('#complexItemModal');
  };

  $scope.showComplexView = function (i) {
    $scope.error = "";
    $scope.currentComplex = i;

    site.showModal('#complexViewModal');

  };

  $scope.incertComplexItem = function () {
    $scope.error = "";

    if ($scope.complex_items && $scope.complex_items.length > 0)
      $scope.complex_items = $scope.complex_items;
    else $scope.complex_items = [];

    if ($scope.items_size && $scope.items_size.size) {
      $scope.complex_items.unshift($scope.items_size);

    } else $scope.error = "##word.Err_should_select_item##";

    $scope.items_size = {};
  };

  $scope.incertComplexView = function () {
    $scope.error = "";

    if ($scope.complexItemsList && $scope.complexItemsList.complex_items && $scope.complexItemsList.complex_items.length > 0)
      $scope.complexItemsList.complex_items = $scope.complexItemsList.complex_items;
    else $scope.complexItemsList.complex_items = [];

    if ($scope.items_size && $scope.items_size.size) {
      $scope.items_size.count = 1;
      $scope.complexItemsList.complex_items.unshift($scope.items_size);

      $scope.complexItemsList.complex_items.forEach(item => {
        item.barcode = $scope.currentComplex.barcode;
      });

    } else $scope.error = "##word.Err_should_select_item##";

    $scope.items_size = {};
  };

  $scope.deleteViewComplex = function (i) {
    $scope.complexItemsList.complex_items.splice($scope.complexItemsList.complex_items.indexOf(i), 1);
  };

  $scope.deleteItemComplex = function (i) {
    $scope.complex_items.splice($scope.complex_items.indexOf(i), 1);
  };

  $scope.complexItemsPushUpdate = function () {
    if ($scope.complexItemsUpdate && $scope.complexItemsUpdate && $scope.complexItemsUpdate.length > 0)
      $scope.complexItemsUpdate = $scope.complexItemsUpdate;
    else $scope.complexItemsUpdate = [];

    $scope.complexItemsUpdate.push($scope.complexItemsList);

    site.hideModal('#complexViewModal');
  };

  $scope.searchAll = function () {
    $scope.error = "";
    let where = {};
    if ($scope.search.name) {
      where['name'] = $scope.search.name;
    }
    if ($scope.search.category) {
      where['category.id'] = $scope.search.category.id;
    }

    if ($scope.search.size) {
      where['sizes.size'] = $scope.search.size;
    }


    if ($scope.search.store) {
      where['store'] = $scope.search.store;
    }
    if ($scope.search.vendor) {
      where['vendor'] = $scope.search.vendor;
    }

    if ($scope.search.cost) {
      where['cost'] = parseFloat($scope.search.cost);
    }

    if ($scope.search.price) {
      where['price'] = parseFloat($scope.search.price);
    }

    if ($scope.search.current_count) {
      where['current_count'] = $scope.search.current_count;
    }
    if ($scope.search.current_countGt) {
      where['current_countGt'] = $scope.search.current_countGt;
    }
    if ($scope.search.current_countLt) {
      where['current_countLt'] = $scope.search.current_countLt;
    }

    $scope.loadAll(where, $scope.search.limit);
    site.hideModal('#Category_ItemSearchModal');
    $scope.search = {};
  };


  $scope.loadItemsGroups();
  $scope.loadAll();
  $scope.loadItems();
  $scope.loadItemSize();
  $scope.loadKitchens();
});