app.controller("developers", function ($scope, $http, $timeout) {

  $scope.developer = {};

  $scope.searchAll = function () {

    /*  $scope.search = {}; */

    let where = {};



    if ($scope.search.name) {
      where['name'] = $scope.search.name;
    }

    if ($scope.search.job) {
      where['job'] = $scope.search.job;
    }

    if ($scope.search.mobile) {
      where['mobile'] = $scope.search.mobile;
    }

    if ($scope.search.email) {
      where['email'] = $scope.search.email;
    }

    if ($scope.search.status == true || $scope.search.status == false) {
      where['active'] = $scope.search.status;
    }

    $scope.getDeveloperList(where);
    site.hideModal('#developerSearchModal');
  };

  $scope.getJobList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/jobs/all",
      data: {
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.jobList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };



  $scope.getDeveloperList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/developers/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
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
    site.showModal('#developerSearchModal');
  };

  $scope.displayAddDeveloper = function () {
    $scope.error = '';
    $scope.developer = {
      logo: '/images/developer.png',
      active: true,
      tasks:[]
    };
    site.showModal('#developerAddModal');
    document.querySelector('#developerAddModal .tab-link').click();
  };

  $scope.addDeveloper = function () {
    $scope.error = '';

    const v = site.validated('#developerAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/developers/add",
      data: $scope.developer
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#developerAddModal');
          $scope.getDeveloperList();
        } else {
          $scope.error = '##word.developer_already_exisit##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateDeveloper = function (developer) {
    $scope.error = '';
    $scope.viewDeveloper(developer);
    $scope.developer = {};
    site.showModal('#developerUpdateModal');
    document.querySelector('#developerUpdateModal .tab-link').click();
  };

  $scope.updateDeveloper = function () {
    $scope.error = '';
    const v = site.validated('#developerUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/developers/update",
      data: $scope.developer
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#developerUpdateModal');
          $scope.getDeveloperList();
        } else {
          $scope.error = '##word.developer_already_exisit##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteDeveloper = function (developer) {
    $scope.error = '';
    $scope.viewDeveloper(developer);
    $scope.developer = {};
    site.showModal('#developerDeleteModal');
    document.querySelector('#developerDeleteModal .tab-link').click();
  };

  $scope.deleteDeveloper = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/developers/delete",
      data: {
        id: $scope.developer.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#developerDeleteModal');
          $scope.getDeveloperList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsDeveloper = function (developer) {
    $scope.error = '';
    $scope.viewDeveloper(developer);
    $scope.developer = {};
    site.showModal('#developerViewModal');
    document.querySelector('#developerViewModal .tab-link').click();
  };

  $scope.viewDeveloper = function (developer) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/developers/view",
      data: {
        id: developer.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.developer = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  if ('##query.action##' === 'add') {
    $scope.displayAdddeveloper();
  };

  $scope.getDeveloperList();
  $scope.getJobList();

});