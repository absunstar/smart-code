app.controller('articles', function ($scope, $http, $timeout) {
    $scope._search = {};
    $scope.mode = 'add';
    $scope.limit = 50;
    $scope.article = {};
    $scope.directDelete = false;
    $scope.hideHandleImages = true;
    $scope.siteSettings = site.showObject(`##data.#setting##`);
    if ($scope.siteSettings && $scope.siteSettings.id) {
        $scope.articleTypesList = $scope.siteSettings.article.articleTypes.filter((t) => t.active == true);

        $scope.languageList = [];
        $scope.siteSettings.languageList.forEach((l) => {
            if (l.active == true) {
                $scope.languageList.push({
                    id: l.id,
                    name: l.name,
                });
            }
        });
    }

    $scope.handleImages = function () {
        $scope.error = '';
        $scope.hideHandleImages = true;
        $scope.busy = true;
        $http({
            method: 'POST',
            url: '/api/article/handle-images',
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done) {
                } else {
                    $scope.error = response.data.error;
                }
            },
            function (err) {
                console.log(err);
            }
        );
    };

    $scope.displayAddArticles = function () {
        $scope.error = '';
        $scope.mode = 'add';
        $scope.article = {
            active: true,
            date: new Date(),
            publishingDate: new Date(),
            type: $scope.articleTypesList[0],
            translatedList: [],
            yts: {
                torrents: [{}],
            },
        };
        if ($scope.siteSettings.article) {
            if ($scope.siteSettings.article.closingSystem) {
                $scope.article.expiryDate = new Date();
                $scope.article.expiryDate.setDate($scope.article.expiryDate.getDate() + $scope.siteSettings.article.duration || 7);
            }

            if ($scope.siteSettings.article.language) {
                $scope.article.$language = $scope.siteSettings.article.language;
                $scope.addLanguage($scope.article.$language);
            }

            if ($scope.siteSettings.article.writer && $scope.siteSettings.article.writer.id) {
                $scope.article.writer = $scope.writersList.find((_r, i) => {
                    return _r.id === $scope.siteSettings.article.writer.id;
                });
            }

            if ($scope.siteSettings.article.editor && $scope.siteSettings.article.editor.id) {
                $scope.article.editor = $scope.editorsList.find((_e, i) => {
                    return _e.id === $scope.siteSettings.article.editor.id;
                });
            }

            if ($scope.siteSettings.article.category && $scope.siteSettings.article.category.id) {
                $scope.article.category = $scope.categoryList.find((_c) => _c.id === $scope.siteSettings.article.category.id);
            }
        }
        site.showModal('#articleManageModal');
    };
    $scope.changeDate = function () {
        if ($scope.siteSettings.article && $scope.article.publishingDate) {
            if ($scope.siteSettings.article.closingSystem) {
                if ($scope.siteSettings.article.closingSystem.id == 1) {
                    $scope.article.expiryDate = typeof $scope.article.expiryDate == 'string' ? new Date($scope.article.expiryDate) : new Date();
                    $scope.article.publishingDate = new Date($scope.article.publishingDate);
                    $scope.article.expiryDate.setDate($scope.article.publishingDate.getDate() + $scope.siteSettings.article.duration || 7);
                }
            }
        }
    };

    $scope.addArticles = function () {
        $scope.error = '';
        const v = site.validated('#articleManageModal');
        if (!v.ok) {
            $scope.error = v.messages[0].Ar;
            return;
        }
        if (window.addEditor) {
            $scope.article.content2 = window.addEditor.getContents();
        }

        $scope.busy = true;
        $http({
            method: 'POST',
            url: '/api/articles/add',
            data: $scope.article,
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done) {
                    site.hideModal('#articleManageModal');
                    site.resetValidated('#articleManageModal');
                    $scope.list.push(response.data.doc);
                } else {
                    $scope.error = response.data.error;
                }
            },
            function (err) {
                console.log(err);
            }
        );
    };

    $scope.displayUpdateArticles = function (article) {
        $scope.error = '';
        $scope.mode = 'edit';
        $scope.viewArticles(article);
        $scope.article = {};
        site.showModal('#articleManageModal');
    };

    $scope.updateArticles = function () {
        $scope.error = '';
        const v = site.validated('#articleManageModal');
        if (!v.ok) {
            $scope.error = v.messages[0].Ar;
            return;
        }
        if (window.addEditor) {
            $scope.article.content2 = window.addEditor.getContents();
        }
        $scope.busy = true;
        $http({
            method: 'POST',
            url: '/api/articles/update',
            data: $scope.article,
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done) {
                    site.hideModal('#articleManageModal');
                    site.resetValidated('#articleManageModal');
                } else {
                    $scope.error = 'Please Login First';
                }
            },
            function (err) {
                console.log(err);
            }
        );
    };

    $scope.generateMovieDescription = function (article) {
        $http({
            method: 'POST',
            url: '/api/articles/update-movie-description',
            data: article,
        }).then(
            function (response) {
                if (response.data.done) {
                    site.hideModal('#articleManageModal');
                    site.resetValidated('#articleManageModal');
                } else {
                    $scope.error = response.data.error;
                }
            },
            function (err) {
                $scope.error = err;
            }
        );
    };

    $scope.generateAllMovieDescription = function () {
        $scope.list
            .filter((a) => !a.translatedList[0].textContent && a.yts)
            .forEach((article, i) => {
                article.$title = article.yts.title_long;
                $timeout(() => {
                    $scope.generateMovieDescription(article);
                }, 1000 * 15 * i);
            });
    };
    $scope.displayDetailsArticles = function (article) {
        $scope.error = '';
        $scope.mode = 'view';
        $scope.article = {};
        $scope.viewArticles(article);

        site.showModal('#articleManageModal');
    };

    $scope.viewArticles = function (article) {
        $scope.busy = true;
        $scope.error = '';
        $http({
            method: 'POST',
            url: '/api/articles/view',
            data: {
                id: article.id,
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done) {
                    $scope.article = response.data.doc;
                    if (window.addEditor) {
                        window.addEditor.setContents($scope.article.Htmlcontent);
                    }

                    $scope.article.$language = $scope.article.translatedList[0].language;
                    $timeout(() => {
                        $scope.changeLanuage($scope.article.$language);
                    }, 200);

                    console.log($scope.article);
                } else {
                    $scope.error = response.data.error;
                }
            },
            function (err) {
                console.log(err);
            }
        );
    };

    $scope.deleteAll = function () {
        $scope.error = '';
        for (let i = 0; i < $scope.list.length; i++) {
            $scope.deleteArticles($scope.list[i].id);
        }

        site.hideModal('#confirmdeleteAll');
    };

    $scope.displayDeleteArticles = function (article) {
        $scope.error = '';
        if ($scope.directDelete) {
            $scope.deleteArticles(article.id);
        } else {
            $scope.mode = 'delete';
            $scope.article = {};
            $scope.viewArticles(article);
            site.showModal('#articleManageModal');
        }
    };

    $scope.deleteArticles = function (id) {
        $scope.busy = true;
        $scope.error = '';

        $http({
            method: 'POST',
            url: '/api/articles/delete',
            data: {
                id: id,
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done) {
                    site.hideModal('#articleManageModal');
                    $scope.list.splice(
                        $scope.list.findIndex((a) => a.id == id),
                        1
                    );
                } else {
                    $scope.error = response.data.error;
                }
            },
            function (err) {
                console.log(err);
            }
        );
    };

    $scope.getArticlesRelatedList = function (ev, where) {
        $scope.busy = true;
        $scope.list = [];
        if (ev.which !== 13 || where == undefined) {
            return;
        }

        $http({
            method: 'POST',
            url: '/api/articles/all',
            data: {
                search: where,
                limit: 50,
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.relatedTopicslist = response.data.list;
                    $scope.relatedSearch = undefined;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getArticlesList = function (where) {
        $scope.busy = true;
        $scope.list = [];
        $scope.count = 0;
        $http({
            method: 'POST',
            url: '/api/articles/all',
            data: {
                where: where,
                search: $scope.$search,
                limit: $scope.limit,
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.list = response.data.list;
                    $scope.count = response.data.count;
                    site.hideModal('#articleSearchModal');
                    $scope.search = {};
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
        $scope.search = {};
        site.showModal('#articleSearchModal');
    };

    $scope.loadClusters = function () {
        $scope.error = '';
        $scope.busy = true;
        $scope.clusterList = [];
        $http({
            method: 'POST',
            url: '/api/clusters/all',
            data: {
                where: {
                    active: true,
                },
                select: { id: 1, name: 1 },
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done) {
                    $scope.clusterList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.loadCategories = function () {
        $scope.error = '';
        $scope.busy = true;
        $scope.categoryList = [];
        $http({
            method: 'POST',
            url: '/api/categories/lookup',
            data: {
                where: {
                    active: true,
                },
                select: {},
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done) {
                    $scope.categoryList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.loadWriters = function (where) {
        $scope.error = '';
        $scope.busy = true;
        where = where || {};
        where['type.id'] = 1;

        $http({
            method: 'POST',
            url: '/api/users/all',
            data: {
                where: where,
                select: { id: 1, profile: 1, image: 1 },
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done) {
                    $scope.writersList = response.data.users;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getCountriesList = function ($search) {
        if ($search && $search.length < 1) {
            return;
        }
        $scope.busy = true;
        $http({
            method: 'POST',
            url: '/api/countries/all',
            data: {
                where: {
                    active: true,
                },
                select: { id: 1, code: 1, name: 1 },
                search: $search,
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.countriesList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getGovesList = function (country) {
        $scope.busy = true;
        $scope.govesList = [];
        $scope.citiesList = [];
        $scope.areaList = [];
        $http({
            method: 'POST',
            url: '/api/goves/all',
            data: {
                where: {
                    country: country,
                    active: true,
                },
                select: {
                    id: 1,
                    name: 1,
                    code: 1,
                },
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.govesList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getCitiesList = function (gov) {
        $scope.busy = true;
        $scope.citiesList = [];
        $scope.areaList = [];
        $http({
            method: 'POST',
            url: '/api/cities/all',
            data: {
                where: {
                    gov: gov,
                    active: true,
                },
                select: { id: 1, name: 1 },
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.citiesList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getAreaList = function (city) {
        $scope.busy = true;
        $scope.areaList = [];
        $http({
            method: 'POST',
            url: '/api/areas/all',
            data: {
                where: {
                    city: city,
                    active: true,
                },
                select: { id: 1, name: 1 },
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.areaList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.loadEditors = function (where) {
        $scope.error = '';
        $scope.busy = true;
        where = where || {};
        where['type.id'] = 2;

        $http({
            method: 'POST',
            url: '/api/users/all',
            data: {
                where: where,
                select: { id: 1, profile: 1 },
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done) {
                    $scope.editorsList = response.data.users;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.loadSubCategory1 = function (c) {
        $scope.error = '';

        $scope.subcategoryList1 = [];
        $scope.subcategoryList2 = [];
        $scope.subcategoryList3 = [];
        $scope.subcategoryList4 = [];
        $scope.categoryList.forEach((_c) => {
            if (c && c.id == _c.parentId) {
                $scope.subcategoryList1.push(_c);
            }
        });
    };

    $scope.loadSubCategory2 = function (c) {
        $scope.error = '';

        $scope.subcategoryList2 = [];
        $scope.subcategoryList3 = [];
        $scope.subcategoryList4 = [];
        $scope.categoryList.forEach((_c) => {
            if (c && c.id == _c.parentId) {
                $scope.subcategoryList2.push(_c);
            }
        });
    };

    $scope.loadSubCategory3 = function (c) {
        $scope.error = '';

        $scope.subcategoryList3 = [];
        $scope.subcategoryList4 = [];
        $scope.categoryList.forEach((_c) => {
            if (c && c.id == _c.parentId) {
                $scope.subcategoryList3.push(_c);
            }
        });
    };

    $scope.loadSubCategory4 = function (c) {
        $scope.error = '';
        $scope.subcategoryList4 = [];
        $scope.categoryList.forEach((_c) => {
            if (c && c.id == _c.parentId) {
                $scope.subcategoryList4.push(_c);
            }
        });
    };

    $scope.addTranslation = function () {
        $scope.error = '';
        $scope.article.translationList = $scope.article.translationList || [];
        $scope.article.translationList.push({});
    };

    $scope.addMultiParagraph = function (article) {
        $scope.error = '';
        article.multiParagraphList = article.multiParagraphList || [];
        article.multiParagraphList.push({
            showImage: true,
        });
    };

    $scope.addMultiImage = function (article) {
        $scope.error = '';
        article.multiImageList = article.multiImageList || [];
        article.multiImageList.push({
            showImage: true,
        });
    };

    $scope.addKeyWords = function (ev, obj) {
        $scope.error = '';

        if (ev.which !== 13 || !obj.$keyword) {
            return;
        }
        obj.keyWordsList = obj.keyWordsList || [];
        if (!obj.keyWordsList.some((k) => k === obj.$keyword)) {
            obj.keyWordsList.push(obj.$keyword);
        }

        obj.$keyword = '';
    };

    $scope.addTags = function (ev, obj) {
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

    $scope.editTranslateArticle = function (t, type) {
        $scope.translate = t;
        $scope.translate.$type = type;
        site.showModal('#translateContentModal');
    };

    $scope.calc = function (type, art) {
        $timeout(() => {
            if (type == 'views') {
                art.apparentViews = art.actualViews + art.dummyViews;
            } else if (type == 'likes') {
                art.apparentLikes = art.actualLikes + art.dummyLikes;
            } else if (type == 'comments') {
                art.apparentComments = art.actualComments + art.dummyComments;
            } else if (type == 'posts') {
                art.apparentPosts = art.actualPosts + art.dummyPosts;
            } else if (type == 'ratings') {
                art.apparentRatings = art.actualRatings + art.dummyRatings;
            }
        }, 500);
    };

    $scope.searchAll = function () {
        $scope.getArticlesList($scope.search);
        site.hideModal('#articleSearchModal');
        $scope.search = {};
    };

    $scope.changeLanuage = function (lang) {
        let index = $scope.article.translatedList.findIndex((_c) => _c.language && _c.language.id == lang.id);
        $scope.article.$showCreate = index >= 0 ? false : true;
        site.showTabContent('#basic');
        console.log($scope.article);
    };

    $scope.addLanguage = function (lang) {
        if ($scope.article.translatedList.length > 0) {
            let newLang = { ...$scope.article.translatedList[0] };
            newLang.language = lang;
            newLang.keyWordsList = newLang.keyWordsList || [];
            newLang.tagsList = newLang.tagsList || [];
            newLang.multiParagraphList = newLang.multiParagraphList || [];
            newLang.multiImageList = newLang.multiImageList || [];
            newLang.metaTags = newLang.metaTags || [];
            newLang.styles = newLang.styles || [];
            newLang.scripts = newLang.scripts || [];

            newLang.index = $scope.article.translatedList.length;

            $scope.article.translatedList.push(newLang);

            console.log($scope.article);

            if ($scope.article.$autoTranslate) {
                newLang.keyWordsList.forEach((_k, i) => {
                    SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: _k, to: lang.id }, (info) => {
                        $scope.article.translatedList[newLang.index].keyWordsList[i] = info.translatedText;
                        $scope.$applyAsync();
                    });
                });

                newLang.tagsList.forEach((_k, i) => {
                    SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: _k, to: lang.id }, (info) => {
                        $scope.article.translatedList[newLang.index].tagsList = info.translatedText;
                        $scope.$applyAsync();
                    });
                });

                if (newLang.title) {
                    SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: newLang.title, to: lang.id }, (info) => {
                        $scope.article.translatedList[newLang.index].title = info.translatedText;
                        $scope.$applyAsync();
                    });
                }

                if (newLang.content) {
                    SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: newLang.content, to: lang.id }, (info) => {
                        $scope.article.translatedList[newLang.index].content = info.translatedText;
                        $scope.$applyAsync();
                    });
                } else if (newLang.textContent) {
                    SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: newLang.textContent, to: lang.id }, (info) => {
                        $scope.article.translatedList[newLang.index].textContent = info.translatedText;
                        $scope.$applyAsync();
                    });
                }

                if (newLang.socialTitle) {
                    SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: newLang.socialTitle, to: lang.id }, (info) => {
                        $scope.article.translatedList[newLang.index].socialTitle = info.translatedText;
                        $scope.$applyAsync();
                    });
                }

                if (newLang.socialDescription) {
                    SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: newLang.socialDescription, to: lang.id }, (info) => {
                        $scope.article.translatedList[newLang.index].socialDescription = info.translatedText;
                        $scope.$applyAsync();
                    });
                }

                if (newLang.externalTitle) {
                    SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: newLang.externalTitle, to: lang.id }, (info) => {
                        $scope.article.translatedList[newLang.index].externalTitle = info.translatedText;
                        $scope.$applyAsync();
                    });
                }

                if (newLang.externalDescription) {
                    SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: newLang.externalDescription, to: lang.id }, (info) => {
                        $scope.article.translatedList[newLang.index].externalDescription = info.translatedText;
                        $scope.$applyAsync();
                    });
                }
            }
        } else {
            let translate = {
                image: '/images/article.png',
                language: lang,
                showImage: true,
                showSocialImage: true,
                showExternalImage: true,
                actualViews: 0,
                dummyViews: 0,
                apparentViews: 0,
                actualLikes: 0,
                dummyLikes: 0,
                apparentLikes: 0,
                actualComments: 0,
                dummyComments: 0,
                apparentComments: 0,
                actualPosts: 0,
                dummyPosts: 0,
                apparentPosts: 0,
                actualRatings: 0,
                dummyRatings: 0,
                apparentRatings: 0,
                numberWords: 0,
                numberLetters: 0,
                keyWordsList: [],
                tagsList: [],
            };
            $scope.article.translatedList.push(translate);
        }

        $scope.article.$showCreate = false;
        $scope.article.$autoTranslate = false;
    };

    $scope.addMetaTags = function (programming) {
        $scope.error = '';
        programming.metaTags = programming.metaTags || [];
        programming.metaTags.push({ active: true });
    };

    $scope.addStyles = function (programming) {
        $scope.error = '';
        programming.styles = programming.styles || [];
        programming.styles.push({ active: true });
    };

    $scope.addScripts = function (programming) {
        $scope.error = '';
        programming.scripts = programming.scripts || [];
        programming.scripts.push({ active: true });
    };

    $scope.showRelatedTopics = function () {
        $scope.error = '';
        $scope.relatedTopicslist = [];
        site.showModal('#relatedTopics');
    };

    $scope.addRelatedArticle = function (relatedArticle) {
        $scope.error = '';
        $scope.article.relatedArticle = $scope.article.relatedArticle || [];
        let foundRelatedArticle = $scope.article.relatedArticle.some((_r) => _r.id === relatedArticle.id);

        $scope.article.relatedArticle.push({ active: true });
    };

    $scope.calcCount = function (art) {
        $timeout(() => {
            $scope.error = '';
            let titleletters = 0;
            let contentletters = 0;
            let titleWords = 0;
            let contentWords = 0;
            art.numberLetters = 0;
            art.numberWords = 0;
            if ($scope.article.type) {
                if ($scope.article.type.id == 1) {
                    if (art.title) {
                        titleletters = art.title.length;
                        titleWords = art.title.trim().split(/\s+/).length;
                    }
                    if (art.textContent) {
                        contentletters = art.textContent.length;
                        contentWords = art.textContent.trim().split(/\s+/).length;
                    } else if (art.content) {
                        contentletters = art.content.length;
                        contentWords = art.content.trim().split(/\s+/).length;
                    }
                    art.numberLetters = titleletters + contentletters;
                    art.numberWords = titleWords + contentWords;
                }
            }
        }, 500);
    };

    $scope.smartSearch = function () {
        $timeout(() => {
            $scope.getArticlesList();
        }, 200);
    };

    $scope.getArticlesList();
    $scope.loadClusters();
    $scope.loadCategories();
    $scope.loadWriters();
    $scope.loadEditors();
    $scope.getCountriesList();
});
