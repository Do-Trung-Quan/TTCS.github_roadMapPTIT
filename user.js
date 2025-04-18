//  JavaScript để xử lý chuyển đổi giữa các trang
document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.menu-item');
    const pages = document.querySelectorAll('.page-content');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Xóa active class khỏi tất cả menu items
            menuItems.forEach(mi => mi.classList.remove('active'));
            
            // Thêm active class vào menu item được click
            this.classList.add('active');
            
            // Ẩn tất cả các trang
            pages.forEach(page => page.classList.add('hidden'));
            
            // Hiển thị trang tương ứng
            const targetPage = document.getElementById(this.getAttribute('data-page'));
            targetPage.classList.remove('hidden');
        });
    });
});

// Visibility dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
  const dropdownBtn = document.getElementById('visibility-dropdown-btn');
  const dropdown = document.getElementById('visibility-dropdown');
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  
  // Toggle dropdown when button is clicked
  dropdownBtn.addEventListener('click', function() {
    dropdown.classList.toggle('show');
  });
  
  // Close dropdown when clicking outside
  window.addEventListener('click', function(event) {
    if (!event.target.closest('.visibility-selector')) {
      dropdown.classList.remove('show');
    }
  });
  
  // Handle dropdown item selection
  dropdownItems.forEach(item => {
    item.addEventListener('click', function() {
      const value = this.getAttribute('data-value');
      const icon = value === 'public' ? '<i class="fa-solid fa-globe"></i>' : '<i class="fa-solid fa-lock"></i>';
      const text = value === 'public' ? 'Public' : 'Private';
      
      dropdownBtn.innerHTML = `${icon} ${text} <i class="fa-solid fa-caret-down"></i>`;
      dropdown.classList.remove('show');
    });
  });
});

// Profile picture upload functionality
document.addEventListener('DOMContentLoaded', function() { 
  const editPicBtn = document.getElementById('edit-profile-pic');
  const fileInput = document.getElementById('profile-pic-upload');
  const profileImage = document.getElementById('profile-image');
  
  editPicBtn.addEventListener('click', function() {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        profileImage.src = e.target.result;
      };
      
      reader.readAsDataURL(this.files[0]);
    }
  });
});


document.addEventListener('DOMContentLoaded', function() {
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const updateButton = document.getElementById('update-password-btn');
  
  // Kiểm tra trạng thái input khi người dùng nhập
  function checkPasswordInputs() {
    if (newPasswordInput.value.trim() !== '' && confirmPasswordInput.value.trim() !== '') {
      updateButton.classList.add('active');
    } else {
      updateButton.classList.remove('active');
    }
  }
  
  // Gắn sự kiện input cho cả hai ô password
  newPasswordInput.addEventListener('input', checkPasswordInputs);
  confirmPasswordInput.addEventListener('input', checkPasswordInputs);
});


/*------------------------------------------------------------------------------------------------

                                   ADMIN'S USER MANAGEMENT JS

--------------------------------------------------------------------------------------------------*/

// JavaScript for User Management page
document.addEventListener('DOMContentLoaded', function() {
  // Combine existing users from HTML with additional users
  const existingUsers = Array.from(document.querySelectorAll('.table tbody tr')).map((row, index) => {
    return {
      id: index + 1,
      name: row.querySelector('.user-info span').innerText,
      created: row.querySelectorAll('td')[2].innerText,
      status: row.querySelector('.status-badge').classList.contains('active') ? 'active' : 
              row.querySelector('.status-badge').classList.contains('inactive') ? 'inactive' : 'suspended'
    };
  });

  // Additional users data
  const additionalUsers = [
    { id: 7, name: 'Đinh Công Huy', created: '03/11/2021', status: 'active' },
    { id: 8, name: 'Lý Thị Khánh', created: '27/01/2022', status: 'active' },
    { id: 9, name: 'Ngô Văn Linh', created: '14/03/2022', status: 'inactive' },
    { id: 10, name: 'Mai Thị Mỹ', created: '30/05/2022', status: 'active' },
    { id: 11, name: 'Phan Văn Nam', created: '12/08/2022', status: 'suspended' },
    { id: 12, name: 'Đỗ Thị Oanh', created: '25/10/2022', status: 'active' },
    { id: 13, name: 'Bùi Quang Phú', created: '09/01/2023', status: 'active' },
    { id: 14, name: 'Dương Thị Quỳnh', created: '22/03/2023', status: 'inactive' },
    { id: 15, name: 'Tạ Văn Sơn', created: '15/06/2023', status: 'active' },
    { id: 16, name: 'Hoàng Thị Thảo', created: '28/08/2023', status: 'active' },
    { id: 17, name: 'Cao Văn Uy', created: '04/10/2023', status: 'suspended' },
    { id: 18, name: 'Lương Viết Xuân', created: '19/12/2023', status: 'active' },
  ];
  
  // Combine all users
  const allUsers = [...existingUsers, ...additionalUsers];
  
  // Pagination settings
  const usersPerPage = 6;
  const totalUsers = allUsers.length;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  let currentPage = 1;
  
  // Initialize pagination
  renderPagination();
  renderUserTable(currentPage);
  updatePaginationInfo();
  
  // Function to render pagination controls
  function renderPagination() {
    const paginationControls = document.querySelector('.pagination-controls');
    paginationControls.innerHTML = '';
    
    // Add Previous button (only if not on first page)
    if (currentPage > 1) {
      const prevBtn = createPaginationButton('Previous', () => {
        currentPage--;
        renderUserTable(currentPage);
        renderPagination();
        updatePaginationInfo();
      });
      paginationControls.appendChild(prevBtn);
    }
    
    // Generate page number buttons based on total pages
    if (totalPages <= 5) {
      // If 5 or fewer pages, show all page numbers
      for (let i = 1; i <= totalPages; i++) {
        const pageBtn = createPaginationButton(i.toString(), () => {
          currentPage = i;
          renderUserTable(currentPage);
          renderPagination();
          updatePaginationInfo();
        }, i === currentPage);
        paginationControls.appendChild(pageBtn);
      }
    } else {
      // If more than 5 pages, show special pattern
      // Always show first page
      paginationControls.appendChild(createPaginationButton('1', () => {
        currentPage = 1;
        renderUserTable(currentPage);
        renderPagination();
        updatePaginationInfo();
      }, currentPage === 1));
      
      // Show second page or ellipsis
      if (currentPage <= 3) {
        paginationControls.appendChild(createPaginationButton('2', () => {
          currentPage = 2;
          renderUserTable(currentPage);
          renderPagination();
          updatePaginationInfo();
        }, currentPage === 2));
      } else {
        paginationControls.appendChild(createPaginationButton('...', null, false));
      }
      
      // Show current page if it's not 1, 2, or last two pages
      if (currentPage > 2 && currentPage < totalPages - 1) {
        paginationControls.appendChild(createPaginationButton(currentPage.toString(), () => {
          // Current page button doesn't need action
        }, true));
      }
      
      // Show second-to-last page or ellipsis
      if (currentPage >= totalPages - 2) {
        paginationControls.appendChild(createPaginationButton((totalPages - 1).toString(), () => {
          currentPage = totalPages - 1;
          renderUserTable(currentPage);
          renderPagination();
          updatePaginationInfo();
        }, currentPage === totalPages - 1));
      } else {
        paginationControls.appendChild(createPaginationButton('...', null, false));
      }
      
      // Always show last page
      paginationControls.appendChild(createPaginationButton(totalPages.toString(), () => {
        currentPage = totalPages;
        renderUserTable(currentPage);
        renderPagination();
        updatePaginationInfo();
      }, currentPage === totalPages));
    }
    
    // Add Next button (only if not on last page)
    if (currentPage < totalPages) {
      const nextBtn = createPaginationButton('Next', () => {
        currentPage++;
        renderUserTable(currentPage);
        renderPagination();
        updatePaginationInfo();
      });
      paginationControls.appendChild(nextBtn);
    }
  }
  
  // Helper function to create pagination buttons
  function createPaginationButton(text, clickHandler, isActive = false) {
    const button = document.createElement('button');
    button.className = 'pagination-btn';
    button.textContent = text;
    
    if (isActive) {
      button.classList.add('active');
    }
    
    if (clickHandler && text !== '...') {
      button.addEventListener('click', clickHandler);
    }
    
    return button;
  }
  
  // Function to render user table based on current page
  function renderUserTable(page) {
    const tableBody = document.querySelector('.table tbody');
    tableBody.innerHTML = '';
    
    const startIndex = (page - 1) * usersPerPage;
    const endIndex = Math.min(startIndex + usersPerPage, totalUsers);
    const usersToShow = allUsers.slice(startIndex, endIndex);
    
    usersToShow.forEach(user => {
      const row = document.createElement('tr');
      
      // Column 1: ID
      const idCell = document.createElement('td');
      idCell.textContent = user.id;
      row.appendChild(idCell);
      
      // Column 2: User info (name and avatar)
      const userInfoCell = document.createElement('td');
      userInfoCell.className = 'user-info';
      
      const avatar = document.createElement('img');
      avatar.src = '/creator-ava.png';
      avatar.alt = 'User Avatar';
      avatar.className = 'user-avatar';
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = user.name;
      
      userInfoCell.appendChild(avatar);
      userInfoCell.appendChild(nameSpan);
      row.appendChild(userInfoCell);
      
      // Column 3: Date created
      const dateCell = document.createElement('td');
      dateCell.textContent = user.created;
      row.appendChild(dateCell);
      
      // Column 4: Status
      const statusCell = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = `status-badge ${user.status}`;
      statusBadge.textContent = capitalizeFirstLetter(user.status);
      statusCell.appendChild(statusBadge);
      row.appendChild(statusCell);
      
      // Column 5: Action buttons
      const actionCell = document.createElement('td');
      actionCell.className = 'action-buttons';
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'action-btn delete-btn';
      deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      deleteBtn.addEventListener('click', function() {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
          // Remove user from data array
          const userIndex = allUsers.findIndex(u => u.id === user.id);
          if (userIndex !== -1) {
            allUsers.splice(userIndex, 1);
            
            // Re-render the current page
            renderUserTable(currentPage);
            
            // Update pagination if needed
            const newTotalPages = Math.ceil(allUsers.length / usersPerPage);
            if (newTotalPages !== totalPages) {
              if (currentPage > newTotalPages) {
                currentPage = newTotalPages || 1;
              }
              renderPagination();
            }
            
            // Update pagination info
            updatePaginationInfo();
          }
        }
      });
      
      actionCell.appendChild(deleteBtn);
      row.appendChild(actionCell);
      
      tableBody.appendChild(row);
    });
  }
  
  // Function to update pagination info text
  function updatePaginationInfo() {
    const paginationInfo = document.querySelector('.pagination-info');
    const startItem = ((currentPage - 1) * usersPerPage) + 1;
    const endItem = Math.min(currentPage * usersPerPage, totalUsers);
    
    paginationInfo.innerHTML = `Showing <strong>${startItem}-${endItem}</strong> out of <strong>${totalUsers}</strong> entries`;
  }
  
  // Helper function to capitalize first letter
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
});