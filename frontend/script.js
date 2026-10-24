

const API = "http://127.0.0.1:5000";

let allSalesRecords = [];
let visibleSalesRecords = [];
let dailySalesChart = null;
let forecastChart = null;

/* 1. Helper functions */

function formatRupees(value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

function escapeSalesText(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function setStatus(message) {
    const status = document.getElementById("status");
    if (status) status.textContent = message;
}

/* 2. Main dashboard KPI cards */

async function loadDashboard() {
    try {
        const response = await fetch(`${API}/api/analytics`);

        if (!response.ok) {
            throw new Error("Analytics API failed");
        }

        const data = await response.json();

        document.getElementById("revenue").textContent =
            formatRupees(data.total_revenue);

        document.getElementById("units").textContent =
            Number(data.total_units || 0).toLocaleString("en-IN");

        document.getElementById("records").textContent =
            Number(data.total_products || 0).toLocaleString("en-IN");

        setStatus("Dashboard connected to the Flask backend.");
    } catch (error) {
        console.error("Dashboard Error:", error);
        setStatus("Could not load dashboard analytics. Check the backend.");
    }
}

/* 3. Sales records, search, sorting and date filtering */

async function loadSalesRecords() {
    const tableBody = document.getElementById("sales-table-body");
    const countLabel = document.getElementById("sales-count");
    const searchInput = document.getElementById("salesSearch");
    const sortSelect = document.getElementById("salesSort");
    const resetButton = document.getElementById("resetSalesSearch");

    try {
        const response = await fetch(`${API}/api/sales`);

        if (!response.ok) {
            throw new Error("Sales API request failed");
        }

        const result = await response.json();

        allSalesRecords = Array.isArray(result)
            ? result
            : Array.isArray(result.sales)
                ? result.sales
                : Array.isArray(result.data)
                    ? result.data
                    : [];

        function updateTable() {
            const query = searchInput.value.trim().toLowerCase();
            const sortType = sortSelect.value;

            const startDate = document.getElementById("startDate").value;
            const endDate = document.getElementById("endDate").value;
            const message = document.getElementById("dateFilterMessage");

            // Validate the selected date range.
            if (startDate && endDate && startDate > endDate) {
                message.textContent =
                    "Error: Start Date cannot be after End Date.";

                visibleSalesRecords = [];
                renderSalesRecords([]);
                updateDateSummary([]);
                return;
            }

            // Filter records by search text and date range.
            let records = allSalesRecords.filter(item => {
                const product = String(
                    item.product || item.name || ""
                ).toLowerCase();

                const category = String(
                    item.category || ""
                ).toLowerCase();

                const matchesSearch =
                    product.includes(query) ||
                    category.includes(query);

                let recordDate = "";

                if (item.date) {
                    const parsedDate = new Date(item.date);

                    if (!Number.isNaN(parsedDate.getTime())) {
                        recordDate = parsedDate.toISOString().slice(0, 10);
                    }
                }

                const matchesStart =
                    !startDate ||
                    (recordDate !== "" && recordDate >= startDate);

                const matchesEnd =
                    !endDate ||
                    (recordDate !== "" && recordDate <= endDate);

                return matchesSearch && matchesStart && matchesEnd;
            });

            // Apply sorting.
            if (sortType === "product") {
                records.sort((a, b) =>
                    String(a.product || a.name || "").localeCompare(
                        String(b.product || b.name || "")
                    )
                );
            } else if (sortType === "price-high") {
                records.sort((a, b) =>
                    Number(b.price || 0) - Number(a.price || 0)
                );
            } else if (sortType === "price-low") {
                records.sort((a, b) =>
                    Number(a.price || 0) - Number(b.price || 0)
                );
            } else if (sortType === "quantity-high") {
                records.sort((a, b) =>
                    Number(b.quantity || 0) - Number(a.quantity || 0)
                );
            } else if (sortType === "revenue-high") {
                records.sort((a, b) =>
                    Number(b.price || 0) * Number(b.quantity || 0) -
                    Number(a.price || 0) * Number(a.quantity || 0)
                );
            } else if (sortType === "date-new") {
                records.sort((a, b) =>
                    new Date(b.date || 0).getTime() -
                    new Date(a.date || 0).getTime()
                );
            }

            // Save the exact records currently displayed in the table.
            visibleSalesRecords = [...records];

            // Update summary and table.
            updateDateSummary(records);

            if (!startDate && !endDate) {
                message.textContent =
                    "No date filter applied. Showing records matching your search.";
            } else {
                message.textContent =
                    `Date filter applied: ${startDate || "Earliest"} to ${endDate || "Latest"}.`;
            }

            renderSalesRecords(records);
        }

        // Search and sorting events.
        searchInput.addEventListener("input", updateTable);
        sortSelect.addEventListener("change", updateTable);

        // Apply date filter.
        document.getElementById("applyDateFilter")
            .addEventListener("click", updateTable);

        // Clear dates but preserve search and sorting.
        document.getElementById("clearDateFilter")
            .addEventListener("click", () => {
                document.getElementById("startDate").value = "";
                document.getElementById("endDate").value = "";
                updateTable();
            });

        // Reset search, sorting and date filters.
        resetButton.addEventListener("click", () => {
            searchInput.value = "";
            sortSelect.value = "default";
            document.getElementById("startDate").value = "";
            document.getElementById("endDate").value = "";
            updateTable();
        });

        // Show all records initially.
        updateTable();

    } catch (error) {
        console.error("Sales Records Error:", error);

        tableBody.innerHTML =
            '<tr><td colspan="6">Could not load records. Check the Flask backend.</td></tr>';

        countLabel.textContent = "Unable to load records";
        visibleSalesRecords = [];
    }
}

/* 4. Filtered sales summary */

function updateDateSummary(records) {
    const revenue = records.reduce(
        (total, item) =>
            total + Number(item.price || 0) * Number(item.quantity || 0),
        0
    );

    const units = records.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );

    document.getElementById("filteredRevenue").textContent =
        formatRupees(revenue);

    document.getElementById("filteredUnits").textContent =
        units.toLocaleString("en-IN");

    document.getElementById("filteredRecords").textContent =
        records.length.toLocaleString("en-IN");
}

/* 5. Render sales table */

function renderSalesRecords(records) {
    const tableBody = document.getElementById("sales-table-body");
    const countLabel = document.getElementById("sales-count");

    countLabel.textContent =
        `Showing ${records.length} of ${allSalesRecords.length} records`;

    if (records.length === 0) {
        tableBody.innerHTML =
            '<tr><td colspan="6">No matching sales records found.</td></tr>';
        return;
    }

    tableBody.innerHTML = records.map(item => {
        const product = item.product || item.name || "Unknown";
        const category = item.category || "—";
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 0);
        const revenue = price * quantity;

        const dateValue = item.date
            ? new Date(item.date).toLocaleDateString("en-CA", {
                timeZone: "UTC"
            })
            : "—";

        return `
            <tr>
                <td>${escapeSalesText(product)}</td>
                <td>${escapeSalesText(category)}</td>
                <td>${formatRupees(price)}</td>
                <td>${quantity}</td>
                <td>${formatRupees(revenue)}</td>
                <td>${escapeSalesText(dateValue)}</td>
            </tr>
        `;
    }).join("");
}

/* 6. Category sales */

async function loadCategorySales() {
    const container = document.getElementById("category-list");

    try {
        const response = await fetch(`${API}/api/category-sales`);

        if (!response.ok) {
            throw new Error("Category API failed");
        }

        const result = await response.json();

        const categories = Array.isArray(result)
            ? result
            : result.category_sales || result.categories || result.data || [];

        if (!categories.length) {
            container.textContent = "No category data available.";
            return;
        }

        container.innerHTML = categories.map(item => `
            <div class="data-item">
                <div>
                    <strong>${escapeSalesText(item.category || "Other")}</strong>
                    <div class="subtitle">
                        ${Number(item.total_units || 0)} units
                    </div>
                </div>
                <span>${formatRupees(item.total_revenue)}</span>
            </div>
        `).join("");

    } catch (error) {
        console.error("Category Error:", error);
        container.textContent = "Could not load category data.";
    }
}

/* 7. Top products */

async function loadTopProducts() {
    const container = document.getElementById("product-list");

    try {
        const response = await fetch(`${API}/api/top-products`);

        if (!response.ok) {
            throw new Error("Top products API failed");
        }

        const result = await response.json();

        const products = Array.isArray(result)
            ? result
            : result.top_products || result.products || result.data || [];

        if (!products.length) {
            container.textContent = "No product data available.";
            return;
        }

        container.innerHTML = products.map((item, index) => `
            <div class="data-item">
                <div>
                    <strong>${index + 1}. ${escapeSalesText(item.product || item.name || "Product")}</strong>
                    <div class="subtitle">
                        ${Number(item.total_units || 0)} units sold
                    </div>
                </div>
                <span>${formatRupees(item.total_revenue)}</span>
            </div>
        `).join("");

    } catch (error) {
        console.error("Top Products Error:", error);
        container.textContent = "Could not load top products.";
    }
}

/* 8. Daily sales chart */

async function loadDailySalesChart() {
    try {
        const response = await fetch(`${API}/api/daily-sales`);

        if (!response.ok) {
            throw new Error("Daily sales API failed");
        }

        const result = await response.json();

        const rows = Array.isArray(result)
            ? result
            : result.daily_sales || result.data || [];

        const labels = rows.map(item => {
            const value = item.date;

            return value
                ? new Date(value).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    timeZone: "UTC"
                })
                : "Unknown";
        });

        const revenues = rows.map(item =>
            Number(item.total_revenue ?? item.revenue ?? 0)
        );

        const canvas = document.getElementById("dailySalesChart");

        if (dailySalesChart) {
            dailySalesChart.destroy();
        }

        dailySalesChart = new Chart(canvas, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Daily Revenue",
                    data: revenues,
                    borderColor: "#38d9a9",
                    backgroundColor: "rgba(56, 217, 169, 0.12)",
                    fill: true,
                    tension: 0.3
                }]
            },
            options: chartOptions("Daily Revenue")
        });

    } catch (error) {
        console.error("Daily Chart Error:", error);
    }
}

/* 9. Forecast chart */

async function loadForecast() {
    try {
        const response = await fetch(`${API}/api/forecast`);

        if (!response.ok) {
            throw new Error("Forecast API failed");
        }

        const result = await response.json();

        let predictions = Array.isArray(result)
            ? result
            : result.predictions || result.forecast || result.data || [];

        predictions = predictions.map(item =>
            typeof item === "number"
                ? item
                : Number(
                    item.predicted_revenue ??
                    item.prediction ??
                    item.revenue ??
                    item.value ??
                    0
                )
        );

        const canvas = document.getElementById("forecastChart");

        if (forecastChart) {
            forecastChart.destroy();
        }

        forecastChart = new Chart(canvas, {
            type: "line",
            data: {
                labels: predictions.map(
                    (_, index) => `Period ${index + 1}`
                ),
                datasets: [{
                    label: "Predicted Revenue",
                    data: predictions,
                    borderColor: "#65a7ff",
                    backgroundColor: "rgba(101, 167, 255, 0.12)",
                    fill: true,
                    tension: 0.3
                }]
            },
            options: chartOptions("Predicted Revenue")
        });

    } catch (error) {
        console.error("Forecast Error:", error);
    }
}

/* 10. Shared chart options */

function chartOptions(datasetLabel) {
    return {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
            intersect: false,
            mode: "index"
        },

        plugins: {
            legend: {
                labels: {
                    color: "#b7c7bd"
                }
            },

            tooltip: {
                callbacks: {
                    label: context =>
                        `${datasetLabel}: ${formatRupees(context.parsed.y)}`
                }
            }
        },

        scales: {
            x: {
                ticks: {
                    color: "#9aada2"
                },
                grid: {
                    color: "rgba(154, 173, 162, 0.08)"
                }
            },

            y: {
                beginAtZero: true,
                ticks: {
                    color: "#9aada2",
                    callback: value => formatRupees(value)
                },
                grid: {
                    color: "rgba(154, 173, 162, 0.08)"
                }
            }
        }
    };
}

/* 11. Day 13: Export currently filtered sales to CSV */

document.getElementById("exportCSV").addEventListener("click", () => {
    if (visibleSalesRecords.length === 0) {
        alert("No filtered sales records available to export.");
        return;
    }

    const headers = [
        "Product",
        "Category",
        "Price",
        "Quantity",
        "Revenue",
        "Date"
    ];

    const rows = visibleSalesRecords.map(item => [
        item.product || item.name || "",
        item.category || "",
        Number(item.price || 0),
        Number(item.quantity || 0),
        Number(item.price || 0) * Number(item.quantity || 0),
        item.date
            ? new Date(item.date).toISOString().slice(0, 10)
            : ""
    ]);

    // Safely format CSV cells.
    const csvCell = value =>
        `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
        .map(row => row.map(csvCell).join(","))
        .join("\r\n");

    // Create the downloadable CSV file.
    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "filtered-sales.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
});

/* 12. Sidebar active link */

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        document.querySelectorAll(".nav-link").forEach(item =>
            item.classList.remove("active")
        );

        link.classList.add("active");
    });
});

/* 13. Start dashboard */

async function initDashboard() {
    await Promise.allSettled([
        loadDashboard(),
        loadSalesRecords(),
        loadCategorySales(),
        loadTopProducts(),
        loadDailySalesChart(),
        loadForecast()
    ]);
}

initDashboard();
