app.controller("create_invoices", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.create_invoices = {};

  $scope.getDefaultSettingsList = function () {
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
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.displayAddCreatInvoices = function () {
    $scope._search = {};
    $scope.search_order = '';
    $scope.error = '';
    $scope.requestServiceList = [];

    $scope.create_invoices = {
      source_type: $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.source_type : null,
      payment_method: $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.payment_method : null,
      safe: $scope.defaultSettings.accounting ? $scope.defaultSettings.accounting.safe : null,
      image_url: '/images/create_invoices.png',
      date: new Date(),
      active: true,

    };
    site.showModal('#creatInvoicesAddModal');

  };

  $scope.addCreatInvoices = function () {
    $scope.error = '';
    const v = site.validated('#creatInvoicesAddModal');
    if ($scope.busy) return;
    else if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    } else if ($scope.create_invoices.paid_up > 0 && !$scope.create_invoices.safe) {
      $scope.error = "##word.should_select_safe##";
      return;
    } else if ($scope.create_invoices.paid_up > $scope.create_invoices.paid_require) {
      $scope.error = "##word.err_paid_require##";
      return;
    }
    $scope.busy = true;

    if ($scope.create_invoices.paid_up <= 0) $scope.create_invoices.safe = null;


    $http({
      method: "POST",
      url: "/api/create_invoices/add",
      data: $scope.create_invoices
    }).then(
      function (response) {
        $scope.busy = false;
        if (response) {

          site.hideModal('#creatInvoicesAddModal');
          $scope.getCreatInvoicesList();
        } else {
          $scope.error = response.data.error;

        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.printInvoiceCreat = function () {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;

    let ip = '127.0.0.1';
    let port = '11111';
    if ($scope.defaultSettings.printer_program) {
      ip = $scope.defaultSettings.printer_program.ip || '127.0.0.1';
      port = $scope.defaultSettings.printer_program.port || '11111';
    };

    let obj_print = {

      printer: $scope.defaultSettings.printer_program ? $scope.defaultSettings.printer_program.printer_path.ip.trim() : '',
      data: [
        {
          type: 'text',
          value: 'Date' + ' : ' + $scope.create_invoices.date | { date: 'dd - MM - yyyy' }
        },
        {
          type: 'text',
          value: 'Invoice Service'
        },
        {
          type: 'text',
          value: 'Customer' + ' : ' + ($scope.create_invoices.customer.name_ar || '')
        },
        {
          type: 'text',
          value: 'Service' + ' : ' + ($scope.create_invoices.service_name || '')
        },
        {
          type: 'line'
        },
        {
          type: 'text',
          value: 'Current Paid Up' + ' : ' + ($scope.create_invoices.paid_up || 0)
        },
        {
          type: 'text',
          value: 'paid Require' + ' : ' + ($scope.create_invoices.paid_require || 0)
        },
        {
          type: 'text',
          value: 'Total Remain' + ' : ' + ($scope.create_invoices.total_remain || 0)
        },

      ]
    };
    console.log(obj_print.data);
    
    $http({
      method: "POST",
      url: `http://${ip}:${port}/print`,
      data: obj_print
    }).then(
      function (response) {
        if (response)
          $scope.busy = false;
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.printInvoicePay = function () {
    let ip = '127.0.0.1';
    let port = '11111';
    if ($scope.defaultSettings.printer_program) {
      ip = $scope.defaultSettings.printer_program.ip || '127.0.0.1';
      port = $scope.defaultSettings.printer_program.port || '11111';
    }
    let obj_print = {

      printer: $scope.defaultSettings.printer_program ? $scope.defaultSettings.printer_program.printer_path.ip.trim() : '',
      data: [
        {
          type: 'text',
          value: 'Date' + ' : ' + $scope.create_invoices.payment_date
        },
        {
          type: 'text',
          value: 'Invoice Service'
        },
        {
          type: 'text',
          value: 'Customer' + ' : ' + ($scope.current.customer.name_ar || '')
        },
        {
          type: 'text',
          value: 'Service' + ' : ' + ($scope.current.service_name || '')
        },
        {
          type: 'line'
        },
        {
          type: 'text',
          value: 'paid Require' + ' : ' + ($scope.current.paid_require || 0)
        },
        {
          type: 'text',
          value: 'Current Paid Up' + ' : ' + ($scope.current.payment_paid_up || 0)
        },
        {
          type: 'text',
          value: 'Total Paid Up' + ' : ' + ($scope.current.total_paid_up || 0)
        },
        {
          type: 'text',
          value: 'Total Remain' + ' : ' + ($scope.current.total_remain || 0)
        },

      ]
    };
    $http({
      method: "POST",
      url: `http://${ip}:${port}/print`,
      data: obj_print
    }).then(
      function (response) {
        if (response)
          $scope.busy = false;
      },
      function (err) {
        console.log(err);
      }
    );

  };

  $scope.displayUpdateCreatInvoices = function (create_invoices) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsCreatInvoices(create_invoices);
    $scope.create_invoices = {
      image_url: '/images/vendor_logo.png',

    };
    site.showModal('#creatInvoicesUpdateModal');
  };

  $scope.updateCreatInvoices = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';
    $scope.busy = true;

    const v = site.validated('#creatInvoicesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $http({
      method: "POST",
      url: "/api/create_invoices/update",
      data: $scope.create_invoices
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#creatInvoicesUpdateModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list[i] = response.data.doc;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsCreatInvoices = function (create_invoices) {
    $scope.error = '';
    $scope.detailsCreatInvoices(create_invoices);
    $scope.create_invoices = {};
    site.showModal('#creatInvoicesDetailsModal');
  };

  $scope.detailsCreatInvoices = function (create_invoices) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/create_invoices/view",
      data: {
        id: create_invoices.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.create_invoices = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteCreatInvoices = function (create_invoices) {
    $scope.error = '';
    $scope.detailsCreatInvoices(create_invoices);
    $scope.create_invoices = {};
    site.showModal('#creatInvoicesDeleteModal');
  };

  $scope.deleteCreatInvoices = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/create_invoices/delete",
      data: {
        id: $scope.create_invoices.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#creatInvoicesDeleteModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
              $scope.count -= 1;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getCreatInvoicesList = function (where) {
    $scope.error = '';
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/create_invoices/all",
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

  $scope.paymentInvoice = function () {
    $scope.error = '';
    if (!$scope.current.payment_safe.id) {
      $scope.error = "##word.should_select_safe##";
      return;
    };
    if (!$scope.current.payment_paid_up) {
      $scope.error = "##word.err_paid_up##";
      return;
    };
    if ($scope.current.payment_paid_up > $scope.current.remain_amount) {
      $scope.error = "##word.err_paid_up_payment##";
      return;
    };
    $scope.current.payment_list = $scope.current.payment_list || [];
    $scope.current.remain_amount = $scope.current.remain_amount - $scope.current.payment_paid_up;
    $scope.current.payment_list.push({
      paid_up: $scope.current.payment_paid_up,
      safe: $scope.current.payment_safe,
      date: $scope.current.payment_date,
    });
  };

  $scope.acceptPaymentInvoice = function () {
    $scope.error = '';
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/create_invoices/update",
      data: $scope.current
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getCreatInvoicesList();
          site.hideModal('#invoicesPaymentModal');
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.loadRequestService = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    $scope.requestServiceList = [];
    if (!$scope.create_invoices.source_type) {
      $scope.error = "##word.err_source_type##";
      return;
    } else if (ev.which === 13) {

      $http({
        method: "POST",
        url: "/api/request_service/all",
        data: {
          where: {
            invoice: { $ne: true }
          },
          search: $scope.search_order
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.requestServiceList = response.data.list;

          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    };
  };

  $scope.selectRequestService = function (service) {

    $scope.error = '';
    $scope.create_invoices.request_service_id = service.id;
    $scope.create_invoices.customer = service.customer;
    $scope.create_invoices.trainer = service.trainer;
    $scope.create_invoices.hall = service.hall;
    $scope.create_invoices.service_name = service.service_name;
    $scope.create_invoices.date_from = service.date_from;
    $scope.create_invoices.date_to = service.date_to;
    $scope.create_invoices.paid_require = service.paid_require;
    $scope.create_invoices.code = service.code;
    $scope.create_invoices.total_discount = service.total_discount;
    $scope.total_tax = $scope.create_invoices.total_tax;
    $scope.total_discount = $scope.create_invoices.total_discount;
    $scope.price_delivery_service = $scope.create_invoices.price_delivery_service;
    $scope.service = $scope.create_invoices.service;

    $scope.requestServiceList = [];
  };

  $scope.displayPaymentInvoices = function (invoices) {
    $scope.error = '';
    $scope.current = invoices;
    $scope.current.payment_date = new Date();
    $scope.current.payment_paid_up = 0;
    $scope.current.payment_safe = $scope.defaultSettings.accounting ? $scope.defaultSettings.accounting.safe : null;
    site.showModal('#invoicesPaymentModal');
  };

  /* $scope.calc = function () {
    $scope.error = '';
    $timeout(() => {
      let total_price_item = 0;
      $scope.create_invoices.current_book_list.forEach(item => {

        total_price_item += item.total_price;
      });
      $scope.create_invoices.net_value = total_price_item + ($scope.create_invoices.service || 0) + ($scope.create_invoices.price_delivery_service || 0) + ($scope.create_invoices.total_tax || 0) - ($scope.create_invoices.total_discount || 0)
    }, 250);
  }; */

  /*  $scope.deleteItemsList = function (item) {
     $scope.error = '';
 
     if (item.count == 1) {
       $scope.create_invoices.current_book_list.splice($scope.create_invoices.current_book_list.indexOf(item), 1)
 
     } else if (item.count > 1) {
       item.count -= 1;
       item.total_price -= item.price;
       return item
     }
     item.total_price = item.count * item.price;
   }; */



  $scope.getPaymentMethodList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.paymentMethodList = [];
    $http({
      method: "POST",
      url: "/api/payment_method/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.paymentMethodList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getSourceType = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.sourceTypeList = [];
    $http({
      method: "POST",
      url: "/api/source_type/all"
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.sourceTypeList = response.data;
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


  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getCreatInvoicesList($scope.search);
    site.hideModal('#creatInvoicesSearchModal');
    $scope.search = {}

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
  $scope.getCreatInvoicesList();
  $scope.getSourceType();
  $scope.getSafesList();
  $scope.getPaymentMethodList();
  $scope.getDefaultSettingsList();
});