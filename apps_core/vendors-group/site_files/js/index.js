app.controller("vendors_group", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.vendor_group = {};

  $scope.displayAddVendorGroup = function () {
    $scope.error = '';
    $scope.vendor_group = {
      image_url: '/images/vendor_group.png',
      active: true
    };
    site.showModal('#vendorGroupAddModal');
  };

  $scope.addVendorGroup = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    const v = site.validated('#vendorGroupAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vendors_group/add",
      data: $scope.vendor_group
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#vendorGroupAddModal');
          $scope.list.push(response.data.doc);
          $scope.count += 1;
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

  $scope.displayUpdateVendorGroup = function (vendor_group) {
    $scope.error = '';
    $scope.detailsVendorGroup(vendor_group);
    $scope.vendor_group = {};
    site.showModal('#vendorGroupUpdateModal');
  };

  $scope.updateVendorGroup = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#vendorGroupUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vendors_group/update",
      data: $scope.vendor_group
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#vendorGroupUpdateModal');
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

  $scope.displayDetailsVendorGroup = function (vendor_group) {
    $scope.error = '';
    $scope.detailsVendorGroup(vendor_group);
    $scope.vendor_group = {};
    site.showModal('#vendorGroupDetailsModal');
  };

  $scope.detailsVendorGroup = function (vendor_group) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vendors_group/view",
      data: {
        id: vendor_group.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.vendor_group = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteVendorGroup = function (vendor_group) {
    $scope.error = '';
    $scope.detailsVendorGroup(vendor_group);
    $scope.vendor_group = {};
    site.showModal('#vendorGroupDeleteModal');
  };

  $scope.deleteVendorGroup = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vendors_group/delete",
      data: {
        id: $scope.vendor_group.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#vendorGroupDeleteModal');
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

  $scope.getVendorGroupList = function (where) {
    $scope.error = '';
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/vendors_group/all",
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

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "vendors_groups"
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

    $scope.getVendorGroupList($scope.search);

    site.hideModal('#vendorGroupSearchModal');
    $scope.search = {}

  };

  $scope.getVendorGroupList();
  $scope.getNumberingAuto();
});