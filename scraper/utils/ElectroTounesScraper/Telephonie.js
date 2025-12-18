const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const ElectroTounesData = require("../../models/ElectroTounesModel");

(async () => {
  let browser;
  let page;

  try {
    // Connect to MongoDB
    await mongoose.connect(
      "mongodb+srv://scrap:scrap123@scrapping.zid0882.mongodb.net/?retryWrites=true&w=majority&appName=Scrapping"
    );

    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    page = await browser.newPage();
    
    // Set a longer timeout and better navigation options
    await page.setDefaultNavigationTimeout(90000);
    await page.setDefaultTimeout(60000);

    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let currentPage = 1;
    const maxPages = 50;
    let newData = [];
    let consecutiveEmptyPages = 0;

    while (currentPage <= maxPages && consecutiveEmptyPages < 3) {
      console.log(`\n=== Scraping page ${currentPage} ===`);
      
      try {
        const url = `https://electrotounes.tn/telephonie?page=${currentPage}`;
        console.log(`Navigating to: ${url}`);
        
        // Use page.evaluate for delay instead of waitForTimeout
        await page.evaluate((delay) => {
          return new Promise(resolve => setTimeout(resolve, delay));
        }, Math.random() * 3000 + 2000);
        
        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 60000
        });

        // Wait for products to load
        try {
          await page.waitForSelector(".ajax_block_product", { timeout: 15000 });
        } catch (e) {
          console.log("Products not found with main selector, trying alternatives...");
          // Try alternative product selectors
          const altSelectors = ['.product-miniature', '.product', '.item-product', '.product-item'];
          let productsFound = false;
          
          for (const selector of altSelectors) {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
              console.log(`Found ${elements.length} products with selector: ${selector}`);
              productsFound = true;
              break;
            }
          }
          
          if (!productsFound) {
            console.log("No products found with any selector");
            consecutiveEmptyPages++;
            currentPage++;
            continue;
          }
        }

        const productsHandles = await page.$$(".ajax_block_product, .product-miniature, .product, .item-product, .product-item");
        
        if (productsHandles.length === 0) {
          console.log("No products found on this page.");
          consecutiveEmptyPages++;
          currentPage++;
          continue;
        }

        // Reset consecutive empty pages counter since we found products
        consecutiveEmptyPages = 0;
        
        console.log(`Found ${productsHandles.length} products`);

        let pageProductsSaved = 0;

        for (const [index, productHandle] of productsHandles.entries()) {
          console.log(`Processing product ${index + 1}/${productsHandles.length}`);
          
          let productData = {};
          
          try {
            // Extract title
            productData.title = await safeExtract(productHandle, [
              ".product-meta > .list_box > h3.h3.product-title > a",
              ".product-title a",
              "h3 a",
              ".product-meta h3 a",
              "h2 a",
              ".product-name a",
              ".product-title > a",
              "h3 > a",
              ".product-meta a",
              "a.product-name"
            ], el => el.textContent.trim());

            console.log(`Title: ${productData.title}`);

            // Skip if title is error
            if (!productData.title || productData.title === "Error") {
              console.log("Skipping product - no title found");
              continue;
            }

            // Extract price - try multiple approaches
            productData.price = await extractPriceAdvanced(productHandle);
            console.log(`Price: ${productData.price}`);

            // Skip if price is error
            if (!productData.price || productData.price === "Error") {
              console.log("Skipping product - no price found");
              continue;
            }

            // Extract reference
            productData.reference = await safeExtract(productHandle, [
              ".info-stock",
              ".product-reference",
              ".reference",
              ".product-id"
            ], el => {
              const text = el.textContent.trim();
              const refMatch = text.match(/R[ée]f[ée]rence:\s*([^\s\n\r]+)/i);
              return refMatch ? refMatch[1].trim() : "Reference not found";
            });

            // Extract description
            productData.description = await safeExtract(productHandle, [
              ".info-stock",
              ".product-description",
              ".product-desc",
              ".description",
              ".product-short-desc"
            ], el => {
              let text = el.textContent.trim();
              // Remove reference and stock info
              text = text.replace(/R[ée]f[ée]rence:\s*[^\n\r]+/gi, "");
              text = text.replace(/(En stock|Epuis[ée]|Sur commande|Stock|Availability)[^\n\r]*/gi, "");
              text = text.replace(/\s+/g, " ").trim();
              return text || "Description not found";
            });

            // Extract availability
            productData.availability = await safeExtract(productHandle, [
              ".info-stock > .in-stock > .instock",
              ".info-stock > .in-stock > .outofstock", 
              ".stock",
              ".availability",
              ".product-availability",
              ".info-stock",
              ".stock-available",
              ".stock-unavailable"
            ], el => {
              const text = el.textContent.trim().toLowerCase();
              if (text.includes('en stock') || text.includes('instock') || text.includes('available')) return "En stock";
              if (text.includes('epuis') || text.includes('outofstock') || text.includes('unavailable')) return "Epuisé";
              if (text.includes('commande') || text.includes('order')) return "Sur commande";
              return "Sur commande";
            });

            // Extract image
            productData.img = await safeExtract(productHandle, [
              ".product-image a img.img-fluid",
              ".product-image img",
              "img",
              ".product-thumbnail img",
              "[itemprop='image']",
              ".img-fluid",
              "a img",
              ".product-image img"
            ], el => {
              let src = el.getAttribute("src");
              if (src && !src.startsWith('http')) {
                src = `https://electrotounes.tn${src}`;
              }
              return src || "Image not found";
            });

            // Extract product URL
            productData.productUrl = await safeExtract(productHandle, [
              ".product-image a",
              ".product-title a", 
              "a",
              ".product-thumbnail a",
              ".product-name a",
              "h3 a",
              "a.product-link"
            ], el => {
              let href = el.getAttribute("href");
              if (href && !href.startsWith('http')) {
                href = `https://electrotounes.tn${href}`;
              }
              return href ? href.trim() : "URL not found";
            });

            productData.categorie = "Telephonie";
            productData.fournisseur = "ElectroTounes";

            // Check if product already exists in database to avoid duplicates
            const existingProduct = await ElectroTounesData.findOne({
              title: productData.title,
              price: productData.price,
              fournisseur: "ElectroTounes"
            });

            if (existingProduct) {
              console.log(`Product already exists: ${productData.title}`);
            } else {
              try {
                const newDataItem = new ElectroTounesData(productData);
                await newDataItem.save();
                console.log(`✓ Saved: ${productData.title} - ${productData.price} DT`);
                newData.push(newDataItem);
                pageProductsSaved++;
              } catch (error) {
                console.error("Error saving to database:", error.message);
              }
            }

          } catch (error) {
            console.error("Error extracting product:", error.message);
            continue;
          }
        }

        console.log(`Page ${currentPage}: Saved ${pageProductsSaved} new products`);

        // Check if we should continue to next page
        if (pageProductsSaved === 0 && currentPage > 5) {
          console.log("No new products saved on this page, might have reached the end");
          consecutiveEmptyPages++;
        }

        currentPage++;

      } catch (error) {
        console.log("Error processing page:", error.message);
        
        // If we get a navigation error, try to recover
        if (error.message.includes('navigation') || error.message.includes('timeout')) {
          console.log("Navigation error, waiting and retrying...");
          await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 5000)));
          consecutiveEmptyPages++;
        } else {
          break;
        }
      }
    }

    console.log(`\n=== Scraping completed ===`);
    console.log(`Reached page: ${currentPage - 1}`);
    console.log(`Total items saved: ${newData.length}`);
    
    if (consecutiveEmptyPages >= 3) {
      console.log("Stopped due to 3 consecutive empty pages.");
    }
    if (currentPage > maxPages) {
      console.log("Reached maximum page limit.");
    }

  } catch (error) {
    console.error("Fatal error:", error);
  } finally {
    // Ensure resources are properly closed
    if (browser) {
      await browser.close().catch(error => {
        console.log("Error closing browser:", error.message);
      });
    }
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close().catch(error => {
        console.log("Error closing MongoDB connection:", error.message);
      });
    }
  }
})();

// Safe extraction with multiple selectors
async function safeExtract(elementHandle, selectors, extractFunction) {
  for (const selector of selectors) {
    try {
      const result = await elementHandle.$eval(selector, extractFunction).catch(() => null);
      if (result && result !== "Error" && result !== "not found" && result !== "") {
        return result;
      }
    } catch (error) {
      continue;
    }
  }
  return "Error";
}

// Advanced price extraction
async function extractPriceAdvanced(productHandle) {
  // Try multiple price selectors
  const priceSelectors = [
    ".product-meta > .product-price-and-shipping > span.price",
    ".product-price-and-shipping .price",
    ".price",
    ".product-price",
    ".current-price",
    ".regular-price",
    '[itemprop="price"]',
    ".price.product-price",
    ".product-price-content",
    ".oe_currency_value",
    ".new-price",
    ".special-price",
    ".price-final",
    ".amount"
  ];

  for (const selector of priceSelectors) {
    try {
      const price = await productHandle.$eval(selector, (el) => {
        let priceString = el.textContent.trim();
        console.log(`Trying selector "${selector}": "${priceString}"`);
        
        // Clean the price string
        priceString = priceString.replace(/\s/g, '')
                                .replace(/[^\d,.-]/g, '')
                                .replace(/,/g, '.');
        
        // Handle multiple dots (like 1.299.000)
        const parts = priceString.split('.');
        if (parts.length > 2) {
          // If there are multiple dots, treat it as thousand separators
          priceString = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
        }
        
        const priceValue = parseFloat(priceString);
        console.log(`Parsed price: ${priceValue}`);
        return !isNaN(priceValue) && priceValue > 0 ? priceValue : null;
      }).catch(() => null);
      
      if (price) return price;
    } catch (error) {
      continue;
    }
  }

  // Fallback: search for price in the entire product text
  try {
    const productText = await productHandle.evaluate(el => el.textContent).catch(() => "");
    
    // More flexible price regex
    const priceRegex = /(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{1,3})?)\s*(?:DT|TND|دينار|€|EUR)?/g;
    const priceMatches = productText.match(priceRegex);
    
    if (priceMatches) {
      for (const match of priceMatches) {
        const cleanMatch = match.replace(/[^\d,.]/g, '');
        if (cleanMatch.length >= 2) {
          let priceString = cleanMatch.replace(/[,\s]/g, '');
          
          // Handle the case where dot is used as thousand separator
          if (priceString.split('.').length > 2) {
            priceString = priceString.replace(/\./g, '');
          } else {
            priceString = priceString.replace(',', '.');
          }
          
          const price = parseFloat(priceString);
          if (!isNaN(price) && price > 1 && price < 100000) { // Reasonable price range
            console.log(`Found price via regex: ${price}`);
            return price;
          }
        }
      }
    }
  } catch (error) {
    console.log("Price regex fallback failed:", error.message);
  }

  return "Error";
}