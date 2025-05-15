import React, { useState, useEffect } from 'react';
import './UserManagementPage.css'; // Import file CSS tương ứng
// Font Awesome icons imports (nếu dùng component) không cần thiết nếu không dùng các nút export/add
// import { FaTrashCan } from 'react-icons/fa6'; // Icon TrashCan vẫn cần cho nút xóa
// Đảm bảo Font Awesome CSS global vẫn được link

// Import component Pagination
import Pagination from '../../components/Pagination/Pagination'; // Điều chỉnh đường dẫn nếu cấu trúc khác

// Component quản lý User
function UserManagementPage() {
    // State cho danh sách users
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Số user trên mỗi trang (tùy chỉnh)
    const [totalUsers, setTotalUsers] = useState(0); // Tổng số user (từ API)

    // Hàm fetch data user từ API (giữ nguyên logic phân trang)
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // TODO: Thay thế bằng API call thực tế
                // const response = await fetch(`/api/users/?page=${currentPage}&limit=${itemsPerPage}`);
                // if (!response.ok) { ... }
                // const data = await response.json();
                // setUsers(data.results);
                // setTotalUsers(data.count);

                // --- Mã tạm thời để test giao diện ---
                const sampleUsers = [
                    { id: 1, name: 'Nguyễn Văn An', avatar_url: '/creator-ava.png', date_created: '2020-07-15', last_login: '2023-10-27 09:30', status: 'active' },
                    { id: 2, name: 'Trần Thị Bình', avatar_url: '/creator-ava.png', date_created: '2020-09-23', last_login: '2024-01-10 14:00', status: 'active' },
                    { id: 3, name: 'Lê Văn Cường', avatar_url: '/creator-ava.png', date_created: '2020-12-05', last_login: '2023-05-01 11:20', status: 'suspended' },
                    { id: 4, name: 'Phạm Thanh Dung', avatar_url: '/creator-ava.png', date_created: '2021-02-18', last_login: '2024-03-15 16:45', status: 'active' },
                    { id: 5, name: 'Hoàng Minh Hiếu', avatar_url: '/creator-ava.png', date_created: '2021-05-24', last_login: null, status: 'inactive' },
                    { id: 6, name: 'Vũ Thị Giang', avatar_url: '/creator-ava.png', date_created: '2021-08-10', last_login: '2024-05-15 08:00', status: 'active' },
                     { id: 7, name: 'Nguyễn Thị Hoa', avatar_url: '/creator-ava.png', date_created: '2022-01-20', last_login: '2024-05-14 20:10', status: 'active' },
                     { id: 8, name: 'Trần Văn Khang', avatar_url: '/creator-ava.png', date_created: '2022-03-11', last_login: '2024-05-13 15:00', status: 'inactive' },
                     { id: 9, name: 'Lê Thị Mai', avatar_url: '/creator-ava.png', date_created: '2022-06-01', last_login: '2024-05-12 10:00', status: 'active' },
                     { id: 10, name: 'Phạm Văn Nam', avatar_url: '/creator-ava.png', date_created: '2022-08-22', last_login: '2024-05-11 09:00', status: 'active' },
                     { id: 11, name: 'Hoàng Thị Oanh', avatar_url: '/creator-ava.png', date_created: '2023-01-05', last_login: null, status: 'inactive' },
                     { id: 12, name: 'Vũ Văn Phát', avatar_url: '/creator-ava.png', date_created: '2023-03-17', last_login: '2024-05-09 22:30', status: 'active' },
                ];

                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                setUsers(sampleUsers.slice(startIndex, endIndex));
                setTotalUsers(sampleUsers.length); // Tổng số user mẫu
                // --- Hết mã tạm thời ---

            } catch (err) {
                setError("Failed to fetch users.");
                console.error("Error fetching users:", err);
                setUsers([]);
                setTotalUsers(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
        // Dependency array: effect chạy lại khi currentPage hoặc itemsPerPage thay đổi
    }, [currentPage, itemsPerPage]);


    // Hàm xử lý chuyển trang (giữ nguyên)
    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= Math.ceil(totalUsers / itemsPerPage)) {
            setCurrentPage(pageNumber);
        }
    };

    // Hàm xử lý chuyển sang trang trước (giữ nguyên)
    const handlePreviousPage = () => {
        handlePageChange(currentPage - 1);
    };

    // Hàm xử lý chuyển sang trang kế tiếp (giữ nguyên)
    const handleNextPage = () => {
        handlePageChange(currentPage + 1);
    };


    // Bỏ các hàm handleExport và handleAddUser vì các nút đã bị xóa


    // Hàm xử lý click nút xóa user (giữ nguyên)
    const handleDeleteUser = (userId) => {
        console.log("Deleting user with ID:", userId);
        // TODO: Thêm xác nhận (modal/confirm dialog)
        // TODO: Gửi request xóa user đến backend API (DELETE)
        // Sau khi xóa thành công: fetch lại danh sách user
        alert(`Delete user ${userId} logic goes here.`); // Placeholder
        // fetchUsers(); // Fetch lại danh sách sau khi xóa
    };


    // Render nội dung bảng hoặc trạng thái loading/lỗi (giữ nguyên logic, cập nhật colSpan)
    const renderTableContent = () => {
        const columnCount = 5; // Đếm số cột trong header: #, Name, Date Created, Last Login, Action

        if (isLoading) {
            return (
                <tbody>
                    <tr>
                        <td colSpan={columnCount} style={{ textAlign: 'center' }}>Loading users...</td> {/* Sử dụng colSpan */}
                    </tr>
                </tbody>
            );
        }

        if (error) {
            return (
                <tbody>
                    <tr>
                        <td colSpan={columnCount} style={{ textAlign: 'center', color: 'red' }}>{error}</td> {/* Sử dụng colSpan */}
                    </tr>
                </tbody>
            );
        }

        if (users.length === 0) {
            return (
                <tbody>
                    <tr>
                        <td colSpan={columnCount} style={{ textAlign: 'center' }}>No users found.</td> {/* Sử dụng colSpan */}
                    </tr>
                </tbody>
            );
        }

        // Render từng hàng user nếu có data
        return (
            <tbody>
                {users.map((user, index) => (
                    <tr key={user.id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="user-info">
                            {/* Sử dụng src từ data user nếu có */}
                            <img src={user.avatar_url || '/creator-ava.png'} alt="User Avatar" className="user-avatar"/>
                            <span>{user.name}</span>
                        </td>
                        <td>{user.date_created}</td> {/* Ngày tạo */}
                        {/* Cột Last Login */}
                        <td>{user.last_login || 'N/A'}</td> {/* Last Login - Hiển thị N/A nếu null */}
                        <td className="action-buttons">
                            {/* Nút Delete */}
                            <button
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteUser(user.id)}
                            >
                                {/* Icon Font Awesome hoặc React Icons */}
                                {/* <FaTrashCan /> */} <i className="fa-solid fa-xmark"></i>
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        );
    };


    return (
        // Giữ lại class và ID
        <div className="page-content" id="Users">
            <div className="users-container">

                {/* users-header chỉ còn tiêu đề */}
                <div className="users-header">
                    <h2>User Management</h2>
                    {/* Bỏ div users-actions */}
                </div>

                <div className="users-table">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Date Created</th>
                                <th>Last Login</th> {/* Đã thay thế */}
                                <th>Action</th>
                            </tr>
                        </thead>
                        {/* Render nội dung bảng (loading, rỗng, lỗi, hoặc data) */}
                        {renderTableContent()}
                    </table>
                </div>

                {/* Component phân trang - chỉ hiển thị nếu có user */}
                {totalUsers > 0 && (
                    <Pagination
                        totalItems={totalUsers}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        onPreviousPage={handlePreviousPage}
                        onNextPage={handleNextPage}
                    />
                )}

            </div>
        </div>
    );
}

export default UserManagementPage;