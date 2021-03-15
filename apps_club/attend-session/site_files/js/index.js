app.controller("attend_session", function ($scope, $http, $timeout) {

  $scope.attend_session = {};

  $scope.displayAddAttendSession = function () {
    $scope.error = '';
    $scope.attend_session = {
      image_url: '/images/attend_session.png',
      active: true,
      date: new Date()
    };

    if ($scope.defaultSettings.general_Settings) {
      if ($scope.defaultSettings.general_Settings.hall)
        $scope.attend_session.hall = $scope.defaultSettings.general_Settings.hall;
      if ($scope.defaultSettings.general_Settings.trainer)
        $scope.attend_session.trainer = $scope.defaultSettings.general_Settings.trainer;
    };
    site.showModal('#attendSessionAddModal');
    $scope.getTrainerList();
  };

  $scope.addAttendSession = function () {
    $scope.error = '';
    const v = site.validated('#attendSessionAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/attend_session/add",
      data: $scope.attend_session
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendSessionAddModal');
          $scope.getAttendSessionList();
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

  $scope.displayUpdateAttendSession = function (attend_session) {
    $scope.error = '';
    $scope.viewAttendSession(attend_session);
    $scope.attend_session = {};
    site.showModal('#attendSessionUpdateModal');
  };

  $scope.updateAttendSession = function () {

    $scope.error = '';
    const v = site.validated('#attendSessionUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/attend_session/update",
      data: $scope.attend_session
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendSessionUpdateModal');
          $scope.getAttendSessionList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsAttendSession = function (attend_session) {
    $scope.error = '';
    $scope.viewAttendSession(attend_session);
    $scope.attend_session = {};
    site.showModal('#attendSessionViewModal');
  };

  $scope.viewAttendSession = function (attend_session) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/attend_session/view",
      data: {
        id: attend_session.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.attend_session = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteAttendSession = function (attend_session) {
    $scope.error = '';
    $scope.viewAttendSession(attend_session);
    $scope.attend_session = {};
    site.showModal('#attendSessionDeleteModal');

  };

  $scope.deleteAttendSession = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/attend_session/delete",
      data: {
        id: $scope.attend_session.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendSessionDeleteModal');
          $scope.getAttendSessionList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getAttendSessionList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/attend_session/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#attendSessionSearchModal');
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
            busy: { $ne: true },
            active: true
          }
          
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

  $scope.getTrainerList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/trainer/all",
      data: {
       
        where: {
          active: true,
          busy: { $ne: true }
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

  $scope.getService = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/request_activity/all_session",
        data: {
          search: $scope.attend_session.customer
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              $scope.sessionList = response.data.list;
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
        select: {
          id: 1, capaneighborhood: 1, active: 1, name_ar: 1, name_en: 1 , code : 1
        }
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


  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#attendSessionSearchModal');

  };

  $scope.attendNow = function () {
    $scope.attend_session.attend_date = new Date();

    $scope.attend_session.attend_time = {
      hour: new Date().getHours(),
      minute: new Date().getMinutes()
    };
  };

  $scope.leaveNow = function (attend_session) {
    attend_session.leave_date = new Date();
    attend_session.leave_time = {
      hour: new Date().getHours(),
      minute: new Date().getMinutes()
    };

    $http({
      method: "POST",
      url: "/api/attend_session/update_leave",
      data: attend_session
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getAttendSessionList();
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

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "attend_session"
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
    $scope.getAttendSessionList($scope.search);
    site.hideModal('#attendSessionSearchModal');
    $scope.search = {};

  };

  $scope.getAttendSessionList();
  $scope.getHallList();
  $scope.getNumberingAuto();
  $scope.getDefaultSettings();
});