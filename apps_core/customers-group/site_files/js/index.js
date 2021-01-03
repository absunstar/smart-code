app.controller("customers_group", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.customer_group = {};

  $scope.displayAddCustomerGroup = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.customer_group = {
      image_url: '/images/customer_groups.png',
      active: true
    };
    site.showModal('#customerGroupAddModal');
  };

  $scope.addCustomerGroup = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#customerGroupAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/customers_group/add",
      data: $scope.customer_group
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#customerGroupAddModal');
          $scope.getCustomerGroupList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          }
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

  $scope.displayUpdateCustomerGroup = function (customer_group) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsCustomerGroup(customer_group);
    $scope.customer_group = {
      image_url: '/images/vendor_logo.png',

    };
    site.showModal('#customerGroupUpdateModal');
  };

  $scope.updateCustomerGroup = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#customerGroupUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/customers_group/update",
      data: $scope.customer_group
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#customerGroupUpdateModal');
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

  $scope.displayDetailsCustomerGroup = function (customer_group) {
    $scope.error = '';
    $scope.detailsCustomerGroup(customer_group);
    $scope.customer_group = {};
    site.showModal('#customerGroupDetailsModal');
  };

  $scope.detailsCustomerGroup = function (customer_group) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/customers_group/view",
      data: {
        id: customer_group.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.customer_group = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteCustomerGroup = function (customer_group) {
    $scope.error = '';
    $scope.detailsCustomerGroup(customer_group);
    $scope.customer_group = {};
    site.showModal('#customerGroupDeleteModal');
  };

  $scope.deleteCustomerGroup = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/customers_group/delete",
      data: {
        id: $scope.customer_group.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#customerGroupDeleteModal');
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

  $scope.getCustomerGroupList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/customers_group/all",
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
    $scope.getCustomerGroupList($scope.search);
    site.hideModal('#customerGroupSearchModal');
    $scope.search = {}

  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "customers_groups"
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

  $scope.getNumberingAuto();
  $scope.getCustomerGroupList();

});