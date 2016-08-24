Commerce DrupalGap Stripe
=========================

Accept payment through the Stripe payment gateway for your Drupal Commerce
website inside your DrupalGap mobile application.

Setup
=====

1. Install this module on your Drupal site:

- https://drupal.org/sandbox/signalpoint/commerce_drupalgap_stripe

2. On your Drupal site, go to: `admin/structure/services/list/drupalgap/resources`
   
   Then check the box next to "commerce-payment-stripe" and hit "Save".

3. Download the Stripe PHP library v1.18.0:

- https://github.com/stripe/stripe-php/releases/tag/v1.18.0
   
   Unzip it (and possibly rename the folder) so it lives here in your Drupal site:
   
      sites/all/libraries/stripe-php

4. On your Drupal site, go to: `admin/commerce/config/payment-methods`
   
   Click 'edit' next to Stripe in the listing, then under 'Actions' click
   'edit', then enter your 'Secret Key' and 'Publishable Key' that you obtained
   from Stripe, then click 'Save'.

5. Download the `jquery.payment.js` file to your app's `www` directory:

- https://raw.githubusercontent.com/stripe/jquery.payment/master/lib/jquery.payment.js

6. Add these scripts to your DrupalGap's `index.html` file, below the jQueryMobile includes in the '<head></head>`:

```
<script type="text/javascript" src="jquery.payment.js"></script>
<script type="text/javascript" src="https://js.stripe.com/v2/"></script>
```

7. Modify settings.js to include the `commerce_drupalgap_stripe` module:

```
/* Contrib Modules */
Drupal.modules.contrib['commerce_drupalgap_stripe'] = {};
```

8. Add your publishable Stripe API key to the settings.js file, for example:

```
// Stripe API Key
drupalgap.settings.stripe_api_key = 'abcdefghijklmnopqrstuvwxyz1234567890';
```
