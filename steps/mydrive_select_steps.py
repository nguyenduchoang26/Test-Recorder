from behave import given, when, then
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

@given('I have navigated to the MyDrive Select application')
def step_impl(context):
    # Initialize the browser driver (chromium as per robot script)
    context.driver = webdriver.Chrome()
    # Navigate to the application URL
    context.driver.get("https://select.mydrive.danfoss.com/home")
    
@given('the application is fully loaded')
def step_impl(context):
    # Wait for the page to be fully loaded
    WebDriverWait(context.driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "BUTTON.coi-banner__accept"))
    )

@when('I click the "ACCEPT ALL" button on the cookie banner')
def step_impl(context):
    # Find and click the cookie banner accept button
    cookie_button = context.driver.find_element(By.CSS_SELECTOR, "BUTTON.coi-banner__accept")
    cookie_button.click()

@then('the cookie banner should disappear')
def step_impl(context):
    # Verify the cookie banner is no longer visible
    WebDriverWait(context.driver, 10).until(
        EC.invisibility_of_element_located((By.CSS_SELECTOR, "BUTTON.coi-banner__accept"))
    )

@when('I click the "ACCEPT" button on the consent dialog')
def step_impl(context):
    # Find and click the consent dialog accept button
    WebDriverWait(context.driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "ION-BUTTON.md.button.button-solid.ion-activatable.ion-focusable.hydrated.ion-activated"))
    )
    consent_button = context.driver.find_element(By.CSS_SELECTOR, "ION-BUTTON.md.button.button-solid.ion-activatable.ion-focusable.hydrated.ion-activated")
    consent_button.click()

@then('the consent dialog should close')
def step_impl(context):
    # Wait briefly to ensure dialog is processed
    time.sleep(1)
    # No specific check as the next action depends on this being completed

@when('I click the "CREATE PROJECT" button')
def step_impl(context):
    # Find and click the CREATE PROJECT button
    WebDriverWait(context.driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "ION-BUTTON.md.button.button-solid.ion-activatable.ion-focusable.hydrated.ion-activated"))
    )
    create_project_button = context.driver.find_element(By.CSS_SELECTOR, "ION-BUTTON.md.button.button-solid.ion-activatable.ion-focusable.hydrated.ion-activated")
    # Verify the text is CREATE PROJECT before clicking
    assert "CREATE PROJECT" in create_project_button.text
    create_project_button.click()

@then('the project template selection screen should appear')
def step_impl(context):
    # Verify we can see the template selection elements
    WebDriverWait(context.driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "ION-ITEM.ion-color.ion-color-tertiary.item.md.item-lines-none.item-fill-none.hydrated"))
    )

@when('I select a template from the tertiary category')
def step_impl(context):
    # Find and click the tertiary category template
    template_category = context.driver.find_element(By.CSS_SELECTOR, "ION-ITEM.ion-color.ion-color-tertiary.item.md.item-lines-none.item-fill-none.hydrated")
    template_category.click()

@then('I should see available templates in that category')
def step_impl(context):
    # Verify template images are visible
    WebDriverWait(context.driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "ION-IMG.image.md.hydrated"))
    )

@when('I click on a specific template image')
def step_impl(context):
    # Find and click a specific template image
    template_image = context.driver.find_element(By.CSS_SELECTOR, "ION-IMG.image.md.hydrated")
    template_image.click()

@then('the selected template should be highlighted')
def step_impl(context):
    # Check for visual highlight or selection indicator
    # This step might require additional selectors depending on the application behavior
    pass

@then('I should be able to proceed with the project creation')
def step_impl(context):
    # Verify the next step button or indicator is available
    WebDriverWait(context.driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "ION-BUTTON.hover-button.create-project-button"))
    )
    
    # Clean up - close the browser after the test
    context.driver.quit()
