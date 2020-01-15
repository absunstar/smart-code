module.exports = function init(site) {

  let collection_name = 'stores_dismantle'

 let source = {
    name : 'Stores System' ,
    ar : 'نظام المخازن'
  }

  let image_url = '/images/store_dismantle.png'
  let add_message = {name : 'New Store Dismantle Added' , ar : 'تم إضافة إذن تفكيك جديد'}
  let update_message =  {name : ' Store Dismantle updated' , ar : 'تم تعديل إذن تفكيك'}
  let delete_message =  {name : ' Store Dismantle dleteted' , ar : 'تم حذف إذن تفكيك '}


  site.on('mongodb after insert', function (result) {
      if (result.collection === collection_name) {
        site.call('please monitor action' , { obj : {
          company : result.doc.company,
          branch :  result.doc.branch,
          icon: image_url,
          source: source,
          message: add_message ,
          value: { name : result.doc.number , ar : result.doc.number},
          add: result.doc,
          action: 'add'
        }, result : result })
      }
  })

  site.on('mongodb after update', function (result) {
      if (result.collection === collection_name) {
        site.call('please monitor action' , { obj : {
          company : result.doc.company,
          branch :  result.doc.branch,
          icon: image_url,
          source : source,
          message: update_message ,
          value: {name : result.old_doc.number , ar : result.old_doc.number},
          update: site.objectDiff(result.update.$set, result.old_doc),
          action: 'update'
        }, result : result }
        )
      }
  })


  site.on('mongodb after delete', function (result) {
      if (result.collection === collection_name) {
        site.call('please monitor action' , { obj : {
          company : result.doc.company,
          branch :  result.doc.branch,
          icon: image_url,
          source: source ,
          message: delete_message ,
          value: {name : result.doc.number , ar : result.doc.number},
          delete: result.doc,
          action: 'delete'
        }, result : result })
      }
  })

}