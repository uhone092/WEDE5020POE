

document.addEventListener("DOMContentLoaded", function () {
    const zoomableImages = document.querySelectorAll("img");
    const imageDialog = document.createElement("dialog");
    const imageDialogClose = document.createElement("button");
    const imageDialogPreview = document.createElement("img");

    imageDialog.className = "image-zoom-dialog";
    imageDialog.setAttribute("aria-label", "Image preview");
    imageDialogClose.className = "image-zoom-close";
    imageDialogClose.type = "button";
    imageDialogClose.textContent = "Close";
    imageDialogPreview.className = "image-zoom-preview";
    imageDialog.append(imageDialogClose, imageDialogPreview);
    document.body.appendChild(imageDialog);

    function openImagePreview(image) {
        imageDialogPreview.src = image.currentSrc || image.src;
        imageDialogPreview.alt = image.alt;
        imageDialog.showModal();
        imageDialogClose.focus();
    }

    zoomableImages.forEach(function (image) {
        image.tabIndex = 0;
        image.setAttribute("role", "button");
        image.setAttribute("aria-haspopup", "dialog");
        image.setAttribute("aria-label", "Enlarge image: " + image.alt);

        image.addEventListener("click", function () {
            openImagePreview(image);
        });

        image.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openImagePreview(image);
            }
        });
    });

    imageDialogClose.addEventListener("click", function () {
        imageDialog.close();
    });

    imageDialog.addEventListener("click", function (event) {
        if (event.target === imageDialog) {
            imageDialog.close();
        }
    });

    imageDialog.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            event.preventDefault();
            imageDialog.close();
        }
    });

    const productSearchForm = document.getElementById("productSearchForm");
    if (productSearchForm) {
        const searchInput = document.getElementById("productSearchInput");
        const searchStatus = document.getElementById("productSearchStatus");
        const productItems = document.querySelectorAll("[data-product-item]");

        function filterProducts(searchTerm) {
            const query = searchTerm.trim().toLowerCase();
            let visibleCount = 0;

            productItems.forEach(function (item) {
                const matches = !query || item.textContent.toLowerCase().includes(query);
                item.hidden = !matches;
                if (matches) {
                    visibleCount += 1;
                }
            });

            searchStatus.textContent = visibleCount
                ? "Showing " + visibleCount + (visibleCount === 1 ? " product." : " products.")
                : "No products found for \"" + searchTerm.trim() + "\".";
        }

        const initialSearch = new URLSearchParams(window.location.search).get("search") || "";
        searchInput.value = initialSearch;
        filterProducts(initialSearch);

        productSearchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            filterProducts(searchInput.value);
        });
    }

    const forms = document.querySelectorAll("form:not(#productSearchForm):not(#homeProductSearchForm)");

    function getEnquiryData(form) {
        const nameField = form.querySelector("#contactName, #name, [name='name']");
        const emailField = form.querySelector("#contactEmail, #email, [name='email']");
        const phoneField = form.querySelector("#phone");
        const messageField = form.querySelector("#contactMessage, #message, [name='message']");
        const productField = form.querySelector("#product");
        const typeField = form.querySelector("#messageType");
        const name = nameField ? nameField.value.trim() : "";
        const message = messageField ? messageField.value.trim() : "";

        if (name.length < 2) {
            return { error: "Please enter your full name." };
        }

        if (message.length < 10 || message.length > 1000) {
            return { error: "Your message must contain between 10 and 1000 characters." };
        }

        return {
            name: name,
            email: emailField ? emailField.value.trim() : "",
            phone: phoneField ? phoneField.value.trim() : "",
            message: message,
            product: productField ? productField.options[productField.selectedIndex].text : "",
            type: typeField ? typeField.value : "General enquiry"
        };
    }

    function getResponse(form) {
        return form.querySelector(".form-response") ||
            document.getElementById("contactResponse") ||
            document.getElementById("enquiryResponse");
    }

    forms.forEach(function (form) {
        const response = getResponse(form);

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const enquiry = getEnquiryData(form);
            if (enquiry.error) {
                if (response) {
                    response.textContent = enquiry.error;
                }
                return;
            }

            const recipient = "hello@mtviapparel.co.za";
            let subject = "MTVI Website - " + enquiry.type;
            let body = "Name: " + enquiry.name + "\nEmail: " + enquiry.email + "\n";

            if (enquiry.phone) {
                body += "Phone: " + enquiry.phone + "\n";
            }

            if (enquiry.product) {
                body += "Product: " + enquiry.product + "\n";
            }

            body += "Message Type: " + enquiry.type + "\n\nMessage:\n" + enquiry.message;

            if (form.id === "enquiryForm") {
                subject = "MTVI Enquiry - " + (enquiry.product || "General Product");
                body = "Name: " + enquiry.name + "\nEmail: " + enquiry.email + "\n";
                if (enquiry.phone) {
                    body += "Phone: " + enquiry.phone + "\n";
                }
                body += "Product: " + (enquiry.product || "Not specified") + "\n\nMessage:\n" + enquiry.message;
            }

            if (response) {
                response.textContent = "Your message has been prepared. Please send it using your email application.";
            }

            const mailtoLink = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
            window.location.href = mailtoLink;
        });

        const whatsappButton = form.querySelector("[data-whatsapp-enquiry]");
        if (whatsappButton) {
            whatsappButton.addEventListener("click", function () {
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const enquiry = getEnquiryData(form);
                if (enquiry.error) {
                    if (response) {
                        response.textContent = enquiry.error;
                    }
                    return;
                }

                const isContactForm = form.id === "contactForm";
                const lines = [
                    isContactForm
                        ? "Hello MTVI Apparel, I have a message."
                        : "Hello MTVI Apparel, I have a product enquiry.",
                    "",
                    "Name: " + enquiry.name,
                    "Email: " + enquiry.email
                ];
                if (enquiry.phone) {
                    lines.push("Phone: " + enquiry.phone);
                }
                if (isContactForm) {
                    lines.push("Message Type: " + enquiry.type);
                } else {
                    lines.push("Product: " + (enquiry.product || "Not specified"));
                }
                lines.push("", (isContactForm ? "Message: " : "Enquiry: ") + enquiry.message);

                const whatsappUrl = "https://wa.me/27827441937?text=" + encodeURIComponent(lines.join("\n"));
                window.open(whatsappUrl, "_blank", "noopener,noreferrer");
                if (response) {
                    response.textContent = "WhatsApp opened with your enquiry. Review it there and tap Send.";
                }
            });
        }
    });
});