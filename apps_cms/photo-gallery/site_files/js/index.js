app.controller('photoGallery', function ($scope, $http, $timeout) {
  $scope.mode = 'add';
  $scope.photoGallery = {};

  $scope.displayAddPhotoGallery = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.photoGallery = {
      active: true,
    };

    site.showModal('#photoGalleryManageModal');
  };

  $scope.addPhotoGallery = function () {
    $scope.error = '';
    const v = site.validated('#photoGalleryManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/photoGallery/add',
      data: $scope.photoGallery,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#photoGalleryManageModal');
          $scope.getPhotoGalleryList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdatePhotoGallery = function (photoGallery) {
    $scope.error = '';
    $scope.mode = 'edit';
    $scope.viewPhotoGallery(photoGallery);
    $scope.photoGallery = {};
    site.showModal('#photoGalleryManageModal');
  };

  $scope.updatePhotoGallery = function () {
    $scope.error = '';
    const v = site.validated('#photoGalleryManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/photoGallery/update',
      data: $scope.photoGallery,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#photoGalleryManageModal');
          $scope.getPhotoGalleryList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsPhotoGallery = function (photoGallery) {
    $scope.error = '';
    $scope.mode = 'view';
    $scope.viewPhotoGallery(photoGallery);
    $scope.photoGallery = {};
    site.showModal('#photoGalleryManageModal');
  };

  $scope.viewPhotoGallery = function (photoGallery) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/photoGallery/view',
      data: {
        id: photoGallery.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.photoGallery = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };
  $scope.displayDeletePhotoGallery = function (photoGallery) {
    $scope.error = '';
    $scope.mode = 'delete';
    $scope.viewPhotoGallery(photoGallery);
    $scope.photoGallery = {};
    site.showModal('#photoGalleryManageModal');
  };

  $scope.deletePhotoGallery = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/photoGallery/delete',
      data: {
        id: $scope.photoGallery.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#photoGalleryManageModal');
          $scope.getPhotoGalleryList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getPhotoGalleryList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/photoGallery/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#photoGallerySearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getImageUrl = function () {
    $scope.error = '';

    if ($scope.photoGallery.imageUrl) {
      $scope.photoGallery.url = $scope.photoGallery.imageUrl.url;
    }
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#photoGallerySearchModal');
  };

  $scope.searchAll = function () {
    $scope.getPhotoGalleryList($scope.search);
    site.hideModal('#photoGallerySearchModal');
    $scope.search = {};
  };

  $scope.getPhotoGalleryList();
});
