module.exports = function init(site) {

  let collection_name = 'employees_advances'

 let source = {
    name : 'Accounting System' ,
    ar : 'نظام الحسابات'
  }

  let image_url = '/images/discount.png'
  let add_message = {name : 'New Employee Advance Added' , ar : ' تم أضافة سلفة جديد'}
  let update_message =  {name : 'Employee Advance updated' , ar : 'تم تعديل السلفة'}
  let delete_message =  {name : 'Employee Advance deleted' , ar : 'تم حذف السلفة '}


  site.on('mongodb after insert', function (result) {
      if (result.collection === collection_name) {
        site.call('please monitor action' , { obj : {
          icon: image_url,
          source: source,
          message: add_message ,
          value: { name : result.doc.value , ar : result.doc.value},
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
          value: {name : result.old_doc.value , ar : result.old_doc.value},
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
          value: {name : result.doc.value , ar : result.doc.value},
          delete: result.doc,
          action: 'delete'
        }, result : result })
      }
  })

}