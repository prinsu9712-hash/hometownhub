const Category = require("../models/Category");

const DEFAULT_CATEGORIES = [
  { name: "Announcement", description: "Important local alerts and official community notices." },
  { name: "Discussion", description: "Open community conversations and local questions." },
  { name: "Event", description: "Upcoming gatherings, celebrations, and meetups." },
  { name: "Support", description: "Requests for help, volunteering, and support groups." },
  { name: "News", description: "Local news, updates, and civic information." }
];

const ensureDefaultCategories = async () => {
  const existing = await Category.find({ isActive: true }).sort({ name: 1 });
  if (existing.length > 0) {
    return existing;
  }

  try {
    await Category.insertMany(DEFAULT_CATEGORIES, { ordered: false });
  } catch (error) {
    // Ignore duplicate key race conditions across concurrent first-load requests.
  }

  return Category.find({ isActive: true }).sort({ name: 1 });
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await ensureDefaultCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || ""
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category already exists" });
    }
    res.status(500).json({ message: "Failed to create category", error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (typeof name === "string" && name.trim()) category.name = name.trim();
    if (typeof description === "string") category.description = description;
    if (typeof isActive === "boolean") category.isActive = isActive;
    await category.save();

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Failed to update category", error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    category.isActive = false;
    await category.save();
    res.json({ message: "Category archived" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category", error: error.message });
  }
};
