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
    full_name = "Refactor Test User"

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

    # --- Create Animal with minimal info ---
    page.get_by_role("button", name="Add Animal").click()

    # Fill out only the required fields in the animal registration form
    expect(page.get_by_role("heading", name="Register New Animal")).to_be_visible()

    # Select animal type
    page.get_by_role('combobox', name='Type *').click()
    page.get_by_role("option", name="Goat").click()

    # Submit the form
    page.get_by_role("button", name="Register Animal").click()

    # --- Verify Animal was created ---
    # The name will be empty, so we'll look for another detail, like the breed.
    # Since breed is optional and we didn't provide it, we'll just check for a new card.
    # A success toast should appear
    expect(page.locator(".toast", has_text="Animal registered successfully.")).to_be_visible(timeout=10000)

    # Verify that there is at least one animal card present
    expect(page.locator(".animal-card")).to_have_count(1)

    # Take a screenshot of the animals page
    page.screenshot(path="jules-scratch/verification/animal_registration_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)