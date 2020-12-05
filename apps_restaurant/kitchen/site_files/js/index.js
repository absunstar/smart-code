app.controller("kitchen", function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.kitchen = {};
  $scope.displayAddKitchen = function () {
    $scope.error = '';
    $scope.kitchen = {
      image_url: '/images/kitchen.png',
      active: true/* ,
      immediate : false */
    };
    site.showModal('#kitchenAddModal');
    
  };

  $scope.addKitchen = function () {
    $scope.error = '';
    const v = site.validated('#kitchenAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/kitchen/add",
      data: $scope.kitchen
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#kitchenAddModal');
          $scope.getKitchenList();
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

  $scope.displayUpdateKitchen = function (kitchen) {
    $scope.error = '';
    $scope.viewKitchen(kitchen);
    $scope.kitchen = {};
    site.showModal('#kitchenUpdateModal');
  };

  $scope.updateKitchen = function () {
    $scope.error = '';
    const v = site.validated('#kitchenUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/kitchen/update",
      data: $scope.kitchen
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#kitchenUpdateModal');
          $scope.getKitchenList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsKitchen = function (kitchen) {
    $scope.error = '';
    $scope.viewKitchen(kitchen);
    $scope.kitchen = {};
    site.showModal('#kitchenViewModal');
  };

  $scope.viewKitchen = function (kitchen) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/kitchen/view",
      data: {
        id: kitchen.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.kitchen = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteKitchen = function (kitchen) {
    $scope.error = '';
    $scope.viewKitchen(kitchen);
    $scope.kitchen = {};
    site.showModal('#kitchenDeleteModal');
  };

  $scope.deleteKitchen = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/kitchen/delete",
      data: {
        id: $scope.kitchen.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#kitchenDeleteModal');
          $scope.getKitchenList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getKitchenGroupList = function (where) {
    $scope.busy = true;
    $scope.kitchenGroupList = [];
    $http({
      method: "POST",
      url: "/api/kitchen_group/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.kitchenGroupList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getKitchenList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/kitchen/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#kitchenSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.getPrintersPath = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/printers_path/all",
      data: {
        select: {
          id: 1,
          name: 1,
          type: 1,
          ip_device: 1,
          Port_device: 1,
          ip: 1,
          code : 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.printersPathList = response.data.list;
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
        screen: "kitchens"
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
    site.showModal('#kitchenSearchModal');

  };

  $scope.searchAll = function () { 
    $scope.getKitchenList($scope.search);
    site.hideModal('#kitchenSearchModal');
    $scope.search = {};

  };

  $scope.getKitchenList();
  $scope.getKitchenGroupList();
  $scope.getPrintersPath();
  $scope.getNumberingAuto();

});