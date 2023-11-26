app.controller("fileType", function ($scope, $http, $timeout) {

  $scope.mode = 'add';
  $scope.fileType = {};

  $scope.displayAddFileTypes = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.fileType = {
      active: true,
      translatedList : []
    };
    $scope.defaultSettings.languageList.forEach((l) => {
      if (l.active == true) {
        $scope.fileType.translatedList.push({
          language: {
            id: l.id,
            name: l.name,
          },
        });
      }
    });
    site.showModal('#fileTypeManageModal');
  };

  $scope.addFileTypes = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#fileTypeManageModal');
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
          site.hideModal('#fileTypeManageModal');
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

    $scope.mode = 'edit';
    $scope.error = '';
    $scope.detailsFileTypes(fileType);
    $scope.fileType = {};
    site.showModal('#fileTypeManageModal');
  };

  $scope.updateFileTypes = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#fileTypeManageModal');
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
          site.hideModal('#fileTypeManageModal');
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
    $scope.mode = 'view';
    $scope.detailsFileTypes(fileType);
    $scope.fileType = {};
    site.showModal('#fileTypeManageModal');
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
    $scope.mode = 'delete';
    $scope.detailsFileTypes(fileType);
    $scope.fileType = {};
    site.showModal('#fileTypeManageModal');
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
          site.hideModal('#fileTypeManageModal');
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
        where: where,
        select: { id: 1, translatedList: 1, name: 1, active: 1},
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

  $scope.getDefaultSetting = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/get-site-setting',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getFileTypesList($scope.search);
    site.hideModal('#fileTypesSearchModal');
    $scope.search = {}

  };

  $scope.getFileTypesList();
  $scope.getDefaultSetting();
});