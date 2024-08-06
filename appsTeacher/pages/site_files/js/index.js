app.controller("pages", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.pages = {};

  $scope.displayAddPageImplement = function () {
    $scope.error = '';
    $scope.pages = {
      image_url: '/images/pages.png',
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
   
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/pages/add",
      data: $scope.pages
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

  $scope.displayUpdatePageImplement = function (pages) {
    $scope.error = '';
    $scope.viewPageImplement(pages);
    $scope.pages = {};
    site.showModal('#pageImplementUpdateModal');
  };

  $scope.updatePageImplement = function () {
    $scope.error = '';
    const v = site.validated('#pageImplementUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/pages/update",
      data: $scope.pages
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

  $scope.displayDetailsPageImplement = function (pages) {
    $scope.error = '';
    $scope.viewPageImplement(pages);
    $scope.pages = {};
    site.showModal('#pageImplementViewModal');
  };

  $scope.viewPageImplement = function (pages) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/pages/view",
      data: {
        id: pages.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.pages = response.data.doc;
          window.editEditor.setContents($scope.pages.content);
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeletePageImplement = function (pages) {
    $scope.error = '';
    $scope.viewPageImplement(pages);
    $scope.pages = {};
    site.showModal('#pageImplementDeleteModal');

  };

  $scope.deletePageImplement = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/pages/delete",
      data: {
        id: $scope.pages.id
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
      url: "/api/pages/all",
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