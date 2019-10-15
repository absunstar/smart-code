module.exports = function init(site) {

  let collection_name = 'employees_report'

 let source = {
    name : 'Accounting System' ,
    ar : 'نظام الحسابات'
  }

  let image_url = '/images/emp_debt.png'
  let add_message = {name : 'New Employee Salary Added' , ar : ' تم سداد راتب لموظف  '}


  site.on('mongodb after insert', function (result) {
      if (result.collection === collection_name) {
        site.call('please monitor action' , { obj : {
          icon: image_url,
          source: source,
          message: add_message ,
          value: { name : result.doc.total_salary , ar : result.doc.total_salary},
          add: result.doc,
          action: 'add'
        }, result : result })
      }
  })




}