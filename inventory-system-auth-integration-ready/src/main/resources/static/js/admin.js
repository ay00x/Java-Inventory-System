const { useEffect, useState } = React;

function AdminPage() {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ username: "", password: "", role: "PRODUCT_MANAGER" });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [savingUser, setSavingUser] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);

    const token = localStorage.getItem("jwtToken");
    const username = parseJwtUsername(token);

    const fetchUsers = async () => {
        if (!token) {
            setLoadingUsers(false);
            setError("No token found. Log in from the main page first.");
            return;
        }

        setLoadingUsers(true);
        setError("");

        try {
            const response = await fetch("/api/users", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                setError(response.status === 403
                    ? "This token cannot access the admin routes."
                    : "Could not load users.");
                setUsers([]);
                return;
            }

            const data = await response.json();
            setUsers(data);
        } catch (fetchError) {
            setError("Could not reach the server.");
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleCreateUser = async (event) => {
        event.preventDefault();
        if (!token) {
            setError("No token found. Log in first.");
            return;
        }

        setSavingUser(true);
        setError("");
        setMessage("");

        try {
            const url = editingUserId ? `/api/users/${editingUserId}` : "/api/users";
            const method = editingUserId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Could not create user.");
                return;
            }

            setMessage(
                editingUserId
                    ? `Updated ${data.username} successfully.`
                    : `Created ${data.username} successfully.`
            );
            setForm({ username: "", password: "", role: "PRODUCT_MANAGER" });
            setEditingUserId(null);
            fetchUsers();
        } catch (fetchError) {
            setError("Could not reach the server.");
        } finally {
            setSavingUser(false);
        }
    };

    const handleEditClick = (user) => {
        setEditingUserId(user.id);
        setForm({
            username: user.username,
            password: "",
            role: user.role
        });
        setError("");
        setMessage(`Editing ${user.username}. Leave password blank to keep the current one.`);
    };

    const handleDeleteClick = async (user) => {
        if (!token) {
            setError("No token found. Log in first.");
            return;
        }

        const confirmed = window.confirm(`Delete ${user.username}?`);
        if (!confirmed) {
            return;
        }

        setError("");
        setMessage("");

        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                setError("Could not delete user.");
                return;
            }

            if (editingUserId === user.id) {
                setForm({ username: "", password: "", role: "PRODUCT_MANAGER" });
                setEditingUserId(null);
            }

            setMessage(`Deleted ${user.username} successfully.`);
            fetchUsers();
        } catch (fetchError) {
            setError("Could not reach the server.");
        }
    };

    const cancelEdit = () => {
        setEditingUserId(null);
        setForm({ username: "", password: "", role: "PRODUCT_MANAGER" });
        setError("");
        setMessage("");
    };

    const handleLogout = (event) => {
        if (event) {
            event.preventDefault();
        }

        localStorage.removeItem("jwtToken");
        window.location.href = "/";
    };

    return (
        <>
            <div className="w3-bar w3-top w3-black w3-large" style={{ zIndex: 4 }}>
                <button className="w3-bar-item w3-button w3-hide-large" onClick={w3Open}>
                    <i className="fa fa-bars"></i>&nbsp; Menu
                </button>
                <span className="w3-bar-item admin-top-right admin-brand">Inventory Admin</span>
            </div>

            <nav className="w3-sidebar w3-collapse w3-white w3-animate-left" style={{ zIndex: 3, width: "300px" }} id="mySidebar">
                <br />
                <div className="w3-container w3-row">
                    <div className="w3-col s4">
                        <div className="w3-circle w3-blue w3-center" style={{ width: "46px", height: "46px", lineHeight: "46px" }}>
                            <i className="fa fa-user"></i>
                        </div>
                    </div>
                    <div className="w3-col s8 w3-bar">
                        <span>Welcome, <strong>{username || "Admin"}</strong></span><br />
                        <span className="w3-text-grey">Role: ADMIN</span>
                    </div>
                </div>
                <hr />
                <div className="w3-container">
                    <h5>Dashboard</h5>
                </div>
                <div className="w3-bar-block">
                    <a href="#" className="w3-bar-item w3-button w3-padding-16 w3-hide-large w3-dark-grey" onClick={w3Close}>
                        <i className="fa fa-remove fa-fw"></i>&nbsp; Close Menu
                    </a>
                    <a href="/admin.html" className="w3-bar-item w3-button w3-padding w3-blue"><i className="fa fa-users fa-fw"></i>&nbsp; User Management</a>
                    <a href="/" className="w3-bar-item w3-button w3-padding"><i className="fa fa-sign-in fa-fw"></i>&nbsp; Login Page</a>
                    <a href="#" className="w3-bar-item w3-button w3-padding" onClick={refreshPage}><i className="fa fa-refresh fa-fw"></i>&nbsp; Refresh Data</a>
                    <a href="#" className="w3-bar-item w3-button w3-padding" onClick={handleLogout}><i className="fa fa-sign-out fa-fw"></i>&nbsp; Log Out</a>
                    <br /><br />
                </div>
            </nav>

            <div className="w3-overlay w3-hide-large w3-animate-opacity" onClick={w3Close} style={{ cursor: "pointer" }} id="myOverlay"></div>

            <div className="w3-main admin-main">
                <header className="w3-container" style={{ paddingTop: "22px" }}>
                    <h5><b><i className="fa fa-dashboard"></i> Admin Dashboard</b></h5>
                </header>

                <div className="w3-row-padding w3-margin-bottom">
                    <div className="w3-third">
                        <div className="w3-container w3-blue w3-padding-16">
                            <div className="w3-left"><i className="fa fa-users w3-xxxlarge"></i></div>
                            <div className="w3-right"><h3 className="stats-value">{users.length}</h3></div>
                            <div className="w3-clear"></div>
                            <h4 className="stats-label">Users</h4>
                        </div>
                    </div>
                    <div className="w3-third">
                        <div className="w3-container w3-teal w3-padding-16">
                            <div className="w3-left"><i className="fa fa-lock w3-xxxlarge"></i></div>
                            <div className="w3-right"><h3 className="stats-value">{token ? "JWT" : "--"}</h3></div>
                            <div className="w3-clear"></div>
                            <h4 className="stats-label">Session</h4>
                        </div>
                    </div>
                    <div className="w3-third">
                        <div className="w3-container w3-orange w3-text-white w3-padding-16">
                            <div className="w3-left"><i className="fa fa-shield w3-xxxlarge"></i></div>
                            <div className="w3-right"><h3 className="stats-value">ADMIN</h3></div>
                            <div className="w3-clear"></div>
                            <h4 className="stats-label">Access</h4>
                        </div>
                    </div>
                </div>

                <div className="w3-row-padding">
                    <div className="w3-half">
                        <div className="w3-container w3-white w3-padding w3-card">
                            <h5>{editingUserId ? "Edit User" : "Create User"}</h5>
                            <form onSubmit={handleCreateUser}>
                                <div className="form-row">
                                    <label>Username</label>
                                    <input
                                        className="w3-input w3-border"
                                        name="username"
                                        value={form.username}
                                        onChange={handleChange}
                                        placeholder="new_manager"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <label>Password {editingUserId ? "(leave blank to keep current password)" : ""}</label>
                                    <input
                                        className="w3-input w3-border"
                                        name="password"
                                        type="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="password123"
                                        required={!editingUserId}
                                    />
                                </div>

                                <div className="form-row">
                                    <label>Role</label>
                                    <select className="w3-select w3-border" name="role" value={form.role} onChange={handleChange}>
                                        <option value="PRODUCT_MANAGER">PRODUCT_MANAGER</option>
                                        <option value="INVENTORY_MANAGER">INVENTORY_MANAGER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>

                                <div className="action-buttons">
                                    <button className="w3-button w3-blue" type="submit" disabled={savingUser}>
                                        <i className={`fa ${editingUserId ? "fa-save" : "fa-plus"}`}></i>&nbsp;
                                        {savingUser ? (editingUserId ? "Saving..." : "Creating...") : (editingUserId ? "Save Changes" : "Create User")}
                                    </button>

                                    {editingUserId && (
                                        <button className="w3-button w3-light-grey" type="button" onClick={cancelEdit}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>

                            {error && <div className="w3-panel w3-pale-red w3-leftbar w3-border-red message-box">{error}</div>}
                            {message && <div className="w3-panel w3-pale-green w3-leftbar w3-border-green message-box">{message}</div>}
                        </div>
                    </div>

                    <div className="w3-half">
                        <div className="w3-container w3-white w3-padding w3-card">
                            <h5>Current Users</h5>
                            {loadingUsers ? (
                                <p>Loading users...</p>
                            ) : users.length === 0 ? (
                                <p>No users to display.</p>
                            ) : (
                                <table className="w3-table w3-striped w3-bordered">
                                    <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{user.username}</td>
                                            <td>{user.role}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="w3-button w3-small w3-blue" onClick={() => handleEditClick(user)}>
                                                        Edit
                                                    </button>
                                                    <button className="w3-button w3-small w3-red" onClick={() => handleDeleteClick(user)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                            <p className="table-note">Admin users can create, edit, and delete users from this page.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function parseJwtUsername(token) {
    if (!token) {
        return "";
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub || "";
    } catch (error) {
        return "";
    }
}

function w3Open() {
    const sidebar = document.getElementById("mySidebar");
    const overlay = document.getElementById("myOverlay");

    if (sidebar) {
        sidebar.style.display = "block";
    }

    if (overlay) {
        overlay.style.display = "block";
    }
}

function w3Close(event) {
    if (event) {
        event.preventDefault();
    }

    const sidebar = document.getElementById("mySidebar");
    const overlay = document.getElementById("myOverlay");

    if (sidebar) {
        sidebar.style.display = "none";
    }

    if (overlay) {
        overlay.style.display = "none";
    }
}

function refreshPage(event) {
    event.preventDefault();
    window.location.reload();
}

ReactDOM.createRoot(document.getElementById("root")).render(<AdminPage />);
