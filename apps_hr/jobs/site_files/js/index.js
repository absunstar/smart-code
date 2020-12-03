app.controller("jobs", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.jobs = {};

  $scope.displayAddJobs = function () {
    $scope.error = '';
    $scope.jobs = {
      image_url: '/images/jobs.png',
      active: true/* ,
      immediate : false */
    };
    site.showModal('#jobsAddModal');
    
  };

  $scope.addJobs = function () {
    $scope.error = '';
    const v = site.validated('#jobsAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/jobs/add",
      data: $scope.jobs
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#jobsAddModal');
          $scope.getJobsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateJobs = function (jobs) {
    $scope.error = '';
    $scope.viewJobs(jobs);
    $scope.jobs = {};
    site.showModal('#jobsUpdateModal');
  };

  $scope.updateJobs = function () {
    $scope.error = '';
    const v = site.validated('#jobsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/jobs/update",
      data: $scope.jobs
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#jobsUpdateModal');
          $scope.getJobsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsJobs = function (jobs) {
    $scope.error = '';
    $scope.viewJobs(jobs);
    $scope.jobs = {};
    site.showModal('#jobsViewModal');
  };

  $scope.viewJobs = function (jobs) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/jobs/view",
      data: {
        id: jobs.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.jobs = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteJobs = function (jobs) {
    $scope.error = '';
    $scope.viewJobs(jobs);
    $scope.jobs = {};
    site.showModal('#jobsDeleteModal');

  };

  $scope.deleteJobs = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/jobs/delete",
      data: {
        id: $scope.jobs.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#jobsDeleteModal');
          $scope.getJobsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getJobsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/jobs/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#jobsSearchModal');
          $scope.search = {};
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
    site.showModal('#jobsSearchModal');

  };

  $scope.searchAll = function () { 
    $scope.getJobsList($scope.search);
    site.hideModal('#jobsSearchModal');
    $scope.search = {};

  };

  $scope.getJobsList();

});