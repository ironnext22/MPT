import re
from playwright.sync_api import Playwright, sync_playwright, expect


def test_register_new_user():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(ignore_https_errors=True, viewport={"width":1920,"height":1080})
        page = context.new_page()
        page.goto("http://frontend:3000/")
        page.get_by_role("button", name="Zarejestruj się").click()
        page.get_by_role("textbox").first.fill("Forms")
        page.get_by_role("textbox").nth(1).fill("forms@gmail.com")
        page.locator("input[type=\"password\"]").fill("Test123!")
        page.get_by_role("button", name="Zarejestruj się").click()
        page.get_by_role("button", name="OK").click()

        # ---------------------
        context.close()
        browser.close()

