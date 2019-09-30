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
    var neighborhood ={
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
    -Add (POST),'/api/neighborhood/add','required {} (parameter)'
    -Update (POST),'/api/neighborhood/update' , 'required where (parameter)'
    -Delete(POST),'/api/neighborhood/delete' , 'required where (parameter)'
    -Search (POST),'/api/neighborhood/all', 'required where (parameter)'
    -view (POST),'/api/neighborhood/view', 'required where (parameter)'
    

# Describtion
    - This is service app serve other apps
    - The aim from this app is define neighborhood to use it in other apps
    