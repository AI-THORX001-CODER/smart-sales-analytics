# 📊 Smart Sales Analytics & Prediction

A full-stack sales analytics dashboard built using **Python, Flask, MongoDB, HTML, CSS, and JavaScript**. It helps users analyze sales performance, track revenue, identify top-selling products, and visualize business insights through an interactive dashboard.

## 🚀 Project Overview

Smart Sales Analytics & Prediction is designed to transform sales records into meaningful business insights. The dashboard provides KPI cards, interactive charts, product and category analysis, date filters, search, sorting, and CSV export functionality.

## ✨ Features

- 📈 **Sales Analytics Dashboard** — Visualize important sales metrics.
- 💰 **Revenue Tracking** — Monitor total sales revenue.
- 📦 **Sales Quantity Analysis** — Track units sold and sales records.
- 🏷️ **Category Analysis** — Compare sales performance across categories.
- 🏆 **Top Products** — Identify products with strong sales performance.
- 📅 **Date Filters** — Analyze sales for selected date ranges.
- 🔍 **Search and Sorting** — Find and organize sales data.
- 📥 **CSV Export** — Export data for further analysis.
- 🔌 **Flask REST API** — Fetch sales data and analytics from the backend.
- 🍃 **MongoDB Integration** — Store and retrieve sales records.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| Flask | REST API development |
| MongoDB | Database |
| PyMongo | Python–MongoDB connection |
| HTML | Dashboard structure |
| CSS | Styling and responsive layout |
| JavaScript | Dashboard interactivity and API integration |
| Chart.js (if used in your code) | Data visualization |

## 📁 Project Structure

```text
smart-sales-analytics/
│
├── app.py
├── .gitignore
├── README.md
│
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js
```

## ⚙️ Requirements

- Python 3
- MongoDB Community Server
- Git
- A modern web browser

## 💻 Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/AI-THORX001-CODER/smart-sales-analytics.git
cd smart-sales-analytics
```

### 2. Create a virtual environment

**Windows PowerShell:**

```powershell
python -m venv backend/venv
```

### 3. Activate the environment

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\backend\venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```powershell
pip install Flask Flask-Cors pymongo scikit-learn
```

### 5. Start MongoDB

Ensure your MongoDB server is running locally.

The application should connect to the configured MongoDB database. Check `app.py` for the database name and connection URI.

### 6. Run the Flask application

```powershell
python app.py
```

Open the local application URL shown in the terminal, usually:

http://127.0.0.1:5000

If the frontend is served separately, open `frontend/index.html` using your preferred local development server.

## 🔗 API Endpoints

The backend includes endpoints for sales data and analytics.

| Endpoint | Purpose |
|---|---|
| `/api/health` | Check backend status |
| `/api/sales` | Retrieve sales records |
| `/api/analytics` | Retrieve overall analytics |
| `/api/category-sales` | Analyze sales by category |
| `/api/top-products` | Retrieve top products |
| `/api/daily-sales` | Retrieve daily sales data |
| `/api/forecast` | Retrieve forecast data |

Start the Flask server before testing these endpoints.

## 📊 Dashboard Insights

The dashboard is designed to help users:

- Understand overall sales performance.
- Compare product categories.
- Identify top-performing products.
- Review daily sales trends.
- Filter and export sales records.

**Note:** Forecast results should be treated as demo or sample output unless the forecasting model has been trained and evaluated on suitable data.

## 🎯 Learning Outcomes

Through this project, I practiced:

- Building REST APIs using Flask.
- Connecting Python applications to MongoDB.
- Fetching API data with JavaScript.
- Creating an interactive analytics dashboard.
- Using Git and GitHub for version control.
- Organizing a full-stack project.

## 🔮 Future Improvements

- User authentication and role-based access.
- Improved responsive design for mobile devices.
- Advanced forecasting with model evaluation.
- Live database-driven analytics.
- Deployment to a cloud hosting platform.
- Additional reports and downloadable visualizations.

## 👨‍💻 Author

ABHIJEET RAJAWAT
BTECH(IT) 
2ND YEAR

GitHub: https://github.com/AI-THORX001-CODER

## 📄 License

This project is available for educational and portfolio purposes. Add a formal open-source license if you want to specify reuse and distribution permissions.
