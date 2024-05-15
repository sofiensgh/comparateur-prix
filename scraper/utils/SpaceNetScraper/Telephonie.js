const puppeteer = require("puppeteer");
const ScrapedData = require("../../models/scrapedDataModel");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto('https://spacenet.tn/12-telephonie?page=1', {
    waitUntil: "domcontentloaded",
  });

  // Initialize an empty array to store items
  let newData = [];

  let isBtnDisabled = false;
  while (!isBtnDisabled) {
    const productsHandles = await page.$$('.item-product-list');
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
            const priceString = el.textContent.trim().replace(/\s/g, ''); // Remove spaces
            const priceParts = priceString.split(','); // Split by comma
            const wholePart = priceParts[0].replace('.', ''); // Remove dots in the whole part
            const decimalPart = priceParts[1]; // Keep the decimal part as is
            const formattedPrice = `${wholePart}.${decimalPart}`; // Combine whole and decimal parts
            const formattedNumber = parseFloat(formattedPrice.replace(/,/g, '')); // Remove commas and parse as float
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
        let availability = 'In stock'; // Default value
        const inStockElement = await productHandle.$(".product-quantities > label");
        const laterStockElement = await productHandle.$(".product-quantities > label.label-out-of-stock");

        if (inStockElement) {
          availability = await inStockElement.evaluate(el => el.textContent.trim());
        } else if (laterStockElement) {
          availability = await laterStockElement.evaluate(el => el.textContent.trim());
        } else {
          availability = 'En arrivage'; // Add more conditions as needed
        }

        const img = await productHandle.$eval(
          "span.cover_image img.img-responsive.product_image",
          (el) => el.getAttribute("src")
        );

        //extract url product
        const productUrl = await productHandle.$eval(
          ".left-product a", // Assuming the product URL is within an anchor tag inside "wb-image-block"
          (el) => el.href.trim()
        );

        // Push the extracted data into the items array
        //items.push({ title, price, reference, description, availability, img });
        try {
          // Create a new ScrapedData instance
          const newData = new ScrapedData ({ 
            title : title, 
            price : price, 
            reference :reference, 
            description:description , 
            availability : availability,
            img : img , 
            productUrl : productUrl  });
          console.log(newData);
        } catch (error) {
          console.error('Error creating ScrapedData instance:', error);
        }
        newData.push({ 
          title : title, 
          price : price, 
          reference :reference, 
          description:description , 
          availability : availability,
          img : img , 
          productUrl : productUrl});
      /////////////////  
      } catch (error) {
        console.error('Error extracting product details:', error);
        // If there's an error, push a placeholder item into the items array
        newData.push({ title: 'Error', price: 'Error', reference: 'Error', description: 'Error', availability: 'Error' });
      }
    }

    // Check if the next button exists
    await page.waitForSelector("li > a.next.js-search-link");
    const is_disabled = await page.$(" li > a.next.disabled.js-search-link") !== null;
    isBtnDisabled = is_disabled;

    if (!is_disabled) {
      // Click the next button using the evaluate method
      await page.evaluate(() => {
        document.querySelector("li > a.next.js-search-link").click();
      });

      // Wait for navigation to complete
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    }
  }

 

  // Log or display all items
  // console.log(items);
 // Log the total number of items
  console.log('Total items:', newData.length);
  // Close the browser
  await browser.close();
})();