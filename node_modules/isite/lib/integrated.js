module.exports = function init(____0) {
  ____0.sendEmail = function (mail, callback) {
    callback =
      callback ||
      function (err, res) {
        console.log(err || res);
      };
    if (!mail || !mail.from || !mail.to || !mail.subject || !mail.message) {
      callback({ message: ' Check Mail All Fields [ from , to , subject , message ] ' });
      return;
    }
    mail.source = 'isite';
    mail.from_email = mail.from;
    mail.to_email = mail.to;

    ____0
      .fetch(`http://emails.egytag.com/api/emails/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mail),
      })
      .then((res) => res.json())
      .then((body) => {
        callback(null, body);
      })
      .catch((err) => {
        callback(err);
      });
  };
};
