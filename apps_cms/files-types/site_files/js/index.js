app.controller("fileType", function ($scope, $http, $timeout) {

  $scope.fileType = {};

  $scope.displayAddFileTypes = function () {
    $scope.error = '';
    $scope.fileType = {
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
      url: "/api/fileType/add",
      data: $scope.fileType
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

  $scope.displayUpdateFileTypes = function (fileType) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsFileTypes(fileType);
    $scope.fileType = {};
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
      url: "/api/fileType/update",
      data: $scope.fileType
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

  $scope.displayDetailsFileTypes = function (fileType) {
    $scope.error = '';
    $scope.detailsFileTypes(fileType);
    $scope.fileType = {};
    site.showModal('#fileTypesDetailsModal');
  };

  $scope.detailsFileTypes = function (fileType) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/fileType/view",
      data: {
        id: fileType.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.fileType = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteFileTypes = function (fileType) {
    $scope.error = '';
    $scope.detailsFileTypes(fileType);
    $scope.fileType = {};
    site.showModal('#fileTypesDeleteModal');
  };

  $scope.deleteFileTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/fileType/delete",
      data: {
        id: $scope.fileType.id

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
      url: "/api/fileType/all",
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