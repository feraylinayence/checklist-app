// Import the functions from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js";
import { getDatabase, ref, push, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
// Add SDKs for Firebase products to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const analytics = getAnalytics(app);

export function addItem(item) {
    const trimmedItem = item.trim();

    if (trimmedItem) {
        const newItemRef = push(ref(database, 'checklist'));
        set(newItemRef, { 
            text: trimmedItem, 
            number: '..',
            completedLina: false,
            completedRana: false
        });
        document.getElementById('itemInput').value = '';
    } else {
        console.log("Can not add an item with empty text");
    }
}

export function displayItems() {
    const checklistContainer = document.getElementById('checklistContainer');
    onValue(ref(database, 'checklist'), (snapshot) => {
        const items = snapshot.val();
        checklistContainer.innerHTML = '';
        if (items) {
            Object.keys(items).forEach(key => {
                const item = items[key];

                const row = document.createElement('tr');

                const textCell = document.createElement('td');
                const numberCell = document.createElement('td');
                const linaCell = document.createElement('td');
                const ranaCell = document.createElement('td');
                const actionsCell = document.createElement('td');
                
                const textElement = document.createElement('span');
                textElement.textContent = item.text;
                textElement.style.cursor = 'pointer';
                textElement.addEventListener('click', () => {
                    const textInput = document.createElement('input');
                    textInput.type = 'text';
                    textInput.value = item.text;
                    const saveButton = document.createElement('button');
                    saveButton.textContent = 'Tamamdır';

                    saveButton.addEventListener('click', () => {
                        const newText = textInput.value;
                        if (newText) {
                            updateItem(key, newText, item.number, item.completedLina, item.completedRana);
                        }
                        displayItems();
                    });

                    textCell.innerHTML = '';
                    textCell.appendChild(textInput);
                    textCell.appendChild(saveButton);
                });
                textCell.appendChild(textElement);

                const numberElement = document.createElement('span');
                if (item.number !== '..' && item.number > 1) {
                    numberElement.textContent = item.number;
                } else {
                    numberElement.textContent = '..';
                }
                numberElement.style.cursor = 'pointer';
                numberElement.addEventListener('click', () => {
                    const numberInput = document.createElement('input');
                    numberInput.type = 'number';
                    numberInput.value = item.number !== '..' ? item.number : '..';
                    const saveButton = document.createElement('button');
                    saveButton.textContent = 'Yeterli';

                    saveButton.addEventListener('click', () => {
                        const newNumber = numberInput.value;
                        if (newNumber !== '') {
                            updateItem(key, item.text, parseInt(newNumber), item.completedLina, item.completedRana);
                        } else {
                            updateItem(key, item.text, '..', item.completedLina, item.completedRana);
                        }
                        displayItems();
                    });

                    numberCell.innerHTML = '';
                    numberCell.appendChild(numberInput);
                    numberCell.appendChild(saveButton);
                });
                numberCell.appendChild(numberElement);

                const linaCheckBox = document.createElement('input');
                linaCheckBox.type = 'checkbox';
                linaCheckBox.checked = item.completedLina;
                linaCheckBox.addEventListener('change', () => {
                    updateItem(key, item.text, item.number, linaCheckBox.checked, item.completedRana);
                    calculateFilledPercentage();
                });
                linaCell.appendChild(linaCheckBox);

                const ranaCheckBox = document.createElement('input');
                ranaCheckBox.type = 'checkbox';
                ranaCheckBox.checked = item.completedRana;
                ranaCheckBox.addEventListener('change', () => {
                    updateItem(key, item.text, item.number, item.completedLina, ranaCheckBox.checked);
                    calculateFilledPercentage();
                });
                ranaCell.appendChild(ranaCheckBox);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Buna gerek yok';
                deleteButton.addEventListener('click', () => {
                    deleteItem(key);
                    calculateFilledPercentage();
                });
                actionsCell.appendChild(deleteButton);

                row.appendChild(textCell);
                row.appendChild(numberCell);
                row.appendChild(linaCell);
                row.appendChild(ranaCell);
                row.appendChild(actionsCell);
                checklistContainer.appendChild(row);
            })
        }
    })
}

function deleteItem(itemId) {
    const itemRef = ref(database, 'checklist/' + itemId);
    remove(itemRef);
}

function updateItem(itemId, newText, newNumber, completedLina, completedRana) {
    const itemRef = ref(database, 'checklist/' + itemId);
    update(itemRef, { 
        text: newText,
        number: newNumber,
        completedLina: completedLina,
        completedRana: completedRana
    });
}

function updateSuitcaseFill(filledPercentage, suitcaseFill) {
    const fillElement = document.getElementById(suitcaseFill);
    fillElement.style.height = filledPercentage + '%';
}

export function calculateFilledPercentage() {
    let totalItems = 0;
    let checkedItemsLina = 0;
    let checkedItemsRana = 0;

    const checklistRef = ref(database, 'checklist');
    onValue(checklistRef, (snapshot) => {
        const items = snapshot.val();
        if (items) {
            Object.keys(items).forEach(key => {
                totalItems += 1;

                if (items[key].completedLina) {
                    checkedItemsLina += 1;
                }

                if (items[key].completedRana) {
                    checkedItemsRana += 1;
                }
            });

            let filledPercentageLina = totalItems > 0 ? (checkedItemsLina / totalItems) * 100 : 0;
            let filledPercentageRana = totalItems > 0 ? (checkedItemsRana / totalItems) * 100 : 0;

            updateSuitcaseFill(filledPercentageLina, 'linaSuitcaseFill');
            updateSuitcaseFill(filledPercentageRana, 'ranaSuitcaseFill');
        }
    })
}
