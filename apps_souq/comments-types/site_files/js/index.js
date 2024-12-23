app.controller("comments_types", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.comments_types = {};

  $scope.displayAddCommentsTypes = function () {
    $scope.error = '';
    $scope.comments_types = {
      image_url: '/images/comments_types.png',
      active: true/* ,
      immediate : false */
    };
    site.showModal('#commentsTypesAddModal');
    
  };

  $scope.addCommentsTypes = function () {
    $scope.error = '';
    const v = site.validated('#commentsTypesAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/comments_types/add",
      data: $scope.comments_types
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#commentsTypesAddModal');
          $scope.getCommentsTypesList();
        } else {
          $scope.error = response.data.error;
     
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateCommentsTypes = function (comments_types) {
    $scope.error = '';
    $scope.viewCommentsTypes(comments_types);
    $scope.comments_types = {};
    site.showModal('#commentsTypesUpdateModal');
  };

  $scope.updateCommentsTypes = function () {
    $scope.error = '';
    const v = site.validated('#commentsTypesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/comments_types/update",
      data: $scope.comments_types
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#commentsTypesUpdateModal');
          $scope.getCommentsTypesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsCommentsTypes = function (comments_types) {
    $scope.error = '';
    $scope.viewCommentsTypes(comments_types);
    $scope.comments_types = {};
    site.showModal('#commentsTypesViewModal');
  };

  $scope.viewCommentsTypes = function (comments_types) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/comments_types/view",
      data: {
        id: comments_types.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.comments_types = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteCommentsTypes = function (comments_types) {
    $scope.error = '';
    $scope.viewCommentsTypes(comments_types);
    $scope.comments_types = {};
    site.showModal('#commentsTypesDeleteModal');

  };

  $scope.deleteCommentsTypes = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/comments_types/delete",
      data: {
        id: $scope.comments_types.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#commentsTypesDeleteModal');
          $scope.getCommentsTypesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getCommentsTypesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/comments_types/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#commentsTypesSearchModal');
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
    site.showModal('#commentsTypesSearchModal');

  };

  $scope.searchAll = function () { 
    $scope.getCommentsTypesList($scope.search);
    site.hideModal('#commentsTypesSearchModal');
    $scope.search = {};

  };

  $scope.getCommentsTypesList();
});