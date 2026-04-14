import os
import json
import time
import pandas as pd
from playwright.sync_api import sync_playwright


def scrape_identity_details():
    try:
        df = pd.read_csv("gll_identities.csv")
    except FileNotFoundError:
        print("Error: gll_identities.csv not found.")
        return

    results = []

    with sync_playwright() as p:
        # Headless=False so you can see if the page is actually loading content
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        for index, row in df.iterrows():
            print(f"[{index + 1}/{len(df)}] Scraping: {row['Identity']}...")

            try:
                # 1. Navigate and wait for the basic structure
                page.goto(row["URL"], wait_until="domcontentloaded", timeout=60000)

                # 2. Force a scroll to trigger any lazy-loaded JavaScript components
                page.mouse.wheel(0, 600)
                time.sleep(2)  # Give the JS time to hydrate the table

                # 3. Use JS to extract data directly from the DOM
                # This is more reliable than selectors when classes are dynamic
                stats_data = page.evaluate("""() => {
                    const data = {};
                    const rows = Array.from(document.querySelectorAll('tr'));
                    rows.forEach(row => {
                        const text = row.innerText;
                        const cells = row.querySelectorAll('td');
                        if (cells.length >= 2) {
                            const label = cells[0].innerText.trim();
                            const value = cells[1].innerText.trim();
                            if (['HP', 'Speed', 'Defense'].includes(label)) {
                                data[label] = value;
                            }
                        }
                    });
                    return data;
                }""")

                # 4. Data Cleaning for Ruina Atlas
                clean_name = (
                    str(row["Identity"]).replace("ØØØ", "").replace("\n", " ").strip()
                )
                clean_sinner = (
                    str(row["Sinner"]).replace("NEW", "").replace("\n", " ").strip()
                )

                # Fallback check: if stats are empty, try one last selector-based wait
                if not stats_data:
                    print("   -> Stats empty, retrying with selector wait...")
                    page.wait_for_selector("text=HP", timeout=5000)
                    # Re-run the JS evaluation if wait succeeded
                    stats_data = page.evaluate("... (same js as above) ...")

                results.append(
                    {
                        "name": clean_name,
                        "sinner": clean_sinner,
                        "stats": stats_data,
                        "url": row["URL"],
                        "gll_id": row["URL"].split("id_")[-1],
                    }
                )

                print(f"   -> Success: {stats_data}")
                time.sleep(1)

            except Exception as e:
                print(f"   -> Skipping {row['Identity']}: Data could not be reached.")

        browser.close()

    # 5. Export to JSON for Milestone M1
    with open("identity_details_full.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4, ensure_ascii=False)

    print(f"\nDone! Processed {len(results)} identities.")


if __name__ == "__main__":
    scrape_identity_details()
