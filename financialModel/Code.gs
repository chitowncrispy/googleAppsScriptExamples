function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate().setTitle('Financial Model Project');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

function runFinancialModel() {
  const spreadsheet = SpreadsheetApp.openById('1yD4YqRZjQo-35Y0mFliZuGZBeClUWxyeurHArAoiBoE');
  const startingAmount = spreadsheet.getRange('B3').getValue();
  const numberOfYears = spreadsheet.getRange('B5').getValue();
  const annualGrowthRate = spreadsheet.getRange('B7').getValue();
  const yearsUntilWithdrawal = spreadsheet.getRange('B9').getValue();
  const percentageDrawdownInWithdrawalYear = spreadsheet.getRange('B11').getValue();

  const yearlyValues = calculateYearlyValues(startingAmount, numberOfYears, annualGrowthRate, yearsUntilWithdrawal, percentageDrawdownInWithdrawalYear);
  if(yearlyValues.length <= 0) {
    throw 'No yearly values found!';
  }
  Logger.log(yearlyValues);
  return yearlyValues;
}

function calculateYearlyValues(startingAmount, numberOfYears, annualGrowthRate, yearsUntilWithdrawal, percentageDrawdownInWithdrawalYear) {
  const initialInvestment = startingAmount;
  let yearlyValues = [];
  for(i = 0; i <= numberOfYears; i++) {
    if(i == 0) {
      yearlyValues.push({'year': i, 'value': initialInvestment, 'percentChange': 0});
    } else {
      let previousYearlyTotal = yearlyValues[i-1].value;
      const currentYearTotal = roundToTwo(previousYearlyTotal += previousYearlyTotal * annualGrowthRate);
      yearlyValues.push({'year': i, 'value': currentYearTotal, 'percentChange': annualGrowthRate});
    }
  }

  return yearlyValues;
}

function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}
