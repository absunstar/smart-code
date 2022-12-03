app.controller("file_type", function ($scope, $http, $timeout) {

  $scope.file_type = {};

  $scope.displayAddFileTypes = function () {
    $scope.error = '';
    $scope.file_type = {
      active: true
    };
    site.showModal('#fileTypesAddModal');
  };

  $scope.addFileTypes = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#fileTypesAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/file_type/add",
      data: $scope.file_type
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#fileTypesAddModal');
          $scope.getFileTypesList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateFileTypes = function (file_type) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsFileTypes(file_type);
    $scope.file_type = {};
    site.showModal('#fileTypesUpdateModal');
  };

  $scope.updateFileTypes = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#fileTypesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/file_type/update",
      data: $scope.file_type
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#fileTypesUpdateModal');
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

  $scope.displayDetailsFileTypes = function (file_type) {
    $scope.error = '';
    $scope.detailsFileTypes(file_type);
    $scope.file_type = {};
    site.showModal('#fileTypesDetailsModal');
  };

  $scope.detailsFileTypes = function (file_type) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/file_type/view",
      data: {
        id: file_type.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.file_type = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteFileTypes = function (file_type) {
    $scope.error = '';
    $scope.detailsFileTypes(file_type);
    $scope.file_type = {};
    site.showModal('#fileTypesDeleteModal');
  };

  $scope.deleteFileTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/file_type/delete",
      data: {
        id: $scope.file_type.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#fileTypesDeleteModal');
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

  $scope.getFileTypesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/file_type/all",
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
    $scope.getFileTypesList($scope.search);
    site.hideModal('#fileTypesSearchModal');
    $scope.search = {}

  };

  $scope.getFileTypesList();

});