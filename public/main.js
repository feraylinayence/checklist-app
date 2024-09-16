import { addItem, displayItems, calculateFilledPercentage } from "./app.js";

document.getElementById('addItemButton').addEventListener('click', () => {
    const item = document.getElementById('itemInput').value;
    addItem(item);
});

displayItems();

calculateFilledPercentage();