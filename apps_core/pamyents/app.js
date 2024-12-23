module.exports = function init(site) {
  const $payments = site.connectCollection('payments');
  // const axios = require('axios');
  // const { v4: uuidv4 } = require('uuid');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'payments',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/payments_card/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let payments_doc = req.body;
    payments_doc.$req = req;
    payments_doc.$res = res;

    payments_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof payments_doc.active === 'undefined') {
      payments_doc.active = true;
    }

    payments_doc.company = site.get_company(req);
    payments_doc.branch = site.get_branch(req);

    $payments.find(
      {
        where: {
          'company.id': site.get_company(req).id,
          'branch.code': site.get_branch(req).code,
          $or: [
            {
              name_Ar: payments_doc.name_Ar,
            },
            {
              name_En: payments_doc.name_En,
            },
          ],
        },
      },
      (err, doc) => {
        if (!err && doc) {
          response.error = 'Name Exists';
          res.json(response);
        } else {
          let num_obj = {
            company: site.get_company(req),
            screen: 'payments',
            date: new Date(),
          };

          let cb = site.getNumbering(num_obj);
          if (!payments_doc.code && !cb.auto) {
            response.error = 'Must Enter Code';
            res.json(response);
            return;
          } else if (cb.auto) {
            payments_doc.code = cb.code;
          }

          $payments.add(payments_doc, (err, doc) => {
            if (!err) {
              response.done = true;
              response.doc = doc;
            } else {
              response.error = err.message;
            }
            res.json(response);
          });
        }
      }
    );
  });

  site.post('/api/payments/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let payments_doc = req.body;

    payments_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (payments_doc.id) {
      $payments.edit(
        {
          where: {
            id: payments_doc.id,
          },
          set: payments_doc,
          $req: req,
          $res: res,
        },
        (err) => {
          if (!err) {
            response.done = true;
          } else {
            response.error = 'Code Already Exist';
          }
          res.json(response);
        }
      );
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/payments/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $payments.findOne(
      {
        where: {
          id: req.body.id,
        },
      },
      (err, doc) => {
        if (!err) {
          response.done = true;
          response.doc = doc;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/payments/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let id = req.body.id;

    if (id) {
      $payments.delete(
        {
          id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true;
          } else {
            response.error = err.message;
          }
          res.json(response);
        }
      );
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/payments/all', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = req.body.where || {};

    if (where['name_Ar']) {
      where['name_Ar'] = site.get_RegExp(where['name_Ar'], 'i');
    }

    if (where['name_En']) {
      where['name_En'] = site.get_RegExp(where['name_En'], 'i');
    }

    where['company.id'] = site.get_company(req).id;
    // where['branch.code'] = site.get_branch(req).code

    $payments.findMany(
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
          response.list = docs;
          response.count = count;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/payments_card/key', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }
    site.authenticate = async (req, res) => {
      await axios
        .post(
          `${WE_ACCEPT_PAYMENT_BASE_URL}auth/tokens`,
          {
            api_key: WE_ACCEPT_API_KEY,
          },
          { headers: { 'Content-Type': 'application/json' } }
        )
        .then((response) => {
          if (response.data && response.data.token) {
            site.registerOrder(req, res, response.data.token, response.data.profile.id);
          }
        })
        .catch((error) => {
          console.log(error);
          res.send({
            message: 'Authentication failed.',
            error,
          });
        });
    };
  });

  site.post('/api/payments/notification-callback', (req, res) => {
    try {
      let response = {
        done: false,
      };

      if (!req.session.user) {
        response.error = 'Please Login First';
        res.json(response);
        return;
      }

      const type = req.body.type;
      const payload = req.body.obj;
      if (site.getCalculatedHmac(flatten(payload)) != req.query.hmac) {
        res.sendStatus(401);
      } else {
        site.notificationCallback(type, payload, res);
      }
    } catch (error) {
      logger.error('An error occurred in /payments/notification-callback');
      logger.error(error);
    }
  });

  site.post('/api/payments/response-callback', (req, res) => {
    try {
      let response = {
        done: false,
      };

      if (!req.session.user) {
        response.error = 'Please Login First';
        res.json(response);
        return;
      }
      const queryParams = req.query;
      if (site.getCalculatedHmac(queryParams) != req.query.hmac) {
        res.sendStatus(401);
      } else {
        site.responseCallback(queryParams, res);
      }
    } catch (error) {
      logger.error('An error occurred in /payments/response-callback');
      logger.error(error);
    }
  });

  site.registerOrder = async (req, res, token, merchantId) => {
    await axios
      .post(
        `${WE_ACCEPT_PAYMENT_BASE_URL}ecommerce/orders`,
        {
          auth_token: token,
          delivery_needed: false,
          currency: 'EGP',
          merchant_id: merchantId,
          amount_cents: req.body.estimatedCost * 100, // cost in the request is in EGP, gateway requires cost in cents (1 EGP = 100 piasters)
          merchant_order_id: uuidv4(),
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .then((response) => {
        site.generatePaymentKeyWithOrderRegister(req, res, token, response.data.id, response.data.amount_cents, response.data.currency);
      })
      .catch((error) => {
        res.send({
          message: 'Order registration failed.',
          error: JSON.stringify(error),
        });
      });
  };

  site.generatePaymentKeyWithOrderRegister = async (req, res, token, orderId, amountCents, currency) => {
    await axios
      .post(
        `${WE_ACCEPT_PAYMENT_BASE_URL}acceptance/payment_keys`,
        {
          auth_token: token,
          amount_cents: amountCents,
          order_id: orderId,
          currency: currency,
          integration_id: ACCEPT_INTEGRATION_ID,
          billing_data: {
            apartment: 'NA',
            email: req.body.email,
            floor: 'NA',
            first_name: req.body.firstName,
            street: 'NA',
            building: 'NA',
            phone_number: req.body.phoneNumber,
            shipping_method: 'NA',
            postal_code: 'NA',
            city: 'NA',
            country: 'NA',
            last_name: req.body.lastName,
            state: 'NA',
          },
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .then((response) => {
        res.send({ paymentKey: response.data.token });
      })
      .catch((error) => {
        console.log(error);
        res.send({
          message: 'Payment key generation failed.',
          error: JSON.stringify(error),
        });
      });
  };

  site.notificationCallback = async (type, payload, res) => {
    if (payload.success) {
      let obj = {
        orderId: payload.order.merchant_order_id,
        type,
        createdAt: payload.created_at,
        payload,
      };
      // await create(obj);
      if (type === 'TRANSACTION' && payload.success) {
        $payments.add(obj, function (err, cat) {
          if (err) res.status(500).send(err);
          else res.status(201).send(obj);
        });
      } else {
        res.send('Received failed payment callback');
      }
    }
  };

  site.responseCallback = async (payload, res) => {
    if (payload.success === 'true') {
      let obj = {
        approved: payload['data.message'],
        orderId: payload.order,
        merchantOrderId: payload.merchant_order_id,
      };
      res.status(200).send(obj);
    } else {
      res.status(406).send('Payment is not acceptable');
    }
  };

  site.create = async (obj) => {
    paymentModel.defaultSchema.create(obj, function (err, cat) {
      if (err) res.status(500).send(err);
      else res.status(201).send(obj);
    });
  };

  site.getCalculatedHmac = (data) => {
    const value = [
      'amount_cents',
      'created_at',
      'currency',
      'error_occured',
      'has_parent_transaction',
      'id',
      'integration_id',
      'is_3d_secure',
      'is_auth',
      'is_capture',
      'is_refunded',
      'is_standalone_payment',
      'is_voided',
      'order',
      'order.id',
      'owner',
      'pending',
      'source_data.pan',
      'source_data.sub_type',
      'source_data.type',
      'success',
    ]
      .sort((a, b) => a.localeCompare(b))
      .map((key) => data[key])
      .join('');

    const hmacValue = crypto.createHmac('SHA512', WE_ACCEPT_HMAC_KEY).update(value).digest('hex');
    return hmacValue;
  };

  site.flatten = (obj, includePrototype, into, prefix) => {
    into = into || {};
    prefix = prefix || '';

    for (var k in obj) {
      if (includePrototype || obj.hasOwnProperty(k)) {
        var prop = obj[k];
        if (prop && typeof prop === 'object' && !(prop instanceof Date || prop instanceof RegExp)) {
          flatten(prop, includePrototype, into, prefix + k + '.');
        } else {
          into[prefix + k] = prop;
        }
      }
    }

    return into;
  };
};
