$(document).ready(function () {

  var headerLength = $("#header").length;
  var footerLength = $("#footer").length;
  if (headerLength === 1) {
    $("#header").load("assets/html/header.html", function () {
      $("#submit").click(function () {
        updateFromText();
      });
      $('#clearSample').click(function () {
        clearData();
        $('.data').empty();
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
  if (footerLength === 1) {
    $("#footer").load("assets/html/footer.html", function () {
      // no actions on footer currently
    });  
  }
});

mode = "Entries";
Sqrl.autoEscaping(false);

const clearData = function () {
  document.getElementById("ipsInput").value = "";
}

const render = function (templateName, data, targetLocation) {
  if (templateName === 'Patient') {
    if (!data.custodian) data.custodian = {};
    if (!data.custodian.name) data.custodian.name = '[NOT FOUND]';
    if (!data.custodian.address || !data.custodian.address[0]) {
      data.custodian.address = [{ city: '', country: '' }];
    }
  }
  if (mode == "Entries") {
    var jqxhr = $.get("templates/" + templateName + ".html", function () { })
      .done(function (template) {
        // console.log(template);
        console.log(data);
        var templateResult = Sqrl.Render(template, data);
        $("#" + targetLocation).html(templateResult);
      }).fail(function (e) {
        console.log("error", e);
      });
  } else {
    var content = { titulo: data.title, div: "No text defined." };
    if (!content.titulo) content.titulo = data.resourceType;
    if (data.text) content.div = data.text.div;
    var jqxhr = $.get("templates/Text.html", function () { })
      .done(function (template) {
        var templateResult = Sqrl.Render(template, content);
        $("#" + targetLocation).html(templateResult);
      }).fail(function (e) {
        console.log("error", e);
      });
  }
};

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

const update = function (ips) {
  $("#checksTable").html("");
  $(".output").html("");
  ips.entry.forEach(function (entry) {
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
      composition.section.forEach(function (section) {
        if (!section || !section.code || !section.code.coding || !section.code.coding[0]) {
          alertMissingComposition = true;
          console.log('Section is missing coding information');
        }
        else if (section.code.coding[0].code == "11450-4") {
          console.log('Problems Section');
          section.problems = [];
          section.entry.forEach(function (problem) {
            console.log(problem.reference)
            section.problems.push(getEntry(ips, problem.reference));
          });
          render("Problems", section, "Problems");
        }

        else if (section.code.coding[0].code == "48765-2") {
          console.log('Allergies Section');
          section.allergies = [];
          section.entry.forEach(function (allergy) {
            console.log(allergy.reference)
            let allergy2 = getEntry(ips, allergy.reference);
            if (!allergy2.category) allergy2.category = [' '];
            if (!allergy2.type) allergy2.type = ' ';
            section.allergies.push(allergy2);
          });
          render("Allergies", section, "Allergies");
        }

        else if (section.code.coding[0].code == "10160-0") {
          console.log('Medications Section');
          section.medications = [];
          section.entry.forEach(function (medication) {
            console.log(medication.reference);
            var statement = getEntry(ips, medication.reference);
            // console.log(statement)
            var medicationReference;
            if (statement.medicationReference && statement.medicationReference.reference) medicationReference = getEntry(ips, statement.medicationReference.reference);
            else if (statement.medicationCodeableConcept) medicationReference = { code: statement.medicationCodeableConcept };
            else medicationReference = { code: { coding: [{ system: '', display: '', code: '' }] } }
            // console.log(medicationReference);
            section.medications.push({
              statement: statement,
              medication: medicationReference
            });
          });
          render("Medications", section, "Medications");
        }
        else if (section.code.coding[0].code == "11369-6") {
          console.log('Immunizations Section');
          section.immunizations = [];
          section.entry.forEach(function (immunization) {
            console.log(immunization.reference);
            section.immunizations.push(getEntry(ips, immunization.reference));
          });
          render("Immunizations", section, "Immunizations");
        }
        else if (section.code.coding[0].code == "30954-2") {
          console.log('Observations Section');
          section.observations = [];
          section.entry.forEach(function (observation) {
            console.log(observation.reference);
            section.observations.push(getEntry(ips, observation.reference));
          });
          render("Observations", section, "Observations");
        }
        else if (section.code.coding[0].code == "42348-3") {
          console.log('Advance Directives Section');
          section.ad = [];
          section.entry.forEach(function (ad) {
            console.log(ad.reference);
            section.ad.push(getEntry(ips, ad.reference));
          });
          render("AdvanceDirectives", section, "AdvanceDirectives");
        }
        else {
          console.log(`Section with code: ${section.code.coding[0].code} not rendered since no template`);
        }
      });
      if (alertMissingComposition) alert('Missing coding information in Composition resource. Rendering may be incomplete.')
    }
  });
};