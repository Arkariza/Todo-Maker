document.addEventListener('DOMContentLoaded', function() {
    let calendar;
    let selectedEvent = null;
    const eventModal = new bootstrap.Modal(document.getElementById('eventModal'));
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    initializeCalendar();
    
    document.getElementById('saveEventBtn').addEventListener('click', saveEvent);
    document.getElementById('deleteEventBtn').addEventListener('click', deleteEvent);
    document.getElementById('showCreationEvents').addEventListener('change', filterEvents);
    document.getElementById('showDeadlineEvents').addEventListener('change', filterEvents);
    
    function initializeCalendar() {
        const calendarEl = document.getElementById('calendar');
        
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
            },
            events: loadEvents,
            editable: true,
            selectable: true,
            selectMirror: true,
            dayMaxEvents: true,
            themeSystem: 'bootstrap5',
            
            select: function(info) {
                openEventModal('add', {
                    start: info.start,
                    end: info.end
                });
                calendar.unselect();
            },
            
            eventClick: function(info) {
                if (info.event.id.startsWith('task-')) {
                    const taskIdMatch = info.event.id.match(/task-(\d+)-(\d+)/);
                    if (taskIdMatch && taskIdMatch[2]) {
                        const boardId = taskIdMatch[2];
                        window.location.href = `/task?id_board=${boardId}`;
                        return;
                    }
                }

                openEventModal('edit', {
                    id: info.event.id,
                    title: info.event.title,
                    start: info.event.start,
                    end: info.event.end || info.event.start,
                    color: info.event.backgroundColor,
                    description: info.event.extendedProps.description || ''
                });
            }
        });
        
        calendar.render();
    }

    function loadEvents(info, successCallback, failureCallback) {
        showLoading();
        
        Promise.all([
            fetch('/boards', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            .then(response => response.json())
            .then(result => result.data || []),
            fetch('/shared-boards', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            .then(response => response.json())
            .then(result => result.data || [])
        ])
        .then(([ownBoards, sharedBoards]) => {
            const allBoards = [...ownBoards, ...sharedBoards];
            const boardPromises = [];
            
            allBoards.forEach(board => {
                const boardPromise = fetch(`/boards/${board.id_board}/lists`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                })
                .then(response => response.json())
                .then(listsData => {
                    const lists = listsData.data || [];
                    
                    const listPromises = lists.map(list => {
                        return fetch(`/lists/${list.id_list}/tasks`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include'
                        })
                        .then(response => response.json())
                        .then(taskData => {
                            return {
                                boardId: board.id_board,
                                listId: list.id_list,
                                tasks: taskData.tasks || []
                            };
                        });
                    });
                    
                    return Promise.all(listPromises);
                });
                
                boardPromises.push(boardPromise);
            });
            
            return Promise.all(boardPromises);
        })
        .then(boardsListsData => {
            const allListsWithTasks = boardsListsData.flat();
            const calendarEvents = [];
            
            allListsWithTasks.forEach(listData => {
                listData.tasks.forEach(task => {
                    if (task.deadline) {
                        calendarEvents.push({
                            id: `task-${task.id_task}-${listData.boardId}`,
                            title: `${task.title} (Deadline)`,
                            start: task.deadline,
                            allDay: true,
                            backgroundColor: getPriorityColor(task.priority) || '#dc3545',
                            borderColor: getPriorityColor(task.priority) || '#dc3545',
                            description: task.description || `Task deadline for "${task.title}"`,
                            extendedProps: {
                                taskId: task.id_task,
                                boardId: listData.boardId,
                                eventType: 'deadline'
                            }
                        });
                    }
                    
                    if (task.created_at) {
                        calendarEvents.push({
                            id: `task-created-${task.id_task}-${listData.boardId}`,
                            title: `${task.title} (Created)`,
                            start: task.created_at,
                            allDay: false,
                            backgroundColor: '#198754',
                            borderColor: '#198754',
                            description: `Task "${task.title}" was created`,
                            extendedProps: {
                                taskId: task.id_task,
                                boardId: listData.boardId,
                                eventType: 'creation'
                            }
                        });
                    }
                });
            });
            
            successCallback(calendarEvents);
            hideLoading();
        })
        .catch(error => {
            console.error('Error loading task data:', error);
            failureCallback(error);
            hideLoading();
            showAlert('Failed to load calendar data. Please try again later.', 'danger');
        });
    }
    
    function getPriorityColor(priority) {
        switch (priority) {
            case 'High':
                return '#dc3545';
            case 'Medium':
                return '#fd7e14'; 
            case 'Low':
                return '#0d6efd'; 
            default:
                return '#6c757d'; 
        }
    }
    
    function openEventModal(mode, eventData) {
        const modalTitle = document.getElementById('eventModalLabel');
        const deleteBtn = document.getElementById('deleteEventBtn');
        const eventForm = document.getElementById('eventForm');
        
        eventForm.reset();
        
        modalTitle.textContent = mode === 'add' ? 'Add Event' : 'Edit Event';
        
        deleteBtn.style.display = mode === 'edit' ? 'block' : 'none';
        
        document.getElementById('eventId').value = eventData.id || '';
        document.getElementById('eventTitle').value = eventData.title || '';
        
        if (eventData.start) {
            document.getElementById('eventStart').value = formatDateTimeForInput(eventData.start);
        }
        
        if (eventData.end) {
            document.getElementById('eventEnd').value = formatDateTimeForInput(eventData.end);
        }
        
        document.getElementById('eventColor').value = eventData.color || '#0d6efd';
        document.getElementById('eventDescription').value = eventData.description || '';
           
        selectedEvent = eventData;
        
        eventModal.show();
    }
    
    function saveEvent() {
        const eventId = document.getElementById('eventId').value;
        const title = document.getElementById('eventTitle').value;
        const start = document.getElementById('eventStart').value;
        const end = document.getElementById('eventEnd').value;
        const color = document.getElementById('eventColor').value;
        const description = document.getElementById('eventDescription').value;
        
        if (!title || !start || !end) {
            showAlert('Please fill all required fields', 'warning');
            return;
        }
        
        const eventData = {
            title,
            start,
            end,
            color,
            description
        };
        
        showLoading();
        
        if (eventId) {
            fetch(`/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            })
            .then(handleResponse)
            .then(updatedEvent => {
                const existingEvent = calendar.getEventById(eventId);
                if (existingEvent) {
                    existingEvent.setProp('title', updatedEvent.title);
                    existingEvent.setStart(updatedEvent.start);
                    existingEvent.setEnd(updatedEvent.end);
                    existingEvent.setProp('backgroundColor', updatedEvent.color);
                    existingEvent.setExtendedProp('description', updatedEvent.description);
                }
                
                showAlert('Event updated successfully', 'success');
                eventModal.hide();
            })
            .catch(handleError);
        } else {
            fetch('/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            })
            .then(handleResponse)
            .then(newEvent => {
                calendar.addEvent(newEvent);
                
                showAlert('Event added successfully', 'success');
                eventModal.hide();
            })
            .catch(handleError);
        }
    }
    
    function deleteEvent() {
        const eventId = document.getElementById('eventId').value;
        
        if (!eventId) {
            showAlert('No event selected', 'warning');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this event?')) {
            return;
        }
        
        showLoading();
        
        fetch(`/events/${eventId}`, {
            method: 'DELETE'
        })
        .then(handleResponse)
        .then(() => {
            const existingEvent = calendar.getEventById(eventId);
            if (existingEvent) {
                existingEvent.remove();
            }
            
            showAlert('Event deleted successfully', 'success');
            eventModal.hide();
        })
        .catch(handleError);
    }
    
    function formatDateTimeForInput(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        if (isNaN(date.getTime())) {
            return '';
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    function handleResponse(response) {
        hideLoading();
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        return response.json();
    }
    
    function handleError(error) {
        hideLoading();
        console.error('API error:', error);
        showAlert(`An error occurred: ${error.message}`, 'danger');
    }
    
    function showLoading() {
        loadingIndicator.style.visibility = 'visible';
    }
    
    function hideLoading() {
        loadingIndicator.style.visibility = 'hidden';
    }
    
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const container = document.querySelector('.container');
        container.prepend(alertDiv);
        
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        }, 5000);
    }
});

let arrow = document.querySelectorAll(".arrow");
for (var i = 0; i < arrow.length; i++) {
    arrow[i].addEventListener("click", (e)=>{
    let arrowParent = e.target.parentElement.parentElement;
    arrowParent.classList.toggle("showMenu");
    });
}

let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".bx-menu");
console.log(sidebarBtn);
sidebarBtn.addEventListener("click", ()=>{
    sidebar.classList.toggle("close");
});