function getJwtField(token, key) {
    if (!token) {
        return "";
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload[key] || "";
    } catch (error) {
        return "";
    }
}

function handleLogout(event) {
    if (event) {
        event.preventDefault();
    }

    localStorage.removeItem("jwtToken");
    window.location.href = "/";
}

function InventoryPage() {
    const token = localStorage.getItem("jwtToken");
    const username = getJwtField(token, "sub");
    const role = getJwtField(token, "role");
    const allowed = role === "INVENTORY_MANAGER" || role === "ADMIN";

    return (
        <div className="w3-container" style={{ maxWidth: "760px", margin: "64px auto" }}>
            <div className="w3-card w3-white w3-padding-large">
                <h2>Inventory Manager</h2>
                <p>Signed in as <strong>{username || "Unknown"}</strong>.</p>
                <p>Role: <strong>{role || "Unknown"}</strong></p>

                {allowed ? (
                    <div className="w3-panel w3-pale-blue w3-leftbar w3-border-blue">
                        This is a placeholder for the inventory manager section.
                    </div>
                ) : (
                    <div className="w3-panel w3-pale-red w3-leftbar w3-border-red">
                        This account does not have access to the inventory section.
                    </div>
                )}

                <div className="action-buttons">
                    <a className="w3-button w3-blue" href="/">Back to Login</a>
                    <a className="w3-button w3-light-grey" href="/admin.html">Admin</a>
                    <button className="w3-button w3-black" onClick={handleLogout}>Log Out</button>
                </div>
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<InventoryPage />);
