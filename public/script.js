document.addEventListener("DOMContentLoaded", () => {
    fetchTexts();
    fetchAddresses();
});

function notEmptyString(str) {
    return str && typeof str === "string" && str.trim() !== "";
}

async function fetchTexts() {
    try {
        const url = "http://localhost:3000/texts/";
        const response = await fetch(url);
        if (!response.ok) 
            throw new Error(`Failed to fetch texts: ${response.statusText}`);
        const texts = await response.json();
        renderTexts(texts);
    } catch (error) {
        console.error("Error fetching texts:", error);
    }
}

async function fetchAddresses(){
    try{
        const url = "http://localhost:3000/addresses/";
        const responce = await fetch(url);
        if(!responce.ok)
            throw new Error(`Failed to fetch addresses: ${responce.statusText}`);
        const addresses = await responce.json();
        renderAddresses(addresses);
    } catch (error) {
        console.error("Error fetching addresses:", error);
    }
}

function renderAddresses(addresses){
    const addressList = document.getElementsByClassName("address-list")[0];
    addressList.innerHTML = "";

    addresses.forEach((address) => {
        const card = document.createElement("div");
        card.innerHTML = 
        `<div class="card shadow-sm">
            <label class="card-body">
               <h5 class="card-title">${address.user.surname} ${address.user.name}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${address.user.fathername}</h6>
                <p class="card-text">${address.email}</p>
                <input type="checkbox" class="form-check-input address-checkbox" 
                    data-id="${address._id}">
                <div class="d-flex justify-content-between">
                    <button class="btn btn-sm btn-warning button-edit" data-id="${address._id}">Edit</button>
                    <button class="btn btn-sm btn-danger button-delete" data-id="${address._id}">Delete</button>
                </div>

                <form class="edit-form mt-3" style="display:none;">
                    <input type="email" class="form-control mb-2" id="edit-email" value=${address.email} placeholder="Email">
                    <input type="text" class="form-control mb-2" id="edit-name" value=${address.user.name} placeholder="Name">
                    <input type="text" class="form-control mb-2" id="edit-fathername" value=${address.user.fathername} placeholder="Fathername">
                    <input type="text" class="form-control mb-2" id="edit-surname" value=${address.user.surname} placeholder="Surname">
                    <button type="submit" class="btn btn-primary btn-small">Save</button>
                    <button type="button" class="btn btn-secondary btn-small cancel-edit">Cancel</button>
                </form>  
            </label>
        </div>`
        addressList.appendChild(card);
    });

    setupAddressButtons();
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

function renderTexts(texts){
    const list = document.getElementById("text-list");
    // list.innerHTML = "";

    let i = 1;
    texts.forEach(text => {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item d-flex align-items-center";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "text-option";
        radio.value = text._id;
        radio.id = `option${i++}`;

        const label = document.createElement("label");
        label.textContent = `${text.text}`;
        label.className = "ms-2";
        label.setAttribute("for", radio.id);

        listItem.appendChild(radio);
        listItem.appendChild(label);
        list.appendChild(listItem);
    });

    const customTextRadio = document.getElementById("option0");
    const customTextArea = document.getElementById("custom-text-area");

    customTextRadio.addEventListener("change", () => {
        customTextArea.disabled = !customTextRadio.checked;
    });
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