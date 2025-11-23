let allProducts = [];

fetch("https://dummyjson.com/products")
    .then(res => res.json())
    .then(data => {
        allProducts = data.products.slice(0, 30);
        renderTable(allProducts);
    });

function renderTable(products) {
    const table = document.querySelector("#productsTable tbody");
    table.innerHTML = "";

    products.forEach(item => {
        const row = `
            <tr>
                <td><img src="${item.thumbnail}" alt="${item.title}"></td>
                <td>${item.title}</td>
                <td>${item.description}</td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

document.getElementById("filterInput").addEventListener("input", () => {
    applyFilterSort();
});

document.getElementById("sortSelect").addEventListener("change", () => {
    applyFilterSort();
});

function applyFilterSort() {
    const filterText = document.getElementById("filterInput").value.toLowerCase();
    const sortOrder = document.getElementById("sortSelect").value;

    let filtered = allProducts.filter(p => p.title.toLowerCase().includes(filterText));

    if (sortOrder === "asc") {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOrder === "desc") {
        filtered.sort((a, b) => b.title.localeCompare(a.title));
    }

    renderTable(filtered);
}
