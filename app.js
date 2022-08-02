
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://Drumbach:Deek<3Sarah@cluster0.cjlgz.mongodb.net/todolistDB");

const itemsSchema = {
  name: {
    type: String,
    required: true
  }
};
const Item = mongoose.model("Item", itemsSchema);
const _1 = new Item({ name: "Welcome to your todolist" });
const _2 = new Item({ name: "Hit the + button to add a new item after entering it in the box" });
const _3 = new Item({ name: "<-- Hit this to delete an item" });
const defaultItems = [_1, _2, _3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, (err, foundItems) => {

    if (err) throw err;
    else {
      if (foundItems.length === 0) {

        Item.insertMany(defaultItems, (err) => {
          if (err) throw err;
          else console.log("Successfully added the default items to the array");
        });
        res.redirect("/");

      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    }
  });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }); 
  }

  
});

app.post("/delete", (req,res)=>{
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.deleteOne({_id: checkItemId}, (err)=>{
      if(err) throw err;
      else console.log("Item deleted successfully");
    })
    res.redirect("/");
  } else {
    List.findOneAndUpdate({
      name: listName},
      {$pull: {items: {_id: checkItemId}}}
      ,(err,results)=>{
        if(!err)
        {
          res.redirect("/" + listName);
        } else throw err;
    });
  }
});

app.get("/:otherLists", (req,res)=>{
  const customListName = _.capitalize(req.params.otherLists);
  List.findOne({name: customListName}, (err, foundList)=>{
    if(!err)
    {
      if(!foundList)
      {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      } 
    } 
    else throw err;    
  }); 
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port, function () {
  console.log("Server started on port 3000");
});
