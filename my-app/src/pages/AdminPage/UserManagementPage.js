import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import Pagination from '../../components/Pagination/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import './UserManagementPage.css';

function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalUsers, setTotalUsers] = useState(0);

    const fetchUsers = useCallback(async () => {
        const token = Cookies.get('access_token');
        console.log('Token:', token);
        if (!token) {
            setError("Authentication token not found. Please login.");
            setIsLoading(false);
            setUsers([]);
            setTotalUsers(0);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch(
                `http://localhost:8000/api/users/?page=${currentPage}&page_size=${itemsPerPage}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Failed to fetch users: ${errorData.detail || response.statusText}`);
            }

            const data = await response.json();
            console.log('API response:', data);

            const results = Array.isArray(data) ? data : (data.results || []);
            if (!Array.isArray(results)) {
                throw new Error('Invalid data format: Expected array of users');
            }

            const mappedUsers = results.map(user => ({
                id: user.id || '',
                name: user.username || 'Unknown',
                avatar_url: user.avatar || '/creator-ava.png',
                date_created: user.created_at || null,
                last_login: user.last_login || null,
                role: user.role || 'N/A',
            }));

            setUsers(mappedUsers);
            setTotalUsers(data.count !== undefined ? data.count : results.length);

        } catch (err) {
            console.error('Fetch users error:', err.message);
            setError(err.message);
            setUsers([]);
            setTotalUsers(0);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handlePageChange = (pageNumber) => {
        const lastPage = Math.ceil(totalUsers / itemsPerPage);
        if (pageNumber > 0 && pageNumber <= lastPage && pageNumber !== currentPage) {
            setCurrentPage(pageNumber);
        } else if (pageNumber > lastPage && lastPage >= 1) {
            setCurrentPage(lastPage);
        } else if (lastPage === 0 && pageNumber === 1) {
            setCurrentPage(1);
        }
    };

    const handleDeleteUser = async (userId) => {
        const token = Cookies.get('access_token');
        console.log('Delete token:', token);
        if (!token) {
            setError("Authentication token not found. Cannot delete user.");
            return;
        }

        if (!window.confirm(`Are you sure you want to delete user with ID ${userId}?`)) return;

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch(`http://localhost:8000/api/users/${userId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Failed to delete user: ${response.statusText}`);
            }

            setSuccessMessage(`User ${userId} deleted successfully.`);
            setTimeout(() => setSuccessMessage(null), 5000);

            const newTotalUsers = totalUsers - 1;
            const newLastPage = newTotalUsers > 0 ? Math.ceil(newTotalUsers / itemsPerPage) : 1;
            const targetPage = currentPage > newLastPage ? newLastPage : currentPage;

            if (newTotalUsers <= 0) {
                setCurrentPage(1);
                setUsers([]);
                setTotalUsers(0);
            } else {
                if (targetPage === currentPage) {
                    fetchUsers();
                } else {
                    setCurrentPage(targetPage);
                }
                setTotalUsers(newTotalUsers);
            }

        } catch (err) {
            console.error('Delete user error:', err.message);
            setError(err.message);
            setTimeout(() => setError(null), 10000);
        } finally {
            setIsLoading(false);
        }
    };

    const renderTableContent = () => {
        const columnCount = 7; // Bao gồm cột Avatar

        if (isLoading) {
            return (
                <tbody>
                    <tr>
                        <td colSpan={columnCount} className="text-center">Loading users...</td>
                    </tr>
                </tbody>
            );
        }

        if (error && users.length === 0) {
            return (
                <tbody>
                    <tr>
                        <td colSpan={columnCount} className="text-center text-error">{error}</td>
                    </tr>
                </tbody>
            );
        }

        if (users.length === 0 && !error) {
            return (
                <tbody>
                    <tr>
                        <td colSpan={columnCount} className="text-center">No users found.</td>
                    </tr>
                </tbody>
            );
        }

        return (
            <tbody>
                {users.map((user, index) => (
                    <tr key={user.id || index}>
                        {[
                            <td key="index">{(currentPage - 1) * itemsPerPage + index + 1}</td>,
                            <td key="avatar" className="avatar-cell"><img src={user.avatar_url} alt="User Avatar" className="user-avatar-sm" /></td>,
                            <td key="name" className="user-info-cell"><span>{user.name}</span></td>,
                            <td key="date-created">{user.date_created ? new Date(user.date_created).toLocaleDateString() : 'N/A'}</td>,
                            <td key="last-login">{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</td>,
                            <td key="role" className="text-center">{user.role}</td>,
                            <td key="action" className="action-buttons">
                                <button
                                    className="action-button delete-btn"
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={isLoading}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </td>,
                        ]}
                    </tr>
                ))}
            </tbody>
        );
    };

    return (
        <div className="page-content" id="Users">
            <div className="users-container">
                <div className="page-header">
                    <h2>User Management</h2>
                </div>

                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <div className="users-table">
                    {totalUsers > 0 && (
                        <p className="total-users-info">
                            Showing {(currentPage - 1) * itemsPerPage + 1} -{' '}
                            {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} entries
                        </p>
                    )}
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Avatar</th>
                                <th>Name</th>
                                <th>Date Created</th>
                                <th>Last Login</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        {renderTableContent()}
                    </table>
                </div>

                {totalUsers > 0 && (
                    <Pagination
                        totalItems={totalUsers}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
}

export default UserManagementPage;