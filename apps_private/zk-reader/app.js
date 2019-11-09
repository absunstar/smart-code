module.exports = function init(site) {
    const ZKLib = require('zklib');

    site.zk = {}
    site.zk.options = {
        ip: '192.168.100.201',
        port: 4370,
        inport: 5200,
        timeout: 5000,
        attendanceParser: 'v6.60',
        connectionType: 'udp',
        auto : false
    }

    site.zk.new = function (_options) {
        _options = Object.assign(site.zk.options , _options)
        zk = new ZKLib(_options)
        return zk
    }

    site.zk.handleAttendance = function (attendance_array) {
        attendance_array.forEach(attend => {
            attend.check_status = attend.inOutStatus == 0 ? 'check_in' : 'check_out'
        });
        return attendance_array
    }
    site.zk.load_attendance = function(_options , callback){
        let zk = site.zk.new(_options)
        zk.connect(function (err) {
            if (!err) {
                zk.getAttendance(function (err, attendance_array) {
                    if (!err) {
                        callback(site.zk.handleAttendance(attendance_array))
                    }
                    zk.disconnect();
                    if(_options.auto){
                        setTimeout(() => {
                            site.zk.load_attendance(_options , callback)
                        }, 1000 * 3);
                    }
                    
                })
            } else {
                if(_options.auto){
                    setTimeout(() => {
                        site.zk.load_attendance(_options , callback)
                    }, 1000 * 3);
                }
            }
        })
    }
}