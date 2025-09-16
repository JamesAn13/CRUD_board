// scrapeTournaments.js
import { chromium } from "playwright";

async function scrapePageTitle() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log("Navigating to page...");
  await page.goto("https://bwfbadminton.com/calendar", { waitUntil: "networkidle" });

  console.log("Evaluating page for title...");
  const title = await page.evaluate(() => {
    const element = document.querySelector("#app > div > div > div.page-hero-wrapper > div > div > h2");
    return element?.innerText.trim();
  });

  console.log("Closing browser...");
  await browser.close();
  
  return title;
}

scrapePageTitle().then(result => {
  console.log("Scraping finished.");
  if (result) {
    console.log("Found Title:", result);
  } else {
    console.log("Could not find the title element with the specified selector.");
  }
});

// We are not exporting anything for this test script