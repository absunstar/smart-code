module.exports = function init(site) {

  let collection_name = 'employees_insurances'

 let source = {
    name : 'Accounting System' ,
    ar : 'نظام الحسابات'
  }

  let image_url = '/images/customer.png'
  let add_message = {name : 'New Employee Insurance Added' , ar : ' تم أضافة تأمين لموظف '}
  let update_message =  {name : ' Employee Insurance updated' , ar : 'تم تعديل تامين لموظف  '}
  let delete_message =  {name : ' Employee Insurance deleted' , ar : 'تم حذف تأمين لموظف '}


  site.on('mongodb after insert', function (result) {
      if (result.collection === collection_name) {
        site.call('please monitor action' , { obj : {
          icon: image_url,
          source: source,
          message: add_message ,
          value: { name : result.doc.employee.name , ar : result.doc.employee.name},
          add: result.doc,
          action: 'add'
        }, result : result })
      }
  })

  site.on('mongodb after update', function (result) {
      if (result.collection === collection_name) {
        site.call('please monitor action' , { obj : {
          icon: image_url,
          source : source,
          message: update_message ,
          value: {name : result.old_doc.employee.name , ar : result.old_doc.employee.name},
          update: site.objectDiff(result.update.$set, result.old_doc),
          action: 'update'
        }, result : result })
      }
  })


  site.on('mongodb after delete', function (result) {
      if (result.collection === collection_name) {
        site.call('please monitor action' , { obj : {
          icon: image_url,
          source: source ,
          message: delete_message ,
          value: {name : result.doc.employee.name , ar : result.doc.employee.name},
          delete: result.doc,
          action: 'delete'
        }, result : result })
      }
  })

}