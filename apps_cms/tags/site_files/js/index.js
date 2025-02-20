app.controller("tags", function ($scope, $http, $timeout) {

  $scope.mode = 'add';
  $scope.tags = {};

  $scope.displayAddTags = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.tags = {
      active: true,
      translatedList : []
    };
    $scope.defaultSettings.languageList.forEach((l) => {
      if (l.active == true) {
        $scope.tags.translatedList.push({
          language: {
            id: l.id,
            name: l.name,
          },
        });
      }
    });

    site.showModal('#tagsManageModal');
  };

  $scope.addTags = function () {
    $scope.error = '';
    const v = site.validated('#tagsManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tags/add",
      data: $scope.tags
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#tagsManageModal');
          $scope.getTagsList();
        } else {
          $scope.error = response.data.error;
       
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateTags = function (tags) {
    $scope.error = '';
    $scope.mode = 'edit';
    $scope.viewTags(tags);
    $scope.tags = {};
    site.showModal('#tagsManageModal');
  };

  $scope.updateTags = function () {
    $scope.error = '';
    const v = site.validated('#tagsManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tags/update",
      data: $scope.tags
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#tagsManageModal');
          $scope.getTagsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsTags = function (tags) {
    $scope.error = '';
    $scope.mode = 'view';
    $scope.viewTags(tags);
    $scope.tags = {};
    site.showModal('#tagsManageModal');
  };

  $scope.viewTags = function (tags) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/tags/view",
      data: {
        id: tags.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.tags = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.displayDeleteTags = function (tags) {
    $scope.error = '';
    $scope.mode = 'delete';
    $scope.viewTags(tags);
    $scope.tags = {};
    site.showModal('#tagsManageModal');
  };

  $scope.deleteTags = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/tags/delete",
      data: {
        id: $scope.tags.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#tagsManageModal');
          $scope.getTagsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getTagsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/tags/all",
      data: {
        where: where,
        select: { id: 1, translatedList: 1, name: 1, active: 1, image : 1 },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#tagsSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.addTagsList = function (ev, obj) {
    $scope.busy = true;

    if (ev.which !== 13 || !obj.$tag) {
      return;
    }
    obj.tagsList = obj.tagsList || [];
    if (!obj.tagsList.some((k) => k === obj.$tag)) {
      obj.tagsList.push(obj.$tag);
    }

    obj.$tag = '';
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

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#tagsSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getTagsList($scope.search);
    site.hideModal('#tagsSearchModal');
    $scope.search = {};
  };

  $scope.getTagsList();
  $scope.getDefaultSetting();
});