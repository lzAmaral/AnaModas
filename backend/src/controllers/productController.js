const ProductModel = require('../models/productModel');

class ProductController {
  async getAll(req, res, next) {
    try {
      const { search } = req.query;
      const products = await ProductModel.getAll(search);
      res.json(products);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const product = await ProductModel.create(req.body);
      res.json({ id: product.id });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await ProductModel.update(req.params.id, req.body);
      res.json({ updated });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const deleted = await ProductModel.delete(req.params.id);
      res.json({ deleted });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductController();
