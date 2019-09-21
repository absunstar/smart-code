module.exports = function init(site) {

  let collection_name = 'amounts_in'

 let source = {
    name : 'Accounting System' ,
    ar : 'نظام الحسابات'
  }

  let image_url = '/images/amount_in.png'
  let add_message = {name : 'New Amount In Added' , ar : ' تم أضافة وارد جديد'}
  let update_message =  {name : ' Amount In updated' , ar : 'تم تعديل الوارد'}
  let delete_message =  {name : ' Amount In deleted' , ar : 'تم حذف الوارد '}


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