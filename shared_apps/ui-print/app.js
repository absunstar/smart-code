module.exports = function(site){
    site.printList = []

    site.post('/api/print' , (req , res)=>{

        let id = new Date().getTime()
        site.printList.push({
            id : id ,
            content : req.data.content
        })

        res.json({
            done : true,
            url : '/view/print/' + id
        })
    })

    site.get('/view/print/:id' , (req , res)=>{
        let content = ''
        site.printList.forEach(item => {
            if(item.id.toString() == req.params.id){
                content = item.content
            }
        })
        let html = site.readFileSync(__dirname + '/site_files/html/index.html')
        html = html.replace('##data.content##' , content)
        res.htmlContent(html)
    })
}