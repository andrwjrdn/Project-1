
 var database = firebase.database();

var apiLoginURL = "https://sandbox-authservice.priaid.ch/login"; //sandbox
//var apiLoginURL = "https://authservice.priaid.ch/login";      //real live data

var apiURL = "https://sandbox-healthservice.priaid.ch"; //sandbox
//var apiURL = "https://healthservice.priaid.ch";       //live data

function getApiData(queryURL, callBack) {
  var api_key = "laurabermudezg@gmail.com"  //sandbox
  //var api_key = "Qx6s7_GMAIL_COM_AUT";    //live
  var uri = apiLoginURL;
  var secret_key = "p2C3QtAr84HdZn9q6";     //sandbox
  //var secret_key = "Nm7o6S3Lqt9AJb84X";   //live
  var computedHash = CryptoJS.HmacMD5(uri, secret_key);
  var computedHashString = computedHash.toString(CryptoJS.enc.Base64);

  $.ajax({
    url: uri,
    method: "POST",
    headers:
      { 'Authorization': "Bearer " + api_key + ":" + computedHashString }
  }).then(function (tokenresponse) {

    var token = tokenresponse.Token;

    $.ajax({
      url: queryURL,
      method: "GET",
      data: {
        token: token,
        language: "en-gb"
      }
    }).then(callBack);
  });
}

function getDiagnosis(symptomIdList, gender, birthYear) {
  var queryURL = apiURL + '/diagnosis?symptoms=' + JSON.stringify(symptomIdList) + '&gender=' + gender + '&year_of_birth=' + birthYear;
  getApiData(queryURL, showDiagnosis);
}

function showDiagnosis(response) {
  console.log(response);

  if (response.length < 1) {

    $(".diagnosisCard").append($('<h3>').text("No diagnosis found. Please enter more symptoms and try again."));
    return;

  }

  $(".diagnosisCard").show();
  for (var i = 0; i < response.length; i++) {
    var issue = response[i].Issue;

    var row = new $('<tr>', {
      id: issue.ID
    });

    row.append($('<td>').text(issue.ProfName));
    row.append($('<td>').text(Math.round(+issue.Accuracy) + "%"));
    var specilizationCol = new $('<td>');

    var btnGroup = new $('<div>', {
      class: 'btn-group-vertical'
    });

    const specialisations = response[i].Specialisation;
    for (var j = 0; j < specialisations.length; j++) {
      const specialisationName = specialisations[j].Name;
      var specializationBtn = new $('<button>', {
        class: "btn btn-light specializationBtn",
        'data-specialisation': specialisationName,
        text: specialisationName,
        click: function () {
          //CALL find doctors method - sewon
          //getDoctors(specializationName);
          geoFindMe(specialisationName);
        }
      });
      btnGroup.append(specializationBtn);
    }

    specilizationCol.append(btnGroup);
    row.append(specilizationCol);

    $("#diagnosisList").append(row);
  }
}

function searchDiagnosis() {

  var symptomsIds = $("#symptomsSelect").val();
  console.log(symptomsIds);
  var gender =  $('input[name="inlineGenderOptions"]:checked').val();
  console.log(gender);

  var birthYear = $("#inputYearOfBirth").val();
  console.log(birthYear);

  getDiagnosis(symptomsIds,gender, birthYear );

}


$(document).ready(function () {

  fillSymptoms("#symptomsSelect");

  fillYears("#inputYearOfBirth");

});

function fillYears(selectId){
  currentYear = 2019;
  for(var i=currentYear; i>currentYear-100; i--) {
    var yearOption = new $('<option>', {
      value: i,
      text: i
    });
    $(selectId).append(yearOption);
  }
}

function fillSymptoms(selectId) {

  database.ref('/symptoms/').on("value", function (snapshot) {
    // console.log(snapshot.val());
    var symptoms = snapshot.val();

    Object.keys(symptoms).forEach(function (symptomId) {
      var symptom = symptoms[symptomId];

      // console.log(symptom.id);
      // console.log(symptom.name);
      
      var symptomOption = new $('<option>', {
        value: symptom.id,
        text: symptom.name
      });
      $(selectId).append(symptomOption);
    })
    //update html
    $('.selectpicker').selectpicker('refresh');
  });
}

