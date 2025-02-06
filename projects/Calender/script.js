const daysContainer = document.getElementById("days");
const monthYear = document.getElementById("month-year");
const selectedDateDisplay = document.getElementById("selected-date");
const eventsDisplay = document.getElementById("events");
const addEventButton = document.getElementById("add-event");
const deleteEventButton = document.getElementById("delete-event");

let currentDate = new Date();
let selectedDate = null;

// Load events from localStorage
function loadEvents() {
  const events = JSON.parse(localStorage.getItem("events")) || [];
  return events;
}

// Save events to localStorage
function saveEvents(events) {
  localStorage.setItem("events", JSON.stringify(events));
}

function renderCalendar() {
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  monthYear.textContent = `${currentDate.toLocaleString("default", { month: "long" })} ${year}`;
  daysContainer.innerHTML = "";

  // Fill empty spaces before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    daysContainer.innerHTML += `<div class="empty"></div>`;
  }

  // Render all the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.textContent = day;

    const today = new Date();
    // Highlight today's date in yellow
    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayDiv.classList.add("selected", "today"); // Add "today" class to today's date
    }

    // Add event listener for selecting a day
    dayDiv.addEventListener("click", () => {
      selectedDate = new Date(year, month, day);
      document.querySelectorAll(".days div").forEach((el) => el.classList.remove("selected"));
      dayDiv.classList.add("selected");
      selectedDateDisplay.textContent = `${day} ${currentDate.toLocaleString("default", { month: "long" })} ${year}`;
      eventsDisplay.textContent = getEventForDate(selectedDate); // Display events for the selected date
      deleteEventButton.style.display = getEventForDate(selectedDate) !== "No Events" ? "inline-block" : "none"; // Show delete button if event exists
    });

    daysContainer.appendChild(dayDiv);
  }
}

function getEventForDate(date) {
  // Check if there are events for the selected date (using a simple local storage method for this demo)
  const events = loadEvents();
  const eventForDate = events.find(event => event.date === date.toISOString().split('T')[0]);
  return eventForDate ? eventForDate.event : "No Events";
}

addEventButton.addEventListener("click", () => {
  if (!selectedDate) {
    alert("Please select a date first.");
    return;
  }

  const eventDescription = prompt("Enter event details:");
  if (eventDescription) {
    const events = loadEvents();
    events.push({
      date: selectedDate.toISOString().split('T')[0],
      event: eventDescription
    });

    saveEvents(events);  // Save the updated events
    eventsDisplay.textContent = eventDescription; // Update the event display
    deleteEventButton.style.display = "inline-block"; // Show delete button
  }
});

deleteEventButton.addEventListener("click", () => {
  if (!selectedDate) {
    alert("Please select a date with an event first.");
    return;
  }

  const events = loadEvents();
  const updatedEvents = events.filter(event => event.date !== selectedDate.toISOString().split('T')[0]);

  saveEvents(updatedEvents); // Save the updated events after deletion
  eventsDisplay.textContent = "No Events"; // Clear the event display
  deleteEventButton.style.display = "none"; // Hide the delete button
});

document.getElementById("prev-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById("next-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Initial rendering of the calendar
renderCalendar();
