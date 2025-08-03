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

async function loadStatus() {
    const statusContainer = document.querySelector('.library');
    const deprecatedNote = '<span class="deprecated"> (Deprecated)</span>';
    const deprecatedMessage = '<span class="deprecated"><b>Disclamer: </b></span>This status code is deprecated and should only be used for compatibility purposes.';
    await fetch('codes.json')
        .then(response => response.json())
        .then(data => {
            const addedHeadings = new Set();
            data.forEach(status => {
                const category = Math.floor(status.code / 100) * 100; // Determine category (e.g., 100, 200, etc.)
                if (!addedHeadings.has(category)) {
                    const heading = document.createElement('h2');
                    if (category === 100) heading.textContent = '1xx Status Codes - Informational';
                    if (category === 200) heading.textContent = '2xx Status Codes - Successful';
                    if (category === 300) heading.textContent = '3xx Status Codes - Redirect';
                    if (category === 400) heading.textContent = '4xx Status Codes - Client Error';
                    if (category === 500) heading.textContent = '5xx Status Codes - Server Error';
                    statusContainer.appendChild(heading);
                    addedHeadings.add(category);
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
                                    <!-- <img src="images/star-empty-icon.png" alt="Favorites Icon" class="lib-icon"> -->
                                    <span class="star">&#9734;</span>
                                </button>
                            </section>
                        </summary>
                        <p>${status.description}</p>
                    `;

                if (status.requestExample && status.responseExample) {
                    const requestHeaders = Object.entries(status.requestExample.headers)
                        .map(([key, value]) => `<span class="tag">${key}</span>: <span class="value">${value}</span>`)
                        .join('<br>');
                    const responseHeaders = Object.entries(status.responseExample.headers)
                        .map(([key, value]) => `<span class="header">${key}: ${value}</span>`)
                        .join('<br>');
                    const body = status.requestExample.body ? `<span class="body">${status.requestExample.body}</span>` : '';
                    if (status.name.includes('deprecated')) {
                        status.name = status.name.replace('<span class="deprecated"> (Deprecated)</span>', '').trim();
                    }
                    statusElement.innerHTML += `
                        <section class="exampleLib">
                            <h3>Request Example:</h3>
                            <code>
                                <span class="protocol">${status.requestExample.method}</span> <span class="url">${status.requestExample.url}</span> <span class="protocol">HTTP/1.1</span><br>
                                <span class="tag">Host</span>: <span class="value">example.com</span><br>
                                ${requestHeaders ? `<br>${requestHeaders}`: ''}
                                ${body ? `<br>${body}` : ''}
                            </code>
                            <h3>Response Example:</h3>
                            <code>
                                <span class="protocol">HTTP/1.1</span> <span class="status">${status.code}</span> <span class="statusName">${status.name}</span>
                                ${responseHeaders ? `<br>${responseHeaders}` : ''}
                                ${status.responseExample.body ? `<br><span class="body">${status.responseExample.body}</span>` : ''}
                            </code>
                        </section>
                    `
                }
                statusContainer.appendChild(statusElement);
            });
        })
        .catch(error => console.error('Error loading status codes:', error));
        const note = document.createElement('p');
        note.className = 'passiv';
        note.innerHTML = `Some of the information comes from <a href="http://" target="_blank" rel="noopener noreferrer">MDN Docs</a>. All Status Code are explained simple. I can't guarante, that everything is correct.`;
        statusContainer.appendChild(note);
} 

// &#9733; Filled star icon
// &#9734; Empty star icon