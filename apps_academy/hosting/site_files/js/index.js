app.controller("hosting", function ($scope, $http, $timeout) {

  $scope.hosting = {};

  $scope.displayAddHosting = function () {

    $scope.get_open_shift((shift) => {
      if (shift) {

        $scope.error = '';
        $scope.hosting = {
          image_url: '/images/hosting.png',
          student_list: [{}],
          date: new Date(),
          active: true
        };

        if ($scope.defaultSettings.general_Settings) {
          if ($scope.defaultSettings.general_Settings.hall)
            $scope.hosting.hall = $scope.defaultSettings.general_Settings.hall;
        };

        if ($scope.defaultSettings.accounting) {
          $scope.hosting.currency = $scope.defaultSettings.accounting.currency;
          if ($scope.defaultSettings.accounting.payment_method) {
            $scope.hosting.payment_method = $scope.defaultSettings.accounting.payment_method;
            $scope.loadSafes($scope.hosting.payment_method, $scope.hosting.currency);
            if ($scope.hosting.payment_method.id == 1)
              $scope.hosting.safe = $scope.defaultSettings.accounting.safe_box;
            else $scope.hosting.safe = $scope.defaultSettings.accounting.safe_bank;
          }
        }
        if ($scope.hosting.currency) {
          $scope.amount_currency = site.toNumber($scope.hosting.net_value) / site.toNumber($scope.hosting.currency.ex_rate);
          $scope.amount_currency = site.toNumber($scope.amount_currency);
        }

        site.showModal('#hostingAddModal');

      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addHosting = function () {
    $scope.error = '';
    const v = site.validated('#hostingAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/hosting/add",
      data: $scope.hosting
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#hostingAddModal');
          $scope.getHostingList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateHosting = function (hosting) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.viewHosting(hosting);
        $scope.hosting = {};
        site.showModal('#hostingUpdateModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.updateHosting = function () {
    $scope.error = '';
    const v = site.validated('#hostingUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/hosting/update",
      data: $scope.hosting
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#hostingUpdateModal');
          $scope.getHostingList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsHosting = function (hosting) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.viewHosting(hosting);
        $scope.hosting = {};
        site.showModal('#hostingViewModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.viewHosting = function (hosting) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/hosting/view",
      data: {
        id: hosting.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.hosting = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.displayDeleteHosting = function (hosting) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.viewHosting(hosting);
        $scope.hosting = {};
        site.showModal('#hostingDeleteModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.deleteHosting = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/hosting/delete",
      data: {
        id: $scope.hosting.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#hostingDeleteModal');
          $scope.getHostingList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getHostingList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/hosting/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#hostingSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };


  $scope.getEmployeeList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {
        where: {
          trainer: { $ne: true },
          delivery: { $ne: true },
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.employeesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getStudentList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.studentList = response.data.list;
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
      url: "/api/times_hosting/all",
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


  $scope.getHost = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/host_list/all",
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.hostList = response.data;

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

  $scope.paidShow = function () {
    $scope.error = '';
    $scope.hosting.date_paid = new Date();
    $scope.hosting.safe = '';
    $scope.hosting.student_paid = '';
    site.showModal('#paidModal');

  };

  $scope.showAccept = function () {
    $scope.error = '';
    if (!$scope.hosting.safe) {

      $scope.error = "##word.safe_err##";
      return;

    } else {
      site.showModal('#acceptModal')
    }
  };

  $scope.paidPaybackShow = function (hosting) {
    $scope.error = '';
    $scope.viewHosting(hosting);

    site.showModal('#paidPaybackModal')

  };

  $scope.paidUpdate = function () {
    $scope.error = '';

    if ($scope.hosting.safe) {


      if (!$scope.hosting.total_rest) {
        $scope.hosting.total_rest = $scope.hosting.paid;

      } else {
        $scope.hosting.total_rest += $scope.hosting.paid;
      };

      $scope.hosting.rest = ($scope.hosting.total_required - $scope.hosting.total_rest);
      $scope.hosting.baid_go = $scope.hosting.paid;

      $scope.hosting.paid_list = $scope.hosting.paid_list || [];
      $scope.hosting.paid_list.unshift({

        payment: $scope.hosting.baid_go,
        date_paid: $scope.hosting.date_paid,
        student_paid: $scope.hosting.student_paid,
        safe: $scope.hosting.safe

      });

      $scope.hosting.paid = 0;
      $scope.error = "";
      $scope.busy = true;

      $http({
        method: "POST",
        url: "/api/hosting/update_paid",
        data: $scope.hosting
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.getHostingList();
          };
        },

        function (err) {
          console.log(err);
        }
      )
    };
    site.hideModal('#acceptModal')
  };

  $scope.updateStatus = function () {
    $http({
      method: "POST",
      url: "/api/hosting/update",
      data: $scope.hosting
    })
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#hostingSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getHostingList($scope.search);
    site.hideModal('#hostingSearchModal');
    $scope.search = {};
  };

  $scope.spliceStudents = function () {
    $scope.hosting.student_list.forEach((h_s, i) => {
      $scope.studentList.forEach(s => {
        if (h_s.customer.id == s.id) {
          $scope.studentList.splice(i, 1);
        }
      });
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
        if (response.data.done && response.data.doc)
          $scope.defaultSettings = response.data.doc;
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

  $scope.getHostingList();
  $scope.getPaymentMethodList();
  $scope.loadCurrencies();
  $scope.getDefaultSettings();
  $scope.getEmployeeList();
  $scope.getStudentList();
  $scope.getTimeList();
  $scope.getHost();
  $scope.getClassRooms();
});