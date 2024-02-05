app.connectScope(
  {
    app: [
      { name: "generatorSites", as: "site", modal: "#sitesModal" },
      { name: "generatorYts", as: "yts", modal: "#ytsModal" },
      {
        name: "generatorYoutubeChannelList",
        as: "youtube",
        modal: "#youtubeModal",
      },
      {
        name: "generatorFacebookGroupList",
        as: "facebook",
        modal: "#facebookModal",
      },
      { name: "generatorBloger", as: "blogerManager", modal: "#blogerModal" },
    ],
  },
  ($scope, $http, $timeout, $interval) => {
    $scope.setting = site.showObject("##data.#setting##");
    $scope.categoryList = site.showObject("##data.#categoryList##");
    $scope.bloger = {};

    $scope.getBlogerCodeURL = function () {
      $http({
        url: `/api/generator/get-bloger-code-url`,
        method: "GET",
      }).then((res) => {
        $scope.bloger.codeURL = res.data.url;
      });
    };
    $scope.getBlogerCode = function () {
      $http({
        url: `/api/generator/get-bloger-code`,
        method: "GET",
      }).then((res) => {
        $scope.bloger.code = res.data.code;
      });
    };
    $scope.getBlogerAccessToken = function () {
      $http({
        url: `/api/generator/get-bloger-access_token`,
        method: "GET",
      }).then((res) => {
        $scope.bloger.acessToken = res.data.access_token;
      });
    };
    $scope.setBlogerAccessToken = function () {
      $http({
        url: `/api/generator/set-bloger-access_token`,
        method: "POST",
        data: { access_token: $scope.bloger.acessToken },
      }).then((res) => {});
    };
    $scope.getBlogerInfo = function () {
      $http({
        url: `/api/generator/get-bloger-info`,
        method: "GET",
      }).then((res) => {
        $scope.bloger.info = res.data.bloger;
      });
    };
    $scope.writePosts = function () {
      $scope.busy = true;
      $interval(() => {
        $scope.getBloggerPosts();
      }, 1000 * 15);
      $http({
        url: `/api/generator/bloger-write-posts`,
        method: "POST",
      }).then((res) => {});
    };
    $scope.getBloggerPosts = function () {
      $scope.busy = true;
      $http({
        url: `/api/generator/get-blogger-posts`,
        method: "POST",
      }).then((res) => {
        $scope.bloggerPostList = res.data.list;
      });
    };

    $scope.copy = function (text) {
      SOCIALBROWSER.copy(text);
    };

    SOCIALBROWSER.on("share", (e, obj) => {
      if (obj.type == "generator-youtube-channel") {
        $scope.youtubeAdd({ ...obj.channel });
      } else if (obj.type == "generator-youtube-video") {
        $scope.addArticle({
          url: obj.url,
          title: obj.title,
          image: obj.image,
          channel: obj.channel,
          is_youtube: true,
        });
      } else if (obj.type == "generator-facebook-group") {
        $scope.facebookAdd({ ...obj.group });
      } else if (obj.type == "generator-facebook-post") {
        $scope.addArticle({
          url: obj.url,
          title: obj.title,
          image: obj.image,
          group: obj.group,
          is_facebook: true,
        });
      }
    });

    $scope.siteDefaultItem = {
      logo: { url: "/images/site.jpg" },
      url: "https://egytag.com",
    };

    $scope.addArticle = function (movie) {
      if (movie.is_yts) {
        $scope.ytsSendCount++;
      }
      $http({
        method: "POST",
        url: "/api/articles/add",
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
        method: "GET",
      }).then((res) => {
        callback(res.data.data);
      });
    };

    $scope.ytsPage = 0;
    $scope.ytsLimit = 50;
    $scope.ytsGetCount = 0;
    $scope.ytsSendCount = 0;
    $scope.ytsAddCount = 0;
    $scope.ytsfailCount = 0;

    $scope.generateYTS = function () {
      $scope.ytsPage++;
      $scope.fetchYTS(
        { page: $scope.ytsPage, limit: $scope.ytsLimit },
        (data) => {
          $scope.ytsGetCount += data.movies.length;
          if (data.movies.length > 0) {
            data.movies.forEach((movie) => {
              $scope.addArticle({
                ...movie,
                is_yts: true,
                category: $scope.category,
                host: $scope.host,
              });
            });
            setTimeout(() => {
              $scope.generateYTS();
            }, 1000 * 5);
          }
        }
      );
    };

    $scope.addFacebookGroup = function (facebookItem) {
      let code_injected = `/*##articles-generator/get-facebook-group-info.js*/`;
      code_injected += "facebook_run();";
      SOCIALBROWSER.ipc("[open new popup]", {
        show: false,
        vip: true,
        url: facebookItem.url,
        timeout: 15 * 1000,
        eval: code_injected,
        allowAudio: false,
        allowDownload: false,
        allowNewWindows: false,
        allowSaveUserData: false,
        allowSaveUrls: false,
      });
      $scope.facebookItem = {};
    };

    $scope.addYoutubeChannel = function (youtubeItem) {
      let code_injected = `/*##articles-generator/get-youtube-channel-info.js*/`;
      code_injected += "xxx_run();";
      SOCIALBROWSER.ipc("[open new popup]", {
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
    $scope.getFacebookPostList = function (group) {
      let code_injected = `SOCIALBROWSER.facebookItem123 = '${SOCIALBROWSER.to123(
        group
      )}';`;
       code_injected += `/*##articles-generator/get-facebook-post-list.js*/`;
      code_injected += "facebook_run();";
      SOCIALBROWSER.ipc("[open new popup]", {
        show: true,
        vip: true,
        timeout: 30 * 1000,
        url: group.url,
        eval: code_injected,
        allowAudio: false,
        allowDownload: false,
        allowNewWindows: false,
        allowSaveUserData: false,
        allowSaveUrls: false,
      });
    };
    $scope.getYoutubeVideoList = function (channel) {
      let code_injected = `SOCIALBROWSER.youtubeItem123 = '${SOCIALBROWSER.to123(
        channel
      )}';`;
      code_injected += `/*##articles-generator/get-youtube-video-list.js*/`;
      code_injected += "xxx_run();";
      SOCIALBROWSER.ipc("[open new popup]", {
        show: false,
        vip: true,
        timeout: 30 * 1000,
        url: channel.url + "/videos",
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
      code_injected += "xxx_run();";
      SOCIALBROWSER.ipc("[open new popup]", {
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
    $scope.facebookLoadAll();
  }
);
