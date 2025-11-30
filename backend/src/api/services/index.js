module.exports = {
  ...require('./cardIssuer'),
  ...require('./lunhValidator'),
  ...require('./emailValidator'),
  ...require('./cvv2Validator'),
  ...require('./expiryDateValidator'),
  ...require('./phoneNumberValidator'),
  ...require('./fraudDetection'),
};
