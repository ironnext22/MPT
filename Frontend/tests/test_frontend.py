import re
from playwright.sync_api import Page, Playwright, sync_playwright, expect
import pytest
import logging
import random
import string
import time
logger = logging.getLogger(__name__)


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


def test_add_new_survey(login):
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
    page.get_by_role("button", name="Dodaj pytanie").click()
    page.get_by_role("button", name="Utwórz formularz").click()
    expect(page.locator("h3")).to_contain_text("Sukces")
    expect(page.locator("#root")).to_contain_text("Utworzono formularz.")
    page.get_by_role("button", name="OK").click()
    surveys = page.locator("#root ul")
    for i in range(surveys.count()):
        survey_text = surveys.nth(i).inner_text()
        if survey_title in survey_text:
            logger.info(f"Survey '{survey_title}' found in the list")
            break
    logger.info(f"{survey_title} added successfully")