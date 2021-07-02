# CARD VALIDATION API

This is a NodeJS API for validating cards.

## Requirements

* NodeJS 14.15.1 or higher
* Yarn
* Copy the contents of env.example into a .env file
* Ensure the token and client headers are contained in the request

## To Run 

```
$ cp .env.example .env
$ yarn install
$ yarn run dev
```
### Documentation
- [Postman Documentation](https://documenter.getpostman.com/view/7968287/Tzm2Le6L)

### Request
```json
{
    "creditCardNumber": "5500 0000 0000 0004",
    "expirationDate": "08/23",
    "cvv2": "123",
    "email": "femilawal76@gmail.com",
    "mobile": "07015234553",
    "phoneNumber": "+2347015234553"
}
```
### Response
```json
{
    "valid": true,
    "errorCodes": [],
    "issuer": "mastercard"
}
```