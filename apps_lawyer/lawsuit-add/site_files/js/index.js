app.controller("lawsuit_add", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.lawsuit_add = {};

  $scope.displayAddLawsuitAdd = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.lawsuit_add = {
      image_url: '/images/lawsuit_add.png',
      active: true,
      date: new Date()
    };
    site.showModal('#lawsuitAddAddModal');
    document.querySelector('#lawsuitAddAddModal .tab-link').click();

  };

  $scope.addLawsuitAdd = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';
    $scope.busy = true;

    const v = site.validated('#lawsuitAddAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $http({
      method: "POST",
      url: "/api/lawsuit_add/add",
      data: $scope.lawsuit_add
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#lawsuitAddAddModal');
          $scope.getLawsuitAddList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateLawsuitAdd = function (lawsuit_add) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsLawsuitAdd(lawsuit_add);
    $scope.lawsuit_add = {
      image_url: '/images/vendor_logo.png',

    };
    site.showModal('#lawsuitAddUpdateModal');
    document.querySelector('#lawsuitAddUpdateModal .tab-link').click();

  };

  $scope.updateLawsuitAdd = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';
    $scope.busy = true;

    const v = site.validated('#lawsuitAddUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $http({
      method: "POST",
      url: "/api/lawsuit_add/update",
      data: $scope.lawsuit_add
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#lawsuitAddUpdateModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list[i] = response.data.doc;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsLawsuitAdd = function (lawsuit_add) {
    $scope.error = '';
    $scope.detailsLawsuitAdd(lawsuit_add);
    $scope.lawsuit_add = {};
    site.showModal('#lawsuitAddDetailsModal');
    document.querySelector('#lawsuitAddDetailsModal .tab-link').click();

  };

  $scope.detailsLawsuitAdd = function (lawsuit_add) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/lawsuit_add/view",
      data: {
        id: lawsuit_add.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.lawsuit_add = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteLawsuitAdd = function (lawsuit_add) {
    $scope.error = '';
    $scope.detailsLawsuitAdd(lawsuit_add);
    $scope.lawsuit_add = {};
    site.showModal('#lawsuitAddDeleteModal');
    document.querySelector('#lawsuitAddAddModal .tab-link').click();
  };

  $scope.deleteLawsuitAdd = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/lawsuit_add/delete",
      data: {
        id: $scope.lawsuit_add.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#lawsuitAddDeleteModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
              $scope.count -= 1;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getLawsuitAddList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/lawsuit_add/all",
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

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getLawsuitAddList($scope.search);
    site.hideModal('#lawsuitAddSearchModal');
    $scope.search = {}

  };

  $scope.loadCourts = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/courts/all",
      data: {
        select: { id: 1, name: 1, description: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.courtsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadCirclesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/circles/all",
      data: {
        select: { id: 1, name: 1, description: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.circlesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getLawsuitAddList();
  $scope.loadCourts();
  $scope.loadCirclesList();
});