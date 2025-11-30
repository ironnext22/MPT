import re
from playwright.sync_api import Page, Playwright, sync_playwright, expect
import pytest
import logging
import random
import string
import time
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


def test_register_new_user(home_page):
    length = 8
    user_name = ''.join(random.choices(string.ascii_letters + string.digits, k=length))
    logger.info(f"Creating new user with username: {user_name}")
    page = home_page
    page.get_by_role("button", name="Zarejestruj się").click()
    page.get_by_role("textbox").first.fill(user_name)
    page.get_by_role("textbox").nth(1).fill(f"{user_name}@gmail.com")
    page.locator("input[type=\"password\"]").fill(user_name)
    page.get_by_role("button", name="Zarejestruj się").click()
    expect(page.locator("h3")).to_contain_text("Sukces")
    expect(page.locator("#root")).to_contain_text("Zarejestrowano pomyślnie! Możesz się zalogować.")
    page.get_by_role("button", name="OK").click()
    logger.info("User registration successful")


def test_login_existing_user(home_page):
    logger.info("Logging in with existing user 'admin'")
    page = home_page
    page.get_by_role("button", name="Zaloguj się").click()
    expect(page.get_by_role("heading", name="Logowanie")).to_be_visible()
    page.get_by_role("textbox").first.fill("admin")
    page.locator("input[type=\"password\"]").fill("admin")
    page.get_by_role("button", name="Zaloguj").click()
    expect(page.locator("#root")).to_match_aria_snapshot("- heading \"Twoje Ankiety\" [level=2]\n- button \"+ Nowa Ankieta\"")
    expect(page.get_by_role("heading")).to_contain_text("Twoje Ankiety")
    expect(page.locator("#root")).to_contain_text("+ Nowa Ankieta")
    expect(page.get_by_role("navigation")).to_contain_text("Wyloguj")
    expect(page.get_by_role("navigation")).to_contain_text("HomeDashboardProfil")
    logger.info("Logged in successfully as 'admin'")