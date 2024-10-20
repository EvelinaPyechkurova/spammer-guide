document.addEventListener("DOMContentLoaded", () => {
    setupAddressButtons();
});

function notEmptyString(str) {
    return str && typeof str === "string" && str.trim() !== "";
}

function setupAddressButtons(){
    const editButtons = document.querySelectorAll(".button-edit");
    const deleteButtons = document.querySelectorAll(".button-delete");

    editButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const card = button.closest(".card");
            const form = card.querySelector(".edit-form");
            form.style.display = "block";
        });
    });

    deleteButtons.forEach((button) => {
        button.addEventListener("click", () => handleDelete(button.dataset.id));
    });

    const cancelButtons = document.querySelectorAll(".cancel-edit");
    cancelButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            const form = event.target.closest(".edit-form");
            form.style.display = "none";
        });
    });

    const editForms = document.querySelectorAll(".edit-form");
    editForms.forEach((form) => {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const id = form.closest(".card").querySelector(".address-checkbox").dataset.id;
            await handleEdit(id, form);
        });
    });
}

async function handleDelete(id){
    try{
        const url = `http://localhost:3000/addresses/${id}`;
        const responce = await fetch(url, {method: "DELETE"});
        if(!responce.ok)
            throw new Error(`Error occured while deleting address with id ${id}: ${response.statusText}`);
        console.log(`Address with id ${id} deleted successfully`);
        window.location.reload();
    }catch(error){
        console.log("Error while deleting address:", error);
    }
}

async function handleEdit(id, form){
    const email = form.querySelector("#edit-email").value;
    const name = form.querySelector("#edit-name").value;
    const fathername = form.querySelector("#edit-fathername").value;
    const surname = form.querySelector("#edit-surname").value;

    const updatedAddress = {
        email, 
        user: {name, fathername, surname}
    }

    const validationResult = invalidUpdate(updatedAddress);
    if (validationResult) {
        alert(validationResult.errors.join("\n"));
        return;
    }

    try{
        const url = `http://localhost:3000/addresses/${id}`;
        const responce = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedAddress)
        });

        if(!responce.ok)
            throw new Error(`Error occured while editing address with id ${id}: ${response.statusText}`);

        console.log(`Address with id ${id} edited successfully`);
        window.location.reload();
    }catch(error){
        console.log("Error while editing address:", error);
    }
}

document.getElementsByClassName("send-button")[0].addEventListener("click", async () => {
    const text = await getText();
    const addressList = await getAddressList();
    console.log(text);
    console.log(addressList);
    const response = await fetch("http://localhost:3000/emails/send-emails", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({text, addressList})
    })

    const result = await response.json();
    console.log(result);
});

async function getText(){
    const selectedOption = document.querySelector("input[name=text-option]:checked");

    if(!selectedOption){
        alert("Please select a text template before sending.");
        return;
    }

    let text;

    const value = selectedOption.value;
    if(value === "custom"){
        const customAreaText = document.getElementById("custom-text-area");
        const message = customAreaText.value;
        if(!notEmptyString(message)){
            alert("Please enter a valid, non-empty message.");
            return;
        }
        text = message;
    }else{
        const selectedId = value;
        text = await selectText(selectedId);
    }
    return text;
}

async function selectText(id){
    try {
        const url = `http://localhost:3000/texts/${id}`;
        const responce = await fetch(url);
        if(!responce.ok)
            throw new Error(`Failed to fetch text by id: ${response.statusText}`);
        const result = await responce.json();
        return result.text;
    } catch (error) {
        console.error("Error fetching text templates:", error)
    }
}

async function getAddressList(){
    const selectedOptions = document.querySelectorAll(".address-checkbox:checked");

    if(selectedOptions.length === 0){
        alert("Please select at least one address before sending.");
        return;
    }

    let addresses = [];

    for(const option of selectedOptions){
        const selectedId = option.dataset.id;
        const address = await selectAddress(selectedId);
        console.log(address);
        addresses.push(address);
    }

    return addresses;
}

async function selectAddress(id){
    try{
        const url = `http://localhost:3000/addresses/${id}`;
        const responce = await fetch(url);
        if(!responce.ok)
            throw new Error(`Failed to fetch address by id: ${response.statusText}`);
        const result = await responce.json();
        const {_id, ...addressWithoutId} = result;
        return addressWithoutId
    }catch(error){
        console.error("Error fetching addresses:", error)
    }
}

document.getElementById("new-address-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const name = document.getElementById("name").value;
    const fathername = document.getElementById("fathername").value;
    const surname = document.getElementById("surname").value;

    console.log(email,name,fathername.surname);

    if(!notEmptyString(email) || !notEmptyString(name) 
        || !notEmptyString(fathername) || !notEmptyString(surname)){
        alert("All fields are required!");
        return;
    }

    const url = "http://localhost:3000/addresses/";
    const newAddress = {
        email,
        user: {name, fathername, surname}
    }

    try{
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newAddress)
        });

        if(!response.ok)
            throw Error("Failed to add new address");

        const result = await response.json();
        console.log("Address added successfully:", result);

        fetchAddresses();
        event.target.reset();
    }catch(error){
        console.log("Error adding address:", error);
    }
});

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

function notEmptyString(str){
    return str && typeof str === "string" && str.trim() !== "";
}