// Global variables
let currentDate = new Date();
let events = [];
let filteredEvents = [];

// Google Analytics event tracking helper
function trackEvent(eventName, eventParams = {}) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, eventParams);
    }
}

// Qualification groupings
const qualificationGroups = {
    general: [
        'A-Level',
        'AS-Level',
        'GCSE',
        'Advanced Extension Award',
        'UK General Qualifications',
    ],
    vocational: [
        'BTEC',
        'BTEC Tech Award',
        'BTEC National',
        'BTEC Higher National',
        'T-Level',
        'NVQ',
        'Higher National Certificate',
        'Vocational Qualifications'
    ],
    international: [
        'International Qualifications',
        'International A-Level',
        'International AS-Level',
        'International GCSE',
        'iPrimary',
        'iLowerSecondary',
        'PTE Academic',
        'BTEC International',
        'International BTEC Level 2'
    ]
};

// Helper function to determine qualification group
function getQualificationGroup(qualType) {
    if (qualificationGroups.general.includes(qualType)) return 'general';
    if (qualificationGroups.vocational.includes(qualType)) return 'vocational';
    if (qualificationGroups.international.includes(qualType)) return 'international';
    return 'other';
}

// function to initialize calendar buttons

function initializeButtons() {
    const prevButton = document.querySelector('.calendar-button.prev');
    const nextButton = document.querySelector('.calendar-button.next');
    
    if (prevButton) {
        prevButton.addEventListener('click', previousMonth);
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', nextMonth);
    }
}

// Calendar subscription initialization
function initializeCalendarSubscriptions() {
    const subscribeButtons = document.querySelectorAll('.subscribe-btn');
    const copyButtons = document.querySelectorAll('.copy-btn');
    const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
    const subscriptionOptions = document.querySelectorAll('.subscription-option');

    // Handle subscribe buttons
    subscribeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            const webcalUrl = url.replace('https://', 'webcal://');
            const calendarType = this.closest('.subscription-option').getAttribute('data-calendar-type');
            
            // Track subscription event
            trackEvent('calendar_subscription', {
                'calendar_type': calendarType,
                'action': 'subscribe'
            });
            
            window.location.href = webcalUrl;
        });
    });

    // Handle copy buttons
    copyButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const url = this.getAttribute('data-url');
            const span = this.querySelector('span');
            const originalText = span.textContent;
            const calendarType = this.closest('.subscription-option').getAttribute('data-calendar-type');

            try {
                // Try modern clipboard API first
                await navigator.clipboard.writeText(url).catch(err => {
                    // If clipboard API fails, fallback to older method
                    const textArea = document.createElement('textarea');
                    textArea.value = url;
                    textArea.style.position = 'fixed';  // Avoid scrolling to bottom
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();

                    try {
                        document.execCommand('copy');
                        textArea.remove();
                    } catch (err) {
                        console.error('Fallback copy failed:', err);
                        throw err;
                    }
                });

                // If we get here, the copy succeeded
                span.textContent = 'Copied!';
                button.classList.add('bg-gray-50');
                
                // Track copy success event
                trackEvent('calendar_subscription', {
                    'calendar_type': calendarType,
                    'action': 'copy_url',
                    'status': 'success'
                });
                
                // Reset button text after 2 seconds
                setTimeout(() => {
                    span.textContent = originalText;
                    button.classList.remove('bg-gray-50');
                }, 2000);
            } catch (err) {
                console.error('Copy failed:', err);
                span.textContent = 'Failed to copy';
                
                // Track copy failure event
                trackEvent('calendar_subscription', {
                    'calendar_type': calendarType,
                    'action': 'copy_url',
                    'status': 'failed'
                });
                
                // Reset button text after 2 seconds
                setTimeout(() => {
                    span.textContent = originalText;
                }, 2000);
            }
        });
    });

    // Update visibility based on filter checkboxes
    filterCheckboxes.forEach(checkbox => {
        // Initial state
        const calendarType = checkbox.value;
        subscriptionOptions.forEach(option => {
            if (option.getAttribute('data-calendar-type') === calendarType) {
                option.style.display = checkbox.checked ? 'block' : 'none';
            }
        });

        // Handle changes
        checkbox.addEventListener('change', () => {
            const calendarType = checkbox.value;
            subscriptionOptions.forEach(option => {
                if (option.getAttribute('data-calendar-type') === calendarType) {
                    option.style.display = checkbox.checked ? 'block' : 'none';
                }
            });
        });
    });
}
// Initialize modal
function initializeModal() {
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }
}

// Fetch events from API
async function fetchEvents() {
    const startTime = performance.now();
    try {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('error').style.display = 'none';
        
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        
        events = await response.json();
        events = events.map(event => ({
            ...event,
            date: new Date(event.date)
        }));

        filteredEvents = [...events];
        const currentMonthEvents = filteredEvents.filter(event => 
            event.date.getMonth() === currentDate.getMonth() &&
            event.date.getFullYear() === currentDate.getFullYear()
        );
                
        updateCalendar();
        
        document.getElementById('loading').style.display = 'none';
        
        // Track successful data load
        const loadTime = Math.round(performance.now() - startTime);
        trackEvent('data_loaded', {
            'event_count': events.length,
            'load_time_ms': loadTime,
            'month': currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').textContent = 'Error loading events. Please try again later.';
        
        // Track error in data loading
        const loadTime = Math.round(performance.now() - startTime);
        trackEvent('data_load_error', {
            'error_message': error.message,
            'load_time_ms': loadTime
        });
    }
}

// Update filters based on checkbox selection
function updateFilters() {
    const selectedTypes = Array.from(document.querySelectorAll('.filter-checkbox:checked'))
        .map(checkbox => checkbox.value);
    
    filteredEvents = events.filter(event => {
        const qualGroup = getQualificationGroup(event.type);
        return selectedTypes.includes(qualGroup);
    });
    
    updateCalendar();
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value) {
        handleSearch();
    }
    
    // Track filter changes
    trackEvent('filter_change', {
        'filters_selected': selectedTypes.join(','),
        'filter_count': selectedTypes.length
    });
}

// Handle search functionality
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const currentFiltered = [...filteredEvents];
    
    const searchResults = searchTerm ? currentFiltered.filter(event =>
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm)
    ) : currentFiltered;
    
    document.getElementById('searchCount').textContent = 
        searchTerm ? `Found ${searchResults.length} matching events` : '';
    
    renderCalendar(currentDate, searchResults);
}

// Navigation functions
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
    trackEvent('calendar_navigation', {
        'action': 'previous_month',
        'month_year': currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
    trackEvent('calendar_navigation', {
        'action': 'next_month',
        'month_year': currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });
}

// Update calendar display
function updateCalendar() {
    renderCalendar(currentDate, filteredEvents);
}

// Render calendar grid
function renderCalendar(date, events) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const today = new Date();

    
    document.getElementById('currentMonth').textContent = 
        date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
     // Add empty cells for days before first of month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyCell);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        
        const currentDay = new Date(date.getFullYear(), date.getMonth(), day);
        const dayEvents = events.filter(event => 
            event.date.toDateString() === currentDay.toDateString()
        );
        
        // Check if this is today's date
        if (currentDay.toDateString() === today.toDateString()) { 
            cell.classList.add('today');
        }
        
        if (dayEvents.length > 0) {
            cell.classList.add('has-events');
        }
        
        // Add day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);
        
        // Add event indicators
        if (dayEvents.length > 0) {
            const eventContainer = document.createElement('div');
            eventContainer.className = 'event-indicators';
            
            dayEvents.forEach(event => {
                const indicator = document.createElement('div');
                const qualGroup = getQualificationGroup(event.type);
                indicator.className = `event-indicator ${qualGroup}`;
                eventContainer.appendChild(indicator);
            });
            
            cell.appendChild(eventContainer);
            cell.onclick = () => showEventsForDay(currentDay, dayEvents);
        }
        
        calendarGrid.appendChild(cell);
    }
}

  // Add close button with new styling
    const closeButton = document.createElement('button');
    closeButton.className = 'nav-button close-button';
    closeButton.innerHTML = 'Close';
    closeButton.onclick = closeModal;


// Modal functions
function showEventsForDay(date, dayEvents) {
    const modal = document.getElementById('eventModal');
    const modalDate = document.getElementById('modalDate');
    const modalEvents = document.getElementById('modalEvents');
    
    modalDate.textContent = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    modalEvents.innerHTML = '';
    dayEvents.forEach(event => {
        const qualGroup = getQualificationGroup(event.type);
        const eventElement = document.createElement('div');
        eventElement.className = `event-item ${qualGroup}`;
        eventElement.setAttribute('data-type', event.type);
        
        // Create the description text with series information
        const seriesText = event.series ? `Exam series - ${event.series}` : '';
        const descriptionWithSeries = seriesText
            ? `${seriesText}<br><br>${event.description}`
            : event.description;
        
        eventElement.innerHTML = `
            <h4 class="font-semibold">${event.title}</h4>
            <p class="text-sm">${descriptionWithSeries}</p>
            ${event.url ? `<a href="${event.url}" target="_blank" class="text-blue-600 hover:underline text-sm" onclick="trackEvent('event_link_click', {'event_title': '${event.title.replace(/'/g, "\\'")}', 'qualification_type': '${event.type.replace(/'/g, "\\'")}' })">More Info</a>` : ''}
        `;
        modalEvents.appendChild(eventElement);
    });
    
    // Clear any existing close button and add the new one
    const existingCloseButton = modal.querySelector('.close-button');
    if (existingCloseButton) {
        existingCloseButton.remove();
    }
    modal.querySelector('.modal-content').appendChild(closeButton);
    
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Track event modal open
    trackEvent('view_event_details', {
        'date': date.toISOString().split('T')[0],
        'event_count': dayEvents.length,
        'qualification_types': [...new Set(dayEvents.map(event => event.type))].join(',')
    });
}

  


function closeModal() {
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Track modal close event
        trackEvent('close_event_details');
    }
}

// Single DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // Track page view
    trackEvent('page_view', {
        'page_title': document.title,
        'referrer': document.referrer || 'direct'
    });
    
    initializeModal();
    initializeCalendarSubscriptions();
    initializeButtons();
    fetchEvents();
});
