app.controller("scan_centers", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.scan_center = {};

  $scope.displayAddScanCenter = function () {
    $scope.error = '';
    $scope.scan_center = {
      image_url: '/images/scan_center.png',
      active: true,
      scan_list:[{active: true}]

    };
    site.showModal('#scanCenterAddModal');
    document.querySelector('#scanCenterAddModal .tab-link').click();

  };

  $scope.addScanCenter = function () {
    $scope.error = '';
    const v = site.validated('#scanCenterAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/scan_centers/add",
      data: $scope.scan_center
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#scanCenterAddModal');
          $scope.getScanCenterList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateScanCenter = function (scan_center) {
    $scope.error = '';
    $scope.detailsScanCenter(scan_center);
    $scope.scan_center = {};
    site.showModal('#scanCenterUpdateModal');
    document.querySelector('#scanCenterUpdateModal .tab-link').click();
  };

  $scope.updateScanCenter = function () {
    $scope.error = '';
    const v = site.validated('#scanCenterUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/scan_centers/update",
      data: $scope.scan_center
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#scanCenterUpdateModal');
          $scope.getScanCenterList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsScanCenter = function (scan_center) {
    $scope.error = '';
    $scope.detailsScanCenter(scan_center);
    $scope.scan_center = {};
    site.showModal('#scanCenterViewModal');
    document.querySelector('#scanCenterViewModal .tab-link').click();

  };

  $scope.detailsScanCenter = function (scan_center) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/scan_centers/view",
      data: {
        id: scan_center.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.scan_center = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteScanCenter = function (scan_center) {
    $scope.error = '';
    $scope.detailsScanCenter(scan_center);
    $scope.scan_center = {};
    site.showModal('#scanCenterDeleteModal');
    document.querySelector('#scanCenterDeleteModal .tab-link').click();

  };

  $scope.deleteScanCenter = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/scan_centers/delete",
      data: {
        id: $scope.scan_center.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#scanCenterDeleteModal');
          $scope.getScanCenterList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getScanCenterList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/scan_centers/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#scanCenterSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getScansList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/scans/all",
      data: {
        where: {
          active: true
        },
        select:{
          id: 1 , name : 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.scansList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getGovList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: {
          active: true
        },
        select:{
          id: 1 , name : 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.govList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/cities/all",
      data: {
        where: {
          'gov.id': gov.id,
          active: true
        },
        select:{
          id: 1 , name : 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.cityList = response.data.list;
        }
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
        screen: "scan_centers"
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

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#scanCenterSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getScanCenterList($scope.search);
    site.hideModal('#scanCenterSearchModal');
    $scope.search = {};
  };

  $scope.getScanCenterList();
  $scope.getScansList();
  $scope.getNumberingAuto();
  $scope.getGovList();


});