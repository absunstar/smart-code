app.controller("request_service", function ($scope, $http, $timeout) {

  $scope.request_service = {};

  $scope.displayAddRequestService = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.discount = {};
        $scope.request_service = {
          image_url: '/images/request_service.png',
          active: true,
          shift: shift,
          service_count: 1,
          date_from: new Date(),
          date_to: new Date(),
          time_from: {
            hour: new Date().getHours(),
            minute: new Date().getMinutes()
          },
          time_to: {
            hour: new Date().getHours(),
            minute: new Date().getMinutes()
          }
        };
        if ($scope.defaultSettings.general_Settings) {
          if ($scope.defaultSettings.general_Settings.hall)
            $scope.request_service.hall = $scope.defaultSettings.general_Settings.hall;
          if ($scope.defaultSettings.general_Settings.trainer)
            $scope.request_service.trainer = $scope.defaultSettings.general_Settings.trainer;
        };

        if ($scope.defaultSettings.accounting) {
          if ($scope.defaultSettings.accounting.create_invoice_auto) {
            $scope.request_service.currency = $scope.defaultSettings.accounting.currency;
            if ($scope.defaultSettings.accounting.payment_method) {
              $scope.request_service.payment_method = $scope.defaultSettings.accounting.payment_method;
              $scope.loadSafes($scope.request_service.payment_method, $scope.request_service.currency);
              if ($scope.request_service.payment_method.id == 1)
                $scope.request_service.safe = $scope.defaultSettings.accounting.safe_box;
              else $scope.request_service.safe = $scope.defaultSettings.accounting.safe_bank;
            }
          }
        }


        site.showModal('#requestServiceAddModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.displayAddCustomer = function () {

    $scope.error = '';
    $scope.customer = {
      image_url: '/images/customer.png',
      active: true,
      allergic_food_list: [{}],
      allergic_drink_list: [{}],
      medicine_list: [{}],
      disease_list: [{}],
    };
    site.showModal('#customerAddModal');
    document.querySelector('#customerAddModal .tab-link').click();
  };

  $scope.addCustomer = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    const v = site.validated('#customerAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/customers/add",
      data: $scope.customer
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#customerAddModal');
          $scope.count = $scope.list.length;
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
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
        if (response.data.done && response.data.doc)
          $scope.defaultSettings = response.data.doc;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.addRequestService = function () {
    $scope.error = '';
    const v = site.validated('#requestServiceAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    if ($scope.request_service.paid_up > $scope.amount_currency) {
      $scope.error = "##word.err_net_value##";
      return;
    }


    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_service/add",
      data: $scope.request_service
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if ($scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {
            let request_doc = response.data.doc;
            $scope.account_invoices = {
              image_url: '/images/account_invoices.png',
              date: new Date(),
              invoice_id: request_doc.id,
              customer: request_doc.customer,
              trainer: request_doc.trainer,
              hall: request_doc.hall,
              shift: request_doc.shift,
              service_name: request_doc.service_name,
              currency: request_doc.currency,
              payment_method: request_doc.payment_method,
              safe: request_doc.safe,
              date_from: request_doc.date_from,
              date_to: request_doc.date_to,
              net_value: request_doc.paid_require,
              paid_up: request_doc.paid_up,
              invoice_code: request_doc.code,
              total_discount: request_doc.total_discount,
              source_type: {
                id: 4,
                en: "Orders Service",
                ar: "طلب خدمة"
              },
              active: true
            };

            $scope.addAccountInvoice($scope.account_invoices);
          }
          site.hideModal('#requestServiceAddModal');
          $scope.getRequestServiceList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayAccountInvoice = function (request_service) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.account_invoices = {
          image_url: '/images/account_invoices.png',
          date: new Date(),
          invoice_id: request_service.id,
          customer: request_service.customer,
          trainer: request_service.trainer,
          hall: request_service.hall,
          shift: shift,
          service_name: request_service.service_name,
          date_from: request_service.date_from,
          date_to: request_service.date_to,
          net_value: request_service.paid_require,
          paid_up: 0,
          invoice_code: request_service.code,
          total_discount: request_service.total_discount,
          source_type: {
            id: 4,
            en: "Orders Service",
            ar: "طلب خدمة"
          },
          active: true
        };

        if ($scope.defaultSettings.accounting) {
          $scope.account_invoices.currency = $scope.defaultSettings.accounting.currency;
          if ($scope.defaultSettings.accounting.payment_method) {
            $scope.account_invoices.payment_method = $scope.defaultSettings.accounting.payment_method;
            $scope.loadSafes($scope.account_invoices.payment_method, $scope.account_invoices.currency);
            if ($scope.account_invoices.payment_method.id == 1)
              $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_box;
            else $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_bank;
          }
        }
        if ($scope.account_invoices.currency)
          $scope.amount_currency = site.toNumber($scope.account_invoices.net_value) / site.toNumber($scope.account_invoices.currency.ex_rate);
        $scope.calc($scope.account_invoices);

        site.showModal('#accountInvoiceModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addAccountInvoice = function (account_invoices) {
    $scope.error = '';
    $scope.busy = true;

    if (account_invoices.paid_up > 0 && !account_invoices.safe) {
      $scope.error = "##word.should_select_safe##";
      return;
    } else if (account_invoices.paid_up > $scope.amount_currency) {
      $scope.error = "##word.err_net_value##";
      return;
    }

    if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.work_posting)
      account_invoices.posting = false;
    else account_invoices.posting = true;

    if (account_invoices.paid_up <= 0) account_invoices.safe = null;
    $http({
      method: "POST",
      url: "/api/account_invoices/add",
      data: account_invoices
    }).then(
      function (response) {
        $scope.busy = false;
        if (response) {
          site.hideModal('#accountInvoiceModal');
          $scope.printAccountInvoive();
          $scope.getRequestServiceList();
        } else $scope.error = response.data.error;
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.printAccountInvoive = function () {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;

    let ip = '127.0.0.1';
    let port = '11111';
    if ($scope.defaultSettings.printer_program) {
      ip = $scope.defaultSettings.printer_program.ip || '127.0.0.1';
      port = $scope.defaultSettings.printer_program.port || '11111';
    };

    $scope.account_invoices.total_remain = $scope.account_invoices.net_value - $scope.account_invoices.paid_up;

    let obj_print = { data: [] };

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.printer_path)
      obj_print.printer = $scope.defaultSettings.printer_program.printer_path.ip.trim();

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.invoice_header)
      obj_print.data.push({
        type: 'header',
        value: $scope.defaultSettings.printer_program.invoice_header
      });

    obj_print.data.push(
      {
        type: 'title',
        value: $scope.account_invoices.payment_paid_up ? 'Bill payment account' : 'Bill account' + ($scope.account_invoices.code || '')
      },
      {
        type: 'space'
      },
      {
        type: 'text2',
        value2: site.toDateXF($scope.account_invoices.date),
        value: 'Date'
      });

    if ($scope.account_invoices.customer)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.customer.name_ar,
        value: 'Cutomer'
      });

    if ($scope.account_invoices.service_name)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.service_name,
        value: 'Service'
      });

    obj_print.data.push({
      type: 'line'
    });

    if ($scope.account_invoices.total_discount)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.total_discount,
        value: 'Total Discount'
      });

    obj_print.data.push({ type: 'space' });

    if ($scope.account_invoices.payment_paid_up) {
      $scope.account_invoices.total_remain = $scope.account_invoices.total_remain - $scope.account_invoices.payment_paid_up;
      $scope.account_invoices.total_paid_up = $scope.account_invoices.total_paid_up + $scope.account_invoices.payment_paid_up;
    }

    if ($scope.account_invoices.net_value)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.account_invoices.net_value,
          value: "Total Value"
        });

    if ($scope.account_invoices.payment_paid_up || $scope.account_invoices.paid_up) {
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.account_invoices.payment_paid_up || $scope.account_invoices.paid_up,
          value: "Paid Up"
        }, {
        type: 'text2',
        value2: $scope.account_invoices.total_paid_up || $scope.account_invoices.paid_up,
        value: "Total Payments"
      }, { type: 'space' });

    } else obj_print.data.push({ type: 'space' });


    if ($scope.account_invoices.total_remain)
      obj_print.data.push({
        type: 'text2b',
        value2: $scope.account_invoices.total_remain,
        value: "Required to pay"
      });

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.invoice_footer)
      obj_print.data.push({
        type: 'footer',
        value: $scope.defaultSettings.printer_program.invoice_footer
      });

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

  $scope.displayUpdateRequestService = function (request_service) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.viewRequestService(request_service);
        $scope.request_service = {};
        site.showModal('#requestServiceUpdateModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.updateRequestService = function () {
    $scope.error = '';
    const v = site.validated('#requestServiceUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if ($scope.request_service.paid_up > $scope.amount_currency) {
      $scope.error = "##word.err_net_value##";
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_service/update",
      data: $scope.request_service
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#requestServiceUpdateModal');
          $scope.getRequestServiceList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.updateAttendService = function (attend_service) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_service/update",
      data: attend_service
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendServiceModal');
          $scope.getRequestServiceList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };


  $scope.displayDetailsRequestService = function (request_service) {
    $scope.error = '';
    $scope.viewRequestService(request_service);
    $scope.request_service = {};
    site.showModal('#requestServiceViewModal');
  };

  $scope.viewRequestService = function (request_service) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/request_service/view",
      data: {
        id: request_service.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.request_service = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteRequestService = function (request_service) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.viewRequestService(request_service);
        $scope.request_service = {};
        site.showModal('#requestServiceDeleteModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.deleteRequestService = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/request_service/delete",
      data: {
        id: $scope.request_service.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#requestServiceDeleteModal');
          $scope.getRequestServiceList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.loadCurrencies = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/currency/all",
      data: {
        select: {
          id: 1,
          name: 1,
          ex_rate: 1
        },
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.currenciesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getSafeByType = function (obj) {
    $scope.error = '';
    if ($scope.defaultSettings.accounting) {
      $scope.loadSafes(obj.payment_method, obj.currency);
      if (obj.payment_method.id == 1) {
        if ($scope.defaultSettings.accounting.safe_box)
          obj.safe = $scope.defaultSettings.accounting.safe_box
      } else {
        if ($scope.defaultSettings.accounting.safe_bank)
          obj.safe = $scope.defaultSettings.accounting.safe_bank
      }
    }
  };

  $scope.loadSafes = function (method, currency) {
    $scope.error = '';
    $scope.busy = true;

    let where = { 'currency.id': currency.id };

    if (method.id == 1)
      where['type.id'] = 1;
    else where['type.id'] = 2;

    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {
        select: {
          id: 1,
          name: 1,
          number: 1,
          currency: 1,
          type: 1
        },
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.safesList = response.data.list;

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getRequestServiceList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/request_service/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#requestServiceSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getCustomerList = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/customers/all",
        data: {
          search: $scope.search_customer

        }
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
  };

  $scope.getService = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/service/all",
        data: {
          where: { name: $scope.search_service },
          select: { id: 1, name: 1, services_price: 1, selectedServicesList: 1, attend_count: 1, available_period: 1, complex_service: 1 }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              $scope.servicesList = response.data.list;
            }
          }
        },
        function (err) {
          console.log(err);
        }
      );
    }
  };

  $scope.getHallList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/hall/all",
      data: {
        select: { id: 1, name: 1, capaneighborhood: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.hallsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTrainerList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/trainer/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.trainersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadDiscountTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/discount_types/all",
      data: {
        select: {
          id: 1,
          name: 1,
          value: 1,
          type: 1
        }
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

  /*  $scope.getPeriod = function () {
     $scope.busy = true;
     $scope.periodList = [];
     $http({
       method: "POST",
       url: "/api/period_class/all"
 
     }).then(
       function (response) {
         $scope.busy = false;
         $scope.periodList = response.data;
       },
       function (err) {
         $scope.busy = false;
         $scope.error = err;
       }
     )
   }; */

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#requestServiceSearchModal');
  };

  $scope.changeService = function (request_service) {
    request_service.service_id = $scope.service.id;
    request_service.service_name = $scope.service.name;
    request_service.selectedServicesList = $scope.service.selectedServicesList;
    request_service.attend_count = $scope.service.attend_count || null;
    request_service.available_period = $scope.service.available_period || 0;
    request_service.services_price = $scope.service.services_price || 0;
    $scope.service = {};
  };

  $scope.startDateToDay = function () {
    $scope.request_service.date_from = new Date();
  };

  $scope.attendNow = function (s) {

    s.current_attendance = (s.current_attendance || 0) + 1;
    s.remain = s.remain - 1;

    $scope.attend_service.attend_service_list.unshift({
      id: s.service_id || s.id,
      trainer_attend: s.trainer_attend,
      name: s.name || $scope.attend_service.service_name,
      attend_date: new Date(),
      attend_time: {
        hour: new Date().getHours(),
        minute: new Date().getMinutes()
      }
    });
  };

  $scope.leaveNow = function (s) {
    s.leave_date = new Date();
    s.leave_time = {
      hour: new Date().getHours(),
      minute: new Date().getMinutes()
    };
  };

  $scope.showAttendServices = function (service) {
    $scope.attend_service = service;

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
          if ($scope.attend_service && $scope.attend_service.selectedServicesList.length > 0) {
            $scope.attend_service.selectedServicesList.forEach(selectedServicesList => {
              selectedServicesList.trainer_attend = $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.trainer : null
            });
          } else {
            $scope.attend_service.trainer_attend = $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.trainer : null
          }
        }
      }
    );

    site.showModal('#attendServiceModal');

  };

  $scope.addDiscount = function () {
    $scope.error = '';
    if (!$scope.discount.value) {
      $scope.error = '##word.error_discount##';
      return;
    } else {
      $scope.request_service.discountes = $scope.request_service.discountes || [];
      $scope.request_service.discountes.push({
        name: $scope.discount.name,
        value: $scope.discount.value,
        type: $scope.discount.type
      });
    };
  };

  $scope.calc = function (obj) {
    $scope.error = '';
    $timeout(() => {
      obj.total_discount = 0;
      let total_attend_count = site.toNumber(obj.services_price) * obj.service_count;
      obj.paid_require = site.toNumber(obj.services_price);
      if (obj.discountes && obj.discountes.length > 0) {
        obj.discountes.forEach(ds => {
          if (ds.type === "percent") obj.total_discount += total_attend_count * site.toNumber(ds.value) / 100;
          else obj.total_discount += site.toNumber(ds.value);
        });
      };
      obj.paid_require = (site.toNumber(obj.services_price) * site.toNumber(obj.service_count)) - obj.total_discount;
      $scope.discount = {
        type: 'number'
      };
      $scope.amount_currency = site.toNumber(obj.paid_require) / site.toNumber(obj.currency.ex_rate);

    }, 250);
  };

  $scope.deleteDiscount = function (_ds) {
    $scope.request_service.discountes.splice($scope.request_service.discountes.indexOf(_ds), 1);
  };

  $scope.searchAll = function () {
    $scope.getRequestServiceList($scope.search);
    site.hideModal('#requestServiceSearchModal');
    $scope.search = {};
  };

  $scope.getCustomerGroupList = function () {
    $http({
      method: "POST",
      url: "/api/customers_group/all",
      data: {
        select: {
          id: 1,
          name: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.customerGroupList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getIndentfy = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.indentfyList = [];
    $http({
      method: "POST",
      url: "/api/indentfy_employee/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.indentfyList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

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
        if (site.feature('gym')) $scope.sourceTypeList = response.data.filter(i => i.id != 3 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('restaurant')) $scope.sourceTypeList = response.data.filter(i => i.id != 4 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('pos')) $scope.sourceTypeList = response.data.filter(i => i.id != 4 && i.id != 3 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('academy')) $scope.sourceTypeList = response.data.filter(i => i.id != 4 && i.id != 3);
        else $scope.sourceTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.get_open_shift = function (callback) {
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


  $scope.getRequestServiceList();
  $scope.getHallList();
  $scope.getTrainerList();
  $scope.getPaymentMethodList();
  $scope.loadCurrencies();
  $scope.getSourceType();
  $scope.getIndentfy();
  $scope.getCustomerGroupList();
  $scope.getDefaultSettings();
  $scope.loadDiscountTypes();
});