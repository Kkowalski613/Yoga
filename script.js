// script.js

// Updated poses array
let poses = [
    { id: 1, name: 'Bow Pose', image: 'poses/bow.png' },
    { id: 2, name: "Child's Pose", image: 'poses/childs.png' },
    { id: 3, name: 'Downward Dog', image: 'poses/downward.png' },
    { id: 4, name: 'Downward Dog 2', image: 'poses/downward2.png' },
    { id: 5, name: 'Heart Center', image: 'poses/heartcenter.png' },
    { id: 6, name: 'Resting Pose', image: 'poses/resting.png' }
];

// Event Planner Data
let events = [];

// Attendees Data
let attendees = [
    // Sample attendees
    { id: 1, name: 'Alice Smith', email: 'alice@example.com' },
    { id: 2, name: 'Bob Johnson', email: 'bob@example.com' }
];

// Selected Poses for Yoga Flow
let selectedPoses = [];

// Function to add an event to the itinerary
function addEvent() {
    const name = document.getElementById('event-name').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const instructor = document.getElementById('event-instructor').value;

    if (name && date && time) {
        const event = {
            id: Date.now(),
            name: name,
            datetime: `${date} ${time}`,
            instructor: instructor || 'Not specified',
            sequence: null // To store yoga sequences added to the event
        };
        events.push(event);
        renderEventTable();
        // Clear form inputs
        document.getElementById('event-name').value = '';
        document.getElementById('event-date').value = '';
        document.getElementById('event-time').value = '';
        document.getElementById('event-instructor').value = '';
    } else {
        alert('Please fill in all event details.');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load profile photo if saved
    const savedPhoto = localStorage.getItem('profilePhoto');
    if (savedPhoto) {
        const profilePhoto = document.getElementById('profile-photo');
        if (profilePhoto) {
            profilePhoto.src = savedPhoto;
        }
    }

    // Render event table if events exist
    renderEventTable();

    // Render attendee table if it exists
    if (document.querySelector('#attendee-table')) {
        renderAttendeeTable();
    }

    // Open default tab
    const defaultTab = document.querySelector('.tablink.active');
    if (defaultTab) {
        const tabName = defaultTab.getAttribute('onclick').match(/'([^']+)'/)[1];
        document.getElementById(tabName).style.display = 'block';
    }
});

// Function to render the event table
function renderEventTable() {
    const tbody = document.querySelector('#event-table tbody');
    tbody.innerHTML = '';

    events.forEach(event => {
        const row = document.createElement('tr');

        // Event Name
        const nameCell = document.createElement('td');
        nameCell.textContent = event.name;
        row.appendChild(nameCell);

        // Date & Time
        const datetimeCell = document.createElement('td');
        datetimeCell.textContent = event.datetime;
        row.appendChild(datetimeCell);

        // Instructor
        const instructorCell = document.createElement('td');
        instructorCell.textContent = event.instructor;
        row.appendChild(instructorCell);

        // Actions
        const actionsCell = document.createElement('td');
        const viewButton = document.createElement('button');
        viewButton.textContent = 'View Details';
        viewButton.onclick = () => viewEventDetails(event.id);
        actionsCell.appendChild(viewButton);

        const modifyButton = document.createElement('button');
        modifyButton.textContent = 'Modify Flow';
        modifyButton.onclick = () => modifyEventFlow(event.id);
        actionsCell.appendChild(modifyButton);

        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });
}

// Function to view event details
function viewEventDetails(eventId) {
    const event = events.find(e => e.id === eventId);
    let message = `Event: ${event.name}\nDate & Time: ${event.datetime}`;

    if (event.instructor) {
        message += `\nInstructor: ${event.instructor}`;
    }

    if (event.sequence) {
        message += `\nSequence: ${event.sequence.name}\nPoses:\n`;
        event.sequence.poses.forEach(pose => {
            message += `- ${pose.customName} (${pose.duration} min)\n`;
        });

        // Display pose icons in a new window
        displayEventPoses(event);
    } else {
        message += `\nSequence: No sequence added.`;
        alert(message);
    }
}

// Function to modify event flow
function modifyEventFlow(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event.sequence) {
        alert('No sequence associated with this event.');
        return;
    }

    // Load the sequence into the Yoga Flow Builder
    selectedPoses = [...event.sequence.poses];
    renderFlow();

    // Switch to the Yoga Flow Builder tab
    const yogaFlowTab = document.querySelector('.tablink[onclick="openTab(event, \'YogaFlow\')"]');
    yogaFlowTab.click();

    alert(`You can now modify the flow for event "${event.name}". After making changes, add the sequence back to the event.`);
}

// Yoga Flow Builder Functions

// Display poses in the selection area
function displayPoses() {
    const posesContainer = document.querySelector('.poses');
    if (!posesContainer) return; // Ensure the container exists

    posesContainer.innerHTML = '';

    poses.forEach(pose => {
        const poseDiv = document.createElement('div');
        poseDiv.classList.add('pose');
        poseDiv.setAttribute('data-id', pose.id);
        poseDiv.onclick = () => addPoseToFlow(pose.id);

        const img = document.createElement('img');
        img.src = pose.image;
        img.alt = pose.name;
        img.title = pose.name;
        img.style.width = '80px';
        img.style.height = '80px';

        poseDiv.appendChild(img);
        posesContainer.appendChild(poseDiv);
    });
}


// Add pose to the flow with custom name and duration
function addPoseToFlow(poseId) {
    const pose = poses.find(p => p.id === poseId);
    const customName = prompt(`Enter custom name for ${pose.name} (optional):`, pose.name);
    const duration = prompt(`Enter duration in minutes for ${pose.name}:`, '5');

    if (duration && !isNaN(duration)) {
        const flowPose = {
            ...pose,
            customName: customName || pose.name,
            duration: parseInt(duration)
        };
        selectedPoses.push(flowPose);
        renderFlow();
    } else {
        alert('Please enter a valid duration.');
    }
}

// Render the flow sequence
function renderFlow() {
    const flowTableBody = document.querySelector('#flow-table tbody');
    flowTableBody.innerHTML = '';

    const flowIconsContainer = document.getElementById('flow-icons');
    flowIconsContainer.innerHTML = '';

    selectedPoses.forEach((pose, index) => {
        // Add to flow table
        const row = document.createElement('tr');

        // Pose Image
        const imgCell = document.createElement('td');
        const img = document.createElement('img');
        img.src = pose.image;
        img.alt = pose.name;
        img.style.width = '50px';
        img.style.height = '50px';
        imgCell.appendChild(img);
        row.appendChild(imgCell);

        // Pose Name
        const nameCell = document.createElement('td');
        nameCell.textContent = pose.name;
        row.appendChild(nameCell);

        // Custom Name
        const customNameCell = document.createElement('td');
        customNameCell.textContent = pose.customName;
        row.appendChild(customNameCell);

        // Duration
        const durationCell = document.createElement('td');
        durationCell.textContent = `${pose.duration} min`;
        row.appendChild(durationCell);

        // Actions
        const actionsCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editPoseInFlow(index);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => removePoseFromFlow(index);
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);

        flowTableBody.appendChild(row);

        // Add to flow icons summary
        const iconDiv = document.createElement('div');
        iconDiv.classList.add('pose-icon');
        const iconImg = document.createElement('img');
        iconImg.src = pose.image;
        iconImg.alt = pose.name;
        iconImg.title = pose.customName;
        iconImg.style.width = '50px';
        iconImg.style.height = '50px';
        iconDiv.appendChild(iconImg);
        flowIconsContainer.appendChild(iconDiv);
    });
}

// Functions to edit and remove poses from the flow
function editPoseInFlow(index) {
    const pose = selectedPoses[index];
    const customName = prompt(`Edit custom name for ${pose.name} (optional):`, pose.customName);
    const duration = prompt(`Edit duration in minutes for ${pose.name}:`, pose.duration);

    if (duration && !isNaN(duration)) {
        pose.customName = customName || pose.name;
        pose.duration = parseInt(duration);
        renderFlow();
    } else {
        alert('Please enter a valid duration.');
    }
}

function removePoseFromFlow(index) {
    selectedPoses.splice(index, 1);
    renderFlow();
}

// Function to export the flow as an SVG
function exportFlowSVG() {
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${selectedPoses.length * 100}" height="200">
        <style>
            .pose { font: 14px sans-serif; }
        </style>`;

    selectedPoses.forEach((pose, index) => {
        svgContent += `<image x="${index * 100}" y="0" width="80" height="80" href="${pose.image}" />`;
        svgContent += `<text x="${index * 100 + 40}" y="100" text-anchor="middle">${pose.customName}</text>`;
        svgContent += `<text x="${index * 100 + 40}" y="120" text-anchor="middle">${pose.duration} min</text>`;
    });

    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'yoga_flow.svg';
    link.click();
}

// Function to add the sequence to the event planner
function addSequenceToEvent() {
    if (selectedPoses.length === 0) {
        alert('Please build a sequence before adding it to the event planner.');
        return;
    }

    const sequenceName = prompt('Enter a name for your sequence:', 'My Yoga Sequence');
    if (!sequenceName) {
        alert('Sequence name is required.');
        return;
    }

    if (events.length === 0) {
        alert('Please create an event in the itinerary planner first.');
        return;
    }

    // Allow the user to select an event
    let eventOptions = events.map((event, index) => `${index + 1}. ${event.name}`).join('\n');
    let eventChoice = prompt(`Select an event to add the sequence to:\n${eventOptions}`, '1');
    let eventIndex = parseInt(eventChoice) - 1;

    if (eventIndex >= 0 && eventIndex < events.length) {
        const event = events[eventIndex];
        event.sequence = {
            name: sequenceName,
            poses: [...selectedPoses]
        };

        alert(`Sequence "${sequenceName}" added to event "${event.name}".`);
        // Clear the selected poses
        selectedPoses = [];
        renderFlow();
        renderEventTable();
    } else {
        alert('Invalid event selection.');
    }
}

// Function to handle tab switching
function openTab(evt, tabName) {
    const tablinks = document.getElementsByClassName('tablink');
    const tabcontents = document.getElementsByClassName('tabcontent');

    // Hide all tab contents
    for (let i = 0; i < tabcontents.length; i++) {
        tabcontents[i].style.display = 'none';
    }

    // Remove 'active' class from all tablinks
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove('active');
    }

    // Show current tab and add 'active' class
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.classList.add('active');

    // If the YogaFlow tab is being opened, ensure poses are displayed
    if (tabName === 'YogaFlow') {
        displayPoses();
    }
}

// Attendee Management Functions
function addAttendee() {
    const name = prompt('Enter attendee name:');
    const email = prompt('Enter attendee email:');
    if (name && email) {
        const attendee = {
            id: Date.now(),
            name: name,
            email: email
        };
        attendees.push(attendee);
        renderAttendeeTable();
    } else {
        alert('Name and email are required.');
    }
}

function renderAttendeeTable() {
    const tbody = document.querySelector('#attendee-table tbody');
    tbody.innerHTML = '';

    attendees.forEach(attendee => {
        const row = document.createElement('tr');

        // Name
        const nameCell = document.createElement('td');
        nameCell.textContent = attendee.name;
        row.appendChild(nameCell);

        // Email
        const emailCell = document.createElement('td');
        emailCell.textContent = attendee.email;
        row.appendChild(emailCell);

        // Actions
        const actionsCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteAttendee(attendee.id);
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });
}

function deleteAttendee(attendeeId) {
    attendees = attendees.filter(a => a.id !== attendeeId);
    renderAttendeeTable();
}

// Function to send itinerary email to all attendees
function emailItinerary() {
    if (attendees.length === 0) {
        alert('No attendees to email.');
        return;
    }

    if (events.length === 0) {
        alert('No events in the itinerary.');
        return;
    }

    let itinerary = 'Event Itinerary:\n\n';
    events.forEach(event => {
        itinerary += `Event: ${event.name}\nDate & Time: ${event.datetime}\nInstructor: ${event.instructor}\n`;
        if (event.sequence) {
            itinerary += `Sequence: ${event.sequence.name}\nPoses:\n`;
            event.sequence.poses.forEach(pose => {
                itinerary += `- ${pose.customName} (${pose.duration} min)\n`;
            });
        }
        itinerary += '\n';
    });

    // Simulate sending emails
    attendees.forEach(attendee => {
        console.log(`Email sent to ${attendee.email} with itinerary.`);
        // Here you would integrate with an email API like SendGrid or SMTP server
    });

    alert('Itinerary emailed to all attendees (simulated).');
}

function generateGanttChart() {
    if (events.length === 0) {
        alert('No events to display in the Gantt chart.');
        return;
    }

    let ganttChartDefinition = 'gantt\n' +
                               'dateFormat  YYYY-MM-DDTHH:mm\n' +
                               'title Event Schedule\n' +
                               'section Events\n';

    events.forEach(event => {
        const eventName = event.name.replace(/ /g, '_');
        const dateTime = new Date(event.datetime);
        const startDateTime = dateTime.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:mm'

        const durationMinutes = event.sequence
            ? event.sequence.poses.reduce((sum, pose) => sum + pose.duration, 0)
            : 60; // Default duration if no sequence is attached

        const durationString = `${durationMinutes}m`; // Use 'm' for minutes

        // Correct the Mermaid syntax
        ganttChartDefinition += `${eventName} : ${startDateTime}, ${durationString}\n`;
    });

    const ganttContainer = document.getElementById('gantt-chart-container');
    ganttContainer.innerHTML = `<div class="mermaid">${ganttChartDefinition}</div>`;

    // Initialize Mermaid after setting the content
    mermaid.init(undefined, ganttContainer);
}

// Function to view event details using a modal
function viewEventDetails(eventId) {
    const event = events.find(e => e.id === eventId);
    let contentHtml = `<h2>${event.name}</h2>`;
    contentHtml += `<p><strong>Date & Time:</strong> ${event.datetime}</p>`;
    if (event.instructor) {
        contentHtml += `<p><strong>Instructor:</strong> ${event.instructor}</p>`;
    }

    if (event.sequence) {
        contentHtml += `<h3>Sequence: ${event.sequence.name}</h3>`;
        contentHtml += '<div style="display:flex;flex-wrap:wrap;">';

        event.sequence.poses.forEach(pose => {
            contentHtml += `
                <div style="margin:10px;text-align:center;">
                    <img src="${pose.image}" alt="${pose.customName}" style="width:80px;height:80px;">
                    <p>${pose.customName}<br>(${pose.duration} min)</p>
                </div>
            `;
        });

        contentHtml += '</div>';
    } else {
        contentHtml += `<p>Sequence: No sequence added.</p>`;
    }

    // Display the modal with the content
    const modalContent = document.getElementById('event-modal-content');
    modalContent.innerHTML = contentHtml;
    const modal = document.getElementById('event-modal');
    modal.style.display = 'block';
}

// Function to close the event modal
function closeEventModal() {
    const modal = document.getElementById('event-modal');
    modal.style.display = 'none';
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('event-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// ... Rest of your existing code ...