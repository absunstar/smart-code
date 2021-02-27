app.controller("patients_tickets", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.patients_tickets = {};

  $scope.displayAddPatientsTickets = function () {
    $scope.error = '';
    $scope.patients_tickets = {
      image_url: '/images/patients_tickets.png',
      active: true,
      opening_date: new Date()

    };
    site.showModal('#patientsTicketsAddModal');

  };

  $scope.addPatientsTickets = function () {
    $scope.error = '';
    const v = site.validated('#patientsTicketsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/patients_tickets/add",
      data: $scope.patients_tickets
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#patientsTicketsAddModal');
          $scope.getPatientsTicketsList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*an unclosed ticket for the same*')) {
            $scope.error = "##word.err_unclosing_ticket_patient##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdatePatientsTickets = function (patients_tickets) {
    $scope.error = '';
    $scope.detailsPatientsTickets(patients_tickets);
    $scope.patients_tickets = {};
    site.showModal('#patientsTicketsUpdateModal');
  };

  $scope.updatePatientsTickets = function (patients_tickets, status) {
    $scope.error = '';
    if (!status) {

      const v = site.validated('#patientsTicketsUpdateModal');
      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      }

    } else if (status === 'close') {


      patients_tickets.status = {
        id: 3,
        ar: 'مغلقة',
        en: 'closing',
      }

    } else if (status === 'hold') {
      patients_tickets.status = {
        id: 2,
        ar: 'معلقة',
        en: 'holding',
      }

    } else if (status === 'open') {
      patients_tickets.status = {
        id: 1,
        ar: 'مفتوحة',
        en: 'Opening',
      }
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/patients_tickets/update",
      data: patients_tickets
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          $scope.getPatientsTicketsList();
          if (!status) {
            site.hideModal('#patientsTicketsUpdateModal');
          }
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsPatientsTickets = function (patients_tickets) {
    $scope.error = '';
    $scope.detailsPatientsTickets(patients_tickets);
    $scope.patients_tickets = {};
    site.showModal('#patientsTicketsViewModal');

  };

  $scope.detailsPatientsTickets = function (patients_tickets) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/patients_tickets/view",
      data: {
        id: patients_tickets.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.patients_tickets = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeletePatientsTickets = function (patientsTickets) {
    $scope.error = '';
    $scope.detailsPatientsTickets(patientsTickets);
    $scope.patients_tickets = {};
    site.showModal('#patientsTicketsDeleteModal');
  };

  $scope.deletePatientsTickets = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/patients_tickets/delete",
      data: {
        id: $scope.patients_tickets.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#patientsTicketsDeleteModal');
          $scope.getPatientsTicketsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getPatientList = function (ev) {
    $scope.busy = true;

    if (ev.which !== 13) {
      return;
    }

    $scope.customersList = [];
    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {
        search: $scope.doctor_search,
        select: {

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

  $scope.showPatient = function (id) {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/customers/view",
      data: {
        id: id,
        select: {}
      }
    }).then(
      function (response) {
        $scope.busy = false;

        if (response.data.done) {
          $scope.customer = response.data.doc;
          site.showModal('#customerDetailsModal');
          document.querySelector('#customerDetailsModal .tab-link').click();

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

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
            $scope.error = "##word.must_enter_code##";
          }
        }
      },
      function (err) {
        console.log(err);
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
        select: { id: 1, name: 1, code: 1 }
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

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/city/all",
      data: {
        where: {
          'gov.id': gov.id,
          active: true
        },
        select: { id: 1, name: 1, code: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.cityList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getAreaList = function (city) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/area/all",
      data: {
        where: {
          'city.id': city.id,
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

  $scope.getPatientsTicketsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/patients_tickets/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#patientsTicketsSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
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
        screen: "patients_tickets"
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


  $scope.displayDetails = function (patients_tickets, type) {
    $scope.busy = true;
    $scope.error = '';

    let where = {
      id: patients_tickets.id,
      customer: patients_tickets.customer,
    };


    $http({
      method: "POST",
      url: "/api/patients_tickets/display_data",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.ticket_data = response.data.cb;

        if (type === 'view') {

          site.showModal('#displayDataModal');

        } else if (type === 'close') {
          $scope.patients_tickets = patients_tickets;
          $scope.displayAccountInvoice($scope.ticket_data);
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayAccountInvoice = function (patients_tickets) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.account_invoices = {
          image_url: '/images/account_invoices.png',
          date: new Date(),
          invoice_id: $scope.patients_tickets.id,
          customer: $scope.patients_tickets.customer,
          shift: shift,
          net_value: patients_tickets.net_value,
          paid_up: patients_tickets.paid,
          invoice_code: $scope.patients_tickets.code,
          total_discount: patients_tickets.total_discount,
          source_type: {
            id: 15,
            en: "Patient Ticket",
            ar: "تذكرة مريض"
          },
          active: true
        };

        if ($scope.defaultSettings.accounting) {
          if ($scope.defaultSettings.accounting.currency)
            $scope.account_invoices.currency = $scope.currenciesList.find(_c => { return _c.id === $scope.defaultSettings.accounting.currency.id });
          if ($scope.defaultSettings.accounting.payment_method) {
            $scope.account_invoices.payment_method = $scope.defaultSettings.accounting.payment_method;
            $scope.loadSafes($scope.account_invoices.payment_method, $scope.account_invoices.currency);

            if ($scope.account_invoices.payment_method.id == 1)
              $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_box;
            else $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_bank;
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

  $scope.getSafeByType = function (obj) {
    $scope.error = '';
    if ($scope.defaultSettings.accounting && obj.payment_method) {
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
            name: 1,
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
          name: 1,
          minor_currency: 1,
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

  $scope.calc = function (obj) {
    $scope.error = '';
    $timeout(() => {

      obj.net_value = obj.net_value || 0;
      obj.total_discount = site.toNumber(obj.total_discount);
      obj.net_value = site.toNumber(obj.net_value);

      if (obj.currency) {
        $scope.amount_currency = obj.net_value / site.toNumber(obj.currency.ex_rate);
        $scope.amount_currency = site.toNumber($scope.amount_currency);
      }

    }, 250);
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
          $scope.account_invoices = response.data.doc;
          $scope.updatePatientsTickets($scope.patients_tickets, 'close');
          site.hideModal('#accountInvoiceModal');
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

  $scope.get_open_shift = function (callback) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: {
          active: true
        },
        select: {
          id: 1,
          name: 1,
          code: 1,
          from_date: 1,
          from_time: 1,
          to_date: 1,
          to_time: 1
        }
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

  $scope.getNumberingAutoInvoice = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "patient_ticket"
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

  $scope.paymentsPayable = function (type) {
    $scope.error = '';
    $scope.account_invoices = $scope.account_invoices || {};
    $scope.account_invoices.payable_list = $scope.account_invoices.payable_list || [{}];
    if (type === 'view') {
      site.showModal('#addPaymentsModal');
    }
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#patientsTicketsSearchModal');

  };

  $scope.searchAll = function () {
    $scope.getPatientsTicketsList($scope.search);
    site.hideModal('#patientsTicketsSearchModal');
    $scope.search = {};

  };

  $scope.getPatientsTicketsList();
  $scope.getNumberingAuto();
  $scope.loadCurrencies();
  $scope.getPaymentMethodList();
  $scope.getDefaultSettings();
  $scope.getNumberingAutoInvoice();

});