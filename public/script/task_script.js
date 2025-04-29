document.addEventListener("DOMContentLoaded", function () {
    const board = document.querySelector(".main-content");
    const addColumnButton = document.querySelector(".add-column");
    const boardId = new URLSearchParams(window.location.search).get('id_board') || 1;
    
    const modalHTML = `
    <!-- Add Column Modal -->
    <div id="addColumnModal" class="modal-overlay">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Add New Column</div>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="columnName">Column Name</label>
                    <input type="text" id="columnName" placeholder="Enter column name">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary cancel-btn">Cancel</button>
                <button class="btn btn-primary save-column-btn">Add Column</button>
            </div>
        </div>
    </div>
    
    <!-- Edit Column Modal -->
    <div id="editColumnModal" class="modal-overlay">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Edit Column</div>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="editColumnName">Column Name</label>
                    <input type="text" id="editColumnName" placeholder="Enter column name">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger delete-column-btn">Delete</button>
                <button class="btn btn-secondary cancel-btn">Cancel</button>
                <button class="btn btn-primary update-column-btn">Edit</button>
            </div>
        </div>
    </div>
    
    <!-- Add Task Modal -->
    <div id="addTaskModal" class="modal-overlay">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Add New Task</div>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="taskTitle">Task Title</label>
                    <input type="text" id="taskTitle" placeholder="Enter task title">
                </div>
                <div class="form-group">
                    <label for="taskDescription">Description</label>
                    <textarea id="taskDescription" placeholder="Enter task description"></textarea>
                </div>
                <div class="form-group">
                    <label for="taskPriority">Priority</label>
                    <select id="taskPriority" class="priority-select">
                        <option style="color:gray;" value="low-priority">Low</option>
                        <option style="color:gray;" value="medium-priority" selected>Medium</option>
                        <option style="color:gray;" value="high-priority">High</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Labels</label>
                    <div class="label-checkboxes">
                        <div class="label-checkbox">
                            <input type="checkbox" id="labelBug" value="label-bug">
                            <label for="labelBug">Bug</label>
                        </div>
                        <div class="label-checkbox">
                            <input type="checkbox" id="labelFeature" value="label-feature">
                            <label for="labelFeature">Feature</label>
                        </div>
                        <div class="label-checkbox">
                            <input type="checkbox" id="labelDesign" value="label-design">
                            <label for="labelDesign">Design</label>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="taskDeadline">Deadline</label>
                    <input type="date" id="taskDeadline">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary cancel-btn">Cancel</button>
                <button class="btn btn-primary save-task-btn">Add Task</button>
            </div>
        </div>
    </div>
    
    <!-- Edit Task Modal -->
    <div id="editTaskModal" class="modal-overlay">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Edit Task</div>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="editTaskTitle">Task Title</label>
                    <input type="text" id="editTaskTitle" placeholder="Enter task title">
                </div>
                <div class="form-group">
                    <label for="editTaskDescription">Description</label>
                    <textarea id="editTaskDescription" placeholder="Enter task description"></textarea>
                </div>
                <div class="form-group">
                    <label for="editTaskPriority">Priority</label>
                    <select id="editTaskPriority" class="priority-select">
                        <option style="color:gray;" value="low-priority">Low</option>
                        <option style="color:gray;" value="medium-priority">Medium</option>
                        <option style="color:gray;" value="high-priority">High</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Labels</label>
                    <div class="label-checkboxes">
                        <div class="label-checkbox">
                            <input type="checkbox" id="editLabelBug" value="label-bug">
                            <label for="editLabelBug">Bug</label>
                        </div>
                        <div class="label-checkbox">
                            <input type="checkbox" id="editLabelFeature" value="label-feature">
                            <label for="editLabelFeature">Feature</label>
                        </div>
                        <div class="label-checkbox">
                            <input type="checkbox" id="editLabelDesign" value="label-design">
                            <label for="editLabelDesign">Design</label>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="editTaskDeadline">Deadline</label>
                    <input type="date" id="editTaskDeadline">
                </div>
                <div class="form-group">
                    <label for="editTaskStatus">Status</label>
                    <div class="status-toggle">
                        <input type="checkbox" id="editTaskStatus">
                        <label for="editTaskStatus">Mark as Done</label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger delete-task-btn">Delete</button>
                <button class="btn btn-secondary cancel-btn">Cancel</button>
                <button class="btn btn-primary update-task-btn">Update Task</button>
            </div>
        </div>
    </div>
    
    <!-- Task Actions Modal -->
    <div id="taskActionsModal" class="modal-overlay">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Task Actions</div>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <h3 id="actionTaskTitle" style="margin-bottom: 15px;"></h3>
                <div class="task-actions">
                    <button class="btn btn-secondary edit-btn">Edit Task</button>
                    <button class="btn btn-danger delete-btn">Delete Task</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Add User Modal -->
        <div id="addUserModal" class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title">Add User to Board</div>
                    <button class="modal-close" onclick="closeModal('addUserModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addUserForm">
                        <div class="form-group">
                            <label for="newUsername">Username</label>
                            <input type="text" id="newUsername" placeholder="Enter username" required>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="closeModal('addUserModal')">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add User</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        
        <!-- User List Modal -->
        <div id="userListModal" class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title">Board Users</div>
                    <button class="modal-close" onclick="closeModal('userListModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="userListContainer">
                        <p>Loading users...</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('userListModal')">Close</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const addColumnModal = document.getElementById("addColumnModal");
    const editColumnModal = document.getElementById("editColumnModal");
    const addTaskModal = document.getElementById("addTaskModal");
    const editTaskModal = document.getElementById("editTaskModal");
    const taskActionsModal = document.getElementById("taskActionsModal");
    let currentTaskColumn;
    let currentColumn;
    let currentTaskCard;
    let currentTaskId;
    let currentListId;
    let reapplyDragAndDrop;

    loadLists();
    
    function loadLists() {
        const columns = document.querySelectorAll(".board-column");
        columns.forEach(column => column.remove());
        fetch(`/lists/${boardId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load lists');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    data.data.forEach(list => {
                        createColumnElement(list);
                        loadTasks(list.id_list);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading lists:', error);
                showNotification('Failed to load lists', 'error');
            });
    }
    
    function createColumnElement(list) {
        const newColumn = document.createElement("div");
        newColumn.classList.add("board-column");
        newColumn.dataset.listId = list.id_list;
        newColumn.innerHTML = `
            <div class="column-header">
                <div class="column-title">
                    <span>${list.title}</span>
                    <span class="task-count">0</span>
                </div>
                <div class="column-actions">
                    <button class="edit-column-btn">✎</button>
                    <button class="add-task-btn">+</button>
                </div>
            </div>
            <div class="tasks-container"></div>
        `;
        
        board.insertBefore(newColumn, addColumnButton);
        
        const newAddTaskBtn = newColumn.querySelector(".add-task-btn");
        newAddTaskBtn.addEventListener("click", function() {
            currentTaskColumn = newColumn;
            currentListId = list.id_list;
            openModal(addTaskModal);
        });
        
        const editColumnBtn = newColumn.querySelector(".edit-column-btn");
        editColumnBtn.addEventListener("click", function() {
            currentListId = list.id_list;
            currentColumn = newColumn;
            
            
            document.getElementById("editColumnName").value = list.title;
            
            openModal(editColumnModal);
        });
    }
    
    function loadTasks(listId) {
        fetch(`/tasks/${listId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load tasks');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    const column = document.querySelector(`.board-column[data-list-id="${listId}"]`);
                    const tasksContainer = column.querySelector(".tasks-container");
                    
                    tasksContainer.innerHTML = '';
                    
                    data.tasks.forEach(task => {
                        const taskCard = createTaskElement(task);
                        tasksContainer.appendChild(taskCard);
                    });
                    
                    updateTaskCount(column);
                    setupTaskCardListeners();
                    if (reapplyDragAndDrop) reapplyDragAndDrop();
                }
            })
            .catch(error => {
                console.error(`Error loading tasks for list ${listId}:`, error);
                showNotification('Failed to load tasks', 'error');
            });
    }
    
    function createTaskElement(task) {
        const taskCard = document.createElement("div");
        taskCard.classList.add("task-card");
        taskCard.dataset.taskId = task.id_task;
        
        switch(task.priority) {
            case 'High':
            case 'high':
                taskCard.classList.add("high-priority");
                break;
            case 'Medium':
            case 'medium':
                taskCard.classList.add("medium-priority");
                break;
            case 'Low':
            case 'low':
                taskCard.classList.add("low-priority");
                break;
            default:
                taskCard.classList.add("medium-priority");
        }
        
        if (task.status === 'done') {
            taskCard.classList.add("task-done");
        }
        
        const labels = task.label ? task.label.split(',') : [];
        let labelsHTML = '';
        
        if (labels.length > 0) {
            labelsHTML = '<div class="task-labels">';
            labels.forEach(label => {
                if (label.trim()) {
                    labelsHTML += `<span class="task-label label-${label.trim()}">${label.trim()}</span>`;
                }
            });
            labelsHTML += '</div>';
        }
        
        const assigneeInitials = task.assignee_username 
            ? task.assignee_username.slice(0, 2).toUpperCase()
            : 'NA';
        
        let deadlineClass = '';
        let deadlineText = 'No deadline';
        
        if (task.deadline) {
            const today = new Date();
            const deadline = new Date(task.deadline);
            const diffTime = deadline - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 2 && diffDays >= 0) {
                deadlineClass = 'deadline-approaching';
            } else if (diffDays < 0) {
                deadlineClass = 'deadline-passed';
            }
            
            deadlineText = deadline.toLocaleDateString();
        }
        
        const statusBadge = task.status === 'done' 
            ? '<span class="status-badge status-done">Done</span>' 
            : '<span class="status-badge status-ongoing">On Going</span>';
        
        taskCard.innerHTML = `
            ${labelsHTML}
            <div class="task-title">${task.title}</div>
            <div class="task-description">${task.description || "No description provided"}</div>
            <div class="task-meta">
                <div class="task-status-info">
                <div class="deadline ${deadlineClass}">
                <i class="fa fa-calendar">Deadline:</i> ${deadlineText}
                </div>
                </div>
                <div class="task-members">
                ${statusBadge}
                </div>
            </div>
        `;
        
        return taskCard;
    }
    
    addColumnButton.addEventListener("click", function() {
        openModal(addColumnModal);
    });
    
    document.querySelectorAll(".modal-close").forEach(closeButton => {
        closeButton.addEventListener("click", function() {
            closeModal(closeButton.closest(".modal-overlay"));
        });
    });
    
    document.querySelectorAll(".cancel-btn").forEach(cancelButton => {
        cancelButton.addEventListener("click", function() {
            closeModal(cancelButton.closest(".modal-overlay"));
        });
    });
    
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", function(e) {
            if (e.target === overlay) {
                closeModal(overlay);
            }
        });
    });
    
    document.querySelector(".save-column-btn").addEventListener("click", function() {
        const columnNameInput = document.getElementById("columnName");
        const columnName = columnNameInput.value.trim();
        
        if (!columnName) {
            showNotification('Please enter a column name', 'warning');
            return;
        }
        
        fetch('/lists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id_board: boardId,
                title: columnName
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create list');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const list = {
                    id_list: data.listId,
                    title: columnName
                };
                createColumnElement(list);
                showNotification('Column created successfully', 'success');
                if (reapplyDragAndDrop) {
                    setTimeout(reapplyDragAndDrop, 100);
                }
            }
        })
        .catch(error => {
            console.error('Error creating list:', error);
            showNotification('Failed to create column', 'error');
        });
        
        closeModal(addColumnModal);
        columnNameInput.value = "";
    });
    
    document.querySelector(".update-column-btn").addEventListener("click", function() {
        const editColumnNameInput = document.getElementById("editColumnName");
        const columnName = editColumnNameInput.value.trim();
        
        if (!columnName) {
            showNotification('Please enter a column name', 'warning');
            return;
        }
        
        fetch(`/lists/${currentListId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: columnName
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update column');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                currentColumn.querySelector(".column-title span:first-child").textContent = columnName;
                showNotification('Column updated successfully', 'success');
            }
        })
        .catch(error => {
            console.error('Error updating column:', error);
            showNotification('Failed to update column', 'error');
        });
        
        closeModal(editColumnModal);
    });
    
    document.querySelector(".delete-column-btn").addEventListener("click", function() {
        if (confirm("Are you sure you want to delete this column? All tasks in this column will also be deleted.")) {
            fetch(`/lists/${currentListId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete column');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    currentColumn.remove();
                    showNotification('Column deleted successfully', 'success');
                }
            })
            .catch(error => {
                console.error('Error deleting column:', error);
                showNotification('Failed to delete column', 'error');
            });
            
            closeModal(editColumnModal);
        }
    });
    
    document.querySelector(".save-task-btn").addEventListener("click", function() {
        const taskTitleInput = document.getElementById("taskTitle");
        const taskDescInput = document.getElementById("taskDescription");
        const taskPrioritySelect = document.getElementById("taskPriority");
        const taskDeadlineInput = document.getElementById("taskDeadline");
        
        const title = taskTitleInput.value.trim();
        const description = taskDescInput.value.trim();
        const priority = taskPrioritySelect.value.replace('-priority', '');
        const deadline = taskDeadlineInput.value || null;
        
        if (!title) {
            showNotification('Please enter a task title', 'warning');
            return;
        }
        
        const selectedLabels = [];
        if (document.getElementById("labelBug").checked) {
            selectedLabels.push('bug');
        }
        if (document.getElementById("labelFeature").checked) {
            selectedLabels.push('feature');
        }
        if (document.getElementById("labelDesign").checked) {
            selectedLabels.push('design');
        }
        
        fetch('/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                list_id: currentListId,
                title: title,
                description: description,
                priority: priority,
                label: selectedLabels.join(','),
                deadline: deadline,
                status: 'on progress'
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create task');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                loadTasks(currentListId);
                showNotification('Task created successfully', 'success');
            }
        })
        .catch(error => {
            console.error('Error creating task:', error);
            showNotification('Failed to create task', 'error');
        });

        taskTitleInput.value = "";
        taskDescInput.value = "";
        taskPrioritySelect.value = "medium-priority";
        taskDeadlineInput.value = "";
        document.getElementById("labelBug").checked = false;
        document.getElementById("labelFeature").checked = false;
        document.getElementById("labelDesign").checked = false;
        
        closeModal(addTaskModal);
    });
    
    function setupTaskCardListeners() {
        document.querySelectorAll(".task-card").forEach(card => {
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            newCard.setAttribute("draggable", "true");
            newCard.addEventListener("click", function(e) {
                currentTaskCard = this;
                currentTaskColumn = this.closest(".board-column");
                currentTaskId = this.dataset.taskId;
                currentListId = currentTaskColumn.dataset.listId;
                
                const taskTitle = this.querySelector(".task-title").textContent;
                document.getElementById("actionTaskTitle").textContent = taskTitle;
                
                openModal(taskActionsModal);
                e.stopPropagation(); 
            });
            
            newCard.addEventListener("dragstart", function(e) {
                e.dataTransfer.setData("text/plain", this.dataset.taskId);
                this.style.opacity = "0.5";
                currentTaskCard = this;
                currentTaskColumn = this.closest(".board-column");
                currentTaskId = this.dataset.taskId;
                currentListId = currentTaskColumn.dataset.listId;
            });
            
            newCard.addEventListener("dragend", function(e) {
                this.style.opacity = "1";
            });
        });
    }
    
    document.querySelector("#taskActionsModal .edit-btn").addEventListener("click", function() {
        closeModal(taskActionsModal);
        
        const taskTitle = currentTaskCard.querySelector(".task-title").textContent;
        const taskDesc = currentTaskCard.querySelector(".task-description").textContent;
        const taskDeadlineEl = currentTaskCard.querySelector(".deadline");
        const taskDeadline = taskDeadlineEl ? taskDeadlineEl.textContent.trim() : '';
        
        let taskPriority = "medium-priority";
        if (currentTaskCard.classList.contains("high-priority")) {
            taskPriority = "high-priority";
        } else if (currentTaskCard.classList.contains("low-priority")) {
            taskPriority = "low-priority";
        }
        
        const isTaskDone = currentTaskCard.classList.contains("task-done");
        
        document.getElementById("editTaskTitle").value = taskTitle;
        document.getElementById("editTaskDescription").value = taskDesc === "No description provided" ? "" : taskDesc;
        document.getElementById("editTaskPriority").value = taskPriority;
        
        if (taskDeadline && taskDeadline !== 'No deadline') {
            try {
                const deadlineParts = taskDeadline.split('/');
                if (deadlineParts.length === 3) {
                    const month = deadlineParts[0].padStart(2, '0');
                    const day = deadlineParts[1].padStart(2, '0');
                    const year = deadlineParts[2];
                    document.getElementById("editTaskDeadline").value = `${year}-${month}-${day}`;
                }
            } catch (err) {
                console.error("Error parsing deadline:", err);
                document.getElementById("editTaskDeadline").value = "";
            }
        } else {
            document.getElementById("editTaskDeadline").value = "";
        }
        
        document.getElementById("editTaskStatus").checked = isTaskDone;
        
        document.getElementById("editLabelBug").checked = currentTaskCard.innerHTML.includes("label-bug");
        document.getElementById("editLabelFeature").checked = currentTaskCard.innerHTML.includes("label-feature");
        document.getElementById("editLabelDesign").checked = currentTaskCard.innerHTML.includes("label-design");
        
        editTaskModal.style.zIndex = 1000;
        openModal(editTaskModal);
    });
    
    document.querySelector("#taskActionsModal .delete-btn").addEventListener("click", function() {
        if (confirm("Are you sure you want to delete this task?")) {
            fetch(`/tasks/${currentTaskId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete task');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    currentTaskCard.remove();
                    updateTaskCount(currentTaskColumn);
                    showNotification('Task deleted successfully', 'success');
                }
            })
            .catch(error => {
                console.error('Error deleting task:', error);
                showNotification('Failed to delete task', 'error');
            });
            
            closeModal(taskActionsModal);
        }
    });
    
    document.querySelector(".delete-task-btn").addEventListener("click", function() {
        if (confirm("Are you sure you want to delete this task?")) {
            fetch(`/tasks/${currentTaskId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete task');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    currentTaskCard.remove();
                    updateTaskCount(currentTaskColumn);
                    showNotification('Task deleted successfully', 'success');
                }
            })
            .catch(error => {
                console.error('Error deleting task:', error);
                showNotification('Failed to delete task', 'error');
            });
            
            closeModal(editTaskModal);
        }
    });
    
    document.querySelector(".update-task-btn").addEventListener("click", function() {
        const taskTitle = document.getElementById("editTaskTitle").value.trim();
        const taskDesc = document.getElementById("editTaskDescription").value.trim();
        const taskPriority = document.getElementById("editTaskPriority").value;
        const taskDeadline = document.getElementById("editTaskDeadline").value || null;
        const taskStatus = document.getElementById("editTaskStatus").checked ? "done" : "on progress";
        
        if (!taskTitle) {
            showNotification('Please enter a task title', 'warning');
            return;
        }
        
        const selectedLabels = [];
        if (document.getElementById("editLabelBug").checked) {
            selectedLabels.push('bug');
        }
        if (document.getElementById("editLabelFeature").checked) {
            selectedLabels.push('feature');
        }
        if (document.getElementById("editLabelDesign").checked) {
            selectedLabels.push('design');
        }
        
        fetch(`/tasks/${currentTaskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: taskTitle,
                description: taskDesc,
                priority: taskPriority.replace('-priority', ''),
                label: selectedLabels.join(','),
                deadline: taskDeadline,
                status: taskStatus
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update task');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                loadTasks(currentListId);
                showNotification('Task updated successfully', 'success');
            }
        })
        .catch(error => {
            console.error('Error updating task:', error);
            showNotification('Failed to update task', 'error');
        });
        
        closeModal(editTaskModal);
    });
    
    function enableDragAndDrop() {
        document.removeEventListener("dragstart", handleDragStart);
        document.removeEventListener("dragend", handleDragEnd);
        
        function handleDragStart(e) {
            if (e.target.classList.contains("task-card")) {
                e.dataTransfer.setData("text/plain", e.target.dataset.taskId);
                e.target.style.opacity = "0.5";
            }
        }
        
        function handleDragEnd(e) {
            if (e.target.classList.contains("task-card")) {
                e.target.style.opacity = "1";
            }
        }
        function applyContainerListeners() {
            document.querySelectorAll(".tasks-container").forEach(container => {
                const newContainer = container.cloneNode(true);
                container.parentNode.replaceChild(newContainer, container);
                
                newContainer.addEventListener("dragover", function(e) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                });
                
                newContainer.addEventListener("drop", function(e) {
                    e.preventDefault();
                    const taskId = e.dataTransfer.getData("text/plain");
                    if (!taskId) return;
                    
                    const draggedItem = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
                    if (!draggedItem) return;
                    
                    const sourceListId = draggedItem.closest(".board-column").dataset.listId;
                    const targetListId = this.closest(".board-column").dataset.listId;
                    
                    if (sourceListId !== targetListId) {
                        fetch(`/tasks/${taskId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                list_id: targetListId
                            })
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to move task');
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data.success) {
                                draggedItem.remove();
                                loadTasks(sourceListId);
                                loadTasks(targetListId);
                                
                                showNotification('Task moved successfully', 'success');
                            }
                        })
                        .catch(error => {
                            console.error('Error moving task:', error);
                            showNotification('Failed to move task', 'error');
                            loadLists();
                        });
                    } else {
                        this.appendChild(draggedItem);
                    }
                });
            });
            
            setupTaskCardListeners();
        }
        
        applyContainerListeners();
        
        return applyContainerListeners;
    }
    
    function openModal(modal) {
        document.querySelectorAll(".modal-overlay").forEach(m => {
            m.style.display = "none";
        });
        
        modal.style.display = "flex";
        const firstInput = modal.querySelector("input");
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
    
    function closeModal(modal) {
        modal.style.display = "none";
    }
    
    function updateTaskCount(column) {
        const taskCount = column.querySelectorAll(".task-card").length;
        column.querySelector(".task-count").textContent = taskCount;
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            const openModals = document.querySelectorAll(".modal-overlay[style='display: flex;']");
            openModals.forEach(modal => closeModal(modal));
        }
        
        if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
            const addColumnModalVisible = addColumnModal.style.display === "flex";
            const addTaskModalVisible = addTaskModal.style.display === "flex";
            const editTaskModalVisible = editTaskModal.style.display === "flex";
            
            if (addColumnModalVisible && document.activeElement.id === "columnName") {
                document.querySelector(".save-column-btn").click();
            } else if (addTaskModalVisible && document.activeElement.id === "taskTitle") {
                document.querySelector(".save-task-btn").click();
            } else if (editTaskModalVisible && document.activeElement.id === "editTaskTitle") {
                document.querySelector(".update-task-btn").click();
            }
        }
    });
    
    reapplyDragAndDrop = enableDragAndDrop();
    setupTaskCardListeners();
});

    document.querySelector('.dropdown-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('userDropdown').classList.toggle('show');
    });

    window.addEventListener('click', function(event) {
        if (!event.target.matches('.dropdown-btn') && !event.target.matches('.dropdown-btn img')) {
            var dropdowns = document.getElementsByClassName('dropdown-content');
            for (var i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    });

    function openAddUserModal() {
        document.getElementById('addUserModal').style.display = 'flex';
        document.getElementById('userDropdown').classList.remove('show');
    }

    function openUserListModal() {
        document.getElementById('userListModal').style.display = 'flex';
        document.getElementById('userDropdown').classList.remove('show');
    }

    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    window.addEventListener('click', function(event) {
        let addUserModal = document.getElementById('addUserModal');
        let userListModal = document.getElementById('userListModal');
        
        if (event.target == addUserModal) {
            addUserModal.style.display = 'none';
        }
        
        if (event.target == userListModal) {
            userListModal.style.display = 'none';
        }
    });

    function addUserToBoard(event) {
        event.preventDefault();
        
        const username = document.getElementById('newUsername').value.trim();
        const boardId = new URLSearchParams(window.location.search).get('id_board') || 1;
        
        if (!username) {
            showNotification('Please enter a username', 'warning');
            return;
        }
        
        fetch('/tasks/add_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                board_id: boardId,
                username: username
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                document.getElementById('newUsername').value = '';
                closeModal('addUserModal');
                
                if (document.getElementById('userListModal').style.display === 'block') {
                    loadBoardUsers();
                }
            } else {
                showNotification(data.error || 'Failed to add user', 'error');
            }
        })
        .catch(error => {
            console.error('Error adding user:', error);
            showNotification('Failed to add user to board', 'error');
        });
    }

    function removeUserFromBoard(userId) {
        if (!confirm('Are you sure you want to remove this user from the board?')) {
            return;
        }
        
        const boardId = new URLSearchParams(window.location.search).get('id_board') || 1;
        
        fetch('/tasks/remove_user', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                board_id: boardId,
                user_id: userId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                loadBoardUsers();
            } else {
                showNotification(data.error || 'Failed to remove user', 'error');
            }
        })
        .catch(error => {
            console.error('Error removing user:', error);
            showNotification('Failed to remove user from board', 'error');
        });
    }

    function loadBoardUsers() {
        const boardId = new URLSearchParams(window.location.search).get('id_board') || 1;
        const userListContainer = document.getElementById('userListContainer');
        
        userListContainer.innerHTML = '<p>Loading users...</p>';
        
        fetch(`/boards/${boardId}/users`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load users');
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.users) {
                    userListContainer.innerHTML = '';
                    
                    if (data.users.length === 0) {
                        userListContainer.innerHTML = '<p>No other users have access to this board.</p>';
                        return;
                    }
                    
                    const table = document.createElement('table');
                    table.className = 'user-table';
                    table.innerHTML = `
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    `;
                    
                    const tbody = table.querySelector('tbody');
                    
                    data.users.forEach(user => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${user.username}</td>
                            <td>${user.email || 'N/A'}</td>
                            <td>
                                <button class="btn btn-danger btn-sm" onclick="removeUserFromBoard(${user.id})">Remove</button>
                            </td>
                        `;
                        tbody.appendChild(row);
                    });
                    
                    userListContainer.appendChild(table);
                } else {
                    userListContainer.innerHTML = '<p>Failed to load users.</p>';
                }
            })
            .catch(error => {
                console.error('Error loading board users:', error);
                userListContainer.innerHTML = '<p>Error loading users. Please try again.</p>';
            });
    }

    document.addEventListener("DOMContentLoaded", function() {
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', addUserToBoard);
        }
        
        const userListModal = document.getElementById('userListModal');
        if (userListModal) {
            const originalOpenUserListModal = window.openUserListModal;
            window.openUserListModal = function() {
                originalOpenUserListModal();
                loadBoardUsers();
            };
        }
    });