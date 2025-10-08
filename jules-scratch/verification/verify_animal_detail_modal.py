import uuid
from playwright.sync_api import sync_playwright, Page, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Generate unique user credentials
    unique_id = str(uuid.uuid4())[:8]
    email = f"test-user-{unique_id}@example.com"
    password = "password123"
    mobile_number = "0911223344"
    full_name = "Detail View User"

    # --- Sign Up ---
    page.goto("http://127.0.0.1:8080/auth")

    # Switch to Sign Up form
    page.get_by_role("button", name="Don't have an account? Sign up").click()

    # Fill out sign up form
    expect(page.get_by_placeholder("Confirm your password")).to_be_visible()
    page.get_by_placeholder("Enter your mobile number").fill(mobile_number)
    page.get_by_placeholder("Enter your email").fill(email)
    page.get_by_placeholder("Enter your full name").fill(full_name)
    page.get_by_placeholder("Enter your password").fill(password)
    page.get_by_placeholder("Confirm your password").fill(password)
    page.get_by_role("button", name="Create Account").click()

    # --- Wait for success toast ---
    expect(page.locator(".toast", has_text="Account created successfully!")).to_be_visible(timeout=10000)

    # --- Log In ---
    page.get_by_role("button", name="Email").click()
    page.get_by_placeholder("Enter your email").fill(email)
    page.get_by_placeholder("Enter your password").fill(password)
    page.get_by_role("button", name="Sign In").click()

    # Expect redirection to the home page
    expect(page).to_have_url("http://127.0.0.1:8080/", timeout=15000)

    # --- Create an Animal to list ---
    page.goto("http://127.0.0.1:8080/animals")
    page.get_by_role("button", name="Add Animal").click()

    expect(page.get_by_role("heading", name="Animal Registration")).to_be_visible()
    page.get_by_label("Name").fill("Bessie for Details")
    page.get_by_label("Type").click()
    page.get_by_role("option", name="Cattle").click()
    page.get_by_role("button", name="Register").click()

    expect(page.locator("h3:text('Bessie for Details')")).to_be_visible()

    # --- Create Marketplace Listing ---
    page.goto("http://127.0.0.1:8080/marketplace")
    page.get_by_role("button", name="Post Your Animal").click()

    expect(page.get_by_role("heading", name="Create Animal Listing")).to_be_visible()
    page.get_by_label("Select Animal").click()
    page.get_by_role("option", name="Bessie for Details").click()
    page.get_by_label("Title").fill("Healthy Cow for Sale")
    page.get_by_label("Price (ETB)").fill("50000")
    page.get_by_role("button", name="Create Listing").click()

    # --- Verify Detail View ---
    expect(page.locator("h3:text('Healthy Cow for Sale')")).to_be_visible()
    page.get_by_role("button", name="Details").click()

    expect(page.get_by_role("dialog")).to_be_visible()
    expect(page.locator("h3:text('Bessie for Details')")).to_be_visible()

    # Take a screenshot of the detail modal
    page.screenshot(path="jules-scratch/verification/animal_detail_modal.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)