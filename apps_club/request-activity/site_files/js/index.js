app.controller("request_activity", function ($scope, $http, $timeout) {

  $scope.request_activity = {};

  $scope.displayAddRequestActivity = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.discount = {};
        $scope.request_activity = {
          image_url: '/images/request_activity.png',
          active: true,
          shift: shift,
          activity_count: 1,
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
            $scope.request_activity.hall = $scope.defaultSettings.general_Settings.hall;
          if ($scope.defaultSettings.general_Settings.trainer)
            $scope.request_activity.trainer = $scope.defaultSettings.general_Settings.trainer;
        };

        if ($scope.defaultSettings.accounting) {
          if ($scope.defaultSettings.accounting.create_invoice_auto) {
            $scope.request_activity.currency = $scope.defaultSettings.accounting.currency;
            if ($scope.defaultSettings.accounting.payment_method) {
              $scope.request_activity.payment_method = $scope.defaultSettings.accounting.payment_method;
              $scope.loadSafes($scope.request_activity.payment_method, $scope.request_activity.currency);
              if ($scope.request_activity.payment_method.id == 1)
                $scope.request_activity.safe = $scope.defaultSettings.accounting.safe_box;
              else $scope.request_activity.safe = $scope.defaultSettings.accounting.safe_bank;
            }
          }
        }

        site.showModal('#requestActivityAddModal');
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
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"

          } else if (response.data.error.like('*maximum number of adds exceeded*')) {
            $scope.error = "##word.err_maximum_adds##"

          } else if (response.data.error.like('*ername must be typed correctly*')) {
            $scope.error = "##word.err_username_contain##"
            
          } else if (response.data.error.like('*User Is Exist*')) {
            $scope.error = "##word.user_exists##"
          }

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

  $scope.addRequestActivity = function () {
    $scope.error = '';
    const v = site.validated('#requestActivityAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    if ($scope.request_activity.paid_up > $scope.amount_currency) {
      $scope.error = "##word.err_net_value##";
      return;
    };

    if ($scope.account_invoices && $scope.account_invoices.payable_list && $scope.account_invoices.payable_list.length > 0) {
      $scope.request_activity.payable_list = $scope.account_invoices.payable_list;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_activity/add",
      data: $scope.request_activity
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
              payable_list: response.data.doc.payable_list,
              hall: request_doc.hall,
              shift: request_doc.shift,
              activity_name_ar: request_doc.activity_name_ar,
              activity_name_en: request_doc.activity_name_en,
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
                en: "Orders Activity",
                ar: "طلب نشاط"
              },
              active: true
            };

            $scope.addAccountInvoice($scope.account_invoices);
          }
          site.hideModal('#requestActivityAddModal');
          $scope.getRequestActivityList();
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

  $scope.displayAccountInvoice = function (request_activity) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.account_invoices = {
          image_url: '/images/account_invoices.png',
          date: new Date(),
          invoice_id: request_activity.id,
          customer: request_activity.customer,
          trainer: request_activity.trainer,
          hall: request_activity.hall,
          shift: shift,
          activity_name_ar: request_activity.activity_name_ar,
          activity_name_en: request_activity.activity_name_en,
          date_from: request_activity.date_from,
          date_to: request_activity.date_to,
          net_value: request_activity.paid_require,
          paid_up: 0,
          invoice_code: request_activity.code,
          total_discount: request_activity.total_discount,
          source_type: {
            id: 4,
            en: "Orders Activity",
            ar: "طلب نشاط"
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
          $scope.getRequestActivityList();
          $scope.account_invoices = {};
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

    $scope.account_invoices.total_remain = $scope.account_invoices.net_value - ($scope.account_invoices.paid_up * $scope.account_invoices.currency.ex_rate);


    $scope.account_invoices.total_remain = site.toNumber($scope.account_invoices.total_remain);
    $scope.account_invoices.total_discount = site.toNumber($scope.account_invoices.total_discount);
    $scope.account_invoices.net_value = site.toNumber($scope.account_invoices.net_value);
    $scope.account_invoices.paid_up = site.toNumber($scope.account_invoices.paid_up);
    $scope.account_invoices.payment_paid_up = site.toNumber($scope.account_invoices.payment_paid_up);

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

    if ($scope.account_invoices.activity_name_ar)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.activity_name_ar,
        value: 'Activity'
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
    if ($scope.account_invoices.net_value)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.account_invoices.net_value,
          value: "Total Value"
        });

    if ($scope.account_invoices.paid_up)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.account_invoices.paid_up,
          value: "Paid Up"
        });

    if ($scope.account_invoices.currency)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.account_invoices.currency,
          value: "Currency"
        });

    obj_print.data.push({ type: 'space' });

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
        if (response.data.done)
          $scope.busy = false;
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateRequestActivity = function (request_activity) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.viewRequestActivity(request_activity);
        $scope.request_activity = {};
        site.showModal('#requestActivityUpdateModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.updateRequestActivity = function () {
    $scope.error = '';
    const v = site.validated('#requestActivityUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if ($scope.request_activity.paid_up > $scope.amount_currency) {
      $scope.error = "##word.err_net_value##";
      return;
    }

    if ($scope.account_invoices && $scope.account_invoices.payable_list && $scope.account_invoices.payable_list.length > 0) {
      $scope.request_activity.payable_list = $scope.account_invoices.payable_list;
    };


    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_activity/update",
      data: $scope.request_activity
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#requestActivityUpdateModal');
          $scope.getRequestActivityList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.updateAttendActivity = function (attend_activity) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_activity/update",
      data: attend_activity
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendActivityModal');
          $scope.getRequestActivityList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };


  $scope.displayDetailsRequestActivity = function (request_activity) {
    $scope.error = '';
    $scope.viewRequestActivity(request_activity);
    $scope.request_activity = {};
    site.showModal('#requestActivityViewModal');
  };

  $scope.viewRequestActivity = function (request_activity) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/request_activity/view",
      data: {
        id: request_activity.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.request_activity = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteRequestActivity = function (request_activity) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.viewRequestActivity(request_activity);
        $scope.request_activity = {};
        site.showModal('#requestActivityDeleteModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.deleteRequestActivity = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/request_activity/delete",
      data: {
        id: $scope.request_activity.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#requestActivityDeleteModal');
          $scope.getRequestActivityList();
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

  $scope.getRequestActivityList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/request_activity/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#requestActivitySearchModal');
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
          search: $scope.search_customer,
          where: {
            active: true
          }

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

  $scope.getActivity = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/activity/all",
        data: {
          where: { name: $scope.search_activity },
          select: { id: 1, name_ar: 1, name_en: 1, code: 1, activities_price: 1, complex_activities_list: 1, attend_count: 1, available_period: 1, complex_activity: 1 }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              $scope.activitiesList = response.data.list;
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
        select: { id: 1, name_ar: 1, name_en: 1, capaneighborhood: 1, code: 1 }
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
      data: {
        where: {
          active: true
        }
      }
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
    site.showModal('#requestActivitySearchModal');
  };

  $scope.changeActivity = function (request_activity) {
    request_activity.activity_id = $scope.activity.id;
    request_activity.activity_name_ar = $scope.activity.name_ar;
    request_activity.activity_name_en = $scope.activity.name_en;
    request_activity.complex_activities_list = $scope.activity.complex_activities_list;
    request_activity.attend_count = $scope.activity.attend_count || null;
    request_activity.available_period = $scope.activity.available_period || 0;
    request_activity.activities_price = $scope.activity.activities_price || 0;
    if (request_activity && request_activity.complex_activities_list && request_activity.complex_activities_list.length > 0) {
      request_activity.complex_activities_list.forEach(_selected_activity_list => {
        _selected_activity_list.trainer_attend = request_activity.trainer;
        _selected_activity_list.total_real_attend_count = _selected_activity_list.total_attend_count;
        _selected_activity_list.current_attendance = 0;
        _selected_activity_list.remain = _selected_activity_list.total_attend_count;
      });
    } else {
      request_activity.trainer_attend = request_activity.trainer;
      request_activity.total_real_attend_count = request_activity.attend_count;
      request_activity.current_attendance = 0;
      request_activity.remain = request_activity.attend_count;
    }
    $scope.calc(request_activity);
    $scope.activity = {};

  };

  $scope.startDateToDay = function () {
    $scope.request_activity.date_from = new Date();
  };

  $scope.attendNow = function (s) {

    s.current_attendance = (s.current_attendance || 0) + 1;
    s.remain = s.remain - 1;
    $scope.attend_activity.attend_activity_list = $scope.attend_activity.attend_activity_list || [];
    $scope.attend_activity.attend_activity_list.unshift({
      id: s.activity_id || s.id,
      trainer_attend: s.trainer_attend,
      name_ar:  s.name_ar || s.activity_name_ar,
      name_en: s.name_en || s.activity_name_en,
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

  $scope.showAttendActivities = function (activity) {
    $scope.attend_activity = activity;


    if ($scope.attend_activity && $scope.attend_activity.complex_activities_list && $scope.attend_activity.complex_activities_list.length > 0) {
      $scope.attend_activity.complex_activities_list.forEach(_selected_activity_list => {
        _selected_activity_list.trainer_attend = $scope.attend_activity.trainer;
        _selected_activity_list.total_real_attend_count = _selected_activity_list.total_real_attend_count || (_selected_activity_list.total_attend_count * $scope.attend_activity.activity_count);
        _selected_activity_list.current_attendance = _selected_activity_list.current_attendance || 0;
        if(_selected_activity_list.remain || _selected_activity_list.remain === 0){
          _selected_activity_list.remain = _selected_activity_list.remain
        } else {
          _selected_activity_list.remain = _selected_activity_list.total_attend_count * $scope.attend_activity.activity_count

        }
    
      });
    } else {
      $scope.attend_activity.trainer_attend = $scope.attend_activity.trainer;
      $scope.attend_activity.total_real_attend_count = $scope.attend_activity.total_real_attend_count || ($scope.attend_activity.attend_count * $scope.attend_activity.activity_count);
      $scope.attend_activity.current_attendance = $scope.attend_activity.current_attendance || 0;

      if($scope.attend_activity.remain || $scope.attend_activity.remain === 0){
        $scope.attend_activity.remain = $scope.attend_activity.remain
      } else {
        $scope.attend_activity.remain = $scope.attend_activity.total_attend_count * $scope.attend_activity.activity_count

      }
  
    }

    /*     $scope.busy = true;
        $http({
          method: "POST",
          url: "/api/default_setting/get",
          data: {}
        }).then(
          function (response) {
            $scope.busy = false;
            if (response.data.done && response.data.doc) {
              $scope.defaultSettings = response.data.doc;
              if ($scope.attend_activity && $scope.attend_activity.complex_activities_list.length > 0) {
                $scope.attend_activity.complex_activities_list.forEach(complex_activities_list => {
                  complex_activities_list.trainer_attend = $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.trainer : null
                });
              } else {
                $scope.attend_activity.trainer_attend = $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.trainer : null
              }
            }
          }
        );
     */
    site.showModal('#attendActivityModal');

  };

  $scope.addDiscount = function () {
    $scope.error = '';
    if (!$scope.discount.value) {
      $scope.error = '##word.error_discount##';
      return;
    } else {
      $scope.request_activity.discountes = $scope.request_activity.discountes || [];
      $scope.request_activity.discountes.push({
        name_ar: $scope.discount.name_ar, name_en: $scope.discount.name_en,
        value: $scope.discount.value,
        type: $scope.discount.type
      });
    };
  };

  $scope.calcActivityCount = function (request_activity) {
    $timeout(() => {

      if (request_activity && request_activity.complex_activities_list && request_activity.complex_activities_list.length > 0) {
        request_activity.complex_activities_list.forEach(_selected_activity_list => {
          _selected_activity_list.trainer_attend = request_activity.trainer;
          _selected_activity_list.total_real_attend_count = _selected_activity_list.total_attend_count * request_activity.activity_count;
          _selected_activity_list.remain = _selected_activity_list.total_attend_count * request_activity.activity_count;
          _selected_activity_list.current_attendance = 0;
        });
      } else {
        request_activity.trainer_attend = request_activity.trainer;
        request_activity.total_real_attend_count = request_activity.attend_count * request_activity.activity_count;
        request_activity.remain = request_activity.attend_count * request_activity.activity_count;
        request_activity.current_attendance = 0;
      }

    }, 250);
  };

  $scope.calc = function (obj) {
    $scope.error = '';
    $timeout(() => {
      obj.total_discount = 0;
      let total_attend_count = site.toNumber(obj.activities_price) * obj.activity_count;

      if (obj.discountes && obj.discountes.length > 0) {
        obj.discountes.forEach(ds => {
          if (ds.type === "percent") obj.total_discount += total_attend_count * site.toNumber(ds.value) / 100;
          else obj.total_discount += site.toNumber(ds.value);
        });
      };
      if (!obj.source_type) {
        obj.paid_require = (site.toNumber(obj.activities_price) * site.toNumber(obj.activity_count)) - obj.total_discount;
      };

      $scope.discount = {
        type: 'number'
      };

      if (obj.currency) {
        $scope.amount_currency = (obj.paid_require || obj.net_value) / obj.currency.ex_rate;
        $scope.amount_currency = site.toNumber($scope.amount_currency);
        if (!obj.paid_up)
          obj.paid_up = $scope.amount_currency;
      }

    }, 250);
  };

  $scope.deleteDiscount = function (_ds) {
    $scope.request_activity.discountes.splice($scope.request_activity.discountes.indexOf(_ds), 1);
  };

  $scope.searchAll = function () {
    $scope.getRequestActivityList($scope.search);
    site.hideModal('#requestActivitySearchModal');
    $scope.search = {};
  };

  $scope.getCustomerGroupList = function () {
    $http({
      method: "POST",
      url: "/api/customers_group/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
          code: 1
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

  $scope.getGender = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.genderList = [];
    $http({
      method: "POST",
      url: "/api/gender/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.genderList = response.data;
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
        if (site.feature('club')) $scope.sourceTypeList = response.data.filter(i => i.id != 3 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('restaurant')) $scope.sourceTypeList = response.data.filter(i => i.id != 4 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('pos') || site.feature('erp')) $scope.sourceTypeList = response.data.filter(i => i.id != 4 && i.id != 3 && i.id != 5 && i.id != 6 && i.id != 7);
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

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "request_activity"
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

  $scope.paymentsPayable = function (type) {
    $scope.error = '';
    $scope.account_invoices = $scope.account_invoices || {};
    $scope.account_invoices.payable_list = $scope.account_invoices.payable_list || [{}];
    if (type === 'view') {
      site.showModal('#addPaymentsModal');

    }
  };

  $scope.getNumberingAutoInvoice = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "request_activity_invoice"
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCodeInvoice = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getNumberingAutoCustomer = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "customers"
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCodeCustomer = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.getRequestActivityList();
  $scope.getHallList();
  $scope.getTrainerList();
  $scope.getPaymentMethodList();
  $scope.loadCurrencies();
  $scope.getSourceType();
  $scope.getGender();
  $scope.getNumberingAuto();
  $scope.getNumberingAutoInvoice();
  $scope.getNumberingAutoCustomer();
  $scope.getCustomerGroupList();
  $scope.getDefaultSettings();
  $scope.loadDiscountTypes();
});