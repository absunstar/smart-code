app.controller("items_menu", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.items_menu = {
    book_list: [],
    discountes: [],
    taxes: [],
    date: new Date(),
    details: []
  };

  $scope.displayAddItemsMenu = function () {
    $scope.error = '';
    $scope.items_menu = {
      image_url: '/images/items_menu.png',
      active: true

    };
    site.showModal('#itemsMenuAddModal');
  };

  $scope.addItemsMenu = function () {
    $scope.error = '';
    const v = site.validated('#itemsMenuAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    if (!$scope.items_menu.safe) {
      $scope.error = "##word.should_select_safe##";
      return;
    };

    if (!$scope.items_menu.net_value) {
      $scope.error = "##word.should_enter_value##";
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/items_menu/add",
      data: $scope.items_menu
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.items_menu = {
            date: new Date(),
          };
          $scope.itemsList = [];
          $scope.getItemsMenuList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateItemsMenu = function (items_menu) {
    $scope.error = '';
    $scope.viewItemsMenu(items_menu);
    $scope.items_menu = {};
    site.showModal('#itemsMenuUpdateModal');
  };

  $scope.updateItemsMenu = function () {
    $scope.error = '';
    const v = site.validated('#itemsMenuUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/items_menu/update",
      data: $scope.items_menu
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#itemsMenuUpdateModal');
          $scope.getItemsMenuList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsItemsMenu = function (items_menu) {
    $scope.error = '';
    $scope.viewItemsMenu(items_menu);
    $scope.items_menu = {};
    site.showModal('#itemsMenuViewModal');
  };

  $scope.viewItemsMenu = function (items_menu) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/items_menu/view",
      data: {
        id: items_menu.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.items_menu = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };


  $scope.deleteItemsMenu = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/items_menu/delete",
      data: {
        id: $scope.items_menu.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#itemsMenuDeleteModal');
          $scope.getItemsMenuList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getItemsMenuList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/items_menu/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#itemsMenuSearchModal');
          $scope.search = {};

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
          name: 1,
          image_url:1
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

  $scope.getSafesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.safesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadItems = function (i) {
    $scope.busy = true;
    $scope.itemsList = [];
    $scope.items_menu.cr_it = [];

    $http({
      method: "POST",
      url: "/api/stores_items/all",
      data: {
        where: {
          "item_group.id": i.id
        }
      }
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

  $scope.showItemsIn = function (l) {

    $scope.current_items = l;
    $scope.items_menu.cr_it = [];
    $scope.current_items.sizes.forEach(s => {

      if ($scope.current_items.sizes.length == 1) {
        let exist = false;

        $scope.items_menu.book_list.forEach(el => {
          if (s.size == el.size) {
            exist = true;
            el.total_price += s.price;
            el.count += 1;
          };
        });

        if (!exist) {

          $scope.items_menu.book_list.push({
            name : $scope.current_items.name,
            size: s.size,
            vendor : s.vendor,
            store: s.store,
            total_price: s.price,
            price: s.price,
            count: 1
          });
        };

      }else{

        
        $scope.items_menu.cr_it.push({
          name : $scope.current_items.name,
          size: s.size,
          vendor : s.vendor,
          store: s.store,
          price: s.price,
          current_count: s.current_count
        });
      };
    });

  };

  $scope.bookList = function (z) {
    $scope.error = '';
    $scope.items_menu.book_list = $scope.items_menu.book_list || [];
    let exist = false;

    $scope.items_menu.book_list.forEach(el => {
      if (z.size == el.size) {
        exist = true;
        el.total_price += z.price;
        el.count += 1;
      };
    });

    if (!exist) {

      $scope.items_menu.book_list.push({
        name: z.name,
        size: z.size,
        total_price: z.price,
        vendor : z.vendor,
        store: z.store,
        price: z.price,
        count: 1
      });
    };
  };


  $scope.deleteItemsList = function (items_menu) {
    $scope.error = '';

    if (items_menu.count == 1) {
      for (let i = 0; i < $scope.items_menu.book_list.length; i++) {
        let tx = $scope.items_menu.book_list[i];
        if (tx.size == items_menu.size) {
          $scope.items_menu.book_list.splice(i, 1);
        }
      }
    } else if (items_menu.count > 1) {
      items_menu.count -= 1;
      items_menu.total_price -= items_menu.price;
      return items_menu
    }
  };

  $scope.addTax = function () {
    $scope.items_menu.taxes = $scope.items_menu.taxes || [];
    if ($scope.tax.value && $scope.items_menu.taxes) {

      $scope.items_menu.taxes.push({
        name: $scope.tax.name,
        value: $scope.tax.value
      });
    }
    $scope.tax = {};
    $scope.calc();
  };

  $scope.deleteTax = function (_tx) {
    for (let i = 0; i < $scope.items_menu.taxes.length; i++) {
      let tx = $scope.items_menu.taxes[i];
      if (tx.name == _tx.name && tx.value == _tx.value) {
        $scope.items_menu.taxes.splice(i, 1);
      }
    }
    $scope.calc();
  };


  $scope.addDiscount = function () {
    $scope.error = '';

    if (!$scope.discount.value) {
      $scope.error = '##word.stores_out_error_discount##';
      return;
    } else {
      $scope.discount.type = 'number';

      $scope.items_menu.discountes = $scope.items_menu.discountes || [];
      $scope.items_menu.discountes.push({
        name: $scope.discount.name,
        value: $scope.discount.value,
        type: $scope.discount.type
      });
      $scope.discount = {};
      $scope.calc();
    };
  };


  $scope.deleteDiscount = function (_ds) {
    for (let i = 0; i < $scope.items_menu.discountes.length; i++) {
      let ds = $scope.items_menu.discountes[i];
      if (ds.name == _ds.name && ds.value == _ds.value && ds.type == _ds.type) {
        $scope.items_menu.discountes.splice(i, 1);
      }
    }
    $scope.calc();
  };


  $scope.calc = function () {
    $scope.items_menu.total_value = 0;
    $scope.items_menu.net_value = 0;

    $scope.items_menu.book_list.forEach(itm => {
      $scope.items_menu.total_value += parseFloat(itm.total_price);
    });

    $scope.items_menu.total_tax = 0;
    $scope.items_menu.taxes.forEach(tx => {
      $scope.items_menu.total_tax += $scope.items_menu.total_value * parseFloat(tx.value) / 100;
    });

    $scope.items_menu.total_discount = 0;
    $scope.items_menu.discountes.forEach(ds => {
      if (ds.type == '1') {
        $scope.items_menu.total_discount += $scope.items_menu.total_value * parseFloat(ds.value) / 100;
      } else {
        $scope.items_menu.total_discount += parseFloat(ds.value);
      }
    });

    $scope.items_menu.net_value = $scope.items_menu.total_value + $scope.items_menu.total_tax - $scope.items_menu.total_discount;
  };

  $scope.deleteRow = function (itm) {
    if (!$scope.items_menu.book_list) {
      $scope.items_menu.book_list = [];
    }

    for (let i = 0; i < $scope.items_menu.book_list.length; i++) {
      if ($scope.items_menu.book_list[i].code == itm.code && $scope.items_menu.book_list[i].size == itm.size) {
        $scope.items_menu.book_list.splice(i, 1);
      }
    }
  };

  $scope.loadTaxTypes = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tax_types/all",
      data: {
        select: {
          id: 1,
          name: 1,
          value: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.tax_types = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.loadDiscountTypes = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/discount_types/all",
      data: {
        select: {}
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.discount_types = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#itemsMenuSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getItemsMenuList($scope.search);
    site.hideModal('#itemsMenuSearchModal');
    $scope.search = {};
  };

  $scope.getItemsMenuList();
  $scope.loadItemsGroups();
  $scope.loadDiscountTypes();
  $scope.loadTaxTypes();
  $scope.getSafesList();
});