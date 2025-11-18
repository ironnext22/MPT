from playwright.sync_api import sync_playwright


def test_frontend_homepage():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto("http://frontend:3000")
        assert "React App" in page.title()
        browser.close()
