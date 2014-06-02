
/**
 *
 */
function commerce_drupalgap_stripe_menu() {
  try {
    var items = {};
    items['checkout/payment/%'] = {
      'title': 'Payment',
      'page_callback': 'commerce_drupalgap_stripe_view',
      'pageshow': 'commerce_drupalgap_stripe_view_callback',
      'page_arguments': [1],
    };
    return items;
  }
  catch (error) {
    console.log('payment_menu - ' + error);
  }
}

function commerce_drupalgap_stripe_view() {

  return '<span class="payment-errors"></span><div id="commerce_drupalgap_stripe_form"></div>';
}

function commerce_drupalgap_stripe_view_callback() {
  try {
    commerce_cart_index(null, {
      success: function(result) {
        if (result.length != 0) {
          $.each(result, function(order_id, order) {
// Set aside the order so it can be used later without fetching
// it again.
            _commerce_order[order_id] = order;
            var form_html = drupalgap_get_form('commerce_drupalgap_stripe_form', order);
            $('#commerce_drupalgap_stripe_form').html(form_html).trigger('create');
            // validate the card number on input XXXX XXXX XXXX XXXX
            $('input#edit-commerce-drupalgap-stripe-form-card-number').payment('formatCardNumber');
            // validate the cc number on input XXX
            $('input#edit-commerce-drupalgap-stripe-form-card-cvc').payment('formatCardCVC');
            return false; // Process only one order.
          });
        }
      }
    });
  }
  catch (error) {
    console.log('commerce_cart_view_pageshow - ' + error);
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
  };
  form.elements.card_cvc = {
    title: 'CVC',
    type: 'textfield',
    default_value: '',
  };
  form.elements.exp_month = {
    title: 'Expiry Month',
    type: 'textfield',
    default_value: '',
  };
  form.elements.exp_year = {
    title: 'Expiry Year',
    type: 'textfield',
    default_value: '',
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
  drupalgap_goto('checkout/complete/' + arg(2), {reloadPage: true});
//Set the stripe publishing key
  Stripe.setPublishableKey('pk_test_lFgh7dNHgyekzHj17LpmmDkb');
  $('#edit-commerce-drupalgap-stripe-form-submit').attr("disabled", "disabled");
  Stripe.card.createToken({
    number: form_state.values.card_number,
    cvc: form_state.values.card_cvc,
    exp_month: form_state.values.exp_month,
    exp_year: form_state.values.exp_year,
  }, commerce_drupalgap_stripe_response);
}

function commerce_drupalgap_stripe_response(status, response) {

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
    console.log('commerce_cart_create - ' + error);
  }
}