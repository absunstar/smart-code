app.controller("request_service", function ($scope, $http, $timeout) {

  $scope.request_service = {};
  $scope.displayAddRequestService = function () {
    site.showModal('#requestServiceAddModal');
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
          $scope.error = '';
          $scope.discount = {};

          $scope.request_service = {
            image_url: '/images/request_service.png',
            active: true,
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

        };
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
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_service/add",
      data: $scope.request_service
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
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

  $scope.displayCreateInvoice = function (request_service) {

    $scope.create_invoices = {
      image_url: '/images/create_invoices.png',
      date: new Date(),
      request_service_id: request_service.id,
      customer: request_service.customer,
      trainer: request_service.trainer,
      hall: request_service.hall,
      service_name: request_service.service_name,
      date_from: request_service.date_from,
      date_to: request_service.date_to,
      paid_require: request_service.paid_require,
      paid_up: 0,
      service_code: request_service.code,
      total_discount: request_service.total_discount,
      active: true
    };

    if ($scope.defaultSettings.general_Settings) {
      if ($scope.defaultSettings.general_Settings.source_type)
        $scope.create_invoices.source_type = $scope.defaultSettings.general_Settings.source_type;
      if ($scope.defaultSettings.general_Settings.payment_method)
        $scope.create_invoices.payment_method = $scope.defaultSettings.general_Settings.payment_method;
    };

    if ($scope.defaultSettings.accounting) {
      if ($scope.defaultSettings.accounting.safe)
        $scope.create_invoices.safe = $scope.defaultSettings.accounting.safe;
    };
    site.showModal('#createInvoiceModal');
  };

  $scope.addCreateInvoice = function () {
    $scope.error = '';
    const v = site.validated('#creatInvoicesAddModal');
    if ($scope.busy) return;

    if (!v.ok) {
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
          site.hideModal('#createInvoiceModal');
          $scope.printCreateInvoive();

          $scope.updateRequestService();
        } else $scope.error = response.data.error;
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.printCreateInvoive = function () {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;

    let ip = '127.0.0.1';
    let port = '11111';
    if ($scope.defaultSettings.printer_program) {
      ip = $scope.defaultSettings.printer_program.ip || '127.0.0.1';
      port = $scope.defaultSettings.printer_program.port || '11111';
    };

    $scope.create_invoices.total_remain = $scope.create_invoices.paid_require - $scope.create_invoices.paid_up;

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
        value: $scope.create_invoices.payment_paid_up ? 'Bill payment account' : 'Bill account' + ($scope.create_invoices.code || '')
      },
      {
        type: 'space'
      },
      {
        type: 'text2',
        value2: site.toDateXF($scope.create_invoices.date),
        value: 'Date'
      });

    if ($scope.create_invoices.customer)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.create_invoices.customer.name_ar,
        value: 'Cutomer'
      });

    if ($scope.create_invoices.service_name)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.create_invoices.service_name,
        value: 'Service'
      });

    if ($scope.create_invoices.table)
      obj_print.data.push({
        type: 'text2',
        value: $scope.create_invoices.table.name,
        value2: $scope.create_invoices.table.tables_group.name
      });

    obj_print.data.push({
      type: 'line'
    });

    if ($scope.create_invoices.total_discount)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.create_invoices.total_discount,
        value: 'Total Discount'
      });


    obj_print.data.push({ type: 'space' });

    if ($scope.create_invoices.payment_paid_up) {
      $scope.create_invoices.total_remain = $scope.create_invoices.total_remain - $scope.create_invoices.payment_paid_up;
      $scope.create_invoices.total_paid_up = $scope.create_invoices.total_paid_up + $scope.create_invoices.payment_paid_up;
    }

    if ($scope.create_invoices.paid_require)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.create_invoices.paid_require,
          value: "Total Value"
        });

    if ($scope.create_invoices.payment_paid_up || $scope.create_invoices.paid_up)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.create_invoices.payment_paid_up || $scope.create_invoices.paid_up,
          value: "Paid Up"
        });

    if ($scope.create_invoices.payment_paid_up || $scope.create_invoices.paid_up)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.create_invoices.total_paid_up || $scope.create_invoices.paid_up,
          value: "Total Payments"
        });

    obj_print.data.push({ type: 'space' });

    if ($scope.create_invoices.total_remain)
      obj_print.data.push({
        type: 'text2b',
        value2: $scope.create_invoices.total_remain,
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
    $scope.viewRequestService(request_service);
    $scope.request_service = {};
    site.showModal('#requestServiceUpdateModal');
  };

  $scope.updateRequestService = function () {
    $scope.error = '';
    const v = site.validated('#requestServiceUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
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
    $scope.viewRequestService(request_service);
    $scope.request_service = {};
    site.showModal('#requestServiceDeleteModal');

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
          /*  select: {
            id: 1,
            name_ar: 1,
            name_en: 1,
          } */
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
      url: "/api/employees/all",
      data: {
        where: {
          'job.trainer': true
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
  /* 
    $scope.handleServiceAttend = function (service) {
  
      $scope.attend_service.attend_service_list = $scope.attend_service.attend_service_list || [];
  
      if ($scope.attend_service.selectedServicesList && $scope.attend_service.selectedServicesList.length > 0) {
  
        $scope.attend_service.selectedServicesList.forEach(attend_service => {
          attend_service.total_real_attend_count = attend_service.total_attend_count * $scope.attend_service.service_count;
          attend_service.current_attendance = $scope.attend_service.attend_service_list.length;
          attend_service.remain = attend_service.total_real_attend_count - attend_service.current_attendance || 0;
        });
  
      } else {
        service.total_real_attend_count = service.attend_count * $scope.attend_service.service_count;
        service.current_attendance = $scope.attend_service.attend_service_list.length;
        service.remain = service.total_real_attend_count - service.current_attendance || 0;
      }
    };
   */
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

  $scope.calc = function () {
    $scope.error = '';
    $timeout(() => {
      $scope.request_service.total_discount = 0;
      let total_attend_count = Number($scope.request_service.services_price) * $scope.request_service.service_count;
      $scope.request_service.paid_require = Number($scope.request_service.services_price);
      if ($scope.request_service.discountes && $scope.request_service.discountes.length > 0) {
        $scope.request_service.discountes.forEach(ds => {
          if (ds.type === "percent") {
            $scope.request_service.total_discount += total_attend_count * parseFloat(ds.value) / 100;
          } else {
            $scope.request_service.total_discount += parseFloat(ds.value);
          };
        });
      };
      $scope.request_service.paid_require = (Number($scope.request_service.services_price) * Number($scope.request_service.service_count || 1)) - $scope.request_service.total_discount;
    }, 200);
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
        $scope.sourceTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.getRequestServiceList();
  $scope.getHallList();
  $scope.getTrainerList();
  $scope.getCustomerGroupList();
  $scope.getPaymentMethodList();
  $scope.getSourceType();
  $scope.getIndentfy();
  $scope.getDefaultSettings();
  $scope.loadDiscountTypes();
});