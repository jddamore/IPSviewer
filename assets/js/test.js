// Note that this JavaScript should be removed from production
let index = 0;

var filesToTest = [
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/validated_samples/AT_ELGA_GmbH_01.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/validated_samples/DE_no_info_with_Advance_Directive.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/validated_samples/DK_Jens_Villadsen_01.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/validated_samples/EU_Giorgio_Cangioli_01.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/validated_samples/HK_IPS_Sample1.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/validated_samples/IPS_health_RIS_minimal.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/validated_samples/IPS_IG-bundle-01.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/validated_samples/IPS_IG_bundle-minimal.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/validated_samples/IPS_IG_bundle-no-info-required-sections.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/validated_samples/NL_Curavista_01.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/validated_samples/NZ_Peter_Jordan_AAA1234.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/validated_samples/NZ_Peter_Jordan_NNJ9186.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/validated_samples/US_no_info_with_Advance_Directive.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/AR_Repository_Example_01.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/AR_Repository_Example_02.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/AT_ELGA_GmbH_01.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/CA-IPS-Bundle1Example.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/CA_Bundle_FullsomeScenario1.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/CA_PuraJuniper_01-modified.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/CH_HL7CH_Examples_01.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/CY_194315.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/CY_249867.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/CY_Andreas_Ioannou_01.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/DK_Jens_Villadsen_01.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/EU_Giorgio_Cangioli_01.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/EU_Giorgio_Cangioli_02.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/EU_Giorgio_Cangioli_03.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/HK_IPS_Sample1.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/HK_IPS_Sample2.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/HK_IPS_Sample3.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/HK_IPS_Sample_with_medication.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/NL_Curavista_01.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/NL_Drimpy_01.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/NZ_Peter_Jordan_AAA1234.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/NZ_Peter_Jordan_NNJ9186.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/TW_Li-Hui_Lee_01-modified.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/UK_NHSx_IPS_Example_01-modified.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/UK_NHSx_IPS_Example_02-modified.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/US_Dynamic_Health_IT_Happy_Kid_FHIR_Bundle-IPS.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/US_Interoperability_Institute_Jared_Bruce_Adams-IPS.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/US_Interoperability_Institute_Louis_Daniel_Saunders-IPS.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/US_Interoperability_Institute_Pearl Holmes Levine-IPS.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/US_Interoperability_Institute_Rose Cox Burnett-IPS.json',
  'https://raw.githubusercontent.com/jddamore/IPSviewer/main/samples/connectathon_samples/US_Interoperability_Institute_Troy Dudley Gross-IPS.json'
]

const logThis = function (content) {
  content = content.toString();
  if (content.slice(0,5).toLowerCase() ==='error') $('#testlog').append(`<div style="color:red">${content}</div>`)
  else $('#testlog').append(`<div>${content}</div>`)
}

window.console.log = logThis;

$(document).ready(function () {
  $('#test').click(function () {
    alert('You have found a magic button that loads 40 samples and outputs debugging console.log information below. Refresh browser before re-using viewer.');
    runNext();
  });
});

const runNext = function () {
  if (index < filesToTest.length) {
    $.getJSON(`${filesToTest[index]}`, function () {
      console.log(`testing: ${filesToTest[index]}`);
    })
      .done(function (data) {
        $('#ipsInput').val(JSON.stringify(data));
        update(data);
        setTimeout(function () {
          index++;
          runNext();
        }, 100)
      })
      .fail(function (e) {
        console.log("error", e);
      });
  
  }
  else index = 0;
}

