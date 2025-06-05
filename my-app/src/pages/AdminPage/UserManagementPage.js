import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../components/Pagination/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import './UserManagementPage.css';
import { useAuth } from '../../context/AuthContext';

// Function to decode HTML entities
const decodeHtmlEntities = (str) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
};

function UserManagementPage({ currentLang = 'vi' }) {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalUsers, setTotalUsers] = useState(0);

    const { getToken, logout } = useAuth();
    const navigate = useNavigate();
    const token = getToken();

    // Initial translations memoized
    const initialTranslations = useMemo(() => ({
        noAuthToken: "Không tìm thấy mã xác thực. Vui lòng đăng nhập.",
        fetchUsersError: "Không thể lấy danh sách người dùng",
        invalidDataFormat: "Định dạng dữ liệu không hợp lệ: Cần một mảng người dùng",
        loadingUsers: "Đang tải người dùng...",
        noUsersFound: "Không tìm thấy người dùng nào.",
        confirmDelete: "Bạn có chắc chắn muốn xóa người dùng có ID {userId} không?",
        deleteUserError: "Không thể xóa người dùng",
        deleteSuccess: "Người dùng {userId} đã được xóa thành công.",
        pageHeader: "Quản lý người dùng",
        showingEntries: "Hiển thị {start} - {end} trên tổng số {total} mục",
        tableNo: "No",
        tableAvatar: "Avatar",
        tableUsername: "Username",
        tableDateCreated: "Ngày tạo",
        tableLastLogin: "Đăng nhập cuối",
        tableRole: "Vai trò",
        tableActions: "Thao tác",
        notAvailable: "N/A",
        never: "Chưa bao giờ",
    }), []);

    const [translations, setTranslations] = useState(initialTranslations);

    // Translation function
    const translateText = useCallback(async (texts, targetLang) => {
        try {
            const response = await fetch('http://localhost:8000/api/translate/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: texts, target_lang: targetLang }),
            });
            if (!response.ok) throw new Error(await response.text());
            const data = await response.json();
            return data.translated || texts;
        } catch (error) {
            console.error('Lỗi dịch:', error);
            return texts;
        }
    }, []);

    // Effect for handling translations
    useEffect(() => {
        const translateContent = async () => {
            if (currentLang === 'vi') {
                setTranslations(initialTranslations);
                return;
            }
            const textsToTranslate = Object.values(initialTranslations);
            const translatedTexts = await translateText(textsToTranslate, currentLang);
            const updatedTranslations = {};
            Object.keys(initialTranslations).forEach((key, index) => {
                updatedTranslations[key] = decodeHtmlEntities(translatedTexts[index] || initialTranslations[key]);
            });
            setTranslations(updatedTranslations);
        };
        translateContent();
    }, [currentLang, initialTranslations, translateText]);

    const checkTokenExpiration = useCallback(() => {
        if (!token) return false;
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            const exp = decoded.exp;
            const now = Date.now() / 1000;
            if (exp && exp < now) {
                setError(translations.noAuthToken); 
                setTimeout(() => {
                    logout();
                    navigate('/'); 
                }, 2000);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Lỗi khi kiểm tra token:', error);
            setError(translations.noAuthToken);
            setTimeout(() => {
                logout();
                navigate('/');
            }, 2000);
            return false;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, logout, translations.noAuthToken]);


    const fetchUsers = useCallback(async () => {
        if (!token) {
            setError(translations.noAuthToken);
            setIsLoading(false);
            setUsers([]);
            setTotalUsers(0);
            return;
        }

        if (!checkTokenExpiration()) return;

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
                throw new Error(`${translations.fetchUsersError}: ${errorData.detail || response.statusText}`);
            }

            const data = await response.json();
            console.log('Phản hồi API:', data);

            const results = Array.isArray(data) ? data : (data.results || []);
            if (!Array.isArray(results)) {
                throw new Error(translations.invalidDataFormat);
            }

            const mappedUsers = results.map(user => ({
                id: user.id || '',
                name: user.username || translations.notAvailable,
                avatar_url: user.avatar || '/creator-ava.png',
                date_created: user.created_at || null,
                last_login: user.last_login || null,
                role: user.role || translations.notAvailable,
            }));

            setUsers(mappedUsers);
            setTotalUsers(data.count !== undefined ? data.count : results.length);

        } catch (err) {
            console.error('Lỗi khi tải người dùng:', err.message);
            setError(err.message);
            setUsers([]);
            setTotalUsers(0);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, itemsPerPage, token, checkTokenExpiration, translations]);

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
        if (!token) {
            setError(translations.noAuthToken);
            return;
        }

        if (!checkTokenExpiration()) return;

        if (!window.confirm(translations.confirmDelete.replace('{userId}', userId))) return;

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
                throw new Error(errorData.detail || `${translations.deleteUserError}: ${response.statusText}`);
            }

            setSuccessMessage(translations.deleteSuccess.replace('{userId}', userId));
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
            console.error('Lỗi khi xóa người dùng:', err.message);
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
                        <td colSpan={columnCount} className="text-center">{translations.loadingUsers}</td>
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
                        <td colSpan={columnCount} className="text-center">{translations.noUsersFound}</td>
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
                            <td key="avatar" className="avatar-cell"><img src={user.avatar_url} alt="Ảnh đại diện người dùng" className="user-avatar-sm" /></td>,
                            <td key="name" className="user-info-cell"><span>{user.name}</span></td>,
                            <td key="date-created">{user.date_created ? new Date(user.date_created).toLocaleDateString('vi-VN') : translations.notAvailable}</td>,
                            <td key="last-login">{user.last_login ? new Date(user.last_login).toLocaleString('vi-VN') : translations.never}</td>,
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
                    <h2>{translations.pageHeader}</h2>
                </div>

                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <div className="users-table">
                    {totalUsers > 0 && (
                        <p className="total-users-info">
                            {translations.showingEntries
                                .replace('{start}', (currentPage - 1) * itemsPerPage + 1)
                                .replace('{end}', Math.min(currentPage * itemsPerPage, totalUsers))
                                .replace('{total}', totalUsers)}
                        </p>
                    )}
                    <table className="table">
                        <thead>
                            <tr>
                                <th>{translations.tableNo}</th>
                                <th>{translations.tableAvatar}</th>
                                <th>{translations.tableUsername}</th>
                                <th>{translations.tableDateCreated}</th>
                                <th>{translations.tableLastLogin}</th>
                                <th>{translations.tableRole}</th>
                                <th>{translations.tableActions}</th>
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