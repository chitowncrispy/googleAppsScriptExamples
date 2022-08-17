function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate().setTitle('Financial Model');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
}

function runFinancialModel() {
  const spreadsheet = SpreadsheetApp.openById('16hsJzYOt5WATCEVknwSWT_KWZedSJ63FTxrjHMfR-lI');
  const clientName = spreadsheet.getRange('C4').getValue();
  const startingAmount = spreadsheet.getRange('C6').getValue();
  const numberOfYears = spreadsheet.getRange('C8').getValue();
  const annualGrowthRateStockMarketAccount = spreadsheet.getRange('C10').getValue();
  const annualGrowthRateSafeMoneyOption = spreadsheet.getRange('C12').getValue();
  const marketCrash1Year = spreadsheet.getRange('C14').getValue();
  const percentageDrawdownMarketCrash1 = spreadsheet.getRange('C16').getValue();
  const marketCrash2Year = spreadsheet.getRange('C18').getValue();
  const percentageDrawdownMarketCrash2 = spreadsheet.getRange('C20').getValue();

  const yearlyValuesStockMarketAccount = calculateYearlyValuesStockMarketAccount(startingAmount, numberOfYears, annualGrowthRateStockMarketAccount, marketCrash1Year, percentageDrawdownMarketCrash1, marketCrash2Year, percentageDrawdownMarketCrash2);
  const yearlyValuesSafeMoneyOption = calculateYearlyValuesSafeMoneyOption(startingAmount, numberOfYears, annualGrowthRateSafeMoneyOption, marketCrash1Year, marketCrash2Year);
  if (yearlyValuesStockMarketAccount.length <= 0) {
    throw 'No yearly values crash product found!';
  }
  if (yearlyValuesSafeMoneyOption.length <= 0) {
    throw 'No yearly values competing product found!';
  }

  Logger.log(yearlyValuesStockMarketAccount);
  Logger.log(yearlyValuesSafeMoneyOption);

  return { 'yearlyValuesStockMarketAccount': yearlyValuesStockMarketAccount, 'yearlyValuesSafeMoneyOption': yearlyValuesSafeMoneyOption, 'crashYears': [marketCrash1Year, marketCrash2Year], 'clientName': clientName };
}

function calculateYearlyValuesStockMarketAccount(startingAmount, numberOfYears, annualGrowthRateStockMarketAccount, marketCrash1Year, percentageDrawdownMarketCrash1, marketCrash2Year, percentageDrawdownMarketCrash2) {
  const initialInvestment = startingAmount;
  let yearlyValues = [];

  for (let i = 0; i <= numberOfYears; i++) {
    if (i == 0) {
      yearlyValues.push({ 'year': i, 'value': initialInvestment, 'percentChange': 0 });
    } else {
      let calculatedGrowthRate = annualGrowthRateStockMarketAccount;
      if (i == marketCrash1Year) {
        calculatedGrowthRate = -percentageDrawdownMarketCrash1;
      }
      if (i == marketCrash2Year) {
        calculatedGrowthRate = -percentageDrawdownMarketCrash2
      }

      let previousYearlyTotal = yearlyValues[i - 1].value;
      const currentYearTotal = Math.round(previousYearlyTotal += previousYearlyTotal * calculatedGrowthRate);
      yearlyValues.push({ 'year': i, 'value': currentYearTotal, 'percentChange': calculatedGrowthRate });
    }
  }

  return yearlyValues;
}

function calculateYearlyValuesSafeMoneyOption(startingAmount, numberOfYears, annualGrowthRate, marketCrash1Year, marketCrash2Year) {
  const initialInvestment = startingAmount;
  let yearlyValues = [];

  for (let i = 0; i <= numberOfYears; i++) {
    if (i == 0) {
      yearlyValues.push({ 'year': i, 'value': initialInvestment, 'percentChange': 0 });
    } else {
      let calculatedGrowthRate = annualGrowthRate;
      if (i == marketCrash1Year || i == marketCrash2Year) {
        calculatedGrowthRate = 0;
      }

      let previousYearlyTotal = yearlyValues[i - 1].value;
      const currentYearTotal = Math.round(previousYearlyTotal += previousYearlyTotal * calculatedGrowthRate);
      yearlyValues.push({ 'year': i, 'value': currentYearTotal, 'percentChange': calculatedGrowthRate });
    }
  }

  return yearlyValues;
}

function loadImageBytes() {
  var id = "15oRZdr3SjU9c2itkrBQqobjIPoKfovQl";
  var bytes = DriveApp.getFileById(id).getBlob().getBytes();
  return Utilities.base64Encode(bytes);
}
