module.exports = function init(site) {

  let collection_name = 'amounts_out'

 let source = {
    name : 'Accounting System' ,
    ar : 'نظام الحسابات'
  }

  let image_url = '/images/amount_out.png'
  let add_message = {name : 'New Amount Out Added' , ar : ' تم إضافة صادر جديد'}
  let update_message =  {name : ' Amount Out updated' , ar : 'تم تعديل الصادر'}
  let delete_message =  {name : ' Amount Out deleted' , ar : 'تم حذف الصادر '}


  site.on('mongodb after insert', function (result) {
      if (result.collection === collection_name) {
        site.call('please monitor action' , { obj : {
          icon: image_url,
          source: source,
          message: add_message ,
          value: { name : result.doc.code , ar : result.doc.code},
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
          value: {name : result.old_doc.code , ar : result.old_doc.code},
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
          value: {name : result.doc.code , ar : result.doc.code},
          delete: result.doc,
          action: 'delete'
        }, result : result })
      }
  })

}