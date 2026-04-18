const { useState } = React;

function parseJwtRole(token) {
    if (!token) {
        return "";
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.role || "";
    } catch (error) {
        return "";
    }
}

function getLandingPage(role) {
    if (role === "ADMIN") {
        return "/admin.html";
    }

    if (role === "INVENTORY_MANAGER") {
        return "/inventory.html";
    }

    if (role === "PRODUCT_MANAGER") {
        return "/product.html";
    }

    return "/";
}

function LoginPage() {
    const [form, setForm] = useState({ username: "", password: "" });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.message || "Login failed");
                return;
            }

            localStorage.setItem("jwtToken", data.token);
            const role = parseJwtRole(data.token);
            const landingPage = getLandingPage(role);
            const destinationName = role ? role.replace("_", " ").toLowerCase() : "home";

            setMessage(`Login successful. Redirecting to the ${destinationName} page...`);
            window.setTimeout(() => {
                window.location.href = landingPage;
            }, 700);
        } catch (fetchError) {
            setError("Could not reach the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-shell">
            <section className="login-aside">
                <div>
                    <div className="w3-tag w3-padding w3-blue w3-round-large">Inventory System</div>
                    <h1 className="login-title">Authentication Portal</h1>
                </div>

                <div className="login-meta">
                    <div className="login-card">
                        <h3>JWT Login</h3>
                        <p>Logs in through <strong>/api/login</strong> and stores the token in local storage.</p>
                    </div>
                    <div className="login-card">
                        <h3>Admin Dashboard</h3>
                        <p>After login, open the admin page to create users and view all protected user data.</p>
                    </div>
                </div>
            </section>

            <section className="login-panel">
                <div className="w3-card-4 w3-white login-box">
                    <div className="w3-container w3-black">
                        <h2><i className="fa fa-lock"></i> Login</h2>
                    </div>

                    <form className="w3-container w3-padding-24" onSubmit={handleSubmit}>
                        <div className="login-form-row">
                            <label>Username</label>
                            <div className="login-input-wrap">
                                <input
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    placeholder="admin"
                                    required
                                />
                            </div>
                        </div>

                        <div className="login-form-row">
                            <label>Password</label>
                            <div className="login-input-wrap">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="admin123"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword((current) => !current)}
                                    aria-label="Toggle password visibility"
                                >
                                    <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                            </div>
                        </div>

                        <button className="w3-button w3-blue w3-block w3-margin-top" type="submit" disabled={loading}>
                            {loading ? "Signing in..." : "Login"}
                        </button>

                        <p className="token-helper">
                            The token is stored in the browser and reused by the admin dashboard.
                        </p>

                        {error && <div className="w3-panel w3-pale-red w3-leftbar w3-border-red message-box">{error}</div>}
                        {message && <div className="w3-panel w3-pale-green w3-leftbar w3-border-green message-box">{message}</div>}
                    </form>
                </div>
            </section>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<LoginPage />);
