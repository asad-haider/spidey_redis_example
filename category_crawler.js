const { Spidey } = require("spidey");
const { createClient } = require("redis");

class RedisPipeline {
  client;
  options;
  urlsKey;

  constructor(options) {
    this.options = options;

    this.client = createClient({
      url: this.options.redisUrl,
    });
    this.urlsKey = this.options.urlsKey;
  }

  async start() {
    await this.client.connect();
  }

  async complete() {
    await this.client.disconnect();
  }

  async process(data) {
    await this.client.lPush(this.urlsKey, data);
    return data;
  }
}

class CategorySpidey extends Spidey {
  constructor() {
    super({
      concurrency: 10,
      redisUrl: "redis://localhost:6379",
      urlsKey: "product_urls",
      pipelines: [RedisPipeline],
    });
  }

  categoryUrls = [
    "https://www.amazon.de/-/en/gp/bestsellers/beauty/64272031/ref=zg_bs_nav_beauty_1",
    "https://www.amazon.de/-/en/gp/bestsellers/beauty/122877031/ref=zg_bs_nav_beauty_1",
    "https://www.amazon.de/-/en/gp/bestsellers/beauty/122876031/ref=zg_bs_nav_beauty_1",
  ];

  start() {
    for (const categoryUrl of this.categoryUrls) {
      this.request({ url: categoryUrl }, this.parse.bind(this));
    }
  }

  parse(response) {
    const productUrls = new Set();
    response
      .$("#gridItemRoot .p13n-sc-uncoverable-faceout > a")
      .each((index, element) => {
        productUrls.add(response.$(element).attr("href"));
      });

    productUrls.forEach((url) => {
      url = `https://www.amazon.de${url}`;
      this.save(url);
    });
  }
}

new CategorySpidey().start();
