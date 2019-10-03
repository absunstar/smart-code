app.controller("jobs", function ($scope, $http, $timeout) {

  $scope.job = {};

  $scope.searchAll = function () {
    let where = {};

    if ($scope.search.name) {
      where['name'] = $scope.search.name;

    }

    if ($scope.search.status == true || $scope.search.status == false) {
      where['active'] = $scope.search.status;
    }



    $scope.getJobList(where);
    site.hideModal('#jobSearchModal');
  };

  $scope.getJobList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
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
    site.showModal('#jobSearchModal');

  };

  $scope.displayAddJob = function () {
    $scope.error = '';
    $scope.job = {
      logo: '/images/job.png',
      active: true

    };
    site.showModal('#jobAddModal');

  };

  $scope.addJob = function () {
    $scope.error = '';
    const v = site.validated('#jobAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/jobs/add",
      data: $scope.job
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#jobAddModal');
          $scope.getJobList();
        } else {
          $scope.error = '##word.job_already_exisit##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateJob = function (job) {
    $scope.error = '';
    $scope.detailsJob(job);
    $scope.job = {};
    site.showModal('#jobUpdateModal');
  };

  $scope.updateJob = function () {
    $scope.error = '';
    const v = site.validated('#jobUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/jobs/update",
      data: $scope.job
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#jobUpdateModal');
          $scope.getJobList();
        } else {
          $scope.error = '##word.job_already_exisit##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteJob = function (job) {
    $scope.error = '';
    $scope.detailsJob(job);
    $scope.job = {};
    site.showModal('#jobDeleteModal');
  };

  $scope.deleteJob = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/jobs/delete",
      data: {
        id: $scope.job.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#jobDeleteModal');
          $scope.getJobList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsJob = function (job) {
    $scope.error = '';
    $scope.detailsJob(job);
    $scope.job = {};
    site.showModal('#jobViewModal');
  };

  $scope.detailsJob = function (job) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/jobs/view",
      data: {
        id: job.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.job = response.data.doc;
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
    $scope.displayAddJob();
  };

  $scope.getJobList();

});