export default class ProductModel {
  constructor(name, desc, price, imageUrl, category, sizes) {
    this.name = name;
    this.description = desc;
    this.price = price;
    this.imageUrl = imageUrl;
    this.category = category;
    this.sizes = sizes;
  }
}
