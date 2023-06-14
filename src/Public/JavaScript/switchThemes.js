var selectElement = document.getElementById("switch-options");
var activeSheet = document.getElementById("active-stylesheet");
var clearStorageButton = document.getElementById("clear-storage");

// Test to see if localStorage already has a value stored
if (localStorage.getItem("lastActiveSheet")) {
    activeSheet.setAttribute("href", localStorage.getItem("lastActiveSheet"));
}

// Assign the event listener to the select element
selectElement.addEventListener("change", switchStyle);

// Set the #active-stylesheet to be the light or dark stylesheet based on the selected option
function switchStyle() {
    var selectedOption = selectElement.options[selectElement.selectedIndex];
    var selectedSheet = selectedOption.getAttribute("data-stylesheet");
    activeSheet.setAttribute("href", selectedSheet);
    localStorage.setItem("lastActiveSheet", selectedSheet);
}

clearStorageButton.addEventListener("click", clearStorage);
function clearStorage() {
    localStorage.clear();
}

// Get the select element
const dropdown = document.getElementById("switch-options");

// Add an even listener to save the selected option
dropdown.addEventListener('change', function() {
    // Get the selected value
    const selectedOption = dropdown.value;

    // Save the selected value in localStorage
    localStorage.setItem('selectedOption', selectedOption);
});

// Check if a value is already stored in localStorage
const savedOption = localStorage.getItem('selectedOption');

// Set the dropdown value to the saved value, it it exists
if (savedOption) {
    dropdown.value = savedOption;
}