app.controller("order_invoice", function ($scope, $http, $timeout) {


  $scope._search = {};
  $scope.discount = { type: 'number' };
  $scope.tax = {};
  $scope.order_invoice = {
    book_list: [],
    discountes: [],
    taxes: [],
    date: new Date(),
    details: []
  };

  $scope.displayAddOrderInvoice = function () {
    $scope.error = '';
    $scope.order_invoice = {
      image_url: '/images/order_invoice.png',
      active: true
    };
    site.showModal('#OrderInvoiceAddModal');
  };

  $scope.addOrderInvoice = function () {
    $scope.error = '';
    const v = site.validated('#OrderInvoiceAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };


    if (!$scope.order_invoice.transaction_type) {
      $scope.error = "##word.err_transaction_type##";
      return;
    };


    if (!$scope.order_invoice.customer && $scope.order_invoice.transaction_type == 2) {
      $scope.error = "##word.err_customer##";
      return;
    };

    if (!$scope.order_invoice.table && $scope.order_invoice.transaction_type == 1) {
      $scope.error = "##word.err_table##";
      return;
    };

    if ($scope.order_invoice.transaction_type.id == 2 && !$scope.order_invoice.delivery_employee) {
      $scope.error = "##word.should_select_delivery_employee##";
      return;
    };

    let url = "/api/order_invoice/update";
    if ($scope.order_invoice.first) url = '/api/order_invoice/update';
    else url = '/api/order_invoice/add';

    $scope.busy = true;
    $http({
      method: "POST",
      url: url,
      data: $scope.order_invoice
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.order_invoice = {
            date: new Date()
          };
          $scope.itemsList = [];
          $scope.getOrderInvoiceList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateOrderInvoice = function (order_invoice) {
    $scope.error = '';
    $scope.viewOrderInvoice(order_invoice);
    $scope.order_invoice = {};
    site.showModal('#OrderInvoiceUpdateModal');
  };

  $scope.updateOrderInvoice = function () {
    $scope.error = '';
    const v = site.validated('#OrderInvoiceUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_invoice/update",
      data: $scope.order_invoice
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#OrderInvoiceUpdateModal');
          $scope.getOrderInvoiceList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsOrderInvoice = function (order_invoice) {
    $scope.error = '';
    $scope.viewOrderInvoice(order_invoice);
    $scope.order_invoice = {};
    site.showModal('#OrderInvoiceViewModal');
  };

  $scope.viewOrderInvoice = function (order_invoice) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/order_invoice/view",
      data: {
        id: order_invoice.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.order_invoice = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };


  $scope.deleteOrderInvoice = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/order_invoice/delete",
      data: {
        id: $scope.order_invoice.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#OrderInvoiceDeleteModal');
          $scope.getOrderInvoiceList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getOrderInvoiceList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/order_invoice/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#OrderInvoiceSearchModal');
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
          image_url: 1
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


  $scope.getCustomerList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.customersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getGovList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: {
          active: true
        },
        select: { id: 1, name: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.govList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getNeighborhoodList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/neighborhood/all",
      data: {
        where: {
          'gov.id': gov.id,
          active: true
        },
        select: { id: 1, name: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.neighborhoodList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getAreaList = function (neighborhood) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/area/all",
      data: {
        where: {
          'neighborhood.id': neighborhood.id,
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.areaList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.getDeliveryEmployeesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/delivery_employees/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.deliveryEmployeesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTablesGroupList = function (where) {
    $scope.busy = true;
    $scope.tablesGroupList = [];
    $http({
      method: "POST",
      url: "/api/tables_group/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.tablesGroupList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTablesList = function (tables_group) {
    $scope.busy = true;
    $scope.tablesList = [];
    $http({
      method: "POST",
      url: "/api/tables/all",
      data: {
        where: {
          'tables_group.id': tables_group.id,
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.tablesList = response.data.list;

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };



  $scope.getOrderInvoicesActiveList = function (callback) {
    callback = callback || function () { };
    $scope.busy = true;
    $scope.invoicesActivelist = [];
    $http({
      method: "POST",
      url: "/api/order_invoice/active_all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.invoicesActivelist = response.data.list;
        }
        callback()
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.viewInvoicesActivelistList = function () {
    $scope.getOrderInvoicesActiveList(() => {
      if ($scope.invoicesActivelist && $scope.invoicesActivelist.length < 1) {
        $scope.error = "##word.err_waiting_list_empty##";
        return;
      }
      site.showModal('#orderInvoicesActiveAddModal');
    });
  };

  $scope.returnWaitingOrder = function (item) {
    $scope.order_invoice.book_list = [];
    $scope.order_invoice.transaction_type = item.transaction_type;
    if (item.customer)
      $scope.order_invoice.customer = item.customer;
    if (item.table)
      $scope.order_invoice.table = item.table;
    if (item.tables_group)
      $scope.order_invoice.tables_group = item.tables_group;
    if (item.delivery_employee)
      $scope.order_invoice.delivery_employee = item.delivery_employee;
    if (item.price_delivery_service)
      $scope.order_invoice.price_delivery_service = item.price_delivery_service;
    if (item.service)
      $scope.order_invoice.service = item.service;
    $scope.order_invoice.total_value = item.total_value;
    $scope.order_invoice.total_discount = item.total_discount;
    $scope.order_invoice.id = item.id;
    $scope.order_invoice.total_tax = item.total_tax;
    $scope.order_invoice.net_value = item.net_value;
    $scope.order_invoice.gov = item.gov;
    $scope.order_invoice.neighborhood = item.neighborhood;
    $scope.order_invoice.area = item.area;
    $scope.order_invoice.price_delivery_service = item.price_delivery_service;
    $scope.order_invoice.address = item.address;
    $scope.order_invoice.customer_phone = item.customer_phone;
    $scope.order_invoice.customer_mobile = item.customer_mobile;

    $scope.order_invoice.first = true;
    item.book_list.forEach(book_list => {
      $scope.order_invoice.book_list.push(book_list);

    });

    site.hideModal("#orderInvoicesActiveAddModal")
  };

  $scope.getTransactionTypeList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.transactionTypeList = [];
    $http({
      method: "POST",
      url: "/api/order_invoice/transaction_type/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.transactionTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.closeOrder = function () {
    if ($scope.order_invoice.transaction_type.id == 2) {
      if ($scope.order_invoice.delivery_employee && $scope.order_invoice.delivery_employee.id)
        $scope.order_invoice.status = { id: 3, en: "Distributor", ar: "موزع" };
      else $scope.order_invoice.status = { id: 2, en: "Closed Of Orders Screen", ar: "مغلق من شاشة الأوردرات" };
    } else $scope.order_invoice.status = { id: 2, en: "Closed Of Orders Screen", ar: "مغلق من شاشة الأوردرات" };

    $scope.order_invoice.under_paid = {
      order_invoice_id: $scope.order_invoice.id ? $scope.order_invoice.id : null,
      book_list: $scope.order_invoice.book_list,
      total_tax: $scope.order_invoice.total_tax,
      total_discount: $scope.order_invoice.total_discount,
      price_delivery_service: $scope.order_invoice.price_delivery_service,
      service: $scope.order_invoice.service,
      net_value: $scope.order_invoice.net_value,
    };
    $scope.order_invoice.under_paid.items_price = 0;
    $scope.order_invoice.book_list.forEach(book_list => {
      $scope.order_invoice.under_paid.items_price += book_list.total_price;
    });

    $scope.addOrderInvoice();
  };

  $scope.loadItems = function (group) {
    $scope.busy = true;
    $scope.itemsList = [];
    $http({
      method: "POST",
      url: "/api/stores_items/all",
      data: {
        where: {
          "item_group.id": group.id,
          "is_pos": true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.itemsList = response.data.list;
          $scope.showItemsIn();
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.showItemsIn = function (i) {
    $scope.current_items = i;
    if ($scope.current_items.sizes.length == 1) {
      $scope.bookList($scope.current_items.sizes[0]);
    } else {



    }
  };

  $scope.deliveryServiceHide = function () {
    site.hideModal('#deliveryServiceModal');
  };

  $scope.changeItemCount = function (item) {
    $scope.error = '';
    $scope.order_invoice.book_list = $scope.order_invoice.book_list || [];
    $scope.order_invoice.book_list.forEach(el => {
      if (item.size == el.size) {
        exist = true;
        el.total_price = item.price * item.count;
        el.count = item.count;
      };
    });
    site.hideModal("#changeItemCountModal")
  };

  $scope.bookList = function (item) {
    $scope.error = '';
    $scope.order_invoice.book_list = $scope.order_invoice.book_list || [];
    let exist = false;

    $scope.order_invoice.book_list.forEach(el => {
      if (item.size == el.size) {
        exist = true;
        el.total_price += item.price;
        el.count += 1;
      }
    });

    if (!exist) {

      $scope.order_invoice.book_list.push({
        kitchen: item.kitchen,
        name: item.name,
        store: item.store,
        barcode: item.barcode,
        size: item.size,
        total_price: item.price,
        vendor: item.vendor,
        store: item.store,
        price: item.price,
        count: 1
      });
    }
    $scope.calc();
  };

  $scope.deleteItemsList = function (item) {
    $scope.error = '';

    if (item.count == 1) {
      $scope.order_invoice.book_list.splice($scope.order_invoice.book_list.indexOf(item), 1)

    } else if (item.count > 1) {
      item.count -= 1;
      item.total_price -= item.price;
      return item
    }
  };

  $scope.addTax = function () {
    if (!$scope.tax.value) {
      $scope.error = '##word.error_tax##';
      return;
    } else {

      $scope.order_invoice.taxes = $scope.order_invoice.taxes || [];
      if ($scope.tax.value) {
        $scope.order_invoice.taxes.push({
          name: $scope.tax.name,
          value: $scope.tax.value
        });
      }
      $scope.tax = {};
    };
  };


  $scope.deleteTax = function (_tx) {
    for (let i = 0; i < $scope.order_invoice.taxes.length; i++) {
      let tx = $scope.order_invoice.taxes[i];
      if (tx.name == _tx.name && tx.value == _tx.value) {
        $scope.order_invoice.taxes.splice(i, 1);
      }
    }
  };

  $scope.addDiscount = function () {
    $scope.error = '';

    if (!$scope.discount.value) {

      $scope.error = '##word.error_discount##';
      return;
    } else {
      $scope.order_invoice.discountes = $scope.order_invoice.discountes || [];
      $scope.order_invoice.discountes.push({
        name: $scope.discount.name,
        value: $scope.discount.value,
        type: $scope.discount.type
      });
      $scope.discount = {
        type: 'number'
      };
    };
  };

  $scope.deleteDiscount = function (_ds) {
    for (let i = 0; i < $scope.order_invoice.discountes.length; i++) {
      let ds = $scope.order_invoice.discountes[i];
      if (ds.name == _ds.name && ds.value == _ds.value && ds.type == _ds.type) {
        $scope.order_invoice.discountes.splice(i, 1);
      }
    }
  };



  $scope.calc = function () {

    $timeout(() => {


      $scope.discount.type = 'number';
      $scope.order_invoice.total_value = 0;
      $scope.order_invoice.net_value = 0;
      $scope.order_invoice.total_tax = 0;
      $scope.order_invoice.total_discount = 0;

      if ($scope.order_invoice.book_list) {

        $scope.order_invoice.book_list.forEach(itm => {
          itm.total_price = itm.price * itm.count;
          $scope.order_invoice.total_value += parseFloat(itm.total_price);
        });
      }
      if ($scope.order_invoice.taxes) {

        $scope.order_invoice.taxes.forEach(tx => {
          $scope.order_invoice.total_tax += $scope.order_invoice.total_value * parseFloat(tx.value) / 100;
        });
      }
      if ($scope.order_invoice.discountes) {

        $scope.order_invoice.discountes.forEach(ds => {
          if (ds.type === "percent") {
            $scope.order_invoice.total_discount += $scope.order_invoice.total_value * parseFloat(ds.value) / 100;
          } else {
            $scope.order_invoice.total_discount += parseFloat(ds.value);
          }
        });
      };

      $scope.order_invoice.price_delivery_service = $scope.order_invoice.price_delivery_service || 0;
      $scope.order_invoice.service = $scope.order_invoice.service || 0;

      if ($scope.order_invoice.transaction_type && $scope.order_invoice.transaction_type.id == 1) {
        $scope.order_invoice.price_delivery_service = 0
      }

      if ($scope.order_invoice.transaction_type && $scope.order_invoice.transaction_type.id == 2) {
        $scope.order_invoice.service = $scope.order_invoice.total_value * Number($scope.order_invoice.service) / 100;
      }

      $scope.order_invoice.net_value = ($scope.order_invoice.total_value + ($scope.order_invoice.service || 0) + ($scope.order_invoice.total_tax || 0) + ($scope.order_invoice.price_delivery_service || 0)) - ($scope.order_invoice.total_discount || 0);


    }, 250);

  };


  $scope.changeCustomerAddresses = function (customer) {

    $scope.order_invoice.gov = customer.gov;
    $scope.order_invoice.neighborhood = customer.neighborhood;
    $scope.order_invoice.area = customer.area;

    $scope.order_invoice.address = customer.address;
    $scope.order_invoice.customer_phone = customer.phone;
    $scope.order_invoice.customer_mobile = customer.mobile;
    $scope.order_invoice.customer_mobile = customer.mobile;
    $scope.order_invoice.transaction_type.id == 2 ? $scope.order_invoice.price_delivery_service = customer.area.price_delivery_service : 0;

  };


  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#OrderInvoiceSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getOrderInvoiceList($scope.search);
    site.hideModal('#OrderInvoiceSearchModal');
    $scope.search = {};
  };

  $scope.getOrderInvoiceList();
  $scope.loadItemsGroups();
  $scope.loadDiscountTypes();
  $scope.getTransactionTypeList();
  $scope.loadTaxTypes();
  $scope.getSafesList();
  $scope.getCustomerList();
  $scope.getDeliveryEmployeesList();
  $scope.getTablesGroupList();
  $scope.getGovList();
});
