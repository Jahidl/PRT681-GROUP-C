import os
import time
import unittest
from typing import List, Optional

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "https://prt681store.netlify.app/"
DEFAULT_TIMEOUT = 15  # seconds

# ANSI colors for terminal output (works in most terminals)
GREEN = "\033[92m"
RED = "\033[91m"
BLUE = "\033[94m"
RESET = "\033[0m"


# --------------------------- Driver / Utils --------------------------- #

def make_driver() -> webdriver.Chrome:
    headless = os.getenv("HEADLESS", "1") != "0"
    opts = Options()
    if headless:
        opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1366,1000")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=opts)
    driver.implicitly_wait(2)
    return driver


def wait_for_ready(driver, timeout=DEFAULT_TIMEOUT):
    print(f"{BLUE}Waiting for page to load...{RESET}")
    WebDriverWait(driver, timeout).until(
        lambda d: d.execute_script("return document.readyState") == "complete"
    )
    try:
        WebDriverWait(driver, timeout).until(
            EC.any_of(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='search']")),
                EC.presence_of_element_located((By.XPATH, "//button")),
            )
        )
    except Exception:
        pass
    print(f"{GREEN}Page loaded!{RESET}")


def find_first(driver_or_el, locators: List[tuple]) -> Optional[object]:
    for how, what in locators:
        els = driver_or_el.find_elements(how, what)
        if els:
            return els[0]
    return None


def find_all(driver_or_el, locators: List[tuple]) -> List[object]:
    for how, what in locators:
        els = driver_or_el.find_elements(how, what)
        if els:
            return els
    return []


def safe_click(driver, el):
    print(f"{BLUE}Clicking element: {el.text[:40]}{RESET}")
    driver.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable(el))
    try:
        el.click()
        print(f"{GREEN}✔ Element clicked normally{RESET}")
    except Exception:
        driver.execute_script("arguments[0].click();", el)
        print(f"{GREEN}✔ Element clicked via JS fallback{RESET}")


# ------------------------------ Tests --------------------------------- #

class TestPRT681Store(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print(f"{BLUE}Launching Chrome...{RESET}")
        cls.driver = make_driver()
        cls.wait = WebDriverWait(cls.driver, DEFAULT_TIMEOUT)
        print(f"{GREEN}✔ Chrome launched{RESET}")

    @classmethod
    def tearDownClass(cls):
        print(f"{BLUE}Closing Chrome...{RESET}")
        try:
            cls.driver.quit()
            print(f"{GREEN}✔ Chrome closed{RESET}")
        except Exception:
            print(f"{RED}✖ Could not close Chrome cleanly{RESET}")

    def setUp(self):
        print(f"\n{BLUE}Navigating to {BASE_URL}{RESET}")
        self.driver.get(BASE_URL)
        wait_for_ready(self.driver)

    def test_01_homepage_title(self):
        print(f"{BLUE}Checking homepage title...{RESET}")
        title = (self.driver.title or "").strip()
        print(f"Page title found: '{title}'")
        self.assertIn("sports store", title.lower(),
                      f"Expected title to contain 'Sports Store', got '{title}'")
        print(f"{GREEN}✔ Title contains 'Sports Store'{RESET}")

    def test_02_products_render_and_have_price_and_button(self):
        print(f"{BLUE}Looking for product cards and prices...{RESET}")
        add_buttons = self.driver.find_elements(By.XPATH, "//button[contains(., 'Add to Cart')]")
        self.assertTrue(add_buttons, "No 'Add to Cart' buttons found on the page.")
        print(f"{GREEN}✔ Found {len(add_buttons)} product cards{RESET}")

        btn = add_buttons[0]
        card = btn.find_element(By.XPATH, "./ancestor::div[1]")
        self.assertIsNotNone(card, "Could not resolve a card container for the first product.")

        price = find_first(card, [
            (By.XPATH, ".//*[contains(@class,'price') and contains(., '$')]"),
            (By.XPATH, ".//span[contains(@class,'font-bold') and contains(., '$')]"),
            (By.XPATH, ".//*[contains(., '$')]"),
        ])
        self.assertIsNotNone(price, "No price element found in/near the first product card.")
        print(f"{GREEN}✔ Found price: {price.text}{RESET}")

    def test_03_add_to_cart_button_is_clickable(self):
        print(f"{BLUE}Testing Add to Cart clickability...{RESET}")
        button = find_first(self.driver, [
            (By.XPATH, "//button[contains(., 'Add to Cart')]"),
        ])
        self.assertIsNotNone(button, "Could not find any 'Add to Cart' button.")
        safe_click(self.driver, button)

    def test_04_search_box_exists_and_accepts_input(self):
        print(f"{BLUE}Testing search box input...{RESET}")
        search = find_first(self.driver, [
            (By.CSS_SELECTOR, "input[placeholder*='Search' i]"),
            (By.XPATH, "//input[contains(translate(@placeholder,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'search')]"),
            (By.CSS_SELECTOR, "input[type='search']"),
        ])
        self.assertIsNotNone(search, "Search input not found.")
        self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", search)
        self.wait.until(EC.visibility_of(search))
        search.clear()
        search.send_keys("shoes")
        print(f"Search box value: '{search.get_attribute('value')}'")
        self.assertEqual(search.get_attribute("value"), "shoes",
                         "Search box did not accept input text.")
        print(f"{GREEN}✔ Search input worked correctly{RESET}")


if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestPRT681Store)
    unittest.TextTestRunner(verbosity=2).run(suite)
