document.addEventListener("DOMContentLoaded", function () {
    const boardContainer = document.getElementById("boardContainer");
    const searchInput = document.getElementById("searchInput");
    const yourTodoBtn = document.getElementById("yourTodoBtn");
    const sharingTodoBtn = document.getElementById("sharingTodoBtn");
    const openAddBoardModalBtn = document.getElementById("openAddBoardModal");
    
    let currentView = "personal";
    
    createModals();

    yourTodoBtn.addEventListener("click", function() {
        yourTodoBtn.classList.add("active");
        sharingTodoBtn.classList.remove("active");
        currentView = "personal";
        fetchBoards();
    });

    sharingTodoBtn.addEventListener("click", function() {
        sharingTodoBtn.classList.add("active");
        yourTodoBtn.classList.remove("active");
        currentView = "shared";
        fetchSharedBoards();
    });
    
    searchInput.addEventListener("input", function() {
        const searchTerm = this.value.toLowerCase();
        const boards = document.querySelectorAll(".board");
        
        boards.forEach(board => {
            const boardText = board.querySelector(".board-text").textContent.toLowerCase();
            if (boardText.includes(searchTerm)) {
                board.style.display = "flex";
            } else {
                board.style.display = "none";
            }
        });
    });

    async function fetchBoards() {
        try {
            const response = await fetch("/board");
            if (!response.ok) throw new Error("Failed to fetch boards");
            const result = await response.json();
            const boards = result.data || result;
            
            displayBoards(boards, false);
        } catch (error) {
            console.error("Error fetching boards:", error);
            boardContainer.innerHTML = "<p class='empty-boards'>Failed to load boards. Please try again later.</p>";
        }
    }
    
    async function fetchSharedBoards() {
        try {
            const response = await fetch("/board/shared");
            if (!response.ok) throw new Error("Failed to fetch shared boards");
            const result = await response.json();
            
            console.log("Shared boards API response:", result);
            
            const boards = result.data || result;
            console.log("Boards to display:", boards);
            
            displayBoards(boards, true);
        } catch (error) {
            console.error("Error fetching shared boards:", error);
            boardContainer.innerHTML = "<p class='empty-boards'>Failed to load shared boards. Please try again later.</p>";
        }
    }
    
    function displayBoards(boards, isShared) {
        boardContainer.innerHTML = "";
        const boardDropdown = document.getElementById("boardDropdown");
        boardDropdown.innerHTML = '<li><a class="link_name" href="#">Boards</a></li>';
        
        if (boards.length === 0) {
            boardContainer.innerHTML = isShared ? 
                "<p class='empty-boards'>No boards shared with you yet.</p>" : 
                "<p class='empty-boards'>No boards yet. Create your first board!</p>";
            return;
        }
        
        boards.forEach(board => {
            addBoardToUI(
                board.id_board, 
                board.title, 
                board.created_at, 
                board.expire_in, 
                isShared, 
                board.ongoing_count || 0, 
                board.done_count || 0
            );
            
            if (!isShared) {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = `/task?id_board=${board.id_board}`;
                a.textContent = board.title;
                li.appendChild(a);
                boardDropdown.appendChild(li);
            }
        });
    }
    
    async function addBoard(title, expiryDate) {
        if (title.trim() === "") return;
    
        try {
            const response = await fetch("/add_board", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    title: title,
                    expire_in: expiryDate || null 
                })
            });
    
            if (!response.ok) throw new Error("Failed to add board");
    
            const result = await response.json();
            if (result.error) {
                console.error("Error:", result.error);
                return;
            }
    
            const boardData = result.data || {
                id_board: result.id_board,
                title: result.title,
                created_at: new Date().toISOString(),
                expire_in: result.expire_in || expiryDate 
            };
    
            if (currentView === "personal") {
                fetchBoards();
            }
            
            return true;
        } catch (error) {
            console.error("Fetch error:", error);
            showNotification("Failed to add board. Please try again.", "error");
            return false;
        }
    }

    async function deleteBoard(id) {
        try {
            const response = await fetch(`/delete_board/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete board");
            }
            
            closeModal('deleteModal');
            showNotification("Board deleted successfully", "success");
            
            if (currentView === "personal") {
                fetchBoards();
            } else {
                fetchSharedBoards();
            }
        } catch (error) {
            console.error("Error deleting board:", error);
            showNotification(error.message || "Failed to delete board. Please try again.", "error");
        }
    }

    async function updateBoard(id, newTitle) {
        try {
            const response = await fetch(`/update_board/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTitle })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update board");
            }
            
            closeModal('editModal');
            showNotification("Board updated successfully", "success");
            
            if (currentView === "personal") {
                fetchBoards();
            } else {
                fetchSharedBoards();
            }
            
            return true;
        } catch (error) {
            console.error("Error updating board:", error);
            showNotification(error.message || "Failed to update board. Please try again.", "error");
            return false;
        }
    }

    function formatDate(dateString) {
        if (!dateString) return "Just Now";
        
        const date = new Date(dateString);
        const now = new Date();
        
        if (isNaN(date.getTime())) return "Just Now";
        
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return "Just Now";
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
    }

    function formatExpiryDate(dateString) {
        if (!dateString) return "";
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        
        return date.toLocaleDateString();
    }

    function addBoardToUI(id, title, createdAt, expiryDate, isShared = false, ongoingCount = 0, doneCount = 0) {
        const boardDiv = document.createElement("div");
        boardDiv.classList.add("board");
        boardDiv.dataset.id = id;
        
        if (isShared) {
            boardDiv.classList.add("shared-board");
        }
        
        let sharedBadge = isShared ? '<span class="shared-badge">Shared</span>' : '';
        
        boardDiv.innerHTML = `
            <div class="board-header">
                <span class="board-text">${title}</span>
                ${sharedBadge}
                <div class="board-actions">
                    ${!isShared ? `
                        <button class="edit-board" title="Edit Board">✏️</button>
                        <button class="delete-board" title="Delete Board">X</button>
                    ` : ''}
                </div>
            </div>
            <div class="board-footer">
                <span class="board-date">${formatDate(createdAt)}</span>
                <div class="board-date">
                    <span class="ongoing" title="On-Going Tasks">On-Going: ${ongoingCount}</span>
                    <span class="done" title="Done Tasks">Done: ${doneCount}</span>
                </div>
            </div>
        `;
    
        boardDiv.querySelector(".board-text").addEventListener("click", function() {
            window.location.href = `/task?id_board=${id}`;
        });
    
        if (!isShared) {
            boardDiv.querySelector(".edit-board").addEventListener("click", function(e) {
                e.stopPropagation();
                
                const boardText = boardDiv.querySelector(".board-text").textContent;
                document.getElementById('editBoardTitle').value = boardText;
                document.getElementById('editBoardId').value = id;
                
                openModal('editModal');
            });
    
            boardDiv.querySelector(".delete-board").addEventListener("click", function(e) {
                e.stopPropagation();
                document.getElementById('deleteBoardId').value = id;
                document.getElementById('deleteBoardName').textContent = boardDiv.querySelector(".board-text").textContent;
                
                openModal('deleteModal');
            });
        }
    
        boardContainer.appendChild(boardDiv);
    }

    function createModals() {
        const addBoardModal = document.createElement('div');
        addBoardModal.id = 'addBoardModal';
        addBoardModal.className = 'modal';
        addBoardModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Create New Board</h2>
                    <span class="close-modal" data-modal="addBoardModal">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="addBoardForm">
                        <div class="form-group">
                            <label for="addBoardTitle">Board Title:</label>
                            <input type="text" id="addBoardTitle" placeholder="Enter board title" required>
                        </div>
                        <div class="form-group">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn cancel-btn" data-modal="addBoardModal">Cancel</button>
                            <button type="submit" class="btn save-btn">Create Board</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        const editModal = document.createElement('div');
        editModal.id = 'editModal';
        editModal.className = 'modal';
        editModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Board</h2>
                    <span class="close-modal" data-modal="editModal">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="editBoardForm">
                        <input type="hidden" id="editBoardId">
                        <div class="form-group">
                            <label for="editBoardTitle">Board Title:</label>
                            <input type="text" id="editBoardTitle" required>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn cancel-btn" data-modal="editModal">Cancel</button>
                            <button type="submit" class="btn save-btn">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        const deleteModal = document.createElement('div');
        deleteModal.id = 'deleteModal';
        deleteModal.className = 'modal';
        deleteModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Delete Board</h2>
                    <span class="close-modal" data-modal="deleteModal">&times;</span>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete the board "<span id="deleteBoardName"></span>"?</p>
                    <p class="warning">All tasks in this board will also be deleted.</p>
                    <input type="hidden" id="deleteBoardId">
                    <div class="form-actions">
                        <button type="button" class="btn cancel-btn" data-modal="deleteModal">Cancel</button>
                        <button type="button" class="btn delete-btn" id="confirmDeleteBtn">Delete</button>
                    </div>
                </div>
            </div>
        `;
        
        const notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        
        document.body.appendChild(addBoardModal);
        document.body.appendChild(editModal);
        document.body.appendChild(deleteModal);
        document.body.appendChild(notification);
        
        setupModalEventListeners();
    }

    function setupModalEventListeners() {
        openAddBoardModalBtn.addEventListener('click', function() {
            openModal('addBoardModal');
        });
        
        document.getElementById('addBoardForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const boardTitle = document.getElementById('addBoardTitle').value.trim();
            const expiryDate = document.getElementById('addBoardExpiry').value;
            
            if (boardTitle !== "") {
                const success = await addBoard(boardTitle, expiryDate);
                if (success) {
                    document.getElementById('addBoardTitle').value = "";
                    document.getElementById('addBoardExpiry').value = "";
                    closeModal('addBoardModal');
                    showNotification("Board created successfully", "success");
                }
            }
        });
        
        document.querySelectorAll('.close-modal, .cancel-btn').forEach(element => {
            element.addEventListener('click', function() {
                const modalId = this.getAttribute('data-modal');
                closeModal(modalId);
            });
        });
        
        window.addEventListener('click', function(event) {
            if (event.target.classList.contains('modal')) {
                closeModal(event.target.id);
            }
        });
        
        document.getElementById('editBoardForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('editBoardId').value;
            const newTitle = document.getElementById('editBoardTitle').value.trim();
            
            if (newTitle !== "") {
                updateBoard(id, newTitle);
            }
        });
        
        document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
            const id = document.getElementById('deleteBoardId').value;
            deleteBoard(id);
        });
    }

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            if (modalId === 'addBoardModal') {
                setTimeout(() => {
                    document.getElementById('addBoardTitle').focus();
                }, 100);
            } else if (modalId === 'editModal') {
                setTimeout(() => {
                    document.getElementById('editBoardTitle').focus();
                }, 100);
            }
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    fetchBoards();
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
sidebarBtn.addEventListener("click", ()=>{
  sidebar.classList.toggle("close");
});