app.controller("stores_items", function ($scope, $http, $timeout) {

  $scope.category_item = {};
  $scope.search = {};
  $scope.item = {
    current_count: 0
  };


  $scope.addSize = function () {

    $scope.error = '';

    if (!$scope.category_item.sizes) {
      $scope.category_item.sizes = [];
    };

    if (!$scope.item.size) {
      $scope.error = "##word.no_size_error##";
      return
    };

    if (!$scope.item.vendor) {
      $scope.error = "##word.no_vendor_error##";
      return
    };

    if (!$scope.item.store) {
      $scope.error = "##word.no_store_error##";
      return
    };


    if ($scope.item.current_count) {
      $scope.item.start_count = $scope.item.current_count
    };
    $scope.category_item.sizes.push(Object.assign({}, $scope.item));
    $scope.item = {}
  };

  $scope.deleteSize = function (itm) {
    if (!$scope.category_item.sizes) {
      $scope.category_item.sizes = [];
    }
    if ($scope.category_item.sizes.length > 0) {

      for (let i = 0; i < $scope.category_item.sizes.length; i++) {
        if ($scope.category_item.sizes[i] == itm) {
          $scope.category_item.sizes.splice(i, 1);
        }
      }
    }
  };

  $scope.loadVendors = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vendors/all",
      data: {
        select: {
          id: 1,
          name_ar: 1
        }
      }
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
    )
  };

  $scope.loadStores = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
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
          $scope.stores = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
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
      where['cost'] = site.toNumber($scope.search.cost);
    }

    if ($scope.search.price) {
      where['price'] = site.toNumber($scope.search.price);
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

  $scope.newCategory_Item = function () {

    $scope.error = '';
    $scope.category_code = '';
    $scope.category_item = {
      image_url: '/images/category_item.png',
      with_discount: false
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

    if($scope.category_item.sizes && $scope.category_item.sizes.length < 1){
      $scope.error = '##word.should_add_items##';
      return;
    };

    if ($scope.category_item.sizes && $scope.category_item.sizes.length > 0) {
      $scope.category_item.date = new Date();
      if ($scope.category_item.current_count) {
        $scope.category_item.start_count = $scope.category_item.current_count;

      }

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

  $scope.edit = function (category_item) {
    $scope.error = '';
    $scope.category_item = {};
    $scope.view(category_item);
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

  $scope.loadCategories = function () {
    $scope.busy = true;
    $scope.categories = [];
    $http({
      method: "POST",
      url: "/api/categories/all",
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

  $scope.loadVendors();
  $scope.loadStores();
  $scope.loadCategories();
  $scope.loadAll();

});