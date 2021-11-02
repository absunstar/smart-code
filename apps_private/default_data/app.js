module.exports = function init(site) {
    const $items_group = site.connectCollection('items_group');
    const $stores_items = site.connectCollection('stores_items');
    let default_items_group = [];
    let default_stores_items = [];

    site.onGET('/api/default/items_group', (req, res) => {
        site.fetch('https://raw.githubusercontent.com/absunstar/smart-apps/main/database/abo-omar/items_group.json', {
            mode: 'no-cors',
            headers: {
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.9,ar;q=0.8',
                'cache-control': 'max-age=0',
                dnt: 1,
                'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'none',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': 1,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
            },
            agent: function (_parsedURL) {
                if (_parsedURL.protocol == 'http:') {
                    return new site.http.Agent({
                        keepAlive: true,
                    });
                } else {
                    return new site.https.Agent({
                        keepAlive: true,
                    });
                }
            },
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                default_items_group = data || [];
                res.json({
                    done: true,
                    docs: data || [],
                });
            });
    });

    site.onPOST('/api/default/items_group', (req, res) => {
        
        $items_group.deleteAll({}, () => {
            default_items_group.forEach((g0) => {
                let g = { ...g0 };
                g.company = site.get_company(req);
                g.branch = site.get_branch(req);
                $items_group.add(g, (err, doc) => {
                    if (err) {
                        console.error(err);
                    }
                });
            });
        });
        res.json({
            done: true,
        });
    });

    site.onGET('/api/default/stores_items', (req, res) => {

        site.fetch('https://raw.githubusercontent.com/absunstar/smart-apps/main/database/abo-omar/stores_items.json', {
            mode: 'no-cors',
            headers: {
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.9,ar;q=0.8',
                'cache-control': 'max-age=0',
                dnt: 1,
                'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'none',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': 1,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
            },
            agent: function (_parsedURL) {
                if (_parsedURL.protocol == 'http:') {
                    return new site.http.Agent({
                        keepAlive: true,
                    });
                } else {
                    return new site.https.Agent({
                        keepAlive: true,
                    });
                }
            },
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                default_stores_items = data || [];
                res.json({
                    done: true,
                });
            });

       
    });

    site.onPOST('/api/default/stores_items', (req, res) => {
        $stores_items.deleteAll({}, () => {
            default_stores_items.forEach((g0) => {
                let g = { ...g0 };
                g.company = site.get_company(req);
                g.branch = site.get_branch(req);
                $stores_items.add(g, (err, doc) => {
                    if (err) {
                        console.error(err);
                    }
                });
            });
        });
        res.json({
            done: true,
        });
    });
};
