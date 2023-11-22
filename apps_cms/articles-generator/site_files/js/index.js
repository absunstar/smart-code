app.connectScope(
  {
    app: [
      { name: 'generator_sites', as: 'site', modal: '#sitesModal' },
      { name: 'generator_yts', as: 'yts', modal: '#ytsModal' },
      { name: 'youtubeChannelList', as: 'youtube', modal: '#youtubeModal' },
    ],
  },
  ($scope, $http, $timeout, $interval) => {
    SOCIALBROWSER.on('share', (e, obj) => {
      console.log(obj);
      if (obj.type == 'youtubeChnnel') {
        $scope.youtubeAdd({
          url: obj.url,
          title: obj.title,
          image: obj.image,
        });
      } else if (obj.type == 'youtubeChnnelVideo') {
        $scope.addArticle({
          url: obj.url,
          title: obj.title,
          image: obj.image,
          channelTitle: obj.channelTitle,
          is_youtube: true,
        });
      }
    });
    $scope.siteDefaultItem = {
      logo: { url: '/images/site.jpg' },
      url: 'https://egytag.com',
    };

    $scope.addArticle = function (movie) {
      if (movie.is_yts) {
        $scope.ytsSendCount++;
      }
      $http({
        method: 'POST',
        url: '/api/articles/add',
        data: movie,
      }).then(
        function (response) {
          if (response.data.done) {
            if (movie.is_yts) {
              $scope.ytsAddCount++;
            }
          } else {
            if (movie.is_yts) {
              $scope.ytsfailCount++;
            }
            $scope.error = response.data.error;
          }
        },
        function (err) {
          $scope.error = err;
        }
      );
    };

    $scope.fetchYTS = function (op, callback) {
      callback = callback || function () {};
      op = op || {};
      op.page = op.page || 1;
      op.limit = op.limit || 50;
      $http({
        url: `https://yts.mx/api/v2/list_movies.json?limit=${op.limit}&page=${op.page}`,
        method: 'GET',
      }).then((res) => {
        callback(res.data.data);
      });
    };

    $scope.ytsPage = 0;
    $scope.ytsGetCount = 0;
    $scope.ytsSendCount = 0;
    $scope.ytsAddCount = 0;
    $scope.ytsfailCount = 0;

    $scope.generateYTS = function () {
      $scope.ytsPage++;
      $scope.fetchYTS({ page: $scope.ytsPage }, (data) => {
        $scope.ytsGetCount += data.movies.length;
        if (data.movies.length > 0) {
          data.movies.forEach((movie) => {
            console.log(movie);
            $scope.addArticle({ ...movie, is_yts: true });
          });
          setTimeout(() => {
            $scope.generateYTS();
          }, 1000 * 5);
        }
      });
    };
    $scope.addYoutubeChannel = function (youtubeItem) {
      let code_injected = `/*##articles-generator/get-youtube-channel-info.js*/`;
      code_injected += 'xxx_run();';
      SOCIALBROWSER.ipc('[open new popup]', {
        show: false,
        vip: true,
        url: youtubeItem.url,
        timeout: 15 * 1000,
        eval: code_injected,
        allowAudio: false,
        allowDownload: false,
        allowNewWindows: false,
        allowSaveUserData: false,
        allowSaveUrls: false,
      });
      $scope.youtubeItem = {};
    };
    $scope.getYoutubeVideoList = function (youtubeItem) {
      let code_injected = `SOCIALBROWSER.youtubeItem123 = '${SOCIALBROWSER.to123(youtubeItem)}';`;
      code_injected += `/*##articles-generator/get-youtube-video-list.js*/`;
      code_injected += 'xxx_run();';
      SOCIALBROWSER.ipc('[open new popup]', {
        show: false,
        vip: true,
        timeout: 15 * 1000,
        url: youtubeItem.url + '/videos',
        eval: code_injected,
        allowAudio: false,
        allowDownload: false,
        allowNewWindows: false,
        allowSaveUserData: false,
        allowSaveUrls: false,
      });
    };
    $scope.getYoutubeVideoInfo = function (url) {
      let code_injected = `/*##articles-generator/get-youtube-video-info.js*/`;
      code_injected += 'xxx_run();';
      SOCIALBROWSER.ipc('[open new popup]', {
        show: true,
        vip: true,
        timeout: 15 * 1000,
        url: url,
        eval: code_injected,
        allowAudio: false,
        allowDownload: false,
        allowNewWindows: false,
        allowSaveUserData: false,
        allowSaveUrls: false,
      });
    };
    $scope.siteLoadAll();
    $scope.youtubeLoadAll();
  }
);
