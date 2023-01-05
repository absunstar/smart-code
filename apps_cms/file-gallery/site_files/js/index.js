app.controller('file_gallery', function ($scope, $http, $timeout) {
  $scope.mode = 'add';
  $scope.file_gallery = {};

  $scope.displayAddFileGallery = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.file_gallery = {
      active: true,
    };

    site.showModal('#fileGalleryManageModal');
  };

  $scope.addFileGallery = function () {
    $scope.error = '';
    const v = site.validated('#fileGalleryManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/file_gallery/add',
      data: $scope.file_gallery,
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

  $scope.displayUpdateFileGallery = function (file_gallery) {
    $scope.error = '';
    $scope.mode = 'edit';
    $scope.viewFileGallery(file_gallery);
    $scope.file_gallery = {};
    site.showModal('#fileGalleryManageModal');
  };

  $scope.updateFileGallery = function () {
    $scope.error = '';
    const v = site.validated('#fileGalleryManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/file_gallery/update',
      data: $scope.file_gallery,
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

  $scope.displayDetailsFileGallery = function (file_gallery) {
    $scope.error = '';
    $scope.mode = 'view';
    $scope.viewFileGallery(file_gallery);
    $scope.file_gallery = {};
    site.showModal('#fileGalleryManageModal');
  };

  $scope.viewFileGallery = function (file_gallery) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/file_gallery/view',
      data: {
        id: file_gallery.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.file_gallery = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };
  $scope.displayDeleteFileGallery = function (file_gallery) {
    $scope.error = '';
    $scope.mode = 'delete';
    $scope.viewFileGallery(file_gallery);
    $scope.file_gallery = {};
    site.showModal('#fileGalleryManageModal');
  };

  $scope.deleteFileGallery = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/file_gallery/delete',
      data: {
        id: $scope.file_gallery.id,
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
      url: '/api/file_gallery/all',
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

    if ($scope.file_gallery.file) {
      $scope.file_gallery.url = $scope.file_gallery.file.url;
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
