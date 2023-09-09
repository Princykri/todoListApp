import express from "express";
import bodyparser from "body-parser";
const app =express();
import mongoose from "mongoose";
import _ from "lodash";

const port =process.env.PORT || 3030;

app.use(express.static("public"));
app.set("view engine","ejs")
app.use(bodyparser.urlencoded({extended:true}))
const mongodb="mongodb+srv://princyk2007:qwerty1234@cluster0.y4nrtd9.mongodb.net/todolistDB";

mongoose
   .connect(mongodb)
   .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

const listSchema=new mongoose.Schema({name:
    {type:String,
     required:true   
    }
})
const Item=mongoose.model("Item",listSchema)

const item1=new Item({
    name:"Welcome to the list"
})

const item2=new Item({
    name:"Hit'+'button to add "
})
const item3=new Item({
    name:"<---- hit to delete "
})

const defaultItem=[item1,item2,item3];

const NewlistSchema=new mongoose.Schema({
  name:String,
  items:[listSchema]
})

const List=mongoose.model("List",NewlistSchema);

app.get("/",(req,res)=>{
    Item
      .find() 
      .then(function(foundItem){
        if(foundItem.length===0){
            Item.insertMany(defaultItem)
           .then(()=>{
              console.log("Successfully saved default item")
           })
           .catch((err)=>{
            console.log(err);
           })
        }
        res.render("index",{ heading:"TODAY" , data:foundItem})
      })
      .catch((err)=> {
        console.log(err);
      })
    
})

app.get("/:customListName",(req,res)=>{
    const customListName=_.upperCase(req.params.customListName);
    List.findOne({name:customListName})
    .then(function(foundList){
         if(!foundList){
          // cretaing new list in NewList collection
          const list =new List({
            name:customListName ,
            items:defaultItem,
          })
          list.save();
          res.redirect("/"+customListName);
         }else{
          // show the existing list 
          res.render("index",{heading:foundList.name , data:foundList.items})
         }
    })
    .catch((err)=> {
      console.log(err);
    })
    
})

app.post("/add",(req,res)=>{
    const ReqItem=req.body.newItem;
    const Reqlist=req.body.list;

    const newItem=new Item({
      name:ReqItem
    })
    if(Reqlist==="TODAY"){
      newItem.save()
      .then(()=>{
         console.log("Successfully saved new Item")
         res.redirect("/");
      })
      .catch((err)=>{
         console.log(err);
      })
    }else{
      List.findOne({name:Reqlist})
      .then(function(foundlist){
        console.log("Successfully saved new Item to newList")
         foundlist.items.push(newItem)
         foundlist.save();
         res.redirect("/"+Reqlist)
      })
      .catch((err)=>{
        console.log(err);
     })
    }
   
})

app.post("/del",(req,res)=>{
    const checkId=req.body.checkbox;
    const Reqlist=req.body.listName;
    if(Reqlist==="TODAY"){
      Item.deleteOne({_id: checkId})
      .then(()=>{
          console.log("Successfully deleted")
          res.redirect("/");
       })
       .catch((err)=>{
        console.log(err);
       })
    }else{
      List.findOneAndUpdate({name:Reqlist},{$pull:{items:{_id:checkId}}})
      .then(()=>{
         console.log("Successfully deleted")
         res.redirect("/"+Reqlist);
      })
      .catch((err)=>{
        console.log(err);
       })
      
    }
    
})










app.listen(port,()=>{
    console.log("server is Running")
})