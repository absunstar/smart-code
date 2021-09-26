module.exports = function init(site) {
  const $agora = site.connectCollection('agora');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'agora',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  const {
    RtcTokenBuilder,
    RtcRole
  } = require('agora-access-token');

    // RTC Token

    site.post("/api/agora/rtctoken", (req, res) => {
      let response = {}
      let agora_doc = req.body
  
      const APP_ID = agora_doc.APP_ID;
      const APP_CERTIFICATE = agora_doc.APP_CERTIFICATE;
      
      const channelName = String(new Date().getTime());
      if (!channelName) {
        return res.status(500).json({
          'error': 'channel is required'
        });
      }
      // get uid 
      let uid = req.query.uid;
      if (!uid || uid == '') {
        uid = 0;
      }
      // get role
      let role = RtcRole.SUBSCRIBER;
      if (req.query.role == 'publisher') {
        role = RtcRole.PUBLISHER;
      }
      // get the expire time
      let expireTime = req.query.expireTime;
      if (!expireTime || expireTime == '') {
        expireTime = 3600;
      } else {
        expireTime = parseInt(expireTime, 10);
      }
      // calculate privilege expire time
      const currentTime = Math.floor(Date.now() / 1000);
      const privilegeExpireTime = currentTime + expireTime;
      // build the token
       
      const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
      let obj = {
        done: true,
        
        data: {
          APP_ID :APP_ID,
          APP_CERTIFICATE : APP_CERTIFICATE,
          token: token,
          uid: uid,
          role : role,
          privilegeExpireTime : privilegeExpireTime,
          channel: channelName
        },
      }
  
      res.json(obj)
  
  
    })
  


};




