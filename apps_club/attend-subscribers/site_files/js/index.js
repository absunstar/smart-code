app.controller("attend_subscribers", function ($scope, $http, $timeout, $interval) {

  $scope.attend_subscribers = {};
  $scope.auto_load_attendance = true;

  $scope.displayAddAttendSubscribers = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.attend_subscribers = {
          image_url: '/images/attend_subscribers.png'
        };
        site.showModal('#attendSubscribersAddModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addAttendSubscribers = function () {
    $scope.error = '';
    const v = site.validated('#attendSubscribersAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/attend_subscribers/add",
      data: $scope.attend_subscribers
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendSubscribersAddModal');
          $scope.getAttendSubscribersList();
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

  $scope.displayUpdateAttendSubscribers = function (attend_subscribers) {
    $scope.error = '';
    $scope.viewAttendSubscribers(attend_subscribers);
    $scope.attend_subscribers = {};
    site.showModal('#attendSubscribersUpdateModal');
  };

  $scope.updateAttendSubscribers = function () {
    $scope.error = '';
    const v = site.validated('#attendSubscribersUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/attend_subscribers/update",
      data: $scope.attend_subscribers
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendSubscribersUpdateModal');
          $scope.getAttendSubscribersList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsAttendSubscribers = function (attend_subscribers) {
    $scope.error = '';
    $scope.viewAttendSubscribers(attend_subscribers);
    $scope.attend_subscribers = {};
    site.showModal('#attendSubscribersViewModal');
  };

  $scope.viewAttendSubscribers = function (attend_subscribers) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/attend_subscribers/view",
      data: {
        id: attend_subscribers.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.attend_subscribers = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteAttendSubscribers = function (attend_subscribers) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.viewAttendSubscribers(attend_subscribers);
        $scope.attend_subscribers = {};
        site.showModal('#attendSubscribersDeleteModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.deleteAttendSubscribers = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/attend_subscribers/delete",
      data: {
        id: $scope.attend_subscribers.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendSubscribersDeleteModal');
          $scope.getAttendSubscribersList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.list = [];
  $scope.getAttendSubscribersList = function (where) {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: "/api/attend_subscribers/all",
      data: {
        where: where,
        limit: 10
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          if (response.data.list && response.data.list.length > 0) {
            response.data.list.forEach((d, i) => {
              if (!$scope.list[i].leave_date && d.leave_date) {
                $scope.list[i].leave_date = d.leave_date;
                $scope.list[i].leave = d.leave;
              }

            });
          } else {
            $scope.list = response.data.list;
            $scope.count = response.data.count;
            site.hideModal('#attendSubscribersSearchModal');
            $scope.search = {};
          }

        } else {
          $scope.list = [];
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
          ,
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

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#attendSubscribersSearchModal');

  };

  $scope.attendNow = function () {
    $scope.attend_subscribers.attend_date = new Date();
    $scope.attend_subscribers.attend = {
      hour: new Date().getHours(),
      minute: new Date().getMinutes()
    };
  };

  $scope.leaveNow = function (attend_subscribers) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        attend_subscribers.leave_date = new Date();
        attend_subscribers.leave = {
          hour: new Date().getHours(),
          minute: new Date().getMinutes()

        };

        $scope.busy = true;
        $http({
          method: "POST",
          url: "/api/attend_subscribers/update",
          data: attend_subscribers
        }).then(
          function (response) {
            $scope.busy = false;
            if (response.data.done) {
              $scope.getAttendSubscribersList();
            } else {
              $scope.error = 'Please Login First';
            }
          },
          function (err) {
            console.log(err);
          }
        )
      } else $scope.error = '##word.open_shift_not_found##';
    });
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
        screen: "attend_subscribers"
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
    $scope.getAttendSubscribersList($scope.search);
    site.hideModal('#attendSubscribersSearchModal');
    $scope.search = {};
  };

  $interval(() => {
    if ($scope.auto_load_attendance) {
      $scope.getAttendSubscribersList();
    };
  }, 1000 * 3);
  $scope.getNumberingAuto();
});