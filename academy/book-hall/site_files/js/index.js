app.controller("book_hall", function ($scope, $http, $timeout) {

  $scope.book_hall = {};

  $scope.displayAddBookHall = function () {
    $scope.error = '';
    $scope.book_hall = {
      image_url: '/images/book_hall.png',
      active: true,
      book_date: new Date(),
      dates_list: [],
      paid_list: []

    };
    site.showModal('#bookHallAddModal');

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

    $scope.busy = true;

    $scope.book_hall.total_value = 0;
    if ($scope.book_hall.period && $scope.book_hall.period.id == 1) {

      $scope.book_hall.total_value = $scope.book_hall.total_period * $scope.book_hall.price_day;
    };

    if ( $scope.book_hall.period && $scope.book_hall.period.id == 2) {

      $scope.book_hall.total_value = $scope.book_hall.total_period * $scope.book_hall.price_hour;
    };

    $http({
      method: "POST",
      url: "/api/book_hall/add",
      data: $scope.book_hall
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#bookHallAddModal');
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

  $scope.displayUpdateBookHall = function (book_hall) {
    $scope.error = '';
    $scope.viewBookHall(book_hall);
    $scope.book_hall = {};
    site.showModal('#bookHallUpdateModal');
  };

  $scope.updateBookHall = function () {
    $scope.error = '';
    const v = site.validated('#bookHallUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;

    $scope.book_hall.total_value = 0;
    if ($scope.book_hall.period.id == 1) {

      $scope.book_hall.total_value = $scope.book_hall.total_period * $scope.book_hall.price_day;
    };

    if ($scope.book_hall.period.id == 2) {

      $scope.book_hall.total_value = $scope.book_hall.total_period * $scope.book_hall.price_hour;
    };

    $http({
      method: "POST",
      url: "/api/book_hall/update",
      data: $scope.book_hall
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#bookHallUpdateModal');
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
    $scope.error = '';
    $scope.viewBookHall(book_hall);
    $scope.book_hall = {};
    site.showModal('#bookHallDeleteModal');

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
      url: "/api/class_rooms/all",
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

        where: {
          active: true
        },

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

  $scope.attend = function (d) {
    d.attend = $scope.attendList[0];
    $http({
      method: "POST",
      url: "/api/book_hall/update",
      data: $scope.book_hall
    })
  };

  $scope.cancel = function (d) {
    d.attend = $scope.attendList[1];
    $http({
      method: "POST",
      url: "/api/book_hall/update",
      data: $scope.book_hall
    })
  };

  $scope.paidUpdate = function () {
    $scope.error = '';
    if ($scope.book_hall.safe) {

      if (!$scope.book_hall.total_rest) {
        $scope.book_hall.total_rest = $scope.book_hall.paid;

      } else {
        $scope.book_hall.total_rest += $scope.book_hall.paid;
      };

      $scope.book_hall.rest = ($scope.book_hall.total_value - $scope.book_hall.total_rest);
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

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#bookHallSearchModal');

  };

  $scope.searchAll = function () {
    $scope.getBookHallList($scope.search);
    site.hideModal('#bookHallSearchModal');
    $scope.search = {};

  };

  $scope.getBookHallList();
  $scope.getPeriod();
  $scope.getTimeList();
  $scope.getAttend();
  $scope.getClassRooms();
  $scope.getSafesList();
});