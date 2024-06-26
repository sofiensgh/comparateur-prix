const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const SpaceNetData = require("../../models/SpaceNetModel");

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
  await page.goto("https://spacenet.tn/197-beaute-sante?page=1", {
    waitUntil: "domcontentloaded",
  });

  // Initialize an empty array to store items
  let newData = [];

  let isBtnDisabled = false;
  while (!isBtnDisabled) {
    const productsHandles = await page.$$(".item-product-list");
    for (const productHandle of productsHandles) {
      try {
        // Extract title, price, and image using page.evaluate
        const title = await productHandle.$eval(
          ".right-product > h2 > a ",
          (el) => el.textContent.trim()
        );
        const price = await productHandle.$eval(
          ".product-price-and-shipping > span",
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
          ".product-reference > span",
          (el) => el.textContent.trim()
        );
        const description = await productHandle.$eval(
          ".decriptions-short",
          (el) => el.textContent.trim()
        );

        // Extract availability with multiple conditions
        let availability = "In stock"; // Default value
        const inStockElement = await productHandle.$(
          ".product-quantities > label"
        );
        const laterStockElement = await productHandle.$(
          ".product-quantities > label.label-out-of-stock"
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
          availability = "En arrivage"; // Add more conditions as needed
        }

        const img = await productHandle.$eval(
          "span.cover_image img.img-responsive.product_image",
          (el) => el.getAttribute("src")
        );

        //extract product url
        const productUrl = await productHandle.$eval(
          ".left-product a", // Assuming the product URL is within an anchor tag inside "wb-image-block"
          (el) => el.href.trim()
        );
        const categorie = "SoinBeaute";

        // Create a new ScrapedData instance and save it to MongoDB
        const newDataItem = new SpaceNetData({
          title: title,
          price: price,
          reference: reference,
          description: description,
          availability: availability,
          img: img,
          productUrl: productUrl,
          categorie: categorie,
          fournisseur: SpaceNetData.fournisseur,

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
          fournisseur:"Error",

        });
      }
    }

    // Check if the next button exists
    await page.waitForSelector("li > a.next.js-search-link");
    const is_disabled =
      (await page.$(" li > a.next.disabled.js-search-link")) !== null;
    isBtnDisabled = is_disabled;

    if (!is_disabled) {
      // Click the next button using the evaluate method
      await page.evaluate(() => {
        document.querySelector("li > a.next.js-search-link").click();
      });

      // Wait for navigation to complete
      await page.waitForNavigation({ waitUntil: "domcontentloaded" });
    }
  }

  // Log the total number of items
  console.log("Total items:", newData.length);
  // Close the browser
  await browser.close();
  mongoose.connection.close();

})();
