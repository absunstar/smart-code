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
  },
  (req, res) => {
    res.render(
      'messages/index.html',
      { title: site.setting.title, image_url: site.setting.logo, description: site.setting.description },
      {
        parser: 'html css js',
        compress: true,
      }
    );
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
      messages_list: [
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

    messages_doc.sender = {
      id: req.session.user.id,
      name: req.session.user.profile.name,
      last_name: req.session.user.profile.last_name,
      email: req.session.user.email,
      image_url: req.session.user.profile.image_url,
    };
    let found = false;
    let index = 0;
    site.message_list.forEach((m, i) => {
      if (m.users_list.some((u) => u && u.id === messages_doc.sender.id) && m.users_list.some((u) => u && u.id === messages_doc.receiver.id)) {
        found = true;
        index = i;
      }
    });

    site.security.getUser(
      {
        id: messages_doc.receiver.id
      },
      (err, receiver_doc) => {
        if (!err && receiver_doc) {
          if (found) {
            let message = site.message_list.find((_msg, i) => {
              return index === i;
            });

            message.messages_list.push({
              date: new Date(),
              message: req.body.message,
              user_id: messages_doc.sender.id,
              show: false,
            });
            message.$update = true;
            message.$message = req.body.message;
            message.$user_id = req.session.user.id;
            site.message_list[index] = message;
            response.doc = site.message_list[index];
            receiver_doc.message_count = receiver_doc.message_count || 0;
            receiver_doc.message_count += 1;
          } else {
            let msg_doc = {
              users_list: [messages_doc.sender, messages_doc.receiver],
              messages_list: [
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
            site.message_list.push(msg_doc);
            receiver_doc.message_count = receiver_doc.message_count || 0;
            receiver_doc.message_count += 1;
          }
          site.security.updateUser(receiver_doc);

          response.done = true;
          res.json(response);
        }
      })

    // } else {
    //   messages_doc.$update = true;
    //   messages_doc.$message = req.body.message;
    //   site.message_list.forEach((a, i) => {
    //     if (a.id === messages_doc.id) {
    //       site.message_list[i] = messages_doc;
    //     }
    //   });
    // }

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
    site.message_list.forEach((m) => {
      let found = false;
      m.users_list.forEach((_u, i) => {
        if (_u && _u.id == req.session.user.id) {
          _u.name = req.session.user.profile.name;
          _u.last_name = req.session.user.profile.last_name;
          _u.email = req.session.user.email;
          _u.image_url = req.session.user.profile.image_url;
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
    let user_receiver = messages_doc.users_list.find(el => el.id == req.session.user.id);
    site.security.getUser(
      {
        id: user_receiver.id
      },
      (err, receiver_doc) => {
        if (!err && receiver_doc) {
          site.message_list.forEach((a, i) => {
            if (a.id === messages_doc.id) {
              let found_update = false;
              site.message_list[i].messages_list.forEach((_m) => {
                if (_m.user_id != req.session.user.id && !_m.show) {
                  _m.show = true;
                  found_update = true;
                  if(receiver_doc.message_count){
                    receiver_doc.message_count -= 1;
                  }
                }
              });
              if (found_update) {
                site.message_list[i].$show = true;
                site.message_list[i].$update = true;
              }
              response.doc = site.message_list[i];
            }
          });
          site.security.updateUser(receiver_doc);
          response.done = true;
          res.json(response);
        }
      });
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
          docs.forEach((_doc) => {
            _doc.messages_list.forEach((_m) => {
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
