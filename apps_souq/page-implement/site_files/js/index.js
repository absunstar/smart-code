app.controller("page_implement", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.page_implement = {};

  $scope.displayAddPageImplement = function () {
    $scope.error = '';
    $scope.page_implement = {
      image_url: '/images/page_implement.png',
      active: true/* ,
      immediate : false */
    };
    site.showModal('#pageImplementAddModal');
    
  };

  $scope.addPageImplement = function () {
    $scope.error = '';
    const v = site.validated('#pageImplementAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.page_implement.content =  window.addEditor.getContents();
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/page_implement/add",
      data: $scope.page_implement
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#pageImplementAddModal');
          $scope.getPageImplementList();
        } else {
          $scope.error = response.data.error;
     
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdatePageImplement = function (page_implement) {
    $scope.error = '';
    $scope.viewPageImplement(page_implement);
    $scope.page_implement = {};
    site.showModal('#pageImplementUpdateModal');
  };

  $scope.updatePageImplement = function () {
    $scope.error = '';
    const v = site.validated('#pageImplementUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.page_implement.content =  window.editEditor.getContents();
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/page_implement/update",
      data: $scope.page_implement
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#pageImplementUpdateModal');
          $scope.getPageImplementList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsPageImplement = function (page_implement) {
    $scope.error = '';
    $scope.viewPageImplement(page_implement);
    $scope.page_implement = {};
    site.showModal('#pageImplementViewModal');
  };

  $scope.viewPageImplement = function (page_implement) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/page_implement/view",
      data: {
        id: page_implement.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.page_implement = response.data.doc;
          window.editEditor.setContents($scope.page_implement.content);
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeletePageImplement = function (page_implement) {
    $scope.error = '';
    $scope.viewPageImplement(page_implement);
    $scope.page_implement = {};
    site.showModal('#pageImplementDeleteModal');

  };

  $scope.deletePageImplement = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/page_implement/delete",
      data: {
        id: $scope.page_implement.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#pageImplementDeleteModal');
          $scope.getPageImplementList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getPageImplementList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/page_implement/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#pageImplementSearchModal');
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
    site.showModal('#pageImplementSearchModal');

  };

  $scope.searchAll = function () { 
    $scope.getPageImplementList($scope.search);
    site.hideModal('#pageImplementSearchModal');
    $scope.search = {};

  };

  $scope.getPageImplementList();
});