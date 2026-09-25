document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            return;
        }

        const user = {
            email: email,
            password: password
        };

        try {

            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });

            if (response.ok) {

                const loggedInUser = await response.json();

                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(loggedInUser)
                );

                // Directly open Home page
                window.location.href = "/index.html";

            } else {

                const message = await response.text();

                alert(message || "Invalid email or password.");
            }

        } catch (error) {

            console.error("Login error:", error);

            alert("Cannot connect to Spring Boot server.");
        }
    });
});