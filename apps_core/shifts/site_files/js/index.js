app.controller('shifts', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.shift = {};

  $scope.addNewShift = function (s, newShift) {
    $scope.error = '';
    const v = site.validated('#closeDeliverModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    let shift = {
      image_url: '/images/shift.png',
      from_date: new Date(),
      from_time: {
        hour: new Date().getHours(),
        minute: new Date().getMinutes(),
      },
      last_safes_list: s.safes_list,
      name_Ar: newShift.name_Ar,
      name_En: newShift.name_En,
      active: true,
    };

    if (newShift.code) {
      shift.code = newShift.code;
    }

    $http({
      method: 'POST',
      url: '/api/shifts/add',
      data: shift,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#closeDeliverModal');
          $scope.openCloseShift(s, false);
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = '##word.must_enter_code##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayAddShift = function () {
    $scope.is_shift_open((yes) => {
      if (!yes) {
        $scope.error = '';
        $scope.shift = {
          image_url: '/images/shift.png',
          from_date: new Date(),
          from_time: {
            hour: new Date().getHours(),
            minute: new Date().getMinutes(),
          },
          active: true,
        };

        if (site.feature('school')) {
          $scope.shift.image_url = '/images/school_years.png';
        }

        site.showModal('#shiftAddModal');
      } else {
        $scope.error = '##word.must_close_shift##';
      }
    });
  };

  $scope.addShift = function () {
    $scope.error = '';
    const v = site.validated('#shiftAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/shifts/add',
      data: $scope.shift,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#shiftAddModal');
          $scope.getShiftList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = '##word.must_enter_code##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.shiftDetailes = function (s) {
    $scope.error = '';
    $scope.safes_list = [];
    s.safes = s.safes || [];
    s.safes.forEach((_s) => {
      let obj = { safe: _s, current_balance: _s.balance };
      if ($scope.shift.last_safes_list && $scope.shift.last_safes_list.length > 0) {
        $scope.shift.last_safes_list.forEach((_l) => {
          if (_l.id === _s.id) {
            obj.balance_relay = _l.amount_delivered;
          }
        });
      }
      $scope.safes_list.push(obj);
    });
    site.showModal('#openCloseModal');
  };

  $scope.displayUpdateShift = function (shift) {
    $scope.error = '';
    $scope.viewShift(shift);
    $scope.shift = {};
    site.showModal('#shiftUpdateModal');
  };

  $scope.updateShift = function () {
    $scope.error = '';
    const v = site.validated('#shiftUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/shifts/update',
      data: $scope.shift,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#shiftUpdateModal');
          $scope.getShiftList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsShift = function (shift) {
    $scope.error = '';
    $scope.viewShift(shift);
    $scope.shift = {};
    site.showModal('#shiftViewModal');
  };

  $scope.viewShift = function (shift) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/shifts/view',
      data: {
        id: shift.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.shift = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteShift = function (shift) {
    $scope.error = '';
    $scope.viewShift(shift);
    $scope.shift = {};
    site.showModal('#shiftDeleteModal');
  };

  $scope.deleteShift = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/shifts/delete',
      data: {
        id: $scope.shift.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#shiftDeleteModal');
          $scope.getShiftList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getShiftList = function (where) {
    $scope.error = '';
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/shifts/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#shiftSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#shiftSearchModal');
  };

  $scope.is_shift_open = function (callback) {
    $scope.error = '';
    callback = callback || function () {};
    $http({
      method: 'POST',
      url: '/api/shifts/is_shift_open',
    }).then(
      function (response) {
        $scope.openShift = response.data.is_open;
        callback(response.data.is_open);
      },
      function (err) {
        callback(true);
        $scope.error = err;
      }
    );
  };

  $scope.searchAll = function () {
    $scope.error = '';

    $scope.getShiftList($scope.search);
    site.hideModal('#shiftSearchModal');
    $scope.search = {};
  };

  $scope.shifStart = function () {
    $scope.error = '';

    $scope.shift.from_date = new Date();
    $scope.shift.from_time = {
      hour: new Date().getHours(),
      minute: new Date().getMinutes(),
    };
  };

  $scope.displayCloseDelivery = function (c) {
    $scope.error = '';
    $scope.shift = c;
    $scope.getSafesList();

    site.showModal('#closeDeliverModal');
  };

  $scope.openCloseShift = function (shift, active) {
    $scope.error = '';

    if (active) shift.active = true;
    else shift.active = false;

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/shifts/update',
      data: shift,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#shiftUpdateModal');
          $scope.getShiftList();
          $scope.is_shift_open();
        } else $scope.error = 'Please Login First';
      },
      function (err) {
        console.log(err);
      }
    );
  };

  /*  $scope.shifOpen = function (shift) {
    $scope.error = '';
    if ($scope.openShift) {

      shift.to_date = null;
      shift.to_time = null;

      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/shifts/update",
        data: shift
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            site.hideModal('#shiftUpdateModal');
            $scope.getShiftList();
          } else {
            $scope.error = 'Please Login First';
          }
        },
        function (err) {
          console.log(err);
        }
      )
    } else $scope.error = '##word.must_close_shift##';

  };
 */

  $scope.getDefaultSettings = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/default_setting/get',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
          if ($scope.defaultSettings.printer_program.invoice_logo) {
            $scope.invoice_logo = document.location.origin + $scope.defaultSettings.printer_program.invoice_logo;
          }
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.thermalPrint = function (shift, obj) {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;

    $scope.thermal = { ...obj };
    $scope.thermal.code = shift.code;
    $scope.thermal.name_Ar = shift.name_Ar;
    $scope.thermal.name_En = shift.name_En;
    $scope.thermal.active = obj.active;
    $('#thermalPrint').removeClass('hidden');

    /*     JsBarcode('.barcode', $scope.thermal.code);
     */ if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.printer_path && $scope.defaultSettings.printer_program.printer_path.ip) {
      let printerName = $scope.defaultSettings.printer_program.printer_path.ip.name.trim();
      if ($scope.user.printer_path && $scope.user.printer_path.id) {
        printerName = $scope.user.printer_path.ip.name.trim();
      }

      $timeout(() => {
        site.print(
          {
            selector: '#thermalPrint',
            ip: '127.0.0.1',
            port: '60080',
            pageSize: 'Letter',
            printer: printerName,
          },
          () => {
            $timeout(() => {
              $('#thermalPrint').addClass('hidden');
            }, 2000);
          }
        );
      }, 1000 * 3);
    } else {
      $scope.error = '##word.thermal_printer_must_select##';
    }

    $scope.busy = false;
  };

  $scope.getUser = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/view',
      data: {
        id: site.toNumber('##user.id##'),
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };

  $scope.getSafesList = function (c) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/safes/all',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.shift.safes_list = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getAccountStatement = function (shift) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/safes_payments/account_statement_shift',
      data: {
        where: {'shift.id' : shift.id},
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.account_statement_list = response.data.list;
     
          site.showModal('#accountStatementModal');
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getEmployeeList = function (where) {
    $scope.busy = true;
    where = where || {};
    where.trainer = { $ne: true };
    where.delivery = { $ne: true };
    where.delegate = { $ne: true };
    where.active = true;

    $http({
      method: 'POST',
      url: '/api/employees/all',
      data: {
        where: where,
      },
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
    );
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/numbering/get_automatic',
      data: {
        screen: 'shifts',
      },
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
    );
  };

  $scope.getShiftList();
  $scope.is_shift_open();
  $scope.getUser();
  $scope.getNumberingAuto();
  $scope.getEmployeeList();
  $scope.getDefaultSettings();
});
