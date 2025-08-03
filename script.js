function addToFavorites(status){
    let favorites = localStorage.getItem("fav");
    if (favorites === null || favorites === undefined){
        localStorage.setItem("fav", "[${status}]");
        return;
    }
    if (favorites.includes(status)){
        favorites.remove(status);
        localStorage.setItem("fav", favorites);
        return;
    }
    favorites.append(status);
    localStorage.setItem("fav", favorites);
}

function createToast(message, type = "info") {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    if (type === "fail") {
        toast.classList.add("error");
    } else if (type === "success") {
        toast.classList.add("success");
    } else if (type === "warning") {
        toast.classList.add("warning");
    } else if (type === "info") {
        toast.classList.add("info");
    }
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        if (typeof toast.remove === 'function') {
            toast.remove();
        } else if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

function loadStatus() {
    const deprecatedNote = '<span class="deprecated"> (Deprecated)</span>';
    const deprecatedMessage = '<span class="deprecated"><b>Disclamer: </b></span>This status code is deprecated and should only be used for compatibility purposes.';
    fetch('codes.json')
        .then(response => response.json())
        .then(data => {
            const statusContainer = document.querySelector('.library');
            data.forEach(status => {
                if (status.code === '100') {
                    const heading = document.createElement('h2');
                    heading.textContent = '1xx Status Codes - Informational';
                    statusContainer.appendChild(heading);
                }
                if (status.code === '200') {
                    const heading = document.createElement('h2');
                    heading.textContent = '2xx Status Codes - Successful';
                    statusContainer.appendChild(heading);
                }
                if (status.code === '300') {
                    const heading = document.createElement('h2');
                    heading.textContent = '3xx Status Codes - Redirect';
                    statusContainer.appendChild(heading);
                }
                if (status.code === '400') {
                    const heading = document.createElement('h2');
                    heading.textContent = '4xx Status Codes - Client Error';
                    statusContainer.appendChild(heading);
                }
                if (status.code === '500') {
                    const heading = document.createElement('h2');
                    heading.textContent = '5xx Status Codes - Server Error';
                    statusContainer.appendChild(heading);
                }
                if (status.deprecated) {
                    status.name += ` ${deprecatedNote}`;
                    status.description = `${deprecatedMessage} <br> ${status.description}`;
                }

                const statusElement = document.createElement('details');
                statusElement.innerHTML = `
                        <summary>
                            <section class="${status.deprecated ? 'double' : ''}"> ${status.code} - ${status.name}</section>
                            <section>
                                <button class="favorites-button" onclick="addToFavorites('${status.code}')">
                                    <img src="images/star-empty-icon.png" alt="Favorites Icon" class="lib-icon">
                                </button>
                            </section>
                        </summary>
                        <p>${status.description}</p>
                    `;
                statusContainer.appendChild(statusElement);
            });
        })
        .catch(error => console.error('Error loading status codes:', error));
} 