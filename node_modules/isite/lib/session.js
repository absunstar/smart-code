module.exports = function init(req, res, ____0, callback) {
  let session = function (key, value) {
    if (value === undefined) {
      return session.get(key);
    } else {
      session.set(key, value);
    }
  };

  session.save = function () {
    session.$changed = !0;
    session = ____0.sessions.handle(session);
  };

  session.set = function (key, value) {
    key = key.toLowerCase();
    for (var i = 0; i < session.data.length; i++) {
      var obj = session.data[i];
      if (obj.key === key) {
        session.data[i] = {
          key: key,
          value: ____0.copy(value),
        };
        session.save();
        return;
      }
    }

    session.data.push({
      key: key,
      value: ____0.copy(value),
    });

    session.save();
  };

  session.get = function (key) {
    key = key.toLowerCase();
    for (var i = 0; i < session.data.length; i++) {
      var d = session.data[i];
      if (key.indexOf('.') != -1) {
        if (d.key == key.split('.')[0]) {
          return ____0.fromJson(____0.copy(session.data[i].value))[key.split('.')[1]];
          break;
        }
      } else {
        if (d.key == key) {
          return ____0.copy(session.data[i].value);
          break;
        }
      }
    }
    return null;
  };

  session.accessToken = req.cookie('access_token');
  session.browserToken = req.cookie('browser_token');

  if (!session.accessToken) {
    session.accessToken = new Date().getTime().toString() + '_' + Math.random() * (10000 - 1000) + 1000;
    session.accessToken = ____0.x0md50x(session.accessToken);
    res.cookie('access_token', session.accessToken);
  }
  if (!session.browserToken) {
    session.browserToken = new Date().getTime().toString() + '_' + Math.random() * (10000 - 1000) + 1000;
    session.browserToken = ____0.x0md50x(session.browserToken);
    res.cookie('browser_token', session.browserToken, {
      expires: 60 * 24 * 365 * 10,
    });
  }

  session.ip = req.ip;
  session.modifiedTime = new Date().getTime();
  session.save();

  function AssignFeatures() {
    req.features = [];
    ____0.options.defaults.features.forEach((f) => {
      req.features.push(f);
    });
    ____0.features.forEach((f) => {
      req.features.push(f.name);
    });
    if (____0.options.dynamic) {
      req.features.push('site.dynamic');
    }
    req.features.push('ip.' + req.ip);

    if (req.headers['host']) {
      req.features.push('host.' + req.headers['host']);
      req.headers['host'].split('.').forEach((h) => {
        req.features.push('host.' + h);
      });
    }

    if (req.cookies.obj && req.cookies.obj['_ga'] && req.cookies.obj['_ga'].contains('sb')) {
      req.features.push('browser.social');
      req.features.push('browser.social.app');
    }
    if (req.cookies.obj && req.cookies.obj['_gab'] && req.cookies.obj['_gab'].contains('sb')) {
      req.features.push('browser.social');
      req.features.push('browser.social.app');
    }
    if (req.headers['x-browser'] && req.headers['x-browser'].contains('social-browser')) {
      req.features.push('browser.social');
      req.features.push('browser.social.app');
    }

    if (req.headers['user-agent']) {
      req.userAgent = req.headers['user-agent'].toLowerCase();
      req.features.push('user-agent.' + req.userAgent);
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(req.userAgent)) {
        req.features.push('os.mobile');
      } else {
        req.features.push('os.desktop');
      }

      if (req.userAgent.contains('windows')) {
        req.features.push('os.windows');
        if (req.userAgent.contains('windows nt 5.1')) {
          req.features.push('os.windowsxp');
        } else if (req.userAgent.contains('windows nt 6.1')) {
          req.features.push('os.windows7');
        } else if (req.userAgent.contains('windows nt 6.2') || req.userAgent.contains('windows nt 6.3')) {
          req.features.push('os.windows8');
        } else if (req.userAgent.contains('windows nt 6.4') || req.userAgent.contains('windows nt 10')) {
          req.features.push('os.windows10');
        } else {
        }
      } else if (req.userAgent.contains('linux')) {
        req.features.push('os.linux');
      } else if (req.userAgent.contains('macintosh')) {
        req.features.push('os.mac');
      } else if (req.userAgent.contains('android')) {
        req.features.push('os.android');
      } else {
        req.features.push('os.unknown');
      }

      if (req.userAgent.contains('edge')) {
        req.features.push('browser.edge');
      } else if (req.userAgent.contains('firefox')) {
        req.features.push('browser.firefox');
      } else if (req.userAgent.contains('opr')) {
        req.features.push('browser.opera');
      } else if (req.userAgent.contains('ucbrowser')) {
        req.features.push('browser.ucbrowser');
      } else if (req.userAgent.contains('bdbrowser') || req.userAgent.contains('baidu') || req.userAgent.contains('baidubrowser')) {
        req.features.push('browser.baidu');
      } else if (req.userAgent.contains('chromium')) {
        req.features.push('browser.chromium');
      } else if (req.userAgent.contains('chrome')) {
        req.features.push('browser.chrome');
      } else {
        req.features.push('browser.unknown');
      }
    }
  }

  function ipInfo(session, callback) {
    callback(session);

    if (session.busy) {
      return;
    }
    session.busy = !0;
    session.save();
    if (session.ip_info.status != 'success' || session.ip_info.id != session.ip) {
      //session.ip = session.ip == "127.0.0.1" ? "45.22.11.33" : "127.0.0.1"
      ____0
        .fetch(`http://ip-api.com/json/${session.ip}`, {
          method: 'get',
          headers: { 'Content-Type': 'application/json' },
        })
        .then((res) => res.json())
        .then((info) => {
          info.date = new Date();
          session.set('ip_' + session.ip, info);
          session.ip_info = info;
          session.save();
          setTimeout(() => {
            session.busy = !1;
            session.save();
          }, 1000 * 30);
        })
        .catch((err) => {
          setTimeout(() => {
            session.busy = !1;
            session.save();
          }, 1000 * 30);
        });
    }
  }
  
  AssignFeatures();

  req.hasFeature = function (name) {
    for (let i = 0; i < req.features.length; i++) {
      if (req.features[i] == name) {
        return !0;
      }
    }
    return !1;
  };

  session.user_id = session('user_id');

  if (____0.security && session.user_id) {
    ____0.security.getUser(
      {
        id: session.user_id,
      },
      function (err, user) {
        session.user = user;
        if (session.user) {
          if (!session.user.permissions) {
            session.user.permissions = [];
          }
          req.features.push('login');
        }
        ipInfo(session, callback);
      },
    );
  } else {
    ipInfo(session, callback);
  }
};
