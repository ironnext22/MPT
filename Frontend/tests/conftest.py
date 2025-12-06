import re
from playwright.sync_api import Page, Playwright, sync_playwright, expect
import pytest
import logging
logger = logging.getLogger(__name__)


@pytest.fixture(scope="function")
def home_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=400)
        context = browser.new_context(ignore_https_errors=True, viewport={"width":1920,"height":1080})
        page = context.new_page()
        page.goto("http://frontend:3000/")
        logger.info("Navigated to homepage")
        yield page
        logger.info("Closing browser context")
        context.close()
        browser.close()


@pytest.fixture(scope="function")
def login(home_page):
    logger.info("Logging in with existing user 'admin'")
    page = home_page
    page.get_by_role("button", name="Zaloguj się").click()
    page.get_by_role("textbox").first.fill("admin")
    page.locator("input[type=\"password\"]").fill("admin")
    page.get_by_role("button", name="Zaloguj").click()
    expect(page.get_by_role("navigation")).to_contain_text("Wyloguj")
    logger.info("Logged in successfully as 'admin'")
    return page