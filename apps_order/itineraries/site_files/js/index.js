app.controller("itineraries", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.itinerary = {};

  $scope.displayAddItinerary = function () {
    $scope.error = '';
    $scope.itinerary = {
      image_url: '/images/itinerary.png',
      date: new Date(),
      amount: 0,
      active: true
    };


    site.showModal('#itineraryAddModal');
  };

  $scope.addItinerary = function (itinerary) {
    $scope.error = '';
    const v = site.validated('#itineraryAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (new Date(itinerary.date) > new Date()) {
      $scope.error = "##word.date_exceed##";
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/itineraries/add",
      data: itinerary
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#itineraryAddModal');
          $scope.getItineraryList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateItinerary = function (itinerary) {
    $scope.error = '';
    $scope.viewItinerary(itinerary);
    $scope.itinerary = {};
    site.showModal('#itineraryUpdateModal');
  };

  $scope.updateItinerary = function () {
    $scope.error = '';
    const v = site.validated('#itineraryUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (new Date($scope.itinerary.date) > new Date()) {
      $scope.error = "##word.date_exceed##";
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/itineraries/update",
      data: $scope.itinerary
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#itineraryUpdateModal');
          $scope.getItineraryList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsItinerary = function (itinerary) {
    $scope.error = '';
    $scope.viewItinerary(itinerary);
    $scope.itinerary = {};
    site.showModal('#itineraryViewModal');
  };

  $scope.viewItinerary = function (itinerary) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/itineraries/view",
      data: {
        id: itinerary.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.itinerary = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteItinerary = function (itinerary) {
    $scope.error = '';
    $scope.viewItinerary(itinerary);
    $scope.itinerary = {};
    site.showModal('#itineraryDeleteModal');
  };

  $scope.deleteItinerary = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/itineraries/delete",
      data: {
        id: $scope.itinerary.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#itineraryDeleteModal');
          $scope.getItineraryList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getItineraryList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/itineraries/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#itinerarySearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.loadVendors = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vendors/all",
      data: {

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

  $scope.loadDelegates = function () {
    $scope.busy = true;
    $scope.delegatesList = [];
    $http({
      method: "POST",
      url: "/api/delegates/all",
      data: {
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.delegatesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.addItineraryList = function () {
    $scope.error = '';
    $scope.itinerary.itinerary_list = $scope.itinerary.itinerary_list || [];

    let obj = {};

    if ($scope.itinerary.customer && $scope.itinerary.customer.id) {

      obj.target_type = { ar: 'عميل', en: 'Customer' };
      obj.target = $scope.itinerary.customer;
      $scope.itinerary.customer = {};

    } else if ($scope.itinerary.vendor && $scope.itinerary.vendor.id) {

      obj.target_type = { ar: 'مورد', en: 'Vendor' };
      obj.target = $scope.itinerary.vendor;
      $scope.itinerary.vendor = {};

    };

    obj.status = 1;
    obj.required = $scope.itinerary.required;
    obj.mission_type = $scope.itinerary.mission_type;
    obj.amount = $scope.itinerary.amount;
    obj.collected_paid = 0;
    $scope.itinerary.amount = 0;
    $scope.itinerary.required = '';

    $scope.itinerary.itinerary_list.unshift(obj);

  };

  $scope.targetDetails = function (obj) {
    $scope.error = '';
    $scope.target_details = obj;
    site.showModal('#itineraryTargetViewModal');

  };

  $scope.confirmEdit = function () {
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/itineraries/update",
      data: $scope.itinerary
    }).then(
      function (response) {
        if (response.data.done) {
          site.hideModal('#itineraryViewModal');
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )

  };

  $scope.displayAccountInvoice = function (itinerary) {
    $scope.get_open_shift((shift) => {
      if (shift) {

        $scope.itinerary_i = itinerary;

        $scope.amount_invoices = {
          date: new Date(),
          invoice_id: $scope.itinerary.id,
          show_delegate: true,
          delegate: $scope.itinerary.delegate,
          mission_type: itinerary.mission_type,
          invoice_type: itinerary.type,
          shift: shift,
          net_value: itinerary.amount,
          value: 0,
          active: true
        };

        if (itinerary.mission_type) {
          if (itinerary.mission_type.id == 1) {
            $scope.amount_invoices.show_customer;
            $scope.amount_invoices.customer = itinerary.target;

          } else if (itinerary.mission_type.id == 2) {
            $scope.amount_invoices.show_vendor;
            $scope.amount_invoices.vendor = itinerary.target
          }
        }

        if ($scope.defaultSettings.accounting) {
          $scope.amount_invoices.currency = $scope.currencySetting;
          if ($scope.defaultSettings.accounting.payment_method) {
            $scope.amount_invoices.payment_method = $scope.defaultSettings.accounting.payment_method;
            $scope.loadSafes($scope.amount_invoices.payment_method, $scope.amount_invoices.currency);

            if ($scope.amount_invoices.payment_method.id == 1)
              $scope.amount_invoices.safe = $scope.defaultSettings.accounting.safe_box;
            else $scope.amount_invoices.safe = $scope.defaultSettings.accounting.safe_bank;
          }
        }
        if ($scope.amount_invoices.currency) {
          $scope.amount_currency = site.toNumber($scope.amount_invoices.net_value) / site.toNumber($scope.amount_invoices.currency.ex_rate);
          $scope.amount_currency = site.toNumber($scope.amount_currency);
          $scope.amount_invoices.value = $scope.amount_currency;

        }

        $scope.calc($scope.amount_invoices);

        site.showModal('#amountInvoiceModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };


  $scope.addAmountInvoice = function (amount_invoices) {
    $scope.error = '';
    $scope.busy = true;
    $scope.detailsCustomer((customer) => {

      if (amount_invoices.value > 0 && !amount_invoices.safe) {
        $scope.error = "##word.should_select_safe##";
        return;

      } else if (amount_invoices.value > $scope.amount_currency) {
        $scope.error = "##word.err_net_value##";
        return;
      }

      if (amount_invoices.customer && amount_invoices.payment_method && amount_invoices.payment_method.id == 5) {
        let totalCustomerBalance = 0;
        totalCustomerBalance = customer.balance + (customer.credit_limit || 0);

        let customerPay = amount_invoices.value * amount_invoices.currency.ex_rate;

        if (customerPay > totalCustomerBalance) {
          $scope.error = "##word.cannot_exceeded_customer##";
          return;
        }
      }

      if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.work_posting)
        amount_invoices.posting = false;
      else amount_invoices.posting = true;

      let url = "/api/amounts_in/add";

      if (amount_invoices.mission_type && amount_invoices.mission_type.id === 1) {

        url = "/api/amounts_in/add";
        amount_invoices.image_url = '/images/amount_in.png';

      } else if (amount_invoices.mission_type && amount_invoices.mission_type.id === 2) {

        url = "/api/amounts_out/add";
        amount_invoices.image_url = '/images/amount_out.png';
      }


      $http({
        method: "POST",
        url: url,
        data: amount_invoices
      }).then(
        function (response) {
          $scope.busy = false;
          if (response) {
            $scope.itinerary_i.invoice = true;
            site.hideModal('#amountInvoiceModal');
          } else $scope.error = response.data.error;
        },
        function (err) {
          console.log(err);
        }
      )
    })
  };



  $scope.calc = function (obj) {
    $scope.error = '';
    $timeout(() => {

      $scope.amount_currency = site.toNumber(obj.net_value) / site.toNumber(obj.currency.ex_rate);
      $scope.amount_currency = site.toNumber($scope.amount_currency);

    }, 250);
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
    }
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
          $scope.currenciesList.forEach(_c => {
            if ($scope.defaultSettings && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.currency && $scope.defaultSettings.accounting.currency.id == _c.id) {
              $scope.currencySetting = _c
            }
          });
        }
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

  $scope.loadItinerariesTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: '/api/itineraries/types/all',
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.itinerariesTypes = response.data;
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


  $scope.detailsCustomer = function (callback) {
    $scope.error = '';
    $scope.busy = true;

    let customer = '';
    if ($scope.amount_invoices && $scope.amount_invoices.customer) {
      customer = $scope.amount_invoices.customer
    }

    $http({
      method: "POST",
      url: "/api/customers/view",
      data: {
        id: customer.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.customer = response.data.doc;
          callback(response.data.doc);
        } else {
          callback(null);
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#itinerarySearchModal');
  };

  $scope.showMissionTransfer = function (itiner, i) {
    $scope.error = '';
    $scope.missionIndex = i;
    $scope.mission_transfer = {
      date: new Date(),
      active: true,
      image_url: '/images/itinerary.png',
      itinerary_list: [itiner]
    };

    site.showModal('#missionTransferViewModal');
  };

  $scope.missionTransfer = function (mission_transfer) {
    $scope.error = '';

    $scope.itinerary.itinerary_list.splice($scope.missionIndex, 1);

    $scope.addItinerary(mission_transfer);

    site.hideModal('#missionTransferViewModal');
  };

  $scope.searchAll = function () {

    $scope.getItineraryList($scope.search);
    site.hideModal('#itinerarySearchModal');
    $scope.search = {};
  };

  $scope.getDefaultSettings();
  $scope.loadDelegates();
  $scope.loadVendors();
  $scope.loadItinerariesTypes();
  $scope.getPaymentMethodList();
  $scope.loadCurrencies();
  $scope.getItineraryList({ date: new Date() });
});