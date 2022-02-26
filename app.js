//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-shubham:Test-123@cluster0.hv2ap.mongodb.net/todolistDB");

const itemsSchema = {
  item: String
}
const listSchema = {
  name: String,
  items: [itemsSchema]
}

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  item: "Welcome to our to-do list"
});
const item2 = new Item({
  item: "Tap + to add items"
});

const item3 = new Item({
  item: "<-- tap this to delete item"
});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {


  Item.find({}, function (err, foundlist) {


    if (foundlist.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log("error found");;
        } else {
          console.log("succussefully inserted item to database");
        }
      })

      res.redirect("/")
    } else {

      if (err) {
        console.log("error found at finding element");
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundlist });
      }

    }

  });

});



app.get("/:type", function (req, res) {
  const customListName = _.capitalize(req.params.type);
  List.findOne({ name: customListName }, function (err, foundlist) {
    if (!err) {
      if (!foundlist) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }

      else {
        res.render("list", { listTitle: foundlist.name, newListItems: foundlist.items });
      }


    }
    else {
      console.log("error found at adding list module")
    }

  })


});

app.get("/about", function (req, res) {
  res.render("about");
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  let listName=req.body.list;
  const items = new Item({
      item: itemName
    });
  if(listName==="Today")
  {
    items.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundlist){
      if(!err){
        foundlist.items.push(items);
        foundlist.save();
        res.redirect("/"+listName);
      }
    })
  }
    
    
});


app.post("/delete", function (req, res) {
  let checkitemid = req.body.checkbox;
  let listName=req.body.listName;
  if(listName==="Today")
  {
    Item.deleteOne({ _id: checkitemid }, function (err) {
      if (err) {
        console.log("error found at deleting the items")
      } else {
        console.log("item deleted succusefully");
      }
    })
    res.redirect("/");
  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkitemid}}},function(err,foundlist){
      if(!err)
      {
        res.redirect("/"+listName);
      }

    });
    

  }
  
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server has started.....");
});
