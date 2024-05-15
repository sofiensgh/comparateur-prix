const puppeteer = require("puppeteer");
const ScrapedData = require("../../models/scrapedDataModel");
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto('https://www.tunisianet.com.tn/376-telephonie-tablette?page=1&order=product.price.asc',{
    waitUntil: "domcontentloaded"
  });

  // Initialize an empty array to store items
  let newData = [];

  let isBtnDisabled = false;
  while (!isBtnDisabled) {
    const productsHandles = await page.$$('.item-product');
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
          ".wb-product-desc.product-description > span.product-reference",
          (el) => el.textContent.trim()
        );
        const description = await productHandle.$eval(
          ".wb-product-desc.product-description > div.listds > a",
          (el) => el.textContent.trim()
        );

        // Extract availability with multiple conditions
        let availability = 'In stock'; // Default value
        const inStockElement = await productHandle.$(".wb-product-desc.product-description > div > span.in-stock");
        const laterStockElement = await productHandle.$(".wb-product-desc.product-description > div > span.later-stock");

        if (inStockElement) {
          availability = await inStockElement.evaluate(el => el.textContent.trim());
        } else if (laterStockElement) {
          availability = await laterStockElement.evaluate(el => el.textContent.trim());
        } else {
          availability = 'Out of stock'; // Add more conditions as needed
        }

        const img = await productHandle.$eval(
          ".wb-image-block img.img-responsive",
          (el) => el.getAttribute("src")
        );
        
        //extract url product
        const productUrl = await productHandle.$eval(
          ".wb-image-block a", // Assuming the product URL is within an anchor tag inside "wb-image-block"
          (el) => el.href.trim()
        );
        

        // Push the extracted data into the items array
        // items.push({ title, price, reference, discription, availability, img });

        // Create a new ScrapedData instance and log it
        try {
          // Create a new ScrapedData instance
          const newData = new ScrapedData ({ title : title, 
            price : price, 
            reference :reference, 
            description:description , 
            availability : availability,
            img : img , 
            productUrl : productUrl });
          console.log(newData);
        } catch (error) {
          console.error('Error creating ScrapedData instance:', error);
        }
        newData.push({ title : title, 
          price : price, 
          reference :reference, 
          description:description , 
          availability : availability,
          img : img , 
          productUrl : productUrl });
      } catch (error) {
        console.error('Error extracting product details:', error);
        // If there's an error, push a placeholder item into the items array
        newData.push({ title: 'Error', price: 'Error', reference: 'Error', description: 'Error', availability: 'Error', img: 'Error' });
      }
    }

    await page.waitForSelector("li > a.next.js-search-link", { visible: true });
    const is_disabled = await page.$('li > a.next.js-search-link.disabled') !== null;
    isBtnDisabled = is_disabled;
    if (!is_disabled) {
      await page.click("li > a.next.js-search-link");
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    }
  }

  // Log the total number of items
  console.log('Total items:', newData.length);

  // Log or display all items
  // console.log(items);  

  // Close the browser
  await browser.close();
})();