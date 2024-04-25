const { Material } = require("../models/index");
const { User } = require("../models/index");
const { Op } = require("sequelize");
const {
  getPagination,
  getPaginationData,
} = require("../utils/paginationHelper");
const { getId } = require("../utils/youtubeHelper");

// GET /api/materials
// /api/materials //return default size 4 materials
// /api/materials?title=some-material-title //return material by title
// /api/materials?page=page-number //return specific page
exports.getAllMaterials = async (req, res) => {
  const { page, size, title } = req.query;
  const searchTerm = req.query.search || "";
  const { currentPage, pageSize, offset } = getPagination(page, size);
  try {
    const { count, rows } = await Material.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
        ]
      },
      offset,
      limit: pageSize,
      order: [["createdAt", "DESC"]],
    });
    const response = getPaginationData({ count, rows }, currentPage, pageSize);
    res.json(response);
  } catch (error) {
    console.error("Error retrieving materials:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/materials/:id
exports.getMaterialsById = async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (material) {
      res.json(material);
    } else {
      res
        .status(404)
        .json({ message: `Material with id=${req.params.id} not found` });
    }
  } catch (error) {
    console.error("Error retrieving material: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/materials
exports.createMaterials = async (req, res) => {
  try {
    const userId = res.locals.user.uid;
    const { title, description, materialURL, duration } = req.body;

    const myId = getId(materialURL);
    if (myId === "error") {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const embedUrl = `https://www.youtube.com/embed/${myId}?autoplay=1`;
    const imageUrl = `https://img.youtube.com/vi/${myId}/0.jpg`;

    const newMaterial = await Material.create({
      userId,
      title,
      description,
      materialURL: embedUrl,
      duration,
      image: imageUrl,
    });
    res.status(201).json(newMaterial);
  } catch (error) {
    console.error("Error creating a new material:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/materials/:id
exports.updateMaterials = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: res.locals.user.email },
    });

    if (user.roleId === 3) {
      return res.status(403).json({ message: "User not authorized." });
    }

    const material = await Material.findByPk(req.params.id);
    if (!material) {
      return res
        .status(404)
        .json({ message: `Material with id: ${req.params.id} not found` });
    }

    const { title, description, materialURL, duration } = req.body;

    let myId = materialURL ? getId(materialURL) : null;
    if (materialURL && myId === "error") {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const embedUrl = materialURL
      ? `https://www.youtube.com/embed/${myId}?autoplay=1`
      : material.materialURL;
    const imageUrl = materialURL
      ? `https://img.youtube.com/vi/${myId}/0.jpg`
      : material.image;

    const updatedData = {
      title: title || material.title,
      description: description || material.description,
      materialURL: embedUrl,
      duration: duration || material.duration,
      image: imageUrl,
    };

    const numAffectedRows = await Material.update(updatedData, {
      where: { id: req.params.id },
    });
    if (numAffectedRows[0] > 0) {
      const updatedMaterial = await Material.findByPk(req.params.id);
      res.json(updatedMaterial);
    } else {
      res
        .status(404)
        .json({ message: `Material with id: ${req.params.id} not found` });
    }
  } catch (error) {
    console.error("Error updating material:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/materials/:id
exports.deleteMaterials = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: res.locals.user.email },
    });

    if (user.roleId === 3) {
      return res.status(403).json({ message: "User not authorized." });
    }

    const numDeleted = await Material.destroy({ where: { id: req.params.id } });
    if (numDeleted) {
      res.status(204).json({ message: "Material deleted successfully" });
    } else {
      res
        .status(404)
        .json({ message: `Material with id=${req.params.id} not found` });
    }
  } catch (error) {
    console.error("Error deleting Material:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
