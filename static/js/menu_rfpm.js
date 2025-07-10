function selectMenuItem(label) {
    const button = document.getElementById('menuButton');
    button.innerHTML = `<i class="fas fa-bars"></i> ${label}`;
    document.getElementById('menuValue').value = label;
    console.log("Selected Menu Item:", label);
}
