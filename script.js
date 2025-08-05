function addToFavorites(status){
    let favorites = localStorage.getItem("fav");
    let favoritesArray = favorites ? JSON.parse(favorites) : [];
    
    if (favoritesArray.includes(status)) {
        favoritesArray = favoritesArray.filter(item => item !== status);
        createToast(`Status Code ${status} removed from favorites.`, "info");
        const filled = document.querySelectorAll(`.star.filled`);
        filled.forEach(star => {
            if (star.getAttribute('value') === status) {
                star.classList.remove('filled');
                star.classList.add('empty');
                star.innerHTML = '&#9734;';
            }
        });
    } else {
        favoritesArray.push(status);
        createToast(`Status Code ${status} added to favorites.`, "success");
        const empty = document.querySelectorAll(`.star.empty`);
        empty.forEach(star => {
            if (star.getAttribute('value') === status) {
                star.classList.remove('empty');
                star.classList.add('filled');
                star.innerHTML = '&#9733;';
            }
        });
    }
    
    localStorage.setItem("fav", JSON.stringify(favoritesArray));
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
    toast.addEventListener('click', () => {
        if (typeof toast.remove === 'function') {
            toast.remove();
        } else if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
    setTimeout(() => {
        if (typeof toast.remove === 'function') {
            toast.remove();
        } else if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

async function loadStatus(isFav = false) {
    const statusContainer = document.querySelector('.library');
    if (!statusContainer) {
        console.error('Status container not found.');
        return;
    }
    const deprecatedNote = '<span class="deprecated"> (Deprecated)</span>';
    const deprecatedMessage = '<span class="deprecated"><b>Disclamer: </b></span>This status code is deprecated and should only be used for compatibility purposes.';
    await fetch('/codes.json')
        .then(response => response.json())
        .then(data => {
            if (isFav) {
                const favorites = localStorage.getItem("fav");
                if (favorites && favorites.length > 0 && favorites !== '[]') {
                    const favoritesArray = JSON.parse(favorites);
                    data = data.filter(status => favoritesArray.includes(status.code.toString()));
                } else {
                    createToast("You have no favorites yet.", "info");
                    return;
                }
            }
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

                const favorites = localStorage.getItem("fav");
                let isFavorite = false;
                if (favorites) {
                    const favoritesArray = JSON.parse(favorites);
                    isFavorite = favoritesArray.includes(status.code.toString());
                }
                let starClass = isFavorite ? 'star filled' : 'star empty';
                let starIcon = isFavorite ? '&#9733;' : '&#9734;';
                
                const statusElement = document.createElement('details');
                statusElement.id = status.code; 
                statusElement.innerHTML = `
                        <summary>
                            <section class="${status.deprecated ? 'double' : ''}"> ${status.code} - ${status.name}</section>
                            <section>
                                <button class="favorites-button" onclick="addToFavorites('${status.code}')">
                                    <span class="${starClass}" value="${status.code}">${starIcon}</span>
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
} 

async function loadQuestions(questionId) {
    try {
        const questItem = localStorage.getItem('quest');
        if (!questItem || questItem === '[]') {
            const response = await fetch('/questions.json'); // Ensure the correct relative path
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const questData = await response.json();
            localStorage.setItem('quest', JSON.stringify(questData));
        }
    } catch (error) {
        createToast('Failed to load questions.json', 'fail');
        console.error('Error loading questions.json:', error);
        return;
    }
    if (localStorage.getItem('quest') === null) {
        createToast('Failed to load questions.json', 'fail');
        return;
    }
    const questDataRaw = localStorage.getItem('quest');
    if (!questDataRaw) {
        createToast('Questions data is missing or invalid.', 'fail');
        return;
    }
    let questData;
    try {
        questData = JSON.parse(questDataRaw);
        questData = questData[questionId - 1];
    } catch (error) {
        createToast('Failed to parse questions data.', 'fail');
        console.error('Error parsing questions data:', error);
        return;
    }
    if (document.querySelector('.question-container')) {
        document.querySelector('.question-container').remove();
    }
    const container = document.createElement('section');
    container.classList.add('question-container');
    let onclickYes = "";
    let onclickNo = "";
    if (questData.answers[0].nextQuestionId === null){
        onclickYes = `displayResult(${questData.answers[0].statusCodes})`;
    } else {
        onclickYes = `loadQuestions(${questData.answers[0].nextQuestionId}); whichCodes(${questData.answers[0].statusCodes})`;
    }
    if (questData.answers[1].nextQuestionId === null){
        onclickNo = `displayResult(${questData.answers[1].statusCodes})`;
    } else {
        onclickNo = `loadQuestions(${questData.answers[1].nextQuestionId}); whichCodes(${questData.answers[1].statusCodes})`;
    }
    container.innerHTML = `
            <h2 id="question">${questData.question}</h2>
            <section class="question-description">
                <h4>Examples</h4>
                <ul>
                    <li class="example">${questData.examples[0]}</li><br>
                    <li class="example">${questData.examples[1]}</li><br>
                    <li class="example">${questData.examples[2]}</li><br>
                </ul>
            </section>
            <nav>
                <button class="answer green" onclick="${onclickYes}">Yes</button>
                <button class="answer red" onclick="${onclickNo}">No</button>
            </nav>
        `;
    document.querySelector('main').appendChild(container);
}

async function displayResult(code1){
    const doc = document.querySelector('main');
    if (doc.querySelector('.question-container')) {
        doc.querySelector('.question-container').remove();
    }
    const codes = await fetch('/codes.json').then(response => {
        if (!response.ok) {
            createToast('Failed to load status codes.', 'fail');
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    }).catch(error => {
        createToast('Error fetching status codes: ' + error.message, 'fail');
        return null;
    });
    console.log(codes);
    let description = '';
    if (codes !== null) {
        const codesArray = JSON.parse(codes);
        console.log(codesArray);

        const codeObject = codesArray.find(item => item.code === Number(code1));
        console.log(codeObject);
        if (!codeObject) {
            createToast(`Status code ${code1} is not available for this path.`, 'fail');
            return;
        }
        if (codeObject) {
            description = codeObject.description;
        } else {
            createToast(`Description for status code ${code1} not found.`, 'fail');
            return;
        }
    } else {
        createToast('No status codes available for this path.', 'fail');
        return;
    }
    const container = document.querySelector('.index');
    container.classList.add('result-container');
    container.innerHTML = `
        <h1>Result</h1>
        <h2>${code1}</h2>
        <p class="description">${description}</p>
        <section class="result-buttons">
            <button class="library-button" onclick="window.location.href='library.html#${code1}'">View in Library</button>
            <button class="back-button" onclick="window.location.reload()">Back to Questions</button>
        </section>
    `;
    doc.appendChild(container);

}

function whichCodes(codes) {
    if (localStorage.getItem('quest') === 0){
        if (localStorage.getItem('codes') !== null) {
            localStorage.removeItem('codes');
        }
    }
    if (codes.length === 0) {
        createToast('No status codes available for this path.', 'info');
        return;
    }
    const codeMapping = {
        1: [100, 101, 102, 103],
        2: [200, 201, 202, 203, 204, 205, 206, 207, 208, 226],
        3: [300, 301, 302, 303, 304, 305, 306, 307, 308],
        4: [400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451],
        5: [500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511]
    };

    let possibleCodes = [];

    codes.forEach(code => {
        if (codeMapping[code]) {
            possibleCodes.push(...codeMapping[code]);
        } else if (code > 99 && code < 600) {
            possibleCodes.push(code);
        }
    });
    localStorage.setItem('codes', JSON.stringify(possibleCodes));
}