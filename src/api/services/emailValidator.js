export default (email = '') => {
    // Check if input is a string
    if (typeof email !== 'string') {
        return false;
    }

    // Regular expression for basic email validation
    const expression =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    // Test the email against the regex
    return expression.test(email.toLowerCase());
};
