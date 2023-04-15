app.controller("accounting_cost_centers", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.accounting_cost_centers = {};

  $scope.displayAddCostCenters = function (parent_cost_center) {
    $scope._search = {};

    $scope.error = '';

    if (parent_cost_center && parent_cost_center.type == 'detailed') {
      return;
    };

    $scope.accounting_cost_centers = {
      type: 'detailed',
      status: 'active',
      image_url: '/images/accounting_cost_centers.png'
    };

    if (parent_cost_center) {
      $scope.accounting_cost_centers.parent_id = parent_cost_center.id;
      $scope.accounting_cost_centers.top_parent_id = parent_cost_center.top_parent_id || parent_cost_center.id;
    };
  

    if ($scope.accounting_cost_centers.top_parent_id) {

      $scope.accounting_cost_centers = {
        code: parent_cost_center.code,
        type: 'detailed',
        status: parent_cost_center.status,
        image_url: parent_cost_center.image_url
      };

      $scope.accounting_cost_centers.parent_id = parent_cost_center.id;
      $scope.accounting_cost_centers.top_parent_id = parent_cost_center.top_parent_id || parent_cost_center.id;
    };

    if($scope.default_setting.accounting && $scope.default_setting.accounting.auto_generate_account_code_and_cost_center){
      $scope.accounting_cost_centers.length_level = $scope.default_setting.accounting.length_level || 0;
    };

    site.showModal('#costCentersAddModal');
  };

  $scope.addCostCenters = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#costCentersAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/accounting_cost_centers/add",
      data: $scope.accounting_cost_centers
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.accounting_cost_centers = {
            type: 'detailed',
            status: 'active',
            image_url: '/images/accounting_cost_centers.jpg'
          };

          site.hideModal('#costCentersAddModal');

          $scope.list.push(response.data.doc);
          $scope.getCostCentersList();

        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key*')) {
            $scope.error = "##word.accounting_cost_centers_code_err##";
          } else if (response.data.error.like('*enter tree code*')) {
            $scope.error = "##word.enter_code_tree##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateCostCenters = function (accounting_cost_centers) {
    $scope._search = {};

    $scope.error = '';
    $scope.viewCostCenters(accounting_cost_centers);
    $scope.accounting_cost_centers = {};

    site.showModal('#costCentersUpdateModal');
  };

  $scope.updateCostCenters = function () {

    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#costCentersUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      $scope.busy = false;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/accounting_cost_centers/update",
      data: $scope.accounting_cost_centers
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#costCentersUpdateModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list[i] = response.data.doc;
            }
            $scope.getCostCentersList();
          });
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Detailed Err*')) {
            $scope.error = "##word.detailed_err##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayViewCostCenters = function (accounting_cost_centers) {

    $scope.error = '';
    $scope.viewCostCenters(accounting_cost_centers);
    $scope.accounting_cost_centers = {};
    site.showModal('#costCentersDetailsModal');
  };

  $scope.viewCostCenters = function (accounting_cost_centers) {

    $scope.error = '';
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/accounting_cost_centers/view",
      data: {
        id: accounting_cost_centers.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.accounting_cost_centers = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteCostCenters = function (accounting_cost_centers) {

    $scope.error = '';
    $scope.viewCostCenters(accounting_cost_centers);
    $scope.accounting_cost_centers = {};
    site.showModal('#costCentersDeleteModal');
  };

  $scope.deleteCostCenters = function () {

    $scope.error = '';
    if ($scope.busy) {
      return
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/accounting_cost_centers/delete",
      data: {
        id: $scope.accounting_cost_centers.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          site.hideModal('#costCentersDeleteModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
            }
            $scope.getCostCentersList();
          });
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Delete Acc Err*')) {
            $scope.error = "##word.cant_delete##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getCostCentersList = function (where) {

    $scope.error = '';
    $scope.busy = true;
    $scope.list = [];

    $http({
      method: "POST",
      url: "/api/accounting_cost_centers/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          response.data.list.forEach(n => {
            n.name2 = n.code + '-' + n.name_ar;
          });
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

    $scope.getCostCentersList(where);

    site.hideModal('#costCentersSearchModal');
    $scope.search = {}

  };

  $scope.getCodeType = function () {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/default_setting/get",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data) {
          $scope.default_setting = response.data.doc;
          $scope.disabledCode = response.data.doc.accounting.auto_generate_account_code_and_cost_center == true ? true : false;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getCodeType();

  $scope.getCostCentersList();

});