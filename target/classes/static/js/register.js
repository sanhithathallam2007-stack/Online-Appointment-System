document.addEventListener("DOMContentLoaded", function () {

    const registerForm = document.getElementById("registerForm");

    if (!registerForm) {
        return;
    }

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!name || !email || !password) {
            alert("Please fill in all fields.");
            return;
        }

        const user = {
            name: name,
            email: email,
            password: password
        };

        try {

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });

            if (response.ok) {

                window.location.href = "/login.html";

            } else {

                const message = await response.text();

                if (
                    response.status === 500 &&
                    message.includes("Duplicate entry")
                ) {
                    alert("This email is already registered. Please login.");
                } else {
                    alert("Registration failed. Please try again.");
                }
            }

        } catch (error) {

            console.error("Registration error:", error);

            alert("Cannot connect to Spring Boot server.");
        }
    });
});