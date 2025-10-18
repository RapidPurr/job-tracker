
// Application State
let applications = [];
let currentEditId = null;
let sortColumn = '';
let sortDirection = 'asc';
let hasUnsavedChanges = false;

// Sample data with enhanced fields
const sampleApplications = [];
/*const sampleApplications = [
    {
        id: 1,
        company: 'Airbnb',
        job_title: 'Product Manager',
        job_type: 'Full-time',
        work_location: 'Hybrid',
        salary_range: '$200,000 - $245,633',
        status: 'Accepted',
        priority: 5,
        date_applied: '2025-07-24',
        follow_up_date: '',
        application_deadline_date: '2025-08-15',
        job_description: 'Lead product development for core platform features, collaborate with engineering and design teams to deliver user-centric solutions. Remote-first company with strong culture.',
        contact_person: 'Jessica Taylor',
        job_url: 'https://airbnb.com/careers/3495',
        notes: 'Remote-first company',
    },
    {
        id: 2,
        company: 'Discord',
        job_title: 'Cloud Engineer',
        job_type: 'Full-time',
        work_location: 'Hybrid',
        salary_range: '$137,000 - $184,571',
        status: 'Withdrawn',
        priority: 1,
        date_applied: '2025-08-30',
        follow_up_date: '',
        application_deadline_date: '2025-09-15',
        job_description: 'Design and maintain scalable cloud infrastructure, work with microservices architecture, optimize system performance and reliability.',
        contact_person: 'Sarah Brown',
        job_url: 'https://discord.com/careers/5174',
        notes: 'Strong engineering team',
    },
    {
        id: 3,
        company: 'Google',
        job_title: 'Senior Software Engineer',
        job_type: 'Full-time',
        work_location: 'Remote',
        salary_range: '$180,000 - $220,000',
        status: 'Interviewing',
        priority: 5,
        date_applied: '2025-10-01',
        follow_up_date: '2025-10-15',
        application_deadline_date: '2025-11-01',
        job_description: 'Develop large-scale distributed systems, contribute to open source projects, mentor junior developers, work on cutting-edge technologies.',
        contact_person: 'Alex Johnson',
        job_url: 'https://google.com/careers/1234',
        notes: 'Great company culture',
    },
    {
        id: 4,
        company: 'Microsoft',
        job_title: 'Product Designer',
        job_type: 'Full-time',
        work_location: 'Hybrid',
        salary_range: '$150,000 - $190,000',
        status: 'Applied',
        priority: 4,
        date_applied: '2025-10-05',
        follow_up_date: '2025-10-12',
        application_deadline_date: '2025-10-20',
        job_description: 'Design user interfaces for enterprise software products, conduct user research, create wireframes and prototypes, collaborate with product managers.',
        contact_person: 'Emily Davis',
        job_url: 'https://microsoft.com/careers/5678',
        notes: 'Competitive benefits',
    },
    {
        id: 5,
        company: 'Netflix',
        job_title: 'Data Scientist',
        job_type: 'Full-time',
        work_location: 'Remote',
        salary_range: '$170,000 - $210,000',
        status: 'Need to Apply',
        priority: 4,
        date_applied: '',
        follow_up_date: '',
        application_deadline_date: '2025-10-25',
        job_description: 'Analyze user behavior data, build machine learning models for content recommendation, work with big data technologies, present insights to stakeholders.',
        contact_person: 'Lisa Anderson',
        job_url: 'https://netflix.com/careers/7777',
        notes: 'Data-driven culture',
    },
];*/

// Utility function to parse dates in en-GB format (DD/MM/YYYY or DD-MM-YYYY)
function parseGBDate(dateString) {
    if (!dateString || dateString.trim() === '') return null;

    // Remove any extra whitespace
    dateString = dateString.trim();

    // Check if it's already in ISO format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return new Date(dateString);
    }

    // Handle DD/MM/YYYY or DD-MM-YYYY formats
    let dateParts;
    if (dateString.includes('/')) {
        dateParts = dateString.split('/');
    } else if (dateString.includes('-')) {
        dateParts = dateString.split('-');
    } else {
        // Try to parse as-is if no separators
        return new Date(dateString);
    }

    // If we have exactly 3 parts, assume DD/MM/YYYY or DD-MM-YYYY
    if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        const year = parseInt(dateParts[2], 10);

        // Validate the parts
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900) {
            // Create date in ISO format to avoid locale issues
            const isoDateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            return new Date(isoDateString);
        }
    }

    // Fallback to default Date parsing
    return new Date(dateString);
}

// Convert date to ISO format (YYYY-MM-DD) for storage
function toISODateString(date) {
    if (!date || isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    applications = [...sampleApplications];
    renderApplications();
    updateStatistics();
    updateCharts();
    updateRecentActivity();

    // Add browser close warning
    setupBeforeUnloadWarning();
});

// Browser close warning setup
function setupBeforeUnloadWarning() {
    window.addEventListener('beforeunload', function (event) {
        if (hasUnsavedChanges) {
            const message =
                'You have unsaved changes. Do you want to export your data to CSV before leaving?';
            event.preventDefault();
            event.returnValue = message;
            return message;
        }
    });
}

// Mark as having unsaved changes
function markAsChanged() {
    hasUnsavedChanges = true;
}

// Mark as saved
function markAsSaved() {
    hasUnsavedChanges = false;
}

// Generate next ID
function getNextId() {
    return applications.length > 0 ? Math.max(...applications.map(app => app.id)) + 1 : 1;
}

// Open Add Modal
function openAddModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Add Application';
    document.getElementById('applicationForm').reset();
    document.getElementById('applicationModal').classList.add('show');
}

// Open Edit Modal
function openEditModal(id) {
    currentEditId = id;
    const application = applications.find(app => app.id === id);
    if (!application) return;

    document.getElementById('modalTitle').textContent = 'Edit Application';

    // Populate form fields
    document.getElementById('company').value = application.company || '';
    document.getElementById('jobTitle').value = application.job_title || '';
    document.getElementById('jobType').value = application.job_type || 'Full-time';
    document.getElementById('workLocation').value = application.work_location || 'Remote';
    document.getElementById('salaryRange').value = application.salary_range || '';
    document.getElementById('contactPerson').value = application.contact_person || '';
    document.getElementById('status').value = application.status || 'Need to Apply';
    document.getElementById('priority').value = application.priority || 3;
    document.getElementById('dateApplied').value = application.date_applied || '';
    document.getElementById('followUpDate').value = application.follow_up_date || '';
    document.getElementById('applicationDeadline').value = application.application_deadline_date || '';
    document.getElementById('jobUrl').value = application.job_url || '';
    document.getElementById('jobDescription').value = application.job_description || '';
    document.getElementById('notes').value = application.notes || '';

    document.getElementById('applicationModal').classList.add('show');
}

// Close Modal
function closeModal() {
    document.getElementById('applicationModal').classList.remove('show');
    currentEditId = null;
}

// Save Application
function saveApplication(event) {
    event.preventDefault();

    const formData = {
        company: document.getElementById('company').value,
        job_title: document.getElementById('jobTitle').value,
        job_type: document.getElementById('jobType').value,
        work_location: document.getElementById('workLocation').value,
        salary_range: document.getElementById('salaryRange').value,
        contact_person: document.getElementById('contactPerson').value,
        status: document.getElementById('status').value,
        priority: parseInt(document.getElementById('priority').value),
        date_applied: document.getElementById('dateApplied').value,
        follow_up_date: document.getElementById('followUpDate').value,
        application_deadline_date: document.getElementById('applicationDeadline')
            .value,
        job_url: document.getElementById('jobUrl').value,
        job_description: document.getElementById('jobDescription').value,
        notes: document.getElementById('notes').value,
    };

    if (currentEditId) {
        // Edit existing application
        const index = applications.findIndex(app => app.id === currentEditId);
        if (index !== -1) {
            applications[index] = { ...applications[index], ...formData };
            addActivity(`Updated application for ${formData.company}`);
        }
    } else {
        // Add new application
        const newApplication = {
            id: getNextId(),
            ...formData,
        };
        applications.push(newApplication);
        addActivity(`Added new application for ${formData.company}`);
    }

    markAsChanged();
    closeModal();
    renderApplications();
    updateStatistics();
    updateCharts();
    updateRecentActivity();
}

// Delete Application
function deleteApplication(id) {
    const application = applications.find(app => app.id === id);
    if (!application) return;

    if (
        confirm(
            `Are you sure you want to delete the application for ${application.company}?`
        )
    ) {
        applications = applications.filter(app => app.id !== id);
        addActivity(`Deleted application for ${application.company}`);
        markAsChanged();
        renderApplications();
        updateStatistics();
        updateCharts();
        updateRecentActivity();
    }
}

// Format date for display - FIXED VERSION
function formatDate(dateString) {
    if (!dateString) return '';

    // Parse the date using our GB date parser
    const date = parseGBDate(dateString);

    if (!date || isNaN(date.getTime())) {
        return dateString; // Return original if parsing fails
    }

    return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

// Check if deadline is overdue or soon
function getDeadlineStatus(dateString) {
    if (!dateString) return '';

    // Parse the date using our GB date parser
    const deadline = parseGBDate(dateString);

    if (!deadline || isNaN(deadline.getTime())) {
        return '';
    }

    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 7) return 'soon';
    return '';
}

// Render Applications Table
function renderApplications() {
    const tbody = document.getElementById('applicationsBody');
    const filteredApps = getFilteredApplications();

    if (filteredApps.length === 0) {
        tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; color: var(--color-text-secondary); padding: var(--space-24);">
          No applications found
        </td>
      </tr>
    `;
        return;
    }

    tbody.innerHTML = filteredApps
        .map(app => {
            const deadlineStatus = getDeadlineStatus(app.application_deadline_date);
            const deadlineClass = deadlineStatus
                ? `deadline--${deadlineStatus}`
                : '';

            return `
        <tr>
          <td><strong>${app.company}</strong></td>
          <td>${app.job_title}</td>
          <td>${app.job_type}</td>
          <td>${app.work_location}</td>
          <td>${app.salary_range}</td>
          <td>
            <span class="status status--${app.status
                .toLowerCase()
                .replace(/\s+/g, '-')}">
              ${app.status}
            </span>
          </td>
          <td>
            <span class="priority priority--${app.priority}">
              ${app.priority}
            </span>
          </td>
          <td>${formatDate(app.date_applied)}</td>
          <td>
            <span class="deadline ${deadlineClass}">
              ${formatDate(app.application_deadline_date)}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn btn--outline btn--action" onclick="openEditModal(${app.id
                })">
                Edit
              </button>
              <button class="btn btn--outline btn--action" onclick="deleteApplication(${app.id
                })" style="color: var(--color-error); border-color: var(--color-error);">
                Delete
              </button>
              ${app.job_url
                    ? `<button class="btn btn--outline btn--action" onclick="window.open('${app.job_url}', '_blank')" title="Open Job URL">Link</button>`
                    : ''
                }
            </div>
          </td>
        </tr>
      `;
        })
        .join('');
}

// Get filtered applications based on search and filter criteria
function getFilteredApplications() {
    let filtered = [...applications];

    // Search filter
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(
            app =>
                app.company.toLowerCase().includes(searchTerm) ||
                app.job_title.toLowerCase().includes(searchTerm) ||
                (app.job_description &&
                    app.job_description.toLowerCase().includes(searchTerm))
        );
    }

    // Status filter
    const statusFilter = document.getElementById('statusFilter').value;
    if (statusFilter) {
        filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Priority filter
    const priorityFilter = document.getElementById('priorityFilter').value;
    if (priorityFilter) {
        filtered = filtered.filter(app => app.priority === priorityFilter);
    }

    // Work location filter
    const locationFilter = document.getElementById('workLocationFilter').value;
    if (locationFilter) {
        filtered = filtered.filter(app => app.work_location === locationFilter);
    }

    // Sort applications
    if (sortColumn) {
        filtered.sort((a, b) => {
            let aVal = a[sortColumn];
            let bVal = b[sortColumn];

            // Handle numeric values
            if (sortColumn === 'priority') {
                aVal = parseInt(aVal);
                bVal = parseInt(bVal);
            }

            // Handle dates - FIXED VERSION
            if (sortColumn.includes('date')) {
                aVal = parseGBDate(aVal || '1900-01-01');
                bVal = parseGBDate(bVal || '1900-01-01');
            }

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return filtered;
}

// Filter applications
function filterApplications() {
    renderApplications();
}

// Sort table
function sortTable(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }

    // Update sort indicators
    document.querySelectorAll('.sort-indicator').forEach(indicator => {
        indicator.className = 'sort-indicator';
    });

    const currentHeader = document.querySelector(
        `th[onclick="sortTable('${column}')"] .sort-indicator`
    );
    if (currentHeader) {
        currentHeader.classList.add(sortDirection);
    }

    renderApplications();
}

// Update statistics
function updateStatistics() {
    const stats = {
        total: applications.length,
        interviews: applications.filter(app => app.status === 'Interviewing')
            .length,
        offers: applications.filter(app => app.status === 'Accepted').length,
        overdue: applications.filter(
            app => getDeadlineStatus(app.application_deadline_date) === 'overdue'
        ).length,
    };

    document.getElementById('totalApps').textContent = stats.total;
    document.getElementById('interviews').textContent = stats.interviews;
    document.getElementById('offers').textContent = stats.offers;
    document.getElementById('overdue').textContent = stats.overdue;
}

// Update charts
function updateCharts() {
    updateStatusChart();
    updateTimelineChart();
}

// Status chart
function updateStatusChart() {
    const ctx = document.getElementById('statusChart').getContext('2d');

    // Destroy existing chart if it exists
    if (window.statusChartInstance) {
        window.statusChartInstance.destroy();
    }

    const statusCounts = {};
    applications.forEach(app => {
        statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });

    const chartColors = [
        '#1FB8CD',
        '#FFC185',
        '#B4413C',
        '#ECEBD5',
        '#5D878F',
        '#DB4545',
    ];

    window.statusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [
                {
                    data: Object.values(statusCounts),
                    backgroundColor: chartColors.slice(
                        0,
                        Object.keys(statusCounts).length
                    ),
                    borderWidth: 0,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                    },
                },
            },
        },
    });
}

// Timeline chart
function updateTimelineChart() {
    const ctx = document.getElementById('timelineChart').getContext('2d');

    // Destroy existing chart if it exists
    if (window.timelineChartInstance) {
        window.timelineChartInstance.destroy();
    }

    // Get applications by month - FIXED VERSION
    const monthCounts = {};
    applications.forEach(app => {
        if (app.date_applied) {
            const date = parseGBDate(app.date_applied);
            if (date && !isNaN(date.getTime())) {
                const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
                    .toString()
                    .padStart(2, '0')}`;
                monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
            }
        }
    });

    const sortedMonths = Object.keys(monthCounts).sort();
    const data = sortedMonths.map(month => monthCounts[month]);
    const labels = sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, monthNum - 1);
        return date.toLocaleDateString('en-GB', {
            month: 'short',
            year: 'numeric',
        });
    });

    window.timelineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Applications',
                    data: data,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                    },
                },
            },
        },
    });
}

// Recent activity
let recentActivity = [];

function addActivity(message) {
    recentActivity.unshift({
        message: message,
        timestamp: new Date(),
    });
    // Keep only the last 10 activities
    recentActivity = recentActivity.slice(0, 10);
}

function updateRecentActivity() {
    const container = document.getElementById('recentActivity');

    if (recentActivity.length === 0) {
        container.innerHTML = `
      <p style="color: var(--color-text-secondary); text-align: center; padding: var(--space-16);">
        No recent activity
      </p>
    `;
        return;
    }

    container.innerHTML = recentActivity
        .map(
            activity => `
      <div class="activity-item">
        <div class="activity-date">${activity.timestamp.toLocaleString()}</div>
        <div>${activity.message}</div>
      </div>
    `
        )
        .join('');
}

// Export to CSV
function exportToCSV() {
    const headers = [
        'Company',
        'Job Title',
        'Job Type',
        'Work Location',
        'Salary Range',
        'Status',
        'Priority',
        'Date Applied',
        'Follow-up Date',
        'Application Deadline Date',
        'Job Description',
        'Contact Person',
        'Job URL',
        'Notes',
    ];

    const csvContent = [
        headers.join(','),
        ...applications.map(app =>
            [
                `"${app.company}"`,
                `"${app.job_title}"`,
                `"${app.job_type}"`,
                `"${app.work_location}"`,
                `"${app.salary_range}"`,
                `"${app.status}"`,
                `"${app.priority}"`,
                `"${app.date_applied}"`,
                `"${app.follow_up_date}"`,
                `"${app.application_deadline_date}"`,
                `"${app.job_description.replace(/"/g, '""')}"`,
                `"${app.contact_person}"`,
                `"${app.job_url}"`,
                `"${app.notes.replace(/"/g, '""')}"`,
            ].join(',')
        ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute(
            'download',
            `job-applications-${new Date().toISOString().split('T')[0]}.csv`
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        markAsSaved();
        addActivity('Exported applications to CSV');
        updateRecentActivity();
    }
}

// Import from CSV - FIXED VERSION
function importFromCSV() {
    const file = document.getElementById('csvImport').files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n');
            const headers = lines[0]
                .split(',')
                .map(header => header.replace(/"/g, '').trim());

            const importedApps = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const values = parseCSVLine(line);
                if (values.length < headers.length) continue;

                // Process date fields with GB date parsing
                const dateApplied = values[7] ? toISODateString(parseGBDate(values[7])) : '';
                const followUpDate = values[8] ? toISODateString(parseGBDate(values[8])) : '';
                const deadlineDate = values[9] ? toISODateString(parseGBDate(values[9])) : '';

                const app = {
                    id: getNextId() + importedApps.length,
                    company: values[0] || '',
                    job_title: values[1] || '',
                    job_type: values[2] || 'Full-time',
                    work_location: values[3] || 'Remote',
                    salary_range: values[4] || '',
                    status: values[5] || 'Need to Apply',
                    priority: parseInt(values[6]) || 3,
                    date_applied: dateApplied,
                    follow_up_date: followUpDate,
                    application_deadline_date: deadlineDate,
                    job_description: values[10] || '',
                    contact_person: values[11] || '',
                    job_url: values[12] || '',
                    notes: values[13] || '',
                };
                importedApps.push(app);
            }

            applications.push(...importedApps);
            markAsChanged();
            renderApplications();
            updateStatistics();
            updateCharts();
            addActivity(`Imported ${importedApps.length} applications from CSV`);
            updateRecentActivity();
            alert(`Successfully imported ${importedApps.length} applications!`);
        } catch (error) {
            alert(
                'Error importing CSV file. Please check the format and try again.'
            );
            console.error('CSV Import Error:', error);
        }
    };

    reader.readAsText(file);
    document.getElementById('csvImport').value = ''; // Reset file input
}

// Parse CSV line handling quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}

// Close modal when clicking outside
document.addEventListener('click', function (event) {
    const modal = document.getElementById('applicationModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});
