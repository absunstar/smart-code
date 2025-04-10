module.exports = function init(site) {
    const $siteSetting = site.connectCollection('siteSetting');
    const hostManager = site.connectApp({ name: 'hosts', allowMemory: true, sort: { id: 1 } });

    site.settingList = [];

    $siteSetting.findAll({ where: {}, select: {}, sort: { id: 1 } }, (err, docs) => {
        if (!err && docs && docs.length > 0) {
            docs.forEach((doc) => {
                if (!doc.article.articleTypes) {
                    doc.article.articleTypes = site.articleTypes;
                }

                if (!doc.article.languages) {
                    doc.article.languages = [...site.supportedLanguageList];
                }

                if (!doc.languageList) {
                    doc.languageList = [...site.supportedLanguageList];
                } else {
                    doc.languageList.forEach((lang, i) => {
                        doc.languageList[i] = { ...doc.languageList[i], ...site.supportedLanguageList[i] };
                    });
                }
                site.settingList.push({ ...doc });
            });
            site.defaultSetting = { ...site.defaultSetting, ...site.settingList[0] };
        } else {
            $siteSetting.add(site.defaultSetting, (err, doc) => {
                if (!err && doc) {
                    site.settingList.push({ ...doc });
                    site.defaultSetting = { ...site.defaultSetting, ...site.settingList[0] };
                }
            });
        }
    });

    site.supportedLanguageList = [
        {
            id: 'Ar',
            name: 'عربي',
            direction: 'rtl',
        },
        {
            id: 'En',
            name: 'English',
            direction: 'ltr',
        },
        {
            id: 'FR',
            name: 'French',
            direction: 'ltr',
        },
        {
            id: 'TR',
            name: 'Turki',
            direction: 'rtl',
        },
    ];

    site.articleTypes = [
        {
            id: 1,
            En: 'Standred',
            Ar: 'افتراضى',
        },
        {
            id: 2,
            En: 'advanced',
            Ar: 'متطور',
        },
        {
            id: 3,
            En: 'Multi-Paragraph',
            Ar: 'متعدد الفقرات',
        },
        {
            id: 4,
            En: 'Multi-Paragraph advanced',
            Ar: 'متعدد الفقرات متطور',
        },
        {
            id: 5,
            En: 'Multi-Image',
            Ar: 'متعدد الصور',
        },
        {
            id: 6,
            En: 'google-news',
            Ar: 'أخبار جوجل',
        },
        {
            id: 7,
            En: 'yts-movie',
            Ar: 'yts-movie',
        },
        {
            id: 8,
            En: 'Youtube Video',
            Ar: 'Youtube Video',
        },
        {
            id: 9,
            En: 'Facebook Post',
            Ar: 'Facebook Post',
        },
    ];
    site.publishingSystem = [
        {
            id: 1,
            En: 'Immediately',
            Ar: 'فوري',
        },
        {
            id: 2,
            En: 'By User',
            Ar: 'بواسطة المستخدم',
        },
    ];
    site.closingSystem = [
        {
            id: 1,
            En: 'After a specified period',
            Ar: 'بعد مدة محددة',
        },
        {
            id: 2,
            En: 'By User',
            Ar: 'بواسطة المستخدم',
        },
        {
            id: 3,
            En: 'For Ever',
            Ar: 'الى الابد',
        },
    ];

    site.siteColor = [
        {
            id: '#d7373f',
            En: 'Red',
            Ar: 'أحمر',
        },
        {
            id: '#2196f3',
            En: 'Blue',
            Ar: 'أزرق',
        },
        {
            id: '#8bc34a',
            En: 'Green',
            Ar: 'أخضر',
        },
        {
            id: '#272727',
            En: 'Black',
            Ar: 'أسود',
        },
    ];
    site.articleStatus = [
        {
            id: 1,
            En: 'Active',
            Ar: 'نشط',
        },
        {
            id: 2,
            En: 'Under review',
            Ar: 'قيد المراجعة',
        },
        {
            id: 3,
            En: 'Forbidden',
            Ar: 'محظور',
        },
    ];
    site.durationExpiry = [
        {
            id: 1,
            En: 'Hour',
            Ar: 'ساعة',
        },
        {
            id: 2,
            En: 'Day',
            Ar: 'يوم',
        },
        {
            id: 3,
            En: 'Month',
            Ar: 'شهر',
        },
    ];
    site.defaultSetting = {
        host: '',
        lengthOrder: 0,
        siteTemplate: { id: 1 },
        mainCategoryList: [],
        programming: {},
        languageList: [],
        article: {
            articleTypes: site.articleTypes,
        },
        block: {},
        siteColor1: '#272727',
        siteColor2: '#d7373f',
        siteColor3: '#8bc34a',
        siteColor4: '#8bc34a',
        siteBackground1: '#d9d9d9',
        siteBackground2: '#000000',
        siteBackground1: '#ffffff',
        siteBackground3: '#ffffff',
        siteBackground4: '#ffffff',
    };
    site.getHostFilter = function (domain = '') {
        let h = hostManager.memoryList.find((h) => domain.like(h.domain));
        if (h) {
            return h.filter;
        } else {
            return domain;
        }
    };

    site.getSiteSetting = function (host = '') {
        return site.settingList.find((s) => s.host.like(host)) || { ...site.defaultSetting, ...site.settingList[0], host: '' };
    };

    site.supportedLanguageList.forEach((l) => {
        site.defaultSetting.languageList.push({ ...l });
    });

    site.onGET(
        {
            name: 'host-manager',
            require: { permissions: ['login'] },
        },
        (req, res) => {
            let setting = site.getSiteSetting(req.host);
            let language = setting.languageList.find((l) => l.id == req.session.lang) || setting.languageList[0];
            res.render(
                'site-setting/hosts.html',
                {
                    setting: setting,
                    language: language,
                },
                { parser: 'html css js' }
            );
        }
    );

    site.get(
        {
            name: 'site-setting',
            require: { permissions: ['login'] },
        },
        (req, res) => {
            let setting = site.getSiteSetting(req.host);
            let language = setting.languageList.find((l) => l.id == req.session.lang) || setting.languageList[0];

            res.render(
                'site-setting/index.html',
                {
                    language: language,
                    setting: setting,
                    templateList: site.templateList,
                    publishingSystem: site.publishingSystem,
                    closingSystem: site.closingSystem,
                    siteColor: site.siteColor,
                    articleStatus: site.articleStatus,
                    durationExpiry: site.durationExpiry,
                },
                { parser: 'html css js' }
            );
        }
    );

    site.get({
        name: '/images',
        path: __dirname + '/site_files/images',
    });

    site.post({
        name: '/api/location/all',
        path: __dirname + '/site_files/json/location.json',
    });

    site.post('/api/get-site-setting', (req, res) => {
        let response = {
            doc: site.getSiteSetting(req.host),
            done: true,
        };
        res.json(response);
    });

    site.post({ name: '/api/set-site-setting', require: { permissions: ['login'] } }, (req, res) => {
        let response = {
            done: false,
        };
        let data = req.data;
        data.host = data.host || req.host;
        let index = site.settingList.findIndex((s) => s.host == data.host);
        if (index > -1) {
            $siteSetting.update(data, (err, result) => {
                if (!err && result.doc) {
                    response.done = true;
                    site.settingList[index] = { ...site.settingList[index], ...result.doc };
                } else {
                    response.error = err.message;
                }
                res.json(response);
            });
        } else {
            delete data.id;
            delete data._id;
            $siteSetting.add(data, (err, doc) => {
                if (!err && doc) {
                    response.done = true;
                    site.settingList.push({ ...doc });
                }
                res.json(response);
            });
        }
    });
};
