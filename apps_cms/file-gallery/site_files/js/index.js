app.controller('fileGallery', function ($scope, $http, $timeout) {
  $scope.mode = 'add';
  $scope.fileGallery = {};

  $scope.displayAddFileGallery = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.fileGallery = {
      active: true,
    };

    site.showModal('#fileGalleryManageModal');
  };

  $scope.addFileGallery = function () {
    $scope.error = '';
    const v = site.validated('#fileGalleryManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/fileGallery/add',
      data: $scope.fileGallery,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#fileGalleryManageModal');
          $scope.getFileGalleryList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateFileGallery = function (fileGallery) {
    $scope.error = '';
    $scope.mode = 'edit';
    $scope.viewFileGallery(fileGallery);
    $scope.fileGallery = {};
    site.showModal('#fileGalleryManageModal');
  };

  $scope.updateFileGallery = function () {
    $scope.error = '';
    const v = site.validated('#fileGalleryManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/fileGallery/update',
      data: $scope.fileGallery,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#fileGalleryManageModal');
          $scope.getFileGalleryList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsFileGallery = function (fileGallery) {
    $scope.error = '';
    $scope.mode = 'view';
    $scope.viewFileGallery(fileGallery);
    $scope.fileGallery = {};
    site.showModal('#fileGalleryManageModal');
  };

  $scope.viewFileGallery = function (fileGallery) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/fileGallery/view',
      data: {
        id: fileGallery.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.fileGallery = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };
  $scope.displayDeleteFileGallery = function (fileGallery) {
    $scope.error = '';
    $scope.mode = 'delete';
    $scope.viewFileGallery(fileGallery);
    $scope.fileGallery = {};
    site.showModal('#fileGalleryManageModal');
  };

  $scope.deleteFileGallery = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/fileGallery/delete',
      data: {
        id: $scope.fileGallery.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#fileGalleryManageModal');
          $scope.getFileGalleryList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getFileGalleryList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/fileGallery/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#fileGallerySearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getFileUrl = function () {
    $scope.error = '';

    if ($scope.fileGallery.file) {
      $scope.fileGallery.url = $scope.fileGallery.file.url;
    }
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#fileGallerySearchModal');
  };

  $scope.searchAll = function () {
    $scope.getFileGalleryList($scope.search);
    site.hideModal('#fileGallerySearchModal');
    $scope.search = {};
  };

  $scope.getFileGalleryList();
});
