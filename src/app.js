const express=require('express')
const app=express()

app.use("/",(req,res)=>{
    res.status(200).send("d2fdsf ")
})
app.listen(3000,()=>{
    console.log("server listening to port 3000")
})




