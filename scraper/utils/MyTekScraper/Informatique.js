// ordinateurs-portables
const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const ScrapedData = require("../../models/scrapedDataModel");

(async () => {
  // Connect to MongoDB
  await mongoose.connect(
    "mongodb+srv://scrap:scrap123@scrapping.zid0882.mongodb.net/?retryWrites=true&w=majority&appName=Scrapping"
  );

  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto(
    "https://www.mytek.tn/electromenager/ordinateurs-portables.html?p=1",
    {
      waitUntil: "domcontentloaded",
    }
  );

  // Function to get the class of the last page
  const getLastPageNumber = async () => {
    const lastPageElement = await page.$(
      ".pages > ul.items.pages-items > li.page.last > span:last-child"
    ); // Select the last span inside the li.page.last element
    return lastPageElement
      ? await lastPageElement.evaluate((el) => el.textContent.trim())
      : null;
  };

  // Initialize an empty array to store items
  let newData = [];
  //set a counter
  let currentPage = 1;

  while (true) {
    const productsHandles = await page.$$(
      ".item.product.product-item > .product-item-info"
    );
    for (const productHandle of productsHandles) {
      try {
        // Extract title, price, description, availability, and image
        const titleElement = await productHandle.$(
          ".prdtBILDetails > .product.details.product-item-details > strong.product.name.product-item-name > a"
        );
        const title = titleElement
          ? await titleElement.evaluate((el) => el.textContent.trim())
          : "Title not found";
        // Extract price
        let price = 0; // Initialize price as a number with a default value

        const hasNewPrice = await productHandle.$(
          ".price-box.price-final_price > span.special-price > span.price-container.price-final_price.tax > span.price-wrapper > span.price"
        );
        const defaultPrice = await productHandle.$(
          ".price-box.price-final_price > span.price-container.price-final_price.tax > span.price-wrapper > span.price"
        );

        if (hasNewPrice) {
          price = await hasNewPrice.evaluate((el) => {
            const priceString = el.textContent.trim().replace(/\s/g, ""); // Remove spaces
            const priceParts = priceString.split(","); // Split by comma
            const wholePart = priceParts[0].replace(".", ""); // Remove dots in the whole part
            const decimalPart = priceParts[1]; // Keep the decimal part as is
            const formattedPrice = `${wholePart}.${decimalPart}`; // Combine whole and decimal parts
            const formattedNumber = parseFloat(
              formattedPrice.replace(/,/g, "")
            ); // Remove commas and parse as float
            return !isNaN(formattedNumber) ? formattedNumber : null; // Check if it's a valid number
          });
        } else if (defaultPrice) {
          price = await defaultPrice.evaluate((el) => {
            const priceString = el.textContent.trim().replace(/\s/g, ""); // Remove spaces
            const priceParts = priceString.split(","); // Split by comma
            const wholePart = priceParts[0].replace(".", ""); // Remove dots in the whole part
            const decimalPart = priceParts[1]; // Keep the decimal part as is
            const formattedPrice = `${wholePart}.${decimalPart}`; // Combine whole and decimal parts
            const formattedNumber = parseFloat(
              formattedPrice.replace(/,/g, "")
            ); // Remove commas and parse as float
            return !isNaN(formattedNumber) ? formattedNumber : null; // Check if it's a valid number
          });
        } else {
          console.log("Error: Price not found");
          continue; // Skip this item and move to the next one
        }

        const reference = await productHandle.$eval(
          ".prdtBILDetails >.product.details.product-item-details > .skuDesktop",
          (el) => el.textContent.trim()
        );
        // Extract description
        const descriptionElement = await productHandle.$(".strigDesc");
        const description = descriptionElement
          ? await descriptionElement.evaluate((el) => {
              const paragraphs = el.querySelectorAll("p");
              let text = "";
              paragraphs.forEach((p) => {
                text += p.textContent.trim() + " ";
              });
              return text.trim();
            })
          : "Description not found";
        // Extract availability
        let availability = "In stock"; // Default value
        const inStockElement = await productHandle.$(
          ".card.text-white.bg-secondary.mb-3 > .card-body > .stock.available > span"
        );
        const laterStockElement = await productHandle.$(
          ".card.text-white.bg-secondary.mb-3 > .card-body > .stock.unavailable > span"
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

        // Extract image source
        const img = await productHandle.$eval(
          "span.product-image-wrapper img.product-image-photo",
          (el) => el.getAttribute("src")
        );

        // extract product url

        const productUrl = await productHandle.$eval(
          ".prdtBILImg a", // Assuming the product URL is within an anchor tag inside "wb-image-block"
          (el) => el.href.trim()
        );

        // Push the extracted data into the items array
        try {
          // Create a new ScrapedData instance and save it to MongoDB
          const newDataItem = new ScrapedData({
            title: title,
            price: price,
            reference: reference,
            description: description,
            availability: availability,
            img: img,
            productUrl: productUrl,
          });
          await newDataItem.save(); // Save to MongoDB
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
        // Log the error and move to the next item
      }
    }

    // Move to the next page
    // Move to the next page
    const nextPageLink = await page.$(".pages-item-next > a.action.next");
    if (nextPageLink) {
      console.log("Navigating to next page...");
      await nextPageLink.click();
      await page.waitForNavigation({ waitUntil: "domcontentloaded" });
    } else {
      console.log("Next page link not found. Scraping complete.");
      break;
    }

    currentPage++;
  }

  // Get the class of the last page
  const lastPageNumber = await getLastPageNumber();
  console.log("Total page number:", lastPageNumber);
  // Log or display all items
  // console.log(items);

  // Log the total number of items
  console.log("Total items:", newData.length);

  // Close the browser
  await browser.close;
})();
