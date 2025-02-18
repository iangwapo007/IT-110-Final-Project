import {
backendURL,
successNotification,
errorNotification,
getLoggedUser,
} from "../utils/utils.js";

getLoggedUser();

// Get All Data
getDatas();

async function getDatas() {
const response = await fetch(backendURL + "/api/carousel", {
headers: {
Accept: "application/json",
Authorization: "Bearer " + localStorage.getItem("token"),
},
});

if (response.ok) {
const json = await response.json();

let container = "";
json.forEach((element) => {
const date = new Date(element.created_at).toLocaleString();

container += `<div class="col-sm-12">
    <div class="card w-100 mt-3" data-id="${element.carousel_item_id}">
        <div class="row">
            <div class="col-sm-4">
                <img src="${backendURL}/storage/${element.image_path}" width="100%" height="225px">
            </div>
            <div class="col-sm-8">
                <div class="card-body">
                    <div class="dropdown float-end">
                        <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button"
                            data-bs-toggle="dropdown" aria-expanded="false"></button>
                        <ul class="dropdown-menu">
                            <li>
                                <a class="dropdown-item" href="#" id="btn_edit"
                                    data-id="${element.carousel_item_id}">Edit</a>
                            </li>
                            <li>
                                <a class="dropdown-item" href="#" id="btn_delete"
                                    data-id="${element.carousel_item_id}">Delete</a>
                            </li>
                        </ul>
                    </div>
                    <h5 class="card-title">${element.carousel_name}</h5>
                    <h6 class="card-subtitle mb-2 text-body-secondary">
                        <small>${date}</small>
                    </h6>
                    <p class="card-text">${element.description}</p>
                </div>
            </div>
        </div>
    </div>
</div>`;
});
document.getElementById("get_data").innerHTML = container;

document.querySelectorAll("#btn_edit").forEach((element) => {
element.addEventListener("click", editAction);
});

document.querySelectorAll("#btn_delete").forEach((element) => {
element.addEventListener("click", deleteAction);
});
} else {
errorNotification("HTTP-Error: " + response.status);
alert("HTTP-Error: " + response.status);
}
}

const form_slides = document.getElementById("form_slides");

// Global variable to store the ID of the item being updated
let for_update_id = "";

form_slides.onsubmit = async (e) => {
e.preventDefault();

document.querySelector("#form_slides button[type='submit']").disabled = true;
document.querySelector("#form_slides button[type='submit']").innerHTML = `<div class="spinner-border me-2"
    role="status"></div><span>Loading...</span>`;

const formData = new FormData(form_slides);
let response;

if (for_update_id == "") {
response = await fetch(backendURL + "/api/carousel", {
method: "POST",
headers: {
Accept: "application/json",
Authorization: "Bearer " + localStorage.getItem("token"),
},
body: formData,
});
} else {
formData.append("_method", "PUT");
response = await fetch(backendURL + "/api/carousel/" + for_update_id, {
method: "POST",
headers: {
Accept: "application/json",
Authorization: "Bearer " + localStorage.getItem("token"),
},
body: formData,
});
}

if (response.ok) {
const json = await response.json();
console.log(json);

form_slides.reset();
for_update_id = "";

successNotification("Successfully " + (for_update_id == "" ? "created" : "updated") + " slide.", 10);
document.getElementById("modal_close").click();
getDatas();
} else if (response.status == 422) {
const json = await response.json();
document.getElementById("modal_close").click();
errorNotification(json.message, 10);
}

document.querySelector("#form_slides button[type='submit']").disabled = false;
document.querySelector("#form_slides button[type='submit']").innerHTML = "Submit";
};

const deleteAction = async (e) => {
if (confirm("Are you sure you want to delete?")) {
const id = e.target.getAttribute("data-id");

document.querySelector(`.card[data-id="${id}"]`).style.backgroundColor = "red";

const response = await fetch(backendURL + "/api/carousel/" + id, {
method: "DELETE",
headers: {
Accept: "application/json",
Authorization: "Bearer " + localStorage.getItem("token"),
},
});

if (response.ok) {
successNotification("Successfully deleted slide");
document.querySelector(`.card[data-id="${id}"]`).remove();
} else {
errorNotification("Unable to delete!");
document.querySelector(`.card[data-id="${id}"]`).style.backgroundColor = "white";
}
}
};

const editAction = async (e) => {
const id = e.target.getAttribute("data-id");
showData(id);
document.getElementById("modal_show").click();
};

const showData = async (id) => {
document.querySelector(`.card[data-id="${id}"]`).style.backgroundColor = "yellow";

const response = await fetch(backendURL + "/api/carousel/" + id, {
headers: {
Accept: "application/json",
Authorization: "Bearer " + localStorage.getItem("token"),
},
});

if (response.ok) {
const json = await response.json();
console.log(json);

for_update_id = json.carousel_item_id; // Assign to global variable
document.getElementById("carousel_name").value = json.carousel_name;
document.getElementById("description").value = json.description;

document.querySelector("#form_slides button[type='submit']").textContent = "Update Info";
} else {
errorNotification("Unable to show!", 10);
}
};