/*******************************************************************
 *
 * Name: flag_inactive_customers.js
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * Version 0.0.1
 *
 *
 * Author: Marc Bien-Aime
 * Purpose: To display SO # and project on Opportunity page
 * Script: MR_multiselect.js
 * Deploy: 34
 *
 *
 * ******************************************************************* */

define(['N/search', 'N/record', 'N/runtime', 'N/error'],
  function(search, record, runtime, error) {
    function handleErrorAndSendNotification(e, stage) {
      log.error('Stage: ' + stage + ' failed', e);
    }

    function handleErrorIfAny(summary) {
      var inputSummary = summary.inputSummary;
      var mapSummary = summary.mapSumary;

      if (inputSummary.error) {
        var e = error.create({
          name: 'INPUT_STAGE_FAILED',
          message: inputSummary.error
        });

        if (mapSummary.error) {
          var f = error.create({
            name: 'Map_STAGE_FAILED',
            message: mapSummary.error
          });

        handleErrorAndSendNotification(e, 'getInputData');
        handleErrorAndSendNotification(f, 'Map');
      }
    }
  }

    function setAsNewCustomer(recordid) {
      if (isNew == false) {
        var customer = record.submitFields({
          type: record.Type.CUSTOMER,
          id: recordid,
          values: {
            custentity24: true
          }
        });

        log.debug(recordid + 'has been marked as a new customer');

      }

      customer.save();
    }


    function getInputData() {
      //Dynamically creates saved search to scan customer sales activity for the last 12 months
      return search.create({
        'type': search.Type.CUSTOMER,
        'filters': ['lastorderdate', search.Operator.NOTAFTER, 'same day last year'],
        'columns': ['internalid', 'entityid', 'email', 'phone', 'lastorderdate']
      });
    }

    function map(context) {
      log.debug('context', context.value);

      var rowJson = JSON.parse(context.value);
      var customerId = rowJson.values['internalid'].value;

      setAsNewCustomer(customerId);
    }

    /**
        * Executes when the summarize entry point is triggered and applies to the result set.
        *
        * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
        * @since 2015.1
        */

    function summarize(summary)
    {
    	log.debug('Summary Time','Total Seconds: '+summary.seconds);
    	log.debug('Summary Usage', 'Total Usage: '+summary.usage);
    	log.debug('Summary Yields', 'Total Yields: '+summary.yields);

    	log.debug('Input Summary: ', JSON.stringify(summary.inputSummary));
    	log.debug('Map Summary: ', JSON.stringify(summary.mapSummary));

    	//Grab Map errors
       handleErrorIfAny(summary);
		}

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };

  });
