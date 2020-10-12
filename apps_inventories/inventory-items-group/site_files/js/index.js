app.controller("items_group", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.items_group = {};

  $scope.displayAddItemsGroup = function () {
    $scope.error = '';
    $scope.items_group = {
      image_url: '/images/items_group.png',
      active: true,
      discount: {
        type: 'percent',
        value: 0,
        max: 0
      }

    };
    site.showModal('#itemsGroupAddModal');

  };

  $scope.addItemsGroup = function () {
    $scope.error = '';
    const v = site.validated('#itemsGroupAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.items_group.discount.max = $scope.items_group.discount.value;

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/items_group/add",
      data: $scope.items_group
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#itemsGroupAddModal');
          $scope.getItemsGroupList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateItemsGroup = function (items_group) {
    $scope.error = '';
    $scope.viewItemsGroup(items_group);
    $scope.items_group = {};
    site.showModal('#itemsGroupUpdateModal');
  };

  $scope.updateItemsGroup = function () {
    $scope.error = '';
    const v = site.validated('#itemsGroupUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.items_group.discount.max = $scope.items_group.discount.value;
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/items_group/update",
      data: $scope.items_group
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#itemsGroupUpdateModal');
          $scope.getItemsGroupList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsItemsGroup = function (items_group) {
    $scope.error = '';
    $scope.viewItemsGroup(items_group);
    $scope.items_group = {};
    site.showModal('#itemsGroupViewModal');
  };

  $scope.viewItemsGroup = function (items_group) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/items_group/view",
      data: {
        id: items_group.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.items_group = response.data.doc;
          if (!$scope.items_group.discount) {
            $scope.items_group.discount = {
              type: 'percent',
              value: 0,
              max: 0
            }
          }
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.displayDeleteItemsGroup = function (items_group) {
    $scope.error = '';
    $scope.viewItemsGroup(items_group);
    $scope.items_group = {};
    site.showModal('#itemsGroupDeleteModal');
  };

  $scope.deleteItemsGroup = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/items_group/delete",
      data: {
        id: $scope.items_group.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#itemsGroupDeleteModal');
          $scope.getItemsGroupList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getItemsGroupList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/items_group/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#itemsGroupSearchModal');
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
    site.showModal('#itemsGroupSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getItemsGroupList($scope.search);
    site.hideModal('#itemsGroupSearchModal');
    $scope.search = {};
  };

  $scope.getItemsGroupList();

});