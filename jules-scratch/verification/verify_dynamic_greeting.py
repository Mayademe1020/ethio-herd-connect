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
    mobile_number = "0987654321"
    full_name = "Test User"

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

    # --- Verify Greeting ---
    greeting_selector = f"p:has-text('{full_name} Welcome, {mobile_number}!')"
    expect(page.locator(greeting_selector)).to_be_visible()

    # Take a screenshot of the home page
    page.screenshot(path="jules-scratch/verification/dynamic_greeting.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)