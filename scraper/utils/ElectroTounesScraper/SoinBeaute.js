// https://electrotounes.tn/electromenager?page=1

const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const ElectroTounesData = require("../../models/ElectroTounesModel");

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
  await page.goto("https://electrotounes.tn/beaute-et-bien-etre?page=1", {
    waitUntil: "domcontentloaded",
  });

  // Initialize an empty array to store items
  let newData = [];

  while (true) {
    const productsHandles = await page.$$(".ajax_block_product");
    for (const productHandle of productsHandles) {
      try {
        // Extract title using page.evaluate
        const title = await productHandle.$eval(
          ".product-meta > .list_box > h3.h3.product-title > a",
          (el) => el.textContent.trim()
        );
        //extract price
        const price = await productHandle.$eval(
          ".product-meta > .product-price-and-shipping > span.price",
          (el) => {
            const priceString = el.textContent.trim().replace(/\s/g, ""); // Remove spaces
            const priceParts = priceString.split(","); // Split by commas
            const wholePart = priceParts[0].replace(".", ""); // Remove dots in the whole part
            const decimalPart = priceParts[1]; // Keep the decimal part as is
            const formattedPrice = `${wholePart}.${decimalPart}`; // Combine whole and decimal parts
            const formattedNumber = parseFloat(
              formattedPrice.replace(/,/g, "")
            ); // Remove commas and parse as float
            return !isNaN(formattedNumber) ? formattedNumber : null; // Check if it's a valid number
          }
        );
        const referenceElement = await productHandle.$(".info-stock b");
        const reference = referenceElement
          ? await referenceElement.evaluate((el) =>
              el.nextSibling.textContent.trim()
            )
          : "Reference not found";
        //extract a description
        const descriptionElement = await productHandle.$(".info-stock");
        const description = descriptionElement
          ? await descriptionElement.evaluate((el) => {
              let text = el.textContent.trim();
              // Remove "Réference" line and "Epuisé" line
              text = text.replace(/Réference:\s+[^\n]+\n\s+Epuisé\n/, "");
              // Replace remaining newline characters with spaces
              text = text.replace(/\n/g, "");
              // Remove extra spaces between sentences
              text = text.replace(/\s+/g, " ");
              return text;
            })
          : "Description not found";

        // Extract availability with multiple conditions
        let availability = "In stock"; // Default value
        const inStockElement = await productHandle.$(
          ".info-stock > .in-stock > .instock"
        );
        const laterStockElement = await productHandle.$(
          ".info-stock > .in-stock > .outofstock"
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
          availability = "Sur commande"; // Add more conditions as needed
        }
        //extract image

        const img = await productHandle.$eval(
          ".product-image a img.img-fluid",
          (el) => el.getAttribute("src")
        );
        //extract url product
        const productUrl = await productHandle.$eval(
          ".product-image a", // Assuming the product URL is within an anchor tag inside "wb-image-block"
          (el) => el.href.trim()
        );
        const categorie = "SoinBeaute";
        // Create a new ScrapedData instance and save it to the database
        try {
          const newDataItem = new ElectroTounesData({
            title: title,
            price: price,
            reference: reference,
            description: description,
            availability: availability,
            img: img,
            productUrl: productUrl,
            categorie: categorie,
            fournisseur: ElectroTounesData.fournisseur,

          });
          await newDataItem.save();
          console.log("Saved to database:", newDataItem);
          newData.push(newDataItem);
        } catch (error) {
          console.error(
            "Error saving ScrapedData instance to database:",
            error
          );
        }
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
          productUrl: "Error",
          categorie: "Error",
          fournisseur: "Error",

        });
      }
    }

    const nextPageButton = await page.$("li.current + li > a.js-search-link");
    if (nextPageButton) {
      // Click the next button using the evaluate method
      await page.evaluate((btn) => {
        btn.click();
      }, nextPageButton);

      // Wait for navigation to complete
      await page.waitForNavigation({ waitUntil: "domcontentloaded" });
    } else {
      console.log("Next page button not found. Exiting loop.");
      break; // Exit the loop if there is no next page button
    }
  }

  // Log the total number of items
  console.log("Total items:", newData.length);

  // Close the browser and the MongoDB connection
  await browser.close();
  mongoose.connection.close();
})();
