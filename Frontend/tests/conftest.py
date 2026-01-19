import re
from playwright.sync_api import Page, Playwright, sync_playwright, expect
import pytest
import logging
import random
import string

logger = logging.getLogger(__name__)


@pytest.fixture(scope="function")
def home_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
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
    page.get_by_role("button", name="Mam już konto").click()
    page.get_by_role("textbox").first.fill("admin")
    page.locator("input[type=\"password\"]").fill("admin")
    page.get_by_role("button", name="Zaloguj").click()
    expect(page.get_by_role("navigation")).to_contain_text("Wyloguj")
    logger.info("Logged in successfully as 'admin'")
    return page


@pytest.fixture(scope="function")
def create_survey(login):
    logger.info("Adding a new survey")
    page = login
    survey_title = "Ankieta Testowa " + ''.join(random.choices(string.ascii_letters + string.digits, k=5))
    page.get_by_role("button", name="+ Nowa Ankieta").click()
    expect(page.get_by_role("heading")).to_contain_text("Nowy formularz")
    page.get_by_role("textbox").first.fill(survey_title)
    page.get_by_role("textbox").nth(1).fill("Jak się dzisiaj czujesz?")
    page.get_by_role("combobox").select_option("single_choice")
    page.get_by_role("button", name="Dodaj opcję").click()
    page.get_by_role("textbox", name="Tekst opcji").fill("Dobrze")
    page.get_by_role("button", name="Dodaj opcję").click()
    page.get_by_role("textbox", name="Tekst opcji").nth(1).fill("Źle")
    page.get_by_role("button", name="Dodaj opcję").click()
    page.get_by_role("textbox", name="Tekst opcji").nth(2).fill("Neutralnie")
    page.get_by_role("button", name="Dodaj pytanie").click()
    page.get_by_role("textbox").nth(5).fill("Jaki jest twój ulubiony sport?")
    page.get_by_role("combobox").nth(1).select_option("multiple_choice")
    page.get_by_role("button", name="Dodaj opcję").nth(1).click()
    page.get_by_role("textbox", name="Tekst opcji").nth(3).fill("Bieganie")
    page.get_by_role("button", name="Dodaj opcję").nth(1).click()
    page.get_by_role("textbox", name="Tekst opcji").nth(4).fill("Pływanie")
    page.get_by_role("button", name="Dodaj opcję").nth(1).click()
    page.get_by_role("textbox", name="Tekst opcji").nth(5).fill("Siłownia")
    page.get_by_role("button", name="Dodaj opcję").nth(1).click()
    page.locator("div:nth-child(5) > input").fill("Jazda na rowerze")
    page.get_by_role("button", name="Dodaj opcję").nth(1).click()
    page.locator("div:nth-child(6) > input").fill("Joga")
    page.get_by_role("button", name="Utwórz formularz").click()
    expect(page.locator("h3")).to_contain_text("Sukces")
    expect(page.locator("#root")).to_contain_text("Utworzono formularz.")
    page.get_by_role("button", name="OK").click()
    return page, survey_title
