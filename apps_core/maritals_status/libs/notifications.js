module.exports = function init(site) {

    let collection_name = 'maritals_status'
  
   let source = {
      name : 'General Setting System' ,
      ar : 'نظام اعدادات عامة'
    }
  
    let image_url = '/images/marital_state.png'
    let add_message = {name : 'New marital_state Added' , ar : 'تم أضافة حالة اجتماعية جديدة'}
    let update_message =  {name : ' marital_state updated' , ar : 'تم تعديل حالة اجتماعية'}
    let delete_message =  {name : ' marital_state dleteted' , ar : 'تم حذف حالة اجتماعية '}
  
  
    site.on('mongodb after insert', function (result) {
        if (result.collection === collection_name) {
          site.call('please monitor action' , { obj : {
            icon: image_url,
            source: source,
            message: add_message ,
            value: { name : result.doc.name , ar : result.doc.name},
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
            value: {name : result.old_doc.name , ar : result.old_doc.name},
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
            value: {name : result.doc.name , ar : result.doc.name},
            delete: result.doc,
            action: 'delete'
          }, result : result })
        }
    })
  
  }