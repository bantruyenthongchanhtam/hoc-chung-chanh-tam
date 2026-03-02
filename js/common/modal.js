// Modal Functions
function openModal() {
    document.getElementById("formModal").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    document.getElementById("formModal").classList.remove("active");
    document.body.style.overflow = "auto";
}

function submitForm(event) {
    event.preventDefault();

    const message = document.getElementById("messageInput").value.trim();
    if (!message) {
        Toast.error(Constant.MESSAGE.ERROR.MSG_001, Constant.EMPTY);
        return;
    }

    const entryId = Constant.CONFIG.GOOGLE_FORM.ENTRY_ID;
    const formId = Constant.CONFIG.GOOGLE_FORM.FORM_ID;

    const submitUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = submitUrl;
    form.target = "hidden_iframe";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = entryId;
    input.value = message;

    form.appendChild(input);
    document.body.appendChild(form);

    form.submit();
    document.body.removeChild(form);

    // UX
    document.getElementById("confessionForm").reset();
    closeModal();
    Toast.success(Constant.MESSAGE.SUCCESS.MSG_001, Constant.EMPTY);
}