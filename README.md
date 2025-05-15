# Pearson Key Dates Calendar

A web-based calendar application that displays key dates for Pearson qualifications. The calendar connects to a Google Sheet and parses data to display events in an interactive calendar interface.

## Features

- Interactive monthly calendar view
- Filter events by qualification type (UK General, Vocational, International)
- Subscribe to calendar feeds for each qualification type
- View detailed event information
- Google Analytics integration for tracking user interactions

## Technologies Used

- HTML5
- CSS3 with Tailwind CSS
- JavaScript (Vanilla)
- Google Sheets API for data
- Google Analytics for usage tracking

## Setup

1. Clone the repository
2. Open `index.html` in a web browser
3. The calendar will automatically fetch events from the connected Google Sheet

## Calendar Data

The calendar fetches data from a Google Sheet using the Apps Script API. The data includes:
- Event title
- Event date
- Event description
- Qualification type
- Series information (if applicable)
- URL for more information (if applicable) 