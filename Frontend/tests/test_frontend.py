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
    page.get_by_role("button", name="Rozpocznij teraz").click()
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
    page.get_by_role("button", name="Mam już konto").click()
    expect(page.get_by_role("heading", name="Logowanie")).to_be_visible()
    page.get_by_role("textbox").first.fill("admin")
    page.locator("input[type=\"password\"]").fill("admin")
    page.get_by_role("button", name="Zaloguj").click()
    expect(page.locator("#root")).to_match_aria_snapshot("- heading \"Twoje Ankiety\" [level=2]\n- button \"+ Nowa Ankieta\"")
    expect(page.get_by_role("heading")).to_contain_text("Twoje Ankiety")
    expect(page.locator("#root")).to_contain_text("+ Nowa Ankieta")
    expect(page.get_by_role("navigation")).to_contain_text("Wyloguj")
    logger.info("Logged in successfully as 'admin'")


def test_add_new_survey(create_survey):
    logger.info("Adding a new survey")
    page, survey_title = create_survey
    surveys = page.locator("#root ul")
    for i in range(surveys.count()):
        survey_text = surveys.nth(i).inner_text()
        if survey_title in survey_text:
            logger.info(f"Survey '{survey_title}' found in the list")
            break
    logger.info(f"{survey_title} added successfully")


def test_fill_in_survey(create_survey):
    logger.info("Filling in a survey as an admin user")
    page, _ = create_survey
    answear_1 = "Dobrze"
    answear_2 = ["Jazda na rowerze", "Siłownia", "Bieganie"]
    surveys = page.locator("#root ul")
    survey_text = surveys.nth(0).inner_text()
    if "Wypełnij / Podgląd" in survey_text:
        surveys.nth(0).get_by_role("button").first.click()
    else:
        logger.error("No survey available to fill in")
        return 
    page.get_by_role("textbox", name="name@example.com").fill("admin@gmail.com")
    page.get_by_role("radio", name="Dobrze").check()
    page.get_by_role("checkbox", name=answear_2[0]).check()
    page.get_by_role("checkbox", name=answear_2[1]).check()
    page.get_by_role("checkbox", name=answear_2[2]).check()
    page.get_by_role("button", name="Wyślij zgłoszenie").click()
    page.get_by_role("button", name="Wyślij zgłoszenie").click()
    expect(page.get_by_role("heading")).to_contain_text("Dziękujemy!")
    expect(page.get_by_role("paragraph")).to_contain_text("Twoja odpowiedź została zapisana.")
    page.get_by_role("link", name="Dashboard").click()
    page.get_by_role("button", name="📊 Zobacz Wyniki").first.click()
    expect(page.locator("tbody")).to_contain_text(answear_1)
    expect(page.locator("tbody")).to_contain_text(f"{answear_2[0]}, {answear_2[1]}, {answear_2[2]}")

    logger.info("Survey filled in successfully as an admin user")
