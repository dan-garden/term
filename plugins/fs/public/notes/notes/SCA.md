SCA (Strong Customer Authentication)

What is SCA?

* Regulatory Requirement
    * Reduce Fraud
    * Make payments more secure
* Introduced in Europe
* Requires authentication of atleast 2 of 3 things
    * Something the customer knows
        * Password
        * Pin
    * Something the customer has
        * Phone (Call or SMS)
        * Hardware Token
    * Something the customer is
        * Fingerprint
        * Face recognition
* 14 September 2019 Deadline

When is SCA Required?

* Will only apply to "customer-initiated" online payments
    * Card payments
    * Bank transfers
* Won't apply to "merchant-initiated" (Or other exemptions)
    * Recurring direct debits
    * Contactless payments (Paywave, RFID)
    * In-person Card payments
* Will apply to transactions where both the business and the cardholders
bank are located in the European Economic Area (EEA)
* Expected to be enforced in UK Regardless of Brexit outcome

How to authenticate a payment

* Currently, most common way relies on 3D Secure 2
    * Auth standard supported by majority of European Cards
    * One Time Code (OTC)
    * Fingerprint Auth

Exemptions to SCA

* Low-Risk transactions
    * Real-time risk analysis by payment provider (Stripe)
        * Determines whether to apply SCA to transaction
        * Only possible if payment provider or banks overall fraud rates for card payments do not exceed thresholds:
            * 0.13% to exempt transactions below €100
            * 0.06% to exempt transactions below €250
            * 0.01% to exempt transactions below €500
        * Will be converted to local equivalents
* Payments Below €30
    * Considered "Low value" and may be exempt
    * Will be required if exemption used 5 times since cardholders
    last successful authentication
    * Will be required if sum of 5 previously exempted payments exceeds €100
* Fixed-amount subscriptions
    * Can apply when customer makes a series of recurring payments for
    the same amount, to the same business
    SCA still required for customer's first payment
    * Subsequent charges may be exempted from SCA
    * Useful for subscription based payments
* Merchant-initiated transactions
    * "Off-session"
    * Payments made with saved cards when customer isn't present in checkout flow
    * Marking a payment as "merchant-initiated transaction" will be similar to requesting exemption
    * Like other exemptions, it will still be up to the bank to decide
    whether authentication is needed for transaction
    * To use merchant-initiated transactions, need to authenticate card
    with SCA when its being saved or on first payment
    * Need agreement from the customer, to charge their card at a later point
    lets you authenticate a card when it's being saved for later use.
    Also marks subsequent payments as "merchant-initiated"
* Trusted Beneficiaries
    * When completing authentication, customers may have the option to whitelist a business they trust to avoid future authentications for purchases
    * Businesses will be included on a "trusted beneficiaries" list maintained by the customers bank or service provider
    * Adoption of this feature among banks has been slow
    * Expected to not be broadly implemented by September 2019, but will still be supported for exemption
* Phone sales
    * Card details collected over phone are outside the scope of SCA
    * Called “Mail Order and Telephone Orders” (MOTO)
    * Marking payment as being MOTO is similar to requesting other exemptions

To prepare for SCA

* Determine if your business is impacted
* Decide which one of our new SCA-ready products is right for your business
* Make changes before September 14, 2019

Impacted Businesses and payments

* Prepare for SCA and update strip integration if all of the following apply:
    * Your business is based in the European Economic Area (EEA) or you create payments on behalf of connected accounts based in the EEA
    * You serve customers in the EEA
    * You accept cards (credit or debit)

New Order flow

1. Initiate a payment
    * Customer fills in card details
    * Completes checkout form to initiate payment
2. Trigger dynamic authentication
    * Stripes platform detects whether authentication is needed.
    * If required, Stripe uses [3D Secure 2](https://stripe.com/guides/3d-secure-2) to authenticate the customer using one-time passcode or Biometric ID

What we have to do

* Plan out and even create a chart displaying payment status throughout the order flow, as well as what API's will be triggered where. Making sure to include one-time payments and recurring payments, determining where and when each one occurs.
* Migrate from the currently used Charges API to Stripes Intent API paired with the 3D Secure API
* The Intents API is Stripes way of keeping track of the status of a payment throughout the order flow, as well as is used to trigger
the 3D Secure API if required by SCA regulations
* The 3D Secure API is used to perform the various types of Authentication required by the SCA regulations.
* Both the Payment Intents API and the 3D Secure API are built into the latest PHP library, which we can update to. We currently use an older version of it.
* Stripe has a migration manual detailing how to migrate from Charges API to these new API's
* [Find that here](https://stripe.com/docs/strong-customer-authentication/migration)
    1. Update API version and our client library
        * [Link](https://stripe.com/docs/payments/payment-intents/migration#api-version)
    2. If applicable, migrate code that reads from Charge properties so that we have a consistent read path between charges created by the Charges API and charges created by the Payment Intents API. This ensures that a read-side integration that works for both your old and new payments integrations.
        * [Link](https://stripe.com/docs/payments/payment-intents/migration/reading-from-charges)
    3. Migrate our existing Charges API integration to use the Payment Intents API.
    4. Migrate our integration that saves cards on Customer objects.
        * [Link](https://stripe.com/docs/payments/payment-intents/migration#saved-cards)
    5. Test with regulatory test cards to ensure our upgraded integration handles authentication correctly.
        * [Link](https://stripe.com/docs/testing#regulatory-cards)

Relevant files are
- Frontend
    - /frontend/views/pages/memberarea/stripe.php
        - This is where the stripe payment gateway render is generated
    - /frontend/views/pages/order/step8.php
        - This is where the stripe payment gateway is rendered at the end of the order flow
- Backend
    - /backend/controllers/TopUpNow.php
        - doStripePayment() is where Stripe transaction is handled
    - /common/libraries/payments/Stripe/lib/Stripe
        - This is the Stripe library, will need to be updated to latest for transaction intent support