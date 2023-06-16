// check variable to see if header, which includes data loading active
let headerLength = 0;

// Set the mode for the default mode for data presentation
// Entries = machine readable FHIR resources, Narrative = Compostion.section.text.div
let mode = "Entries";

// Sqrl setting. See https://v7--squirrellyjs.netlify.app/docs/v7/auto-escaping
Sqrl.autoEscaping(false);

// Load header and footer on document ready and attach button actions
$(document).ready(function () {
  headerLength = $("#header").length;
  let footerLength = $("#footer").length;
  if (headerLength === 1) {
    $("#header").load("assets/html/header.html", function () {
      $("#submit").click(function () {
        updateFromText();
      });
      $('#clearSample').click(function () {
        clearData();
      })
      $("#loadSample").click(function () {
        $.getJSON('./samples/sample.json', function () {
          console.log("success");
        })
          .done(function (data) {
            $('#ipsInput').val(JSON.stringify(data));
            update(data);
          })
          .fail(function (e) {
            console.log("error", e);
          });
      });
    });
  }
  $('#FhirDropdown').attr('href', "javascript:mode='Entries'; $('#mode').html('Displaying FHIR Entries'); updateFromText();");
  $('#NarrativeDropdown').attr('href', "javascript:mode='Text'; $('#mode').html('Displaying Narrative'); updateFromText();");
  if (footerLength === 1) {
    $("#footer").load("assets/html/footer.html", function () {
      // no actions on footer currently
    });
  }
});

// Clear data button function. Should be called on all new data loads 
const clearData = function () {
  // clear textbox
  $("#ipsInput").val("");
  // clear prior message
  $("#renderMessage").hide();
  // clear all viewer data and data checks table
  $('.data').empty();
}

// Update the contents from new JSON pasted in TextBox
const updateFromText = function () {
  var ipsTxt = $('#ipsInput').val();
  if (ipsTxt) {
    try {
      var ips = JSON.parse(ipsTxt);
      update(ips);
    } catch (e) {
      console.log(e);
      alert("Invalid IPS - " + e);
    }
  }
  else {
    alert('Invalid content - Enter IPS Bundle (JSON) in "Paste Your IPS Here" box');
  }
};

// Update the data in viewer based on mode and data
const render = function (templateName, data, targetLocation, sectionCount) {
  let entryCheck = 0;
  if (targetLocation === "Other") {
    $("#OtherSections").append(`<div class="col-md-12 output data" id="Other${sectionCount}"></div>`)
  }
  if (templateName === 'Patient') {
    if (!data.custodian) data.custodian = {};
    if (!data.custodian.name) data.custodian.name = '[NOT FOUND]';
    if (!data.custodian.address || !data.custodian.address[0]) {
      data.custodian.address = [{ city: '', country: '' }];
    }
    entryCheck = 1;
  }
  else if (data.entry) {
    entryCheck = data.entry.length
  }
  if (mode == "Entries" && templateName !== "Other") {
    var jqxhr = $.get("templates/" + templateName + ".html", function () { })
      .done(function (template) {
        // console.log(template);
        console.log(data);
        var templateResult = Sqrl.Render(template, data);
        $("#" + targetLocation).html(templateResult);
      }).fail(function (e) {
        console.log("error", e);
      });
  }
  else {
    // if the mode was intended as Entries and narrative fallback used, display message
    if (mode === "Entries") $("#renderMessage").attr("style", "display:inline");
    else $("#renderMessage").hide();
    var content = { titulo: data.title, div: "No text defined.", index: sectionCount };
    if (!content.titulo) content.titulo = data.resourceType;
    if (data.text) content.div = data.text.div;
    console.log(content);
    var jqxhr = $.get("templates/Text.html", function () { })
      .done(function (template) {
        var templateResult = Sqrl.Render(template, content);
        if (targetLocation !== "Other") $("#" + targetLocation).html(templateResult);
        else {
          // console.log(`#Other${sectionCount}`);
          // console.log(templateResult);
          $(`#Other${sectionCount}`).html(templateResult);
        }
      }).fail(function (e) {
        console.log("error", e);
      });
  }
};

// This is the header table for some basic data checks
const renderTable = function (data) {
  let jqxhr = $.get("templates/Checks.html", function () { })
    .done(function (template) {
      let templateResult = Sqrl.Render(template, data);
      console.log(data);
      $("#checksTable").html(templateResult);
    });
}

// For machine-readable content, use the reference in the Composition.section.entry to retrieve resource from Bundle
const getEntry = function (ips, fullUrl) {
  var result;
  ips.entry.forEach(function (entry) {
    if (entry.fullUrl.includes(fullUrl)) {
      console.log(`match ${fullUrl}`);
      result = entry.resource;
    }
    // Attempt to match based on resource and uuid
    else {
      let newMatch = fullUrl
      if (entry.resource && entry.resource.resourceType) {
        // remove the resource from reference
        newMatch = newMatch.replace(entry.resource.resourceType, '');
        // remove slash
        newMatch = newMatch.replace(/\//g, '');
        // console.log(newMatch); 
      }
      if (entry.fullUrl.includes(newMatch)) {
        console.log(`match uuid ${newMatch}`);
        result = entry.resource;
      }
    }
  });
  if (!result) {
    console.log(`missing reference ${fullUrl}`);
    result = {};
  }
  return result;
};

// Primary function to traverse the Bundle and get data
// Calls the render function to display contents 
const update = function (ips) {
  $(".output").html("");
  $("#renderMessage").hide();
  for (let i = 0; i < ips.entry.length; i++) {
    let entry = ips.entry[i];
    if (!entry.resource) console.log(entry);
    if (entry.resource.resourceType == "Composition") {
      var composition = entry.resource;
      let patient = {};
      if (composition.custodian && composition.custodian.reference) {
        console.log(composition.custodian.reference);
        composition.custodian = getEntry(ips, composition.custodian.reference);
      }
      else {
        console.log('no custodian reference');
        composition.custodian = {};
      }
      if (composition.subject && composition.subject.reference) {
        console.log(composition.subject.reference);
        patient = getEntry(ips, composition.subject.reference);
      }
      else console.log('no subject reference');
      render("Composition", composition, "Composition");
      console.log('Patient Card');
      if (patient) {
        console.log(patient)
        render("Patient", patient, "Patient");
      }
      alertMissingComposition = false;
      for (let j = 0; j < composition.section.length; j++) {
        let section = composition.section[j];
        if (!section || !section.code || !section.code.coding || !section.code.coding[0]) {
          alertMissingComposition = true;
          console.log('Section is missing coding information');
        }
        else if (section.code.coding[0].code == "11450-4") {
          console.log('Problems Section', j);
          section.problems = [];
          section.entry.forEach(function (problem) {
            console.log(problem.reference)
            section.problems.push(getEntry(ips, problem.reference));
          });
          render("Problems", section, "Problems", j);
        }

        else if (section.code.coding[0].code == "48765-2") {
          console.log('Allergies Section', j);
          section.allergies = [];
          section.entry.forEach(function (allergy) {
            console.log(allergy.reference)
            let allergy2 = getEntry(ips, allergy.reference);
            if (!allergy2.category) allergy2.category = [' '];
            if (!allergy2.type) allergy2.type = ' ';
            section.allergies.push(allergy2);
          });
          render("Allergies", section, "Allergies", j);
        }

        else if (section.code.coding[0].code == "10160-0") {
          console.log('Medications Section', j);
          section.medications = [];
          section.entry.forEach(function (medication) {
            console.log(medication.reference);
            // while variable name is Statement, this may be either MedicationStatement or MedicationRequest
            let statement = getEntry(ips, medication.reference);
            let medicationReference;
            // First check if the medication is contained
            if (statement.contained && statement.contained[0] && statement.contained[0].resourceType === 'Medication') {
              medicationReference = statement.contained[0];
            }
            // Either MedicationRequest or MedicationStatement may have a reference to Medication 
            else if (statement.medicationReference && statement.medicationReference.reference) medicationReference = getEntry(ips, statement.medicationReference.reference);
            else if (statement.medicationCodeableConcept) medicationReference = { code: statement.medicationCodeableConcept };
            else medicationReference = { code: { coding: [{ system: '', display: '', code: '' }] } }
            // MedicationStatement has dosage while MedicationRequest has dosageInstruction. Use alias to simplify template
            if (statement.dosageInstruction) statement.dosage = statement.dosageInstruction;
            section.medications.push({
              statement: statement,
              medication: medicationReference
            });
          });
          render("Medications", section, "Medications", j);
        }
        else if (section.code.coding[0].code == "11369-6") {
          console.log('Immunizations Section', j);
          section.immunizations = [];
          section.entry.forEach(function (immunization) {
            console.log(immunization.reference);
            section.immunizations.push(getEntry(ips, immunization.reference));
          });
          render("Immunizations", section, "Immunizations", j);
        }
        else if (section.code.coding[0].code == "30954-2") {
          console.log('Observations Section', j);
          section.observations = [];
          section.entry.forEach(function (observation) {
            console.log(observation.reference);
            section.observations.push(getEntry(ips, observation.reference));
          });
          render("Observations", section, "Observations", j);
        }
        else if (section.code.coding[0].code == "42348-3") {
          console.log('Advance Directives Section', j);
          section.ad = [];
          section.entry.forEach(function (ad) {
            console.log(ad.reference);
            section.ad.push(getEntry(ips, ad.reference));
          });
          render("AdvanceDirectives", section, "AdvanceDirectives", j);
        }
        else {
          console.log(`Section with code: ${section.code.coding[0].code} not rendered since no template, section: ${j}`);
          render("Other", section, "Other", j);
        }
      };
      if (alertMissingComposition) alert('Missing coding information in Composition resource. Rendering may be incomplete.')
    }
  };
  //don't need to do anything if the header is not shown
  if (headerLength === 1) {
    checks(ips)
  }
};

// Updates the header data for simple data checks. Note that this is NOT full FHIR validation 
const checks = function (ips) {
  let composition = ips.entry[0];
  let data = { 
    data: [],
    errors: [] 
  };
  if (composition.resource.resourceType === "Composition" && composition.resource.section) {
    let sections = {
      allergies: false,
      medications: false,
      problems: false
    };
    for (let i = 0; i < composition.resource.section.length; i++) {
      let section = composition.resource.section[i]
      let newData = {};
      newData.display = section.title;
      if (section.code.coding[0].code == "48765-2") sections.allergies = true;
      if (section.code.coding[0].code == "10160-0") sections.medications = true;
      if (section.code.coding[0].code == "11450-4") sections.problems = true;
      if (section.entry) {
        newData.entries =   section.entry.length;
        newData.entriesColor = "green";
      }
      else {
        newData.entries = 0;
        newData.entriesColor = "red";
      }
      if (section.text && section.text.div) {
        newData.narrative = "✓"
        newData.narrativeColor = "green";
      }
      else {
        newData.narrative = "✗"
        newData.narrativeColor = "red";
      }
      data.data.push(newData);
    }
    if (!sections.allergies) data.errors.push("Missing required allergies section");
    if (!sections.medications) data.errors.push("Missing required medications section");
    if (!sections.problems) data.errors.push("Missing required problems section");
  }
  renderTable(data);
}