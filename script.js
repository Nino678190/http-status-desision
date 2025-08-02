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