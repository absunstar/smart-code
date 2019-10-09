module.exports = function init(site) {

  let collection_name = 'employees_advances_fin'

 let source = {
    name : 'Accounting System' ,
    ar : 'نظام الحسابات'
  }

  let image_url = '/images/discount.png'
  let update_message = {name : 'New Employee Advance End Added' , ar : ' تم سداد جزء من السلفة'}


 

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
  


}