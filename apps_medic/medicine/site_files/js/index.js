app.controller("medicine", function ($scope, $http, $timeout) {

  $scope.medicine = {};

  $scope.displayAddMedicine = function () {
    $scope.error = '';
    $scope.medicine = {
      image_url: '/images/medicine.png',
      active: true

    };

    site.showModal('#medicineAddModal');

  };

  $scope.addMedicine = function () {
    $scope.error = '';
    const v = site.validated('#medicineAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/medicine/add",
      data: $scope.medicine
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#medicineAddModal');
          $scope.getMedicineList();
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

  $scope.displayUpdateMedicine = function (medicine) {
    $scope.error = '';
    $scope.viewMedicine(medicine);
    $scope.medicine = {};
    site.showModal('#medicineUpdateModal');
  };

  $scope.updateMedicine = function () {
    $scope.error = '';
    const v = site.validated('#medicineUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/medicine/update",
      data: $scope.medicine
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#medicineUpdateModal');
          $scope.getMedicineList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsMedicine = function (medicine) {
    $scope.error = '';
    $scope.viewMedicine(medicine);
    $scope.medicine = {};
    site.showModal('#medicineViewModal');
  };

  $scope.viewMedicine = function (medicine) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/medicine/view",
      data: {
        id: medicine.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.medicine = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.displayDeleteMedicine = function (medicine) {
    $scope.error = '';
    $scope.viewMedicine(medicine);
    $scope.medicine = {};
    site.showModal('#medicineDeleteModal');
  };

  $scope.deleteMedicine = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/medicine/delete",
      data: {
        id: $scope.medicine.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#medicineDeleteModal');
          $scope.getMedicineList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getMedicineList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/medicine/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#medicineSearchModal');
          $scope.search = {};

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
        screen: "medicine"
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
    site.showModal('#medicineSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getMedicineList($scope.search);
    site.hideModal('#medicineSearchModal');
    $scope.search = {};
  };

  $scope.getMedicineList();
  $scope.getNumberingAuto();
});