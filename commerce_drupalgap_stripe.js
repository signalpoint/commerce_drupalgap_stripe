
/**
 *
 */
function commerce_drupalgap_stripe_menu() {
  try {
    var items = {};
    items['checkout/payment/%'] = {
      'title': 'Payment',
      'page_callback': 'commerce_drupalgap_stripe_view',
      'pageshow': 'commerce_drupalgap_stripe_view_pageshow',
      'page_arguments': [2],
    };
    return items;
  }
  catch (error) {
    console.log('commerce_drupalgap_stripe_menu - ' + error);
  }
}

function commerce_drupalgap_stripe_view(order_id) {
  var container_id = commerce_drupalgap_stripe_container_id(order_id);
  return '<span class="payment-errors"></span>' +
    '<div id="' + container_id + '"></div>';
}

function commerce_drupalgap_stripe_view_pageshow(order_id) {
  try {
    commerce_order_load(order_id, {
        success: function(order) {
          // Set aside the order so it can be used later without fetching
          // it again.
          _commerce_order[order_id] = order;
          var form_html = drupalgap_get_form('commerce_drupalgap_stripe_form', order);
          var container_id = commerce_drupalgap_stripe_container_id(order_id);
          $('#' + container_id).html(form_html).trigger('create');
          // validate the card number on input XXXX XXXX XXXX XXXX
          $('input#edit-commerce-drupalgap-stripe-form-card-number').payment('formatCardNumber');
          // validate the cc number on input XXX
          $('input#edit-commerce-drupalgap-stripe-form-card-cvc').payment('formatCardCVC');
        }
    });
  }
  catch (error) {
    console.log('commerce_drupalgap_stripe_view_pageshow - ' + error);
  }
}

/**
 *
 */
function commerce_drupalgap_stripe_form(form, form_state, order) {
  // 4242 4242 4242 4242 - are the test details
  form.elements.card_number = {
    title: 'Card number',
    type: 'textfield',
    default_value: '',
    required: true
  };
  form.elements.card_cvc = {
    title: 'CVC',
    type: 'textfield',
    default_value: '',
    required: true
  };
  form.elements.exp_month = {
    title: 'Expiry Month',
    type: 'textfield',
    default_value: '',
    required: true
  };
  form.elements.exp_year = {
    title: 'Expiry Year',
    type: 'textfield',
    default_value: '',
    required: true
  };
  // Add to cart submit button.
  form.elements.submit = {
    type: 'submit',
    value: 'Submit Payment'
  };
  return form;
}

/**
 * Define the form's submit function.
 */
function commerce_drupalgap_stripe_form_submit(form, form_state) {
  try {
    Stripe.setPublishableKey(drupalgap.settings.stripe_api_key);
    $('#edit-commerce-drupalgap-stripe-form-submit').attr("disabled", "disabled");
    Stripe.card.createToken({
      number: form_state.values.card_number,
      cvc: form_state.values.card_cvc,
      exp_month: form_state.values.exp_month,
      exp_year: form_state.values.exp_year,
    }, commerce_drupalgap_stripe_response);
  }
  catch (error) { console.log('commerce_drupalgap_stripe_form_submit - ' + error); }
  
}

function commerce_drupalgap_stripe_response(status, response) {
  try {
    if (response.error) {
      $(".payment-errors").text(response.error.message);
      $('#edit-commerce-drupalgap-stripe-form-submit').removeAttr("disabled")
    } else {
      $(".payment-errors").text('');
      $.each(_commerce_order, function(order_id, order) {
        commerce_drupalgap_stripe_create({
          data: {
            order_id: order_id,
            stripe_token: response.id,
            payment_method: 'commerce_stripe',
            //stripe_repsonse: JSON.stringify(response),
          },
          success: function(data) {
            drupalgap_goto('checkout/complete/' + arg(2), {reloadPage: true});
          },
          error: function(error) {
            alert('error');
          }
        });
        // only process one order
        return;
      });
    }
  }
  catch (error) { console.log('commerce_drupalgap_stripe_response - ' + error); }
}

/**
 * Creates a cart.
 * @param {Object} options
 */
function commerce_drupalgap_stripe_create(options) {
  try {
    options.method = 'POST';
    options.contentType = 'application/x-www-form-urlencoded';
    options.path = 'commerce-payment-stripe.json';
    options.path += '&flatten_fields=false';
    options.service = 'commerce-payment-stripe';
    options.resource = 'create';

    if (options.data) {
      var data = '';
      for (var property in options.data) {
        if (options.data.hasOwnProperty(property)) {
          data += property + '=' + options.data[property] + '&';
        }
      }
      // Remove last ampersand.
      if (data != '') {
        data = data.substring(0, data.length - 1);
        options.data = data;
      }
    }
    Drupal.services.call(options);
  }
  catch (error) {
    console.log('commerce_drupalgap_stripe_create - ' + error);
  }
}

/**
 *
 */
function commerce_drupalgap_stripe_container_id(order_id) {
  try {
    return 'commerce_drupalgap_stripe_form_' + order_id;
  }
  catch (error) { console.log('commerce_drupalgap_stripe_container_id - ' + error); }
}
