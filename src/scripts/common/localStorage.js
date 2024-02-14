export function updateLocalStorage (key, value) {
    window.localStorage.setItem(key, value);
}

export function readOrSetDefaultLocalStorage (key, value) {
    const storedValue = window.localStorage.getItem(key);

    if (!storedValue) {
        updateLocalStorage(key, value);
        return value;
    }

    return storedValue;
}