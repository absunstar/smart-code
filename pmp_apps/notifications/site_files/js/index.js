app.controller("notifications", function ($scope, $http, $interval) {

  $scope.search = {
    bySystem: true,
    system: 'security',
    byUser: false,
    user: null,
    message: '',
    value: '',
    fromDate: null,
    toDate: null,
    limit: 50
  };


  $scope.loadSystem = function () {
    $http({
      method: "POST",
      url: "/api/system/all",
    }).then(
      function (response) {
        if (response.data) {
          $scope.systemList = response.data;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

  };


  $scope.loadAll = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/notifications/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

  };

  $scope.loadUsers = function () {
    if ($scope.userList) {
      return
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/users/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.userList = response.data.users;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

  };



  $scope.searchAll = function () {
    $scope.busy = true;

    let where = {};

    if ($scope.search.source) {
      where['source.ar'] = $scope.search.source.ar;
    }

    if ($scope.search.user && $scope.search.user.id) {
      where['user.id'] = $scope.search.user.id;
    }

    if ($scope.search.message) {
      where['message.ar'] = $scope.search.message;
    }

    if ($scope.search.value) {
      where['value.ar'] =  $scope.search.value;
    }

    if ($scope.search.fromDate) {
      where['date_from'] = $scope.search.fromDate;
    }

    if ($scope.search.toDate) {
      where['date_to'] = $scope.search.toDate;
    }

    $http({
      method: "POST",
      url: "/api/notifications/all",
      data: {
        where: where,
        limit : $scope.search.limit
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;
          site.hideModal('#searchModal');
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

    site.hideModal('#SearchModal')

  };


  $scope.showAdd = (n) => {
    if (n.link.collection == 'tickets') {
      $scope.ticket = n.add;
      site.showModal('#viewTicketModal');
    } else {
      site.showModal('#displayModal');
      $('#displayContent').html(site.toHtmlTable(n.add));
    }


  };

  $scope.showUpdate = (n) => {
    if (n.link.collection == 'tickets') {
      $scope.ticket = n.update;
      site.showModal('#viewTicketModal');
    } else {
      site.showModal('#displayModal')
      $('#displayContent').html(site.toHtmlTable(n.update));
    }

  };

  $scope.showDelete = (n) => {
    site.showModal('#displayModal')
    $('#displayContent').html(site.toHtmlTable(n.delete));
  };


  $scope.loadAll();
  $scope.loadUsers();
  $scope.loadSystem();

});