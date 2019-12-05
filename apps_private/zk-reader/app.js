module.exports = function init(site) {
    const ZKLib = require('zklib');

    $zk_attend = site.connectCollection('zk_attend')

    site.zk = {}
    site.zk.options = {
        ip: '192.168.100.201',
        port: 4370,
        inport: 5200,
        timeout: 5000,
        attendanceParser: 'v6.60',
        connectionType: 'udp',
        auto: false,
        auto_time: 1000 * 3
    }
    site.zk.attendance_array = []
    $zk_attend.findMany({}, (err, docs) => {
        if (!err && docs) {
            site.zk.attendance_array = docs
        }
    })

    site.zk.new = function (_options) {
        _options = Object.assign(site.zk.options, _options)
        zk = new ZKLib(_options)
        return zk
    }

    site.zk.handleAttendance = function (attendance_array) {
        attendance_array.forEach(attend => {
            attend.attend_id = attend.id
            attend.user_id = attend.uid
            attend.finger_id = attend.uid
            delete attend.uid
            delete attend.id
            attend.check_status = attend.inOutStatus == 0 ? 'check_in' : 'check_out'
            attend.date = new Date(attend.timestamp)
        });
        return attendance_array
    }
    site.zk.load_attendance = function (_options, callback) {
        _options = Object.assign(site.zk.options, _options)
        let zk = site.zk.new(_options)
        zk.connect(function (err) {
            if (!err) {
                zk.getAttendance(function (err, _attendance_array) {

                    if (!err) {
                        let attendance_array = site.zk.handleAttendance(_attendance_array)
                        callback(attendance_array)
                        attendance_array.forEach(attend => {
                            if (!site.zk.attendance_array.some(a => (a.date.getTime() == attend.date.getTime() && a.finger_id == attend.finger_id))) {
                                site.zk.attendance_array.push(attend)
                                site.call('zk attend', attend)
                                $zk_attend.add(attend)
                            }
                        })

                    } else {
                        callback(err)
                    }

                    zk.disconnect();
                    if (_options.auto) {
                        setTimeout(() => {
                            site.zk.load_attendance(_options, callback)
                        }, _options.auto_time);
                    }

                })
            } else {
                callback(err)
                if (_options.auto) {
                    setTimeout(() => {
                        site.zk.load_attendance(_options, callback)
                    }, _options.auto_time);
                }
            }
        })
    }



    site.get('/api/zk/attendance/all', (req, res) => {
        site.zk.load_attendance({}, (err, attendance_array) => {
            if (!err) {
                res.json({
                    done: true,
                    list: attendance_array
                })
            } else {
                res.json({
                    done: false,
                    error: err.message
                })
            }
        })
    })


    site.get('/api/zk/attend/:status', (req, res) => {
        attend = {
            attend_id: 1,
            finger_id: 1,
            date: new Date(),
            check_status: req.params.status
        }
        site.call('zk attend', attend)
        res.json({
            done: true,
            doc: attend
        })
    })

}
// site.zk.load_attendance({
//     auto: true
// }, (err, attendance_array) => {
//     console.log(err)
//     console.log(attendance_array)
// })