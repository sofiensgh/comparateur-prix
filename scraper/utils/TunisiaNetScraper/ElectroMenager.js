const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const TunisiaNetData = require("../../models/TunisiaNetModel");

(async () => {
  // Connect to MongoDB
  await mongoose.connect(
    "mongodb+srv://scrap:scrap123@scrapping.zid0882.mongodb.net/?retryWrites=true&w=majority&appName=Scrapping"
  );

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto(
    "https://www.tunisianet.com.tn/397-electromenager-tunisianet?page=2&order=product.price.asc",
    {
      waitUntil: "domcontentloaded",
    }
  );

  // Initialize an empty array to store items
  let newData = [];

  let isBtnDisabled = false;
  while (!isBtnDisabled) {
    const productsHandles = await page.$$(".item-product");
    for (const productHandle of productsHandles) {
      try {
        // Extract title, price, and image using page.evaluate
        const title = await productHandle.$eval(
          ".wb-product-desc.product-description > h2 > a",
          (el) => el.textContent.trim()
        );
        const price = await productHandle.$eval(
          ".wb-product-desc.product-description > .product-price-and-shipping > span",
          (el) => {
            const priceString = el.textContent.trim().replace(/\s/g, ""); // Remove spaces
            const priceParts = priceString.split(","); // Split by comma
            const wholePart = priceParts[0].replace(".", ""); // Remove dots in the whole part
            const decimalPart = priceParts[1]; // Keep the decimal part as is
            const formattedPrice = `${wholePart}.${decimalPart}`; // Combine whole and decimal parts
            const formattedNumber = parseFloat(
              formattedPrice.replace(/,/g, "")
            ); // Remove commas and parse as float
            return !isNaN(formattedNumber) ? formattedNumber : null; // Check if it's a valid number
          }
        );

        const reference = await productHandle.$eval(
          ".wb-product-desc.product-description > span.product-reference",
          (el) => el.textContent.trim()
        );
        const description = await productHandle.$eval(
          ".wb-product-desc.product-description > div.listds > a",
          (el) => el.textContent.trim()
        );

        // Extract availability with multiple conditions
        let availability = "In stock"; // Default value
        const inStockElement = await productHandle.$(
          ".wb-product-desc.product-description > div > span.in-stock"
        );
        const laterStockElement = await productHandle.$(
          ".wb-product-desc.product-description > div > span.later-stock"
        );

        if (inStockElement) {
          availability = await inStockElement.evaluate((el) =>
            el.textContent.trim()
          );
        } else if (laterStockElement) {
          availability = await laterStockElement.evaluate((el) =>
            el.textContent.trim()
          );
        } else {
          availability = "Out of stock"; // Add more conditions as needed
        }

        const img = await productHandle.$eval(
          ".wb-image-block img.img-responsive",
          (el) => el.getAttribute("src")
        );

        //extract product url
        const productUrl = await productHandle.$eval(
          ".wb-image-block a", // Assuming the product URL is within an anchor tag inside "wb-image-block"
          (el) => el.href.trim()
        );
        const categorie = "Electromenager";

        // Create a new ScrapedData instance and save it to MongoDB
        const newDataItem = new TunisiaNetData({
          title: title,
          price: price,
          reference: reference,
          description: description,
          availability: availability,
          img: img,
          productUrl: productUrl,
          categorie: categorie,
          fournisseur: TunisiaNetData.fournisseur,

          
        });
        await newDataItem.save(); // Save to MongoDB
        console.log("Saved to database:", newDataItem);
        newData.push(newDataItem);
      } catch (error) {
        console.error("Error extracting product details:", error);
        // If there's an error, push a placeholder item into the newData array
        newData.push({
          title: "Error",
          price: "Error",
          reference: "Error",
          description: "Error",
          availability: "Error",
          img: "Error",
          categorie:"Error",
          fournisseur:"Error"
        });
      }
    }

    await page.waitForSelector("li > a.next.js-search-link", { visible: true });
    const is_disabled =
      (await page.$("li > a.next.js-search-link.disabled")) !== null;
    isBtnDisabled = is_disabled;
    if (!is_disabled) {
      await page.click("li > a.next.js-search-link");
      await page.waitForNavigation({ waitUntil: "domcontentloaded" });
    }
  }

  // Log the total number of items
  console.log("Total items:", newData.length);

  // Close the browser
  await browser.close();
  mongoose.connection.close();

})();
