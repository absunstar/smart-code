module.exports = function init(site) {
  const $messages = site.connectCollection('messages');

  site.message_list = [];
  $messages.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.message_list = [...site.message_list, ...docs];
    }
  });

  setInterval(() => {
    site.message_list.forEach((m, i) => {
      if (m.$add) {
        $messages.add(m, (err, doc) => {
          if (!err && doc) {
            site.message_list[i] = doc;
          }
        });
      } else if (m.$update) {
        $messages.edit({
          where: {
            id: m.id,
          },
          set: m,
        });
      } else if (m.$delete) {
        $messages.delete({
          id: m.id,
        });
      }
    });
  }, 1000 * 3);

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'messages',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/messages/add', (req, res) => {
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }
    
    let response = {
      done: true,
    };
    let messages_doc = {
      users_list: [
        {
          id: req.session.user.id,
          profile: req.session.user.profile,
          email: req.session.user.email,
        },
        {
          id: req.body.user.id,
          profile: req.body.user.profile,
          email: req.body.user.email,
        },
      ],
      messages_list: [
        {
          date: new Date(),
          message: req.body.message,
          user_id: req.session.user.id,
          user_name: req.session.user.profile.name,
          image_url: req.session.user.profile.image_url,
          show: false,
        },
      ],
    };
    messages_doc.$req = req;
    messages_doc.$res = res;
    messages_doc.$add = true;
    site.message_list.push(messages_doc);

    res.json(response);
  });

  site.post('/api/messages/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let messages_doc = req.body;

    messages_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (messages_doc.user) {
      let found = false;
      let index = 0;
      site.message_list.forEach((m, i) => {
        if (m.users_list.some((u) => u.id === messages_doc.user.id) && m.users_list.some((u) => u.id === req.session.user.id)) {
          found = true;
          index = i;
        }
      });

      if (found) {
        let message = site.message_list.find((_msg, i) => {
          return index === i;
        });
        
        message.messages_list.push({
          date: new Date(),
          message: req.body.message,
          user_id: req.session.user.id,
          user_name: req.session.user.profile.name,
          image_url: req.session.user.profile.image_url,
          show: false,
        });
        message.$update = true;
        site.message_list[index] = message;
      } else {
        let msg_doc = {
          users_list: [
            {
              id: req.session.user.id,
              profile: req.session.user.profile,
              email: req.session.user.email,
            },
            {
              id: req.body.user.id,
              profile: req.body.user.profile,
              email: req.body.user.email,
            },
          ],
          messages_list: [
            {
              date: new Date(),
              message: req.body.message,
              user_id: req.session.user.id,
              user_name: req.session.user.profile.name,
              image_url: req.session.user.image_url,
              show: false,
            },
          ],
        };
        msg_doc.$add = true;
        site.message_list.push(msg_doc);
      }
    } else {
      messages_doc.$update = true;
      site.message_list.forEach((a, i) => {
        if (a.id === messages_doc.id) {
          site.message_list[i] = messages_doc;
        }
      });
    }
    response.done = true;
    res.json(response);
  });

  site.post('/api/messages/show', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let messages_doc = req.body;

      
      site.message_list.forEach((a, i) => {
        if (a.id === messages_doc.id) {
          let found_update = false;
          site.message_list[i].messages_list.forEach(_m => {
            if(_m.user_id == req.session.user.id) {
              _m.show = true;
              found_update = true;
            }
          });
          if(found_update){
            site.message_list[i].$update = true;
          }
          response.doc = site.message_list[i];
        }
      });
    
    response.done = true;
    res.json(response);
  });

  site.post('/api/messages/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let message = null;
    site.message_list.forEach((a) => {
      if (a.id == req.body.id) {
        message = a;
      }
    });

    if (message) {
      response.done = true;
      response.doc = message;
      res.json(response);
    } else {
      res.json(response);
    }
  });

  site.post('/api/messages/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    site.message_list.forEach((a) => {
      if (req.body.id && a.id === req.body.id) {
        a.$delete = true;
      }
    });
    response.done = true;
    res.json(response);
  });

  site.post('/api/messages/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i');
    }

    $messages.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: req.body.limit,
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true;
          docs.forEach(_doc => {
            _doc.messages_list.forEach(_m => {
              if(_m.user_id == req.session.user.id && !_m.show) {
                _doc.$new = true;
              }
            });
          });
          response.list = docs;
          response.count = count;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.getMessages = function (req, callback) {
    callback = callback || {};
    let where = {};
    $messages.findMany(
      {
        where: where,
        sort: { id: -1 },
      },
      (err, docs) => {
        if (!err && docs) callback(docs);
        else callback(false);
      }
    );
  };
};
