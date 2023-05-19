const { RedisSpidey } = require("spidey-redis");

class ProductSpidey extends RedisSpidey {
  constructor() {
    super({
      concurrency: 10,
      redisUrl: "redis://localhost:6379",
      urlsKey: "product_urls",
    });
  }

  parse(response) {
    const url = response.url;
    const asin = url.match(/\/dp\/([A-Z0-9]{10})/)[1];
    const title = response.$("#productTitle").text().trim();
    this.save({ url, title, asin });
  }
}

new ProductSpidey().start();
