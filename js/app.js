const requestModal = document.querySelector(".new-request");
const requestLink = document.querySelector(".add-request");
const modal = document.querySelector(".new-request .modal");
const requestForm = document.querySelector(".new-request form");

function closeModal() {
  modal.classList.remove("open-modal");
  setTimeout(() => {
    requestModal.classList.remove("open");
  }, 400);
}

//Open request modal
requestLink.addEventListener("click", () => {
  requestModal.classList.add("open");
  modal.classList.add("open-modal");
});

//Close request modal
requestModal.addEventListener("click", () => {
  closeModal();
});

modal.addEventListener("click", (e) => {
  e.stopPropagation();
});

//Add a new request
requestForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const addRequest = functions.httpsCallable("addRequest");
  addRequest({
    text: requestForm.request.value,
  })
    .then(() => {
      closeModal();
      requestForm.reset();
      requestForm.querySelector(".error").textContent = "";
    })
    .catch((err) => {
      const errorMessage = requestForm.querySelector(".error");
      if (err.message == "INTERNAL") {
        closeModal();
        requestForm.reset();
        errorMessage.textContent = "";
      } else {
        errorMessage.textContent = err.message;
      }
    });
});

//Notification
const notification = document.querySelector(".notification");
const showNotification = (message) => {
  notification.textContent = message;
  notification.classList.add("active");
  setTimeout(() => {
    notification.classList.remove("active");
    notification.textContent = "";
  }, 4000);
};
