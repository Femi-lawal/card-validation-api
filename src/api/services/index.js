import cardIssuer from './cardIssuer';
import cvv2Validator from './cvv2Validator';
import emailValidator from './emailValidator';
import expiryDateValidator from './expiryDateValidator';
import lunhValidator from './lunhValidator';
import phoneNumberValidator from './phoneNumberValidator';

class Validator {
	constructor(cardNumber, expirationDate, cvv2, email, mobile, phoneNumber) {
		this.cardNumber = cardNumber;
		this.expirationDate = expirationDate;
		this.cvv2 = cvv2;
		this.email = email;
		this.mobile = mobile;
		this.phoneNumber = phoneNumber;
	}

	get isCard() {
		return lunhValidator(this.cardNumber);
	}
	get issuer() {
		return cardIssuer(this.cardNumber);
	}
	get hasExpired() {
		return expiryDateValidator(this.expirationDate);
	}
	get validEmail() {
		return emailValidator(this.email);
	}
	get validCvv() {
		return cvv2Validator(this.cvv2, this.issuer);
	}
	get validPhoneNumber() {
		return phoneNumberValidator(this.phoneNumber);
	}
}
export default Validator;
