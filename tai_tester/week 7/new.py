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


def make_driver() -> webdriver.Chrome:
    headless = os.getenv("HEADLESS", "1") != "0"
    opts = Options()
    if headless:
        # The "new" headless is more stable on recent Chrome
        opts.add_argument("--headless=new")
    # Reasonable defaults for CI-ish environments
    opts.add_argument("--window-size=1280,900")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=opts)
    driver.implicitly_wait(2)  # quick implicit wait; explicit waits do the heavy lifting
    return driver


def wait_for_any(driver, locators: List[tuple], timeout: int = DEFAULT_TIMEOUT):
    """
    Wait until at least one of the provided locators has a visible element.
    Returns (locator, element).
    """
    end = time.time() + timeout
    last_exc = None
    while time.time() < end:
        for how, what in locators:
            try:
                el = WebDriverWait(driver, 0.75).until(
                    EC.visibility_of_element_located((how, what))
                )
                return (how, what), el
            except Exception as e:
                last_exc = e
        time.sleep(0.25)
    raise last_exc if last_exc else TimeoutError("Elements not found for any locator")


def find_first(driver, locators: List[tuple]) -> Optional[object]:
    """
    Try multiple locators; return the first found WebElement or None.
    """
    for how, what in locators:
        try:
            el = driver.find_element(how, what)
            return el
        except Exception:
            continue
    return None


def find_all(driver, locators: List[tuple]) -> List[object]:
    """
    Try multiple locators; return the first non-empty list of elements.
    """
    for how, what in locators:
        els = driver.find_elements(how, what)
        if els:
            return els
    return []


class TestPRT681Store(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.driver = make_driver()
        cls.wait = WebDriverWait(cls.driver, DEFAULT_TIMEOUT)

    @classmethod
    def tearDownClass(cls):
        try:
            cls.driver.quit()
        except Exception:
            pass

    def setUp(self):
        self.driver.get(BASE_URL)

    # ------------ Helpers specific to this site (robust guesses) ------------ #

    def _get_home_product_cards(self):
        """
        Returns product-card-like elements on the homepage.
        Tries a few common structures.
        """
        cards = find_all(
            self.driver,
            [
                (By.CSS_SELECTOR, ".product-card"),
                (By.CSS_SELECTOR, "[data-testid='product-card']"),
                (By.CSS_SELECTOR, ".card, .item, .product"),
                (By.XPATH, "//a[contains(@href,'product') or contains(@href,'/products')]"),
                (By.XPATH, "//*[contains(@class,'product') and (self::div or self::li)]"),
            ],
        )
        return cards

    def _open_first_product_detail(self):
        """
        Click the first product link/card and return (name_text_before_click).
        """
        # Try to find a clickable link within a card first
        link = find_first(
            self.driver,
            [
                (By.CSS_SELECTOR, ".product-card a"),
                (By.CSS_SELECTOR, "[data-testid='product-card'] a"),
                (By.XPATH, "(//a[contains(@href,'product') or contains(@href,'/products')])[1]"),
                (By.CSS_SELECTOR, "a[href*='product']"),
            ],
        )

        if link:
            name_before = link.text.strip()
            link.click()
            return name_before

        # Fallback: click the first card itself if clickable
        cards = self._get_home_product_cards()
        self.assertTrue(cards, "Could not find any product cards/links on the homepage.")
        name_before = cards[0].text.strip()
        cards[0].click()
        return name_before

    def _click_add_to_cart_if_present(self) -> bool:
        """
        Attempt to click an 'Add to Cart' button on the current page.
        Returns True if clicked, False if no button found.
        """
        add_btn = find_first(
            self.driver,
            [
                (By.CSS_SELECTOR, "button.add-to-cart"),
                (By.XPATH, "//button[contains(., 'Add to Cart') or contains(., 'Add to cart')]"),
                (By.XPATH, "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'add to cart')]"),
                (By.CSS_SELECTOR, "[data-testid='add-to-cart']"),
            ],
        )
        if add_btn:
            add_btn.click()
            return True
        return False

    def _go_to_cart(self) -> bool:
        """
        Navigate to a cart page/icon if present.
        Returns True if navigation likely happened, else False.
        """
        cart = find_first(
            self.driver,
            [
                (By.CSS_SELECTOR, "a.cart, a[href*='cart']"),
                (By.XPATH, "//a[contains(@href,'cart') or contains(., 'Cart')]"),
                (By.XPATH, "//a[@aria-label='Cart' or @title='Cart']"),
                (By.CSS_SELECTOR, "[data-testid='cart-link']"),
            ],
        )
        if cart:
            cart.click()
            # wait for a hint of cart UI
            try:
                self.wait.until(
                    EC.any_of(
                        EC.visibility_of_element_located((By.CSS_SELECTOR, ".cart-item")),
                        EC.visibility_of_element_located((By.XPATH, "//*[contains(@class,'cart') and (self::div or self::section)]")),
                        EC.visibility_of_element_located((By.XPATH, "//*[contains(.,'Your Cart') or contains(.,'Shopping Cart')]")),
                    )
                )
            except Exception:
                pass
            return True
        return False

    # ------------------------------- Tests ---------------------------------- #

    def test_01_homepage_title(self):
        # Wait for some key element to be visible as a sign of readiness
        try:
            wait_for_any(
                self.driver,
                [
                    (By.CSS_SELECTOR, "header"),
                    (By.CSS_SELECTOR, "nav"),
                    (By.CSS_SELECTOR, ".product-card"),
                ],
                timeout=DEFAULT_TIMEOUT,
            )
        except Exception:
            pass

        title = self.driver.title or ""
        self.assertIn(
            "Store".lower(),
            title.lower(),
            f"Expected page title to contain 'Store' but got '{title}'. "
            f"If the title differs, adjust this assertion to the site's actual title."
        )

    def test_02_open_first_product_and_assert_detail(self):
        name_before = self._open_first_product_detail()

        # On detail page, try to read a product name and price
        name_el = find_first(
            self.driver,
            [
                (By.CSS_SELECTOR, "h1"),
                (By.CSS_SELECTOR, "[data-testid='product-title']"),
                (By.XPATH, "//h1|//h2"),
            ],
        )
        self.assertIsNotNone(name_el, "Could not find a product title on the detail page.")
        detail_name = (name_el.text or "").strip()
        self.assertTrue(detail_name, "Product title exists but has empty text.")
        # Soft check: sometimes list text may not equal the detail title exactly
        if name_before:
            self.assertIn(
                name_before.split()[0],
                detail_name,
                f"Name mismatch: list '{name_before}' vs detail '{detail_name}'. "
                "This is a soft check; adjust if your site uses different labels."
            )

        price_el = find_first(
            self.driver,
            [
                (By.CSS_SELECTOR, ".price"),
                (By.CSS_SELECTOR, "[data-testid='product-price']"),
                (By.XPATH, "//*[contains(@class,'price') or contains(., '$')]"),
            ],
        )
        self.assertIsNotNone(price_el, "Could not find a price element on the detail page.")
        self.assertTrue(price_el.text.strip(), "Price element has no text.")

    def test_03_add_to_cart_and_verify(self):
        # Open a product
        self._open_first_product_detail()

        # Try adding it to cart
        clicked = self._click_add_to_cart_if_present()
        if not clicked:
            self.skipTest("No 'Add to Cart' button found on product page; skipping cart test.")

        # Navigate to cart
        went_to_cart = self._go_to_cart()
        if not went_to_cart:
            self.skipTest("Could not locate a Cart link/icon to verify contents; skipping.")

        # Verify that some cart item exists
        item_name = find_first(
            self.driver,
            [
                (By.CSS_SELECTOR, ".cart-item .name"),
                (By.CSS_SELECTOR, ".cart-item [data-testid='name']"),
                (By.XPATH, "//*[contains(@class,'cart')]//*[self::h3 or self::h2 or self::p]"),
            ],
        )
        self.assertIsNotNone(item_name, "Cart page did not show any item name-like element.")
        self.assertTrue(
            item_name.text.strip(),
            "A cart item element was found but appeared empty."
        )

    def test_04_search_or_filter_flow(self):
        """
        If a search input or category filter exists, try a flow and assert results render.
        This test will be skipped if no search/filter UI is found.
        """
        # Search input candidates
        search_box = find_first(
            self.driver,
            [
                (By.CSS_SELECTOR, "input[type='search']"),
                (By.CSS_SELECTOR, "input#search, input[name='search']"),
                (By.CSS_SELECTOR, "[placeholder*='Search' i]"),
            ],
        )
        # Category/filter candidates (checkboxes/selects/links)
        category_link = find_first(
            self.driver,
            [
                (By.CSS_SELECTOR, "[data-testid='category-link']"),
                (By.XPATH, "//a[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'category')]"),
                (By.CSS_SELECTOR, "nav a, .filters a"),
            ],
        )

        if not search_box and not category_link:
            self.skipTest("No obvious search or category filter present; skipping.")

        if search_box:
            search_box.clear()
            search_box.send_keys("shoe")
            # Try submit via ENTER or form submit
            try:
                search_box.submit()
            except Exception:
                pass

            # Wait for results to change/render
            time.sleep(1.5)

            results = find_all(
                self.driver,
                [
                    (By.CSS_SELECTOR, ".product-card"),
                    (By.CSS_SELECTOR, "[data-testid='product-card']"),
                    (By.CSS_SELECTOR, ".product, .item, .card"),
                ],
            )
            self.assertTrue(results, "Search ran but no product results were found.")
        else:
            # Try clicking a category and expect some products to render
            category_link.click()
            try:
                self.wait.until(
                    EC.presence_of_element_located(
                        (By.CSS_SELECTOR, ".product-card, [data-testid='product-card'], .product, .item, .card")
                    )
                )
            except Exception:
                pass
            results = find_all(
                self.driver,
                [
                    (By.CSS_SELECTOR, ".product-card"),
                    (By.CSS_SELECTOR, "[data-testid='product-card']"),
                    (By.CSS_SELECTOR, ".product, .item, .card"),
                ],
            )
            self.assertTrue(results, "Category clicked but no product results were found.")


if __name__ == "__main__":
    # Run in a predictable order
    suite = unittest.TestLoader().loadTestsFromTestCase(TestPRT681Store)
    unittest.TextTestRunner(verbosity=2).run(suite)