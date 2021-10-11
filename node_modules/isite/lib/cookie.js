module.exports = function init(req, res, ____0) {
  let cookie = function (key, value, options) {
    if ((key, value)) {
      return cookie.set(key, value, options);
    } else {
      return cookie.get(key);
    }
  };

  cookie.parse = (cookies) => {
    let obj = {};
    if (!cookies) {
      return obj;
    }
    cookies.split(';').forEach(function (cookie) {
      var parts = cookie.split('=');
      if (parts[0] && parts[1]) {
        obj[parts.shift().trim()] = decodeURI(parts.join('='));
      }
    });
    return obj;
    // return cookie.split(';').reduce(function (prev, curr) {
    //   let m = / *([^=]+)=(.*)/.exec(curr);
    //   if (m) {
    //     let key = m[1];
    //     let value = decodeURIComponent(m[2]);
    //     prev[key] = value;
    //   }
    //   return prev;
    // }, {});
  };

  cookie.stringify = (co) => {
    let out = '';

    out += co.key + '=' + encodeURIComponent(co.value) + ';path=' + co.options.path;
    if (co.options.expires > 0) {
      out += '; expires=' + new Date(new Date().getTime() + 1000 * 60 * co.options.expires).toUTCString();
    }

    return out;
  };

  cookie.obj = cookie.parse(req.headers.cookie || '');
  cookie.newList = [];
  cookie.write = () => {
    let csList = [];

    for (let i = 0; i < cookie.newList.length; i++) {
      let cs = cookie.stringify(cookie.newList[i]);
      if (cs) {
        csList.push(cs);
      }
    }
    res.set('Set-Cookie', csList);
  };

  cookie.set = function (key, value, _options) {
    let options = Object.assign(
      {
        expires: ____0.options.session.timeout,
        path: '/',
      },
      _options,
    );

    cookie.newList.push({
      key: key,
      value: value,
      options: options,
    });
  };

  cookie.get = function (key) {
    let value = cookie.obj[key];
    if (typeof value == 'undefined') {
      return null;
    }
    return value;
  };

  return cookie;
};
