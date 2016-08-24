var _commerce_stripe_order_id = null; // Holds the order id for payment.

/**
 *
 */
function commerce_drupalgap_stripe_menu() {
  var items = {};
  items['checkout/payment/%'] = {
    title: 'Payment',
    page_callback: 'commerce_drupalgap_stripe_view',
    pageshow: 'commerce_drupalgap_stripe_view_pageshow',
    page_arguments: [2]
  };
  return items;
}

function commerce_drupalgap_stripe_view(order_id) {
  var container_id = commerce_drupalgap_stripe_container_id(order_id);
  return '<div class="stripe-payment-errors"></div>' +
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
        $('input#edit-commerce-drupalgap-stripe-form-number').payment('formatCardNumber');
        // validate the cc number on input XXX
        $('input#edit-commerce-drupalgap-stripe-form-cvc').payment('formatCardCVC');
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
  form.elements.order_id = {
    type: 'hidden',
    default_value: order.order_id,
    required: true
  };
  // 4242 4242 4242 4242 - are the test details
  form.elements.number = {
    title: 'Card number',
    type: 'textfield',
    default_value: '',
    required: true,
    attributes: {
      'data-stripe': 'number'
    }
  };
  form.elements.cvc = {
    title: 'CVC',
    type: 'textfield',
    default_value: '',
    required: true,
    attributes: {
      'data-stripe': 'cvc'
    }
  };
  form.elements.exp_month = {
    title: 'Expiry Month',
    type: 'textfield',
    default_value: '',
    required: true,
    attributes: {
      'data-stripe': 'exp-month'
    }
  };
  form.elements.exp_year = {
    title: 'Expiry Year',
    type: 'textfield',
    default_value: '',
    required: true,
    attributes: {
      'data-stripe': 'exp-year'
    }
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
    _commerce_stripe_order_id = form_state.values.order_id;
    Stripe.setPublishableKey(drupalgap.settings.stripe_api_key);
    $('#edit-commerce-drupalgap-stripe-form-submit').attr("disabled", "disabled");
    Stripe.card.createToken($('#commerce_drupalgap_stripe_form'), commerce_drupalgap_stripe_response);
  }
  catch (error) { console.log('commerce_drupalgap_stripe_form_submit - ' + error); }
}

function commerce_drupalgap_stripe_response(status, response) {
  try {
    //console.log(response);
    if (response.error) {
      $(".stripe-payment-errors").addClass('messages error').text(response.error.message);
      $('#edit-commerce-drupalgap-stripe-form-submit').removeAttr("disabled")
    } else {
      $(".stripe-payment-errors").text('');
      var order = _commerce_order[_commerce_stripe_order_id];
      var order_id = order.order_id;
        commerce_drupalgap_stripe_create({
          data: {
            order_id: order_id,
            stripe_token: response.id,
            payment_method: 'commerce_stripe'
          },
          success: function(data) {
            drupalgap_remove_pages_from_dom();
            commerce_checkout_complete({
              data: { order_id: order_id },
              success: function(result) {
                drupalgap_goto('checkout/complete/' + arg(2), { reloadPage: true });
              },
              error: function(xhr, status, message) {
                if (options.error) { options.error(xhr, status, message); }
              }
            });
          },
          error: function(error) {
            drupalgap_alert(error);
            console.log(JSON.stringify(error));
            console.log('WARNING: commerce_drupalgap_stripe_response. Be sure CRUD permissions are set > admin/structure/services/list/drupalgap/resources');
          }
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
  return 'commerce_drupalgap_stripe_form_' + order_id;
}
