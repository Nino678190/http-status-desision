function addToFavorites(status){
    let favorites = localStorage.getItem("fav");
    if (favorites === null || favorites === undefined){
        localStorage.setItem("fav", "[${status}]");
        return;
    }
    if (favorites.includes(status){
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