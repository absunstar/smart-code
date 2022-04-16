app.controller("extras_items", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.extras_items = {};

  $scope.displayAddExtrasItems = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.extras_items = {
      image_url: '/images/extras_items.png',
      price: 0,
      active: true
    };
    site.showModal('#extrasItemsAddModal');
  };

  $scope.addExtrasItems = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#extrasItemsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

 
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/extras_items/add",
      data: $scope.extras_items
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#extrasItemsAddModal');
          $scope.getExtrasItemsList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          } else if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateExtrasItems = function (extras_items) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsExtrasItems(extras_items);
    $scope.extras_items = {};
    site.showModal('#extrasItemsUpdateModal');
  };

  $scope.updateExtrasItems = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#extrasItemsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
   
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/extras_items/update",
      data: $scope.extras_items
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#extrasItemsUpdateModal');
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

  $scope.displayDetailsExtrasItems = function (extras_items) {
    $scope.error = '';
    $scope.detailsExtrasItems(extras_items);
    $scope.extras_items = {};
    site.showModal('#extrasItemsDetailsModal');
  };

  $scope.detailsExtrasItems = function (extras_items) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/extras_items/view",
      data: {
        id: extras_items.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.extras_items = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteExtrasItems = function (extras_items) {
    $scope.error = '';
    $scope.detailsExtrasItems(extras_items);
    $scope.extras_items = {};
    site.showModal('#extrasItemsDeleteModal');
  };

  $scope.deleteExtrasItems = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/extras_items/delete",
      data: {
        id: $scope.extras_items.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#extrasItemsDeleteModal');
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

  $scope.getExtrasItemsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/extras_items/all",
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
    $scope.getExtrasItemsList($scope.search);
    site.hideModal('#extrasItemsSearchModal');
    $scope.search = {}

  };

  $scope.getSubjects = function () {
    $http({
      method: "POST",
      url: "/api/subjects/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
          code: 1
        },
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.subjectsList = response.data.list;
      },
      function (err) {
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
        screen: "extras_items"
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
  $scope.getSubjects();
  $scope.getExtrasItemsList();

});