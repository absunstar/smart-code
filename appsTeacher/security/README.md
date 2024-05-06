# Security App

```html

<div x-permissions="add || manage">
    Some Content
</div>

<div x-roles="admin || owner">
    Some Content
</div>

```


## permissions.json

company

```json
[
    {"name" : "companyAdd" , "En":"Add" , "Ar" : "إضافة"},
    {"name" : "companyEdit" , "En":"Edit" , "Ar" : "تعديل"},
    {"name" : "companyDelete" , "En":"Delete" , "Ar" : "حذف"},
    {"name" : "companySearch" , "En":"Search" , "Ar" : "بحث"},
    {"name" : "companyView" , "En":"View" , "Ar" : "عرض"},
    {"name" : "companyManage" , "En":"Manage" , "Ar" : "إدارة"}
]
```

## roles.json
```json
[
    {"name" : "company_admin" , "En":"Admin" , "Ar" : "مدير" , 
      "permissions" : [
        {"name" : "companyAdd"},
        {"name" : "companyEdit"},
        {"name" : "companyDelete"},
        {"name" : "companySearch"},
        {"name" : "companyView"},
        {"name" : "companyManage"}
      ]
    }
]
```


## in progress

 - assign [company , branch] array
 - show modules screens permisions
 - change ui [frindly design]
 - create custom roles