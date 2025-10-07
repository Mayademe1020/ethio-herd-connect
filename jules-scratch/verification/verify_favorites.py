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
    mobile_number = "0912345678"

    # --- Sign Up ---
    page.goto("http://127.0.0.1:8080/auth")

    # Switch to Sign Up form
    page.get_by_role("button", name="Don't have an account? Sign up").click()

    # Fill out sign up form
    expect(page.get_by_placeholder("Confirm your password")).to_be_visible()
    page.get_by_placeholder("Enter your mobile number").fill(mobile_number)
    page.get_by_placeholder("Enter your email").fill(email)
    page.get_by_placeholder("Enter your password").fill(password)
    page.get_by_placeholder("Confirm your password").fill(password)
    page.get_by_role("button", name="Create Account").click()

    # --- Wait for success toast and check for redirect ---
    expect(page.locator(".toast", has_text="Account created successfully!")).to_be_visible(timeout=10000)

    # Check if we are still on the auth page. If so, log in.
    if "auth" in page.url:
        # --- Log In ---
        page.get_by_role("button", name="Email").click()
        page.get_by_placeholder("Enter your email").fill(email)
        page.get_by_placeholder("Enter your password").fill(password)
        page.get_by_role("button", name="Sign In").click()

    # Expect redirection to the home page
    expect(page).to_have_url("http://127.0.0.1:8080/", timeout=15000)

    # --- Create Animal ---
    # On the home page, click the button to add the first animal
    expect(page.get_by_role("button", name="Add First Animal")).to_be_visible()
    page.get_by_role("button", name="Add First Animal").click()

    # Fill out the animal registration form
    expect(page.get_by_role("heading", name="Register New Animal")).to_be_visible()
    page.get_by_label("Name *").fill("Bessie")
    page.get_by_role('combobox', name='Type *').click()
    page.get_by_role("option", name="Cattle").click()
    page.get_by_label("Breed *").fill("Holstein")
    page.get_by_label("Birth Date *").fill("2023-01-01")
    page.get_by_label("Weight (kg)").fill("550")
    page.get_by_role("button", name="Register Animal").click()

    # --- Favorite Animal ---
    # The modal should close, and we should be on the animals page.
    # Wait for the new animal to appear in the list.
    expect(page.locator("h3:text('Bessie')")).to_be_visible()

    # Open the detail modal for the new animal
    page.locator("h3:text('Bessie')").first.click()

    # Take a screenshot of the modal before favoriting
    page.screenshot(path="jules-scratch/verification/animal_unfavorited.png")

    # Favorite the animal
    favorite_button = page.get_by_role("button", name="Favorite")
    expect(favorite_button).to_be_visible()
    favorite_button.click()

    # Expect the button to change to "Unfavorite"
    unfavorite_button = page.get_by_role("button", name="Unfavorite")
    expect(unfavorite_button).to_be_visible()

    # Take a screenshot of the modal with the "Unfavorite" button
    page.screenshot(path="jules-scratch/verification/animal_favorited.png")

    # Close the modal and go back to home
    page.get_by_role("button", name="Close", exact=True).click()
    page.goto("http://127.0.0.1:8080/")

    # Expect the "Favorite Animals" count to be 1
    expect(page.locator("p:text('1')")).to_be_visible()

    # Take a screenshot of the home page after favoriting
    page.screenshot(path="jules-scratch/verification/home_after_favorite.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)