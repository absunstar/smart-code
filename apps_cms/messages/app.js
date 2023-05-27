module.exports = function init(site) {
  const $messages = site.connectCollection('messages');

  site.messageList = [];
  $messages.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.messageList = [...site.messageList, ...docs];
    }
  });

  setInterval(() => {
    site.messageList.forEach((m, i) => {
      if (m.$add) {
        let message = m.$message;
        $messages.add(m, (err, doc) => {
          if (!err && doc) {
            site.call('[notific][private_messages]', {
              user: doc.users_list[1],
              user_action: doc.users_list[0],
              action: {
                id: doc.id,
                name: message,
              },
            });
          }
        });
      } else if (m.$update) {
        let message = m.$message;
        if (!m.$show) {
          let obj = {
            action: {
              id: m.id,
              name: message,
            },
          };

          m.users_list.forEach((_u) => {
            if (_u && m.$user_id == _u.id) {
              obj.user_action = _u;
            } else {
              obj.user = _u;
            }
          });
          site.call('[notific][private_messages]', obj);
        }

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
          id: req.body.receiver.id,
          profile: req.body.receiver.profile,
          email: req.body.receiver.email,
        },
      ],
      messagesList: [
        {
          date: new Date(),
          message: req.body.message,
          user_id: req.session.user.id,
          show: false,
        },
      ],
    };
    messages_doc.$message = req.body.message;
    messages_doc.$req = req;
    messages_doc.$res = res;
    messages_doc.$add = true;
    site.messageList.push(messages_doc);

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

    messages_doc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    messages_doc.sender = {
      id: req.session.user.id,
      name: req.session.user.profile.name,
      lastName: req.session.user.profile.lastName,
      email: req.session.user.email,
      image: req.session.user.profile.image,
    };
    let found = false;
    let index = 0;
    site.messageList.forEach((m, i) => {
      if (m.users_list.some((u) => u && u.id === messages_doc.sender.id) && m.users_list.some((u) =>u && u.id === messages_doc.receiver.id)) {
        found = true;
        index = i;
      }
    });

    if (found) {
      let message = site.messageList.find((_msg, i) => {
        return index === i;
      });

      message.messagesList.push({
        date: new Date(),
        message: req.body.message,
        user_id: messages_doc.sender.id,
        show: false,
      });
      message.$update = true;
      message.$message = req.body.message;
      message.$user_id = req.session.user.id;
      site.messageList[index] = message;
      response.doc = site.messageList[index];
    } else {
      let msg_doc = {
        users_list: [messages_doc.sender, messages_doc.receiver],
        messagesList: [
          {
            date: new Date(),
            message: req.body.message,
            user_id: messages_doc.sender.id,
            show: false,
          },
        ],
      };
      msg_doc.$add = true;
      msg_doc.$message = req.body.message;
      site.messageList.push(msg_doc);
    }
    // } else {
    //   messages_doc.$update = true;
    //   messages_doc.$message = req.body.message;
    //   site.messageList.forEach((a, i) => {
    //     if (a.id === messages_doc.id) {
    //       site.messageList[i] = messages_doc;
    //     }
    //   });
    // }
    response.done = true;
    res.json(response);
  });

  site.post('/api/messages/user_data', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let id = req.body.id;
    site.messageList.forEach((m) => {
      let found = false;
      m.users_list.forEach((_u, i) => {
        if (_u && _u.id == req.session.user.id) {
          _u.name = req.session.user.profile.name;
          _u.lastName = req.session.user.profile.lastName;
          _u.email = req.session.user.email;
          _u.image = req.session.user.profile.image;
          found = true;
        }
      });
      if (found) {
        m.$update;
      }
    });

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
    site.messageList.forEach((a, i) => {
      if (a.id === messages_doc.id) {
        let found_update = false;
        site.messageList[i].messagesList.forEach((_m) => {
          if (_m.user_id != req.session.user.id) {
            _m.show = true;
            found_update = true;
          }
        });
        if (found_update) {
          site.messageList[i].$show = true;
          site.messageList[i].$update = true;
        }
        response.doc = site.messageList[i];
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
    site.messageList.forEach((a) => {
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

    site.messageList.forEach((a) => {
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
          docs.forEach((_doc) => {
            _doc.messagesList.forEach((_m) => {
              if (_m.user_id != req.session.user.id && !_m.show) {
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
