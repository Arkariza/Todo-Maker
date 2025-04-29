document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("boardCount").textContent = "5";
    document.getElementById("taskCount").textContent = "23";
    document.getElementById("completedCount").textContent = "17";
    
    const modal = document.getElementById("editProfileModal");
    const editBtn = document.getElementById("editProfileBtn");
    const closeBtn = document.getElementById("closeModal");
    
    editBtn.addEventListener("click", function() {
        modal.classList.add("active");
        document.body.style.overflow = "hidden"; 
    });
    
    closeBtn.addEventListener("click", function() {
        modal.classList.remove("active");
        document.body.style.overflow = "auto"; 
    });
    
    modal.addEventListener("click", function(e) {
        if (e.target === modal) {
            modal.classList.remove("active");
            document.body.style.overflow = "auto";
        }
    });
    
    document.getElementById("resetBtn").addEventListener("click", function() {
        document.getElementById("profileForm").reset();
    });
    
    document.getElementById("profileForm").addEventListener("submit", function(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        
        if (newPassword && newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        alert("Profile updated successfully!");
        
        modal.classList.remove("active");
        document.body.style.overflow = "auto";
    });
});