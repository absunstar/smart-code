module.exports = function init(site) {
    site.$articles = site.connectCollection('articles');
    site.$articlesSearch = site.connectCollection('articlesSearch');
    site.$articles.createUnique({
        guid: 1,
    });

    site.articlesList = [];

    site.searchArticleList = [];
    site.addToSearchArticleList = function (s) {
        site.searchArticleList.push({ ...s, date: new Date() });
        /* Save in Database */
    };

    site.days = [
        { Ar: 'الاحد', En: 'Sunday' },
        { Ar: 'الاثنين', En: 'Monday' },
        { Ar: 'الثلاثاء', En: 'Tuesday' },
        { Ar: 'الاربعاء', En: 'Wednesday' },
        { Ar: 'الخميس', En: 'Thursday' },
        { Ar: 'الجمعة', En: 'Friday' },
        { Ar: 'السبت', En: 'Saturday' },
    ];
    site.monthes = [
        { Ar: 'يناير', En: 'January' },
        { Ar: 'فبراير', En: 'February' },
        { Ar: 'مارس', En: 'March' },
        { Ar: 'ابريل', En: 'April' },
        { Ar: 'مايو', En: 'May' },
        { Ar: 'يونيو', En: 'June' },
        { Ar: 'يوليو', En: 'July' },
        { Ar: 'أغسطس', En: 'August' },
        { Ar: 'سبتمر', En: 'September' },
        { Ar: 'أكتوبر', En: 'October' },
        { Ar: 'نوقمير', En: 'November' },
        { Ar: 'ديسمبر', En: 'December' },
    ];
    site.escapeRegx = function (s) {
        if (!s) {
            return '';
        }
        if (typeof s !== 'string') {
            s = s.toString();
        }
        return s.replace(/[\/\\^$*+?.()\[\]{}]/g, '\\$&');
    };
    site.escapeHtml = function (unsafe) {
        try {
            if (!unsafe) {
                return '';
            }
            return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        } catch (error) {
            return unsafe;
        }
    };
    site.escapeXML = function (unsafe) {
        try {
            if (!unsafe) {
                return '';
            }
            return unsafe.replace(/&/g, '').replace(/</g, '').replace(/>/g, '').replace(/"/g, '').replaceAll(':', '');
        } catch (error) {
            return unsafe;
        }
    };
    site.removeHtml = function (unsafe) {
        try {
            if (!unsafe) {
                return '';
            }
            return unsafe
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;|&laquo;|&raquo|&quot;|&rlm;|&llm;|&lrm;|&rrm;/g, '')
                .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, ' ')
                .replaceAll('(', '')
                .replaceAll(')', '')
                .replaceAll('-', ' ')
                .replaceAll('+', ' ')
                .replaceAll('$', ' ')
                .replaceAll('&', ' ')
                .replaceAll(':', ' ')
                .replaceAll(',', ' ')
                .replaceAll('.', ' ')
                .replaceAll('#', ' ')
                .replaceAll('!', ' ')
                .replaceAll('?', ' ')
                .replaceAll('؟', ' ')
                .replaceAll("'", ' ')
                .replace(/\s+/g, ' ')
                .trim();
        } catch (error) {
            return unsafe || '';
        }
    };
    site.filterLetters = function (str, lettersToRemove = ['  ', ':', '=', '"', "'", '؟']) {
        if (!str) {
            return '';
        }
        var specials = [
            // order matters for these
            '-',
            '[',
            ']',
            // order doesn't matter for any of these
            '/',
            '{',
            '}',
            '(',
            ')',
            '*',
            '+',
            '?',
            '.',
            '\\',
            '^',
            '$',
            '|',
        ];

        regex = RegExp('[' + specials.join('\\') + ']', 'g');
        str = str.replace(regex, ' ');
        str = str.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, ' ');

        lettersToRemove.forEach((letter) => {
            str = str.replaceAll(letter, '');
        });
        return str.replace(/\s+/g, ' ').trim();
    };

    site.getArticle = function (guid, callBack) {
        callBack = callBack || function () {};
        let article = site.articlesList.find((a) => a.id == guid || a.guid == guid);
        if (article) {
            callBack(null, article);
        } else {
            site.$articles.find(
                { guid: guid },
                (err, doc) => {
                    if (!err && doc) {
                        doc = site.handleArticle({ ...doc });
                        site.articlesList.push(doc);
                    }
                    callBack(err, doc);
                },
                true,
            );
        }
    };

    site.handleArticle = function (doc, options = {}) {
        let lang = doc.translatedList[0];
        lang.title = lang.title || '';
        if (typeof lang.title !== 'string') {
            console.log(lang.title);
            lang.title = '';
        }
        doc.$title = site.filterLetters(site.removeHtml(lang.title));
        doc.$titleArray = doc.$title.split(' ');
        doc.$alt = doc.$title.split(' ').slice(0, 3).join(' ');
        doc.$imageURL = lang.image?.url || '/theme1/images/no.png';
        doc.$coverURL = lang.cover?.url || doc.$imageURL;
        doc.host = doc.host || options.host || '';
        doc.$hasAudio = false;
        doc.$hasVideo = false;
        doc.$hasImageGallary = false;
        doc.$hasMenu = false;
        doc.$menuClass = 'none';
        doc.$audioClass = 'none';
        doc.$videoClass = 'none';
        doc.$hasReadingTime = false;
        doc.$readingTimeClass = 'none';
        doc.$miniTitleClass = 'none';
        doc.$hasMiniTitle = false;
        doc.$imageGallaryClass = 'none';

        if (doc.type.id === 2) {
            doc.$content = lang.htmlContent || '';
        } else if (doc.type.id == 7 && doc.yts) {
            doc.$yts = true;
            doc.$title += ' ( ' + doc.yts.year + ' ) ';
            doc.$title2 = site.removeHtml(doc.$title).replace(/\s/g, '-');
            doc.yts.$trailerURL = 'https://www.youtube.com/results?search_query=' + doc.$title + ' Trailer';
            doc.yts.$imdbURL = 'https://www.imdb.com/title/' + doc.yts.imdb_code;
            doc.yts.$subtitleURL = 'https://www.opensubtitles.org/en/search2/sublanguageid-all/moviename-' + doc.$title.replace(/\s/g, '+');
            if (doc.yts.yt_trailer_code) {
                doc.$embdedURL = 'https://www.youtube.com/embed/' + doc.yts.yt_trailer_code;
            }
            doc.$backgroundURL = doc.$coverURL;
            doc.$content = lang.textContent || lang.htmlContent || '';
            if (Array.isArray(doc.yts.cast)) {
                doc.$castList = [];
                doc.yts.cast.forEach((c) => {
                    doc.$castList.push({ ...c, url: 'https://www.imdb.com/name/nm' + c.imdb_code, imageURL: c.url_small_image });
                });
            }
            doc.yts.torrents = doc.yts.torrents || [];
            doc.yts.torrents.forEach((torrent, i) => {
                torrent.$url = '/torrent-download/' + doc.guid + '/' + i.toString();
            });
        } else if (doc.type.id == 8) {
            doc.$youtube = true;
            doc.$title2 = site.removeHtml(doc.$title).replace(/\s/g, '-');
            if (doc.youtube && doc.youtube.url) {
                doc.$embdedURL = 'https://www.youtube.com/embed/' + doc.youtube.url.split('=')[1].split('&')[0];
            }
            doc.$content = lang.textContent || lang.htmlContent || '';
        } else if (doc.type.id == 9) {
            doc.$title = doc.$title.substring(0, 70);
            doc.$title2 = site.removeHtml(doc.$title).replace(/\s/g, '-');
            doc.$content = lang.title;
        } else {
            doc.$title2 = site.removeHtml(doc.$title).replace(/\s/g, '-');
            doc.$content = lang.textContent || lang.htmlContent || '';
        }
        doc.$url = '/article/' + doc.guid + '/' + doc.$title2;

        doc.$description = site.filterLetters(site.removeHtml(doc.$content).substring(0, 180));
        lang.keyWordsList = lang.keyWordsList || [];
        doc.$keyWordsList = [];
        lang.keyWordsList.forEach((k, i) => {
            k = site.removeHtml(k);
            if (!k || k.length < 4) {
                return;
            }

            if (doc.$keyWordsList.findIndex((kk) => kk.contains(k)) == -1) {
                if (doc.type.id == 7) {
                    doc.$keyWordsList.push(k + ' Movie');
                } else {
                    doc.$keyWordsList.push(k);
                }
            }
        });

        doc.$tagsList = [];
        lang.tagsList = lang.tagsList || [doc.$title];

        lang.tagsList.forEach((k, i) => {
            k = site.removeHtml(k);
            if (!k || k.length < 2) {
                return;
            }
            doc.$tagsList.push(k);
        });

        doc.publishDate = site.getDateTime(doc.publishDate);
        doc.$date1 = doc.publishDate.getDate() + ' / ' + (site.monthes[doc.publishDate.getMonth()]?.Ar || '-----') + ' / ' + doc.publishDate.getFullYear();
        doc.$date2 = doc.publishDate.getDate() + ' \\ ' + (site.monthes[doc.publishDate.getMonth()]?.En || '-----') + ' \\ ' + doc.publishDate.getFullYear();
        doc.$day1 = site.days[doc.publishDate.getDay()]?.Ar || '-----';
        doc.$day2 = site.days[doc.publishDate.getDay()]?.En || '-----';

        if (lang.hasAudio) {
            doc.$hasAudio = true;
            doc.$audio = lang.audio;
            doc.$audioClass = '';
        }

        if (lang.hasVideo) {
            doc.$hasVideo = true;
            doc.$video = lang.video;
            doc.$videoClass = '';
        }

        if (lang.hasReadingTime) {
            doc.$hasReadingTime = true;
            doc.$readingTime = lang.readingTime;
            doc.$readingTimeClass = '';
        }

        if (lang.hasMiniTitle) {
            doc.$miniTitle = lang.miniTitle;
            doc.$hasMiniTitle = true;
            doc.$miniTitleClass = '';
        }

        if (doc.writer) {
            doc.$hasWriter = true;
            doc.writer.$name = doc.writer.profile.name + ' ' + doc.writer.profile.lastName;
            doc.writer.$title = doc.writer.profile.title;
            doc.writer.$imageURL = doc.writer.image?.url || doc.writer.profile.imageURL;
        }
        if (doc.type.id == 7) {
            if (!doc.$hasMiniTitle) {
                doc.$miniTitle = doc.yts.type;
                doc.$hasMiniTitle = true;
                doc.$miniTitleClass = '';
            }
        } else if (doc.type.id == 8 && !doc.$hasMiniTitle) {
            doc.$miniTitle = 'Youtube';
            doc.$hasMiniTitle = true;
            doc.$miniTitleClass = '';
        }

        if (site.options.useLocalImages) {
            doc.$imageURL = '/article-image/' + doc.guid;
        }

        return doc;
    };
    site.handleSearchArticle = function (doc, options = {}) {
        let lang = doc.translatedList[0];
        doc.$title = lang.title;
        doc.$imageURL = lang.image?.url || '/theme1/images/no.png';
        doc.host = doc.host || options.host || '';

        if (doc.type.id === 2) {
            doc.$content = lang.htmlContent || '';
        } else if (doc.type.id == 7 && doc.yts) {
            doc.$yts = true;
            doc.$title += ' ( ' + doc.yts.year + ' ) ';
            doc.$title2 = site.removeHtml(doc.$title).replace(/\s/g, '-');
            doc.yts.$trailerURL = 'https://www.youtube.com/results?search_query=' + doc.$title + ' Trailer';
            doc.yts.$imdbURL = 'https://www.imdb.com/title/' + doc.yts.imdb_code;
            doc.yts.$subtitleURL = 'https://subscene.com/subtitles/searchbytitle?query=' + doc.$title;
            doc.$backgroundURL = doc.$coverURL;
        } else if (doc.type.id == 8) {
            doc.$youtube = true;
            doc.$title2 = site.removeHtml(doc.$title).replace(/\s/g, '-');
            doc.$embdedURL = 'https://www.youtube.com/embed/' + doc.youtube.url.split('=')[1].split('&')[0];
        } else if (doc.type.id == 9) {
            doc.$title = doc.$title.substring(0, 70);
            doc.$title2 = site.removeHtml(doc.$title).replace(/\s/g, '-');
        } else {
            doc.$title2 = site.removeHtml(doc.$title).replace(/\s/g, '-');
        }

        doc.$url = '/article/' + doc.guid + '/' + doc.$title2;

        doc.publishDate = site.getDateTime(doc.publishDate);
        doc.$date1 = doc.publishDate.getDate() + ' / ' + (site.monthes[doc.publishDate.getMonth()]?.Ar || '-----') + ' / ' + doc.publishDate.getFullYear();
        doc.$date2 = doc.publishDate.getDate() + ' \\ ' + (site.monthes[doc.publishDate.getMonth()]?.En || '-----') + ' \\ ' + doc.publishDate.getFullYear();
        doc.$day1 = site.days[doc.publishDate.getDay()]?.Ar || '-----';
        doc.$day2 = site.days[doc.publishDate.getDay()]?.En || '-----';

        doc.$hasAudio = false;
        doc.$hasVideo = false;
        doc.$hasImageGallary = false;
        doc.$hasMenu = false;
        doc.$menuClass = 'none';

        doc.$audioClass = 'none';
        doc.$videoClass = 'none';
        doc.$imageGallaryClass = 'none';
        if (lang.hasAudio) {
            doc.$hasAudio = true;
            doc.$audio = lang.audio;
            doc.$audioClass = '';
        }

        if (lang.hasVideo) {
            doc.$hasVideo = true;
            doc.$video = lang.video;
            doc.$videoClass = '';
        }
        doc.$readingTimeClass = 'none';
        doc.$hasReadingTime = false;
        if (lang.hasReadingTime) {
            doc.$hasReadingTime = true;
            doc.$readingTime = lang.readingTime;
            doc.$readingTimeClass = '';
        }

        doc.$miniTitleClass = 'none';
        doc.$hasMiniTitle = false;
        if (lang.hasMiniTitle) {
            doc.$miniTitle = lang.miniTitle;
            doc.$hasMiniTitle = true;
            doc.$miniTitleClass = '';
        }

        if (doc.type.id == 7 && !doc.$hasMiniTitle) {
            doc.$miniTitle = doc.yts.type;
            doc.$hasMiniTitle = true;
            doc.$miniTitleClass = '';
        } else if (doc.type.id == 8 && !doc.$hasMiniTitle) {
            doc.$miniTitle = 'Youtube';
            doc.$hasMiniTitle = true;
            doc.$miniTitleClass = '';
        }
        delete doc.translatedList;
        delete doc.yts;
        delete doc._id;
        delete doc.type;

        if (site.options.useLocalImages) {
            doc.$imageURL = '/article-image/' + doc.guid;
        }

        return doc;
    };
    site.searchArticles = function (options, callBack) {
        callBack = callBack || function () {};
        options = options || {};

        options.search = options.search || '';
        options.tag = options.tag || '';

        options.host = options.host || '';
        options.page = options.page || 1;
        options.page = parseInt(options.page);
        options.limit = options.limit || 50;
        options.limit = parseInt(options.limit);
        options.skip = options.limit * (options.page - 1);
        // options.exp = '';
        options.search = site.filterLetters(options.search);
        // options.search.forEach((w, i) => {
        //   if (w.length > 2) {
        //     options.exp += w + '|';
        //   }
        // });

        // options.expString = options.exp.replace(/.$/, '');
        // options.exp = new RegExp(options.expString, 'gium');

        if (options.host.indexOf('*') !== -1) {
            options.host = options.host.split('*');
            options.host.forEach((n, i) => {
                options.host[i] = site.escapeRegx(n);
            });
            options.host = options.host.join('.*');
        } else {
            options.host = site.escapeRegx(options.host);
        }
        options.host = '^' + options.host + '$';
        options.host = new RegExp(options.host, 'gium');

        let list = [];
        if (options.category) {
            options.search = 'category_' + options.category.id;
            options.where = { 'category.id': options.category.id };
        } else {
            let $or = [];
            if (options.search) {
                $or.push({
                    'translatedList.title': { $regex: new RegExp(options.search, 'gium') },
                });
                options.search.split(' ').forEach((s) => {
                    if (s.length > 2) {
                        $or.push({
                            'translatedList.tagsList': { $regex: new RegExp(s, 'gium') },
                        });
                        $or.push({
                            'translatedList.title': { $regex: new RegExp(s, 'gium') },
                        });
                    }
                });
            } else if (options.tag) {
                options.search = 'tag_' + options.tag;
                $or.push({
                    'translatedList.tagsList': { $regex: new RegExp(options.tag, 'i') },
                });
            }

            options.where = {
                $and: [{ host: options.host }, { $or: $or }],
            };
        }

        if ((s = site.searchArticleList.find((sa) => sa.id == options.host + '_' + options.search + '_' + options.page + '_' + options.limit))) {
            callBack(null, s);
        } else {
            site.$articles.findAll(
                {
                    select: {
                        guid: 1,
                        type: 1,
                        publishDate: 1,
                        yts: 1,
                        translatedList: 1,
                        youtube: 1,
                    },
                    sort: { id: -1 },
                    where: options.where,
                    limit: options.limit,
                    skip: options.skip,
                },
                (err, docs, count) => {
                    if (!err && docs) {
                        docs.forEach((doc) => {
                            list.push(site.handleSearchArticle(doc));
                        });

                        let ss = {
                            id: options.host + '_' + options.search + '_' + options.page + '_' + options.limit,
                            category: options.category,
                            search: options.search,
                            tag: options.tag,
                            page: options.page,
                            limit: options.limit,
                            count: count,
                            list: list,
                        };
                        site.addToSearchArticleList(ss);

                        callBack(
                            null,
                            site.searchArticleList.find((s) => s.id == ss.id),
                        );
                    } else {
                        callBack(err);
                    }
                },
                true,
            );
        }
    };
    site.prepareArticles = function () {
        console.log('site.prepareArticles()');
        site.$articles.findMany({ sort: { id: -1 }, limit: 2000 }, (err, docs) => {
            if (!err && docs) {
                console.log('site.prepareArticles() : ' + docs.length);
                docs.forEach((doc) => {
                    if (site.articlesList.findIndex((a) => a.id == doc.id) == -1) {
                        site.articlesList.push(site.handleArticle({ ...doc }));
                    }
                });
                site.prepareUrgentArticles();
                site.prepareSliderArticles();
            } else {
                console.log(err);
            }
        });
    };

    site.prepareUrgentArticles = function () {
        site.$articles.findMany({ where: { showOnTop: true }, sort: { id: -1 }, limit: 500 }, (err, docs) => {
            if (!err && docs) {
                docs.forEach((doc) => {
                    if (site.articlesList.findIndex((a) => a.id == doc.id) == -1) {
                        site.articlesList.push(site.handleArticle({ ...doc }));
                    }
                });
                site.articlesList.sort((a, b) => {
                    return b.id - a.id;
                });
            }
        });
    };
    site.prepareSliderArticles = function () {
        site.$articles.findMany({ where: { showInMainSlider: true }, sort: { id: -1 }, limit: 50 }, (err, docs) => {
            if (!err && docs) {
                docs.forEach((doc) => {
                    if (site.articlesList.findIndex((a) => a.id == doc.id) == -1) {
                        site.articlesList.push(site.handleArticle({ ...doc }));
                    }
                });
                site.articlesList.sort((a, b) => {
                    return b.id - a.id;
                });
            }
        });
    };
    site.getRelatedArticles = function (a, filter = '*', num = 16) {
        let $relatedArticleList = site.articlesList.filter((b) => b.host.like(filter) && b.$tagsList.includes(a.$tagsList[0]) && b.id !== a.id).slice(0, num);
        if ($relatedArticleList.length < num) {
            $relatedArticleList = [
                ...$relatedArticleList,
                ...site.articlesList.filter((b) => b.host.like(filter) && b.category && a.category && b.category.id === a.category.id && b.id !== a.id).slice(0, num - $relatedArticleList.length),
            ];
        }
        return $relatedArticleList;
    };

    site.getLatestArticles = function (a, filter = '*', num = 12) {
        return site.articlesList.filter((b) => b.host.like(filter) && b.id !== a.id && b.category && a.category && b.category.id == a.category.id).slice(0, num);
    };
    site.getTopArticles = function (filter = '*', category, num = 12) {
        return site.articlesList
            .filter((a) => (!category || !a.category || a.category.id == category.id) && a.showOnTop === true && a.host.like(filter))
            .slice(0, num)
            .reverse();
    };

    site.indexNow = function (url, callBack) {
        console.log('Index NOW : ' + url);
        if (url) {
            site.fetch('https://api.indexnow.org/IndexNow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json;charset=utf-8', Host: 'api.indexnow.org' },
                body: {
                    host: 'movies.egytag.com',
                    key: 'fcf3c6e41ba640b19e99ba79e8d3ac0a',
                    keyLocation: 'https://movies.egytag.com/fcf3c6e41ba640b19e99ba79e8d3ac0a.txt',
                    urlList: [url],
                },
            }).then((response) => {
                console.log(`Index NOW : HTTP Status Code: ${response.status}`);
                if (callBack) {
                    callBack(response);
                }
            });
        }
    };
    site.GOOGLE_API_KEY_list = [
        '31365783413727823157167428387232271852674559567337153226315847144315476732792361341762494678625343574217',
        '31365783413727823156323431786252313547623139567432166732381717492835171932794774465937263518238345566727',
        '31365783413727823139174147581758397632353975817945593726385427624678617536175678361476534274267546765259',
        '31365783413727823215567341375736327932174558571626394749371552144617271443758273355452582839574337185675',
        '31365783413727823216626138542332485413174779476232183667315375813619272732568182371661812717426331745181',
        '31365783413727823179177227745761461717193257373626374673485413232717521531795269455742393774372345758623',
        '31365783413727823157524337792324435437173579271636371734263913783254236941795672327582764675517942786223',
    ];

    site.GOOGLE_API_KEY_index = 0;

    site.getGeminiResult = function (ask, callBack) {
        let GOOGLE_API_KEY = site.f1(site.GOOGLE_API_KEY_list[site.GOOGLE_API_KEY_index]);

        site.fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GOOGLE_API_KEY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {
                contents: [
                    {
                        parts: [
                            {
                                text: ask,
                            },
                        ],
                    },
                ],
            },
        })
            .then((d) => d.json())
            .then((d) => {
                let text = '';
                if (d.candidates) {
                    d.candidates.forEach((candidate) => {
                        if (candidate.content?.parts) {
                            candidate.content.parts.forEach((part) => {
                                text += part.text + '\n';
                            });
                        }
                    });
                }
                if (d.error?.code == 429) {
                    console.log('Error API KEY : ' + site.GOOGLE_API_KEY_index);
                    site.GOOGLE_API_KEY_index++;
                    if (site.GOOGLE_API_KEY_index >= site.GOOGLE_API_KEY_list.length) {
                        site.GOOGLE_API_KEY_index = 0;
                    }
                    site.getGeminiResult(ask, callBack);
                } else if (d.error) {
                    console.log(d.error);
                    callBack(d.error, null);
                } else {
                    callBack(null, text, d);
                }
            })
            .catch((err) => callBack(err, null));
    };
    site.getDeepseekResult = function (ask, callBack) {
        const Deepseek_API_KEY = site.f1('467865672774525426382671273546824135325227154753415816724158167228152352417416794158167128184191');
        site.fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Deepseek_API_KEY },
            body: {
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: ask },
                ],
                stream: false,
            },
        })
            .then((d) => d.json())
            .then((completion) => {
                if (completion.error) {
                    callBack(completion.error, '', completion);
                } else if (completion.choices) {
                    let text = completion.choices[0].message.content;
                    callBack(null, text, completion);
                } else {
                    callBack({ message: 'No Error But No Choices' }, '', completion);
                }
            })
            .catch((err) => callBack(err, null));
    };
    site.getChatgptResult = function (ask, callBack) {
        const CHATGPT_API_KEY = site.f1(
            '46786567461923694353767848585239461867414559367835744274483636763839571632563736345417163217131728391721481942684717627446354716315442813676426934387175363756744216571626162737463876493236766843392775321723764835131537173174315872534375422431347625351886562719621743568573327842344776177835764173417952423557526345195737361537734536375927764227427827694557371335193778461642832716856741753271253923783239237246591772271921812654238347751691',
        );
        site.fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + CHATGPT_API_KEY },
            body: {
                model: 'gpt-5',
                input: ask,
            },
        })
            .then((d) => d.json())
            .then((result) => {
                callBack(null, result);
            })
            .catch((err) => callBack(err, null));
    };
    site.getMovieDescription = function (title, callBack) {
        site.getGeminiResult(
            'write article in English Language more than 2000 words about movie "' + title + '" and add Tables to improve article and convert to html code only with no images or links or css',
            (err, text, result) => {
                callBack(err, text, result);
            },
        );
    };
    site.getYoutubeDescription = function (title, url, callBack) {
        site.getGeminiResult(
            'اكتب مقال بالغة العربية اكثر من 1000 كلمة عن فيديو اليوتيوب بعنوان  :  "' + title + '" ورابط الفيديو  "' + url + '"   as html code only with no images or links or css',
            (err, text, result) => {
                callBack(err, text, result);
            },
        );
    };

    site.autoUpdateMovieDescription = function () {
        console.log('AI YTS finding ...');
        site.$articles.find(
            {
                select: {},
                where: {
                    'translatedList.textContent': '',
                    'category.id': 2,
                },
                sort: {
                    id: -1,
                },
            },
            (err, articlesDoc) => {
                if (!err && !articlesDoc) {
                    console.log('AI Not Found Any YTS');
                }
                if (!err && articlesDoc) {
                    articlesDoc = site.handleArticle(articlesDoc);
                    console.log('AI Start : ' + articlesDoc.$title);
                    site.getMovieDescription(articlesDoc.$title, (err, text, result) => {
                        if (!err && text) {
                            text = text.replaceAll('**', '\n').replaceAll('*', '').replaceAll('#', '').replaceAll('"', '').replaceAll('```html', '').replaceAll('```', '').replace('h1', 'h2)');
                            articlesDoc.translatedList[0].textContent = text;
                            site.$articles.edit(
                                {
                                    where: {
                                        id: articlesDoc.id,
                                    },
                                    set: articlesDoc,
                                },
                                (err, result) => {
                                    if (!err && result) {
                                        let index = site.articlesList.findIndex((a) => a.id === result.doc.id);
                                        if (index !== -1) {
                                            site.articlesList[index] = site.handleArticle({ ...result.doc });
                                        }
                                        console.log('AI Done: ' + articlesDoc.yts.title);
                                    }
                                    if (err) {
                                        console.log(err);
                                    }
                                },
                            );
                        }
                        if (err) {
                            console.log(err);
                        }
                    });
                }
                if (err) {
                    console.log(err);
                }
            },
            true,
        );
    };

    site.autoUpdatYoutubeDescription = function () {
        console.log('AI youtube finding ...');
        site.$articles.find(
            {
                select: {},
                where: {
                    $or: [{ 'translatedList.textContent': '' }, { 'translatedList.textContent': null }],
                    youtube: { $exists: true },
                },
                sort: {
                    id: -1,
                },
            },
            (err, articlesDoc) => {
                if (!err && !articlesDoc) {
                    console.log('AI Not Found Any Youtube Article');
                }
                if (!err && articlesDoc) {
                    articlesDoc = site.handleArticle(articlesDoc);
                    console.log('AI Youtube Start : ' + articlesDoc.youtube.url);
                    site.getYoutubeDescription(articlesDoc.$title, articlesDoc.youtube.url, (err, text, result) => {
                        if (!err && text) {
                            text = text.replaceAll('**', ' ').replaceAll('*', '').replaceAll('#', '').replaceAll('"', '').replaceAll('```html', '').replaceAll('```', '').replace('h1', 'h2');
                            // text = site.$.load(text, null, false).html();
                            articlesDoc.translatedList[0].textContent = text;
                            articlesDoc.type = site.articleTypes.find((t) => t.id === 8);
                            site.$articles.edit(
                                {
                                    where: {
                                        id: articlesDoc.id,
                                    },
                                    set: articlesDoc,
                                },
                                (err, result) => {
                                    if (!err && result) {
                                        let index = site.articlesList.findIndex((a) => a.id === result.doc.id);
                                        if (index > -1) {
                                            site.articlesList[index] = site.handleArticle({ ...result.doc });
                                        }
                                        console.log('AI Youtube Done: ' + articlesDoc.youtube.url);
                                    }
                                    if (err) {
                                        console.log(err);
                                    }
                                },
                            );
                        }
                        if (err) {
                            console.error(err);
                        }
                    });
                }
                if (err) {
                    console.log(err);
                }
            },
            true,
        );
    };

    setInterval(() => {
        site.autoUpdatYoutubeDescription();
        site.autoUpdateMovieDescription();
    }, 1000 * 60);

    site.prepareArticles();

    site.get({
        name: 'images',
        path: __dirname + '/site_files/images/',
    });

    site.get(
        {
            name: 'articles',
            require: { features: ['browser.social'], permissions: ['admin'] },
        },
        (req, res) => {
            let setting = site.getSiteSetting(req.host) || {};
            let language = setting.languageList.find((l) => l.id == req.session.lang) || setting.languageList[0];

            res.render(
                'articles/index.html',
                {
                    setting: setting,
                    language: language,
                    appName: req.word('Articles'),
                },
                { parser: 'html' },
            );
        },
    );

    site.post(
        {
            name: '/api/articleTypes/all',
        },
        (req, res) => {
            res.json(site.articleTypes);
        },
    );

    site.post(
        {
            name: '/api/languages/all',
        },
        (req, res) => {
            res.json(supportedLanguageList);
        },
    );

    let http_agent = new site.http.Agent({
        keepAlive: true,
    });
    let https_agent = new site.https.Agent({
        keepAlive: true,
    });

    site.onGET('/article-image/:guid', (req, res) => {
        site.getArticle(req.params.guid, (err, article) => {
            if (article) {
                let imageURL = article.$imageURL;
                if (!imageURL || imageURL == '/images/no.png') {
                    res.redirect('/images/no.png');
                } else {
                    if (req.headers['user-agent'] && req.headers['user-agent'].like('*facebook*|*Googlebot*|*Storebot-Google*|*AdsBot*|*Mediapartners-Google*|*Google-Safety*|*FeedFetcher*')) {
                        delete req.headers.host;
                        delete req.headers.referer;
                        site.fetch(imageURL, {
                            method: req.method,
                            headers: req.headers,
                            body: req.method.like('*get*|*head*') ? null : req.bodyRaw,
                            agent: function (_parsedURL) {
                                if (_parsedURL.protocol == 'http:') {
                                    return http_agent;
                                } else {
                                    return https_agent;
                                }
                            },
                        })
                            .then((response) => {
                                response.body.pipe(res);
                            })
                            .catch((err) => {
                                console.log(err);
                                res.redirect(imageURL, 301);
                            });
                    } else {
                        res.redirect(imageURL, 301);
                    }
                }
            } else {
                res.redirect('/images/no.png');
            }
        });
    });
    site.onGET('/torrent-download/:guid/:index', (req, res) => {
        if (req.hasFeature('browser.social')) {
            site.getArticle(req.params.guid, (err, article) => {
                if (article) {
                    let index = parseInt(req.params.index);
                    res.redirect(article.yts.torrents[index].url);
                } else {
                    res.end(404);
                }
            });
        } else {
            res.render('client-side/require_features.html');
        }
    });

    site.downloadImage = function (options, callback) {
        if (typeof options == 'string') {
            options = { url: options };
        }

        options.folder = options.folder || new Date().getFullYear() + '_' + (new Date().getMonth() + 1) + '_' + new Date().getDate();
        options.name = options.name || 'image_' + new Date().getTime().toString() + Math.random().toString().replace('.', '_');

        site.createDir(site.options.upload_dir + '/' + options.folder, () => {
            options.path = site.options.upload_dir + '/' + options.folder + '/' + options.name;
            options.path2 = site.options.upload_dir + '/' + options.folder + '/' + options.name + '.webp';

            site.fetch(options.url)
                .then((res) => {
                    const dest = site.fs.createWriteStream(options.path);
                    res.body.pipe(dest);
                    dest.on('close', () => {
                        site.webp.cwebp(options.path, options.path2, '-q 80').then((output) => {
                            options.path0 = options.path;
                            options.path = options.path2;
                            options.url0 = options.url;
                            options.url = '/api/image/' + options.folder + '/' + options.name + '.webp';
                            site.deleteFileSync(options.path0, () => {});
                            options.done = true;
                            if (callback) {
                                callback(options);
                            }
                        });
                    });
                })
                .catch((err) => {
                    options.error = err.message;
                    if (callback) {
                        callback(options);
                    }
                });
        });
    };

    site.get({ name: '/api/image/:folder/:name', public: true }, (req, res) => {
        res.set('Cache-Control', 'public, max-age=' + 60 * site.options.cache.images);
        res.download(site.options.upload_dir + '/' + req.params.folder + '/' + req.params.name);
    });

    site.post({ name: '/api/articles/add', require: { Permissions: ['login'] } }, (req, res) => {
        let response = {
            done: false,
        };

        let setting = site.getSiteSetting(req.host);

        if (!setting) {
            response.error = 'No Setting ';
            res.json(response);
            return;
        }
        let language = setting.languageList.find((l) => l.id == req.session.lang) || setting.languageList[0];
        if (!language) {
            response.error = 'No Language';
            res.json(response);
            return;
        }
        let userData = req.body;
        let articlesDoc = {};

        if (userData.is_yts) {
            articlesDoc = {
                type: site.articleTypes.find((t) => t.id === 7),
                category: userData.category,
                yts: userData,
                translatedList: [{ language: language }],
                host: userData.host || 'yts',
            };

            articlesDoc.guid = site.md5(articlesDoc.yts.title_long || articlesDoc.yts.title);

            articlesDoc.showInMainSlider = true;
            articlesDoc.showOnTop = true;

            articlesDoc.translatedList[0].title = articlesDoc.yts.title;
            articlesDoc.translatedList[0].image = {
                url: articlesDoc.yts.medium_cover_image,
            };
            articlesDoc.translatedList[0].cover = {
                url: articlesDoc.yts.large_cover_image,
            };
            articlesDoc.translatedList[0].textContent = '';
            articlesDoc.translatedList[0].rating = articlesDoc.yts.rating || '';

            articlesDoc.translatedList[0].tagsList = articlesDoc.translatedList[0].tagsList || [];
            articlesDoc.translatedList[0].keyWordsList = articlesDoc.translatedList[0].keyWordsList || [];

            if (Array.isArray(articlesDoc.yts.genres)) {
                articlesDoc.yts.type = articlesDoc.yts.genres.join(' ');
                articlesDoc.translatedList[0].tagsList = [...articlesDoc.yts.genres];
                articlesDoc.translatedList[0].keyWordsList = [...site.removeHtml(articlesDoc.yts.title).split(' '), ...articlesDoc.yts.genres];
            }
            if (articlesDoc.yts.year) {
                articlesDoc.translatedList[0].tagsList.push(articlesDoc.yts.year.toString());
            }
            if (articlesDoc.yts.language) {
                articlesDoc.translatedList[0].tagsList.push(articlesDoc.yts.language);
            }
            articlesDoc.yts.torrents = articlesDoc.yts.torrents || [];
            articlesDoc.yts.torrents.forEach((torrent) => {
                articlesDoc.translatedList[0].tagsList.push(torrent.quality);
            });

            if (articlesDoc.yts.date_uploaded) {
                articlesDoc.publishDate = site.getDateTime(articlesDoc.yts.date_uploaded);
            }
        } else if (userData.$youtube) {
            articlesDoc = {
                type: site.articleTypes.find((t) => t.id === 8),
                translatedList: [{ language: language }],
                youtube: {
                    url: userData.url,
                },
            };
            if (userData.channel) {
                if (userData.channel.category) {
                    articlesDoc.category = userData.channel.category;
                }
                if (userData.channel.host) {
                    articlesDoc.host = userData.channel.host;
                }
            }

            articlesDoc.showInMainSlider = true;
            articlesDoc.showOnTop = true;

            articlesDoc.translatedList[0].tagsList = [...site.removeHtml(userData.channel.title).split(' '), 'Video', 'Watch'];
            articlesDoc.translatedList[0].keyWordsList = [...site.removeHtml(userData.title).split(' '), ...site.removeHtml(userData.channel.title).split(' ')];

            articlesDoc.translatedList[0].title = userData.title;
            articlesDoc.translatedList[0].image = {
                url: userData.image?.url,
            };
            articlesDoc.translatedList[0].textContent = userData.description || '';
            if (userData.date_uploaded) {
                articlesDoc.publishDate = site.getDateTime(userData.date);
            } else {
                articlesDoc.publishDate = new Date();
            }

            articlesDoc.guid = site.md5('Youtube - ' + articlesDoc.translatedList[0].title);
        } else if (articlesDoc.is_facebook) {
            articlesDoc = {
                type: site.articleTypes.find((t) => t.id === 9),
                facebook: userData,
                translatedList: [{ language: language }],
                host: 'facebook',
            };

            if (articlesDoc.facebook.group) {
                if (articlesDoc.facebook.group.category) {
                    articlesDoc.category = articlesDoc.facebook.group.category;
                }
                if (articlesDoc.facebook.group.host) {
                    articlesDoc.host = articlesDoc.facebook.group.host;
                }
                articlesDoc.translatedList[0].tagsList = [...site.removeHtml(articlesDoc.facebook.group.title).split(' '), 'facebook', 'post'];
                articlesDoc.translatedList[0].keyWordsList = [...site.removeHtml(articlesDoc.facebook.title).split(' '), ...site.removeHtml(articlesDoc.facebook.group.title).split(' ')];
            }

            if (articlesDoc.facebook.page) {
                if (articlesDoc.facebook.page.category) {
                    articlesDoc.category = articlesDoc.facebook.page.category;
                }
                if (articlesDoc.facebook.page.host) {
                    articlesDoc.host = articlesDoc.facebook.page.host;
                }
                articlesDoc.translatedList[0].tagsList = [...site.removeHtml(articlesDoc.facebook.page.title).split(' '), 'facebook', 'post'];
                articlesDoc.translatedList[0].keyWordsList = [...site.removeHtml(articlesDoc.facebook.title).split(' '), ...site.removeHtml(articlesDoc.facebook.page.title).split(' ')];
            }
            articlesDoc.showInMainSlider = true;
            articlesDoc.showOnTop = true;

            articlesDoc.translatedList[0].textContent = articlesDoc.facebook.title || '';
            articlesDoc.translatedList[0].title = articlesDoc.facebook.title ? articlesDoc.facebook.title.slice(0, 30) : '';
            articlesDoc.translatedList[0].image = {
                url: articlesDoc.facebook.image?.url,
            };

            if (articlesDoc.facebook.date) {
                articlesDoc.publishDate = site.getDateTime(articlesDoc.facebook.date);
            } else {
                articlesDoc.publishDate = new Date();
            }

            articlesDoc.guid = site.md5('Facebook - ' + articlesDoc.facebook.url);
        } else {
            articlesDoc = userData;
        }

        articlesDoc.addUserInfo = req.getUserFinger();

        if (typeof articlesDoc.active === 'undefined') {
            articlesDoc.active = true;
        }

        articlesDoc.translatedList[0].tagsList.forEach((tag, i) => {
            articlesDoc.translatedList[0].tagsList[i] = tag.replace(' ', '-');
        });
        articlesDoc.guid = articlesDoc.guid || site.md5(articlesDoc.translatedList[0].title);
        articlesDoc.host = articlesDoc.host || req.host;

        site.$articles.find({ guid: articlesDoc.guid }, (err, doc) => {
            if (!err && doc) {
                response.updated = true;
                if (articlesDoc.yts) {
                    doc.yts = articlesDoc.yts;
                    doc.translatedList[0].rating = articlesDoc.translatedList[0].rating;
                    doc.translatedList[0].title = articlesDoc.translatedList[0].title;
                    doc.translatedList[0].textContent = articlesDoc.translatedList[0].textContent || doc.translatedList[0].textContent || '';
                }

                doc = { ...doc, ...articlesDoc };

                site.$articles.update(doc, (err, result) => {
                    if (!err && result.doc) {
                        response.done = true;
                        response.doc = result.doc;
                        let index = site.articlesList.findIndex((a) => a.id == result.doc.id);
                        if (index !== -1) {
                            site.articlesList[index] = site.handleArticle({ ...result.doc });
                        }
                    } else {
                        response.error = err?.message;
                    }
                    res.json(response);
                });
            } else {
                site.$articles.add(articlesDoc, (err, doc) => {
                    if (!err && doc) {
                        response.done = true;
                        response.doc = doc;
                        if (doc.type.id == 9 && doc.facebook) {
                            site.downloadImage(doc.facebook.image.url, (image) => {
                                doc.translatedList[0].image = image;
                                site.$articles.update(doc, (err, result) => {
                                    if (!err && result.doc) {
                                        site.articlesList.unshift(site.handleArticle({ ...result.doc }));
                                    }
                                });
                            });
                        } else {
                            site.articlesList.unshift(site.handleArticle({ ...doc }));
                        }
                    } else {
                        response.error = err?.message;
                    }
                    res.json(response);
                });
            }
        });
    });

    site.post('/api/articles/update', (req, res) => {
        let response = {
            done: false,
        };

        if (!req.session.user) {
            response.error = 'Please Login First';
            res.json(response);
            return;
        }

        let articlesDoc = req.body;

        articlesDoc.editUserInfo = site.security.getUserFinger({
            $req: req,
            $res: res,
        });

        if (!articlesDoc.id) {
            response.error = 'No id';
            res.json(response);
            return;
        }

        site.$articles.edit(
            {
                where: {
                    id: articlesDoc.id,
                },
                set: articlesDoc,
            },
            (err, result) => {
                if (!err && result) {
                    response.done = true;

                    let index = site.articlesList.findIndex((a) => a.id === result.doc.id);
                    if (index > -1) {
                        site.articlesList[index] = site.handleArticle({ ...result.doc });
                    }
                } else {
                    response.error = 'Code Already Exist';
                }
                res.json(response);
            },
        );
    });
    site.post('/api/articles/generate-movie-description', (req, res) => {
        let response = {
            done: false,
        };

        if (!req.session.user) {
            response.error = 'Please Login First';
            res.json(response);
            return;
        }

        let articlesDoc = req.body;

        articlesDoc.editUserInfo = req.getUserFinger();

        if (!articlesDoc.id) {
            response.error = 'No id';
            res.json(response);
            return;
        }

        if (!articlesDoc.$title) {
            response.error = 'No $title';
            res.json(response);
            return;
        }

        site.getMovieDescription(articlesDoc.$title, (err, text, result) => {
            response.result = result;
            if (!err && text) {
                text = text.replaceAll('**', '\n').replaceAll('*', '').replaceAll('#', '').replaceAll('"', '').replaceAll('```html', '').replaceAll('```', '').replace('h1', 'h2)');

                articlesDoc.translatedList[0].textContent = text;
                site.$articles.edit(
                    {
                        where: {
                            id: articlesDoc.id,
                        },
                        set: articlesDoc,
                    },
                    (err, result) => {
                        if (!err && result) {
                            response.done = true;
                            response.doc = result.doc;
                            let index = site.articlesList.findIndex((a) => a.id === result.doc.id);
                            if (index > -1) {
                                site.articlesList[index] = site.handleArticle({ ...result.doc });
                            }
                        } else {
                            response.error = err?.message;
                        }
                        res.json(response);
                    },
                );
            } else {
                res.json(response);
            }
        });
    });
    site.post('/api/articles/view', (req, res) => {
        let response = {
            done: false,
        };

        let index = site.articlesList.findIndex((a) => a.id === req.data.id);
        if (index > -1) {
            response.done = true;
            response.doc = site.articlesList[index];
            res.json(response);
        } else {
            site.$articles.find(
                { id: req.data.id },
                (err, doc) => {
                    if (!err && doc) {
                        response.done = true;
                        response.doc = doc;
                        res.json(response);
                    } else {
                        response.error = err?.message || 'Error Not Exists';
                        res.json(response);
                    }
                },
                true,
            );
        }
    });

    site.post('/api/articles/delete', (req, res) => {
        let response = {
            done: false,
        };

        if (!req.session.user) {
            response.error = 'Please Login First';
            res.json(response);
            return;
        }

        site.$articles.delete(
            {
                id: req.body.id,
            },
            (err, result) => {
                if (!err) {
                    response.done = true;
                    let index = site.articlesList.findIndex((a) => a.id === req.data.id);
                    if (index > -1) {
                        response.done = true;
                        site.articlesList.splice(index);
                    }
                } else {
                    response.error = err?.message;
                }
                res.json(response);
            },
        );
    });

    site.post('/api/articles/all', (req, res) => {
        let response = {
            done: false,
        };

        let where = req.body.where || {};
        let limit = req.body.limit || 100;
        if (req.body.search) {
            where.$or = [];
            where.$or.push(
                {
                    'type.Ar': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'type.En': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'clusters.name': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'category.name': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'subCategory1.name': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'subCategory2.name': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'subCategory3.name': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'subCategory4.name': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'writer.profile.name': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'writer.profile.lastName': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'editor.profile.name': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'editor.profile.lastName': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'country.name': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'gov.name': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'city.name': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'area.name': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    longitudes: site.get_RegExp(req.body.search, 'i'),
                },
                {
                    latitudes: site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'translatedList.title': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'translatedList.textContent': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'translatedList.htmlContent': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'translatedList.multiParagraphList.contentText': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'translatedList.multiParagraphList.content': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'translatedList.multiImageList.title': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'translatedList.title': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'translatedList.socialTitle': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'translatedList.socialDescription': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'translatedList.externalTitle': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'translatedList.externalDescription': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'translatedList.content': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'translatedList.keyWordsList': site.get_RegExp(req.body.search, 'i'),
                },
                {
                    'translatedList.tagsList': site.get_RegExp(req.body.search, 'i'),
                },
            );
        }
        if (where['title']) {
            where['translatedList.title'] = site.get_RegExp(where['title'], 'i');
            delete where['title'];
        }
        if (where['host']) {
            where['host'] = site.get_RegExp(where['host'], 'i');
        }
        if (where['type']) {
            where['type.id'] = where['type'].id;
            delete where['type'];
        }
        if (where['writer']) {
            where['writer.id'] = where['writer'].id;
            delete where['writer'];
        }
        if (where['editor']) {
            where['editor.id'] = where['editor'].id;
            delete where['editor'];
        }
        if (where['category']) {
            where['category.id'] = where['category'].id;
            delete where['category'];
        }
        if (where['subCategory1']) {
            where['subCategory1.id'] = where['subCategory1'].id;
            delete where['subCategory1'];
        }
        if (where['subCategory2']) {
            where['subCategory2.id'] = where['subCategory2'].id;
            delete where['subCategory2'];
        }
        if (where['subCategory3']) {
            where['subCategory3.id'] = where['subCategory3'].id;
            delete where['subCategory3'];
        }
        if (where['subCategory4']) {
            where['subCategory4.id'] = where['subCategory4'].id;
            delete where['subCategory4'];
        }
        if (where['cluster']) {
            where['clusters.id'] = where['cluster'].id;
            delete where['cluster'];
        }
        if (where['country']) {
            where['country.id'] = where['country'].id;
            delete where['country'];
        }
        if (where['gov']) {
            where['gov.id'] = where['gov'].id;
            delete where['gov'];
        }
        if (where['city']) {
            where['city.id'] = where['city'].id;
            delete where['city'];
        }
        if (where['area']) {
            where['area.id'] = where['area'].id;
            delete where['area'];
        }
        if (where['hasReadingTime']) {
            where['translatedList.hasReadingTime'] = true;
            delete where['hasReadingTime'];
        }
        if (where['hasAudio']) {
            where['translatedList.hasAudio'] = true;
            delete where['hasAudio'];
        }
        if (where['hasVideo']) {
            where['translatedList.hasVideo'] = true;
            delete where['hasVideo'];
        }
        if (where['tag']) {
            where['translatedList.tagsList'] = site.get_RegExp(where['tag'], 'i');
            delete where['tag'];
        }
        if (where['keyword']) {
            where['translatedList.keyWordsList'] = site.get_RegExp(where['keyword'], 'i');
            delete where['keyword'];
        }

        if (typeof where['noContent'] !== undefined) {
            if (where['noContent']) {
                where['translatedList.textContent'] = '';
            }
            delete where['noContent'];
        }
        // site.get_RegExp(req.body.search, "i");
        // site.articlesList.filter(u => u.name.contains(where['name']))

        site.$articles.findMany(
            {
                select: req.body.select || {},
                where: where,
                sort: req.body.sort || {
                    id: -1,
                },
                limit: req.body.limit || 100,
            },
            (err, docs, count) => {
                if (!err) {
                    response.done = true;
                    response.list = docs;

                    response.count = count;
                } else {
                    response.error = err.message;
                }
                res.json(response);
            },
        );
    });

    site.onPOST('/api/article/handle-images', (req, res) => {
        let response = {
            done: false,
        };
        site.$articles.findMany(
            {
                select: { id: 1, translatedList: 1 },
                sort: req.body.sort || {
                    id: -1,
                },
                limit: 10000,
            },
            (err, docs, count) => {
                if (!err && docs) {
                    response.done = true;
                    response.list = docs;
                    docs.forEach((doc) => {
                        doc.translatedList.forEach((_t) => {
                            if (_t.image && _t.image.url && !_t.image.url.like('*.webp')) {
                                let arr = _t.image.url.split('/');
                                let imageName = arr.pop();
                                let imageName2 = imageName.replace(site.path.extname(imageName), '.webp');
                                let folderName = arr.pop();
                                let folder = new Date().getFullYear() + '_' + new Date().getMonth() + '_' + new Date().getDate();
                                let path = site.options.upload_dir + '/' + folderName + '/images/' + imageName;
                                let path2 = site.options.upload_dir + '/' + folder + '/images/' + imageName2;
                                site.createDir(site.options.upload_dir + '/' + folder, () => {
                                    site.createDir(site.options.upload_dir + '/' + folder + '/images', () => {
                                        site.webp.cwebp(path, path2, '-q 80').then((output) => {
                                            console.log(output);
                                            _t.image.path = path2;
                                            _t.image.url = '/x-api/image/' + folder + '/' + imageName2;
                                            site.$articles.update(doc);
                                        });
                                    });
                                });
                            }
                        });
                    });

                    response.count = count;
                } else {
                    response.error = err.message;
                }
                res.json(response);
            },
        );
    });

    site.onGET('/api/article/update-tags', (req, res) => {
        site.$articles.findAll(
            {
                limit: 100000,
                select: { id: 1, yts: 1, translatedList: 1 },
                where: { yts: { $exists: true } },
            },
            (err, docs) => {
                if (!err && docs) {
                    res.json({ done: true, count: docs.length });
                    docs.forEach((doc) => {
                        let lang = doc.translatedList[0];
                        lang.tagsList = lang.tagsList || [];

                        if (doc.yts) {
                            if (doc.yts.torrents) {
                                doc.yts.torrents.forEach((torrent) => {
                                    if (!lang.tagsList.includes(torrent.quality)) {
                                        lang.tagsList.push(torrent.quality);
                                    }
                                });
                            }
                            if (doc.yts.language) {
                                if (!lang.tagsList.includes(doc.yts.language)) {
                                    lang.tagsList.push(doc.yts.language);
                                }
                            }
                            if (lang.tagsList.includes(doc.yts.year)) {
                                lang.tagsList.splice(
                                    lang.tagsList.findIndex((t) => t == doc.yts.year),
                                    1,
                                );
                                lang.tagsList.push(doc.yts.year.toString());
                            } else if (!lang.tagsList.includes(doc.yts.year.toString())) {
                                lang.tagsList.push(doc.yts.year);
                            }
                            lang.tagsList.forEach((tag, i) => {
                                lang.tagsList[i] = tag.replace(' ', '-');
                            });
                            site.$articles.update(doc, (err, result) => {
                                console.log(err || result.doc.id);
                            });
                        }
                    });
                } else {
                    res.json({ done: false });
                }
            },
        );
    });

    site.rssStartSlice = 0;
    site.onGET({ name: ['/rss', '/rss/articles', '/rss/articles/:id'], public: true }, (req, res) => {
        let limit = parseInt(req.query.limit || 10);
        let to = site.rssStartSlice + limit;

        let list = [];
        let text = '';

        let setting = site.getSiteSetting(req.host);
        let filter = site.getHostFilter(req.host);

        let lang = setting.languageList[0];
        let domain = 'https://' + req.host;
        if (req.params.id == 'random') {
            list = site.articlesList.filter((p) => p.$imageURL && p.active);
            list = [list[site.random(0, list.length - 1)]];
        } else if (req.params.id) {
            list = [site.articlesList.find((p) => p.id == req.params.id)];
        } else {
            list = site.articlesList.filter((a) => a.$imageURL && a.host.like(filter)).slice(site.rssStartSlice, to);
            if (list.length == 0) {
                site.rssStartSlice = 0;
                to = site.rssStartSlice + limit;
                list = site.articlesList.filter((a) => a.$imageURL && a.host.like(filter)).slice(site.rssStartSlice, to);
            }
        }

        let urls = '';
        list.forEach((doc, i) => {
            let url = domain + '/article/' + doc.guid;
            let date = site.getDateTime(doc.publishDate).toISOString();
            let title = site.escapeXML(doc.$title);
            let description = site.escapeXML(doc.$content);
            let hashTag = ' #torrent';
            if (doc.$yts) {
                doc.$tagsList.forEach((tag) => {
                    hashTag += '  #' + tag.replace('-', '_');
                });
                hashTag += ' Download Torrents Movies in High Qualtiy 720p , 1080p , 2k , 4k , 8k';
            }

            urls += `
        <item>
          <guid>${doc.guid}</guid>
          <title>${title}</title>
          <link>${url}</link>
          <image>${domain}/article-image/${doc.guid}</image>
          <description>${description + hashTag}</description>
          <pubDate>${date}</pubDate>
        </item>
        `;
        });
        let channelTitle = lang.siteName + ' ' + text + ' [ from ' + site.rssStartSlice + ' to ' + (site.rssStartSlice + limit) + ' ] of ' + site.articlesList.length + ' Article Global RSS';
        let xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
            <title>${channelTitle}</title>
            <link>${domain}</link>
            <description>${lang.siteName} Articles Rss Feeds</description>
            ${urls}
        </channel>
     </rss>`;
        res.set('Content-Type', 'application/xml');
        res.end(xml);
        site.rssStartSlice += limit;
    });

    site.facebookPost = null;
    site.getRssXmlString = function (list, domain, siteName) {
        let urls = '';
        list.forEach((doc) => {
            let hashTag = '#torrent ';
            doc.$tagsList.forEach((tag) => {
                hashTag += '  #' + tag.replace('-', '_');
            });

            urls += `
      <item>
        <guid>${doc.guid}</guid>
        <title>${doc.$title}</title>
        <link>${doc.full_url}</link>
        <image>${domain}/article-image/${doc.guid}</image>
        <description>
          <![CDATA[
            ${doc.$content}
            ${hashTag}
            Download Free Movies Torrents ( 720p , 1080p , 2k , 4k , 8k )  
          ]]>
        </description>
        <pubDate>${doc.$date2}</pubDate>
      </item>
      `;
        });
        let xml = `<?xml version="1.0" encoding="UTF-8" ?>
                <rss version="2.0">
                  <channel>
                        <title> ${siteName} Global RSS</title>
                        <link>${domain}</link>
                        <description>${siteName} Articles Rss Feeds</description>
                        ${urls}
                    </channel>
                </rss>`;
        return xml;
    };

    site.onGET({ name: ['/rss-facebook'], public: true }, (req, res) => {
        let text = ' Facebook RSS ';
        let setting = site.getSiteSetting(req.host);
        let lang = setting.languageList[0];
        let domain = 'https://' + req.host;

        if (site.facebookPost && site.facebookPost.$facebookDate && (new Date().getTime() - site.facebookPost.$facebookDate.getTime()) / 1000 < 60 * 15) {
            res.set('Content-Type', 'application/xml');
            res.end(site.getRssXmlString([site.facebookPost], domain, lang.siteName + text));
            return;
        }

        let filter = site.getHostFilter(req.host);

        if (filter.indexOf('*') !== -1) {
            filter = filter.split('*');
            filter.forEach((n, i) => {
                filter[i] = site.escapeRegx(n);
            });
            filter = filter.join('.*');
        } else {
            filter = site.escapeRegx(filter);
        }
        filter = '^' + filter + '$';

        site.$articles.find({ host: new RegExp(filter, 'gium'), facebookPost: { $exists: false } }, (err, doc) => {
            if (!err && doc) {
                doc.facebookPost = true;
                site.$articles.update(doc);
                doc = site.handleArticle({ ...doc });
                site.articlesList.push(doc);
                doc.$facebookDate = new Date();
                doc.full_url = domain + '/article/' + doc.guid;
                doc.$date2 = site.getDateTime(doc.publishDate).toISOString();

                site.facebookPost = doc;

                res.set('Content-Type', 'application/xml');
                res.end(site.getRssXmlString([site.facebookPost], domain, lang.siteName + text));
            } else {
                res.set('Content-Type', 'application/xml');
                res.end(site.getRssXmlString([], domain, lang.siteName + text));
            }
        });
    });
    site.onGET({ name: ['/rss-pin'], public: true }, (req, res) => {
        let text = ' Pin RSS ';
        let setting = site.getSiteSetting(req.host);
        let lang = setting.languageList[0];
        let domain = 'https://' + req.host;

        if (site.pinPost && site.pinPost.$pinDate && (new Date().getTime() - site.pinPost.$pinDate.getTime()) / 1000 < 60 * 15) {
            res.set('Content-Type', 'application/xml');
            res.end(site.getRssXmlString([site.pinPost], domain, lang.siteName + text));
            return;
        }

        let filter = site.getHostFilter(req.host);

        if (filter.indexOf('*') !== -1) {
            filter = filter.split('*');
            filter.forEach((n, i) => {
                filter[i] = site.escapeRegx(n);
            });
            filter = filter.join('.*');
        } else {
            filter = site.escapeRegx(filter);
        }
        filter = '^' + filter + '$';

        site.$articles.find({ host: new RegExp(filter, 'gium'), pinPost: { $exists: false } }, (err, doc) => {
            if (!err && doc) {
                doc.pinPost = true;
                site.$articles.update(doc);
                doc = site.handleArticle({ ...doc });
                site.articlesList.push(doc);
                doc.$pinDate = new Date();
                doc.full_url = domain + '/article/' + doc.guid;
                doc.$date2 = site.getDateTime(doc.publishDate).toISOString();

                site.pinPost = doc;

                res.set('Content-Type', 'application/xml');
                res.end(site.getRssXmlString([site.pinPost], domain, lang.siteName + text));
            } else {
                res.set('Content-Type', 'application/xml');
                res.end(site.getRssXmlString([], domain, lang.siteName + text));
            }
        });
    });
    site.onGET({ name: ['/feed'], public: true }, (req, res) => {
        let limit = req.query.limit || 10;
        let list = [];
        let text = '';
        let filter = site.getHostFilter(req.host);
        let setting = site.getSiteSetting(req.host);

        let lang = setting.languageList[0];
        let domain = 'https://' + req.host;
        if (req.params.guid == 'random') {
            list = site.articlesList.filter((a) => a.active && a.host.like(filter));
            list = [list[site.random(0, list.length - 1)]];
        } else if (req.params.guid) {
            list = [site.articlesList.find((p) => p.guid == req.params.guid)];
        } else {
            list = site.articlesList.filter((a) => a.active && a.host.like(filter)).slice(0, limit);
        }

        let urls = '';
        list.forEach((doc, i) => {
            $url = domain + '/article/' + doc.guid + '/' + doc.$title2;
            $date = site.getDateTime(doc.publishDate).toUTCString();
            urls += `
        <item>
          <guid isPermaLink="false">${doc.guid}</guid>
          <title>${doc.$title}</title>
          <link>${$url}</link>
          <description>${doc.$description}</description>
          <content:encoded>
            <![CDATA[
              <img src="${domain}/article-image/${doc.guid}" />
              <p> ${doc.$description} </p>
            ]]>
          </content:encoded> 
          <pubDate>${$date}</pubDate>
        </item>
        `;
        });
        let xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" 
    xmlns:atom="http://www.w3.org/2005/Atom" 
    xmlns:content="http://purl.org/rss/1.0/modules/content/">
      <channel>
            <title> ${lang.siteName} ${text} Global RSS</title>
            <link>${domain}</link>
            <atom:link href="${domain}/feed" rel="self" type="application/rss+xml" />
            <description>${lang.siteName} Articles Rss Feeds</description>
            ${urls}
        </channel>
     </rss>`;
        res.set('Content-Type', 'application/xml');
        res.end(xml);
    });
    site.onGET({ name: ['/sitemap.xml'], public: true }, (req, res) => {
        let domain = 'https://' + req.host;
        let urls = '';
        let page = parseInt(req.query.page || 0);
        let limit = 1000;
        let where = {};
        let filter = site.getHostFilter(req.host);

        where = { host: site.getRegExp(filter) };

        site.$articles.findMany(
            { sort: { id: 1 }, skip: limit * page, limit: limit, where: where, select: { id: 1, guid: 1, publishDate: 1 } },
            (err, docs) => {
                if (!err && docs) {
                    limit = docs.length;
                    docs.forEach((article, i) => {
                        let $url = domain + '/article/' + article.guid;
                        let $date = site.getDateTime(article.publishDate).toISOString();
                        urls += `
              <url>
                  <loc>${$url}</loc>
                  <lastmod>${$date}</lastmod>
                  <changefreq>monthly</changefreq>
                  <priority>0.${i}</priority>
              </url>
              `;
                    });
                } else {
                    console.log(where);
                }
                let xml = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url>
            <loc>${domain}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>always</changefreq>
            <priority>1</priority>
          </url>
           ${urls}
        </urlset> 
        `;
                res.set('Content-Type', 'application/xml');
                res.end(xml);
            },
            true,
        );

        //   site.articlesList
        //     .filter((a) => a.host.like(filter))
        //     .slice(0, 10000)
        //     .forEach((article, i) => {
        //       let $url = domain + "/article/" + article.guid + "/" + article.$title2;
        //       let $date = site.getDateTime(article.publishDate).toISOString();
        //       urls += `
        //             <url>
        //                 <loc>${$url}</loc>
        //                 <lastmod>${$date}</lastmod>
        //                 <changefreq>monthly</changefreq>
        //                 <priority>0.${i}</priority>
        //             </url>
        //             `;
        //     });
        //   let xml = `<?xml version="1.0" encoding="UTF-8"?>
        //                     <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        //                     <url>
        //                     <loc>${domain}</loc>
        //                     <lastmod>${new Date().toISOString()}</lastmod>
        //                     <changefreq>always</changefreq>
        //                     <priority>1</priority>
        //                 </url>
        //                        ${urls}
        //                     </urlset>
        //                     `;
        //   res.set("Content-Type", "application/xml");
        //   res.end(xml);
    });
};
