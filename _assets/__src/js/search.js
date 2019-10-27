// stuff related to generating queries goes here

// GLOBALS

/*
  Define ajax object for query submit
  !! important
*/
var ajaxObj;

var constructLastContributed = function() {
  var submission = {
    "filter-constraint-1": {
      constraint1: "quickLink",
      constraint2: "lastSubmission"
    }
  };
  submitQuery(submission);
  jQuery('#qs-search-parameters-container').text('Last contributed traceroutes');
};

var constructViaNSACity = function() {
  // var submission = {};
  // var i = 1;

  // _.each(nsaCities, function(city) {
  //   var nsaObj = {
  //     constraint1: "does",
  //     constraint2: "contain",
  //     constraint3: "city",
  //     constraint4: city,
  //     constraint5: "OR"
  //   };
  //   submission["filter-constraint-"+i] = nsaObj;
  //   i++;
  // });
  var submission = {
    "filter-constraint-1": {
      constraint1: "quickLink",
      constraint2: "viaNSACity"
    }
  };
  submitQuery(submission);
  jQuery('#qs-search-parameters-container').text('Goes via an NSA city');
};

var constructBoomerangs = function() {
  // if user has been geolocated
  var submission = null;
  if (myCountry.length > 0) {
    submission = {
      "filter-constraint-1": {
        constraint1: "does",
        constraint2: "originate",
        constraint3: "country",
        constraint4: myCountry,
        constraint5: "AND"
      },
      "filter-constraint-2": {
        constraint1: "does",
        constraint2: "goVia",
        constraint3: "country",
        constraint4: "US",
        constraint5: "AND"
      },
      "filter-constraint-3": {
        constraint1: "does",
        constraint2: "terminate",
        constraint3: "country",
        constraint4: myCountry,
        constraint5: "AND"
      }
    }
    jQuery('#qs-search-parameters-container').text('Does Originate in Country '+myCountry+' AND Does Go via Country US AND Does Terminate in Country '+myCountry);
  } else {
    submission = {
      "filter-constraint-1": {
        constraint1: "does",
        constraint2: "originate",
        constraint3: "country",
        constraint4: "CA",
        constraint5: "AND"
      },
      "filter-constraint-2": {
        constraint1: "does",
        constraint2: "goVia",
        constraint3: "country",
        constraint4: "US",
        constraint5: "AND"
      },
      "filter-constraint-3": {
        constraint1: "does",
        constraint2: "terminate",
        constraint3: "country",
        constraint4: "CA",
        constraint5: "AND"
      }
    }
    jQuery().toastmessage('showWarningToast', 'We were unable to determine your location - submitting a Canadian boomerang query instead');
    jQuery('#qs-search-parameters-container').text('Does Originate in Country CA AND Does Go via Country US AND Does Terminate in Country CA');
  }

  submitQuery(submission);
};

var constructFromMyIsp = function() {
  if (myAsn) {
    var submission = {
      "filter-constraint-1": {
        constraint1: "does",
        constraint2: "originate",
        constraint3: "asnum",
        constraint4: myAsn,
        constraint5: "AND"
      }
    }
    submitQuery(submission);
    jQuery('#qs-search-parameters-container').text('Does Originate in AS number ' + myAsn);
  } else {
    jQuery().toastmessage('showErrorToast', 'We were unable to determine your ISP - please try a different query');
  }
};

var constructFromMyCity = function() {
  if (myCity) {
    var submission = {
      "filter-constraint-1": {
        constraint1: "does",
        constraint2: "originate",
        constraint3: "city",
        constraint4: myCity,
        constraint5: "AND"
      }
    }
    submitQuery(submission);
    jQuery('#qs-search-parameters-container').text('Does Originate in City ' + myCity);
  } else {
    jQuery().toastmessage('showErrorToast', 'We were unable to determine your city - please try a different query');
  }
};

var constructFromMyCountry = function() {
  if (myCountry) {
    var submission = {
      "filter-constraint-1": {
        constraint1: "does",
        constraint2: "originate",
        constraint3: "country",
        constraint4: myCountry,
        constraint5: "AND"
      }
    }
    submitQuery(submission);
    jQuery('#qs-search-parameters-container').text('Does Originate in Country ' + myCountry);
  } else {
    jQuery().toastmessage('showErrorToast', 'We were unable to determine your country - please try a different query');
  }
};

var constructBS = function() {
  var submission = {};
  var i = 1;

  // IMPORTANT! We must iterate over the Via conditions first
  // This is to accommodate the backend, since apparently OR conditions must be the first in a query
  // The only reason this works is that the only OR conditions are contained as the first criteria in Via-NSA

  // iterate over all of the 'via' conditions
  jQuery('#bs-via-popup .bs-input').each(function(index, el) {
    if (jQuery(el).val() != "") {
      var yesOrNo = jQuery(el).val();
      if (jQuery(el).data('constraint') === "NSA") {
        // TODO: this is a terrible bandaid because we didn't think through the design
        if (yesOrNo === "yes" || yesOrNo === "no") {
          _.each(nsaCities, function(city, index) {
            var nsaObj = {
              constraint1: "",
              constraint2: "contain",
              constraint3: "city",
              constraint4: city,
              constraint5: "OR"
            };

            if (yesOrNo === "yes") {
              nsaObj.constraint1 = "does"
            } else if (yesOrNo === "no") {
              nsaObj.constraint1 = "doesNot"
            } else {
              console.error('We shouldnt be able to get here')
            }
            // we need to switch the last condition to an AND if there are 'To' basic search criteria added (eg terminate Toronto)
            if (index+1 === nsaCities.length) {
              nsaObj.constraint5 = "AND"
            }
            submission["filter-constraint-"+i] = nsaObj;
            i++;
          });
        } else {
          jQuery().toastmessage('showErrorToast', 'When filling in the NSA field, please include either "yes" or "no"');
        }
      } else {
        var origObj = {
          constraint1: "does",
          constraint2: "goVia",
          constraint3: jQuery(el).data('constraint'),
          constraint4: jQuery(el).val(),
          constraint5: "AND"
        };
        submission["filter-constraint-"+i] = origObj;
        i++;
      }
    }
  });
  // iterate over all of the 'from' conditions
  jQuery('#bs-originate-popup .bs-input').each(function(index, el) {
    if (jQuery(el).val() != "") {
      // adjust constraint2 for special cases e.g. submitter
      var constraint2_val = "";
      if(jQuery(el).data('constraint') == "submitter" ){
        constraint2_val = "contain";
      } else {
        constraint2_val = "originate";
      }

      var origObj = {
        constraint1: "does",
        constraint2: constraint2_val,
        constraint3: jQuery(el).data('constraint'),
        constraint4: jQuery(el).val(),
        constraint5: "AND"
      };
      submission["filter-constraint-"+i] = origObj;
      i++;
    }
  });
  // iterate over all of the 'to' conditions
  jQuery('#bs-terminate-popup .bs-input').each(function(index, el) {
    if (jQuery(el).val() != "") {

      var constraint2 = "";
      if(jQuery(el).data('constraint') == "destHostName" ){
        constraint2 = "contain";
      } else {
        constraint2 = "terminate";
      }

      var origObj = {
        constraint1: "does",
        constraint2: constraint2,
        constraint3: jQuery(el).data('constraint'),
        constraint4: jQuery(el).val(),
        constraint5: "AND"
      };
      submission["filter-constraint-"+i] = origObj;
      i++;
    }
  });

  if (!_.isEmpty(submission)) {
    submitQuery(submission);
  } else {
    jQuery().toastmessage('showErrorToast', 'Please fill in at least one search term field to query the database.');
  }
};

var constructAS = function() {
  var submission = {};
  var rowNum = 0;
  var errorCount = 0;

  // clear the error fields
  jQuery('.constraint').removeClass('blank-field-error');
  jQuery('#as-search-container .input-holder').each(function(index, row) {
    rowNum++;
    var constNum = 0;
    console.log(index, jQuery(row));
    var constraint = {};
    _.each(jQuery(row).children('.constraint-container'), function(c) {
      constNum++;
      var inputEl = jQuery(c).find('.constraint-value');
      if (jQuery(inputEl).val()) {
        constraint['constraint'+constNum] = inputEl.val();
      } else {
        // highlight unfilled fields
        errorCount++;
        jQuery(c).children().addClass('blank-field-error');
      }
    });
    // one line of filters
    submission["filter-constraint"+rowNum] = constraint;
  });

  // if there are no errors, submit
  if (errorCount === 0) {
    submitQuery(submission);
  } else {
    jQuery().toastmessage('showErrorToast', "One or more fields were not filled. Submission canceled.");
  }
};

var createASRow = function(row) {
  var inputHolderEl = jQuery('<div/>');
  inputHolderEl.addClass('advanced input-holder');

  // go over each constraint
  _.each(constraints, function(con) {
    var constraintEl = jQuery('<div/>');
    constraintEl.addClass('advanced-input constraint-container constraint-'+con.name);
    jQuery(constraintEl).data('constraint', con.name);
    jQuery(inputHolderEl).append(constraintEl);

    // go over the options in each constraint (input is special case)
    if (con.name === "input") {
      var divEl = '<div class="ui fluid input"><input class="constraint-value" type="text" placeholder="Submitter name"></div>';
      jQuery(constraintEl).append(divEl);
    } else {
      var selectEl = jQuery('<select/>');
      selectEl.addClass('constraint-value ui fluid dropdown');
      _.each(con.options, function(opt) {
        selectEl.append(new Option(opt.display, opt.value));
      });

      // autocomplete binding for submitter for first row happens in loadAutoCompleteData (can't safely do it here, cause of async)
      selectEl.prop("selectedIndex", 0);

      // set up the change listener
      if (con.name === "kind") {
        selectEl.change(function(ev) {
          var el = jQuery(this).parent().next().find('input');
          var value = jQuery(ev.target).val();
          // adjust the placeholder in the input field
          _.each(constraints[2].options, function(obj) {
            if (obj.value === value) {
              jQuery(el).attr('placeholder', obj.display);
            }
          });
          bindAutocomplete(el, value);
        });
      }

      jQuery(constraintEl).append(selectEl);
    }
  });

  // append either a + or a - button
  var controlsEl = jQuery('<div/>');
  controlsEl.addClass('advanced-input constraint-buttons');
  var buttonEl = jQuery('<button/>');
  buttonEl.addClass('circular ui icon button');
  if (row === "first") {
    // add button
    jQuery(buttonEl).append('<i class="create-search-row-btn icon settings"><img src="_assets/img/icn-add.svg" alt="add"></i>');
    jQuery(buttonEl).click(function() {
      createASRow();
    });
  } else {
    // remove button
    jQuery(buttonEl).append('<i class="destroy-search-row-btn icon settings"><img src="_assets/img/icn-remove.svg" alt="remove"></i>');
    jQuery(buttonEl).click(function() {
      jQuery(inputHolderEl).remove();
    });
    // adding the autocomplete for Submitter
    var inputEl = jQuery(inputHolderEl).find('.constraint-input').find('input');
    bindAutocomplete(inputEl, "submitter");
  }
  jQuery(controlsEl).append(buttonEl);
  jQuery(inputHolderEl).append(controlsEl);

  jQuery('#as-search-container').append(inputHolderEl);
};

var submitCustomQuery = function(trId, multipleTRs) {
  jQuery('#userloc').hide();
  var singleTrJSON = {
      "filter-constraint-1":
      {
        constraint1: "does",
        constraint2: "contain",
        constraint3: "trId",
        constraint4: trId,
        constraint5: "AND"
      }
  };
  var jsonToString = JSON.stringify(singleTrJSON);
  submitQuery(singleTrJSON);
}

/* submission for new map website */
var submitQuery = function(obj) {
  console.log('Submitting...', obj);
  showLoader();
  jQuery('#filter-results-content').fadeOut('fast');
  jQuery('#filter-results-empty').show();

  ajaxObj = jQuery.ajax(url_base + '/application/controller/map.php', {
    type: 'post',
    data: obj,
    success: function(e) {
      console.log("Query response received: " + e);

      try {
        data = JSON.parse(e);
        if (data.totTrs != 0 && data.result != undefined) {
          ixMapsDataJson = jQuery.parseJSON(data.result);
          totTrs = data.totTrs;

          jQuery('#traceroutes-results-table').html(data.trsTable);
          jQuery('#tot-results').html(data.totTrs);
          jQuery('#tot-results-found').html(data.totTrsFound);
          jQuery('#my-ip').html(myIp);

          console.log(" Total TRs: "+data.totTrs);
          console.log(" Total Hops: "+data.totHops);
          console.log(" Execution Time: "+data.execTime+' Sec.');
          jQuery('#filter-results-summary').html(data.querySummary);

          loadMapData();
          hideLoader();
          jQuery('#filter-results-empty').hide();
          jQuery('.sidebar.vertical.legend').removeClass('overlay animating visible');
          jQuery('#filter-results-content').fadeIn('fast');

        } else {
          errText = "No routes were found with the criteria you provided. Adjust the query options to be more inclusive, then click Search";
          showResponseErrors(errText);
        }
      } catch(e) {
        errText = "Malformed JSON returned - something went wrong on the backend!";
        showResponseErrors(errText);
      }

    },
    error: function (e) {
      errText = "Search timed out. Try a simpler query";
      showResponseErrors(errText);
    },
    timeout: 45000
  });
};

var showResponseErrors = function(text) {
  hideLoader();
  jQuery.toast({
    text: '<span style="font-size: 20px;">'+text+'</span>',
    hideAfter: 10000,
    allowToastClose: true,
    position: 'mid-center',
    icon: 'error'
  });
}


/* User location query functions and vars */

var userLocQueryOptions = {};
var dataSearch = {};
var usrLocQuery = {};

var submitUserLocObject = function() {
  submitQuery(usrLocQuery);
}

var buildTrCountQuery = function(type) {
  console.log("buildTrCountQuery", type);

  resetUserLocQueryOptions(); // !!

  var obj;

  // first load query
  if (type=='first') {

    obj = {
      constraint1: "does",
      constraint2: "originate",
      constraint3: "asnum",
      constraint4: myAsn,
      constraint5: "AND"
    }
    usrLocQuery['myAsn'] = obj;

    if (myCity!="") {
      obj = {
        constraint1: "does",
        constraint2: "originate",
        constraint3: "city",
        constraint4: myCity,
        constraint5: "AND"
      };
      usrLocQuery['myCity'] = obj;
    }

  // query dynamically created based on user selections in opening modal
  } else {
    usrLocQuery = {};

    var submitter = jQuery(".userloc-submitter").val();
    var myCityUsr = jQuery(".userloc-city").val();
    var myCountryUsr = jQuery(".userloc-country").val();

    if(jQuery(".userloc-asn-chkbox").is(":checked")){
      var obj = {
          constraint1: "does",
          constraint2: "originate",
          constraint3: "asnum",
          constraint4: userLocQueryOptions.myAsn.value,
          constraint5: "AND"
      };
      usrLocQuery['myAsn'] = obj;
    }

    if(myCountryUsr != "" && jQuery(".userloc-country-chkbox").is(":checked")){
      var obj = {
          constraint1: "does",
          constraint2: "originate",
          constraint3: "country",
          constraint4: myCountryUsr,
          constraint5: "AND"
      };
      usrLocQuery['myCountry'] = obj;
    }

    if(myCityUsr!="" && jQuery(".userloc-city-chkbox").is(":checked")){
      var obj = {
          constraint1: "does",
          constraint2: "originate",
          constraint3: "city",
          constraint4: myCityUsr,
          constraint5: "AND"
      };
      usrLocQuery['myCity'] = obj;
    }

    if(submitter!="" && jQuery(".userloc-submitter-chkbox").is(":checked")){
      var obj = {
          constraint1: "does",
          constraint2: "contain",
          constraint3: "submitter",
          constraint4: submitter,
          constraint5: "AND"
      };
      usrLocQuery['submitter'] = obj;
    }

  } // end if

  loadingUsrLocQuery();
  submitTrCount(usrLocQuery);
}

/* count results for a submission constraint */
var submitTrCount = function(obj) {
  ajaxObj = jQuery.ajax(url_base + '/application/controller/map_search.php', {
    type: 'post',
    data: obj,
    success: function (e) {
      console.log("submitTrCount OK");
      dataSearch = jQuery.parseJSON(e);
      console.log(dataSearch);
      renderTrCountData(dataSearch);
    },
    error: function (e) {
      console.log("Error! submitTrCount");

    }
  });
};

var resetUserLocQueryOptions = function(type) {
  userLocQueryOptions = {
    "submitter": {
      "value": "",
      "total": 0,
      "checked": false,
    },
    "myAsn": {
      "value": "",
      "total": 0,
      "checked": false,
    },
    "myCity": {
      "value": "",
      "total": 0,
      "checked": false,
    },
    "myCountry": {
      "value": "",
      "total": 0,
      "checked": false,
    }
  };

  // get data for user geo location
  userLocQueryOptions.myAsn.value = myAsn;

  // collect values entered by user
  var myCityUsr = jQuery(".userloc-city").val();
  var myCountryUsr = jQuery(".userloc-country").val();

  userLocQueryOptions.myCountry.value = myCountryUsr; // note that allowing user to change country code makes the country name unavailable

  // reset flag icon
  if (myCountryUsr != "" && myCountryUsr != myCountry) {
    jQuery('.userloc-country-flag').removeClass('flag');
    jQuery('.userloc-country-flag').removeClass(myCountry.toLowerCase());
    jQuery('.userloc-country-flag').addClass(myCountryUsr.toLowerCase());
    jQuery('.userloc-country-flag').addClass('flag');
  } else {
    jQuery('.userloc-country').val(myCountry);
    jQuery('.userloc-country-flag').addClass(myCountry.toLowerCase());
    jQuery('.userloc-country-flag').addClass('flag');
  }

  // update ui fields
  jQuery('.userloc-ip').text(myIp);
  jQuery('.userloc-isp').text(myIsp);
  jQuery('.userloc-asn').text(myAsn);

  // check if city name has been changed in ui
  if (myCityUsr!="" && myCityUsr!=myCity) {
    jQuery('.userloc-city').val(myCityUsr);
    userLocQueryOptions.myCity.value = myCityUsr;
  } else {
    jQuery('.userloc-city').val(myCity);
    userLocQueryOptions.myCity.value = myCity;
  }

}

var renderTrCountData = function(data) {
  /*Check if the element is in the submitted query */
  if (typeof usrLocQuery.submitter != 'undefined'){
    userLocQueryOptions.submitter.total = data.results.submitter.total;
    if(data.results.submitter.total==0){
      delete usrLocQuery['submitter'];
    }
  }
  if (typeof usrLocQuery.myAsn != 'undefined'){
    userLocQueryOptions.myAsn.total = data.results.myAsn.total;
    if(data.results.myAsn.total==0){
      delete usrLocQuery['myAsn'];
    }
  }
  if (typeof usrLocQuery.myCity != 'undefined'){
    userLocQueryOptions.myCity.total = data.results.myCity.total;
    if(data.results.myCity.total==0){
      delete usrLocQuery['myCity'];
    }
  }
  if (typeof usrLocQuery.myCountry != 'undefined'){
    userLocQueryOptions.myCountry.total = data.results.myCountry.total;
    if(data.results.myCountry.total==0){
      delete usrLocQuery['myCountry'];
    }
  }

  jQuery(".userloc-trs-tot").html(data.total); // !!

  jQuery(".userloc-submitter-tot").html(userLocQueryOptions.submitter.total);
  if(userLocQueryOptions.submitter.total != 0){
    jQuery(".userloc-submitter-chkbox").prop('checked', true);
    userLocQueryOptions.submitter.checked = true;
  }

  jQuery(".userloc-asn-tot").html(userLocQueryOptions.myAsn.total);
  if(userLocQueryOptions.myAsn.total != 0){
    jQuery(".userloc-asn-chkbox").prop('checked', true);
    userLocQueryOptions.myAsn.checked = true;
  }

  jQuery(".userloc-city-tot").html(userLocQueryOptions.myCity.total);
  if(userLocQueryOptions.myCity.total != 0){
    jQuery(".userloc-city-chkbox").prop('checked', true);
    userLocQueryOptions.myCity.checked = true;
  }

  // I think we can remove this, no?
  jQuery(".userloc-country-tot").html(userLocQueryOptions.myCountry.total);
  if(userLocQueryOptions.myCountry.total != 0){
    jQuery(".userloc-country-chkbox").prop('checked', true);
    userLocQueryOptions.myCountry.checked = true;
  }

  /* TODO: add a link to show last contribution */
  if(data.total != 0){

    jQuery('#myloc-contribute-btn').removeClass('blue');
    jQuery('#myloc-submit-btn').addClass('blue');

    jQuery('#myloc-submit-btn').unbind('click'); // disable click
    // re-create click event
    jQuery('#myloc-submit-btn').click(function() {
      submitUserLocObject();
      jQuery('.opening.modal').modal('hide');
    });

  } else {
    jQuery('#myloc-submit-btn').unbind('click'); // disable click
    jQuery('#myloc-submit-btn').removeClass('blue');
    jQuery('#myloc-contribute-btn').addClass('blue');
  }

}

var loadingUsrLocQuery = function() {
  var img = '<img width="20px" src="/_assets/img/icn-loading.gif"/>';
  //toggleLoadingUsrLocQuery('show');

  if (typeof usrLocQuery.submitter != 'undefined'){
    jQuery(".userloc-submitter-tot").html(img);
  }
  if (typeof usrLocQuery.myAsn != 'undefined'){
    jQuery(".userloc-asn-tot").html(img);
  }

  if (typeof usrLocQuery.myCountry != 'undefined'){
    jQuery(".userloc-country-tot").html(img);
  }
  if (typeof usrLocQuery.myCity != 'undefined'){
    jQuery(".userloc-city-tot").html(img);
  }

  jQuery(".userloc-trs-tot").html(img);
  jQuery('#myloc-submit-btn').removeClass('blue');
}

