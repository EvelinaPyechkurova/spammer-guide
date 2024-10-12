function notEmptyString(str){
    return str && typeof str === "string" && str.trim() !== "";
}

function invalidAddress(address) {
    if (!address || typeof address !== "object" || Object.keys(address).length !== 2) 
        return { "Invalid data": "address object is missing or contains an illegal number of fields" };
   
    const { email, user } = address;

    if (!user || typeof user !== "object" || Object.keys(user).length !== 3)
        return { "Invalid data": "user object is missing or contains an illegal number of fields" };

    const { name, fathername, surname } = user;

    if (!notEmptyString(name))
        return { "Invalid data": "name is missing or empty" };

    if (!notEmptyString(fathername)) 
        return { "Invalid data": "fathername is missing or empty" };

    if (!notEmptyString(surname)) 
        return { "Invalid data": "surname is missing or empty" };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailPattern.test(email)) 
        return { "Invalid data": "email is missing or incorrect" };

    return null;
}

function invalidUpdate(update) {
    const allowedFields = ["email", "user.name", "user.fathername", "user.surname"];

    const errors = [];

    const { email, user } = update;

    const fields = Object.keys(update);

    const filteredFields = fields.filter(field => field !== "user");

    const userFields = user ? Object.keys(user).map(key => `user.${key}`) : [];

    const allFields = [...filteredFields, ...userFields];

    const invalidFields = allFields.filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) 
        errors.push(`Invalid fields in the update: ${invalidFields.join(', ')}`);

    if (email !== undefined) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!notEmptyString(email) || !emailPattern.test(email)) 
            errors.push("Invalid email format");
    }

    if (user) {
        if (user.name !== undefined && !notEmptyString(user.name)) 
            errors.push("Invalid name: must be a non-empty string");

        if (user.fathername !== undefined && !notEmptyString(user.fathername)) 
            errors.push("Invalid fathername: must be a non-empty string");

        if (user.surname !== undefined && !notEmptyString(user.surname)) 
            errors.push("Invalid surname: must be a non-empty string");
    }

    return errors.length > 0 ? { errors } : null;
}

module.exports = {
    notEmptyString,
    invalidAddress,
    invalidUpdate
}