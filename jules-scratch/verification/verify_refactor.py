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
    full_name = "Refactor User"

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

    # --- Wait for success toast and Log In ---
    expect(page.locator(".toast", has_text="Account created successfully!")).to_be_visible(timeout=10000)

    # The form should now be in login mode.
    page.get_by_role("button", name="Email").click()
    page.get_by_placeholder("Enter your email").fill(email)
    page.get_by_placeholder("Enter your password").fill(password)
    page.get_by_role("button", name="Sign In").click()

    # Expect redirection to the home page
    expect(page).to_have_url("http://127.0.0.1:8080/", timeout=15000)

    # --- Navigate to Animals page ---
    page.goto("http://127.0.0.1:8080/animals")

    # --- Create Animal ---
    page.get_by_role("button", name="Add Animal").click()

    # Fill out the animal registration form
    expect(page.get_by_role("heading", name="Animal Registration")).to_be_visible()
    page.get_by_label("Name *").fill("Daisy")
    page.get_by_role('combobox', name='Type *').click()
    page.get_by_role("option", name="Cattle").click()
    page.get_by_label("Breed").fill("Jersey")
    page.get_by_label("Birth Date").fill("2022-03-15")
    page.get_by_label("Weight (kg)").fill("480")
    page.get_by_role("button", name="Register").click()

    # --- Verify Animal was created ---
    expect(page.locator("h3:text('Daisy')")).to_be_visible()

    # Take a screenshot of the animals page
    page.screenshot(path="jules-scratch/verification/refactor_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)