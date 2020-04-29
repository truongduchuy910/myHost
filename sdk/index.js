// XIN CHAO
let seller = { id: "5e4c2235ea30da18df1c210f" };
let url = "https://ad.loaloa.me";
class Graph {
  static async execute({ query }) {
    const response = await fetch(url + "/admin/api", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify({ query: query })
    });
    return await response.json();
  }
  constructor() {
    this.gql = new Object();
    this.gql.query;
    this.gql.mutation;
  }
  query({ condition }) {
    return Graph.execute({ query: this.gql.query({ condition }) });
  }
  mutation({ data }) {
    console.log(this.gql.mutation({ data }));
    return Graph.execute({ query: this.gql.mutation({ data }) });
  }
}
class Html {
  constructor({ id }) {
    this.isExist = false;
    this.box = $(`#${id}`);
    if (this.box.length) {
      this.isExist = true;
      console.log("find: ", id);
    }
  }
}
class Arrays extends Html {
  constructor({ id }) {
    super({ id });
    this.item = this.box.html();
    this.empty();
  }
  add(data) {
    if (this.isExist) {
      let html = this.item;
      data.forEach(({ template, value }) => {
        const regExp = new RegExp(template, "g");
        html = html.replace(regExp, value);
      });
      this.box.append(html);
    }
  }
  empty() {
    this.box.empty();
  }
}
class Paragraphs extends Html {
  constructor({ id }) {
    super({ id });
  }
  render({ value }) {
    if (this.isExist && value) this.box[0].innerText = value;
  }
}
class Images extends Html {
  constructor({ id }) {
    super({ id });
  }
  render({ src, alt }) {
    if (this.isExist) {
      this.box[0].setAttribute("src", src);
      this.box[0].setAttribute("alt", alt);
    }
  }
}
class Customers extends Graph {
  constructor({ name, phone, address, order }) {
    super();
    this.name = new Paragraphs({ id: name });
    this.phone = new Paragraphs({ id: phone });
    this.address = new Paragraphs({ id: address });
    this.order = new Paragraphs({ id: order });
    this.status = true;
    this.customer = "";
  }
  async createCustomer({ phone, name, address }) {
    this.gql.mutation = ({
      data: {
        phone,
        name,
        address,
        seller: { id }
      }
    }) => `mutation {
        createCustomer(
          data: {
            phone: "${phone}",
            name: "${name}",
            address:"${address}",
            seller: { connect: { id: "${id}" } }
          }
        ) {
          id
        }
      }`;
    const {
      data: {
        createCustomer: { id }
      }
    } = await this.mutation({ data: { phone, name, address, seller } });
    return id;
  }
  async createBill({ product, customer }) {
    this.gql.mutation = ({
      data: {
        product,
        customer,
        seller: { id }
      }
    }) => `mutation {
        createBill(
          data: {
            customer:{ connect:{ id:"${customer}"}},
            products:{connect:[{id:"${product}"}]},
            seller: { connect: { id: "${id}" }}
          }
        ) {
          id
        }
      }`;
    const { data } = await this.mutation({
      data: { product, customer, seller }
    });
    console.log(data);
  }
  start() {
    this.phone.box.val(localStorage.getItem("phone"));
    this.order.box.click(async btn => {
      const name = this.name.box.val();
      const phone = this.phone.box.val();
      const address = this.address.box.val();
      if (phone.length > 8) {
        if (this.status) {
          const customer = await this.matching({
            condition: `phone:"${phone}"`
          });
          if (customer) {
            const id = await this.createBill({
              product: detail.id,
              customer: customer.id
            });
            console.log(id);
            this.order.render({ value: "Đặt hàng thành công!" });
            this.status = false;
          } else {
            console.log("Tạo người dùng");
            this.order.render({ value: this.status });
            const id = await this.createCustomer({
              phone,
              name,
              address
            });
            this.customer = id;
            this.order.render({ value: "Nhấn lần nữa để xác nhận!" });
          }
        } else {
          this.order.render({ value: "Đã đặt hàng thành công!" });
        }
      } else {
        this.order.render({ value: "Kiểm tra số điện thoại và thử lại!" });
      }
    });
  }
  async matching({ condition }) {
    this.gql.query = ({ condition }) => `query {
      allCustomers(where:{seller:{id:"${seller.id}"},
      AND: {${condition}}}) {
        id,
        name,
        phone,
        address
      }
    }`;
    const {
      data: { allCustomers }
    } = await this.query({ condition });
    if (allCustomers) {
      return allCustomers[0];
    } else {
      return false;
    }
  }
}
class Details extends Graph {
  constructor({
    name,
    price,
    imageMain,
    imageOrthers,
    categoryName,
    categoryUrl,
    brandName,
    brandUrl,
    attributeName,
    description,
    detail,
    guide
  }) {
    super();
    this.gql.query = ({ condition }) => `query {
      allProducts(where:{ seller:{id:"${seller.id}"},
      AND: {${condition}}}) {
        id,
        name,
        price,
        images {
          file {
            publicUrl
          }
        },
        category {
          name,
          url
        },
        brand {
          name,
          url
        },
        attributes {
          name
        },
        description,
        file {
          publicUrl
        },
        guide
      }
    }`;
    this.name = new Paragraphs({ id: name });
    this.price = new Paragraphs({ id: price });
    this.imageMain = new Images({ id: imageMain });
    this.imageOrthers = new Arrays({ id: imageOrthers });
    this.categoryName = new Paragraphs({ id: categoryName });
    this.brandName = new Paragraphs({ id: brandName });
    this.attributeName = new Arrays({ id: attributeName });
    this.description = new Paragraphs({ id: description });
    this.detail = new Images({ id: detail });
    this.guide = new Paragraphs({ id: guide });
  }
  async load({ condition }) {
    const {
      data: { allProducts }
    } = await this.query({ condition });
    if (allProducts.length) {
      const {
        id,
        name,
        price,
        images,
        category,
        brand,
        attributes,
        description,
        file,
        guide
      } = allProducts[0];
      this.id = id;
      this.name.render({ value: name });
      this.price.render({ value: Products.formatMoney(price, 0) });
      this.imageMain.render({ src: url + images[0].file.publicUrl });
      if (category) this.categoryName.render({ value: category.name });
      if (brand) this.brandName.render({ value: brand.name });
      this.attributeName.empty();
      if (attributes.length)
        attributes.forEach(attribute => {
          this.attributeName.add([
            {
              template: "attribute",
              value: attribute.name
            }
          ]);
        });

      if (images.length > 1) {
        this.imageOrthers.empty();
        for (let i = 1; i < images.length; i++) {
          this.imageOrthers.add([
            {
              template: "duong-dan-hinh-anh",
              value: url + images[i].file.publicUrl
            }
          ]);
        }
      }
      if (description) this.description.render({ value: description });
      if (file) this.detail.render({ src: url + file.publicUrl });
      if (guide) this.guide.render({ value: guide });
    }
  }
}
class PresentFilter extends Graph {
  constructor({ name }) {
    super();
    this.name = new Paragraphs({ id: name });
  }
  async withCategory({ url }) {
    this.gql.query = ({ condition }) => `query {
      allCategories(where:{seller:{id:"${seller.id}"},
      AND: {${condition}}}) {
        name,
        url
      }
    }`;
    const {
      data: { allCategories }
    } = await this.query({ condition: `url: "${url}"` });
    if (allCategories.length) {
      const category = allCategories[0].name;
      this.name.render({ value: category });
    }
  }
  async withBrand({ url }) {
    this.gql.query = ({ condition }) => `query {
    allBrands(where:{seller:{id:"${seller.id}"},
    AND: {${condition}}}) {
      name,
      url
    }
  }`;
    const {
      data: { allBrands }
    } = await this.query({ condition: `url: "${url}"` });
    if (allBrands.length) {
      const brand = allBrands[0].name;
      this.name.render({ value: brand });
    }
  }
}
class Lists extends Graph {
  constructor({ id }) {
    super();
    this.html = new Arrays({ id });
  }
}
class Banners extends Lists {
  constructor({ id }) {
    super({ id });
    this.gql.query = ({ condition }) => `query {
      allBanners(where:{seller:{id:"${seller.id}"},
      AND: {${condition}}}) {
        file {
          publicUrl
        }
      }
    }`;
  }
  async load({ condition }) {
    const {
      data: { allBanners }
    } = await this.query({ condition });
    if (allBanners)
      allBanners.forEach(banner => {
        this.html.add([
          { template: "duong-dan-hinh-anh", value: url + banner.file.publicUrl }
        ]);
      });
  }
}
class Products extends Lists {
  constructor({ id }) {
    super({ id });
    this.limit = 100;
    this.gql.query = ({ condition }) => `query {
      allProducts(first:${this.limit}, where: { seller:{id:"${seller.id}"},
      AND: {${condition}}}) {
        name
        price
        images {
          file {
            publicUrl
          }
        }
        url
      }
    }`;
  }
  async load({ condition }) {
    const {
      data: { allProducts }
    } = await this.query({ condition });
    this.show(allProducts);
  }
  show(data) {
    this.html.empty();
    data.forEach(p => {
      this.html.add([
        {
          template: "duong-dan-hinh-anh",
          value: url + p.images[0].file.publicUrl
        },
        { template: "san-pham", value: p.name },
        { template: "gia", value: Products.formatMoney(p.price, 0) },
        { template: "duong-dan", value: "/detail/?detail=" + p.url }
      ]);
    });
  }
  static formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
      const negativeSign = amount < 0 ? "-" : "";
      let i = parseInt(
        (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))
      ).toString();
      let j = i.length > 3 ? i.length % 3 : 0;
      return (
        negativeSign +
        (j ? i.substr(0, j) + thousands : "") +
        i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
        (decimalCount
          ? decimal +
            Math.abs(amount - i)
              .toFixed(decimalCount)
              .slice(2)
          : "")
      );
    } catch (e) {
      console.log(e);
    }
  }
}
class Brands extends Lists {
  constructor({ id }) {
    super({ id });
    this.gql.query = ({ condition }) => `query {
      allBrands(where:{seller:{id:"${seller.id}"},
      AND: {${condition}}}) {
        name,
        url
      }
    }`;
  }
  async load({ condition }) {
    const {
      data: { allBrands }
    } = await this.query({ condition });
    this.show(allBrands);
  }
  show(data) {
    this.html.empty();
    data.forEach(p => {
      this.html.add([
        { template: "thuong-hieu", value: p.name },
        { template: "duong-dan", value: p.url }
      ]);
    });
  }
}
class Categories extends Lists {
  constructor({ id }) {
    super({ id });
    this.gql.query = ({ condition }) => `query {
      allCategories(where:{seller:{id:"${seller.id}"},
      AND: {${condition}}}) {
        name,
        url
      }
    }`;
  }
  async load({ condition }) {
    const {
      data: { allCategories }
    } = await this.query({ condition });
    this.show(allCategories);
  }
  show(data) {
    this.html.empty();
    data.forEach(p => {
      this.html.add([
        { template: "danh-muc", value: p.name },
        { template: "duong-dan", value: p.url }
      ]);
    });
  }
}
function searchToObject() {
  let pairs = window.location.search.substring(1).split("&"),
    obj = {},
    pair,
    i;
  for (i in pairs) {
    if (pairs[i] === "") continue;
    pair = pairs[i].split("=");
    obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return obj;
}

/* INIT */
const newArrival = new Products({ id: "new-products" });
const bestSeller = new Products({ id: "bestSeller-products" });
let filter = new Products({ id: "products-main" });
let search = new Products({ id: "products-search" });
search.limit = 12;
let categories = new Categories({ id: "categories" });
let brands = new Brands({ id: "brands" });
let categoriesNav = new Categories({ id: "categories-navbar" });
let banners = new Banners({ id: "banners" });
let detail = new Details({
  name: "detail-name",
  price: "detail-price",
  categoryName: "detail-category",
  brandName: "detail-brand",
  attributeName: "detail-attribute",
  imageMain: "detail-imageMain",
  imageOrthers: "detail-imageMore",
  description: "detail-description",
  detail: "detail-info",
  guide: "detail-guide"
});

let customer = new Customers({
  name: "customer-name",
  phone: "customer-phone",
  address: "customer-address",
  order: "customer-order"
});

let inputSearch = $("#input-search");
let presentFilter = new PresentFilter({ name: "present-filter" });
let gobackBtn = $("#go-back");
let condition = searchToObject();

customer.start();
banners.load({ condition: `` });
categoriesNav.load({ condition: `` });
categories.load({ condition: `` });
brands.load({ condition: `` });
newArrival.load({ condition: `suggestions: new` });
bestSeller.load({ condition: `suggestions: bestSeller` });
if (condition.category) {
  presentFilter.withCategory({ url: condition.category });
  filter.load({ condition: `category: {url:"${condition.category}"}` });
}
if (condition.brand) {
  presentFilter.withBrand({ url: condition.brand });
  filter.load({ condition: `brand: {url:"${condition.brand}"}` });
}
if (condition.detail) {
  detail.load({ condition: `url: "${condition.detail}"` });
}
if (gobackBtn.length) {
  gobackBtn.click(() => {
    window.history.back();
  });
}

/* EVENT */
inputSearch.keyup(input => {
  const keyword = input.target.value;
  if (keyword.length > 1)
    search.load({ condition: `name_contains_i: "${keyword}"` });
});
/* SMOOTH */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    e.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth"
    });
  });
});

/*
Messenger Extensions JS SDK Reference
*/
// let send = (image, name) => {
//   (function(d, s, id) {
//     var js,
//       fjs = d.getElementsByTagName(s)[0];
//     if (d.getElementById(id)) {
//       return;
//     }
//     js = d.createElement(s);
//     js.id = id;
//     js.src = "https://connect.facebook.net/en_US/messenger.Extensions.js";
//     fjs.parentNode.insertBefore(js, fjs);
//   })(document, "script", "Messenger");
//   let message = {
//     text: "hello, world!",
//     attachment: {
//       type: "image",
//       payload: {
//         url: "http://www.messenger-rocks.com/image.jpg",
//         is_reusable: true
//       }
//     }
//   };
//   MessengerExtensions.beginShareFlow(
//     function(share_response) {
//       if (share_response.is_sent) {
//       }
//     },
//     function(errorCode, errorMessage) {},
//     message,
//     "broadcast"
//   );
// };
