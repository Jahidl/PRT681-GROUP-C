# Sample Knowledge Document: Testing Options and Methodologies

This document gives an overview of different types of software testing.  


---

## 1. Manual Testing
- **What it is:** Testing done by a human without automation tools.
- **How it works:** The tester follows test cases, clicks through the application, and checks results.
- **Use cases:**
  - Exploratory testing (finding issues by trying different actions)
  - Usability testing (checking if the system is easy to use)
  - Ad hoc testing (quick, unplanned tests)

---

## 2. Automated Testing
- **What it is:** Testing done by scripts or frameworks instead of a person.
- **How it works:** A test script runs steps and compares results with expected outputs.
- **Tools examples:** Selenium, JUnit, Cypress, Playwright.
- **Benefits:**
  - Faster than manual testing for repeated tasks
  - Reliable and consistent results
  - Good for regression testing (checking old features after changes)

---

## 3. Functional Testing
- **What it is:** Tests that check if features work as described.
- **Examples:**
  - Login should succeed with valid credentials
  - Cart should update when quantity changes
- **Goal:** Confirm that the software does what the requirements say.

---

## 4. Non-Functional Testing
- **What it is:** Tests that check system quality, not functions.
- **Examples:**
  - Performance (how fast pages load)
  - Security (are passwords protected)
  - Scalability (system can handle many users)
  - Reliability (data stays safe after crashes)

---

## 5. Regression Testing
- **What it is:** Re-running old tests after a new change.
- **Why:** To make sure new code does not break existing features.
- **Approach:** Often automated because tests are repeated many times.

---

## 6. User Acceptance Testing (UAT)
- **What it is:** Final testing by business users before release.
- **Goal:** Confirm the system meets real-world needs.
- **Example:** A customer tries placing an order to check if the process is correct.

---

## 7. API Testing
- **What it is:** Testing communication between services.
- **How it works:** Send requests to an API endpoint and check responses.
- **Tools examples:** Postman, RestAssured.
- **Checks include:**
  - Correct response codes (200, 400, 500)
  - Data format (JSON, XML)
  - Security of endpoints

---

## 8. Performance Testing
- **What it is:** Tests that measure speed, load, and stability.
- **Types:**
  - Load testing: normal expected users
  - Stress testing: more users than expected
  - Spike testing: sudden increase of users
- **Tools examples:** JMeter, k6, Gatling.

---

## 9. Security Testing
- **What it is:** Checking if the system is safe from attacks.
- **Examples:**
  - Passwords are encrypted
  - Unauthorized users cannot access data
  - Input validation stops SQL injection
- **Goal:** Protect user data and system integrity.

---

# Summary

- **Manual Testing:** Human-based, flexible, slower.  
- **Automated Testing:** Script-based, repeatable, fast.  
- **Functional vs Non-Functional:** Features vs quality attributes.  
- **Regression Testing:** Ensures new code does not break old code.  
- **UAT:** Business users confirm system readiness.  
- **API Testing:** Focus on service communication.  
- **Performance Testing:** Speed and stability under load.  
- **Security Testing:** Protection against threats.  

Using the correct testing method depends on project needs, system type, and quality goals.
