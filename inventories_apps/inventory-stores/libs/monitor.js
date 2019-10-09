module.exports = function init(site) {

  let collection_name = 'stores'

 let source = {
    name : 'Stores System' ,
    ar : 'نظام المخازن'
  }

  let image_url = '/images/stores.png'
  let add_message = {name : 'New store Added' , ar : 'تم أضافة مخزن جديدة'}
  let update_message =  {name : ' Store updated' , ar : 'تم تعديل مخزن'}
  let delete_message =  {name : ' Store dleteted' , ar : 'تم حذف مخزن '}


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