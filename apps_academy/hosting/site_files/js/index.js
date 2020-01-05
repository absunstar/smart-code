app.controller("hosting", function ($scope, $http, $timeout) {

  $scope.hosting = {};

  $scope.displayAddHosting = function () {
    $scope.error = '';
    $scope.hosting = {
      image_url: '/images/hosting.png',
      student_list: [{}],
      date: new Date(),
      active: true
    };
    site.showModal('#hostingAddModal');
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
    $scope.error = '';
    $scope.viewHosting(hosting);
    $scope.hosting = {};
    site.showModal('#hostingUpdateModal');
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
    $scope.error = '';
    $scope.viewHosting(hosting);
    $scope.hosting = {};
    site.showModal('#hostingViewModal');
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
    $scope.error = '';
    $scope.viewHosting(hosting);
    $scope.hosting = {};
    site.showModal('#hostingDeleteModal');
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
          'trainer': { $ne: true },
          'delivery': { $ne: true }
        },
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

  $scope.getSafesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.safesList = response.data.list;
        }
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
          $scope.classRoomsList = response.data.list;
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

  $scope.getHostingList();
  $scope.getEmployeeList();
  $scope.getStudentList();
  $scope.getTimeList();
  $scope.getSafesList();
  $scope.getHost();
  $scope.getClassRooms();
});