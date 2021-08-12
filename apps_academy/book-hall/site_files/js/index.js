app.controller("book_hall", function ($scope, $http, $timeout) {

  $scope.book_hall = {};

  $scope.displayAddBookHall = function () {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.book_hall = {
          image_url: '/images/book_hall.png',
          active: true,
          date: new Date(),
          date_from: new Date(),
          shift: shift,
          net_value: 0,
          dates_list: [],
          paid_list: []
        };

        if ($scope.defaultSettings.general_Settings) {
          if ($scope.defaultSettings.general_Settings.hall)
            $scope.book_hall.hall = $scope.hallsList.find(_hall => { return _hall.id === $scope.defaultSettings.general_Settings.hall.id });
          if ($scope.defaultSettings.general_Settings.tenant)
            $scope.book_hall.tenant = $scope.defaultSettings.general_Settings.tenant;
        };

        if ($scope.defaultSettings.accounting) {
          $scope.book_hall.currency = $scope.defaultSettings.accounting.currency;
          if ($scope.defaultSettings.accounting.payment_method) {
            $scope.book_hall.payment_method = $scope.defaultSettings.accounting.payment_method;
            $scope.loadSafes($scope.book_hall.payment_method, $scope.book_hall.currency);
            if ($scope.book_hall.payment_method.id == 1)
              $scope.book_hall.safe = $scope.defaultSettings.accounting.safe_box;
            else $scope.book_hall.safe = $scope.defaultSettings.accounting.safe_bank;
          }
        }
        if ($scope.book_hall.currency) {
          $scope.amount_currency = site.toNumber($scope.book_hall.net_value) / site.toNumber($scope.book_hall.currency.ex_rate);
          $scope.amount_currency = site.toNumber($scope.amount_currency);
        }


        site.showModal('#bookHallAddModal');

      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addBookHall = function () {
    $scope.error = '';
    const v = site.validated('#bookHallAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    if ($scope.book_hall.dates_list.length < 1) {

      $scope.error = "##word.err_dates##";
      return;
    };

    if ($scope.book_hall.paid_up > $scope.amount_currency) {
      $scope.error = "##word.err_net_value##";
      return;
    }

    if ($scope.book_hall.paid_up > 0 && !$scope.book_hall.safe) {
      $scope.error = "##word.should_select_safe##";
      return;

    } else if ($scope.book_hall.paid_up > $scope.book_hall.net_value) {
      $scope.error = "##word.err_paid_require##";
      return;
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/book_hall/add",
      data: $scope.book_hall
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
              tenant: request_doc.tenant,
              payment_method: request_doc.payment_method,
              hall: request_doc.hall,
              shift: request_doc.shift,
              date_from: request_doc.date_from,
              date_to: request_doc.date_to,
              total_period: request_doc.total_period,
              period: request_doc.period,
              price_hour: request_doc.price_hour,
              currency: request_doc.currency,
              safe: request_doc.safe,
              price_day: request_doc.price_day,
              total_discount: request_doc.total_discount,
              net_value: request_doc.net_value,
              paid_up: request_doc.paid_up,
              invoice_code: request_doc.code,
              source_type: {
                id: 5,
                en: "Booking A Hall",
                ar: "حجز قاعة"
              },
              active: true
            };

            $scope.addAccountInvoice($scope.account_invoices);

          }

          site.hideModal('#bookHallAddModal');
          $scope.getBookHallList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateBookHall = function (book_hall) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.viewBookHall(book_hall);
        $scope.book_hall = {};
        site.showModal('#bookHallUpdateModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.updateBookHall = function () {
    $scope.error = '';
    const v = site.validated('#bookHallUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/book_hall/update",
      data: $scope.book_hall
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#bookHallUpdateModal');
          site.hideModal('#attendViewModal');
          $scope.getBookHallList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsBookHall = function (book_hall) {
    $scope.error = '';
    $scope.viewBookHall(book_hall);
    $scope.book_hall = {};
    site.showModal('#bookHallViewModal');
  };

  $scope.viewBookHall = function (book_hall) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/book_hall/view",
      data: {
        id: book_hall.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.book_hall = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteBookHall = function (book_hall) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.viewBookHall(book_hall);
        $scope.book_hall = {};
        site.showModal('#bookHallDeleteModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.deleteBookHall = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/book_hall/delete",
      data: {
        id: $scope.book_hall.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#bookHallDeleteModal');
          $scope.getBookHallList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getBookHallList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/book_hall/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#bookHallSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getPeriod = function () {
    $scope.busy = true;
    $scope.periodList = [];
    $http({
      method: "POST",
      url: "/api/period_book/all"

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
  };

  $scope.getClassRooms = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/hall/all",
      data: {
        where: {
          active: true
        },
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

  $scope.getTimeList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/times_book/all",
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.timeList = response.data;

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getAttend = function () {
    $scope.busy = true;
    $scope.attendList = [];
    $http({
      method: "POST",
      url: "/api/attend_book_hall/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.attendList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTenantList = function (ev) {
    $scope.busy = true;

    if (ev.which !== 13) {
      return;
    }
    $scope.tenantList = [];
    $http({
      method: "POST",
      url: "/api/tenant/all",
      data: {
        search: $scope.tenant_search,
        where: { active: true },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.tenantList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.showTenant = function (id) {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/tenant/view",
      data: {
        id: id,
        select: {}
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.tenant = response.data.doc;
          site.showModal('#tenantViewModal');
          document.querySelector('#tenantViewModal .tab-link').click();

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.createDates = function () {

    $scope.book_hall.dates_list = [];

    for (let i = 0; i < $scope.book_hall.number_lecture; i++) {
      $scope.book_hall.dates_list.push({});
    }

  };

  $scope.paidShow = function () {
    $scope.error = '';

    $scope.book_hall.date_paid = new Date();
    $scope.book_hall.safe = '';
    site.showModal('#paidModal')

  };

  $scope.paidPaybackShow = function (book_hall) {
    $scope.error = '';
    $scope.viewBookHall(book_hall);

    site.showModal('#paidPaybackModal')

  };

  $scope.showAccept = function () {
    $scope.error = '';
    if (!$scope.book_hall.safe) {

      $scope.error = "##word.safe_err##";
      return;

    } else {
      site.showModal('#acceptModal')
    }

  };

  $scope.showAttend = function (d) {

    $scope.book_hall = d;
    site.showModal('#attendViewModal')

  };

  $scope.attend = function (d) {
    d.attend = $scope.attendList[0];
    /*    $http({
         method: "POST",
         url: "/api/book_hall/update",
         data: $scope.book_hall
       }) */
  };

  $scope.cancel = function (d) {
    d.attend = $scope.attendList[1];
    /*   $http({
        method: "POST",
        url: "/api/book_hall/update",
        data: $scope.book_hall
      }) */
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

  /*  $scope.paidUpdate = function () {
     $scope.error = '';
     if ($scope.book_hall.safe) {
 
       if (!$scope.book_hall.total_rest) {
         $scope.book_hall.total_rest = $scope.book_hall.paid;
 
       } else {
         $scope.book_hall.total_rest += $scope.book_hall.paid;
       };
 
       $scope.book_hall.rest = ($scope.book_hall.net_value - $scope.book_hall.total_rest);
       $scope.book_hall.baid_go = $scope.book_hall.paid;
 
       $scope.book_hall.paid_list = $scope.book_hall.paid_list || [];
       $scope.book_hall.paid_list.unshift({
 
         payment: $scope.book_hall.baid_go,
         date_paid: $scope.book_hall.date_paid,
         safe: $scope.book_hall.safe
 
       });
 
       $scope.book_hall.paid = 0;
       $scope.error = "";
       $scope.busy = true;
 
       $http({
         method: "POST",
         url: "/api/book_hall/update_paid",
         data: $scope.book_hall
       })
     };
     site.hideModal('#acceptModal')
 
   };
  */

  $scope.get_open_shift = function (callback) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: { active: true },
        select: { id: 1, name_ar: 1, name_en: 1, code: 1, from_date: 1, from_time: 1, to_date: 1, to_time: 1 }
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

  $scope.loadDiscountTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/discount_types/all",
      data: {
        select: {
          code: 1,
          id: 1,
          name_ar: 1, name_en: 1,
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

  $scope.addDiscount = function () {
    $scope.error = '';
    if (!$scope.discount.value) {
      $scope.error = '##word.error_discount##';
      return;
    } else {
      $scope.book_hall.discountes = $scope.book_hall.discountes || [];
      $scope.book_hall.discountes.push({
        name_ar: $scope.discount.name_ar, name_en: $scope.discount.name_en,
        value: $scope.discount.value,
        type: $scope.discount.type
      });
    };
  };

  $scope.deleteDiscount = function (_ds) {
    $scope.book_hall.discountes.splice($scope.book_hall.discountes.indexOf(_ds), 1);
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

  $scope.calc = function (obj) {
    $scope.error = '';
    $timeout(() => {
      obj.total_discount = 0;

      if (obj.discountes && obj.discountes.length > 0)
        obj.discountes.forEach(ds => {
          if (ds.type == 'percent')
            obj.total_discount += obj.net_value * site.toNumber(ds.value) / 100;
          else obj.total_discount += site.toNumber(ds.value);
        });

      if (obj.period && obj.period.id == 1) {

        obj.net_value = obj.total_period * obj.price_day - obj.total_discount;
      };

      if (obj.period && obj.period.id == 2) {

        obj.net_value = obj.total_period * obj.price_hour - obj.total_discount;
      };

      if (obj.currency) {
        $scope.amount_currency = obj.net_value / obj.currency.ex_rate;
        $scope.amount_currency = site.toNumber($scope.amount_currency);

      }
      $scope.discount = {
        type: 'number'
      };
    }, 250);
  };

  $scope.displayAccountInvoice = function (book_hall) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.account_invoices = {
          image_url: '/images/account_invoices.png',
          date: new Date(),
          invoice_id: book_hall.id,
          tenant: book_hall.tenant,
          hall: book_hall.hall,
          shift: shift,
          date_from: book_hall.date_from,
          date_to: book_hall.date_to,
          total_period: book_hall.total_period,
          period: book_hall.period,
          price_hour: book_hall.price_hour,
          price_day: book_hall.price_day,
          total_discount: book_hall.total_discount,
          net_value: book_hall.net_value,
          paid_up: 0,
          invoice_code: book_hall.code,
          source_type: {
            id: 5,
            en: "Booking A Hall",
            ar: "حجز قاعة"
          },
          active: true
        };

        if ($scope.defaultSettings.accounting) {
          $scope.account_invoices.currency = $scope.defaultSettings.accounting.currency;
          if ($scope.defaultSettings.accounting.payment_method) {
            $scope.account_invoices.payment_method = $scope.defaultSettings.accounting.payment_method;

            $scope.loadSafes($scope.account_invoices.payment_method, $scope.account_invoices.currency);
            if ($scope.account_invoices.payment_method.id == 1) {
              if ($scope.defaultSettings.accounting.safe_box)
                $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_box;
            } else {
              if ($scope.defaultSettings.accounting.safe_bank)
                $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_bank;
            }
          }
        }

        if ($scope.account_invoices.currency) {
          $scope.amount_currency = site.toNumber($scope.account_invoices.net_value) / site.toNumber($scope.account_invoices.currency.ex_rate);
          $scope.amount_currency = site.toNumber($scope.amount_currency);
        }

        $scope.calc($scope.account_invoices);
        site.showModal('#accountInvoiceModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addAccountInvoice = function (account_invoices) {
    $scope.error = '';
    $scope.busy = true;

    if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.work_posting)
      account_invoices.posting = false;
    else account_invoices.posting = true;


    $http({
      method: "POST",
      url: "/api/account_invoices/add",
      data: account_invoices
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#accountInvoiceModal');
          $scope.printAccountInvoive();
          $scope.getBookHallList();
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
    let port = '60080';

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.printer_path) {
      ip = $scope.defaultSettings.printer_program.printer_path.ip_device || '127.0.0.1';
      port = $scope.defaultSettings.printer_program.printer_path.Port_device || '60080';
    };

    $scope.account_invoices.total_remain = $scope.account_invoices.net_value - $scope.account_invoices.paid_up;


    $scope.account_invoices.total_remain = site.toNumber($scope.account_invoices.total_remain);
    $scope.account_invoices.total_paid_up = site.toNumber($scope.account_invoices.total_paid_up);
    $scope.account_invoices.total_tax = site.toNumber($scope.account_invoices.total_tax);
    $scope.account_invoices.total_discount = site.toNumber($scope.account_invoices.total_discount);
    $scope.account_invoices.net_value = site.toNumber($scope.account_invoices.net_value);
    $scope.account_invoices.paid_up = site.toNumber($scope.account_invoices.paid_up);
    $scope.account_invoices.payment_paid_up = site.toNumber($scope.account_invoices.payment_paid_up);


    let obj_print = { data: [] };

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.printer_path)
      obj_print.printer = $scope.defaultSettings.printer_program.printer_path.ip.name.trim();

    if ($scope.defaultSettings.printer_program.thermal_header && $scope.defaultSettings.printer_program.thermal_header.length > 0) {
      $scope.defaultSettings.printer_program.thermal_header.forEach(_ih => {
        obj_print.data.push({
          type: 'header',
          value: _ih.name
        });
      });

    }

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

    if ($scope.account_invoices.tenant)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.tenant.name_ar,
        value: '##word.customer##'
      });

    if ($scope.account_invoices.hall)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.hall.name_ar,
        value: 'Service'
      });

    obj_print.data.push({
      type: 'line'
    });

    if ($scope.account_invoices.total_discount)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.total_discount,
        value: '##word.total_discount##'
      });

    obj_print.data.push({ type: 'space' });

    if ($scope.account_invoices.payment_paid_up) {
      $scope.account_invoices.total_remain = $scope.account_invoices.total_remain - $scope.account_invoices.payment_paid_up;
      $scope.account_invoices.total_paid_up = $scope.account_invoices.total_paid_up + $scope.account_invoices.payment_paid_up;

      $scope.account_invoices.total_remain = site.toNumber($scope.account_invoices.total_remain);
      $scope.account_invoices.total_paid_up = site.toNumber($scope.account_invoices.total_paid_up);

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
          value: "##word.paid_up##"
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
        value: "##word.paid_require##"
      });

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.thermal_footer && $scope.defaultSettings.printer_program.thermal_footer.length > 0) {
      $scope.defaultSettings.printer_program.thermal_footer.forEach(_if => {
        obj_print.data.push({
          type: 'header',
          value: _if.name
        });
      });
    }
    $http({
      method: "POST",
      url: `http://${ip}:${port}/print`,
      data: obj_print
    }).then(
      function (response) {
        if (response.data.done)
          $scope.busy = false;
      },
      function (err) {
        console.log(err);
      }
    );
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

    if (currency && currency.id && method && method.id) {

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
            name_ar: 1, name_en: 1,
            commission: 1,
            currency: 1,
            type: 1,
            code: 1
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
    }
  };

  $scope.loadCurrencies = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/currency/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
          minor_currency_ar: 1, minor_currency_en: 1,
          ex_rate: 1,
          code: 1
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

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#bookHallSearchModal');

  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "booking_halls"
      }
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
    )
  };

  $scope.searchAll = function () {
    $scope.getBookHallList($scope.search);
    site.hideModal('#bookHallSearchModal');
    $scope.search = {};

  };

  $scope.getBookHallList();
  $scope.getNumberingAuto();
  $scope.getPeriod();
  $scope.getPaymentMethodList();
  $scope.loadCurrencies();
  $scope.getDefaultSettings();
  $scope.loadDiscountTypes();
  $scope.getTimeList();
  $scope.getAttend();
  $scope.getClassRooms();
});