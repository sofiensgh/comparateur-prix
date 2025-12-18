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
    
    // Set timeouts
    await page.setDefaultNavigationTimeout(90000);
    await page.setDefaultTimeout(60000);

    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to first page
    await page.goto("https://electrotounes.tn/beaute-et-bien-etre?page=1", {
      waitUntil: "domcontentloaded",
    });

    let newData = [];
    let consecutiveEmptyPages = 0;
    const processedURLs = new Set();
    let currentPageNumber = 1;
    const maxPages = 200; // High limit as safety

    while (currentPageNumber <= maxPages && consecutiveEmptyPages < 5) {
      console.log(`\n=== Scraping page ${currentPageNumber} ===`);
      
      try {
        // Wait for products to load
        let productsFound = false;
        let productsHandles = [];
        
        const productSelectors = ['.ajax_block_product', '.product-miniature', '.product', '.item-product', '.product-item'];
        
        for (const selector of productSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 15000 });
            productsHandles = await page.$$(selector);
            if (productsHandles.length > 0) {
              console.log(`✓ Found ${productsHandles.length} products with selector: ${selector}`);
              productsFound = true;
              break;
            }
          } catch (e) {
            continue;
          }
        }

        if (!productsFound || productsHandles.length === 0) {
          console.log(`❌ No products found on page ${currentPageNumber}`);
          consecutiveEmptyPages++;
          
          // Debug: check what's actually on the page
          const bodyText = await page.evaluate(() => document.body.textContent);
          if (bodyText.includes("Aucun produit") || bodyText.includes("No products") || bodyText.includes("0 produits")) {
            console.log("✅ Confirmed: Page explicitly states no products available");
          } else {
            console.log("⚠️ Page loaded but no products detected with selectors");
          }
          
          // Try to go to next page anyway
          const hasNextPage = await goToNextPage(page);
          if (hasNextPage) {
            currentPageNumber++;
            continue;
          } else {
            break;
          }
        }

        // Reset consecutive empty pages counter since we found products
        consecutiveEmptyPages = 0;
        
        console.log(`Processing ${productsHandles.length} products`);

        let pageProductsSaved = 0;
        let pageDuplicates = 0;
        let pageErrors = 0;

        for (const [index, productHandle] of productsHandles.entries()) {
          console.log(`\nProcessing product ${index + 1}/${productsHandles.length}`);
          
          let productData = {};
          let productUrl = "";
          
          try {
            // Extract product URL first to check for duplicates
            productUrl = await safeExtract(productHandle, [
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
              return href ? href.trim() : "";
            });

            // Skip if we've already processed this URL in current session
            if (productUrl && processedURLs.has(productUrl)) {
              console.log(`⏭️ Skipping duplicate product (URL already processed): ${productUrl}`);
              pageDuplicates++;
              continue;
            }

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

            if (!productData.title || productData.title === "Error") {
              console.log("❌ Skipping product - no title found");
              pageErrors++;
              continue;
            }

            console.log(`📝 Title: ${productData.title}`);

            // Extract price - try multiple approaches
            productData.price = await extractPriceAdvanced(productHandle);
            
            if (!productData.price || productData.price === "Error") {
              console.log("❌ Skipping product - no price found");
              pageErrors++;
              continue;
            }

            console.log(`💰 Price: ${productData.price} DT`);

            // Extract reference - the schema will clean it automatically
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

            productData.productUrl = productUrl;
            productData.categorie = "SoinBeaute";
            // Note: fournisseur is automatically set by the schema pre-save hook

            // Add URL to processed set to avoid duplicates in current session
            if (productUrl) {
              processedURLs.add(productUrl);
            }

            // Check if product already exists in database to avoid duplicates
            // Since fournisseur is auto-set, we don't need to include it in the query
            const existingProduct = await ElectroTounesData.findOne({
              $or: [
                { title: productData.title, price: productData.price },
                { productUrl: productUrl }
              ]
            });

            if (existingProduct) {
              console.log(`⏭️ Product already exists in database: ${productData.title}`);
              pageDuplicates++;
            } else {
              try {
                const newDataItem = new ElectroTounesData(productData);
                await newDataItem.save();
                console.log(`✅ Saved: ${productData.title} - ${productData.price} DT`);
                newData.push(newDataItem);
                pageProductsSaved++;
              } catch (error) {
                console.error("❌ Error saving to database:", error.message);
                pageErrors++;
              }
            }

          } catch (error) {
            console.error("❌ Error extracting product:", error.message);
            pageErrors++;
            continue;
          }
        }

        console.log(`\n📊 Page ${currentPageNumber} Summary:`);
        console.log(`📦 Products found: ${productsHandles.length}`);
        console.log(`✅ New products saved: ${pageProductsSaved}`);
        console.log(`⏭️ Duplicates skipped: ${pageDuplicates}`);
        console.log(`❌ Extraction errors: ${pageErrors}`);

        // Try to navigate to next page
        console.log("🔄 Attempting to navigate to next page...");
        const hasNextPage = await goToNextPage(page);
        
        if (hasNextPage) {
          currentPageNumber++;
          // Add delay between pages
          await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));
        } else {
          console.log("🏁 No more pages available");
          break;
        }

      } catch (error) {
        console.log("❌ Error processing page:", error.message);
        
        // If we get a navigation error, try to recover
        if (error.message.includes('navigation') || error.message.includes('timeout')) {
          console.log("🔄 Navigation error, trying to continue to next page...");
          const hasNextPage = await goToNextPage(page);
          if (hasNextPage) {
            currentPageNumber++;
            consecutiveEmptyPages++;
          } else {
            break;
          }
        } else {
          console.log("💥 Fatal page error, stopping...");
          break;
        }
      }
    }

    console.log(`\n🎉 Scraping completed!`);
    console.log(`📄 Pages processed: ${currentPageNumber}`);
    console.log(`💾 Total items saved: ${newData.length}`);
    
    if (consecutiveEmptyPages >= 5) {
      console.log("🛑 Stopped due to 5 consecutive empty pages.");
    }
    if (currentPageNumber > maxPages) {
      console.log("📈 Reached maximum page limit.");
    }

  } catch (error) {
    console.error("💥 Fatal error:", error);
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

// Function to navigate to next page using the next button
async function goToNextPage(page) {
  try {
    // Wait for the next page button to be available
    const nextPageButton = await page.$("li.current + li > a.js-search-link");
    
    if (nextPageButton) {
      console.log("➡️ Next page button found, clicking...");
      
      // Click the next button using the evaluate method
      await page.evaluate((btn) => {
        btn.click();
      }, nextPageButton);

      // Wait for navigation to complete
      await page.waitForNavigation({ 
        waitUntil: "domcontentloaded",
        timeout: 30000 
      });
      
      console.log("✅ Successfully navigated to next page");
      return true;
    } else {
      console.log("❌ Next page button not found");
      return false;
    }
  } catch (error) {
    console.log("❌ Error navigating to next page:", error.message);
    return false;
  }
}

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

// Advanced price extraction with better debugging
async function extractPriceAdvanced(productHandle) {
  // Try multiple price selectors with better error handling
  const priceSelectors = [
    ".price",
    ".product-price",
    ".current-price",
    ".regular-price",
    ".new-price",
    ".special-price",
    ".price-final",
    ".amount",
    ".product-price-and-shipping .price",
    ".product-price-content",
    ".oe_currency_value",
    '[itemprop="price"]',
    ".price.product-price",
    ".product-meta .price",
    ".product-price-and-shipping span",
    ".product-meta > .product-price-and-shipping > span.price"
  ];

  for (const selector of priceSelectors) {
    try {
      const price = await productHandle.$eval(selector, (el) => {
        try {
          let priceString = el.textContent.trim();
          console.log(`Trying selector "${selector}": "${priceString}"`);
          
          // Clean the price string more carefully
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
        } catch (e) {
          return null;
        }
      }).catch(() => null);
      
      if (price) {
        console.log(`✅ Successfully extracted price with selector: ${selector}`);
        return price;
      }
    } catch (error) {
      console.log(`❌ Selector "${selector}" failed: ${error.message}`);
      continue;
    }
  }

  // Enhanced fallback: search for price in the entire product text
  try {
    const productText = await productHandle.evaluate(el => el.textContent).catch(() => "");
    
    // More flexible price regex
    const priceRegex = /(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{1,3})?)\s*(?:DT|TND|دينار|€|EUR)?/gi;
    const priceMatches = productText.match(priceRegex);
    
    if (priceMatches) {
      console.log("Price matches found:", priceMatches);
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
          if (!isNaN(price) && price > 1 && price < 100000) {
            console.log(`💰 Found price via regex: ${price}`);
            return price;
          }
        }
      }
    }
  } catch (error) {
    console.log("Price regex fallback failed:", error.message);
  }

  console.log("❌ All price extraction methods failed");
  return "Error";
}