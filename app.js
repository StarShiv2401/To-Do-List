//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const db = mongoose.connect("mongodb+srv://admin-shivansh:jaishreeram@cluster0.vq0xozk.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: true
  }
});
const listSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: true
  },
  items: [itemSchema]
});

const Items = mongoose.model("item", itemSchema);
const Lists = mongoose.model("list", listSchema);

const item1 = new Items ({
  name: "Welcome to your To-Do-List!!!"
});
const item2 = new Items ({
  name: "Hit the + button to add a new item."
});
const item3 = new Items ({
  name: "<-- Hit this to delete an item."
});

const defaultArray = [item1, item2, item3];

// Items.insertMany(defaultArray)
// .then(() => {
//   console.log("Succefully inserted items");
// }).catch((error) => {
//   console.log(error);
// });



app.get("/", async (req, res) => {
  const itemName = await Items.find();
  if(itemName.length === 0){
    Items.insertMany(defaultArray)
    .then(() => {
      console.log("Succefully inserted items");
    }).catch((error) => {
      console.log(error);
    });
    res.redirect("/");
  } else {
    res.render("list", {listTitle: "Today", newListItems: itemName});
  }
});

app.post("/", function(req, res){
  const newName = req.body.newItem;
  const newList = req.body.list;
  const item = new Items({
    name: newName
  });
  if (newList === "Today") {
    item.save()
  .then(() =>{
    res.redirect("/");
  }).catch((error) => {
    console.log(error);
  });
  } else {
    Lists.findOne({name: newList})
    .then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + newList);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today") {
    Items.findOneAndDelete({_id: checkedItemId})
    .then(() => {
      res.redirect("/");
    });
  } else {
    Lists.findOneAndUpdate({name: listName}, { $pull: { items: { _id: checkedItemId } } })
    .then(() =>{
      res.redirect("/" + listName);
    });
  }
});

app.get("/:customListName", (req, res) => {
  if (req.params.customListName != "favicon.ico"){
    const customListName = _.capitalize(req.params.customListName);
  Lists.findOne({name: customListName})
  .then((foundList) => {
    if(!foundList) {
      const list = new Lists ({
        name: customListName,
        items: defaultArray
      });
      list.save().then(() => {res.redirect("/" + customListName);});
    } else {
      res.render("list", {listTitle: customListName, newListItems: foundList.items});
    }
  });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});