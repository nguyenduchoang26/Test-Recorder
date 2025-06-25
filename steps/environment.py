# -- FILE: environment.py
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

def before_all(context):
    # Set up configuration for the entire test run
    context.config.setup_logging()

def before_feature(context, feature):
    # Set up before each feature runs
    pass

def before_scenario(context, scenario):
    # Set up ChromeDriver options
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-extensions")
    
    # Set up ChromeDriver with WebDriver Manager (automatically downloads appropriate driver)
    service = Service(ChromeDriverManager().install())
    
    # Initialize the Chrome browser
    context.driver = webdriver.Chrome(service=service, options=chrome_options)
    context.driver.implicitly_wait(10)  # Set implicit wait time

def after_scenario(context, scenario):
    # Clean up after each scenario
    if hasattr(context, 'driver'):
        context.driver.quit()

def after_feature(context, feature):
    # Clean up after each feature
    pass

def after_all(context):
    # Clean up after the entire test run
    pass
