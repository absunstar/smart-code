app.controller("clusters", function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.mode = 'add';
  $scope.cluster = {};

  $scope.displayAddCluster = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.cluster = {
      imageUrl: '/images/cluster.png',
      active: true
    };
    site.showModal('#clusterManageModal');
  };

  $scope.addCluster = function () {
    $scope.error = '';
    const v = site.validated('#clusterManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/clusters/add",
      data: $scope.cluster
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#clusterManageModal');
          $scope.getClusterList();
        } else {
          $scope.error = response.data.error;
        if (response.data.error.like('*maximum number of adds exceeded*')) {
            $scope.error = "##word.err_maximum_adds##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateCluster = function (cluster) {
    $scope.error = '';
    $scope.mode = 'edit';
    $scope.viewCluster(cluster);
    $scope.cluster = {};
    site.showModal('#clusterManageModal');
  };

  $scope.updateCluster = function () {
    $scope.error = '';
    const v = site.validated('#clusterManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/clusters/update",
      data: $scope.cluster
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#clusterManageModal');
          $scope.getClusterList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsCluster = function (cluster) {
    $scope.error = '';
    $scope.mode = 'view';
    $scope.viewCluster(cluster);
    $scope.cluster = {};
    site.showModal('#clusterManageModal');
  };

  $scope.viewCluster = function (cluster) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/clusters/view",
      data: {
        id: cluster.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.cluster = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteCluster = function (cluster) {
    $scope.error = '';
    $scope.mode = 'delete';
    $scope.viewCluster(cluster);
    $scope.cluster = {};
    site.showModal('#clusterManageModal');
  };

  $scope.deleteCluster = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/clusters/delete",
      data: {
        id: $scope.cluster.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#clusterManageModal');
          $scope.getClusterList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  

  $scope.getClusterList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/clusters/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#clusterSearchModal');
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
    site.showModal('#clusterSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getClusterList($scope.search);
    site.hideModal('#clusterSearchModal');
    $scope.search = {};
  };

  $scope.getClusterList();
});