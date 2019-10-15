# Backend
    - Data Access Layer (connect to Db)
    - Security Layer (check permissions for users)
    - Validation Layer (check required fields and field size and data type)
    - Integration Layer (check if app need to integrate with anothe app or more)
    - http API Layer (cloud API)
    - Busniess Layer (check that bussniess workflow is right)
    - Testing 

# FrontEnd
    - ui Layer (interface (add - update - delete - details))
    - Validation (check required fields and field size and data type)
    - http Layer (ajax)
    - Busniess Layer (check that bussniess workflow is right )
    - Testing


# object structure
```js 
    var city ={
        id: 'int required auto',
        name: 'string required ',
        gov:{
            id:'int required',
            name:'string required'
        },
        active:'boolean',
        image_url:'string'

    }

# API
    -Add (POST),'/api/city/add','required {} (parameter)'
    -Update (POST),'/api/city/update' , 'required where (parameter)'
    -Delete(POST),'/api/city/delete' , 'required where (parameter)'
    -Search (POST),'/api/city/all', 'required where (parameter)'
    -view (POST),'/api/city/view', 'required where (parameter)'
    

# Describtion
    - This is service app serve other apps
    - The aim from this app is define city to use it in other apps
    