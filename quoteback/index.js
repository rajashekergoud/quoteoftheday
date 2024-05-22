const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
async function mong() {
  try {
    await mongoose.connect(
      "mongodb+srv://rajashekerkalal:dES2XLZgxWqsX0YE@projectsdb.luogyfm.mongodb.net/"
    );
    console.log("connected");
  } catch (err) {
    console.log(err);
  }
}
mong();
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});
const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});
const quoteSchema = new mongoose.Schema({
  quote: {
    type: String,
    required: true,
    unique: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
});
const Category = mongoose.model("Category", categorySchema);
const Author = mongoose.model("Author", authorSchema);
const Quote = mongoose.model("Quote", quoteSchema);

app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.get("/api/category", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.post("/api/category", async (req, res) => {
  try {
    const { name: categoryName } = req.body;
    const categoryExists = await Category.findOne({ name: categoryName });
    if (categoryExists) res.json({ message: "Category Already exists" });
    else {
      const category = new Category({
        name: categoryName,
      });
      await category.save();
      res.json(category);
    }
  } catch (e) {
    console.log(e);
    res.json({ message: "Failed" });
  }
});
app.get("/api/quotes", async (req, res) => {
  try {
    const quotes = await Quote.find();
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get("/api/authors", async (req, res) => {
  try {
    const authors = await Author.find();
    res.json(authors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get("/api/quotes/author/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const quotes = await Quote.find({
      author: id,
    });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get("/api/author/search", async (req, res) => {
  try {
    const { name } = req.query;
    const query = { name: { $regex: new RegExp(name, "i") } };
    const authors = await Author.find(query).exec();
    res.json(authors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get("/api/quotes/category/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const quotes = await Quote.find({
      category: id,
    });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.post("/api/quote", async (req, res) => {
  try {
    const { quote, author, category } = req.body;
    const authorExists = await Author.findOne({ name: author });
    let currentAuthor = null;
    if (authorExists) {
      currentAuthor = authorExists;
    } else {
      currentAuthor = new Author({ name: author });
      await currentAuthor.save();
    }
    const categoryExists = await Category.findOne({ name: category });
    let currentCategory = null;
    if (categoryExists) {
      currentCategory = categoryExists;
    } else {
      currentCategory = new Category({ name: category });
      await currentCategory.save();
    }
    const createQuote = new Quote({
      quote,
      author: currentAuthor._id,
      category: currentCategory._id,
    });

    await createQuote.save();
    res.json({ message: "Quote created" });
  } catch (e) {
    res.json({ message: "Failed" });
  }
});
app.get("/api/quoteoftheday", async (req, res) => {
  try {
    const { id } = req.params;
    const quotes = await Quote.find().populate("author");

    const date = new Date();
    const dayOfYear = Math.floor(
      (date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );
    const quote = quotes[dayOfYear % quotes?.length];
    res.json(quote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.listen(3002, () => {
  console.log("Server is running on port 3002");
});
