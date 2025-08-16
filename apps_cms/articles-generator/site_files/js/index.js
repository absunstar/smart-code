app.connectScope(
    {
        app: [
            { name: 'generatorSites', as: 'site', modal: '#sitesModal' },
            { name: 'generatorYts', as: 'yts', modal: '#ytsModal' },
            {
                name: 'generatorYoutubeChannelList',
                as: 'youtube',
                modal: '#youtubeModal',
            },
            {
                name: 'generatorFacebookGroupList',
                as: 'facebookGroup',
                modal: '#facebookGroupModal',
            },
            {
                name: 'generatorFacebookPageList',
                as: 'facebookPage',
                modal: '#facebookPageModal',
            },
            { name: 'generatorBloger', as: 'blogerManager', modal: '#blogerModal' },
        ],
    },
    ($scope, $http, $timeout, $interval) => {
        $scope.setting = site.showObject('##data.#setting##');
        $scope.categoryList = site.showObject('##data.#categoryList##');
        $scope.bloger = {};
        $scope.host = 'torrent';
        $scope.addCount = 0;
        $scope.updateCount = 0;
        $scope.failCount = 0;

        $scope.bloogerID = '967199882550233956';
        $scope.bloggerPostTitle = 'Earn From Internet';
        $scope.bloggerPostCount = 10;

        $scope.getBlogerCodeURL = function () {
            $http({
                url: `/api/generator/get-bloger-code-url`,
                method: 'GET',
            }).then((res) => {
                $scope.bloger.codeURL = res.data.url;
            });
        };
        $scope.getBlogerCode = function () {
            $http({
                url: `/api/generator/get-bloger-code`,
                method: 'GET',
            }).then((res) => {
                $scope.bloger.code = res.data.code;
            });
        };
        $scope.getBlogerAccessToken = function () {
            $http({
                url: `/api/generator/get-bloger-access_token`,
                method: 'GET',
            }).then((res) => {
                $scope.bloger.acessToken = res.data.access_token;
            });
        };
        $scope.setBlogerAccessToken = function () {
            $http({
                url: `/api/generator/set-bloger-access_token`,
                method: 'POST',
                data: { access_token: $scope.bloger.acessToken },
            }).then((res) => {});
        };
        $scope.getBlogerInfo = function () {
            $http({
                url: `/api/generator/get-bloger-info`,
                method: 'GET',
            }).then((res) => {
                $scope.bloger.info = res.data.bloger;
            });
        };

        $scope.writeBloggerTtitles = function () {
            $http({
                url: `/api/generator/bloger-write-titles`,
                method: 'POST',
                data: { bloggerID: $scope.bloggerID, title: $scope.bloggerPostTitle, count: $scope.bloggerPostCount },
            }).then((res) => {
                SOCIALBROWSER.log(res.data);
                $scope.bloggerArticleList = res.data.list;
            });
        };

        $scope.writeBloggerArticle = function (blog) {
            $http({
                url: `/api/generator/bloger-write-article`,
                method: 'POST',
                data: blog,
            }).then((res) => {
                SOCIALBROWSER.log(res.data);
                let index = $scope.bloggerArticleList.findIndex((b) => b.id == blog.id);
                if (index !== -1) {
                    $scope.bloggerArticleList[index].content = res.data.text;
                }
            });
        };
        $scope.getBloggerPosts = function () {
            $http({
                url: `/api/generator/get-blogger-posts`,
                method: 'POST',
            }).then((res) => {
                $scope.bloggerArticleList = res.data.list;
                $scope.busy = false;
            });
        };

        $scope.copy = function (text) {
            SOCIALBROWSER.copy(text);
        };

        SOCIALBROWSER.on('share', (e, obj) => {
            if (obj.type == 'generator-youtube-channel') {
                $scope.youtubeAdd({ ...obj.channel });
                $scope.youtubeItem = {};
            } else if (obj.type == 'generator-youtube-video') {
                $scope.addArticle({
                    url: obj.url,
                    title: obj.title,
                    image: obj.image,
                    channel: obj.channel,
                    host: obj.channel.host,
                    $youtube: true,
                });
            } else if (obj.type == 'generator-facebook-group') {
                $scope.facebookGroupAdd({ ...obj.group });
            } else if (obj.type == 'generator-facebook-group-post') {
                $scope.addArticle({
                    url: obj.url,
                    title: obj.title,
                    image: obj.image,
                    group: obj.group,
                    is_facebook: true,
                });
            } else if (obj.type == 'generator-facebook-page') {
                console.log(obj);
                $scope.facebookPageAdd({ ...obj.page });
            } else if (obj.type == 'generator-facebook-page-post') {
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
                        if (response.data.updated) {
                            $scope.updateCount++;
                        } else {
                            $scope.addCount++;
                        }

                        if (movie.is_yts) {
                            if (response.data.updated) {
                                $scope.ytsUpdatedCount++;
                            } else {
                                $scope.ytsAddCount++;
                            }
                        }
                    } else {
                        if (movie.is_yts) {
                            $scope.ytsfailCount++;
                        }
                        $scope.failCount++;
                        $scope.error = response.data.error;
                    }
                },
                function (err) {
                    $scope.error = err;
                },
            );
        };

        $scope.fetchYTS = function (op, callback) {
            callback = callback || function () {};
            op = op || {};
            op.page = op.page || 1;
            op.limit = op.limit || 50;
            $http({
                url: `https://yts.mx/api/v2/list_movies.json?limit=${op.limit}&page=${op.page}&with_rt_ratings=true`,
                method: 'GET',
            }).then((res) => {
                callback(res.data.data);
            });
        };
        $scope.fetchYTSMovie = function (op, callback) {
            callback = callback || function () {};
            op = op || {};
            $http({
                url: `https://yts.mx/api/v2/movie_details.json?movie_id=${op.id}&with_cast=true`,
                method: 'GET',
            }).then((res) => {
                callback(res.data.data.movie);
            });
        };
        $scope.ytsPage = 0;
        $scope.ytsLimit = 50;
        $scope.ytsGetCount = 0;
        $scope.ytsSendCount = 0;
        $scope.ytsAddCount = 0;
        $scope.ytsUpdatedCount = 0;
        $scope.ytsfailCount = 0;

        $scope.generateYTS = function () {
            $scope.ytsPage++;
            $scope.fetchYTS({ page: $scope.ytsPage, limit: $scope.ytsLimit }, (data) => {
                $scope.ytsGetCount += data.movies.length;
                if (data.movies.length > 0) {
                    data.movies.forEach((movie) => {
                        $scope.fetchYTSMovie({ id: movie.id }, (movie2) => {
                            $scope.addArticle({
                                ...movie,
                                ...movie2,
                                is_yts: true,
                                category: $scope.category,
                                host: $scope.host,
                            });
                        });
                    });
                    setTimeout(() => {
                        $scope.generateYTS();
                    }, 1000 * 10);
                }
            });
        };

        $scope.addFacebookGroup = function (facebookGroupItem) {
            let code_injected = `/*##articles-generator/get-facebook-group-info.js*/`;
            code_injected += 'facebookGroup_run();';
            let url = facebookGroupItem.url.split('?');

            SOCIALBROWSER.ipc('[open new popup]', {
                show: true,
                vip: true,
                sandbox: false,
                url: url[0],
                timeout: 15 * 1000,
                eval: code_injected,
                allowAudio: false,
                allowDownload: false,
                allowNewWindows: false,
                allowSaveUserData: false,
                allowSaveUrls: false,
            });
            $scope.facebookGroupItem = {};
        };

        $scope.addFacebookPage = function (facebookPageItem) {
            let code_injected = `/*##articles-generator/get-facebook-page-info.js*/`;
            code_injected += 'facebookPage_run();';
            SOCIALBROWSER.ipc('[open new popup]', {
                show: true,
                vip: true,
                sandbox: false,
                url: facebookPageItem.url,
                timeout: 15 * 1000,
                eval: code_injected,
                allowAudio: false,
                allowDownload: false,
                allowNewWindows: false,
                allowSaveUserData: false,
                allowSaveUrls: false,
            });
            $scope.facebookPageItem = {};
        };

        $scope.getFacebookGroupPostList = function (group) {
            let code_injected = `SOCIALBROWSER.facebookGroupItem123 = '${SOCIALBROWSER.to123(group)}';`;
            code_injected += `/*##articles-generator/get-facebook-group-post-list.js*/`;
            code_injected += 'facebookGroup_run();';
            SOCIALBROWSER.ipc('[open new popup]', {
                show: true,
                vip: true,
                sandbox: false,
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
        $scope.getFacebookPagePostList = function (page) {
            let code_injected = `SOCIALBROWSER.facebookPageItem123 = '${SOCIALBROWSER.to123(page)}';`;
            code_injected += `/*##articles-generator/get-facebook-page-post-list.js*/`;
            code_injected += 'facebookPage_run();';
            SOCIALBROWSER.ipc('[open new popup]', {
                show: true,
                vip: true,
                sandbox: false,
                timeout: 30 * 1000,
                url: page.url,
                eval: code_injected,
                allowAudio: false,
                allowDownload: false,
                allowNewWindows: false,
                allowSaveUserData: false,
                allowSaveUrls: false,
            });
        };

        $scope.getAllYoutubeVideoList = function () {
            $scope.youtubeList.forEach((channel, i) => {
                $timeout(() => {
                    $scope.getYoutubeVideoList(channel);
                }, 1000 * 15 * i);
            });
        };

        $scope.getYoutubeVideoList = function (channel) {
            let code_injected = `SOCIALBROWSER.youtubeItem123 = '${SOCIALBROWSER.to123(channel)}';`;
            code_injected += SOCIALBROWSER.from123('/*###articles-generator/get-youtube-video-list.js*/');
            SOCIALBROWSER.ipc('[open new popup]', {
                show: true,
                vip: true,
                sandbox: false,
                timeout: 30 * 1000,
                url: channel.url + '/videos',
                eval: code_injected,
                allowAudio: false,
                allowDownload: false,
                allowNewWindows: false,
                allowSaveUserData: false,
                allowSaveUrls: false,
            });
        };

        $scope.addYoutubeChannel = function (youtubeItem) {
            let code_injected = SOCIALBROWSER.from123(`/*###articles-generator/get-youtube-channel-info.js*/`);
            SOCIALBROWSER.ipc('[open new popup]', {
                show: true,
                vip: true,
                sandbox: false,
                url: youtubeItem.url,
                timeout: 15 * 1000,
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
                sandbox: false,
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

        $scope.openURL = function (url) {
            SOCIALBROWSER.ipc('[open new popup]', {
                show: true,
                vip: true,
                sandbox: false,
                url: url,
                allowAudio: false,
                allowDownload: false,
                allowNewWindows: false,
                allowSaveUserData: false,
                allowSaveUrls: false,
            });
        };

        $scope.siteLoadAll();
        $scope.youtubeLoadAll();
        $scope.facebookGroupLoadAll();
        $scope.facebookPageLoadAll();
    },
);
