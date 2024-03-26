app.controller('xwords', function ($scope, $http, $timeout) {
  $scope.baseURL = '';
  $scope.appName = 'xwords';
  $scope.modalID = '#xwordsManageModal';
  $scope.words = [];
  $scope.word = {};
  $scope.$word = {};
  $scope.showWordManage = function (word) {
    $scope.word = word;
    site.showModal($scope.modalID);
  };
  $scope.addToHostList = function () {
    const v = site.validated($scope.modalID);
    if (!v.ok) {
      $scope.error = v.messages[0].En;
      return;
    }
    $scope.word.hostList = $scope.word.hostList || [];
    if ((host = $scope.word.hostList.find((itm) => itm.name == $scope.$word.name))) {
      $scope.error = 'Host Is Exists';
      return;
    } else {
      $scope.word.hostList.push($scope.$word);
      $scope.$word = {};
    }
  };

  $scope.resetWords = function () {
    $http({
      method: 'post',
      url: '/x-api/words/reset',
    }).then(function (response) {
      if (response.data.done) {
        $scope.success = 'Reset Is Done';
        $timeout(() => {
          $scope.success = '';
        }, 1500);
      }
    });
  };

  $scope.exportJson = function () {
    $http({
      method: 'post',
      url: '/x-api/words/export',
    }).then(function (response) {
      if (response.data.done) {
        $scope.success = 'Export Is Done';
        $timeout(() => {
          $scope.success = '';
        }, 1500);
      }
    });
  };
  $scope.loadWords = function () {
    $http({
      method: 'get',
      url: '/x-api/words',
    }).then(function (response) {
      if (response.data.done) {
        for (let i = 0; i < response.data.words.length; i++) {
          if (!response.data.words[i].En) {
            response.data.words[i].En = response.data.words[i].name;
          }
        }
        $scope.words = response.data.words;
      }
    });
  };
  $scope.saveWords = function (ID) {
    for (let i = 0; i < $scope.words.length; i++) {
      if ($scope.words[i].hostList && $scope.words[i].hostList.length === 0) {
        delete $scope.words[i].hostList;
      }
    }
    $http({
      method: 'POST',
      url: '/x-api/words/save',
      data: $scope.words,
    }).then(function (response) {
      if (response.data.done) {
        $scope.success = 'Save Is Done';
        $timeout(() => {
          $scope.success = '';
        }, 1500);
        if (ID) {
          site.hideModal(ID);
        }
      }
    });
  };
  $scope.loadWords();
});
