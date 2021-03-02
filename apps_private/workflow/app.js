module.exports = function (site) {

    const $workflow = site.connectCollection('workflow')
    let workflow = {}


    site.get({
        name: '/workflow',
        path: __dirname + '/site_files/html/index.html',
        parser: 'html css js'
    })

    site.post('/api/workflow/all' , (req , res)=>{
        workflow.get_workflow_list({} , (err , docs)=>{
            res.json(docs)
        })
    })


    workflow.add = function (option, callback) {
        callback = callback || function () {}
        let w = Object.assign({
            title: 'نريد موافقتك على هذا اﻻجراء',
            details : '',
            created_by : {id : -1 , email : 'auto@system' , name : 'System'},
            created_date: new Date(),
            updated_date: new Date(),
            type: 'multi-approved',
            users: [],
            status: 'working',
            ref_doc: {
                id: null,
                collection: null,
                db: null
            }
        }, option)

        if (w.users) {
            w.user = w.users[0]
        }

        $workflow.add(w, (err, w2) => {
            callback(err, w2)
            if (!err) {
                site.call('workflow-added', w)

                if (w.ref_doc.collection) {
                    $ref = site.connectCollection(w.ref_doc.collection)
                    $ref.find({
                        id: w.ref_doc.id
                    }, (err, doc) => {
                        if (!err) {
                            doc.ref_workflow = {
                                id: w2.id,
                                status: w2.status,
                                updated_date: new Date()
                            }
                            $ref.update(doc)
                        }
                    })
                }
            }
        })


        return w
    }

    workflow.get = function (id, callback) {
        callback = callback || function () {}
        $workflow.find({
            id: id
        }, (err, w) => {
            callback(err, w)
        })
    }

    workflow.stop = function (w_id, callback) {
        callback = callback || function () {}
        if (typeof w_id === 'object') {
            w_id = w_id.id
        }
        $workflow.get({
            id: w_id
        }, (err, w) => {
            w.status = 'stop'
            w.updated_date = new Date()
            $workflow.update(w, (err, doc) => {
                site.call('workflow-updated', w)
                callback(err, doc)
                $ref = site.connectCollection(w.ref_doc.collection)
                $ref.find({
                    id: w.ref_doc.id
                }, (err, doc) => {
                    if (!err) {
                        doc.ref_workflow = {
                            id: w.id,
                            status: w.status,
                            updated_date: new Date()
                        }
                        $ref.update(doc)
                    }
                })
            })
        })
    }

    workflow.start = function (w_id, callback) {
        callback = callback || function () {}
        if (typeof w_id === 'object') {
            w_id = w_id.id
        }
        $workflow.get({
            id: w_id
        }, (err, w) => {
            w.status = 'working'
            w.updated_date = new Date()
            $workflow.update(w, (err, doc) => {
                site.call('workflow-updated', w)
                callback(err, doc)
                $ref = site.connectCollection(w.ref_doc.collection)
                $ref.find({
                    id: w.ref_doc.id
                }, (err, doc) => {
                    if (!err) {
                        doc.ref_workflow = {
                            id: w.id,
                            status: w.status,
                            updated_date: new Date()
                        }
                        $ref.update(doc)
                    }
                })
            })
        })
    }

    workflow.done = function (w_id, callback) {
        callback = callback || function () {}
        if (typeof w_id === 'object') {
            w_id = w_id.id
        }
        $workflow.get({
            id: w_id
        }, (err, w) => {
            w.status = 'done'
            w.updated_date = new Date()
            $workflow.update(w, (err, doc) => {
                site.call('workflow-done', w)
                callback(err, doc)
                $ref = site.connectCollection(w.ref_doc.collection)
                $ref.find({
                    id: w.ref_doc.id
                }, (err, doc) => {
                    if (!err) {
                        doc.ref_workflow = {
                            id: w.id,
                            status: w.status,
                            updated_date: new Date()
                        }
                        $ref.update(doc)
                    }
                })
            })
        })
    }

    workflow.approved = function (w_id, user_id, callback) {
        callback = callback || function () {}
        if (typeof w_id === 'object') {
            w_id = w_id.id
        }
        workflow.get(w_id, (err, w) => {
            if (!err && w) {
                let user_index = -1
                w.users.forEach((user, i) => {
                    if (user.id == user_id) {
                        user.status = 'approved'
                        user.action_date = new Date()
                        user_index = i
                    }
                })

                if (user_index !== -1 && user_index < w.users.length - 1) {
                    w.user = w.users[user_index + 1]
                } else {
                    w.user = null
                    w.status = 'done'
                    w.updated_date = new Date()
                    $ref = site.connectCollection(w.ref_doc.collection)
                    $ref.find({
                        id: w.ref_doc.id
                    }, (err, doc) => {
                        if (!err) {
                            doc.ref_workflow = {
                                id: w.id,
                                status: w.status,
                                updated_date: new Date()
                            }
                            $ref.update(doc)
                        }
                    })
                }

                $workflow.update(w, (err, w2) => {
                    if (w.status === 'done') {
                        site.call('workflow-done', w)
                    } else {
                        site.call('workflow-updated', w)
                    }
                    callback(err, w2)
                })
            }
        })
    }

    workflow.get_workflow_list = function (option, callback) {
        callback = callback || function () {}
        $workflow.findAll(option, (err, docs) => {
            callback(err, docs)
        })
    }



    workflow.test = function () {
        $order = site.connectCollection('orders')
        $order.add({
            name: 'order1'
        }, (err, order1) => {
            site.workflow.add({
                title: 'طلب شراء',
                details : 'نرجو من سيادتكم الموافقة على طلب الشراء',
                created_by : {id : -1 , email : 'auto@system' , name : 'System'},
                users: [{
                    id: 1,
                    name : 'عمرو بركات' ,
                    email: 'absunstar@gmail.com'
                }, {
                    id: 2,
                    name : 'باهر حامد',
                    email: 'baherhamed@yahoo.com'
                }],
                ref_doc: {
                    id: order1.id,
                    collection: 'orders'
                }

            }, (err, w) => {
                if (!err && w) {
                    setTimeout(() => {
                        site.workflow.approved(w, 1, (err, w3) => {
                            if (!err && w3) {
                                setTimeout(() => {
                                   // site.workflow.approved(w, 2)
                                }, 1000 * 10)
                            }
                        })
                    }, 1000 * 10)
                }
            })
        })
    }


    site.workflow = workflow
    return workflow

}