import os
from playwright.sync_api import sync_playwright
import pandas as pd


def scrape_limbus_identities():
    # Target URL
    url = "https://gll-fun.com/?/en/identities"
    identities = []

    with sync_playwright() as p:
        # Launching headless browser
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        # 1. Navigate with a safer wait state
        print(f"Navigating to {url}...")
        try:
            # 'domcontentloaded' is faster and less prone to hanging than 'networkidle'
            page.goto(url, wait_until="domcontentloaded", timeout=60000)

            # 2. Wait for the specific data cards to render
            print("Waiting for Identity cards to render...")
            page.wait_for_selector(
                'a[href*="/identities/id_"]', state="visible", timeout=30000
            )

            # 3. Extract all identity links
            items = page.query_selector_all('a[href*="/identities/id_"]')
            print(f"Found {len(items)} elements. Starting extraction...")

            for item in items:
                full_text = item.inner_text().strip()
                href = item.get_attribute("href")

                # Parsing the "[Identity Name] Sinner" format
                if "]" in full_text:
                    parts = full_text.split("]")
                    identity_display = parts[0].replace("[", "").strip()
                    sinner_name = parts[1].strip()
                else:
                    identity_display = full_text
                    sinner_name = "Unknown"

                identities.append(
                    {
                        "Sinner": sinner_name,
                        "Identity": identity_display,
                        "GLL_ID": href.split("id_")[-1],
                        "URL": "https://gll-fun.com" + href,
                    }
                )

        except Exception as e:
            print(f"Scrape failed: {e}")
        finally:
            browser.close()

    # 4. Save and Report
    if identities:
        df = pd.DataFrame(identities)
        # Drop duplicates if any were caught during the render
        df = df.drop_duplicates(subset=["URL"])

        output_path = "gll_identities.csv"
        df.to_csv(output_path, index=False, encoding="utf-8-sig")
        print("-" * 30)
        print(f"SUCCESS: {len(df)} identities saved to {output_path}")
    else:
        print("ERROR: No data collected.")


if __name__ == "__main__":
    scrape_limbus_identities()


